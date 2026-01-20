package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.entity.WorkflowEntity;
import com.nuraly.workflows.entity.WorkflowExecutionEntity;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
class HttpEndNodeExecutorTest {

    private HttpEndNodeExecutor executor;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        executor = new HttpEndNodeExecutor();
        objectMapper = new ObjectMapper();
    }

    @Test
    void testGetType() {
        assertEquals(NodeType.HTTP_END, executor.getType());
    }

    @Test
    void testExecuteWithDefaultConfig() throws Exception {
        WorkflowEntity workflow = new WorkflowEntity();
        workflow.id = UUID.randomUUID();

        WorkflowExecutionEntity execution = new WorkflowExecutionEntity();
        execution.id = UUID.randomUUID();
        execution.workflow = workflow;

        ObjectNode inputData = objectMapper.createObjectNode();
        inputData.put("result", "success");
        inputData.put("data", "Hello World");
        execution.inputData = objectMapper.writeValueAsString(inputData);

        ExecutionContext context = new ExecutionContext(execution);

        WorkflowNodeEntity node = new WorkflowNodeEntity();
        node.type = NodeType.HTTP_END;
        node.name = "HTTP Response";
        node.configuration = null;

        NodeExecutionResult result = executor.execute(context, node);

        assertTrue(result.isSuccess());
        assertNotNull(result.getOutput());

        JsonNode output = result.getOutput();
        assertEquals(200, output.get("statusCode").asInt());
        assertEquals("application/json", output.get("contentType").asText());
        assertNotNull(output.get("body"));
        assertNotNull(output.get("_metadata"));
    }

    @Test
    void testExecuteWithCustomStatusCode() throws Exception {
        WorkflowEntity workflow = new WorkflowEntity();
        workflow.id = UUID.randomUUID();

        WorkflowExecutionEntity execution = new WorkflowExecutionEntity();
        execution.id = UUID.randomUUID();
        execution.workflow = workflow;
        execution.inputData = "{}";

        ExecutionContext context = new ExecutionContext(execution);

        ObjectNode config = objectMapper.createObjectNode();
        config.put("httpStatusCode", 201);

        WorkflowNodeEntity node = new WorkflowNodeEntity();
        node.type = NodeType.HTTP_END;
        node.name = "HTTP Response";
        node.configuration = objectMapper.writeValueAsString(config);

        NodeExecutionResult result = executor.execute(context, node);

        assertTrue(result.isSuccess());
        assertEquals(201, result.getOutput().get("statusCode").asInt());
    }

    @Test
    void testExecuteWithCustomHeaders() throws Exception {
        WorkflowEntity workflow = new WorkflowEntity();
        workflow.id = UUID.randomUUID();

        WorkflowExecutionEntity execution = new WorkflowExecutionEntity();
        execution.id = UUID.randomUUID();
        execution.workflow = workflow;
        execution.inputData = "{}";

        ExecutionContext context = new ExecutionContext(execution);

        ObjectNode config = objectMapper.createObjectNode();
        ObjectNode headers = objectMapper.createObjectNode();
        headers.put("X-Custom-Header", "custom-value");
        headers.put("Cache-Control", "no-cache");
        config.set("httpResponseHeaders", headers);

        WorkflowNodeEntity node = new WorkflowNodeEntity();
        node.type = NodeType.HTTP_END;
        node.name = "HTTP Response";
        node.configuration = objectMapper.writeValueAsString(config);

        NodeExecutionResult result = executor.execute(context, node);

        assertTrue(result.isSuccess());
        JsonNode responseHeaders = result.getOutput().get("headers");
        assertEquals("custom-value", responseHeaders.get("X-Custom-Header").asText());
        assertEquals("no-cache", responseHeaders.get("Cache-Control").asText());
    }

    @Test
    void testExecuteWithCustomContentType() throws Exception {
        WorkflowEntity workflow = new WorkflowEntity();
        workflow.id = UUID.randomUUID();

        WorkflowExecutionEntity execution = new WorkflowExecutionEntity();
        execution.id = UUID.randomUUID();
        execution.workflow = workflow;
        execution.inputData = "{}";

        ExecutionContext context = new ExecutionContext(execution);

        ObjectNode config = objectMapper.createObjectNode();
        config.put("httpContentType", "text/plain");

        WorkflowNodeEntity node = new WorkflowNodeEntity();
        node.type = NodeType.HTTP_END;
        node.name = "HTTP Response";
        node.configuration = objectMapper.writeValueAsString(config);

        NodeExecutionResult result = executor.execute(context, node);

        assertTrue(result.isSuccess());
        assertEquals("text/plain", result.getOutput().get("contentType").asText());
    }

    @Test
    void testExecuteWithDataBodyTemplate() throws Exception {
        WorkflowEntity workflow = new WorkflowEntity();
        workflow.id = UUID.randomUUID();

        WorkflowExecutionEntity execution = new WorkflowExecutionEntity();
        execution.id = UUID.randomUUID();
        execution.workflow = workflow;

        ObjectNode inputData = objectMapper.createObjectNode();
        inputData.put("userId", "123");
        inputData.put("userName", "John");
        execution.inputData = objectMapper.writeValueAsString(inputData);

        ExecutionContext context = new ExecutionContext(execution);

        ObjectNode config = objectMapper.createObjectNode();
        config.put("httpResponseBody", "{{data}}");

        WorkflowNodeEntity node = new WorkflowNodeEntity();
        node.type = NodeType.HTTP_END;
        node.name = "HTTP Response";
        node.configuration = objectMapper.writeValueAsString(config);

        NodeExecutionResult result = executor.execute(context, node);

        assertTrue(result.isSuccess());
        JsonNode body = result.getOutput().get("body");
        assertEquals("123", body.get("userId").asText());
        assertEquals("John", body.get("userName").asText());
    }

    @Test
    void testExecuteWithVariablesBodyTemplate() throws Exception {
        WorkflowEntity workflow = new WorkflowEntity();
        workflow.id = UUID.randomUUID();

        WorkflowExecutionEntity execution = new WorkflowExecutionEntity();
        execution.id = UUID.randomUUID();
        execution.workflow = workflow;
        execution.inputData = "{}";
        execution.variables = "{\"result\": \"processed\", \"count\": 42}";

        ExecutionContext context = new ExecutionContext(execution);

        ObjectNode config = objectMapper.createObjectNode();
        config.put("httpResponseBody", "{{variables}}");

        WorkflowNodeEntity node = new WorkflowNodeEntity();
        node.type = NodeType.HTTP_END;
        node.name = "HTTP Response";
        node.configuration = objectMapper.writeValueAsString(config);

        NodeExecutionResult result = executor.execute(context, node);

        assertTrue(result.isSuccess());
        JsonNode body = result.getOutput().get("body");
        assertEquals("processed", body.get("result").asText());
        assertEquals(42, body.get("count").asInt());
    }

    @Test
    void testExecuteWithFullConfig() throws Exception {
        WorkflowEntity workflow = new WorkflowEntity();
        workflow.id = UUID.randomUUID();

        WorkflowExecutionEntity execution = new WorkflowExecutionEntity();
        execution.id = UUID.randomUUID();
        execution.workflow = workflow;
        execution.inputData = "{\"message\": \"Hello\"}";

        ExecutionContext context = new ExecutionContext(execution);

        ObjectNode config = objectMapper.createObjectNode();
        config.put("httpStatusCode", 202);
        config.put("httpContentType", "application/json");
        config.put("httpResponseBody", "{{data}}");

        ObjectNode headers = objectMapper.createObjectNode();
        headers.put("X-Request-Id", "req-456");
        config.set("httpResponseHeaders", headers);

        WorkflowNodeEntity node = new WorkflowNodeEntity();
        node.type = NodeType.HTTP_END;
        node.name = "HTTP Response";
        node.configuration = objectMapper.writeValueAsString(config);

        NodeExecutionResult result = executor.execute(context, node);

        assertTrue(result.isSuccess());
        JsonNode output = result.getOutput();
        assertEquals(202, output.get("statusCode").asInt());
        assertEquals("application/json", output.get("contentType").asText());
        assertEquals("Hello", output.get("body").get("message").asText());
        assertEquals("req-456", output.get("headers").get("X-Request-Id").asText());
    }

    @Test
    void testExecuteStoresHttpResponseInVariables() throws Exception {
        WorkflowEntity workflow = new WorkflowEntity();
        workflow.id = UUID.randomUUID();

        WorkflowExecutionEntity execution = new WorkflowExecutionEntity();
        execution.id = UUID.randomUUID();
        execution.workflow = workflow;
        execution.inputData = "{}";

        ExecutionContext context = new ExecutionContext(execution);

        WorkflowNodeEntity node = new WorkflowNodeEntity();
        node.type = NodeType.HTTP_END;
        node.name = "HTTP Response";
        node.configuration = "{}";

        executor.execute(context, node);

        // Verify httpResponse variable was set
        assertNotNull(context.getVariable("httpResponse"));
    }
}
