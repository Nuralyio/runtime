"""
Task status and result polling endpoints.
"""
from fastapi import APIRouter, HTTPException

from src.models.tasks import TaskStatus
from src.storage.result_store import get_result_store

router = APIRouter(prefix="/ocr/tasks", tags=["Tasks"])


@router.get("/{task_id}")
async def get_task_status(task_id: str):
    """
    Get the status of an OCR task.

    Returns task status, and result if completed.
    """
    result_store = get_result_store()

    status_info = await result_store.get_task_status(task_id)
    if not status_info:
        raise HTTPException(status_code=404, detail=f"Task {task_id} not found")

    response = {
        "task_id": task_id,
        "status": status_info.status.value,
        "created_at": status_info.created_at.isoformat(),
        "updated_at": status_info.updated_at.isoformat(),
        "worker_id": status_info.worker_id,
        "progress": status_info.progress,
    }

    # Include result if completed
    if status_info.status == TaskStatus.COMPLETED and status_info.result:
        response["result"] = (
            status_info.result.result.model_dump() if status_info.result.result else None
        )
        response["processing_time_ms"] = status_info.result.processing_time_ms
    elif status_info.status == TaskStatus.FAILED and status_info.result:
        response["error"] = status_info.result.error

    return response


@router.delete("/{task_id}")
async def cancel_task(task_id: str):
    """
    Attempt to cancel a pending task.
    Note: Tasks already being processed cannot be cancelled.
    """
    result_store = get_result_store()

    status_info = await result_store.get_task_status(task_id)
    if not status_info:
        raise HTTPException(status_code=404, detail=f"Task {task_id} not found")

    if status_info.status not in [TaskStatus.PENDING]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot cancel task in status: {status_info.status.value}",
        )

    await result_store.update_status(task_id, TaskStatus.CANCELLED)

    return {"task_id": task_id, "status": "cancelled"}
