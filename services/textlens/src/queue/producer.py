"""
Task producer for publishing OCR tasks to RabbitMQ.
Used by the API gateway to submit work to the cluster.
"""
import logging
from typing import Optional, List

from aio_pika import Message, DeliveryMode

from src.models.tasks import OCRTask, TaskPriority
from src.queue.connection import get_rabbitmq_manager
from src.queue.exchanges import get_topology

logger = logging.getLogger(__name__)


class TaskProducer:
    """
    Publishes OCR tasks to the appropriate RabbitMQ queue.
    Handles priority routing and message persistence.
    """

    _instance: Optional["TaskProducer"] = None

    def __init__(self):
        self.manager = get_rabbitmq_manager()
        self.topology = get_topology()

    @classmethod
    def get_instance(cls) -> "TaskProducer":
        """Get or create singleton instance."""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    async def publish_task(
        self, task: OCRTask, priority: Optional[TaskPriority] = None
    ) -> str:
        """
        Publish an OCR task to the work queue.

        Args:
            task: The OCR task to publish
            priority: Override task priority (uses task.priority if not specified)

        Returns:
            The task_id of the published task
        """
        effective_priority = priority or task.priority

        # Determine routing key based on priority
        routing_key = (
            "tasks.priority"
            if effective_priority.value >= TaskPriority.HIGH.value
            else "tasks"
        )

        # Create message with proper settings
        message = Message(
            body=task.to_json_bytes(),
            delivery_mode=DeliveryMode.PERSISTENT,
            priority=effective_priority.value,
            correlation_id=task.correlation_id,
            reply_to=task.reply_to,
            message_id=task.task_id,
            content_type="application/json",
        )

        # Publish to exchange
        async with self.manager.get_channel() as channel:
            exchange = self.topology.get_exchange("ocr.exchange")

            await exchange.publish(
                message,
                routing_key=routing_key,
            )

            logger.info(
                f"Published task {task.task_id} to {routing_key} "
                f"(priority={effective_priority.name})"
            )

        return task.task_id

    async def publish_batch(
        self, tasks: List[OCRTask], priority: Optional[TaskPriority] = None
    ) -> List[str]:
        """
        Publish multiple tasks in a batch for efficiency.

        Args:
            tasks: List of OCR tasks to publish
            priority: Optional priority override for all tasks

        Returns:
            List of task_ids
        """
        task_ids = []

        async with self.manager.get_channel() as channel:
            exchange = self.topology.get_exchange("ocr.exchange")

            for task in tasks:
                effective_priority = priority or task.priority
                routing_key = (
                    "tasks.priority"
                    if effective_priority.value >= TaskPriority.HIGH.value
                    else "tasks"
                )

                message = Message(
                    body=task.to_json_bytes(),
                    delivery_mode=DeliveryMode.PERSISTENT,
                    priority=effective_priority.value,
                    correlation_id=task.correlation_id,
                    reply_to=task.reply_to,
                    message_id=task.task_id,
                    content_type="application/json",
                )

                await exchange.publish(message, routing_key=routing_key)
                task_ids.append(task.task_id)

            logger.info(f"Published batch of {len(tasks)} tasks")

        return task_ids


def get_producer() -> TaskProducer:
    """Get the singleton TaskProducer instance."""
    return TaskProducer.get_instance()
