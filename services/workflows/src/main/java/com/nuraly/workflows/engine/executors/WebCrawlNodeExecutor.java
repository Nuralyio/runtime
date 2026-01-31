package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import jakarta.enterprise.context.ApplicationScoped;
import org.jboss.logging.Logger;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;

/**
 * WEB_CRAWL Node Executor - Crawls web pages and extracts text content for RAG.
 *
 * Node Configuration:
 * {
 *   "urlField": "url",              // Input field containing URL(s) to crawl
 *   "maxDepth": 1,                  // Max link depth to follow (0 = single page, 1 = page + links)
 *   "maxPages": 10,                 // Max total pages to crawl
 *   "sameDomainOnly": true,         // Only follow links on same domain
 *   "includePatterns": [".*"],      // Regex patterns for URLs to include
 *   "excludePatterns": [".*/login.*", ".*/admin.*"],  // Regex patterns to exclude
 *   "timeout": 30000,               // HTTP timeout in ms
 *   "delayBetweenRequests": 1000,   // Rate limiting delay in ms
 *   "userAgent": "NuralyBot/1.0",   // User agent string
 *   "extractSelectors": {           // CSS selectors for targeted extraction
 *     "title": "h1",
 *     "content": "article, .content, main",
 *     "description": "meta[name=description]"
 *   },
 *   "removeSelectors": ["nav", "footer", "header", ".sidebar", "script", "style"]
 * }
 *
 * Input:
 *   { "url": "https://example.com" }
 *   or
 *   { "url": ["https://example.com/page1", "https://example.com/page2"] }
 *
 * Output:
 *   {
 *     "pages": [
 *       {
 *         "url": "https://example.com",
 *         "title": "Example Page",
 *         "content": "Extracted text content...",
 *         "description": "Meta description",
 *         "links": ["https://example.com/page2"],
 *         "characterCount": 5000,
 *         "crawledAt": "2024-01-15T10:30:00Z"
 *       }
 *     ],
 *     "totalPages": 1,
 *     "totalCharacters": 5000,
 *     "errors": []
 *   }
 */
@ApplicationScoped
public class WebCrawlNodeExecutor implements NodeExecutor {

    private static final Logger LOG = Logger.getLogger(WebCrawlNodeExecutor.class);
    private static final int DEFAULT_TIMEOUT_MS = 30000;
    private static final int DEFAULT_MAX_DEPTH = 1;
    private static final int DEFAULT_MAX_PAGES = 10;
    private static final int DEFAULT_DELAY_MS = 1000;
    private static final String DEFAULT_USER_AGENT = "NuralyBot/1.0 (+https://nuraly.io)";

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .followRedirects(HttpClient.Redirect.NORMAL)
            .build();

    @Override
    public NodeType getType() {
        return NodeType.WEB_CRAWL;
    }

    @Override
    public NodeExecutionResult execute(ExecutionContext context, WorkflowNodeEntity node) throws Exception {
        if (node.configuration == null) {
            return NodeExecutionResult.failure("WEB_CRAWL node configuration is missing");
        }

        JsonNode config = objectMapper.readTree(node.configuration);
        JsonNode input = context.getInput();

        // Get configuration
        String urlField = config.has("urlField") ? config.get("urlField").asText() : "url";
        int maxDepth = config.has("maxDepth") ? config.get("maxDepth").asInt() : DEFAULT_MAX_DEPTH;
        int maxPages = config.has("maxPages") ? config.get("maxPages").asInt() : DEFAULT_MAX_PAGES;
        boolean sameDomainOnly = !config.has("sameDomainOnly") || config.get("sameDomainOnly").asBoolean();
        int timeout = config.has("timeout") ? config.get("timeout").asInt() : DEFAULT_TIMEOUT_MS;
        int delayMs = config.has("delayBetweenRequests") ? config.get("delayBetweenRequests").asInt() : DEFAULT_DELAY_MS;
        String userAgent = config.has("userAgent") ? config.get("userAgent").asText() : DEFAULT_USER_AGENT;

        // Get URL patterns
        List<Pattern> includePatterns = getPatterns(config, "includePatterns");
        List<Pattern> excludePatterns = getPatterns(config, "excludePatterns");

        // Get selectors
        List<String> removeSelectors = getStringList(config, "removeSelectors");
        Map<String, String> extractSelectors = getExtractSelectors(config);

        // Get starting URLs
        List<String> startUrls = getStartUrls(input, urlField);
        if (startUrls.isEmpty()) {
            return NodeExecutionResult.failure("No URLs found in field '" + urlField + "'");
        }

        // Crawl pages
        CrawlResult crawlResult = crawlPages(
                startUrls, maxDepth, maxPages, sameDomainOnly,
                includePatterns, excludePatterns, removeSelectors, extractSelectors,
                timeout, delayMs, userAgent
        );

        // Build output
        ObjectNode output = objectMapper.createObjectNode();
        ArrayNode pagesArray = objectMapper.createArrayNode();

        for (PageResult page : crawlResult.pages) {
            ObjectNode pageNode = objectMapper.createObjectNode();
            pageNode.put("url", page.url);
            pageNode.put("title", page.title);
            pageNode.put("content", page.content);
            if (page.description != null) {
                pageNode.put("description", page.description);
            }
            pageNode.put("characterCount", page.content.length());
            pageNode.put("crawledAt", page.crawledAt);

            ArrayNode linksArray = objectMapper.createArrayNode();
            page.links.forEach(linksArray::add);
            pageNode.set("links", linksArray);

            // Add custom extracted fields
            if (!page.extractedFields.isEmpty()) {
                ObjectNode extractedNode = objectMapper.createObjectNode();
                page.extractedFields.forEach(extractedNode::put);
                pageNode.set("extracted", extractedNode);
            }

            pagesArray.add(pageNode);
        }

        output.set("pages", pagesArray);
        output.put("totalPages", crawlResult.pages.size());
        output.put("totalCharacters", crawlResult.pages.stream().mapToInt(p -> p.content.length()).sum());

        ArrayNode errorsArray = objectMapper.createArrayNode();
        crawlResult.errors.forEach(errorsArray::add);
        output.set("errors", errorsArray);

        // Pass through isolationKey
        if (input.has("isolationKey")) {
            output.put("isolationKey", input.get("isolationKey").asText());
        }

        LOG.infof("Crawled %d pages, %d characters total, %d errors",
                crawlResult.pages.size(),
                crawlResult.pages.stream().mapToInt(p -> p.content.length()).sum(),
                crawlResult.errors.size());

        return NodeExecutionResult.success(output);
    }

    private CrawlResult crawlPages(
            List<String> startUrls, int maxDepth, int maxPages, boolean sameDomainOnly,
            List<Pattern> includePatterns, List<Pattern> excludePatterns,
            List<String> removeSelectors, Map<String, String> extractSelectors,
            int timeout, int delayMs, String userAgent) {

        CrawlResult result = new CrawlResult();
        Set<String> visited = ConcurrentHashMap.newKeySet();
        Queue<UrlDepth> queue = new LinkedList<>();

        // Get allowed domains from start URLs
        Set<String> allowedDomains = new HashSet<>();
        for (String url : startUrls) {
            try {
                allowedDomains.add(URI.create(url).getHost());
                queue.add(new UrlDepth(url, 0));
            } catch (Exception e) {
                result.errors.add("Invalid URL: " + url);
            }
        }

        while (!queue.isEmpty() && result.pages.size() < maxPages) {
            UrlDepth current = queue.poll();

            if (visited.contains(current.url)) {
                continue;
            }
            visited.add(current.url);

            // Check URL patterns
            if (!shouldCrawl(current.url, includePatterns, excludePatterns)) {
                continue;
            }

            // Check domain
            if (sameDomainOnly) {
                try {
                    String host = URI.create(current.url).getHost();
                    if (!allowedDomains.contains(host)) {
                        continue;
                    }
                } catch (Exception e) {
                    continue;
                }
            }

            // Rate limiting
            if (result.pages.size() > 0 && delayMs > 0) {
                try {
                    Thread.sleep(delayMs);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }

            // Fetch and parse page
            try {
                PageResult page = fetchAndParse(current.url, removeSelectors, extractSelectors, timeout, userAgent);
                result.pages.add(page);

                // Add links to queue if not at max depth
                if (current.depth < maxDepth) {
                    for (String link : page.links) {
                        if (!visited.contains(link)) {
                            queue.add(new UrlDepth(link, current.depth + 1));
                        }
                    }
                }

                LOG.debugf("Crawled: %s (%d chars)", current.url, page.content.length());

            } catch (Exception e) {
                result.errors.add(current.url + ": " + e.getMessage());
                LOG.warnf("Failed to crawl %s: %s", current.url, e.getMessage());
            }
        }

        return result;
    }

    private PageResult fetchAndParse(String url, List<String> removeSelectors,
                                      Map<String, String> extractSelectors,
                                      int timeout, String userAgent) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofMillis(timeout))
                .header("User-Agent", userAgent)
                .header("Accept", "text/html,application/xhtml+xml")
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() >= 400) {
            throw new RuntimeException("HTTP " + response.statusCode());
        }

        Document doc = Jsoup.parse(response.body(), url);

        // Remove unwanted elements
        for (String selector : removeSelectors) {
            doc.select(selector).remove();
        }

        PageResult page = new PageResult();
        page.url = url;
        page.crawledAt = java.time.Instant.now().toString();

        // Extract title
        page.title = doc.title();

        // Extract description
        Element metaDesc = doc.selectFirst("meta[name=description]");
        if (metaDesc != null) {
            page.description = metaDesc.attr("content");
        }

        // Extract content using selectors or full body
        if (extractSelectors.containsKey("content")) {
            Elements contentElements = doc.select(extractSelectors.get("content"));
            if (!contentElements.isEmpty()) {
                page.content = contentElements.text();
            } else {
                page.content = doc.body().text();
            }
        } else {
            page.content = doc.body().text();
        }

        // Extract custom fields
        for (Map.Entry<String, String> entry : extractSelectors.entrySet()) {
            if ("content".equals(entry.getKey())) continue;

            Elements elements = doc.select(entry.getValue());
            if (!elements.isEmpty()) {
                if (entry.getValue().startsWith("meta[")) {
                    page.extractedFields.put(entry.getKey(), elements.first().attr("content"));
                } else {
                    page.extractedFields.put(entry.getKey(), elements.text());
                }
            }
        }

        // Extract links
        Elements links = doc.select("a[href]");
        for (Element link : links) {
            String href = link.absUrl("href");
            if (href.startsWith("http") && !href.contains("#")) {
                // Remove query params for dedup
                int queryIndex = href.indexOf('?');
                if (queryIndex > 0) {
                    href = href.substring(0, queryIndex);
                }
                page.links.add(href);
            }
        }

        return page;
    }

    private boolean shouldCrawl(String url, List<Pattern> includePatterns, List<Pattern> excludePatterns) {
        // Check exclude patterns first
        for (Pattern pattern : excludePatterns) {
            if (pattern.matcher(url).matches()) {
                return false;
            }
        }

        // If no include patterns, include all
        if (includePatterns.isEmpty()) {
            return true;
        }

        // Check include patterns
        for (Pattern pattern : includePatterns) {
            if (pattern.matcher(url).matches()) {
                return true;
            }
        }

        return false;
    }

    private List<String> getStartUrls(JsonNode input, String urlField) {
        List<String> urls = new ArrayList<>();

        if (!input.has(urlField)) {
            return urls;
        }

        JsonNode urlNode = input.get(urlField);
        if (urlNode.isArray()) {
            for (JsonNode u : urlNode) {
                urls.add(u.asText());
            }
        } else {
            urls.add(urlNode.asText());
        }

        return urls;
    }

    private List<Pattern> getPatterns(JsonNode config, String field) {
        List<Pattern> patterns = new ArrayList<>();
        if (config.has(field) && config.get(field).isArray()) {
            for (JsonNode p : config.get(field)) {
                try {
                    patterns.add(Pattern.compile(p.asText()));
                } catch (Exception e) {
                    LOG.warnf("Invalid regex pattern: %s", p.asText());
                }
            }
        }
        return patterns;
    }

    private List<String> getStringList(JsonNode config, String field) {
        List<String> list = new ArrayList<>();
        if (config.has(field) && config.get(field).isArray()) {
            for (JsonNode item : config.get(field)) {
                list.add(item.asText());
            }
        } else {
            // Default remove selectors
            list.addAll(Arrays.asList("nav", "footer", "header", "script", "style", "noscript", "iframe"));
        }
        return list;
    }

    private Map<String, String> getExtractSelectors(JsonNode config) {
        Map<String, String> selectors = new HashMap<>();
        if (config.has("extractSelectors") && config.get("extractSelectors").isObject()) {
            config.get("extractSelectors").fields().forEachRemaining(entry ->
                    selectors.put(entry.getKey(), entry.getValue().asText()));
        }
        return selectors;
    }

    // Helper classes
    private static class UrlDepth {
        String url;
        int depth;

        UrlDepth(String url, int depth) {
            this.url = url;
            this.depth = depth;
        }
    }

    private static class PageResult {
        String url;
        String title;
        String content;
        String description;
        String crawledAt;
        Set<String> links = new HashSet<>();
        Map<String, String> extractedFields = new HashMap<>();
    }

    private static class CrawlResult {
        List<PageResult> pages = new ArrayList<>();
        List<String> errors = new ArrayList<>();
    }
}
