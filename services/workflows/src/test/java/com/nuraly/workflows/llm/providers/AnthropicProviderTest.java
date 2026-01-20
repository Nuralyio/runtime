package com.nuraly.workflows.llm.providers;

import com.nuraly.workflows.llm.dto.LlmMessage;
import com.nuraly.workflows.llm.dto.LlmRequest;
import com.nuraly.workflows.llm.dto.ToolCall;
import com.nuraly.workflows.llm.dto.ToolDefinition;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
class AnthropicProviderTest {

    private AnthropicProvider provider;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        provider = new AnthropicProvider();
        objectMapper = new ObjectMapper();
    }

    @Test
    void testGetName() {
        assertEquals("anthropic", provider.getName());
    }

    @Test
    void testGetDefaultModel() {
        assertEquals("claude-sonnet-4-20250514", provider.getDefaultModel());
    }

    @Test
    void testSupportsModel_ValidModels() {
        assertTrue(provider.supportsModel("claude-3-opus-20240229"));
        assertTrue(provider.supportsModel("claude-3-sonnet-20240229"));
        assertTrue(provider.supportsModel("claude-3-haiku-20240307"));
        assertTrue(provider.supportsModel("claude-3-5-sonnet-20241022"));
        assertTrue(provider.supportsModel("claude-sonnet-4-20250514"));
    }

    @Test
    void testSupportsModel_UnsupportedModels() {
        assertFalse(provider.supportsModel("gpt-4"));
        assertFalse(provider.supportsModel("gemini-pro"));
        assertFalse(provider.supportsModel(null));
    }

    @Test
    void testSupportsModel_CustomClaudeModels() {
        // Any model starting with claude- should be supported
        assertTrue(provider.supportsModel("claude-4-future"));
        assertTrue(provider.supportsModel("claude-custom-version"));
    }

    @Test
    void testChatWithInvalidApiKey() {
        LlmRequest request = LlmRequest.builder()
                .model("claude-sonnet-4-20250514")
                .messages(List.of(LlmMessage.user("Hello")))
                .build();

        var response = provider.chat(request, "invalid-api-key");

        assertFalse(response.isSuccess());
        assertNotNull(response.getError());
    }

    @Test
    void testRequestWithSystemMessage() {
        LlmRequest request = LlmRequest.builder()
                .model("claude-sonnet-4-20250514")
                .messages(List.of(
                        LlmMessage.system("You are a helpful assistant."),
                        LlmMessage.user("Hi!")
                ))
                .build();

        assertNotNull(request);
        assertEquals(2, request.getMessages().size());
    }

    @Test
    void testRequestWithToolCalls() {
        ObjectNode args = objectMapper.createObjectNode();
        args.put("location", "Tokyo");

        ToolCall toolCall = ToolCall.builder()
                .id("toolu_123")
                .name("get_weather")
                .arguments(args)
                .build();

        // Create assistant message with tool calls
        LlmMessage assistantMsg = LlmMessage.assistantWithTools(List.of(toolCall));

        // Create tool result
        LlmMessage toolResult = LlmMessage.toolResult("toolu_123", "get_weather", "{\"temp\": 20}");

        LlmRequest request = LlmRequest.builder()
                .model("claude-sonnet-4-20250514")
                .messages(List.of(
                        LlmMessage.user("What's the weather in Tokyo?"),
                        assistantMsg,
                        toolResult
                ))
                .build();

        assertEquals(3, request.getMessages().size());
    }

    @Test
    void testRequestWithTools() {
        ObjectNode params = objectMapper.createObjectNode();
        params.put("type", "object");

        ObjectNode properties = objectMapper.createObjectNode();
        ObjectNode locationProp = objectMapper.createObjectNode();
        locationProp.put("type", "string");
        properties.set("location", locationProp);
        params.set("properties", properties);

        ToolDefinition tool = ToolDefinition.builder()
                .name("get_weather")
                .description("Get weather for a location")
                .parameters(params)
                .build();

        LlmRequest request = LlmRequest.builder()
                .model("claude-sonnet-4-20250514")
                .messages(List.of(LlmMessage.user("Weather in Paris?")))
                .tools(List.of(tool))
                .build();

        assertNotNull(request.getTools());
        assertEquals(1, request.getTools().size());
    }
}
