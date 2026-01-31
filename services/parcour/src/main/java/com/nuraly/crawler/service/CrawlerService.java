package com.nuraly.crawler.service;

import com.microsoft.playwright.Browser;
import com.microsoft.playwright.BrowserContext;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.Playwright;
import com.nuraly.crawler.configuration.CrawlerConfiguration;
import com.nuraly.crawler.dto.CrawlRequestDTO;
import com.nuraly.crawler.dto.CrawlResultDTO;
import com.nuraly.crawler.dto.CrawledPageDTO;
import com.nuraly.crawler.exception.BrowserException;
import com.nuraly.crawler.security.UrlValidationResult;
import com.nuraly.crawler.security.UrlValidator;
import jakarta.annotation.PreDestroy;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@ApplicationScoped
public class CrawlerService {

    private static final Logger LOG = Logger.getLogger(CrawlerService.class);

    @Inject
    CrawlerConfiguration config;

    @Inject
    UrlValidator urlValidator;

    private HttpClient httpClient;
    private Playwright playwright;
    private Browser browser;

    private HttpClient getHttpClient() {
        if (httpClient == null) {
            httpClient = HttpClient.newBuilder()
                    .followRedirects(HttpClient.Redirect.NORMAL)
                    .connectTimeout(Duration.ofSeconds(config.timeoutSeconds))
                    .build();
        }
        return httpClient;
    }

    private Browser getBrowser() throws BrowserException {
        if (browser == null) {
            try {
                playwright = Playwright.create();

                if (config.browserlessUrl.isPresent()) {
                    browser = playwright.chromium().connectOverCDP(config.browserlessUrl.get());
                    LOG.infof("Connected to Browserless at %s", config.browserlessUrl.get());
                } else {
                    browser = playwright.chromium().launch();
                    LOG.info("Launched local Chromium browser");
                }
            } catch (Exception e) {
                throw new BrowserException("Failed to initialize browser", e);
            }
        }
        return browser;
    }

    @PreDestroy
    public void close() {
        if (browser != null) {
            browser.close();
        }
        if (playwright != null) {
            playwright.close();
        }
    }

    public CrawlResultDTO crawl(CrawlRequestDTO request) {
        CrawlResultDTO result = CrawlResultDTO.builder()
                .pages(new ArrayList<>())
                .errors(new ArrayList<>())
                .build();

        Set<String> visited = new HashSet<>();
        Deque<UrlDepth> queue = new ConcurrentLinkedDeque<>();

        // Get allowed domains from start URLs
        Set<String> allowedDomains = new HashSet<>();
        for (String url : request.getUrls()) {
            try {
                URI uri = new URI(url);
                if (uri.getHost() != null) {
                    allowedDomains.add(uri.getHost().toLowerCase());
                }
                queue.add(new UrlDepth(url, 0));
            } catch (URISyntaxException e) {
                result.getErrors().add("Invalid URL: " + url + " - " + e.getMessage());
            }
        }

        // Compile patterns
        List<Pattern> includePatterns = compilePatterns(request.getIncludePatterns());
        List<Pattern> excludePatterns = compilePatterns(request.getExcludePatterns());

        // Get selectors
        List<String> removeSelectors = request.getRemoveSelectors() != null
                ? request.getRemoveSelectors()
                : config.defaultRemoveSelectors;
        Map<String, String> extractSelectors = request.getExtractSelectors() != null
                ? request.getExtractSelectors()
                : Collections.emptyMap();

        while (!queue.isEmpty() && result.getPages().size() < request.getMaxPages()) {
            UrlDepth urlDepth = queue.poll();
            String url = normalizeUrl(urlDepth.url);
            int depth = urlDepth.depth;

            if (visited.contains(url)) {
                continue;
            }
            visited.add(url);

            // Check URL patterns
            if (!shouldCrawl(url, includePatterns, excludePatterns)) {
                continue;
            }

            // Check domain
            if (request.isSameDomainOnly()) {
                try {
                    URI uri = new URI(url);
                    String host = uri.getHost();
                    if (host != null && !allowedDomains.contains(host.toLowerCase())) {
                        continue;
                    }
                } catch (URISyntaxException e) {
                    continue;
                }
            }

            // Validate URL for SSRF
            UrlValidationResult validation = urlValidator.validate(url);
            if (!validation.isValid()) {
                result.getErrors().add(url + ": " + validation.getReason());
                continue;
            }

            // Rate limiting
            if (!result.getPages().isEmpty()) {
                try {
                    Thread.sleep(config.delayMs);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }

            // Fetch and parse page
            try {
                CrawledPageDTO page;
                if (request.isRenderJs()) {
                    page = fetchWithBrowser(url, removeSelectors, extractSelectors);
                } else {
                    page = fetchWithHttpClient(url, removeSelectors, extractSelectors);
                }

                result.getPages().add(page);
                result.setTotalCharacters(result.getTotalCharacters() + page.getCharacterCount());

                // Add links to queue if not at max depth
                if (depth < request.getMaxDepth()) {
                    for (String link : page.getLinks()) {
                        if (!visited.contains(link)) {
                            queue.add(new UrlDepth(link, depth + 1));
                        }
                    }
                }

                LOG.debugf("Crawled: %s (%d chars)", url, page.getCharacterCount());

            } catch (Exception e) {
                String errorMsg = url + ": " + e.getMessage();
                result.getErrors().add(errorMsg);
                LOG.warnf("Failed to crawl %s: %s", url, e.getMessage());
            }
        }

        result.setTotalPages(result.getPages().size());
        return result;
    }

    private CrawledPageDTO fetchWithHttpClient(String url, List<String> removeSelectors, Map<String, String> extractSelectors)
            throws IOException, InterruptedException {

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(config.timeoutSeconds))
                .header("User-Agent", config.userAgent)
                .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
                .header("Accept-Language", "en-US,en;q=0.5")
                .GET()
                .build();

        HttpResponse<String> response = getHttpClient().send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() >= 400) {
            throw new IOException("HTTP " + response.statusCode());
        }

        return parseHtml(url, response.body(), removeSelectors, extractSelectors);
    }

    private CrawledPageDTO fetchWithBrowser(String url, List<String> removeSelectors, Map<String, String> extractSelectors)
            throws BrowserException {

        Browser browser = getBrowser();
        BrowserContext context = browser.newContext();
        Page page = context.newPage();

        try {
            page.navigate(url, new Page.NavigateOptions()
                    .setWaitUntil(com.microsoft.playwright.options.WaitUntilState.NETWORKIDLE)
                    .setTimeout(config.timeoutSeconds * 1000));

            // Wait for lazy-loaded content
            page.waitForTimeout(1000);

            String html = page.content();
            return parseHtml(url, html, removeSelectors, extractSelectors);

        } finally {
            page.close();
            context.close();
        }
    }

    private CrawledPageDTO parseHtml(String url, String html, List<String> removeSelectors, Map<String, String> extractSelectors) {
        Document doc = Jsoup.parse(html, url);

        // Remove unwanted elements
        for (String selector : removeSelectors) {
            doc.select(selector).remove();
        }

        CrawledPageDTO.CrawledPageDTOBuilder pageBuilder = CrawledPageDTO.builder()
                .url(url)
                .crawledAt(Instant.now().toString());

        // Extract title
        Element titleTag = doc.selectFirst("title");
        if (titleTag != null) {
            pageBuilder.title(titleTag.text());
        }

        // Extract description
        Element metaDesc = doc.selectFirst("meta[name=description]");
        if (metaDesc != null) {
            pageBuilder.description(metaDesc.attr("content"));
        }

        // Extract content
        String content;
        if (extractSelectors.containsKey("content")) {
            Elements contentElements = doc.select(extractSelectors.get("content"));
            if (!contentElements.isEmpty()) {
                content = contentElements.stream()
                        .map(Element::text)
                        .collect(Collectors.joining(" "));
            } else {
                content = doc.body() != null ? doc.body().text() : "";
            }
        } else {
            content = doc.body() != null ? doc.body().text() : "";
        }
        pageBuilder.content(content);
        pageBuilder.characterCount(content.length());

        // Extract custom fields
        Map<String, String> extracted = new HashMap<>();
        for (Map.Entry<String, String> entry : extractSelectors.entrySet()) {
            if ("content".equals(entry.getKey())) {
                continue;
            }
            Elements elements = doc.select(entry.getValue());
            if (!elements.isEmpty()) {
                if (entry.getValue().startsWith("meta[")) {
                    extracted.put(entry.getKey(), elements.first().attr("content"));
                } else {
                    extracted.put(entry.getKey(), elements.stream()
                            .map(Element::text)
                            .collect(Collectors.joining(" ")));
                }
            }
        }
        if (!extracted.isEmpty()) {
            pageBuilder.extracted(extracted);
        }

        // Extract links
        Set<String> links = new HashSet<>();
        for (Element a : doc.select("a[href]")) {
            String href = a.absUrl("href");
            if (href.isEmpty()) {
                continue;
            }
            try {
                URI uri = new URI(href);
                if ("http".equals(uri.getScheme()) || "https".equals(uri.getScheme())) {
                    // Remove fragment
                    String cleanUrl = uri.getScheme() + "://" + uri.getHost() +
                            (uri.getPort() > 0 ? ":" + uri.getPort() : "") + uri.getPath();
                    links.add(cleanUrl);
                }
            } catch (URISyntaxException e) {
                // Ignore invalid URLs
            }
        }
        pageBuilder.links(new ArrayList<>(links));

        return pageBuilder.build();
    }

    private String normalizeUrl(String url) {
        url = url.strip();
        // Remove trailing slash
        if (url.endsWith("/") && url.chars().filter(ch -> ch == '/').count() > 3) {
            url = url.substring(0, url.length() - 1);
        }
        return url;
    }

    private List<Pattern> compilePatterns(List<String> patterns) {
        if (patterns == null || patterns.isEmpty()) {
            return Collections.emptyList();
        }
        List<Pattern> compiled = new ArrayList<>();
        for (String pattern : patterns) {
            try {
                compiled.add(Pattern.compile(pattern));
            } catch (Exception e) {
                LOG.warnf("Invalid regex pattern '%s': %s", pattern, e.getMessage());
            }
        }
        return compiled;
    }

    private boolean shouldCrawl(String url, List<Pattern> includePatterns, List<Pattern> excludePatterns) {
        // Check exclude patterns first
        for (Pattern pattern : excludePatterns) {
            if (pattern.matcher(url).find()) {
                return false;
            }
        }

        // If no include patterns, include all
        if (includePatterns.isEmpty()) {
            return true;
        }

        // Check include patterns
        for (Pattern pattern : includePatterns) {
            if (pattern.matcher(url).find()) {
                return true;
            }
        }

        return false;
    }

    private record UrlDepth(String url, int depth) {}
}
