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
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.config.RequestConfig;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.ContentType;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.apache.hc.core5.util.Timeout;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

/**
 * WEB_CRAWL Node Executor - Crawls web pages via external crawl service.
 *
 * Similar pattern to OCR node - calls external service via HTTP.
 * The crawl service handles the actual crawling (with SSRF protection, rate limiting, JS rendering).
 *
 * Node Configuration:
 * {
 *   "urlField": "url",                       // Input field containing URL(s) to crawl
 *   "maxDepth": 1,                           // Max link depth to follow
 *   "maxPages": 10,                          // Max total pages to crawl
 *   "renderJs": false,                       // Use headless browser for JS pages
 *   "sameDomainOnly": true,                  // Only follow links on same domain
 *   "timeout": 120000,                       // Request timeout in ms
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
 * Output:
 *   {
 *     "pages": [...],
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
    private static final int DEFAULT_TIMEOUT_MS = 120000;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @ConfigProperty(name = "crawl.service.url", defaultValue = "http://crawl:8000")
    Optional<String> crawlServiceUrlConfig;

    private String getCrawlServiceUrl() {
        return crawlServiceUrlConfig.orElse(
            System.getenv("CRAWL_SERVICE_URL") != null ? System.getenv("CRAWL_SERVICE_URL") : "http://crawl:8000"
        );
    }

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
        int timeout = config.has("timeout") ? config.get("timeout").asInt() : DEFAULT_TIMEOUT_MS;

        // Get starting URLs
        List<String> startUrls = getStartUrls(input, urlField);
        if (startUrls.isEmpty()) {
            return NodeExecutionResult.failure("No URLs found in field '" + urlField + "'");
        }

        // Build request to crawl service
        ObjectNode requestBody = objectMapper.createObjectNode();
        ArrayNode urlsArray = objectMapper.createArrayNode();
        startUrls.forEach(urlsArray::add);
        requestBody.set("urls", urlsArray);
        requestBody.put("max_depth", maxDepth);
        requestBody.put("max_pages", maxPages);
        requestBody.put("same_domain_only", sameDomainOnly);
        requestBody.put("render_js", renderJs);

        // Pass through patterns if specified
        if (config.has("includePatterns") && config.get("includePatterns").isArray()) {
            requestBody.set("include_patterns", config.get("includePatterns"));
        }
        if (config.has("excludePatterns") && config.get("excludePatterns").isArray()) {
            requestBody.set("exclude_patterns", config.get("excludePatterns"));
        }
        if (config.has("extractSelectors") && config.get("extractSelectors").isObject()) {
            requestBody.set("extract_selectors", config.get("extractSelectors"));
        }
        if (config.has("removeSelectors") && config.get("removeSelectors").isArray()) {
            requestBody.set("remove_selectors", config.get("removeSelectors"));
        }

        // Add isolation info
        if (input.has("isolationKey")) {
            requestBody.put("isolation_key", input.get("isolationKey").asText());
        }
        requestBody.put("workflow_id", context.getWorkflowId());
        requestBody.put("user_id", context.getUserId());

        RequestConfig requestConfig = RequestConfig.custom()
                .setConnectionRequestTimeout(Timeout.of(timeout, TimeUnit.MILLISECONDS))
                .setResponseTimeout(Timeout.of(timeout, TimeUnit.MILLISECONDS))
                .build();

        try (CloseableHttpClient httpClient = HttpClients.custom()
                .setDefaultRequestConfig(requestConfig)
                .build()) {

            HttpPost request = new HttpPost(getCrawlServiceUrl() + "/crawl");
            request.setHeader("Content-Type", "application/json");
            request.setEntity(new StringEntity(
                objectMapper.writeValueAsString(requestBody),
                ContentType.APPLICATION_JSON
            ));

            LOG.infof("Sending crawl request to %s for %d URLs", getCrawlServiceUrl(), startUrls.size());

            var response = httpClient.execute(request);
            int statusCode = response.getCode();
            String responseBody = response.getEntity() != null ? EntityUtils.toString(response.getEntity()) : "";

            if (statusCode >= 200 && statusCode < 300) {
                JsonNode crawlResult = objectMapper.readTree(responseBody);

                ObjectNode output = objectMapper.createObjectNode();

                // Copy response fields
                if (crawlResult.has("pages")) {
                    output.set("pages", crawlResult.get("pages"));
                }
                if (crawlResult.has("total_pages")) {
                    output.put("totalPages", crawlResult.get("total_pages").asInt());
                } else if (crawlResult.has("totalPages")) {
                    output.put("totalPages", crawlResult.get("totalPages").asInt());
                }
                if (crawlResult.has("total_characters")) {
                    output.put("totalCharacters", crawlResult.get("total_characters").asInt());
                } else if (crawlResult.has("totalCharacters")) {
                    output.put("totalCharacters", crawlResult.get("totalCharacters").asInt());
                }
                if (crawlResult.has("errors")) {
                    output.set("errors", crawlResult.get("errors"));
                }

                // Pass through isolationKey
                if (input.has("isolationKey")) {
                    output.put("isolationKey", input.get("isolationKey").asText());
                }

                int pageCount = output.has("totalPages") ? output.get("totalPages").asInt() : 0;
                int charCount = output.has("totalCharacters") ? output.get("totalCharacters").asInt() : 0;
                LOG.infof("Crawl completed: %d pages, %d characters", pageCount, charCount);

                return NodeExecutionResult.success(output);

            } else if (statusCode >= 500) {
                // Server error - retryable
                return NodeExecutionResult.failure("Crawl service error: " + responseBody, true);
            } else {
                // Client error - not retryable
                return NodeExecutionResult.failure("Crawl request failed: " + responseBody);
            }

        } catch (Exception e) {
            // Network errors are retryable
            LOG.errorf(e, "Crawl service connection failed");
            return NodeExecutionResult.failure("Crawl service connection failed: " + e.getMessage(), true);
        }
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
}
