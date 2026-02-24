package com.nuraly.workflows.llm.providers;

import com.nuraly.workflows.llm.dto.LlmMessage;
import com.nuraly.workflows.llm.dto.LlmRequest;
import com.nuraly.workflows.llm.dto.ToolDefinition;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
class GeminiProviderTest {

    private GeminiProvider provider;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        provider = new GeminiProvider();
        objectMapper = new ObjectMapper();
    }

    @Test
    void testGetName() {
        assertEquals("gemini", provider.getName());
    }

    @Test
    void testGetDefaultModel() {
        assertEquals("gemini-1.5-pro", provider.getDefaultModel());
    }

    @Test
    void testSupportsModel_ValidModels() {
        assertTrue(provider.supportsModel("gemini-pro"));
        assertTrue(provider.supportsModel("gemini-pro-vision"));
        assertTrue(provider.supportsModel("gemini-ultra"));
        assertTrue(provider.supportsModel("gemini-1.5-pro"));
        assertTrue(provider.supportsModel("gemini-1.5-flash"));
        assertTrue(provider.supportsModel("gemini-2.0-flash-exp"));
    }

    @Test
    void testSupportsModel_UnsupportedModels() {
        assertFalse(provider.supportsModel("gpt-4"));
        assertFalse(provider.supportsModel("claude-3-opus"));
        assertFalse(provider.supportsModel(null));
    }

    @Test
    void testSupportsModel_CustomGeminiModels() {
        // Any model starting with gemini- should be supported
        assertTrue(provider.supportsModel("gemini-future-model"));
        assertTrue(provider.supportsModel("gemini-2.0-ultra"));
    }

    @Test
    void testChatWithInvalidApiKey() {
        LlmRequest request = LlmRequest.builder()
                .model("gemini-1.5-pro")
                .messages(List.of(LlmMessage.user("Hello")))
                .build();

        var response = provider.chat(request, "invalid-api-key");

        assertFalse(response.isSuccess());
        assertNotNull(response.getError());
    }

    @Test
    void testRequestWithSystemInstruction() {
        LlmRequest request = LlmRequest.builder()
                .model("gemini-1.5-pro")
                .messages(List.of(
                        LlmMessage.system("You are a poetry expert."),
                        LlmMessage.user("Write a haiku")
                ))
                .build();

        assertEquals(2, request.getMessages().size());
    }

    @Test
    void testRequestWithTools() {
        ObjectNode params = objectMapper.createObjectNode();
        params.put("type", "object");
        params.set("properties", objectMapper.createObjectNode());

        ToolDefinition tool = ToolDefinition.builder()
                .name("search_database")
                .description("Search a database")
                .parameters(params)
                .build();

        LlmRequest request = LlmRequest.builder()
                .model("gemini-1.5-pro")
                .messages(List.of(LlmMessage.user("Search for users")))
                .tools(List.of(tool))
                .forceToolUse(true)
                .build();

        assertNotNull(request.getTools());
        assertTrue(request.getForceToolUse());
    }

    @Test
    void testRequestWithGenerationConfig() {
        LlmRequest request = LlmRequest.builder()
                .model("gemini-1.5-pro")
                .messages(List.of(LlmMessage.user("Test")))
                .temperature(0.3)
                .maxTokens(500)
                .build();

        assertEquals(0.3, request.getTemperature());
        assertEquals(500, request.getMaxTokens());
    }
}
