package com.nuraly.workflows.llm;

import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Instance;
import jakarta.inject.Inject;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Factory for LLM providers.
 * Auto-discovers all LlmProvider implementations.
 */
@ApplicationScoped
public class LlmProviderFactory {

    @Inject
    Instance<LlmProvider> providers;

    private Map<String, LlmProvider> providerMap;

    @PostConstruct
    void init() {
        providerMap = new HashMap<>();
        for (LlmProvider provider : providers) {
            providerMap.put(provider.getName().toLowerCase(), provider);
        }
    }

    /**
     * Get a provider by name.
     *
     * @param name The provider name (e.g., "openai", "anthropic", "gemini")
     * @return The provider, or null if not found
     */
    public LlmProvider getProvider(String name) {
        if (name == null) {
            return null;
        }
        return providerMap.get(name.toLowerCase());
    }

    /**
     * Find a provider that supports the given model.
     *
     * @param model The model name
     * @return The provider, or empty if no provider supports this model
     */
    public Optional<LlmProvider> findProviderForModel(String model) {
        for (LlmProvider provider : providerMap.values()) {
            if (provider.supportsModel(model)) {
                return Optional.of(provider);
            }
        }
        return Optional.empty();
    }

    /**
     * Check if a provider exists.
     *
     * @param name The provider name
     * @return true if the provider exists
     */
    public boolean hasProvider(String name) {
        return name != null && providerMap.containsKey(name.toLowerCase());
    }

    /**
     * Get all available provider names.
     *
     * @return Array of provider names
     */
    public String[] getAvailableProviders() {
        return providerMap.keySet().toArray(new String[0]);
    }
}
