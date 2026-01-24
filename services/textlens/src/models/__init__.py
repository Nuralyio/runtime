"""Data models for TextLens."""
from src.models.requests import OcrRequest
from src.models.responses import OcrResponse, AsyncOcrResponse
from src.models.tasks import OCRTask, TaskResult, TaskStatus, TaskPriority

__all__ = [
    "OcrRequest",
    "OcrResponse",
    "AsyncOcrResponse",
    "OCRTask",
    "TaskResult",
    "TaskStatus",
    "TaskPriority",
]
