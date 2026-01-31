"""
Web Crawler - Crawls web pages with SSRF protection.
Supports both static HTML and JS-rendered pages via Playwright.
"""
import asyncio
import logging
import re
from collections import deque
from datetime import datetime
from typing import Dict, List, Optional, Set
from urllib.parse import urljoin, urlparse

import aiohttp
from bs4 import BeautifulSoup

from models import CrawledPage, CrawlRequest, CrawlResult
from security import validate_url

logger = logging.getLogger(__name__)

# Default elements to remove
DEFAULT_REMOVE_SELECTORS = ['nav', 'footer', 'header', 'script', 'style', 'noscript', 'iframe', 'aside']

# Default timeout
DEFAULT_TIMEOUT = 30
DEFAULT_DELAY_MS = 500


class Crawler:
    """Async web crawler with SSRF protection."""

    def __init__(self, browserless_url: Optional[str] = None):
        self.browserless_url = browserless_url
        self.session: Optional[aiohttp.ClientSession] = None
        self.playwright = None
        self.browser = None

    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create HTTP session."""
        if self.session is None or self.session.closed:
            timeout = aiohttp.ClientTimeout(total=DEFAULT_TIMEOUT)
            self.session = aiohttp.ClientSession(
                timeout=timeout,
                headers={
                    'User-Agent': 'NuralyBot/1.0 (+https://nuraly.io)',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                }
            )
        return self.session

    async def _get_browser(self):
        """Get or create Playwright browser (for JS rendering)."""
        if self.browser is None:
            try:
                from playwright.async_api import async_playwright

                self.playwright = await async_playwright().start()

                if self.browserless_url:
                    # Connect to Browserless service
                    self.browser = await self.playwright.chromium.connect_over_cdp(
                        self.browserless_url
                    )
                    logger.info(f"Connected to Browserless at {self.browserless_url}")
                else:
                    # Use local browser
                    self.browser = await self.playwright.chromium.launch(
                        headless=True,
                        args=['--no-sandbox', '--disable-setuid-sandbox']
                    )
                    logger.info("Launched local Chromium browser")

            except Exception as e:
                logger.error(f"Failed to initialize browser: {e}")
                raise

        return self.browser

    async def close(self):
        """Close all connections."""
        if self.session and not self.session.closed:
            await self.session.close()

        if self.browser:
            await self.browser.close()

        if self.playwright:
            await self.playwright.stop()

    async def crawl(self, request: CrawlRequest) -> CrawlResult:
        """
        Crawl URLs based on request parameters.

        Args:
            request: Crawl request with URLs and configuration

        Returns:
            CrawlResult with crawled pages and metadata
        """
        result = CrawlResult()
        visited: Set[str] = set()
        queue: deque = deque()

        # Get allowed domains from start URLs
        allowed_domains: Set[str] = set()
        for url in request.urls:
            try:
                parsed = urlparse(url)
                if parsed.hostname:
                    allowed_domains.add(parsed.hostname.lower())
                queue.append((url, 0))  # (url, depth)
            except Exception as e:
                result.errors.append(f"Invalid URL: {url} - {e}")

        # Compile patterns
        include_patterns = self._compile_patterns(request.include_patterns)
        exclude_patterns = self._compile_patterns(request.exclude_patterns)

        # Get selectors
        remove_selectors = request.remove_selectors or DEFAULT_REMOVE_SELECTORS
        extract_selectors = request.extract_selectors or {}

        while queue and len(result.pages) < request.max_pages:
            url, depth = queue.popleft()

            # Normalize URL
            url = self._normalize_url(url)

            if url in visited:
                continue
            visited.add(url)

            # Check URL patterns
            if not self._should_crawl(url, include_patterns, exclude_patterns):
                continue

            # Check domain
            if request.same_domain_only:
                try:
                    host = urlparse(url).hostname
                    if host and host.lower() not in allowed_domains:
                        continue
                except Exception:
                    continue

            # Validate URL for SSRF
            validation = validate_url(url)
            if not validation.valid:
                result.errors.append(f"{url}: {validation.reason}")
                continue

            # Rate limiting
            if result.pages:
                await asyncio.sleep(DEFAULT_DELAY_MS / 1000)

            # Fetch and parse page
            try:
                if request.render_js:
                    page = await self._fetch_with_browser(url, remove_selectors, extract_selectors)
                else:
                    page = await self._fetch_with_aiohttp(url, remove_selectors, extract_selectors)

                result.pages.append(page)
                result.total_characters += page.character_count

                # Add links to queue if not at max depth
                if depth < request.max_depth:
                    for link in page.links:
                        if link not in visited:
                            queue.append((link, depth + 1))

                logger.debug(f"Crawled: {url} ({page.character_count} chars)")

            except Exception as e:
                error_msg = f"{url}: {str(e)}"
                result.errors.append(error_msg)
                logger.warning(f"Failed to crawl {url}: {e}")

        result.total_pages = len(result.pages)
        return result

    async def _fetch_with_aiohttp(
        self,
        url: str,
        remove_selectors: List[str],
        extract_selectors: Dict[str, str]
    ) -> CrawledPage:
        """Fetch page using aiohttp (static HTML)."""
        session = await self._get_session()

        async with session.get(url, allow_redirects=True) as response:
            response.raise_for_status()
            html = await response.text()

        return self._parse_html(url, html, remove_selectors, extract_selectors)

    async def _fetch_with_browser(
        self,
        url: str,
        remove_selectors: List[str],
        extract_selectors: Dict[str, str]
    ) -> CrawledPage:
        """Fetch page using Playwright (JS rendering)."""
        browser = await self._get_browser()
        context = await browser.new_context()
        page = await context.new_page()

        try:
            await page.goto(url, wait_until='networkidle', timeout=30000)

            # Wait a bit for any lazy-loaded content
            await asyncio.sleep(1)

            html = await page.content()
            return self._parse_html(url, html, remove_selectors, extract_selectors)

        finally:
            await page.close()
            await context.close()

    def _parse_html(
        self,
        url: str,
        html: str,
        remove_selectors: List[str],
        extract_selectors: Dict[str, str]
    ) -> CrawledPage:
        """Parse HTML and extract content."""
        soup = BeautifulSoup(html, 'lxml')

        # Remove unwanted elements
        for selector in remove_selectors:
            for element in soup.select(selector):
                element.decompose()

        page = CrawledPage(
            url=url,
            crawled_at=datetime.utcnow().isoformat()
        )

        # Extract title
        title_tag = soup.find('title')
        page.title = title_tag.get_text(strip=True) if title_tag else None

        # Extract description
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        if meta_desc and meta_desc.get('content'):
            page.description = meta_desc['content']

        # Extract content using selectors or full body
        if 'content' in extract_selectors:
            content_elements = soup.select(extract_selectors['content'])
            if content_elements:
                page.content = ' '.join(el.get_text(strip=True) for el in content_elements)
            else:
                page.content = soup.body.get_text(strip=True) if soup.body else ''
        else:
            page.content = soup.body.get_text(strip=True) if soup.body else ''

        page.character_count = len(page.content)

        # Extract custom fields
        extracted = {}
        for key, selector in extract_selectors.items():
            if key == 'content':
                continue
            elements = soup.select(selector)
            if elements:
                if selector.startswith('meta['):
                    extracted[key] = elements[0].get('content', '')
                else:
                    extracted[key] = ' '.join(el.get_text(strip=True) for el in elements)

        if extracted:
            page.extracted = extracted

        # Extract links
        links = set()
        for a in soup.find_all('a', href=True):
            href = a['href']
            # Convert to absolute URL
            absolute_url = urljoin(url, href)
            # Only HTTP(S) links without fragments
            parsed = urlparse(absolute_url)
            if parsed.scheme in ('http', 'https') and not parsed.fragment:
                # Remove query params for dedup
                clean_url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
                links.add(clean_url)

        page.links = list(links)

        return page

    def _normalize_url(self, url: str) -> str:
        """Normalize URL for deduplication."""
        url = url.strip()
        # Remove trailing slash
        if url.endswith('/') and url.count('/') > 3:
            url = url[:-1]
        return url

    def _compile_patterns(self, patterns: Optional[List[str]]) -> List[re.Pattern]:
        """Compile regex patterns."""
        if not patterns:
            return []
        compiled = []
        for pattern in patterns:
            try:
                compiled.append(re.compile(pattern))
            except re.error as e:
                logger.warning(f"Invalid regex pattern '{pattern}': {e}")
        return compiled

    def _should_crawl(
        self,
        url: str,
        include_patterns: List[re.Pattern],
        exclude_patterns: List[re.Pattern]
    ) -> bool:
        """Check if URL should be crawled based on patterns."""
        # Check exclude patterns first
        for pattern in exclude_patterns:
            if pattern.search(url):
                return False

        # If no include patterns, include all
        if not include_patterns:
            return True

        # Check include patterns
        for pattern in include_patterns:
            if pattern.search(url):
                return True

        return False
