package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.configuration.Configuration;
import com.nuraly.workflows.embedding.EmbeddingProvider;
import com.nuraly.workflows.embedding.EmbeddingProviderFactory;
import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.apache.hc.client5.http.classic.methods.HttpGet;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.jboss.logging.Logger;

import java.util.ArrayList;
import java.util.List;

/**
 * EMBEDDING Node Executor - Converts text to vector embeddings.
 *
 * Node Configuration:
 * {
 *   "provider": "openai" | "ollama" | "local",
 *   "model": "text-embedding-3-small",
 *   "apiKeyPath": "openai/embedding-key",  // Not needed for "local"
 *   "apiUrlPath": "ollama/server-url",     // For Ollama
 *   "inputField": "text",                  // Field containing text(s) to embed
 *   "batchSize": 100,                      // Max texts per API call
 *   "isolationKey": "{{userId}}"           // Optional: user-defined isolation key for data partitioning
 * }
 *
 * Input:
 *   { "text": "Hello world" }
 *   OR
 *   { "texts": ["Hello", "World"] }
 *   OR
 *   { "chunks": [{ "content": "Hello" }, { "content": "World" }] }
 *   OR with isolationKey in input:
 *   { "text": "Hello world", "isolationKey": "user-123" }
 *
 * Output:
 *   { "embedding": [0.1, 0.2, ...], "dimension": 1536, "tokenCount": 5, "isolationKey": "user-123" }
 *   OR
 *   { "embeddings": [[...], [...]], "dimension": 1536, "tokenCount": 10, "isolationKey": "user-123" }
 */
@ApplicationScoped
public class EmbeddingNodeExecutor implements NodeExecutor {

    private static final Logger LOG = Logger.getLogger(EmbeddingNodeExecutor.class);
    private static final int DEFAULT_BATCH_SIZE = 100;

    @Inject
    EmbeddingProviderFactory providerFactory;

    @Inject
    Configuration configuration;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public NodeType getType() {
        return NodeType.EMBEDDING;
    }

    @Override
    public NodeExecutionResult execute(ExecutionContext context, WorkflowNodeEntity node) throws Exception {
        if (node.configuration == null) {
            return NodeExecutionResult.failure("EMBEDDING node configuration is missing");
        }

        JsonNode config = objectMapper.readTree(node.configuration);

        // Get provider (default to "local" for no-config simplicity)
        String providerName = config.has("provider") ? config.get("provider").asText() : "openai";
        EmbeddingProvider provider = providerFactory.getProvider(providerName);
        if (provider == null) {
            return NodeExecutionResult.failure("Unknown embedding provider: " + providerName +
                ". Available providers: openai, ollama, local");
        }

        // Get model
        String model = config.has("model") && !config.get("model").asText().isEmpty()
                ? config.get("model").asText()
                : provider.getDefaultModel();

        // Get API key (not needed for "local" provider)
        String apiKeyPath = config.has("apiKeyPath") ? config.get("apiKeyPath").asText() : null;
        String apiKey = null;
        boolean isLocal = "local".equalsIgnoreCase(providerName);
        boolean isOllama = "ollama".equalsIgnoreCase(providerName);

        if (!isLocal && apiKeyPath != null && !apiKeyPath.isEmpty()) {
            apiKey = fetchFromKvStore(apiKeyPath, context);
            if (apiKey == null && !isOllama) {
                return NodeExecutionResult.failure("Failed to retrieve API key from KV store: " + apiKeyPath);
            }
        } else if (!isLocal && !isOllama) {
            return NodeExecutionResult.failure("API key path is required for " + providerName + " provider");
        }

        // Get API URL (for Ollama or custom endpoints)
        String apiUrlPath = config.has("apiUrlPath") ? config.get("apiUrlPath").asText() : null;
        String baseUrl = null;
        if (apiUrlPath != null && !apiUrlPath.isEmpty()) {
            baseUrl = fetchFromKvStore(apiUrlPath, context);
        }

        if (isOllama && (baseUrl == null || baseUrl.isEmpty())) {
            return NodeExecutionResult.failure("API URL is required for Ollama provider. Configure apiUrlPath pointing to your Ollama server URL.");
        }

        // Extract texts from input
        List<String> texts = extractTexts(context.getInput(), config);
        if (texts.isEmpty()) {
            return NodeExecutionResult.failure("No text(s) provided for embedding. " +
                    "Expected input.text, input.texts, input.chunks, input.query, or input.content");
        }

        LOG.debugf("Embedding %d text(s) with provider=%s, model=%s", texts.size(), providerName, model);

        // Generate embeddings
        int batchSize = config.has("batchSize") ? config.get("batchSize").asInt() : DEFAULT_BATCH_SIZE;
        List<EmbeddingProvider.EmbeddingResult> results = new ArrayList<>();
        int totalTokens = 0;

        // Process in batches
        for (int i = 0; i < texts.size(); i += batchSize) {
            List<String> batch = texts.subList(i, Math.min(i + batchSize, texts.size()));
            List<EmbeddingProvider.EmbeddingResult> batchResults = provider.embedBatch(batch, model, apiKey, baseUrl);

            for (EmbeddingProvider.EmbeddingResult result : batchResults) {
                if (!result.isSuccess()) {
                    return NodeExecutionResult.failure("Embedding failed: " + result.getError(), true);
                }
                totalTokens += result.getTokenCount();
            }

            results.addAll(batchResults);
        }

        // Build output
        ObjectNode output = objectMapper.createObjectNode();
        int dimension = results.isEmpty() ? 0 : results.get(0).getEmbedding().length;

        if (texts.size() == 1) {
            // Single embedding
            ArrayNode embeddingArray = objectMapper.createArrayNode();
            for (float v : results.get(0).getEmbedding()) {
                embeddingArray.add(v);
            }
            output.set("embedding", embeddingArray);
            output.put("dimension", dimension);
            output.put("tokenCount", totalTokens);
        } else {
            // Multiple embeddings
            ArrayNode embeddingsArray = objectMapper.createArrayNode();
            for (EmbeddingProvider.EmbeddingResult result : results) {
                ArrayNode embeddingArray = objectMapper.createArrayNode();
                for (float v : result.getEmbedding()) {
                    embeddingArray.add(v);
                }
                embeddingsArray.add(embeddingArray);
            }
            output.set("embeddings", embeddingsArray);
            output.put("count", results.size());
            output.put("dimension", dimension);
            output.put("tokenCount", totalTokens);
        }

        output.put("provider", providerName);
        output.put("model", model);

        // Pass through isolationKey if provided (from config or input)
        String isolationKey = extractIsolationKey(context.getInput(), config);
        if (isolationKey != null && !isolationKey.isEmpty()) {
            output.put("isolationKey", isolationKey);
        }

        return NodeExecutionResult.success(output);
    }

    /**
     * Extract isolation key from input or config.
     * Priority: input.isolationKey > config.isolationKey
     */
    private String extractIsolationKey(JsonNode input, JsonNode config) {
        // Check input first (runtime value takes priority)
        if (input.has("isolationKey") && input.get("isolationKey").isTextual()) {
            return input.get("isolationKey").asText();
        }

        // Check config (static value)
        if (config.has("isolationKey") && config.get("isolationKey").isTextual()) {
            return config.get("isolationKey").asText();
        }

        return null;
    }

    /**
     * Extract texts from input based on various formats.
     */
    private List<String> extractTexts(JsonNode input, JsonNode config) {
        List<String> texts = new ArrayList<>();

        // Check for custom input field
        String inputField = config.has("inputField") ? config.get("inputField").asText() : null;
        if (inputField != null && input.has(inputField)) {
            JsonNode fieldValue = input.get(inputField);
            if (fieldValue.isTextual()) {
                texts.add(fieldValue.asText());
                return texts;
            } else if (fieldValue.isArray()) {
                for (JsonNode item : fieldValue) {
                    if (item.isTextual()) {
                        texts.add(item.asText());
                    }
                }
                return texts;
            }
        }

        // Single text: input.text
        if (input.has("text") && input.get("text").isTextual()) {
            texts.add(input.get("text").asText());
            return texts;
        }

        // Multiple texts: input.texts
        if (input.has("texts") && input.get("texts").isArray()) {
            for (JsonNode item : input.get("texts")) {
                if (item.isTextual()) {
                    texts.add(item.asText());
                }
            }
            return texts;
        }

        // Chunks format: input.chunks[].content
        if (input.has("chunks") && input.get("chunks").isArray()) {
            for (JsonNode chunk : input.get("chunks")) {
                if (chunk.has("content") && chunk.get("content").isTextual()) {
                    texts.add(chunk.get("content").asText());
                }
            }
            return texts;
        }

        // Query format: input.query
        if (input.has("query") && input.get("query").isTextual()) {
            texts.add(input.get("query").asText());
            return texts;
        }

        // Content format: input.content
        if (input.has("content") && input.get("content").isTextual()) {
            texts.add(input.get("content").asText());
            return texts;
        }

        // Message format: input.message
        if (input.has("message") && input.get("message").isTextual()) {
            texts.add(input.get("message").asText());
            return texts;
        }

        return texts;
    }

    /**
     * Fetch value from KV store.
     */
    private String fetchFromKvStore(String keyPath, ExecutionContext context) {
        try {
            String appId = null;
            JsonNode input = context.getInput();
            if (input.has("applicationId")) {
                appId = input.get("applicationId").asText();
            } else if (context.getExecution() != null && context.getExecution().workflow != null) {
                appId = context.getExecution().workflow.applicationId != null ?
                        context.getExecution().workflow.applicationId : null;
            }

            if (appId == null) {
                LOG.warn("No applicationId found in context for KV store lookup");
                return null;
            }

            String kvServiceUrl = configuration.kvServiceUrl + "/api/v1/kv/entries/" +
                    java.net.URLEncoder.encode(keyPath, "UTF-8") +
                    "?applicationId=" + appId;

            try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
                HttpGet request = new HttpGet(kvServiceUrl);
                request.addHeader("Content-Type", "application/json");

                var response = httpClient.execute(request);
                int statusCode = response.getCode();

                if (statusCode >= 200 && statusCode < 300) {
                    String responseBody = EntityUtils.toString(response.getEntity());
                    JsonNode kvEntry = objectMapper.readTree(responseBody);
                    if (kvEntry.has("value")) {
                        return kvEntry.get("value").asText();
                    }
                }
            }

            return null;
        } catch (Exception e) {
            LOG.warnf("Failed to fetch value from KV store (%s): %s", keyPath, e.getMessage());
            return null;
        }
    }
}
