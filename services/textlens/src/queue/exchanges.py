"""
RabbitMQ exchange and queue topology setup.
Defines all exchanges, queues, and bindings for the OCR cluster.
"""
import logging
from typing import Dict, Any

from aio_pika import ExchangeType
from aio_pika.abc import AbstractChannel, AbstractExchange, AbstractQueue

logger = logging.getLogger(__name__)


# Exchange definitions
EXCHANGE_DEFINITIONS: Dict[str, Dict[str, Any]] = {
    "ocr.exchange": {
        "type": ExchangeType.DIRECT,
        "durable": True,
        "auto_delete": False,
    },
    "ocr.dlx": {
        "type": ExchangeType.DIRECT,
        "durable": True,
        "auto_delete": False,
    },
}

# Queue definitions with their bindings
QUEUE_DEFINITIONS: Dict[str, Dict[str, Any]] = {
    "ocr.tasks": {
        "durable": True,
        "auto_delete": False,
        "arguments": {
            "x-dead-letter-exchange": "ocr.dlx",
            "x-dead-letter-routing-key": "dlq",
            "x-message-ttl": 300000,  # 5 minutes
            "x-max-priority": 10,
        },
        "binding": {
            "exchange": "ocr.exchange",
            "routing_key": "tasks",
        },
    },
    "ocr.tasks.priority": {
        "durable": True,
        "auto_delete": False,
        "arguments": {
            "x-dead-letter-exchange": "ocr.dlx",
            "x-dead-letter-routing-key": "dlq",
            "x-message-ttl": 120000,  # 2 minutes
            "x-max-priority": 10,
        },
        "binding": {
            "exchange": "ocr.exchange",
            "routing_key": "tasks.priority",
        },
    },
    "ocr.results": {
        "durable": True,
        "auto_delete": False,
        "arguments": {
            "x-message-ttl": 600000,  # 10 minutes
        },
        "binding": {
            "exchange": "ocr.exchange",
            "routing_key": "results",
        },
    },
    "ocr.dlq": {
        "durable": True,
        "auto_delete": False,
        "arguments": {
            "x-message-ttl": 86400000,  # 24 hours
        },
        "binding": {
            "exchange": "ocr.dlx",
            "routing_key": "dlq",
        },
    },
}


class QueueTopology:
    """
    Manages the creation and setup of RabbitMQ topology.
    Call setup() on application startup to ensure all resources exist.
    """

    _instance: "QueueTopology" = None

    def __init__(self):
        self._exchanges: Dict[str, AbstractExchange] = {}
        self._queues: Dict[str, AbstractQueue] = {}
        self._setup_done = False

    @classmethod
    def get_instance(cls) -> "QueueTopology":
        """Get or create singleton instance."""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    async def setup(self, channel: AbstractChannel) -> None:
        """
        Declare all exchanges, queues, and bindings.
        Safe to call multiple times (idempotent).
        """
        if self._setup_done:
            return

        logger.info("Setting up RabbitMQ topology...")

        # Declare exchanges first
        for name, config in EXCHANGE_DEFINITIONS.items():
            exchange = await channel.declare_exchange(
                name=name,
                type=config["type"],
                durable=config["durable"],
                auto_delete=config["auto_delete"],
            )
            self._exchanges[name] = exchange
            logger.debug(f"Declared exchange: {name}")

        # Declare queues and bind to exchanges
        for name, config in QUEUE_DEFINITIONS.items():
            queue = await channel.declare_queue(
                name=name,
                durable=config["durable"],
                auto_delete=config["auto_delete"],
                arguments=config.get("arguments"),
            )
            self._queues[name] = queue

            # Bind to exchange if specified
            if "binding" in config:
                binding = config["binding"]
                exchange = self._exchanges[binding["exchange"]]
                await queue.bind(exchange, routing_key=binding["routing_key"])
                logger.debug(
                    f"Bound queue {name} to {binding['exchange']} "
                    f"with key {binding['routing_key']}"
                )

        self._setup_done = True
        logger.info("RabbitMQ topology setup complete")

    def get_exchange(self, name: str) -> AbstractExchange:
        """Get a declared exchange by name."""
        return self._exchanges[name]

    def get_queue(self, name: str) -> AbstractQueue:
        """Get a declared queue by name."""
        return self._queues[name]


def get_topology() -> QueueTopology:
    """Get the singleton QueueTopology instance."""
    return QueueTopology.get_instance()
