package com.nuraly.workflows.llm.providers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.llm.dto.LlmMessage;
import com.nuraly.workflows.llm.dto.LlmRequest;
import com.nuraly.workflows.llm.dto.ToolCall;
import com.nuraly.workflows.llm.dto.ToolDefinition;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class AnthropicProviderUnitTest {

    private AnthropicProvider provider;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        provider = new AnthropicProvider();
        objectMapper = new ObjectMapper();
    }

    @Test
    void getName() {
        assertEquals("anthropic", provider.getName());
    }

    @Test
    void getDefaultModel() {
        assertEquals("claude-sonnet-4-20250514", provider.getDefaultModel());
    }

    @Test
    void supportsModel() {
        assertTrue(provider.supportsModel("claude-3-opus-20240229"));
        assertTrue(provider.supportsModel("claude-sonnet-4-20250514"));
        assertTrue(provider.supportsModel("claude-any-future"));
        assertFalse(provider.supportsModel("gpt-4"));
        assertFalse(provider.supportsModel(null));
    }

    @Test
    void supportsStructuredOutputDefaultTrue() {
        assertTrue(provider.supportsStructuredOutput("claude-3-opus-20240229"));
        assertTrue(provider.supportsStructuredOutput("claude-sonnet-4-20250514"));
    }

    @Test
    void chatWithInvalidApiKey() {
        LlmRequest request = LlmRequest.builder()
                .model("claude-sonnet-4-20250514")
                .messages(List.of(LlmMessage.user("Hello")))
                .build();

        var response = provider.chat(request, "invalid-key");
        assertFalse(response.isSuccess());
        assertNotNull(response.getError());
    }

    @Test
    void chatWithSystemMessage() {
        LlmRequest request = LlmRequest.builder()
                .model("claude-sonnet-4-20250514")
                .messages(List.of(
                        LlmMessage.system("You are helpful"),
                        LlmMessage.user("Hi")
                ))
                .build();

        var response = provider.chat(request, "invalid-key");
        assertNotNull(response);
    }

    @Test
    void chatWithTools() {
        ObjectNode params = objectMapper.createObjectNode();
        params.put("type", "object");
        params.set("properties", objectMapper.createObjectNode());

        ToolDefinition tool = ToolDefinition.builder()
                .name("search")
                .description("Search the web")
                .parameters(params)
                .build();

        LlmRequest request = LlmRequest.builder()
                .model("claude-sonnet-4-20250514")
                .messages(List.of(LlmMessage.user("Search for cats")))
                .tools(List.of(tool))
                .forceToolUse(true)
                .build();

        var response = provider.chat(request, "invalid-key");
        assertNotNull(response);
    }

    @Test
    void chatWithToolCallsInHistory() {
        ToolCall tc = ToolCall.builder()
                .id("call-1")
                .name("search")
                .arguments(objectMapper.createObjectNode().put("q", "cats"))
                .build();

        LlmRequest request = LlmRequest.builder()
                .model("claude-sonnet-4-20250514")
                .messages(List.of(
                        LlmMessage.user("Search for cats"),
                        LlmMessage.assistantWithTools(List.of(tc)),
                        LlmMessage.tool("call-1", "search", "{\"results\": []}"),
                        LlmMessage.user("What did you find?")
                ))
                .build();

        var response = provider.chat(request, "invalid-key");
        assertNotNull(response);
    }

    @Test
    void chatWithStructuredOutput() {
        ObjectNode responseFormat = objectMapper.createObjectNode();
        ObjectNode jsonSchema = objectMapper.createObjectNode();
        ObjectNode schema = objectMapper.createObjectNode();
        schema.put("type", "object");
        schema.putObject("properties").putObject("name").put("type", "string");
        jsonSchema.set("schema", schema);
        jsonSchema.put("name", "test_output");
        responseFormat.set("json_schema", jsonSchema);

        LlmRequest request = LlmRequest.builder()
                .model("claude-sonnet-4-20250514")
                .messages(List.of(LlmMessage.user("Give me data")))
                .responseFormat(responseFormat)
                .build();

        var response = provider.chat(request, "invalid-key");
        assertNotNull(response);
    }

    @Test
    void chatWithTemperatureAndMaxTokens() {
        LlmRequest request = LlmRequest.builder()
                .model("claude-sonnet-4-20250514")
                .messages(List.of(LlmMessage.user("Hello")))
                .temperature(0.5)
                .maxTokens(100)
                .build();

        var response = provider.chat(request, "invalid-key");
        assertNotNull(response);
    }

    @Test
    void chatWithNullToolParameters() {
        ToolDefinition tool = ToolDefinition.builder()
                .name("simple_tool")
                .description("A simple tool")
                .parameters(null)
                .build();

        LlmRequest request = LlmRequest.builder()
                .model("claude-sonnet-4-20250514")
                .messages(List.of(LlmMessage.user("test")))
                .tools(List.of(tool))
                .build();

        var response = provider.chat(request, "invalid-key");
        assertNotNull(response);
    }
}
