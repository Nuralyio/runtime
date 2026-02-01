package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.configuration.Configuration;
import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import com.nuraly.workflows.memory.ConversationMemoryService;
import com.nuraly.workflows.memory.ConversationMemoryService.ConversationMessage;
import com.nuraly.workflows.memory.ConversationMemoryService.EmbeddingConfig;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.apache.hc.client5.http.classic.methods.HttpGet;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.jboss.logging.Logger;

import java.util.*;

/**
 * Context Memory Node Executor - RAG-enhanced conversation memory for LLM nodes.
 *
 * Provides three memory modes:
 * 1. Buffer Memory: Recent N messages (fast, ordered)
 * 2. Semantic Memory: Top-K similar messages via vector search (contextual)
 * 3. Hybrid Memory: Buffer + Semantic combined (best of both)
 *
 * Node Configuration:
 * {
 *   "memoryMode": "buffer" | "semantic" | "hybrid",  // Memory retrieval mode
 *
 *   // Buffer settings
 *   "maxMessages": 50,                    // Max recent messages
 *   "maxTokens": 4000,                    // Max tokens for context window
 *
 *   // Semantic settings (requires embedding)
 *   "semanticTopK": 5,                    // Number of similar messages to retrieve
 *   "minSimilarityScore": 0.7,            // Minimum similarity threshold
 *
 *   // Hybrid settings
 *   "recentCount": 10,                    // Recent messages in hybrid mode
 *   "semanticCount": 5,                   // Semantic matches in hybrid mode
 *
 *   // Embedding configuration (for semantic/hybrid modes)
 *   "embeddingProvider": "openai",        // openai, ollama, local
 *   "embeddingModel": "text-embedding-3-small",
 *   "embeddingApiKeyPath": "openai/embedding-key",
 *
 *   // Conversation ID
 *   "conversationIdExpression": "${input.threadId}"
 * }
 *
 * Input:
 *   { "threadId": "conv-123", "message": "What was discussed earlier?" }
 *
 * Output:
 *   {
 *     "messages": [
 *       { "role": "user", "content": "Hello" },
 *       { "role": "assistant", "content": "Hi there!" }
 *     ],
 *     "messageCount": 10,
 *     "tokenCount": 450,
 *     "conversationId": "conv-123",
 *     "memoryMode": "hybrid"
 *   }
 *
 * Operations (via input.operation):
 *   - "load" (default): Load conversation history
 *   - "save": Save a new message
 *   - "clear": Delete conversation history
 *   - "stats": Get conversation statistics
 */
@ApplicationScoped
public class ContextMemoryNodeExecutor implements NodeExecutor {

    private static final Logger LOG = Logger.getLogger(ContextMemoryNodeExecutor.class);

    // Defaults
    private static final String DEFAULT_MEMORY_MODE = "buffer";
    private static final int DEFAULT_MAX_MESSAGES = 50;
    private static final int DEFAULT_MAX_TOKENS = 4000;
    private static final int DEFAULT_SEMANTIC_TOP_K = 5;
    private static final double DEFAULT_MIN_SIMILARITY = 0.7;
    private static final int DEFAULT_RECENT_COUNT = 10;
    private static final int DEFAULT_SEMANTIC_COUNT = 5;
    private static final String DEFAULT_CONVERSATION_ID_EXPRESSION = "${input.threadId}";

    @Inject
    ConversationMemoryService memoryService;

    @Inject
    Configuration configuration;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public NodeType getType() {
        return NodeType.MEMORY;
    }

    @Override
    public NodeExecutionResult execute(ExecutionContext context, WorkflowNodeEntity node) throws Exception {
        LOG.debugf("Context Memory node executed: %s", node.name);

        // Parse configuration
        JsonNode config = node.configuration != null
                ? objectMapper.readTree(node.configuration)
                : objectMapper.createObjectNode();
        JsonNode input = context.getInput();

        // Get workflow ID
        UUID workflowId = null;
        if (context.getExecution() != null && context.getExecution().workflow != null) {
            workflowId = context.getExecution().workflow.id;
        }
        if (workflowId == null) {
            return NodeExecutionResult.failure("Could not determine workflow ID for memory operations");
        }

        // Resolve conversation ID
        String conversationId = resolveConversationId(config, context);
        if (conversationId == null || conversationId.isEmpty()) {
            return NodeExecutionResult.failure(
                    "Could not resolve conversation ID. Provide threadId, conversationId, or sessionId in input.");
        }

        // Determine operation
        String operation = input.has("operation") ? input.get("operation").asText() : "load";

        // Build embedding config for semantic operations
        EmbeddingConfig embeddingConfig = buildEmbeddingConfig(config, context);

        // Execute operation
        return switch (operation.toLowerCase()) {
            case "save" -> executeSave(workflowId, conversationId, input, embeddingConfig);
            case "clear" -> executeClear(workflowId, conversationId);
            case "stats" -> executeStats(workflowId, conversationId);
            default -> executeLoad(workflowId, conversationId, config, input, embeddingConfig, node);
        };
    }

    /**
     * Load conversation history based on memory mode.
     */
    private NodeExecutionResult executeLoad(
            UUID workflowId,
            String conversationId,
            JsonNode config,
            JsonNode input,
            EmbeddingConfig embeddingConfig,
            WorkflowNodeEntity node) {

        String memoryMode = config.has("memoryMode")
                ? config.get("memoryMode").asText()
                : DEFAULT_MEMORY_MODE;

        int maxMessages = config.has("maxMessages")
                ? config.get("maxMessages").asInt()
                : DEFAULT_MAX_MESSAGES;

        int maxTokens = config.has("maxTokens")
                ? config.get("maxTokens").asInt()
                : DEFAULT_MAX_TOKENS;

        List<ConversationMessage> messages;

        switch (memoryMode.toLowerCase()) {
            case "semantic" -> {
                // Pure semantic search - needs a query
                String query = extractQuery(input);
                if (query == null || query.isEmpty()) {
                    return NodeExecutionResult.failure(
                            "Semantic memory mode requires a query. Provide 'message' or 'query' in input.");
                }

                int topK = config.has("semanticTopK")
                        ? config.get("semanticTopK").asInt()
                        : DEFAULT_SEMANTIC_TOP_K;

                double minScore = config.has("minSimilarityScore")
                        ? config.get("minSimilarityScore").asDouble()
                        : DEFAULT_MIN_SIMILARITY;

                messages = memoryService.getSimilarMessages(
                        workflowId, conversationId, query, topK, minScore, embeddingConfig);
            }

            case "hybrid" -> {
                // Hybrid: recent + semantic
                String query = extractQuery(input);
                if (query == null || query.isEmpty()) {
                    // Fall back to buffer mode if no query
                    messages = memoryService.getRecentMessages(
                            workflowId, conversationId, maxMessages, maxTokens);
                } else {
                    int recentCount = config.has("recentCount")
                            ? config.get("recentCount").asInt()
                            : DEFAULT_RECENT_COUNT;

                    int semanticCount = config.has("semanticCount")
                            ? config.get("semanticCount").asInt()
                            : DEFAULT_SEMANTIC_COUNT;

                    double minScore = config.has("minSimilarityScore")
                            ? config.get("minSimilarityScore").asDouble()
                            : DEFAULT_MIN_SIMILARITY;

                    messages = memoryService.getHybridMemory(
                            workflowId, conversationId, query,
                            recentCount, semanticCount, maxTokens, minScore, embeddingConfig);
                }
            }

            default -> {
                // Buffer mode (default)
                messages = memoryService.getRecentMessages(
                        workflowId, conversationId, maxMessages, maxTokens);
            }
        }

        // Build output
        ObjectNode output = objectMapper.createObjectNode();
        output.set("messages", memoryService.formatAsLlmMessages(messages));
        output.put("messageCount", messages.size());
        output.put("tokenCount", messages.stream().mapToInt(m -> m.tokenCount).sum());
        output.put("conversationId", conversationId);
        output.put("memoryMode", memoryMode);

        // Add memory config for LLM node reference
        output.put("type", "context_memory");
        output.put("memoryNodeId", node.id != null ? node.id.toString() : "");
        output.put("maxMessages", maxMessages);
        output.put("maxTokens", maxTokens);

        LOG.debugf("Loaded %d messages (%s mode) for conversation %s",
                messages.size(), memoryMode, conversationId);

        return NodeExecutionResult.success(output);
    }

    /**
     * Save a new message to conversation history.
     */
    private NodeExecutionResult executeSave(
            UUID workflowId,
            String conversationId,
            JsonNode input,
            EmbeddingConfig embeddingConfig) {

        // Get message details
        String role = input.has("role") ? input.get("role").asText() : "user";
        String content = null;

        if (input.has("content")) {
            content = input.get("content").asText();
        } else if (input.has("message")) {
            content = input.get("message").asText();
        }

        if (content == null || content.isEmpty()) {
            return NodeExecutionResult.failure("Message content is required for save operation");
        }

        // Extract metadata
        Map<String, Object> metadata = new HashMap<>();
        if (input.has("metadata") && input.get("metadata").isObject()) {
            input.get("metadata").fields().forEachRemaining(entry ->
                    metadata.put(entry.getKey(), entry.getValue().asText()));
        }

        // Handle tool_calls for assistant messages
        if (input.has("tool_calls") && input.get("tool_calls").isArray()) {
            metadata.put("tool_calls", input.get("tool_calls"));
        }

        // Save message
        UUID messageId = memoryService.saveMessage(
                workflowId, conversationId, role, content, metadata, embeddingConfig);

        // Build output
        ObjectNode output = objectMapper.createObjectNode();
        output.put("messageId", messageId.toString());
        output.put("conversationId", conversationId);
        output.put("role", role);
        output.put("saved", true);

        LOG.debugf("Saved message %s (role=%s) to conversation %s", messageId, role, conversationId);

        return NodeExecutionResult.success(output);
    }

    /**
     * Clear conversation history.
     */
    private NodeExecutionResult executeClear(UUID workflowId, String conversationId) {
        int deleted = memoryService.deleteConversation(workflowId, conversationId);

        ObjectNode output = objectMapper.createObjectNode();
        output.put("conversationId", conversationId);
        output.put("deleted", deleted);
        output.put("cleared", true);

        LOG.infof("Cleared conversation %s: %d messages deleted", conversationId, deleted);

        return NodeExecutionResult.success(output);
    }

    /**
     * Get conversation statistics.
     */
    private NodeExecutionResult executeStats(UUID workflowId, String conversationId) {
        var stats = memoryService.getStats(workflowId, conversationId);

        ObjectNode output = objectMapper.createObjectNode();
        output.put("conversationId", conversationId);
        output.put("messageCount", stats.messageCount);
        output.put("totalTokens", stats.totalTokens);

        if (stats.firstMessage != null) {
            output.put("firstMessage", stats.firstMessage.toString());
        }
        if (stats.lastMessage != null) {
            output.put("lastMessage", stats.lastMessage.toString());
        }

        return NodeExecutionResult.success(output);
    }

    // ========================================================================
    // Helper Methods
    // ========================================================================

    private String resolveConversationId(JsonNode config, ExecutionContext context) {
        // Try expression first
        String expression = config.has("conversationIdExpression")
                ? config.get("conversationIdExpression").asText()
                : DEFAULT_CONVERSATION_ID_EXPRESSION;

        String resolved = context.resolveExpression(expression);
        if (resolved != null && !resolved.isEmpty() && !resolved.equals(expression)) {
            return resolved;
        }

        // Try common input fields
        JsonNode input = context.getInput();
        String[] possibleFields = {"threadId", "conversationId", "sessionId", "chatId",
                "thread_id", "conversation_id", "session_id"};

        for (String field : possibleFields) {
            if (input.has(field) && !input.get(field).isNull()) {
                String value = input.get(field).asText();
                if (value != null && !value.isEmpty()) {
                    LOG.debugf("Resolved conversationId from input.%s: %s", field, value);
                    return value;
                }
            }
        }

        // Try nested body
        if (input.has("body") && input.get("body").isObject()) {
            JsonNode body = input.get("body");
            for (String field : possibleFields) {
                if (body.has(field) && !body.get(field).isNull()) {
                    String value = body.get(field).asText();
                    if (value != null && !value.isEmpty()) {
                        LOG.debugf("Resolved conversationId from input.body.%s: %s", field, value);
                        return value;
                    }
                }
            }
        }

        // Try variables
        for (String field : possibleFields) {
            JsonNode varValue = context.getVariable(field);
            if (varValue != null && !varValue.isNull()) {
                String value = varValue.asText();
                if (value != null && !value.isEmpty()) {
                    LOG.debugf("Resolved conversationId from variable %s: %s", field, value);
                    return value;
                }
            }
        }

        return null;
    }

    private String extractQuery(JsonNode input) {
        // Try various query field names
        String[] queryFields = {"message", "query", "question", "input", "text", "content"};

        for (String field : queryFields) {
            if (input.has(field) && input.get(field).isTextual()) {
                String value = input.get(field).asText();
                if (value != null && !value.isEmpty()) {
                    return value;
                }
            }
        }

        // Try nested body
        if (input.has("body") && input.get("body").isObject()) {
            JsonNode body = input.get("body");
            for (String field : queryFields) {
                if (body.has(field) && body.get(field).isTextual()) {
                    String value = body.get(field).asText();
                    if (value != null && !value.isEmpty()) {
                        return value;
                    }
                }
            }
        }

        return null;
    }

    private EmbeddingConfig buildEmbeddingConfig(JsonNode config, ExecutionContext context) {
        EmbeddingConfig embeddingConfig = new EmbeddingConfig();

        // Check if embedding is disabled
        if (config.has("enableSemanticSearch") && !config.get("enableSemanticSearch").asBoolean()) {
            return EmbeddingConfig.disabled();
        }

        // Provider
        embeddingConfig.provider = config.has("embeddingProvider")
                ? config.get("embeddingProvider").asText()
                : "openai";

        // Model
        if (config.has("embeddingModel")) {
            embeddingConfig.model = config.get("embeddingModel").asText();
        }

        // API Key
        String apiKeyPath = config.has("embeddingApiKeyPath")
                ? config.get("embeddingApiKeyPath").asText()
                : null;

        if (apiKeyPath != null && !apiKeyPath.isEmpty()) {
            embeddingConfig.apiKey = fetchFromKvStore(apiKeyPath, context);
        }

        // Base URL (for Ollama)
        if ("ollama".equalsIgnoreCase(embeddingConfig.provider)) {
            String apiUrlPath = config.has("embeddingApiUrlPath")
                    ? config.get("embeddingApiUrlPath").asText()
                    : null;

            if (apiUrlPath != null && !apiUrlPath.isEmpty()) {
                embeddingConfig.baseUrl = fetchFromKvStore(apiUrlPath, context);
            }
        }

        // For local provider, no API key needed
        if ("local".equalsIgnoreCase(embeddingConfig.provider)) {
            return embeddingConfig;
        }

        // Disable if no API key for non-local providers
        if (embeddingConfig.apiKey == null && !"ollama".equalsIgnoreCase(embeddingConfig.provider)) {
            LOG.debug("No embedding API key configured, semantic search disabled");
            return EmbeddingConfig.disabled();
        }

        return embeddingConfig;
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

    /**
     * Validate memory mode.
     */
    public static boolean isValidMemoryMode(String mode) {
        return "buffer".equalsIgnoreCase(mode) ||
                "semantic".equalsIgnoreCase(mode) ||
                "hybrid".equalsIgnoreCase(mode);
    }
}
