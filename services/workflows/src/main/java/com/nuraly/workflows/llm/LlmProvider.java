package com.nuraly.workflows.llm;

import com.nuraly.workflows.llm.dto.LlmRequest;
import com.nuraly.workflows.llm.dto.LlmResponse;

/**
 * Interface for LLM providers (OpenAI, Anthropic, Gemini, etc.)
 */
public interface LlmProvider {

    /**
     * Get the provider name (e.g., "openai", "anthropic", "gemini")
     */
    String getName();

    /**
     * Check if this provider supports the given model
     */
    boolean supportsModel(String model);

    /**
     * Get the default model for this provider
     */
    String getDefaultModel();

    /**
     * Send a request to the LLM and get a response.
     *
     * @param request The LLM request
     * @param apiKey The API key to use
     * @return The LLM response
     */
    LlmResponse chat(LlmRequest request, String apiKey);
}
