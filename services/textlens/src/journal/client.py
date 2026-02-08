"""
Journal logging client for publishing structured logs to the journal-logs RabbitMQ queue.
Uses the existing RabbitMQConnectionManager for connection pooling.
"""
import json
import logging
from datetime import datetime, timezone
from typing import Optional, Any, Dict

from aio_pika import Message, DeliveryMode

from src.queue.connection import get_rabbitmq_manager

logger = logging.getLogger(__name__)

QUEUE_NAME = "journal-logs"
SERVICE_NAME = "textlens"


class JournalClient:
    """Publishes structured log messages to the journal-logs queue."""

    def __init__(self):
        self._manager = get_rabbitmq_manager()
        self._queue_declared = False

    async def publish(
        self,
        type: str,
        level: str,
        data: Dict[str, Any],
        correlation_id: Optional[str] = None,
    ) -> None:
        """Publish a log message to the journal-logs queue."""
        message_body = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "service": SERVICE_NAME,
            "type": type,
            "level": level,
            "correlationId": correlation_id,
            "data": data,
        }

        try:
            async with self._manager.get_channel() as channel:
                if not self._queue_declared:
                    await channel.declare_queue(QUEUE_NAME, durable=True)
                    self._queue_declared = True

                message = Message(
                    body=json.dumps(message_body).encode(),
                    delivery_mode=DeliveryMode.PERSISTENT,
                    content_type="application/json",
                )

                await channel.default_exchange.publish(
                    message, routing_key=QUEUE_NAME
                )
        except Exception as e:
            logger.warning(f"Failed to publish journal log: {e}")

    async def info(
        self, type: str, data: Dict[str, Any], correlation_id: Optional[str] = None
    ) -> None:
        await self.publish(type, "INFO", data, correlation_id)

    async def warn(
        self, type: str, data: Dict[str, Any], correlation_id: Optional[str] = None
    ) -> None:
        await self.publish(type, "WARN", data, correlation_id)

    async def error(
        self, type: str, data: Dict[str, Any], correlation_id: Optional[str] = None
    ) -> None:
        await self.publish(type, "ERROR", data, correlation_id)

    async def debug(
        self, type: str, data: Dict[str, Any], correlation_id: Optional[str] = None
    ) -> None:
        await self.publish(type, "DEBUG", data, correlation_id)

    async def log_ocr_task(
        self,
        task_id: str,
        status: str,
        duration_ms: Optional[int] = None,
        worker_id: Optional[str] = None,
        error: Optional[str] = None,
        correlation_id: Optional[str] = None,
    ) -> None:
        """Log an OCR task event."""
        level = "ERROR" if status == "failed" else "INFO"
        data: Dict[str, Any] = {
            "taskId": task_id,
            "status": status,
        }
        if duration_ms is not None:
            data["durationMs"] = duration_ms
        if worker_id is not None:
            data["workerId"] = worker_id
        if error is not None:
            data["error"] = error

        await self.publish("ocr", level, data, correlation_id)


_instance: Optional[JournalClient] = None


def get_journal_client() -> JournalClient:
    """Get the singleton JournalClient instance."""
    global _instance
    if _instance is None:
        _instance = JournalClient()
    return _instance
