FROM python:3.11-slim AS base

WORKDIR /app

# Install system dependencies for PaddleOCR
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY src/ ./src/
COPY main.py .


# API Gateway image
FROM base AS api

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["python", "-m", "uvicorn", "src.api.app:app", "--host", "0.0.0.0", "--port", "8000"]


# Worker image (includes pre-downloaded OCR models)
FROM base AS worker

# Pre-download PaddleOCR models for French and English
RUN python -c "from paddleocr import PaddleOCR; PaddleOCR(use_angle_cls=True, lang='french', use_gpu=False)"
RUN python -c "from paddleocr import PaddleOCR; PaddleOCR(use_angle_cls=True, lang='en', use_gpu=False)"

CMD ["python", "-m", "src.worker.ocr_worker"]
