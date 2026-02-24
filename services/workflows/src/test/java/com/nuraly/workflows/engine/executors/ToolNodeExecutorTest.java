package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
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

class ToolNodeExecutorTest {

    private ToolNodeExecutor executor;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        executor = new ToolNodeExecutor();
        objectMapper = new ObjectMapper();
    }

    private ExecutionContext emptyContext() {
        WorkflowExecutionEntity execution = new WorkflowExecutionEntity();
        execution.inputData = "{}";
        return new ExecutionContext(execution);
    }

    private WorkflowNodeEntity toolNode(String configuration) {
        WorkflowNodeEntity node = new WorkflowNodeEntity();
        node.id = UUID.randomUUID();
        node.name = "test-tool";
        node.type = NodeType.TOOL;
        node.configuration = configuration;
        return node;
    }

    @Test
    void getType() {
        assertEquals(NodeType.TOOL, executor.getType());
    }

    @Test
    void missingConfigReturnsFailure() throws Exception {
        NodeExecutionResult result = executor.execute(emptyContext(), toolNode(null));

        assertFalse(result.isSuccess());
        assertTrue(result.getErrorMessage().contains("configuration is missing"));
    }

    @Test
    void missingToolNameReturnsFailure() throws Exception {
        String config = objectMapper.writeValueAsString(
                objectMapper.createObjectNode().put("description", "no name"));

        NodeExecutionResult result = executor.execute(emptyContext(), toolNode(config));

        assertFalse(result.isSuccess());
        assertTrue(result.getErrorMessage().contains("Tool name is required"));
    }

    @Test
    void basicToolDefinition() throws Exception {
        ObjectNode config = objectMapper.createObjectNode();
        config.put("toolName", "get_weather");
        config.put("description", "Get weather for a location");

        NodeExecutionResult result = executor.execute(emptyContext(),
                toolNode(objectMapper.writeValueAsString(config)));

        assertTrue(result.isSuccess());
        JsonNode output = result.getOutput();
        assertEquals("function", output.get("type").asText());
        assertEquals("get_weather", output.get("function").get("name").asText());
        assertEquals("Get weather for a location", output.get("function").get("description").asText());
        assertNotNull(output.get("function").get("parameters"));
    }

    @Test
    void parameterTypeString() throws Exception {
        ObjectNode config = objectMapper.createObjectNode();
        config.put("toolName", "t");
        ArrayNode params = config.putArray("parameters");
        params.addObject().put("name", "city").put("type", "string");

        NodeExecutionResult result = executor.execute(emptyContext(),
                toolNode(objectMapper.writeValueAsString(config)));

        assertTrue(result.isSuccess());
        JsonNode props = result.getOutput().get("function").get("parameters").get("properties");
        assertEquals("string", props.get("city").get("type").asText());
    }

    @Test
    void parameterTypeNumber() throws Exception {
        for (String type : new String[]{"number", "integer", "int"}) {
            ObjectNode config = objectMapper.createObjectNode();
            config.put("toolName", "t");
            ArrayNode params = config.putArray("parameters");
            params.addObject().put("name", "val").put("type", type);

            NodeExecutionResult result = executor.execute(emptyContext(),
                    toolNode(objectMapper.writeValueAsString(config)));

            assertTrue(result.isSuccess());
            JsonNode props = result.getOutput().get("function").get("parameters").get("properties");
            assertEquals("number", props.get("val").get("type").asText(),
                    "type '" + type + "' should map to 'number'");
        }
    }

    @Test
    void parameterTypeBoolean() throws Exception {
        for (String type : new String[]{"boolean", "bool"}) {
            ObjectNode config = objectMapper.createObjectNode();
            config.put("toolName", "t");
            ArrayNode params = config.putArray("parameters");
            params.addObject().put("name", "flag").put("type", type);

            NodeExecutionResult result = executor.execute(emptyContext(),
                    toolNode(objectMapper.writeValueAsString(config)));

            assertTrue(result.isSuccess());
            JsonNode props = result.getOutput().get("function").get("parameters").get("properties");
            assertEquals("boolean", props.get("flag").get("type").asText(),
                    "type '" + type + "' should map to 'boolean'");
        }
    }

    @Test
    void parameterTypeArray() throws Exception {
        for (String type : new String[]{"array", "list"}) {
            ObjectNode config = objectMapper.createObjectNode();
            config.put("toolName", "t");
            ArrayNode params = config.putArray("parameters");
            params.addObject().put("name", "items").put("type", type);

            NodeExecutionResult result = executor.execute(emptyContext(),
                    toolNode(objectMapper.writeValueAsString(config)));

            assertTrue(result.isSuccess());
            JsonNode props = result.getOutput().get("function").get("parameters").get("properties");
            assertEquals("array", props.get("items").get("type").asText(),
                    "type '" + type + "' should map to 'array'");
        }
    }

    @Test
    void parameterTypeObject() throws Exception {
        for (String type : new String[]{"object", "map"}) {
            ObjectNode config = objectMapper.createObjectNode();
            config.put("toolName", "t");
            ArrayNode params = config.putArray("parameters");
            params.addObject().put("name", "data").put("type", type);

            NodeExecutionResult result = executor.execute(emptyContext(),
                    toolNode(objectMapper.writeValueAsString(config)));

            assertTrue(result.isSuccess());
            JsonNode props = result.getOutput().get("function").get("parameters").get("properties");
            assertEquals("object", props.get("data").get("type").asText(),
                    "type '" + type + "' should map to 'object'");
        }
    }

    @Test
    void requiredParametersInSchema() throws Exception {
        ObjectNode config = objectMapper.createObjectNode();
        config.put("toolName", "t");
        ArrayNode params = config.putArray("parameters");
        params.addObject().put("name", "location").put("type", "string").put("required", true);
        params.addObject().put("name", "units").put("type", "string").put("required", false);

        NodeExecutionResult result = executor.execute(emptyContext(),
                toolNode(objectMapper.writeValueAsString(config)));

        assertTrue(result.isSuccess());
        JsonNode schema = result.getOutput().get("function").get("parameters");
        assertTrue(schema.has("required"));
        JsonNode required = schema.get("required");
        assertEquals(1, required.size());
        assertEquals("location", required.get(0).asText());
    }

    @Test
    void nodeIdIncludedInOutput() throws Exception {
        ObjectNode config = objectMapper.createObjectNode();
        config.put("toolName", "search");

        WorkflowNodeEntity node = toolNode(objectMapper.writeValueAsString(config));
        NodeExecutionResult result = executor.execute(emptyContext(), node);

        assertTrue(result.isSuccess());
        assertEquals(node.id.toString(), result.getOutput().get("nodeId").asText());
    }
}
