"""
Task and result models for queue messaging.
These models are serialized to JSON for RabbitMQ transport.
"""
from datetime import datetime
from enum import Enum
from typing import Optional, List, Dict, Any
from uuid import uuid4

from pydantic import BaseModel, Field


class TaskType(str, Enum):
    """Types of OCR tasks."""
    GENERAL_OCR = "ocr"
    INVOICE_OCR = "invoice"


class TaskStatus(str, Enum):
    """Task lifecycle states."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    TIMEOUT = "timeout"
    CANCELLED = "cancelled"


class TaskPriority(int, Enum):
    """Task priority levels (higher = more urgent)."""
    LOW = 1
    NORMAL = 5
    HIGH = 8
    CRITICAL = 10


class TaskPayload(BaseModel):
    """OCR task payload containing image and parameters."""
    image_data: Optional[str] = None  # Base64 encoded
    image_url: Optional[str] = None
    language: str = "fr"
    detect_layout: bool = False
    task_type: TaskType = TaskType.GENERAL_OCR


class TaskMetadata(BaseModel):
    """Request metadata for tracing and debugging."""
    client_ip: Optional[str] = None
    user_agent: Optional[str] = None
    api_version: str = "v1"
    custom: Dict[str, Any] = Field(default_factory=dict)


class OCRTask(BaseModel):
    """
    Complete OCR task message for queue publishing.
    This is what gets serialized and sent to RabbitMQ.
    """
    task_id: str = Field(default_factory=lambda: str(uuid4()))
    correlation_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    priority: TaskPriority = TaskPriority.NORMAL

    payload: TaskPayload
    reply_to: str = "ocr.results"
    metadata: TaskMetadata = Field(default_factory=TaskMetadata)

    # Retry tracking
    attempt: int = 1
    max_attempts: int = 3

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

    def to_json_bytes(self) -> bytes:
        """Serialize task to JSON bytes for RabbitMQ."""
        return self.model_dump_json().encode("utf-8")

    @classmethod
    def from_json_bytes(cls, data: bytes) -> "OCRTask":
        """Deserialize task from JSON bytes."""
        return cls.model_validate_json(data)


class OCRLine(BaseModel):
    """Single line of OCR output."""
    text: str
    confidence: float
    bbox: List[List[float]]


class OCRResultData(BaseModel):
    """OCR processing result data."""
    text: str
    lines: List[OCRLine]
    language: str
    success: bool = True


class TaskResult(BaseModel):
    """
    Task result message for publishing back to the API.
    """
    task_id: str
    correlation_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    status: TaskStatus

    worker_id: str
    processing_time_ms: int

    result: Optional[OCRResultData] = None
    error: Optional[str] = None

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

    def to_json_bytes(self) -> bytes:
        """Serialize result to JSON bytes."""
        return self.model_dump_json().encode("utf-8")

    @classmethod
    def from_json_bytes(cls, data: bytes) -> "TaskResult":
        """Deserialize result from JSON bytes."""
        return cls.model_validate_json(data)


class TaskStatusInfo(BaseModel):
    """
    Task status information stored in Redis.
    Used for polling-based async queries.
    """
    task_id: str
    status: TaskStatus
    created_at: datetime
    updated_at: datetime
    worker_id: Optional[str] = None
    progress: int = 0  # 0-100
    result: Optional[TaskResult] = None
