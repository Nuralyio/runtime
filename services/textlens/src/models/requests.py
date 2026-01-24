"""Request models for the OCR API."""
from typing import Optional
from pydantic import BaseModel


class OcrRequest(BaseModel):
    """OCR processing request."""
    image_base64: Optional[str] = None
    image_url: Optional[str] = None
    language: str = "fr"
    detect_layout: bool = False
