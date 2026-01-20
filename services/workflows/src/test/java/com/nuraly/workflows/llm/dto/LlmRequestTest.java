package com.nuraly.workflows.llm.dto;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class LlmRequestTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void testBasicRequest() {
        LlmRequest request = LlmRequest.builder()
                .model("gpt-4o")
                .messages(List.of(
                        LlmMessage.system("You are helpful."),
                        LlmMessage.user("Hello!")
                ))
                .build();

        assertEquals("gpt-4o", request.getModel());
        assertEquals(2, request.getMessages().size());
        assertEquals(0.7, request.getTemperature()); // Default value
        assertFalse(request.getForceToolUse()); // Default value
    }

    @Test
    void testRequestWithTools() {
        ObjectNode parameters = objectMapper.createObjectNode();
        parameters.put("type", "object");
        ObjectNode properties = objectMapper.createObjectNode();
        ObjectNode locationProp = objectMapper.createObjectNode();
        locationProp.put("type", "string");
        properties.set("location", locationProp);
        parameters.set("properties", properties);

        ToolDefinition tool = ToolDefinition.builder()
                .name("get_weather")
                .description("Get weather for a location")
                .parameters(parameters)
                .build();

        LlmRequest request = LlmRequest.builder()
                .model("gpt-4o")
                .messages(List.of(LlmMessage.user("What's the weather?")))
                .tools(List.of(tool))
                .forceToolUse(true)
                .build();

        assertNotNull(request.getTools());
        assertEquals(1, request.getTools().size());
        assertEquals("get_weather", request.getTools().get(0).getName());
        assertTrue(request.getForceToolUse());
    }

    @Test
    void testRequestWithCustomSettings() {
        LlmRequest request = LlmRequest.builder()
                .model("claude-3-opus")
                .messages(List.of(LlmMessage.user("Test")))
                .temperature(0.5)
                .maxTokens(1000)
                .systemPrompt("Be concise.")
                .build();

        assertEquals("claude-3-opus", request.getModel());
        assertEquals(0.5, request.getTemperature());
        assertEquals(1000, request.getMaxTokens());
        assertEquals("Be concise.", request.getSystemPrompt());
    }

    @Test
    void testEmptyMessagesAllowed() {
        LlmRequest request = LlmRequest.builder()
                .model("gpt-4o")
                .messages(List.of())
                .build();

        assertNotNull(request.getMessages());
        assertTrue(request.getMessages().isEmpty());
    }
}
