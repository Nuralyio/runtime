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

class GeminiProviderUnitTest {

    private GeminiProvider provider;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        provider = new GeminiProvider();
        objectMapper = new ObjectMapper();
    }

    @Test
    void getName() {
        assertEquals("gemini", provider.getName());
    }

    @Test
    void getDefaultModel() {
        assertEquals("gemini-1.5-pro", provider.getDefaultModel());
    }

    @Test
    void supportsModel() {
        assertTrue(provider.supportsModel("gemini-pro"));
        assertTrue(provider.supportsModel("gemini-1.5-pro"));
        assertTrue(provider.supportsModel("gemini-2.0-flash-exp"));
        assertTrue(provider.supportsModel("gemini-future"));
        assertFalse(provider.supportsModel("gpt-4"));
        assertFalse(provider.supportsModel(null));
    }

    @Test
    void supportsStructuredOutputDefaultTrue() {
        assertTrue(provider.supportsStructuredOutput("gemini-1.5-pro"));
        assertTrue(provider.supportsStructuredOutput("gemini-pro"));
    }

    @Test
    void chatWithInvalidApiKey() {
        LlmRequest request = LlmRequest.builder()
                .model("gemini-1.5-pro")
                .messages(List.of(LlmMessage.user("Hello")))
                .build();

        var response = provider.chat(request, "invalid-key");
        assertNotNull(response);
        assertFalse(response.isSuccess());
    }

    @Test
    void chatWithSystemInstruction() {
        LlmRequest request = LlmRequest.builder()
                .model("gemini-1.5-pro")
                .messages(List.of(
                        LlmMessage.system("You are helpful"),
                        LlmMessage.user("Hi")
                ))
                .build();

        var response = provider.chat(request, "invalid-key");
        assertNotNull(response);
    }

    @Test
    void chatWithSystemPromptField() {
        LlmRequest request = LlmRequest.builder()
                .model("gemini-1.5-pro")
                .messages(List.of(LlmMessage.user("Hi")))
                .systemPrompt("You are helpful")
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
                .model("gemini-1.5-pro")
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
                .model("gemini-1.5-pro")
                .messages(List.of(
                        LlmMessage.user("Search for cats"),
                        LlmMessage.assistantWithTools(List.of(tc)),
                        LlmMessage.toolResult("call-1", "search", "{\"results\": []}"),
                        LlmMessage.user("What did you find?")
                ))
                .build();

        var response = provider.chat(request, "invalid-key");
        assertNotNull(response);
    }

    @Test
    void chatWithGenerationConfig() {
        LlmRequest request = LlmRequest.builder()
                .model("gemini-1.5-pro")
                .messages(List.of(LlmMessage.user("Hello")))
                .temperature(0.5)
                .maxTokens(100)
                .build();

        var response = provider.chat(request, "invalid-key");
        assertNotNull(response);
    }

    @Test
    void chatWithResponseFormat() {
        ObjectNode responseFormat = objectMapper.createObjectNode();
        ObjectNode jsonSchema = objectMapper.createObjectNode();
        ObjectNode schema = objectMapper.createObjectNode();
        schema.put("type", "object");
        schema.putObject("properties").putObject("name").put("type", "string");
        jsonSchema.set("schema", schema);
        responseFormat.set("json_schema", jsonSchema);

        LlmRequest request = LlmRequest.builder()
                .model("gemini-1.5-pro")
                .messages(List.of(LlmMessage.user("Give me data")))
                .responseFormat(responseFormat)
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
                .model("gemini-1.5-pro")
                .messages(List.of(LlmMessage.user("test")))
                .tools(List.of(tool))
                .build();

        var response = provider.chat(request, "invalid-key");
        assertNotNull(response);
    }
}
