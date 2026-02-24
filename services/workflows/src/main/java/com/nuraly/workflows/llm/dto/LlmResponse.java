package com.nuraly.workflows.llm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response from an LLM provider.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LlmResponse {

    public enum FinishReason {
        STOP,           // Normal completion
        TOOL_CALLS,     // Model wants to call tools
        LENGTH,         // Hit max tokens
        CONTENT_FILTER, // Content filtered
        ERROR           // Error occurred
    }

    /**
     * The generated text content (may be null if tool calls)
     */
    private String content;

    /**
     * Tool calls requested by the model
     */
    private List<ToolCall> toolCalls;

    /**
     * Why the model stopped generating
     */
    private FinishReason finishReason;

    /**
     * Token usage information
     */
    private Usage usage;

    /**
     * Error message if any
     */
    private String error;

    /**
     * The model that was actually used
     */
    private String model;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Usage {
        private int promptTokens;
        private int completionTokens;
        private int totalTokens;
    }

    public boolean hasToolCalls() {
        return toolCalls != null && !toolCalls.isEmpty();
    }

    public boolean isSuccess() {
        return error == null && finishReason != FinishReason.ERROR;
    }

    public static LlmResponse error(String message) {
        return LlmResponse.builder()
                .finishReason(FinishReason.ERROR)
                .error(message)
                .build();
    }
}
