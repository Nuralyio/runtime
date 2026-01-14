package com.nuraly.workflows.llm.dto;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class ToolDefinitionTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void testBasicToolDefinition() {
        ToolDefinition tool = ToolDefinition.builder()
                .name("get_weather")
                .description("Get the current weather for a location")
                .build();

        assertEquals("get_weather", tool.getName());
        assertEquals("Get the current weather for a location", tool.getDescription());
        assertNull(tool.getParameters());
        assertNull(tool.getNodeId());
    }

    @Test
    void testToolWithParameters() {
        ObjectNode parameters = objectMapper.createObjectNode();
        parameters.put("type", "object");

        ObjectNode properties = objectMapper.createObjectNode();
        ObjectNode locationProp = objectMapper.createObjectNode();
        locationProp.put("type", "string");
        locationProp.put("description", "The city and state");
        properties.set("location", locationProp);

        parameters.set("properties", properties);
        parameters.set("required", objectMapper.createArrayNode().add("location"));

        ToolDefinition tool = ToolDefinition.builder()
                .name("get_weather")
                .description("Get weather")
                .parameters(parameters)
                .build();

        assertNotNull(tool.getParameters());
        assertEquals("object", tool.getParameters().get("type").asText());
        assertTrue(tool.getParameters().has("properties"));
    }

    @Test
    void testToolWithNodeMapping() {
        UUID nodeId = UUID.randomUUID();

        ToolDefinition tool = ToolDefinition.builder()
                .name("execute_function")
                .description("Execute a workflow function")
                .nodeId(nodeId)
                .sourcePortId("tool_function")
                .build();

        assertEquals(nodeId, tool.getNodeId());
        assertEquals("tool_function", tool.getSourcePortId());
    }

    @Test
    void testToolSetters() {
        ToolDefinition tool = new ToolDefinition();
        UUID nodeId = UUID.randomUUID();

        tool.setName("test_tool");
        tool.setDescription("A test tool");
        tool.setNodeId(nodeId);

        assertEquals("test_tool", tool.getName());
        assertEquals("A test tool", tool.getDescription());
        assertEquals(nodeId, tool.getNodeId());
    }
}
