package com.nuraly.workflows.embedding;

import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Instance;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.util.HashMap;
import java.util.Map;

/**
 * Factory for embedding providers.
 * Auto-discovers all EmbeddingProvider implementations via CDI.
 */
@ApplicationScoped
public class EmbeddingProviderFactory {

    private static final Logger LOG = Logger.getLogger(EmbeddingProviderFactory.class);

    @Inject
    Instance<EmbeddingProvider> providers;

    private Map<String, EmbeddingProvider> providerMap;

    @PostConstruct
    void init() {
        providerMap = new HashMap<>();
        for (EmbeddingProvider provider : providers) {
            providerMap.put(provider.getName().toLowerCase(), provider);
            LOG.infof("Registered embedding provider: %s (default model: %s)",
                      provider.getName(), provider.getDefaultModel());
        }
    }

    /**
     * Get a provider by name.
     *
     * @param name The provider name (e.g., "openai", "ollama", "local")
     * @return The provider, or null if not found
     */
    public EmbeddingProvider getProvider(String name) {
        if (name == null) {
            return null;
        }
        return providerMap.get(name.toLowerCase());
    }

    /**
     * Check if a provider exists.
     */
    public boolean hasProvider(String name) {
        return name != null && providerMap.containsKey(name.toLowerCase());
    }

    /**
     * Get all available provider names.
     */
    public String[] getAvailableProviders() {
        return providerMap.keySet().toArray(new String[0]);
    }
}
