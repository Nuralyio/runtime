"""Response models for the OCR API."""
from typing import List, Optional
from pydantic import BaseModel

from src.models.tasks import TaskStatus


class OcrLine(BaseModel):
    """Single line of OCR output."""
    text: str
    confidence: float
    bbox: List[List[float]]


class OcrResponse(BaseModel):
    """Standard OCR response with extracted text."""
    text: str
    lines: List[OcrLine]
    language: str
    success: bool = True
    task_id: Optional[str] = None
    processing_time_ms: Optional[int] = None


class AsyncOcrResponse(BaseModel):
    """Response for async OCR requests."""
    task_id: str
    status: TaskStatus
    message: str
