package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.entity.WorkflowExecutionEntity;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
class HttpStartNodeExecutorTest {

    private HttpStartNodeExecutor executor;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        executor = new HttpStartNodeExecutor();
        objectMapper = new ObjectMapper();
    }

    @Test
    void testGetType() {
        assertEquals(NodeType.HTTP_START, executor.getType());
    }

    @Test
    void testExecuteWithFullRequestData() throws Exception {
        // Create execution context with HTTP request data
        WorkflowExecutionEntity execution = new WorkflowExecutionEntity();
        ObjectNode inputData = objectMapper.createObjectNode();
        inputData.put("method", "POST");
        inputData.put("path", "/api/users");
        inputData.put("clientIp", "192.168.1.1");
        inputData.put("requestId", "req-123");

        ObjectNode headers = objectMapper.createObjectNode();
        headers.put("Content-Type", "application/json");
        headers.put("Authorization", "Bearer token123");
        inputData.set("headers", headers);

        ObjectNode body = objectMapper.createObjectNode();
        body.put("name", "John Doe");
        body.put("email", "john@example.com");
        inputData.set("body", body);

        ObjectNode queryParams = objectMapper.createObjectNode();
        queryParams.put("page", "1");
        queryParams.put("limit", "10");
        inputData.set("queryParams", queryParams);

        execution.inputData = objectMapper.writeValueAsString(inputData);
        ExecutionContext context = new ExecutionContext(execution);

        WorkflowNodeEntity node = new WorkflowNodeEntity();
        node.type = NodeType.HTTP_START;
        node.name = "HTTP Trigger";

        // Execute
        NodeExecutionResult result = executor.execute(context, node);

        // Verify
        assertTrue(result.isSuccess());
        assertNotNull(result.getOutput());

        JsonNode output = result.getOutput();
        assertEquals("POST", output.get("method").asText());
        assertEquals("/api/users", output.get("path").asText());
        assertEquals("192.168.1.1", output.get("clientIp").asText());
        assertEquals("req-123", output.get("requestId").asText());
        assertEquals("application/json", output.get("headers").get("Content-Type").asText());
        assertEquals("John Doe", output.get("body").get("name").asText());
        assertEquals("1", output.get("queryParams").get("page").asText());

        // Verify variables were set
        assertNotNull(context.getVariable("request"));
        assertNotNull(context.getVariable("requestBody"));
        assertNotNull(context.getVariable("requestHeaders"));
        assertNotNull(context.getVariable("queryParams"));
    }

    @Test
    void testExecuteWithEmptyInput() throws Exception {
        WorkflowExecutionEntity execution = new WorkflowExecutionEntity();
        execution.inputData = "{}";
        ExecutionContext context = new ExecutionContext(execution);

        WorkflowNodeEntity node = new WorkflowNodeEntity();
        node.type = NodeType.HTTP_START;
        node.name = "HTTP Trigger";

        NodeExecutionResult result = executor.execute(context, node);

        assertTrue(result.isSuccess());
        assertNotNull(result.getOutput());

        // Should have empty objects for missing fields
        JsonNode output = result.getOutput();
        assertTrue(output.get("headers").isEmpty());
        assertTrue(output.get("body").isEmpty());
        assertTrue(output.get("queryParams").isEmpty());
    }

    @Test
    void testExecuteWithNullInput() throws Exception {
        WorkflowExecutionEntity execution = new WorkflowExecutionEntity();
        execution.inputData = null;
        ExecutionContext context = new ExecutionContext(execution);

        WorkflowNodeEntity node = new WorkflowNodeEntity();
        node.type = NodeType.HTTP_START;
        node.name = "HTTP Trigger";

        NodeExecutionResult result = executor.execute(context, node);

        assertTrue(result.isSuccess());
        assertNotNull(result.getOutput());
    }

    @Test
    void testExecuteWithPathParams() throws Exception {
        WorkflowExecutionEntity execution = new WorkflowExecutionEntity();
        ObjectNode inputData = objectMapper.createObjectNode();
        inputData.put("method", "GET");
        inputData.put("path", "/api/users/123");

        ObjectNode pathParams = objectMapper.createObjectNode();
        pathParams.put("userId", "123");
        inputData.set("pathParams", pathParams);

        execution.inputData = objectMapper.writeValueAsString(inputData);
        ExecutionContext context = new ExecutionContext(execution);

        WorkflowNodeEntity node = new WorkflowNodeEntity();
        node.type = NodeType.HTTP_START;
        node.name = "HTTP Trigger";

        NodeExecutionResult result = executor.execute(context, node);

        assertTrue(result.isSuccess());
        assertEquals("123", result.getOutput().get("pathParams").get("userId").asText());
    }

    @Test
    void testExecuteWithQueryAsAlternateKey() throws Exception {
        // Test that "query" key is also accepted as alternative to "queryParams"
        WorkflowExecutionEntity execution = new WorkflowExecutionEntity();
        ObjectNode inputData = objectMapper.createObjectNode();
        inputData.put("method", "GET");

        ObjectNode query = objectMapper.createObjectNode();
        query.put("search", "test");
        inputData.set("query", query);

        execution.inputData = objectMapper.writeValueAsString(inputData);
        ExecutionContext context = new ExecutionContext(execution);

        WorkflowNodeEntity node = new WorkflowNodeEntity();
        node.type = NodeType.HTTP_START;
        node.name = "HTTP Trigger";

        NodeExecutionResult result = executor.execute(context, node);

        assertTrue(result.isSuccess());
        assertEquals("test", result.getOutput().get("queryParams").get("search").asText());
    }
}
