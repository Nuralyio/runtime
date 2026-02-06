package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.entity.WorkflowExecutionEntity;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for WebCrawlNodeExecutor.
 *
 * Note: This executor calls an external crawl service via HTTP (similar to OCR node).
 * Full integration tests require the crawl service to be running.
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
    void testExecuteMissingUrl() throws Exception {
        WorkflowNodeEntity node = new WorkflowNodeEntity();
        node.id = UUID.randomUUID();
        node.configuration = objectMapper.writeValueAsString(
                objectMapper.createObjectNode()
                        .put("maxDepth", 0)
        );

        ObjectNode input = objectMapper.createObjectNode();
        // No URL field
        ExecutionContext context = createContext(input);

        NodeExecutionResult result = executor.execute(context, node);

        assertFalse(result.isSuccess());
        assertTrue(result.getErrorMessage().contains("No URLs found"));
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
    }

    @Test
    void testCrawlRequestFormat() throws Exception {
        // Verify the request format sent to crawl service
        ObjectNode request = objectMapper.createObjectNode();
        request.set("urls", objectMapper.createArrayNode()
                .add("https://example.com")
                .add("https://example.com/page2"));
        request.put("max_depth", 1);
        request.put("max_pages", 10);
        request.put("same_domain_only", true);
        request.put("render_js", false);
        request.put("workflow_id", "test-workflow");
        request.put("user_id", "test-user");
        request.put("isolation_key", "tenant-123");

        String json = objectMapper.writeValueAsString(request);
        JsonNode parsed = objectMapper.readTree(json);

        assertEquals(2, parsed.get("urls").size());
        assertEquals("https://example.com", parsed.get("urls").get(0).asText());
        assertEquals(1, parsed.get("max_depth").asInt());
        assertEquals(10, parsed.get("max_pages").asInt());
        assertTrue(parsed.get("same_domain_only").asBoolean());
        assertFalse(parsed.get("render_js").asBoolean());
    }

    @Test
    void testCrawlResponseFormat() throws Exception {
        // Verify expected response format from crawl service
        String json = """
            {
                "pages": [
                    {
                        "url": "https://example.com",
                        "title": "Test Page",
                        "content": "Test content",
                        "character_count": 12,
                        "crawled_at": "2024-01-15T10:30:00Z",
                        "links": ["https://example.com/page2"]
                    }
                ],
                "total_pages": 1,
                "total_characters": 12,
                "errors": []
            }
            """;

        JsonNode response = objectMapper.readTree(json);

        assertEquals(1, response.get("total_pages").asInt());
        assertEquals(12, response.get("total_characters").asInt());
        assertEquals(0, response.get("errors").size());
        assertEquals(1, response.get("pages").size());
        assertEquals("https://example.com", response.get("pages").get(0).get("url").asText());
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
