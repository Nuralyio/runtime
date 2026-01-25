"""
OCR API endpoints with clustering support.
Supports both sync and async processing modes.
"""
import asyncio
import logging
from typing import Optional, Union
from uuid import uuid4

from fastapi import APIRouter, HTTPException, Request, Query

from src.config.settings import get_settings
from src.models.requests import OcrRequest
from src.models.responses import OcrResponse, AsyncOcrResponse, OcrLine
from src.models.tasks import (
    OCRTask,
    TaskPayload,
    TaskMetadata,
    TaskPriority,
    TaskType,
    TaskStatus,
)
from src.queue.producer import get_producer
from src.storage.result_store import get_result_store

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ocr", tags=["OCR"])

settings = get_settings()


@router.post("", response_model=Union[OcrResponse, AsyncOcrResponse])
async def perform_ocr(
    request: OcrRequest,
    http_request: Request,
    async_mode: Optional[bool] = Query(
        default=None, description="Force async mode (returns task_id for polling)"
    ),
    priority: Optional[int] = Query(
        default=None, ge=1, le=10, description="Task priority (1-10, higher = more urgent)"
    ),
):
    """
    Perform OCR on an image.

    **Sync Mode** (default): Waits for result and returns OCR data directly.
    **Async Mode**: Returns task_id immediately for polling via /ocr/tasks/{task_id}.

    Use async mode for:
    - Large images that may take longer to process
    - When you want to submit multiple tasks without waiting
    - When timeout issues occur in sync mode
    """
    # Validate input
    if not request.image_base64 and not request.image_url:
        raise HTTPException(
            status_code=400, detail="Either image_base64 or image_url is required"
        )

    # Determine if async mode
    use_async = async_mode if async_mode is not None else settings.api.async_default

    # Create task
    correlation_id = http_request.headers.get("X-Correlation-ID", str(uuid4()))
    task_priority = TaskPriority(priority) if priority else TaskPriority.NORMAL

    task = OCRTask(
        correlation_id=correlation_id,
        priority=task_priority,
        payload=TaskPayload(
            image_data=request.image_base64,
            image_url=request.image_url,
            language=request.language,
            detect_layout=request.detect_layout,
            task_type=TaskType.GENERAL_OCR,
        ),
        metadata=TaskMetadata(
            client_ip=http_request.client.host if http_request.client else None,
            user_agent=http_request.headers.get("User-Agent"),
        ),
    )

    # Initialize task status
    result_store = get_result_store()
    await result_store.create_task_status(task.task_id)

    # Publish task
    producer = get_producer()
    await producer.publish_task(task)

    if use_async:
        # Return immediately with task ID
        return AsyncOcrResponse(
            task_id=task.task_id,
            status=TaskStatus.PENDING,
            message="Task submitted successfully. Poll /ocr/tasks/{task_id} for result.",
        )

    # Sync mode: wait for result
    try:
        result = await _wait_for_result(task.task_id, timeout=settings.api.sync_timeout)

        if result.status == TaskStatus.COMPLETED and result.result:
            return OcrResponse(
                text=result.result.text,
                lines=[
                    OcrLine(text=line.text, confidence=line.confidence, bbox=line.bbox)
                    for line in result.result.lines
                ],
                language=result.result.language,
                success=True,
                task_id=task.task_id,
                processing_time_ms=result.processing_time_ms,
            )
        elif result.status == TaskStatus.FAILED:
            raise HTTPException(
                status_code=500, detail=f"OCR processing failed: {result.error}"
            )
        else:
            raise HTTPException(
                status_code=500, detail=f"Unexpected task status: {result.status}"
            )

    except asyncio.TimeoutError:
        # Return async response on timeout
        return AsyncOcrResponse(
            task_id=task.task_id,
            status=TaskStatus.PROCESSING,
            message=f"Task is still processing. Poll /ocr/tasks/{task.task_id} for result.",
        )


@router.post("/invoice")
async def extract_invoice_data(
    request: OcrRequest,
    http_request: Request,
    async_mode: Optional[bool] = Query(default=None),
    priority: Optional[int] = Query(default=None, ge=1, le=10),
):
    """
    Specialized endpoint for invoice OCR.
    Processes invoice images with optimized settings.
    """
    # Validate input
    if not request.image_base64 and not request.image_url:
        raise HTTPException(
            status_code=400, detail="Either image_base64 or image_url is required"
        )

    correlation_id = http_request.headers.get("X-Correlation-ID", str(uuid4()))
    task_priority = TaskPriority(priority) if priority else TaskPriority.NORMAL

    task = OCRTask(
        correlation_id=correlation_id,
        priority=task_priority,
        payload=TaskPayload(
            image_data=request.image_base64,
            image_url=request.image_url,
            language=request.language,
            detect_layout=request.detect_layout,
            task_type=TaskType.INVOICE_OCR,
        ),
        metadata=TaskMetadata(
            client_ip=http_request.client.host if http_request.client else None,
            user_agent=http_request.headers.get("User-Agent"),
        ),
    )

    result_store = get_result_store()
    await result_store.create_task_status(task.task_id)

    producer = get_producer()
    await producer.publish_task(task)

    use_async = async_mode if async_mode is not None else settings.api.async_default

    if use_async:
        return AsyncOcrResponse(
            task_id=task.task_id,
            status=TaskStatus.PENDING,
            message="Invoice processing task submitted.",
        )

    # Wait for result
    try:
        result = await _wait_for_result(task.task_id, timeout=settings.api.sync_timeout)

        if result.status == TaskStatus.COMPLETED and result.result:
            return {
                "task_id": task.task_id,
                "ocr_result": result.result.model_dump(),
                "raw_text": result.result.text,
                "lines": [
                    {"text": line.text, "confidence": line.confidence}
                    for line in result.result.lines
                ],
                "processing_time_ms": result.processing_time_ms,
            }
        else:
            raise HTTPException(status_code=500, detail=result.error or "Processing failed")

    except asyncio.TimeoutError:
        return AsyncOcrResponse(
            task_id=task.task_id,
            status=TaskStatus.PROCESSING,
            message="Task is still processing.",
        )


async def _wait_for_result(task_id: str, timeout: int):
    """Poll for task result with timeout."""
    result_store = get_result_store()
    start_time = asyncio.get_event_loop().time()

    while True:
        result = await result_store.get_result(task_id)
        if result:
            return result

        elapsed = asyncio.get_event_loop().time() - start_time
        if elapsed >= timeout:
            raise asyncio.TimeoutError(
                f"Task {task_id} did not complete within {timeout}s"
            )

        await asyncio.sleep(0.5)  # Poll interval
