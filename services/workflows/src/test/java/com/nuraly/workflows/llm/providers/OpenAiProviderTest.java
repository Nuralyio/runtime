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
class OpenAiProviderTest {

    private OpenAiProvider provider;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        provider = new OpenAiProvider();
        objectMapper = new ObjectMapper();
    }

    @Test
    void testGetName() {
        assertEquals("openai", provider.getName());
    }

    @Test
    void testGetDefaultModel() {
        assertEquals("gpt-4o", provider.getDefaultModel());
    }

    @Test
    void testSupportsModel_ValidModels() {
        assertTrue(provider.supportsModel("gpt-4"));
        assertTrue(provider.supportsModel("gpt-4o"));
        assertTrue(provider.supportsModel("gpt-4o-mini"));
        assertTrue(provider.supportsModel("gpt-4-turbo"));
        assertTrue(provider.supportsModel("gpt-3.5-turbo"));
        assertTrue(provider.supportsModel("gpt-3.5-turbo-16k"));
    }

    @Test
    void testSupportsModel_UnsupportedModels() {
        assertFalse(provider.supportsModel("claude-3-opus"));
        assertFalse(provider.supportsModel("gemini-pro"));
        assertFalse(provider.supportsModel(null));
    }

    @Test
    void testSupportsModel_CustomGptModels() {
        // Any model starting with gpt- should be supported
        assertTrue(provider.supportsModel("gpt-4-0125-preview"));
        assertTrue(provider.supportsModel("gpt-5-future"));
    }

    @Test
    void testChatWithInvalidApiKey() {
        LlmRequest request = LlmRequest.builder()
                .model("gpt-4o")
                .messages(List.of(LlmMessage.user("Hello")))
                .build();

        // With invalid API key, should return error
        var response = provider.chat(request, "invalid-api-key");

        assertFalse(response.isSuccess());
        assertNotNull(response.getError());
    }

    @Test
    void testRequestBuilding() {
        // Test that request building doesn't throw
        ObjectNode params = objectMapper.createObjectNode();
        params.put("type", "object");
        params.set("properties", objectMapper.createObjectNode());

        ToolDefinition tool = ToolDefinition.builder()
                .name("test_tool")
                .description("A test tool")
                .parameters(params)
                .build();

        LlmRequest request = LlmRequest.builder()
                .model("gpt-4o")
                .messages(List.of(
                        LlmMessage.system("You are a test assistant"),
                        LlmMessage.user("Test message")
                ))
                .tools(List.of(tool))
                .temperature(0.5)
                .maxTokens(100)
                .forceToolUse(true)
                .build();

        // Verify request is valid
        assertNotNull(request);
        assertEquals(2, request.getMessages().size());
        assertEquals(1, request.getTools().size());
    }
}
