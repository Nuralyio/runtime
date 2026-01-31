"""Data models for the crawler service."""
from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel


class CrawlRequest(BaseModel):
    """Crawl request from workflow engine."""
    request_id: Optional[str] = None
    urls: List[str]
    max_depth: int = 1
    max_pages: int = 10
    same_domain_only: bool = True
    render_js: bool = False
    include_patterns: Optional[List[str]] = None
    exclude_patterns: Optional[List[str]] = None
    extract_selectors: Optional[Dict[str, str]] = None
    remove_selectors: Optional[List[str]] = None
    workflow_id: Optional[str] = None
    user_id: Optional[str] = None
    isolation_key: Optional[str] = None


class CrawledPage(BaseModel):
    """A single crawled page result."""
    url: str
    title: Optional[str] = None
    content: str = ""
    description: Optional[str] = None
    character_count: int = 0
    crawled_at: str = ""
    links: List[str] = []
    extracted: Optional[Dict[str, str]] = None


class CrawlResult(BaseModel):
    """Result of a crawl operation."""
    pages: List[CrawledPage] = []
    total_pages: int = 0
    total_characters: int = 0
    errors: List[str] = []


class CrawlResponse(BaseModel):
    """Response sent back to workflow engine via RabbitMQ."""
    request_id: Optional[str] = None
    service_type: str = "crawl"
    success: bool = True
    payload: Optional[str] = None  # JSON string of CrawlResult
    error_message: Optional[str] = None
    processed_at: Optional[str] = None
