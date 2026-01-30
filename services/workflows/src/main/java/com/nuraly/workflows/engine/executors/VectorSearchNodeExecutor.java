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
import com.nuraly.workflows.vector.VectorStoreService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.apache.hc.client5.http.classic.methods.HttpGet;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.jboss.logging.Logger;

import java.util.*;

/**
 * VECTOR_SEARCH Node Executor - Searches for similar documents in the vector store.
 *
 * Node Configuration:
 * {
 *   "collectionName": "knowledge-base",      // Collection to search
 *   "topK": 5,                               // Number of results to return
 *   "minScore": 0.7,                         // Minimum similarity score (0-1)
 *   "includeContent": true,                  // Include document content in results
 *   "includeMetadata": true,                 // Include metadata in results
 *   "isolationKey": "{{userId}}",            // Optional isolation key
 *
 *   // Embedding settings (to embed the query)
 *   "provider": "openai",                    // Embedding provider
 *   "model": "text-embedding-3-small",       // Embedding model
 *   "apiKeyPath": "openai/embedding-key"     // API key path in KV store
 * }
 *
 * Input:
 *   { "query": "What is the return policy?" }
 *   OR
 *   { "embedding": [0.1, 0.2, ...] }  // Pre-computed embedding
 *
 * Output:
 *   {
 *     "results": [
 *       {
 *         "content": "Our return policy allows...",
 *         "score": 0.92,
 *         "sourceId": "faq.pdf",
 *         "sourceType": "pdf",
 *         "chunkIndex": 3,
 *         "metadata": { ... }
 *       },
 *       ...
 *     ],
 *     "count": 5,
 *     "query": "What is the return policy?"
 *   }
 */
@ApplicationScoped
public class VectorSearchNodeExecutor implements NodeExecutor {

    private static final Logger LOG = Logger.getLogger(VectorSearchNodeExecutor.class);
    private static final int DEFAULT_TOP_K = 5;
    private static final double DEFAULT_MIN_SCORE = 0.0;

    @Inject
    VectorStoreService vectorStoreService;

    @Inject
    EmbeddingProviderFactory providerFactory;

    @Inject
    Configuration configuration;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public NodeType getType() {
        return NodeType.VECTOR_SEARCH;
    }

    @Override
    public NodeExecutionResult execute(ExecutionContext context, WorkflowNodeEntity node) throws Exception {
        if (node.configuration == null) {
            return NodeExecutionResult.failure("VECTOR_SEARCH node configuration is missing");
        }

        JsonNode config = objectMapper.readTree(node.configuration);
        JsonNode input = context.getInput();

        // Get collection name (required)
        if (!config.has("collectionName") || config.get("collectionName").asText().isEmpty()) {
            return NodeExecutionResult.failure("collectionName is required in VECTOR_SEARCH configuration");
        }
        String collectionName = config.get("collectionName").asText();

        // Get search parameters
        int topK = config.has("topK") ? config.get("topK").asInt() : DEFAULT_TOP_K;
        double minScore = config.has("minScore") ? config.get("minScore").asDouble() : DEFAULT_MIN_SCORE;
        boolean includeContent = !config.has("includeContent") || config.get("includeContent").asBoolean();
        boolean includeMetadata = !config.has("includeMetadata") || config.get("includeMetadata").asBoolean();

        // Get workflow ID
        UUID workflowId = null;
        if (context.getExecution() != null && context.getExecution().workflow != null) {
            workflowId = context.getExecution().workflow.id;
        }
        if (workflowId == null) {
            return NodeExecutionResult.failure("Could not determine workflow ID for vector search");
        }

        // Get isolation key
        String isolationKey = null;
        if (input.has("isolationKey")) {
            isolationKey = input.get("isolationKey").asText();
        } else if (config.has("isolationKey")) {
            isolationKey = config.get("isolationKey").asText();
        }

        // Get or compute query embedding
        float[] queryEmbedding;
        String queryText = null;

        if (input.has("embedding") && input.get("embedding").isArray()) {
            // Use pre-computed embedding
            queryEmbedding = jsonArrayToFloatArray(input.get("embedding"));
        } else if (input.has("query") && input.get("query").isTextual()) {
            // Compute embedding from query text
            queryText = input.get("query").asText();
            if (queryText.isEmpty()) {
                return NodeExecutionResult.failure("Query text is empty");
            }

            try {
                queryEmbedding = computeQueryEmbedding(queryText, config, context);
            } catch (Exception e) {
                LOG.errorf(e, "Failed to compute query embedding");
                return NodeExecutionResult.failure("Failed to compute query embedding: " + e.getMessage(), true);
            }
        } else {
            return NodeExecutionResult.failure(
                    "Input must contain either 'query' (text) or 'embedding' (vector array)");
        }

        // Get metadata filter if provided
        Map<String, Object> metadataFilter = null;
        if (input.has("metadataFilter") && input.get("metadataFilter").isObject()) {
            metadataFilter = new HashMap<>();
            input.get("metadataFilter").fields().forEachRemaining(entry ->
                metadataFilter.put(entry.getKey(), entry.getValue().asText()));
        }

        // Perform search
        List<VectorStoreService.VectorSearchResult> results = vectorStoreService.search(
                workflowId,
                isolationKey,
                collectionName,
                queryEmbedding,
                topK,
                minScore > 0 ? minScore : null,
                metadataFilter
        );

        // Build output
        ObjectNode output = objectMapper.createObjectNode();

        ArrayNode resultsArray = objectMapper.createArrayNode();
        for (VectorStoreService.VectorSearchResult result : results) {
            ObjectNode resultNode = objectMapper.createObjectNode();

            if (includeContent) {
                resultNode.put("content", result.content);
            }
            resultNode.put("score", result.score);
            resultNode.put("id", result.id.toString());

            if (result.sourceId != null) {
                resultNode.put("sourceId", result.sourceId);
            }
            if (result.sourceType != null) {
                resultNode.put("sourceType", result.sourceType);
            }
            resultNode.put("chunkIndex", result.chunkIndex);

            if (includeMetadata && result.metadata != null) {
                try {
                    JsonNode metadataNode = objectMapper.readTree(result.metadata);
                    resultNode.set("metadata", metadataNode);
                } catch (Exception e) {
                    resultNode.put("metadata", result.metadata);
                }
            }

            resultsArray.add(resultNode);
        }

        output.set("results", resultsArray);
        output.put("count", results.size());
        output.put("collection", collectionName);
        output.put("topK", topK);

        if (queryText != null) {
            output.put("query", queryText);
        }
        if (isolationKey != null) {
            output.put("isolationKey", isolationKey);
        }

        LOG.debugf("Vector search found %d results in collection '%s' (topK=%d, minScore=%.2f)",
                   results.size(), collectionName, topK, minScore);

        return NodeExecutionResult.success(output);
    }

    /**
     * Compute embedding for query text using configured provider.
     */
    private float[] computeQueryEmbedding(String query, JsonNode config, ExecutionContext context) throws Exception {
        String providerName = config.has("provider") ? config.get("provider").asText() : "openai";
        EmbeddingProvider provider = providerFactory.getProvider(providerName);

        if (provider == null) {
            throw new IllegalArgumentException("Unknown embedding provider: " + providerName);
        }

        String model = config.has("model") && !config.get("model").asText().isEmpty()
                ? config.get("model").asText()
                : provider.getDefaultModel();

        // Get API key (not needed for local provider)
        String apiKey = null;
        String baseUrl = null;

        if (!"local".equalsIgnoreCase(providerName)) {
            String apiKeyPath = config.has("apiKeyPath") ? config.get("apiKeyPath").asText() : null;
            if (apiKeyPath != null && !apiKeyPath.isEmpty()) {
                apiKey = fetchFromKvStore(apiKeyPath, context);
            }

            if ("ollama".equalsIgnoreCase(providerName)) {
                String apiUrlPath = config.has("apiUrlPath") ? config.get("apiUrlPath").asText() : null;
                if (apiUrlPath != null && !apiUrlPath.isEmpty()) {
                    baseUrl = fetchFromKvStore(apiUrlPath, context);
                }
            }
        }

        EmbeddingProvider.EmbeddingResult result = provider.embed(query, model, apiKey, baseUrl);

        if (!result.isSuccess()) {
            throw new RuntimeException(result.getError());
        }

        return result.getEmbedding();
    }

    private float[] jsonArrayToFloatArray(JsonNode arrayNode) {
        if (arrayNode == null || !arrayNode.isArray()) {
            return null;
        }
        float[] result = new float[arrayNode.size()];
        for (int i = 0; i < arrayNode.size(); i++) {
            result[i] = (float) arrayNode.get(i).asDouble();
        }
        return result;
    }

    private String fetchFromKvStore(String keyPath, ExecutionContext context) {
        try {
            String appId = null;
            JsonNode input = context.getInput();
            if (input.has("applicationId")) {
                appId = input.get("applicationId").asText();
            } else if (context.getExecution() != null && context.getExecution().workflow != null) {
                appId = context.getExecution().workflow.applicationId;
            }

            if (appId == null) {
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
