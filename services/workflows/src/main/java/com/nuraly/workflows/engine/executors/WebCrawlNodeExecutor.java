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
import com.nuraly.workflows.messaging.ServiceProducer;
import com.nuraly.workflows.messaging.ServiceRequestMessage;
import com.nuraly.workflows.messaging.ServiceResponseMessage;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.util.ArrayList;
import java.util.List;

/**
 * WEB_CRAWL Node Executor - Crawls web pages via RabbitMQ.
 *
 * <p>Sends requests to external crawl service via RabbitMQ for scaling.
 * The crawl service handles the actual crawling (SSRF protection, rate limiting, JS rendering).</p>
 *
 * <p>Node Configuration:</p>
 * <ul>
 *   <li>urlField - Input field containing URL(s) to crawl (default: "url")</li>
 *   <li>maxDepth - Max link depth to follow (default: 1)</li>
 *   <li>maxPages - Max total pages to crawl (default: 10)</li>
 *   <li>renderJs - Use headless browser for JS pages (default: false)</li>
 *   <li>sameDomainOnly - Only follow links on same domain (default: true)</li>
 *   <li>includePatterns - Regex patterns for URLs to include</li>
 *   <li>excludePatterns - Regex patterns to exclude</li>
 *   <li>extractSelectors - CSS selectors for targeted extraction</li>
 *   <li>removeSelectors - Elements to remove before extraction</li>
 * </ul>
 */
@ApplicationScoped
public class WebCrawlNodeExecutor implements NodeExecutor {

    private static final Logger LOG = Logger.getLogger(WebCrawlNodeExecutor.class);
    private static final int DEFAULT_MAX_DEPTH = 1;
    private static final int DEFAULT_MAX_PAGES = 10;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Inject
    ServiceProducer serviceProducer;

    @Inject
    Configuration configuration;

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

        // Get starting URLs
        List<String> startUrls = getStartUrls(input, urlField);
        if (startUrls.isEmpty()) {
            return NodeExecutionResult.failure("No URLs found in field '" + urlField + "'");
        }

        // Build request payload
        ObjectNode requestPayload = objectMapper.createObjectNode();
        ArrayNode urlsArray = objectMapper.createArrayNode();
        startUrls.forEach(urlsArray::add);
        requestPayload.set("urls", urlsArray);
        requestPayload.put("max_depth", maxDepth);
        requestPayload.put("max_pages", maxPages);
        requestPayload.put("same_domain_only", sameDomainOnly);
        requestPayload.put("render_js", renderJs);

        // Pass through patterns if specified
        if (config.has("includePatterns") && config.get("includePatterns").isArray()) {
            requestPayload.set("include_patterns", config.get("includePatterns"));
        }
        if (config.has("excludePatterns") && config.get("excludePatterns").isArray()) {
            requestPayload.set("exclude_patterns", config.get("excludePatterns"));
        }
        if (config.has("extractSelectors") && config.get("extractSelectors").isObject()) {
            requestPayload.set("extract_selectors", config.get("extractSelectors"));
        }
        if (config.has("removeSelectors") && config.get("removeSelectors").isArray()) {
            requestPayload.set("remove_selectors", config.get("removeSelectors"));
        }

        // Create service request
        ServiceRequestMessage request = new ServiceRequestMessage("crawl", objectMapper.writeValueAsString(requestPayload));
        request.setWorkflowId(context.getWorkflowId());
        request.setExecutionId(context.getExecutionId());
        request.setUserId(context.getUserId());

        if (input.has("isolationKey")) {
            request.setIsolationKey(input.get("isolationKey").asText());
        }

        LOG.infof("Sending crawl request via RabbitMQ: requestId=%s, urls=%d", request.getRequestId(), startUrls.size());

        // Send request and wait for response
        ServiceResponseMessage response = serviceProducer.sendRequest("crawl", request, configuration.serviceTimeout);

        if (!response.isSuccess()) {
            boolean retryable = response.getErrorMessage() != null &&
                    (response.getErrorMessage().contains("timeout") ||
                     response.getErrorMessage().contains("connection"));
            return NodeExecutionResult.failure("Crawl service error: " + response.getErrorMessage(), retryable);
        }

        // Parse response payload
        JsonNode crawlResult = objectMapper.readTree(response.getPayload());

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
        LOG.infof("Crawl completed: requestId=%s, pages=%d, characters=%d",
                request.getRequestId(), pageCount, charCount);

        return NodeExecutionResult.success(output);
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
