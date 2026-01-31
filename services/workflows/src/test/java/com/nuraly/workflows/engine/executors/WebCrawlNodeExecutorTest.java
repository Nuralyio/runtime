package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import com.nuraly.workflows.messaging.CrawlRequestMessage;
import com.nuraly.workflows.messaging.CrawlResponseMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for WebCrawlNodeExecutor.
 *
 * Note: This executor sends crawl requests via RabbitMQ.
 * Full integration tests require RabbitMQ and the crawl service to be running.
 */
class WebCrawlNodeExecutorTest {

    private WebCrawlNodeExecutor executor;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        executor = new WebCrawlNodeExecutor();
        objectMapper = new ObjectMapper();
    }

    @Test
    void testGetType() {
        assertEquals(NodeType.WEB_CRAWL, executor.getType());
    }

    @Test
    void testExecuteMissingConfiguration() throws Exception {
        WorkflowNodeEntity node = new WorkflowNodeEntity();
        node.id = UUID.randomUUID();
        node.configuration = null;

        ObjectNode input = objectMapper.createObjectNode();
        ExecutionContext context = createContext(input);

        NodeExecutionResult result = executor.execute(context, node);

        assertFalse(result.isSuccess());
        assertTrue(result.getErrorMessage().contains("configuration is missing"));
    }

    @Test
    void testConfigurationParsing() throws Exception {
        // Test that configuration JSON is properly parsed
        ObjectNode config = objectMapper.createObjectNode();
        config.put("urlField", "customUrl");
        config.put("maxDepth", 2);
        config.put("maxPages", 20);
        config.put("sameDomainOnly", false);
        config.put("renderJs", true);
        config.put("timeout", 30000);

        ObjectNode extractSelectors = objectMapper.createObjectNode();
        extractSelectors.put("title", "h1");
        extractSelectors.put("content", "article");
        config.set("extractSelectors", extractSelectors);

        config.set("includePatterns", objectMapper.createArrayNode().add(".*\\.html"));
        config.set("excludePatterns", objectMapper.createArrayNode().add(".*/admin/.*"));
        config.set("removeSelectors", objectMapper.createArrayNode().add("nav").add("footer"));

        // Verify JSON serialization works
        String jsonConfig = objectMapper.writeValueAsString(config);
        JsonNode parsedConfig = objectMapper.readTree(jsonConfig);

        assertEquals("customUrl", parsedConfig.get("urlField").asText());
        assertEquals(2, parsedConfig.get("maxDepth").asInt());
        assertEquals(20, parsedConfig.get("maxPages").asInt());
        assertFalse(parsedConfig.get("sameDomainOnly").asBoolean());
        assertTrue(parsedConfig.get("renderJs").asBoolean());
        assertEquals(30000, parsedConfig.get("timeout").asInt());
        assertEquals("h1", parsedConfig.get("extractSelectors").get("title").asText());
        assertEquals("article", parsedConfig.get("extractSelectors").get("content").asText());
        assertEquals(".*\\.html", parsedConfig.get("includePatterns").get(0).asText());
        assertEquals(".*/admin/.*", parsedConfig.get("excludePatterns").get(0).asText());
        assertEquals("nav", parsedConfig.get("removeSelectors").get(0).asText());
    }

    @Test
    void testCrawlRequestMessageFormat() {
        // Verify the request message format sent via RabbitMQ
        CrawlRequestMessage request = new CrawlRequestMessage();
        request.setRequestId("test-request-123");
        request.setUrls(Arrays.asList("https://example.com", "https://example.com/page2"));
        request.setMaxDepth(1);
        request.setMaxPages(10);
        request.setSameDomainOnly(true);
        request.setRenderJs(false);
        request.setWorkflowId("test-workflow");
        request.setUserId("test-user");
        request.setIsolationKey("tenant-123");
        request.setIncludePatterns(Arrays.asList(".*\\.html", ".*\\.htm"));
        request.setExcludePatterns(Arrays.asList(".*/admin/.*", ".*/login/.*"));
        request.setRemoveSelectors(Arrays.asList("nav", "footer", "header"));

        Map<String, String> extractSelectors = new HashMap<>();
        extractSelectors.put("title", "h1");
        extractSelectors.put("content", "article");
        request.setExtractSelectors(extractSelectors);

        assertEquals("test-request-123", request.getRequestId());
        assertEquals(2, request.getUrls().size());
        assertEquals("https://example.com", request.getUrls().get(0));
        assertEquals(1, request.getMaxDepth());
        assertEquals(10, request.getMaxPages());
        assertTrue(request.isSameDomainOnly());
        assertFalse(request.isRenderJs());
        assertEquals("test-workflow", request.getWorkflowId());
        assertEquals("test-user", request.getUserId());
        assertEquals("tenant-123", request.getIsolationKey());
        assertEquals(2, request.getIncludePatterns().size());
        assertEquals(2, request.getExcludePatterns().size());
        assertEquals(3, request.getRemoveSelectors().size());
        assertEquals("h1", request.getExtractSelectors().get("title"));
    }

    @Test
    void testCrawlResponseMessageFormat() {
        // Verify expected response format from crawl service
        CrawlResponseMessage response = new CrawlResponseMessage();
        response.setRequestId("test-request-123");
        response.setSuccess(true);
        response.setTotalPages(1);
        response.setTotalCharacters(50);
        response.setErrors(Arrays.asList());

        CrawlResponseMessage.CrawledPage page = new CrawlResponseMessage.CrawledPage();
        page.setUrl("https://example.com");
        page.setTitle("Example Page");
        page.setContent("This is the extracted text content from the page.");
        page.setDescription("Meta description from the page");
        page.setCharacterCount(50);
        page.setCrawledAt("2024-01-15T10:30:00Z");
        page.setLinks(Arrays.asList("https://example.com/page2"));

        Map<String, String> extracted = new HashMap<>();
        extracted.put("title", "Example Title");
        page.setExtracted(extracted);

        response.setPages(Arrays.asList(page));

        assertTrue(response.isSuccess());
        assertEquals("test-request-123", response.getRequestId());
        assertEquals(1, response.getTotalPages());
        assertEquals(50, response.getTotalCharacters());
        assertEquals(0, response.getErrors().size());
        assertEquals(1, response.getPages().size());
        assertEquals("https://example.com", response.getPages().get(0).getUrl());
        assertEquals("Example Page", response.getPages().get(0).getTitle());
        assertEquals("Example Title", response.getPages().get(0).getExtracted().get("title"));
    }

    @Test
    void testCrawlRequestMessageJsonSerialization() throws Exception {
        // Test that request message serializes properly
        CrawlRequestMessage request = new CrawlRequestMessage();
        request.setRequestId("test-123");
        request.setUrls(Arrays.asList("https://example.com"));
        request.setMaxDepth(2);
        request.setMaxPages(20);
        request.setRenderJs(true);
        request.setSameDomainOnly(false);

        String json = objectMapper.writeValueAsString(request);
        CrawlRequestMessage deserialized = objectMapper.readValue(json, CrawlRequestMessage.class);

        assertEquals("test-123", deserialized.getRequestId());
        assertEquals(1, deserialized.getUrls().size());
        assertEquals(2, deserialized.getMaxDepth());
        assertEquals(20, deserialized.getMaxPages());
        assertTrue(deserialized.isRenderJs());
        assertFalse(deserialized.isSameDomainOnly());
    }

    @Test
    void testCrawlResponseMessageJsonSerialization() throws Exception {
        // Test that response message deserializes properly
        String json = """
            {
                "requestId": "test-123",
                "success": true,
                "totalPages": 2,
                "totalCharacters": 1000,
                "errors": [],
                "pages": [
                    {
                        "url": "https://example.com",
                        "title": "Test Page",
                        "content": "Test content",
                        "characterCount": 12,
                        "crawledAt": "2024-01-15T10:30:00Z",
                        "links": ["https://example.com/page2"]
                    }
                ]
            }
            """;

        CrawlResponseMessage response = objectMapper.readValue(json, CrawlResponseMessage.class);

        assertEquals("test-123", response.getRequestId());
        assertTrue(response.isSuccess());
        assertEquals(2, response.getTotalPages());
        assertEquals(1000, response.getTotalCharacters());
        assertEquals(0, response.getErrors().size());
        assertEquals(1, response.getPages().size());
        assertEquals("https://example.com", response.getPages().get(0).getUrl());
        assertEquals("Test Page", response.getPages().get(0).getTitle());
        assertEquals(1, response.getPages().get(0).getLinks().size());
    }

    @Test
    void testErrorResponseFormat() {
        // Verify error response handling
        CrawlResponseMessage errorResponse = new CrawlResponseMessage();
        errorResponse.setRequestId("test-123");
        errorResponse.setSuccess(false);
        errorResponse.setErrorMessage("Failed to connect to target URL");
        errorResponse.setTotalPages(0);
        errorResponse.setTotalCharacters(0);
        errorResponse.setErrors(Arrays.asList("Connection timeout", "DNS resolution failed"));

        assertFalse(errorResponse.isSuccess());
        assertEquals("Failed to connect to target URL", errorResponse.getErrorMessage());
        assertEquals(2, errorResponse.getErrors().size());
    }

    private ExecutionContext createContext(JsonNode input) {
        return new ExecutionContext() {
            @Override
            public JsonNode getInput() {
                return input;
            }

            @Override
            public void setVariable(String name, Object value) {}

            @Override
            public Object getVariable(String name) {
                return null;
            }

            @Override
            public String getExecutionId() {
                return UUID.randomUUID().toString();
            }

            @Override
            public String getWorkflowId() {
                return UUID.randomUUID().toString();
            }

            @Override
            public String getUserId() {
                return "test-user";
            }
        };
    }
}
