"""
OCR Worker process that consumes tasks from RabbitMQ and processes them.
Designed to run as a standalone process, separate from the API gateway.
"""
import asyncio
import logging
import signal
import time
from typing import Optional

from aio_pika import Message, DeliveryMode
from aio_pika.abc import AbstractIncomingMessage

from src.config.settings import get_settings, WorkerSettings
from src.models.tasks import OCRTask, TaskResult, TaskStatus, OCRResultData
from src.queue.connection import get_rabbitmq_manager
from src.queue.exchanges import get_topology
from src.storage.result_store import get_result_store
from src.worker.processor import OCRProcessor

logger = logging.getLogger(__name__)


class OCRWorker:
    """
    OCR Worker that processes tasks from the queue.

    Features:
    - Graceful shutdown on SIGTERM/SIGINT
    - Automatic reconnection on connection loss
    - Task timeout handling
    - Result publishing and storage
    - Health heartbeat reporting
    """

    def __init__(self, settings: Optional[WorkerSettings] = None):
        self.settings = settings or get_settings().worker
        self.manager = get_rabbitmq_manager()
        self.topology = get_topology()
        self.result_store = get_result_store()
        self.processor = OCRProcessor(
            languages=self.settings.language_list, use_gpu=self.settings.use_gpu
        )

        self._running = False
        self._current_task: Optional[str] = None
        self._tasks_processed = 0
        self._tasks_failed = 0

    async def start(self) -> None:
        """Start the worker and begin consuming tasks."""
        logger.info(f"Starting OCR Worker: {self.settings.node_id}")

        # Setup signal handlers
        loop = asyncio.get_event_loop()
        for sig in (signal.SIGTERM, signal.SIGINT):
            loop.add_signal_handler(sig, lambda: asyncio.create_task(self.stop()))

        # Connect to RabbitMQ
        await self.manager.connect()

        # Connect to Redis
        await self.result_store.connect()

        # Setup topology
        async with self.manager.get_channel() as channel:
            await self.topology.setup(channel)

        # Pre-load OCR models
        logger.info("Pre-loading OCR models...")
        for lang in self.settings.language_list:
            self.processor.get_ocr(lang)
        logger.info("OCR models loaded")

        self._running = True

        # Start heartbeat task
        heartbeat_task = asyncio.create_task(self._heartbeat_loop())

        # Start consuming
        try:
            await self._consume_loop()
        finally:
            heartbeat_task.cancel()
            try:
                await heartbeat_task
            except asyncio.CancelledError:
                pass
            await self.manager.disconnect()
            await self.result_store.disconnect()

    async def stop(self) -> None:
        """Gracefully stop the worker."""
        logger.info("Stopping OCR Worker...")
        self._running = False

    async def _consume_loop(self) -> None:
        """Main consumption loop with automatic reconnection."""
        while self._running:
            try:
                async with self.manager.get_channel() as channel:
                    # Redeclare topology to get queue references
                    await self.topology.setup(channel)

                    # Get queues to consume from
                    task_queue = self.topology.get_queue("ocr.tasks")
                    priority_queue = self.topology.get_queue("ocr.tasks.priority")

                    # Start consuming from both queues
                    await task_queue.consume(self._process_message)
                    await priority_queue.consume(self._process_message)

                    logger.info("Worker is now consuming tasks")

                    # Keep running until stopped
                    while self._running:
                        await asyncio.sleep(1)

            except Exception as e:
                logger.error(f"Consumer error: {e}")
                if self._running:
                    logger.info("Reconnecting in 5 seconds...")
                    await asyncio.sleep(5)

    async def _process_message(self, message: AbstractIncomingMessage) -> None:
        """Process a single task message."""
        start_time = time.time()
        task: Optional[OCRTask] = None

        async with message.process(requeue=False):
            try:
                # Parse task
                task = OCRTask.from_json_bytes(message.body)
                self._current_task = task.task_id

                logger.info(f"Processing task {task.task_id} (attempt {task.attempt})")

                # Update status to processing
                await self.result_store.update_status(
                    task.task_id, TaskStatus.PROCESSING, worker_id=self.settings.node_id
                )

                # Process OCR with timeout
                try:
                    result_data = await asyncio.wait_for(
                        self._do_ocr(task), timeout=self.settings.task_timeout
                    )
                    status = TaskStatus.COMPLETED
                    error = None

                except asyncio.TimeoutError:
                    logger.error(f"Task {task.task_id} timed out")
                    result_data = None
                    status = TaskStatus.TIMEOUT
                    error = f"Task exceeded timeout of {self.settings.task_timeout}s"

                processing_time = int((time.time() - start_time) * 1000)

                # Create result
                result = TaskResult(
                    task_id=task.task_id,
                    correlation_id=task.correlation_id,
                    status=status,
                    worker_id=self.settings.node_id,
                    processing_time_ms=processing_time,
                    result=result_data,
                    error=error,
                )

                # Store and publish result
                await self._publish_result(result, task.reply_to)

                self._tasks_processed += 1
                logger.info(
                    f"Completed task {task.task_id} in {processing_time}ms "
                    f"(status={status.value})"
                )

            except Exception as e:
                logger.exception(f"Failed to process task: {e}")
                self._tasks_failed += 1

                # Create error result if we have a task
                if task:
                    processing_time = int((time.time() - start_time) * 1000)

                    # Check if we should retry
                    if task.attempt < task.max_attempts:
                        logger.info(
                            f"Task {task.task_id} will be retried "
                            f"(attempt {task.attempt}/{task.max_attempts})"
                        )
                        # Note: Message will go to DLQ, retry logic can re-enqueue

                    result = TaskResult(
                        task_id=task.task_id,
                        correlation_id=task.correlation_id,
                        status=TaskStatus.FAILED,
                        worker_id=self.settings.node_id,
                        processing_time_ms=processing_time,
                        error=str(e),
                    )
                    await self._publish_result(result, task.reply_to)

            finally:
                self._current_task = None

    async def _do_ocr(self, task: OCRTask) -> OCRResultData:
        """Perform the actual OCR processing."""
        # Run OCR in thread pool to not block event loop
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None,
            self.processor.process,
            task.payload.image_data,
            task.payload.image_url,
            task.payload.language,
            task.payload.task_type.value,
        )
        return result

    async def _publish_result(self, result: TaskResult, reply_to: str) -> None:
        """Publish result to reply queue and store in Redis."""
        # Store in Redis for polling
        await self.result_store.store_result(result)

        # Publish to reply queue
        message = Message(
            body=result.to_json_bytes(),
            delivery_mode=DeliveryMode.PERSISTENT,
            correlation_id=result.correlation_id,
            content_type="application/json",
        )

        async with self.manager.get_channel() as channel:
            exchange = self.topology.get_exchange("ocr.exchange")
            await exchange.publish(message, routing_key="results")

    async def _heartbeat_loop(self) -> None:
        """Periodically report worker health."""
        while self._running:
            try:
                await self.result_store.report_worker_health(
                    worker_id=self.settings.node_id,
                    status="healthy",
                    current_task=self._current_task,
                    tasks_processed=self._tasks_processed,
                    tasks_failed=self._tasks_failed,
                )
            except Exception as e:
                logger.error(f"Failed to report health: {e}")

            await asyncio.sleep(self.settings.heartbeat_interval)


async def main():
    """Entry point for running the worker."""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )

    worker = OCRWorker()
    await worker.start()


if __name__ == "__main__":
    asyncio.run(main())
