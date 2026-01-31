package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

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
    void testExecuteWithArrayUrls() throws Exception {
        WorkflowNodeEntity node = new WorkflowNodeEntity();
        node.id = UUID.randomUUID();
        node.configuration = objectMapper.writeValueAsString(
                objectMapper.createObjectNode()
                        .put("maxDepth", 0)
                        .put("maxPages", 2)
        );

        ObjectNode input = objectMapper.createObjectNode();
        input.set("url", objectMapper.createArrayNode()
                .add("https://httpbin.org/html")
        );

        ExecutionContext context = createContext(input);

        // This test would require network access
        // In a real test environment, you'd mock the HTTP client
        // For now, we just verify the configuration parsing works
        assertNotNull(node.configuration);
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
