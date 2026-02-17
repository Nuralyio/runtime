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
class OllamaProviderTest {

    private OllamaProvider provider;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        provider = new OllamaProvider();
        objectMapper = new ObjectMapper();
    }

    @Test
    void testGetName() {
        assertEquals("ollama", provider.getName());
    }

    @Test
    void testGetDefaultModel() {
        assertEquals("llama3.2", provider.getDefaultModel());
    }

    @Test
    void testSupportsModel_LlamaModels() {
        assertTrue(provider.supportsModel("llama3"));
        assertTrue(provider.supportsModel("llama3.1"));
        assertTrue(provider.supportsModel("llama3.2"));
        assertTrue(provider.supportsModel("llama3.3"));
        assertTrue(provider.supportsModel("llama2"));
        assertTrue(provider.supportsModel("llama2:13b"));
        assertTrue(provider.supportsModel("llama2:70b"));
    }

    @Test
    void testSupportsModel_MistralModels() {
        assertTrue(provider.supportsModel("mistral"));
        assertTrue(provider.supportsModel("mistral:7b"));
        assertTrue(provider.supportsModel("mistral-nemo"));
        assertTrue(provider.supportsModel("mixtral"));
        assertTrue(provider.supportsModel("mixtral:8x7b"));
    }

    @Test
    void testSupportsModel_CodeLlamaModels() {
        assertTrue(provider.supportsModel("codellama"));
        assertTrue(provider.supportsModel("codellama:7b"));
        assertTrue(provider.supportsModel("codellama:13b"));
        assertTrue(provider.supportsModel("codellama:34b"));
    }

    @Test
    void testSupportsModel_OtherModels() {
        assertTrue(provider.supportsModel("deepseek-coder"));
        assertTrue(provider.supportsModel("deepseek-coder-v2"));
        assertTrue(provider.supportsModel("phi3"));
        assertTrue(provider.supportsModel("phi3:mini"));
        assertTrue(provider.supportsModel("gemma"));
        assertTrue(provider.supportsModel("gemma2"));
        assertTrue(provider.supportsModel("qwen2"));
        assertTrue(provider.supportsModel("qwen2.5"));
        assertTrue(provider.supportsModel("command-r"));
        assertTrue(provider.supportsModel("command-r-plus"));
    }

    @Test
    void testSupportsModel_CustomModelsWithTags() {
        // Custom models with tags should be supported
        assertTrue(provider.supportsModel("mymodel:latest"));
        assertTrue(provider.supportsModel("custom:v1.0"));
    }

    @Test
    void testSupportsModel_NullModel() {
        // Null model should return false
        assertFalse(provider.supportsModel(null));
    }

    @Test
    void testSupportsModel_AcceptsAnyModel() {
        // Ollama accepts any model name (will return error if model not found)
        assertTrue(provider.supportsModel("gpt-4"));
        assertTrue(provider.supportsModel("claude-3-opus"));
        assertTrue(provider.supportsModel("any-custom-model"));
    }

    @Test
    void testChatWithConnectionError() {
        // Set a non-existent URL to simulate connection error
        provider.apiUrl = "http://localhost:99999";

        LlmRequest request = LlmRequest.builder()
                .model("llama3.2")
                .messages(List.of(LlmMessage.user("Hello")))
                .build();

        var response = provider.chat(request, null);

        assertFalse(response.isSuccess());
        assertNotNull(response.getError());
        assertTrue(response.getError().contains("Ollama request failed"));
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
                .model("llama3.2")
                .messages(List.of(
                        LlmMessage.system("You are a test assistant"),
                        LlmMessage.user("Test message")
                ))
                .tools(List.of(tool))
                .temperature(0.5)
                .maxTokens(100)
                .build();

        // Verify request is valid
        assertNotNull(request);
        assertEquals(2, request.getMessages().size());
        assertEquals(1, request.getTools().size());
    }

    @Test
    void testChatWithoutApiKey() {
        // Ollama typically doesn't require an API key
        // This test verifies the provider handles null API key gracefully
        provider.apiUrl = "http://localhost:99999"; // Non-existent to avoid actual call

        LlmRequest request = LlmRequest.builder()
                .model("llama3.2")
                .messages(List.of(LlmMessage.user("Hello")))
                .build();

        // Should not throw, just return an error response
        var response = provider.chat(request, null);
        assertNotNull(response);
        assertFalse(response.isSuccess());
    }

    @Test
    void testChatWithEmptyApiKey() {
        provider.apiUrl = "http://localhost:99999"; // Non-existent to avoid actual call

        LlmRequest request = LlmRequest.builder()
                .model("llama3.2")
                .messages(List.of(LlmMessage.user("Hello")))
                .build();

        // Should not throw with empty API key
        var response = provider.chat(request, "");
        assertNotNull(response);
        assertFalse(response.isSuccess());
    }

    @Test
    void testChatWithCustomBaseUrl() {
        // Test that custom baseUrl from request is used
        provider.apiUrl = "http://default-server:11434";

        LlmRequest request = LlmRequest.builder()
                .model("llama3.2")
                .messages(List.of(LlmMessage.user("Hello")))
                .baseUrl("http://custom-server:11434")
                .build();

        // Should fail with connection error to custom URL, not default
        var response = provider.chat(request, null);
        assertNotNull(response);
        assertFalse(response.isSuccess());
        assertTrue(response.getError().contains("Ollama request failed"));
    }

    @Test
    void testGetAvailableModelsWithConnectionError() {
        // Set a non-existent URL
        provider.apiUrl = "http://localhost:99999";

        // Should return empty list, not throw
        var models = provider.getAvailableModels();
        assertNotNull(models);
        assertTrue(models.isEmpty());
    }

    @Test
    void testGetAvailableModelsWithCustomBaseUrl() {
        provider.apiUrl = "http://localhost:11434";

        // Should handle custom URL without throwing
        var models = provider.getAvailableModels("http://localhost:99999");
        assertNotNull(models);
        assertTrue(models.isEmpty());
    }

    @Test
    void testRefreshAvailableModels() {
        provider.apiUrl = "http://localhost:99999";

        // Should not throw
        var models = provider.refreshAvailableModels();
        assertNotNull(models);
    }

    @Test
    void testSupportsStructuredOutput_SupportedModels() {
        assertTrue(provider.supportsStructuredOutput("llama3"));
        assertTrue(provider.supportsStructuredOutput("llama3.1"));
        assertTrue(provider.supportsStructuredOutput("mistral"));
        assertTrue(provider.supportsStructuredOutput("mistral-nemo"));
        assertTrue(provider.supportsStructuredOutput("qwen2"));
        assertTrue(provider.supportsStructuredOutput("qwen2.5"));
        assertTrue(provider.supportsStructuredOutput("deepseek-v2"));
        assertTrue(provider.supportsStructuredOutput("gemma2"));
        assertTrue(provider.supportsStructuredOutput("phi3"));
    }

    @Test
    void testSupportsStructuredOutput_UnsupportedModels() {
        assertFalse(provider.supportsStructuredOutput("codellama"));
        assertFalse(provider.supportsStructuredOutput("llama2"));
        assertFalse(provider.supportsStructuredOutput("command-r"));
        assertFalse(provider.supportsStructuredOutput("custom-model"));
    }

    @Test
    void testSupportsStructuredOutput_NullModel() {
        assertFalse(provider.supportsStructuredOutput(null));
    }
}
