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

class McpNodeExecutorTest {

    private McpNodeExecutor executor;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        executor = new McpNodeExecutor();
    }

    @Test
    void returnsCorrectNodeType() {
        assertEquals(NodeType.MCP, executor.getType());
    }

    @Test
    void passesInputThroughWithTriggerMetadata() throws Exception {
        ObjectNode input = objectMapper.createObjectNode();
        input.put("event", "tool_called");
        input.put("tool", "get_weather");

        WorkflowNodeEntity node = createNode("mcp-server");
        ExecutionContext ctx = contextWithInput(objectMapper.writeValueAsString(input));

        NodeExecutionResult result = executor.execute(ctx, node);

        assertTrue(result.isSuccess());
        JsonNode output = result.getOutput();
        assertEquals("tool_called", output.get("event").asText());
        assertEquals("get_weather", output.get("tool").asText());
        assertEquals("mcp", output.get("triggerType").asText());
        assertEquals(node.id.toString(), output.get("nodeId").asText());
    }

    @Test
    void setsMcpEventContextVariable() throws Exception {
        ObjectNode input = objectMapper.createObjectNode();
        input.put("data", "test");

        ExecutionContext ctx = contextWithInput(objectMapper.writeValueAsString(input));
        WorkflowNodeEntity node = createNode("mcp-node");

        executor.execute(ctx, node);

        JsonNode mcpEvent = ctx.getVariable("mcpEvent");
        assertNotNull(mcpEvent);
        assertEquals("test", mcpEvent.get("data").asText());
    }

    @Test
    void handlesNullInput() throws Exception {
        ExecutionContext ctx = contextWithInput("{}");
        WorkflowNodeEntity node = createNode("mcp-null");

        NodeExecutionResult result = executor.execute(ctx, node);

        assertTrue(result.isSuccess());
        assertEquals("mcp", result.getOutput().get("triggerType").asText());
    }

    @Test
    void preservesAllInputFields() throws Exception {
        ObjectNode input = objectMapper.createObjectNode();
        input.put("serverUrl", "http://localhost:3000/mcp");
        input.put("toolCount", 5);
        input.put("connected", true);

        ExecutionContext ctx = contextWithInput(objectMapper.writeValueAsString(input));
        WorkflowNodeEntity node = createNode("mcp-full");

        NodeExecutionResult result = executor.execute(ctx, node);

        assertTrue(result.isSuccess());
        JsonNode output = result.getOutput();
        assertEquals("http://localhost:3000/mcp", output.get("serverUrl").asText());
        assertEquals(5, output.get("toolCount").asInt());
        assertTrue(output.get("connected").asBoolean());
        // Also has the metadata fields
        assertEquals("mcp", output.get("triggerType").asText());
        assertEquals(node.id.toString(), output.get("nodeId").asText());
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private WorkflowNodeEntity createNode(String name) {
        WorkflowNodeEntity node = new WorkflowNodeEntity();
        node.id = UUID.randomUUID();
        node.name = name;
        node.type = NodeType.MCP;
        return node;
    }

    private ExecutionContext contextWithInput(String inputJson) {
        WorkflowExecutionEntity execution = new WorkflowExecutionEntity();
        execution.inputData = inputJson;
        return new ExecutionContext(execution);
    }
}
