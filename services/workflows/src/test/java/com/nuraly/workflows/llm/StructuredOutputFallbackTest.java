package com.nuraly.workflows.llm;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.llm.dto.LlmMessage;
import com.nuraly.workflows.llm.dto.LlmRequest;
import com.nuraly.workflows.llm.dto.LlmResponse;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class StructuredOutputFallbackTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    // ── applyPromptFallback ─────────────────────────────────────────────

    @Test
    void applyPromptFallback_augmentsExistingSystemMessage() {
        LlmRequest request = LlmRequest.builder()
                .model("gpt-3.5-turbo")
                .messages(List.of(
                        LlmMessage.system("You are a helper."),
                        LlmMessage.user("Give me data")
                ))
                .responseFormat(buildResponseFormat())
                .build();

        LlmRequest result = StructuredOutputFallback.applyPromptFallback(request);

        assertNull(result.getResponseFormat());
        assertEquals(2, result.getMessages().size());
        String systemContent = result.getMessages().get(0).getContent();
        assertTrue(systemContent.startsWith("You are a helper."));
        assertTrue(systemContent.contains("You MUST respond with valid JSON only"));
        assertTrue(systemContent.contains("json_schema"));
    }

    @Test
    void applyPromptFallback_prependsSystemMessageWhenMissing() {
        LlmRequest request = LlmRequest.builder()
                .model("gpt-3.5-turbo")
                .messages(List.of(LlmMessage.user("Give me data")))
                .responseFormat(buildResponseFormat())
                .build();

        LlmRequest result = StructuredOutputFallback.applyPromptFallback(request);

        assertNull(result.getResponseFormat());
        assertEquals(2, result.getMessages().size());
        assertEquals(LlmMessage.Role.SYSTEM, result.getMessages().get(0).getRole());
        assertTrue(result.getMessages().get(0).getContent().contains("You MUST respond with valid JSON only"));
    }

    @Test
    void applyPromptFallback_preservesRequestFields() {
        LlmRequest request = LlmRequest.builder()
                .model("gpt-3.5-turbo")
                .messages(List.of(LlmMessage.user("test")))
                .temperature(0.5)
                .maxTokens(200)
                .systemPrompt("sys")
                .baseUrl("http://example.com")
                .forceToolUse(true)
                .responseFormat(buildResponseFormat())
                .build();

        LlmRequest result = StructuredOutputFallback.applyPromptFallback(request);

        assertEquals("gpt-3.5-turbo", result.getModel());
        assertEquals(0.5, result.getTemperature());
        assertEquals(200, result.getMaxTokens());
        assertEquals("sys", result.getSystemPrompt());
        assertEquals("http://example.com", result.getBaseUrl());
        assertTrue(result.getForceToolUse());
        assertNull(result.getResponseFormat());
    }

    @Test
    void applyPromptFallback_fallsBackToWholeResponseFormatWhenNoSchema() {
        ObjectNode format = objectMapper.createObjectNode();
        format.put("type", "json_object");

        LlmRequest request = LlmRequest.builder()
                .model("gpt-3.5-turbo")
                .messages(List.of(LlmMessage.user("test")))
                .responseFormat(format)
                .build();

        LlmRequest result = StructuredOutputFallback.applyPromptFallback(request);

        String systemContent = result.getMessages().get(0).getContent();
        assertTrue(systemContent.contains("json_object"));
    }

    // ── extractJson ─────────────────────────────────────────────────────

    @Test
    void extractJson_returnsNullResponseUnchanged() {
        assertNull(StructuredOutputFallback.extractJson(null));
    }

    @Test
    void extractJson_returnsBlankContentUnchanged() {
        LlmResponse response = LlmResponse.builder().content("   ").build();
        assertSame(response, StructuredOutputFallback.extractJson(response));
    }

    @Test
    void extractJson_returnsNullContentUnchanged() {
        LlmResponse response = LlmResponse.builder().content(null).build();
        assertSame(response, StructuredOutputFallback.extractJson(response));
    }

    @Test
    void extractJson_strategy1_directJson() {
        LlmResponse response = LlmResponse.builder()
                .content("{\"name\":\"Alice\",\"age\":30}")
                .finishReason(LlmResponse.FinishReason.STOP)
                .build();

        LlmResponse result = StructuredOutputFallback.extractJson(response);

        assertEquals("{\"name\":\"Alice\",\"age\":30}", result.getContent());
        assertEquals(LlmResponse.FinishReason.STOP, result.getFinishReason());
    }

    @Test
    void extractJson_strategy1_directJsonArray() {
        LlmResponse response = LlmResponse.builder()
                .content("[{\"id\":1},{\"id\":2}]")
                .build();

        LlmResponse result = StructuredOutputFallback.extractJson(response);

        assertEquals("[{\"id\":1},{\"id\":2}]", result.getContent());
    }

    @Test
    void extractJson_strategy2_codeBlock() {
        String content = "Here is the result:\n```json\n{\"key\": \"value\"}\n```\nDone.";
        LlmResponse response = LlmResponse.builder().content(content).build();

        LlmResponse result = StructuredOutputFallback.extractJson(response);

        assertEquals("{\"key\":\"value\"}", result.getContent());
    }

    @Test
    void extractJson_strategy2_codeBlockWithoutJsonLabel() {
        String content = "Result:\n```\n{\"key\": \"value\"}\n```";
        LlmResponse response = LlmResponse.builder().content(content).build();

        LlmResponse result = StructuredOutputFallback.extractJson(response);

        assertEquals("{\"key\":\"value\"}", result.getContent());
    }

    @Test
    void extractJson_strategy3_embeddedJsonObject() {
        String content = "The answer is {\"result\": 42} as requested.";
        LlmResponse response = LlmResponse.builder().content(content).build();

        LlmResponse result = StructuredOutputFallback.extractJson(response);

        assertEquals("{\"result\":42}", result.getContent());
    }

    @Test
    void extractJson_allStrategiesFail_returnsOriginal() {
        String content = "No JSON here at all, just plain text.";
        LlmResponse response = LlmResponse.builder().content(content).build();

        LlmResponse result = StructuredOutputFallback.extractJson(response);

        assertSame(response, result);
    }

    @Test
    void extractJson_preservesOtherResponseFields() {
        LlmResponse.Usage usage = LlmResponse.Usage.builder()
                .promptTokens(10).completionTokens(20).totalTokens(30).build();
        LlmResponse response = LlmResponse.builder()
                .content("{\"ok\":true}")
                .finishReason(LlmResponse.FinishReason.STOP)
                .usage(usage)
                .model("test-model")
                .build();

        LlmResponse result = StructuredOutputFallback.extractJson(response);

        assertEquals("{\"ok\":true}", result.getContent());
        assertEquals(LlmResponse.FinishReason.STOP, result.getFinishReason());
        assertNotNull(result.getUsage());
        assertEquals("test-model", result.getModel());
    }

    @Test
    void extractJson_handlesWhitespaceAroundJson() {
        LlmResponse response = LlmResponse.builder()
                .content("  \n  {\"key\": \"value\"}  \n  ")
                .build();

        LlmResponse result = StructuredOutputFallback.extractJson(response);

        assertEquals("{\"key\":\"value\"}", result.getContent());
    }

    // ── helpers ──────────────────────────────────────────────────────────

    private ObjectNode buildResponseFormat() {
        ObjectNode format = objectMapper.createObjectNode();
        ObjectNode jsonSchema = objectMapper.createObjectNode();
        ObjectNode schema = objectMapper.createObjectNode();
        schema.put("type", "object");
        ObjectNode props = objectMapper.createObjectNode();
        ObjectNode nameProp = objectMapper.createObjectNode();
        nameProp.put("type", "string");
        props.set("name", nameProp);
        schema.set("properties", props);
        jsonSchema.set("schema", schema);
        jsonSchema.put("name", "test_schema");
        format.set("json_schema", jsonSchema);
        return format;
    }
}
