"""
OCR processing logic extracted from the original main.py.
Handles image loading and PaddleOCR execution.
"""
import base64
import io
import logging
from typing import Optional, Dict, List
from urllib.request import urlopen

import numpy as np
from PIL import Image

from src.models.tasks import OCRResultData, OCRLine

logger = logging.getLogger(__name__)

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


class OCRProcessor:
    """
    Handles OCR processing using PaddleOCR.
    Maintains a cache of OCR instances per language.
    """

    def __init__(self, languages: Optional[List[str]] = None, use_gpu: bool = False):
        self.use_gpu = use_gpu
        self.languages = languages or ["fr", "en"]
        self._ocr_instances: Dict[str, any] = {}

    def get_ocr(self, language: str = "fr"):
        """Get or create PaddleOCR instance for the specified language."""
        from paddleocr import PaddleOCR

        lang = LANGUAGE_MAP.get(language, language)

        if lang not in self._ocr_instances:
            logger.info(f"Initializing PaddleOCR for language: {lang}")
            self._ocr_instances[lang] = PaddleOCR(
                use_angle_cls=True, lang=lang, use_gpu=self.use_gpu, show_log=False
            )

        return self._ocr_instances[lang]

    def load_image(
        self, image_base64: Optional[str] = None, image_url: Optional[str] = None
    ) -> np.ndarray:
        """Load image from base64 or URL and convert to numpy array."""
        if image_base64:
            # Clean base64 string - remove any whitespace/newlines and data URL prefix
            clean_base64 = image_base64.strip()
            if ',' in clean_base64:
                clean_base64 = clean_base64.split(',')[1]
            # Remove any whitespace that might have been introduced
            clean_base64 = clean_base64.replace(' ', '').replace('\n', '').replace('\r', '')

            logger.info(f"Base64 length: {len(clean_base64)}, first 50 chars: {clean_base64[:50] if len(clean_base64) > 50 else clean_base64}")

            try:
                image_data = base64.b64decode(clean_base64)
                logger.info(f"Decoded image data length: {len(image_data)} bytes")
            except Exception as e:
                logger.error(f"Base64 decode error: {e}")
                raise ValueError(f"Invalid base64 data: {e}")

            try:
                image = Image.open(io.BytesIO(image_data))
            except Exception as e:
                logger.error(f"PIL Image.open error: {e}, data starts with: {image_data[:20] if len(image_data) > 20 else image_data}")
                raise
        elif image_url:
            with urlopen(image_url) as response:
                image_data = response.read()
            image = Image.open(io.BytesIO(image_data))
        else:
            raise ValueError("Either image_base64 or image_url is required")

        # Convert to RGB if necessary
        if image.mode != "RGB":
            image = image.convert("RGB")

        return np.array(image)

    def process(
        self,
        image_base64: Optional[str] = None,
        image_url: Optional[str] = None,
        language: str = "fr",
        task_type: str = "ocr",
    ) -> OCRResultData:
        """
        Process an image and extract text using OCR.

        Args:
            image_base64: Base64 encoded image data
            image_url: URL to fetch image from
            language: OCR language code
            task_type: Type of processing ("ocr" or "invoice")

        Returns:
            OCRResultData containing extracted text and line details
        """
        # Load image
        img_array = self.load_image(image_base64, image_url)

        # Get OCR instance
        ocr = self.get_ocr(language)

        # Perform OCR
        result = ocr.ocr(img_array, cls=True)

        # Parse results
        lines = []
        full_text_parts = []

        if result and result[0]:
            for line in result[0]:
                bbox = line[0]
                text = line[1][0]
                confidence = float(line[1][1])

                lines.append(OCRLine(text=text, confidence=confidence, bbox=bbox))
                full_text_parts.append(text)

        full_text = "\n".join(full_text_parts)

        logger.info(f"OCR completed: {len(lines)} lines extracted")

        return OCRResultData(text=full_text, lines=lines, language=language, success=True)
