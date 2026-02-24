"""
PaddleOCR Microservice - OCR service for invoice and document processing
Supports multiple languages including French, English, Arabic, Chinese, etc.
"""

import base64
import io
import os
import logging
from typing import Optional, List
from urllib.request import urlopen

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
import numpy as np

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="PaddleOCR Service",
    description="OCR service for extracting text from images and documents",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Language mapping for PaddleOCR
LANGUAGE_MAP = {
    "fr": "french",
    "en": "en",
    "ar": "ar",
    "ch": "ch",
    "chinese": "ch",
    "german": "german",
    "de": "german",
    "korean": "korean",
    "ko": "korean",
    "japan": "japan",
    "ja": "japan",
    "latin": "latin",
    "cyrillic": "cyrillic",
    "ru": "cyrillic",
}

# Lazy load PaddleOCR to avoid import time issues
_ocr_instances = {}

def get_ocr(language: str = "fr"):
    """Get or create PaddleOCR instance for the specified language."""
    from paddleocr import PaddleOCR

    lang = LANGUAGE_MAP.get(language, language)

    if lang not in _ocr_instances:
        logger.info(f"Initializing PaddleOCR for language: {lang}")
        _ocr_instances[lang] = PaddleOCR(
            use_angle_cls=True,
            lang=lang,
            use_gpu=False,  # Set to True if GPU available
            show_log=False
        )

    return _ocr_instances[lang]


class OcrRequest(BaseModel):
    image_base64: Optional[str] = None
    image_url: Optional[str] = None
    language: str = "fr"
    detect_layout: bool = False


class OcrLine(BaseModel):
    text: str
    confidence: float
    bbox: List[List[float]]


class OcrResponse(BaseModel):
    text: str
    lines: List[OcrLine]
    language: str
    success: bool = True


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "paddleocr"}


@app.post("/ocr", response_model=OcrResponse)
async def perform_ocr(request: OcrRequest):
    """
    Perform OCR on an image.

    Accepts either:
    - image_base64: Base64 encoded image
    - image_url: URL to fetch the image from

    Returns extracted text with confidence scores and bounding boxes.
    """
    try:
        # Load image
        if request.image_base64:
            image_data = base64.b64decode(request.image_base64)
            image = Image.open(io.BytesIO(image_data))
        elif request.image_url:
            with urlopen(request.image_url) as response:
                image_data = response.read()
            image = Image.open(io.BytesIO(image_data))
        else:
            raise HTTPException(
                status_code=400,
                detail="Either image_base64 or image_url is required"
            )

        # Convert to RGB if necessary
        if image.mode != "RGB":
            image = image.convert("RGB")

        # Convert to numpy array
        img_array = np.array(image)

        # Get OCR instance
        ocr = get_ocr(request.language)

        # Perform OCR
        result = ocr.ocr(img_array, cls=True)

        # Parse results
        lines = []
        full_text_parts = []

        if result and result[0]:
            for line in result[0]:
                bbox = line[0]  # [[x1,y1], [x2,y2], [x3,y3], [x4,y4]]
                text = line[1][0]
                confidence = float(line[1][1])

                lines.append(OcrLine(
                    text=text,
                    confidence=confidence,
                    bbox=bbox
                ))
                full_text_parts.append(text)

        full_text = "\n".join(full_text_parts)

        logger.info(f"OCR completed: {len(lines)} lines extracted")

        return OcrResponse(
            text=full_text,
            lines=lines,
            language=request.language,
            success=True
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"OCR failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")


@app.post("/ocr/invoice")
async def extract_invoice_data(request: OcrRequest):
    """
    Specialized endpoint for invoice OCR.
    Attempts to extract common invoice fields like:
    - Invoice number
    - Date
    - Total amount
    - Vendor name
    - Line items
    """
    # First, perform standard OCR
    ocr_result = await perform_ocr(request)

    # Return raw OCR for now - invoice field extraction can be added
    # using regex patterns or a dedicated invoice parsing model
    return {
        "ocr_result": ocr_result,
        "raw_text": ocr_result.text,
        "lines": [{"text": line.text, "confidence": line.confidence} for line in ocr_result.lines]
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
