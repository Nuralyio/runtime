package com.nuraly.workflows.llm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Request to an LLM provider.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LlmRequest {

    /**
     * The model to use (e.g., "gpt-4", "claude-3-opus", "gemini-pro")
     */
    private String model;

    /**
     * List of messages in the conversation
     */
    private List<LlmMessage> messages;

    /**
     * Available tools the LLM can call
     */
    private List<ToolDefinition> tools;

    /**
     * Temperature for response randomness (0.0 - 2.0)
     */
    @Builder.Default
    private Double temperature = 0.7;

    /**
     * Maximum tokens in response
     */
    private Integer maxTokens;

    /**
     * System prompt (can be set as first message or separately)
     */
    private String systemPrompt;

    /**
     * Whether to force tool use
     */
    @Builder.Default
    private Boolean forceToolUse = false;

    /**
     * Optional base URL override for the provider API.
     * Used primarily for self-hosted providers like Ollama.
     */
    private String baseUrl;
}
