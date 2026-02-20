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
 *   "inputField": "message",                 // Field name to read query from (default: "query")
 *
 *   // Embedding settings (to embed the query)
 *   "provider": "openai",                    // Embedding provider
 *   "model": "text-embedding-3-small",       // Embedding model
 *   "apiKeyPath": "openai/embedding-key"     // API key path in KV store
 * }
 *
 * Input:
 *   { "query": "What is the return policy?" }  // or custom field via inputField config
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
    private static final String QUERY = "query";

    @Inject
    VectorStoreService vectorStoreService;

    @Inject
    EmbeddingProviderFactory providerFactory;

    @Inject
    Configuration configuration;

    @Inject
    com.nuraly.workflows.monitoring.RagMetricsService ragMetrics;

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

        if (!config.has("collectionName") || config.get("collectionName").asText().isEmpty()) {
            return NodeExecutionResult.failure("collectionName is required in VECTOR_SEARCH configuration");
        }

        SearchParams params = parseSearchParams(config, input, context);
        if (params.error != null) {
            return params.error;
        }

        List<VectorStoreService.VectorSearchResult> results = executeSearch(params);

        ObjectNode output = buildSearchOutput(results, params);

        LOG.debugf("Vector search found %d results in collection '%s' (topK=%d, minScore=%.2f)",
                   results.size(), params.collectionName, params.topK, params.minScore);

        return NodeExecutionResult.success(output);
    }

    private SearchParams parseSearchParams(JsonNode config, JsonNode input, ExecutionContext context) throws Exception {
        SearchParams params = new SearchParams();
        params.collectionName = config.get("collectionName").asText();
        params.topK = config.has("topK") ? config.get("topK").asInt() : DEFAULT_TOP_K;
        params.minScore = config.has("minScore") ? config.get("minScore").asDouble() : DEFAULT_MIN_SCORE;
        params.includeContent = !config.has("includeContent") || config.get("includeContent").asBoolean();
        params.includeMetadata = !config.has("includeMetadata") || config.get("includeMetadata").asBoolean();

        params.workflowId = resolveWorkflowId(context);
        if (params.workflowId == null) {
            params.error = NodeExecutionResult.failure("Could not determine workflow ID for vector search");
            return params;
        }

        params.isolationKey = resolveIsolationKey(input, config);
        params.metadataFilter = parseMetadataFilter(input);
        String inputField = config.has("inputField") && !config.get("inputField").asText().isEmpty()
                ? config.get("inputField").asText() : QUERY;

        return resolveEmbedding(params, input, inputField, config, context);
    }

    private SearchParams resolveEmbedding(SearchParams params, JsonNode input, String inputField,
                                           JsonNode config, ExecutionContext context) {
        if (input.has("embedding") && input.get("embedding").isArray()) {
            params.queryEmbedding = jsonArrayToFloatArray(input.get("embedding"));
            return params;
        }

        params.queryText = resolveQueryText(input, inputField, context);

        if (params.queryText == null || params.queryText.isEmpty()) {
            params.error = NodeExecutionResult.failure(
                    "Input must contain either '" + inputField + "' (text), '" + QUERY + "' (text), or 'embedding' (vector array)");
            return params;
        }

        try {
            params.queryEmbedding = computeQueryEmbedding(params.queryText, config, context);
        } catch (Exception e) {
            LOG.errorf(e, "Failed to compute query embedding");
            params.error = NodeExecutionResult.failure("Failed to compute query embedding: " + e.getMessage(), true);
        }
        return params;
    }

    private UUID resolveWorkflowId(ExecutionContext context) {
        if (context.getExecution() != null && context.getExecution().workflow != null) {
            return context.getExecution().workflow.id;
        }
        return null;
    }

    private String resolveIsolationKey(JsonNode input, JsonNode config) {
        if (input.has("isolationKey")) {
            return input.get("isolationKey").asText();
        }
        if (config.has("isolationKey")) {
            return config.get("isolationKey").asText();
        }
        return null;
    }

    private String resolveQueryText(JsonNode input, String inputField, ExecutionContext context) {
        String queryText = null;
        if (inputField.contains("${")) {
            String resolved = context.resolveExpression(inputField);
            if (resolved != null && !resolved.isEmpty()) {
                queryText = resolved;
            }
        } else {
            JsonNode fieldValue = resolveJsonPath(input, inputField);
            if (fieldValue != null && fieldValue.isTextual()) {
                queryText = fieldValue.asText();
            }
        }

        if ((queryText == null || queryText.isEmpty()) && !inputField.equals(QUERY)
                && input.has(QUERY) && input.get(QUERY).isTextual()) {
            queryText = input.get(QUERY).asText();
        }
        return queryText;
    }

    private Map<String, Object> parseMetadataFilter(JsonNode input) {
        if (input == null || !input.has("metadataFilter") || !input.get("metadataFilter").isObject()) {
            return null;
        }
        final Map<String, Object> filterMap = new HashMap<>();
        input.get("metadataFilter").fields().forEachRemaining(entry ->
            filterMap.put(entry.getKey(), entry.getValue().asText()));
        return filterMap;
    }

    private List<VectorStoreService.VectorSearchResult> executeSearch(SearchParams params) throws Exception {
        long searchStart = System.currentTimeMillis();
        ragMetrics.recordSearchStart();

        try {
            List<VectorStoreService.VectorSearchResult> results = vectorStoreService.search(
                    params.workflowId, params.isolationKey, params.collectionName,
                    params.queryEmbedding, params.topK,
                    params.minScore > 0 ? params.minScore : null, params.metadataFilter);
            long searchDuration = System.currentTimeMillis() - searchStart;
            ragMetrics.recordSearchComplete(params.collectionName, results.size(), searchDuration, true);
            return results;
        } catch (Exception e) {
            long searchDuration = System.currentTimeMillis() - searchStart;
            ragMetrics.recordSearchComplete(params.collectionName, 0, searchDuration, false);
            throw e;
        }
    }

    private ObjectNode buildSearchOutput(List<VectorStoreService.VectorSearchResult> results, SearchParams params) {
        ObjectNode output = objectMapper.createObjectNode();
        ArrayNode resultsArray = objectMapper.createArrayNode();

        for (VectorStoreService.VectorSearchResult result : results) {
            resultsArray.add(buildResultNode(result, params.includeContent, params.includeMetadata));
        }

        output.set("results", resultsArray);
        output.put("count", results.size());
        output.put("collection", params.collectionName);
        output.put("topK", params.topK);

        if (params.queryText != null) {
            output.put(QUERY, params.queryText);
        }
        if (params.isolationKey != null) {
            output.put("isolationKey", params.isolationKey);
        }
        return output;
    }

    private ObjectNode buildResultNode(VectorStoreService.VectorSearchResult result,
                                        boolean includeContent, boolean includeMetadata) {
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
                resultNode.set("metadata", objectMapper.readTree(result.metadata));
            } catch (Exception e) {
                resultNode.put("metadata", result.metadata);
            }
        }
        return resultNode;
    }

    private static class SearchParams {
        String collectionName;
        int topK;
        double minScore;
        boolean includeContent;
        boolean includeMetadata;
        UUID workflowId;
        String isolationKey;
        String queryText;
        float[] queryEmbedding;
        Map<String, Object> metadataFilter;
        NodeExecutionResult error;
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

    /**
     * Resolve a dot-notation path (e.g. "message.text") against a JSON node.
     * Supports both flat keys ("query") and nested paths ("message.text").
     */
    private JsonNode resolveJsonPath(JsonNode root, String path) {
        if (root == null || path == null) {
            return null;
        }
        String[] parts = path.split("\\.");
        JsonNode current = root;
        for (String part : parts) {
            if (current == null) {
                return null;
            }
            current = current.get(part);
        }
        return current;
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
