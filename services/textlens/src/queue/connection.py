"""
RabbitMQ connection management with connection pooling and automatic reconnection.
Uses aio-pika for async operations.
"""
import asyncio
import logging
from contextlib import asynccontextmanager
from typing import Optional, AsyncGenerator

import aio_pika
from aio_pika import RobustConnection
from aio_pika.abc import AbstractChannel
from aio_pika.pool import Pool

from src.config.settings import get_settings, RabbitMQSettings

logger = logging.getLogger(__name__)


class RabbitMQConnectionManager:
    """
    Manages RabbitMQ connections with pooling and automatic reconnection.
    Implements singleton pattern for application-wide connection sharing.
    """

    _instance: Optional["RabbitMQConnectionManager"] = None

    def __init__(self, settings: Optional[RabbitMQSettings] = None):
        self.settings = settings or get_settings().rabbitmq
        self._connection_pool: Optional[Pool] = None
        self._channel_pool: Optional[Pool] = None
        self._is_connected = False
        self._lock = asyncio.Lock()

    @classmethod
    def get_instance(
        cls, settings: Optional[RabbitMQSettings] = None
    ) -> "RabbitMQConnectionManager":
        """Get or create singleton instance."""
        if cls._instance is None:
            cls._instance = cls(settings)
        return cls._instance

    @classmethod
    def reset_instance(cls) -> None:
        """Reset the singleton instance (useful for testing)."""
        cls._instance = None

    async def _create_connection(self) -> RobustConnection:
        """Create a new RabbitMQ connection."""
        connection = await aio_pika.connect_robust(
            self.settings.url,
            timeout=self.settings.connection_timeout,
            heartbeat=self.settings.heartbeat,
        )
        logger.info(f"Created new RabbitMQ connection to {self.settings.host}")
        return connection

    async def _create_channel(self) -> AbstractChannel:
        """Create a new channel from the connection pool."""
        async with self._connection_pool.acquire() as connection:
            channel = await connection.channel()
            await channel.set_qos(prefetch_count=self.settings.prefetch_count)
            return channel

    async def connect(self) -> None:
        """Initialize connection and channel pools."""
        async with self._lock:
            if self._is_connected:
                return

            try:
                # Create connection pool
                self._connection_pool = Pool(
                    self._create_connection,
                    max_size=self.settings.pool_size,
                )

                # Create channel pool
                self._channel_pool = Pool(
                    self._create_channel,
                    max_size=self.settings.pool_size * 2,
                )

                self._is_connected = True
                logger.info("RabbitMQ connection pools initialized")

            except Exception as e:
                logger.error(f"Failed to connect to RabbitMQ: {e}")
                raise

    async def disconnect(self) -> None:
        """Close all connections and pools."""
        async with self._lock:
            if not self._is_connected:
                return

            try:
                if self._channel_pool:
                    await self._channel_pool.close()
                if self._connection_pool:
                    await self._connection_pool.close()

                self._is_connected = False
                logger.info("RabbitMQ connections closed")

            except Exception as e:
                logger.error(f"Error closing RabbitMQ connections: {e}")

    @asynccontextmanager
    async def get_channel(self) -> AsyncGenerator[AbstractChannel, None]:
        """
        Get a channel from the pool.
        Usage:
            async with manager.get_channel() as channel:
                await channel.declare_queue(...)
        """
        if not self._is_connected:
            await self.connect()

        async with self._channel_pool.acquire() as channel:
            yield channel

    async def health_check(self) -> bool:
        """Check if RabbitMQ is reachable."""
        try:
            async with self.get_channel() as channel:
                # Simple operation to verify connection
                await channel.declare_queue(
                    "health_check_temp", auto_delete=True, durable=False
                )
                return True
        except Exception as e:
            logger.error(f"RabbitMQ health check failed: {e}")
            return False


# Convenience function for getting the manager
def get_rabbitmq_manager() -> RabbitMQConnectionManager:
    """Get the RabbitMQ connection manager singleton."""
    return RabbitMQConnectionManager.get_instance()
