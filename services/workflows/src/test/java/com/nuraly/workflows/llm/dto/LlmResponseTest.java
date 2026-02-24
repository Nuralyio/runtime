package com.nuraly.workflows.llm.dto;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class LlmResponseTest {

    @Test
    void testSuccessResponse() {
        LlmResponse response = LlmResponse.builder()
                .content("Hello!")
                .finishReason(LlmResponse.FinishReason.STOP)
                .model("gpt-4o")
                .build();

        assertTrue(response.isSuccess());
        assertEquals("Hello!", response.getContent());
        assertEquals(LlmResponse.FinishReason.STOP, response.getFinishReason());
        assertEquals("gpt-4o", response.getModel());
        assertFalse(response.hasToolCalls());
    }

    @Test
    void testErrorResponse() {
        LlmResponse response = LlmResponse.error("API rate limit exceeded");

        assertFalse(response.isSuccess());
        assertEquals(LlmResponse.FinishReason.ERROR, response.getFinishReason());
        assertEquals("API rate limit exceeded", response.getError());
    }

    @Test
    void testResponseWithToolCalls() {
        ToolCall toolCall = ToolCall.builder()
                .id("call_abc123")
                .name("get_weather")
                .build();

        LlmResponse response = LlmResponse.builder()
                .toolCalls(List.of(toolCall))
                .finishReason(LlmResponse.FinishReason.TOOL_CALLS)
                .build();

        assertTrue(response.isSuccess());
        assertTrue(response.hasToolCalls());
        assertEquals(1, response.getToolCalls().size());
        assertEquals("get_weather", response.getToolCalls().get(0).getName());
    }

    @Test
    void testResponseWithUsage() {
        LlmResponse.Usage usage = LlmResponse.Usage.builder()
                .promptTokens(100)
                .completionTokens(50)
                .totalTokens(150)
                .build();

        LlmResponse response = LlmResponse.builder()
                .content("Response text")
                .finishReason(LlmResponse.FinishReason.STOP)
                .usage(usage)
                .build();

        assertNotNull(response.getUsage());
        assertEquals(100, response.getUsage().getPromptTokens());
        assertEquals(50, response.getUsage().getCompletionTokens());
        assertEquals(150, response.getUsage().getTotalTokens());
    }

    @Test
    void testFinishReasons() {
        // Test all finish reasons
        assertEquals(LlmResponse.FinishReason.STOP, LlmResponse.FinishReason.valueOf("STOP"));
        assertEquals(LlmResponse.FinishReason.TOOL_CALLS, LlmResponse.FinishReason.valueOf("TOOL_CALLS"));
        assertEquals(LlmResponse.FinishReason.LENGTH, LlmResponse.FinishReason.valueOf("LENGTH"));
        assertEquals(LlmResponse.FinishReason.CONTENT_FILTER, LlmResponse.FinishReason.valueOf("CONTENT_FILTER"));
        assertEquals(LlmResponse.FinishReason.ERROR, LlmResponse.FinishReason.valueOf("ERROR"));
    }

    @Test
    void testHasToolCallsWithNull() {
        LlmResponse response = LlmResponse.builder()
                .content("No tools")
                .finishReason(LlmResponse.FinishReason.STOP)
                .toolCalls(null)
                .build();

        assertFalse(response.hasToolCalls());
    }

    @Test
    void testHasToolCallsWithEmptyList() {
        LlmResponse response = LlmResponse.builder()
                .content("No tools")
                .finishReason(LlmResponse.FinishReason.STOP)
                .toolCalls(List.of())
                .build();

        assertFalse(response.hasToolCalls());
    }
}
