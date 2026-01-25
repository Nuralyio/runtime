"""
Health check and cluster status endpoints.
"""
from fastapi import APIRouter

from src.queue.connection import get_rabbitmq_manager
from src.storage.result_store import get_result_store

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check():
    """Basic health check endpoint."""
    return {"status": "healthy", "service": "textlens-api"}


@router.get("/health/ready")
async def readiness_check():
    """
    Readiness check - verifies all dependencies are available.
    Used by Kubernetes/Docker for readiness probes.
    """
    checks = {"rabbitmq": False, "redis": False}

    # Check RabbitMQ
    try:
        manager = get_rabbitmq_manager()
        checks["rabbitmq"] = await manager.health_check()
    except Exception:
        pass

    # Check Redis
    try:
        result_store = get_result_store()
        checks["redis"] = await result_store.health_check()
    except Exception:
        pass

    all_healthy = all(checks.values())

    return {
        "status": "ready" if all_healthy else "not_ready",
        "checks": checks,
    }


@router.get("/health/cluster")
async def cluster_status():
    """
    Get cluster health status including all workers.
    """
    result_store = get_result_store()
    cluster_health = await result_store.get_cluster_health()

    return {
        "status": "healthy" if cluster_health["active_workers"] > 0 else "degraded",
        "cluster": cluster_health,
    }
