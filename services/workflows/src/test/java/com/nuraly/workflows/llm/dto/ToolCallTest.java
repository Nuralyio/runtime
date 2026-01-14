package com.nuraly.workflows.llm.dto;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ToolCallTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void testBasicToolCall() {
        ToolCall toolCall = ToolCall.builder()
                .id("call_abc123")
                .name("get_weather")
                .build();

        assertEquals("call_abc123", toolCall.getId());
        assertEquals("get_weather", toolCall.getName());
        assertNull(toolCall.getArguments());
    }

    @Test
    void testToolCallWithArguments() {
        ObjectNode arguments = objectMapper.createObjectNode();
        arguments.put("location", "San Francisco, CA");
        arguments.put("unit", "celsius");

        ToolCall toolCall = ToolCall.builder()
                .id("call_xyz789")
                .name("get_weather")
                .arguments(arguments)
                .build();

        assertNotNull(toolCall.getArguments());
        assertEquals("San Francisco, CA", toolCall.getArguments().get("location").asText());
        assertEquals("celsius", toolCall.getArguments().get("unit").asText());
    }

    @Test
    void testToolCallEquality() {
        ObjectNode args1 = objectMapper.createObjectNode();
        args1.put("param", "value");

        ObjectNode args2 = objectMapper.createObjectNode();
        args2.put("param", "value");

        ToolCall toolCall1 = ToolCall.builder()
                .id("call_123")
                .name("test_tool")
                .arguments(args1)
                .build();

        ToolCall toolCall2 = ToolCall.builder()
                .id("call_123")
                .name("test_tool")
                .arguments(args2)
                .build();

        // With Lombok @Data, equals uses all fields
        assertEquals(toolCall1, toolCall2);
    }

    @Test
    void testToolCallSetters() {
        ToolCall toolCall = new ToolCall();
        ObjectNode args = objectMapper.createObjectNode();
        args.put("key", "value");

        toolCall.setId("new_id");
        toolCall.setName("new_name");
        toolCall.setArguments(args);

        assertEquals("new_id", toolCall.getId());
        assertEquals("new_name", toolCall.getName());
        assertEquals("value", toolCall.getArguments().get("key").asText());
    }
}
