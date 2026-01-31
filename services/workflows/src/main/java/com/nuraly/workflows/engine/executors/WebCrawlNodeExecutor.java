package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.configuration.Configuration;
import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import com.nuraly.workflows.messaging.CrawlProducer;
import com.nuraly.workflows.messaging.CrawlRequestMessage;
import com.nuraly.workflows.messaging.CrawlResponseMessage;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.util.*;

/**
 * WEB_CRAWL Node Executor - Sends crawl requests to external crawl service via RabbitMQ.
 *
 * This node delegates crawling to an external isolated crawl service for:
 * - Security isolation (SSRF prevention at service level)
 * - Resource isolation (separate memory/CPU for heavy crawling)
 * - JS rendering support (Browserless integration in crawl service)
 * - Rate limiting per tenant
 * - Async processing via message queue
 *
 * Node Configuration:
 * {
 *   "urlField": "url",                       // Input field containing URL(s) to crawl
 *   "maxDepth": 1,                           // Max link depth to follow
 *   "maxPages": 10,                          // Max total pages to crawl
 *   "renderJs": false,                       // Use headless browser for JS pages
 *   "sameDomainOnly": true,                  // Only follow links on same domain
 *   "timeout": 120000,                       // Timeout waiting for crawl response (ms)
 *   "includePatterns": [".*"],               // Regex patterns for URLs to include
 *   "excludePatterns": [".*/login.*"],       // Regex patterns to exclude
 *   "extractSelectors": {                    // CSS selectors for targeted extraction
 *     "title": "h1",
 *     "content": "article, .content, main"
 *   },
 *   "removeSelectors": ["nav", "footer"]     // Elements to remove before extraction
 * }
 *
 * Input:
 *   { "url": "https://example.com" }
 *   or
 *   { "url": ["https://example.com/page1", "https://example.com/page2"] }
 *
 * Output (from crawl service):
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
    private static final int DEFAULT_MAX_DEPTH = 1;
    private static final int DEFAULT_MAX_PAGES = 10;

    @Inject
    Configuration configuration;

    @Inject
    CrawlProducer crawlProducer;

    private final ObjectMapper objectMapper = new ObjectMapper();

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
        boolean renderJs = config.has("renderJs") && config.get("renderJs").asBoolean();
        long timeout = config.has("timeout") ? config.get("timeout").asLong() : configuration.crawlTimeout;

        // Get starting URLs
        List<String> startUrls = getStartUrls(input, urlField);
        if (startUrls.isEmpty()) {
            return NodeExecutionResult.failure("No URLs found in field '" + urlField + "'");
        }

        // Build crawl request message
        CrawlRequestMessage crawlRequest = new CrawlRequestMessage();
        crawlRequest.setRequestId(UUID.randomUUID().toString());
        crawlRequest.setUrls(startUrls);
        crawlRequest.setMaxDepth(maxDepth);
        crawlRequest.setMaxPages(maxPages);
        crawlRequest.setSameDomainOnly(sameDomainOnly);
        crawlRequest.setRenderJs(renderJs);

        // Set patterns if specified
        if (config.has("includePatterns") && config.get("includePatterns").isArray()) {
            crawlRequest.setIncludePatterns(jsonArrayToList(config.get("includePatterns")));
        }
        if (config.has("excludePatterns") && config.get("excludePatterns").isArray()) {
            crawlRequest.setExcludePatterns(jsonArrayToList(config.get("excludePatterns")));
        }
        if (config.has("removeSelectors") && config.get("removeSelectors").isArray()) {
            crawlRequest.setRemoveSelectors(jsonArrayToList(config.get("removeSelectors")));
        }
        if (config.has("extractSelectors") && config.get("extractSelectors").isObject()) {
            crawlRequest.setExtractSelectors(jsonObjectToMap(config.get("extractSelectors")));
        }

        // Set tenant/isolation info
        if (input.has("isolationKey")) {
            crawlRequest.setIsolationKey(input.get("isolationKey").asText());
        }
        crawlRequest.setWorkflowId(context.getWorkflowId());
        crawlRequest.setUserId(context.getUserId());

        LOG.infof("Sending crawl request via RabbitMQ: requestId=%s, urls=%d, renderJs=%s",
                crawlRequest.getRequestId(), startUrls.size(), renderJs);

        // Send request and wait for response
        CrawlResponseMessage response = crawlProducer.sendCrawlRequest(crawlRequest, timeout);

        if (response == null) {
            return NodeExecutionResult.failure("No response from crawl service", true);
        }

        if (!response.isSuccess()) {
            return NodeExecutionResult.failure("Crawl service error: " + response.getErrorMessage(), true);
        }

        // Convert response to output JSON
        ObjectNode output = convertResponseToOutput(response, input);

        LOG.infof("Crawl completed: requestId=%s, pages=%d, characters=%d",
                response.getRequestId(), response.getTotalPages(), response.getTotalCharacters());

        return NodeExecutionResult.success(output);
    }

    private ObjectNode convertResponseToOutput(CrawlResponseMessage response, JsonNode input) {
        ObjectNode output = objectMapper.createObjectNode();

        // Convert pages
        ArrayNode pagesArray = objectMapper.createArrayNode();
        if (response.getPages() != null) {
            for (CrawlResponseMessage.CrawledPage page : response.getPages()) {
                ObjectNode pageNode = objectMapper.createObjectNode();
                pageNode.put("url", page.getUrl());
                pageNode.put("title", page.getTitle());
                pageNode.put("content", page.getContent());
                if (page.getDescription() != null) {
                    pageNode.put("description", page.getDescription());
                }
                pageNode.put("characterCount", page.getCharacterCount());
                pageNode.put("crawledAt", page.getCrawledAt());

                // Add links
                if (page.getLinks() != null) {
                    ArrayNode linksArray = objectMapper.createArrayNode();
                    page.getLinks().forEach(linksArray::add);
                    pageNode.set("links", linksArray);
                }

                // Add extracted fields
                if (page.getExtracted() != null && !page.getExtracted().isEmpty()) {
                    ObjectNode extractedNode = objectMapper.createObjectNode();
                    page.getExtracted().forEach(extractedNode::put);
                    pageNode.set("extracted", extractedNode);
                }

                pagesArray.add(pageNode);
            }
        }
        output.set("pages", pagesArray);

        output.put("totalPages", response.getTotalPages());
        output.put("totalCharacters", response.getTotalCharacters());

        // Add errors
        ArrayNode errorsArray = objectMapper.createArrayNode();
        if (response.getErrors() != null) {
            response.getErrors().forEach(errorsArray::add);
        }
        output.set("errors", errorsArray);

        // Pass through isolationKey
        if (input.has("isolationKey")) {
            output.put("isolationKey", input.get("isolationKey").asText());
        }

        return output;
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

    private List<String> jsonArrayToList(JsonNode arrayNode) {
        List<String> list = new ArrayList<>();
        for (JsonNode item : arrayNode) {
            list.add(item.asText());
        }
        return list;
    }

    private Map<String, String> jsonObjectToMap(JsonNode objectNode) {
        Map<String, String> map = new HashMap<>();
        objectNode.fields().forEachRemaining(entry ->
                map.put(entry.getKey(), entry.getValue().asText()));
        return map;
    }
}
