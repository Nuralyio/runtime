"""
Result storage using Redis for task status tracking and result caching.
Enables async polling for task results.
"""
import json
import logging
from datetime import datetime
from typing import Optional, Dict, Any

import redis.asyncio as redis

from src.config.settings import get_settings, RedisSettings
from src.models.tasks import TaskResult, TaskStatus, TaskStatusInfo

logger = logging.getLogger(__name__)


class ResultStore:
    """
    Manages task results and status in Redis.

    Keys used:
    - task:{task_id}:status - Task status info (JSON)
    - task:{task_id}:result - Task result (JSON)
    - worker:{worker_id}:health - Worker health info (JSON)
    - cluster:workers - Set of active worker IDs
    """

    _instance: Optional["ResultStore"] = None

    def __init__(self, settings: Optional[RedisSettings] = None):
        self.settings = settings or get_settings().redis
        self._client: Optional[redis.Redis] = None

    @classmethod
    def get_instance(cls, settings: Optional[RedisSettings] = None) -> "ResultStore":
        """Get or create singleton instance."""
        if cls._instance is None:
            cls._instance = cls(settings)
        return cls._instance

    @classmethod
    def reset_instance(cls) -> None:
        """Reset the singleton instance (useful for testing)."""
        cls._instance = None

    async def connect(self) -> None:
        """Initialize Redis connection."""
        if self._client is None:
            self._client = redis.from_url(
                self.settings.url, encoding="utf-8", decode_responses=True
            )
            logger.info(f"Connected to Redis at {self.settings.host}")

    async def disconnect(self) -> None:
        """Close Redis connection."""
        if self._client:
            await self._client.close()
            self._client = None

    async def _ensure_connected(self) -> None:
        """Ensure Redis connection is established."""
        if self._client is None:
            await self.connect()

    # Task Status Methods

    async def create_task_status(self, task_id: str) -> None:
        """Create initial task status entry."""
        await self._ensure_connected()

        now = datetime.utcnow()
        status_info = TaskStatusInfo(
            task_id=task_id,
            status=TaskStatus.PENDING,
            created_at=now,
            updated_at=now,
        )

        await self._client.setex(
            f"task:{task_id}:status",
            self.settings.task_status_ttl,
            status_info.model_dump_json(),
        )

    async def update_status(
        self,
        task_id: str,
        status: TaskStatus,
        worker_id: Optional[str] = None,
        progress: int = 0,
    ) -> None:
        """Update task status."""
        await self._ensure_connected()

        # Get existing status
        existing = await self.get_task_status(task_id)
        if existing:
            existing.status = status
            existing.updated_at = datetime.utcnow()
            if worker_id:
                existing.worker_id = worker_id
            existing.progress = progress

            await self._client.setex(
                f"task:{task_id}:status",
                self.settings.task_status_ttl,
                existing.model_dump_json(),
            )

    async def get_task_status(self, task_id: str) -> Optional[TaskStatusInfo]:
        """Get current task status."""
        await self._ensure_connected()

        data = await self._client.get(f"task:{task_id}:status")
        if data:
            return TaskStatusInfo.model_validate_json(data)
        return None

    # Result Storage Methods

    async def store_result(self, result: TaskResult) -> None:
        """Store task result and update status."""
        await self._ensure_connected()

        # Store result
        await self._client.setex(
            f"task:{result.task_id}:result",
            self.settings.result_ttl,
            result.model_dump_json(),
        )

        # Update status with result
        status_info = await self.get_task_status(result.task_id)
        if status_info:
            status_info.status = result.status
            status_info.updated_at = datetime.utcnow()
            status_info.worker_id = result.worker_id
            status_info.progress = 100 if result.status == TaskStatus.COMPLETED else 0
            status_info.result = result

            await self._client.setex(
                f"task:{result.task_id}:status",
                self.settings.task_status_ttl,
                status_info.model_dump_json(),
            )

    async def get_result(self, task_id: str) -> Optional[TaskResult]:
        """Get task result."""
        await self._ensure_connected()

        data = await self._client.get(f"task:{task_id}:result")
        if data:
            return TaskResult.model_validate_json(data)
        return None

    # Worker Health Methods

    async def report_worker_health(
        self,
        worker_id: str,
        status: str,
        current_task: Optional[str] = None,
        tasks_processed: int = 0,
        tasks_failed: int = 0,
    ) -> None:
        """Report worker health status."""
        await self._ensure_connected()

        health_data = {
            "worker_id": worker_id,
            "status": status,
            "current_task": current_task,
            "tasks_processed": tasks_processed,
            "tasks_failed": tasks_failed,
            "last_heartbeat": datetime.utcnow().isoformat(),
        }

        # Store worker health with TTL (2x heartbeat interval)
        await self._client.setex(
            f"worker:{worker_id}:health",
            60,  # TTL in seconds
            json.dumps(health_data),
        )

        # Add to active workers set
        await self._client.sadd("cluster:workers", worker_id)

    async def get_cluster_health(self) -> Dict[str, Any]:
        """Get health status of all workers in the cluster."""
        await self._ensure_connected()

        # Get all registered workers
        worker_ids = await self._client.smembers("cluster:workers")

        workers = []
        active_count = 0

        for worker_id in worker_ids:
            health_data = await self._client.get(f"worker:{worker_id}:health")
            if health_data:
                worker_info = json.loads(health_data)
                workers.append(worker_info)
                if worker_info["status"] == "healthy":
                    active_count += 1
            else:
                # Worker hasn't reported recently, mark as inactive
                workers.append(
                    {
                        "worker_id": worker_id,
                        "status": "inactive",
                        "last_heartbeat": None,
                    }
                )
                # Remove from active set
                await self._client.srem("cluster:workers", worker_id)

        return {
            "total_workers": len(workers),
            "active_workers": active_count,
            "workers": workers,
        }

    async def health_check(self) -> bool:
        """Check if Redis is reachable."""
        try:
            await self._ensure_connected()
            await self._client.ping()
            return True
        except Exception as e:
            logger.error(f"Redis health check failed: {e}")
            return False


def get_result_store() -> ResultStore:
    """Get the singleton ResultStore instance."""
    return ResultStore.get_instance()
