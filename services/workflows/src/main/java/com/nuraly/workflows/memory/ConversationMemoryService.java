package com.nuraly.workflows.memory;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.embedding.EmbeddingProvider;
import com.nuraly.workflows.embedding.EmbeddingProviderFactory;
import com.nuraly.workflows.entity.EmbeddingEntity;
import com.nuraly.workflows.vector.VectorStoreService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

import java.time.Instant;
import java.util.*;

/**
 * Service for RAG-enhanced conversation memory.
 * Stores conversation messages with embeddings for semantic retrieval.
 *
 * Features:
 * - Buffer memory: Recent N messages by timestamp
 * - Semantic memory: Top-K similar messages by embedding similarity
 * - Hybrid memory: Combination of buffer + semantic (deduplicated)
 *
 * Storage:
 * - Messages stored in conversation_messages table (structured data)
 * - Embeddings stored in embeddings table (vector search)
 * - Linked by message_id for retrieval
 */
@ApplicationScoped
public class ConversationMemoryService {

    private static final Logger LOG = Logger.getLogger(ConversationMemoryService.class);
    private static final String MEMORY_COLLECTION_PREFIX = "conversation-memory-";
    private static final int DEFAULT_EMBEDDING_DIMENSION = 1536;

    @Inject
    EntityManager entityManager;

    @Inject
    VectorStoreService vectorStoreService;

    @Inject
    EmbeddingProviderFactory embeddingProviderFactory;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Save a conversation message with embedding for semantic search.
     *
     * @param workflowId Workflow ID for multi-tenancy
     * @param conversationId Unique conversation/thread ID
     * @param role Message role (user, assistant, system)
     * @param content Message content
     * @param metadata Optional metadata (tool calls, etc.)
     * @param embeddingConfig Embedding configuration (provider, model, apiKey)
     * @return The saved message ID
     */
    @Transactional
    public UUID saveMessage(
            UUID workflowId,
            String conversationId,
            String role,
            String content,
            Map<String, Object> metadata,
            EmbeddingConfig embeddingConfig) {

        UUID messageId = UUID.randomUUID();
        Instant now = Instant.now();

        // 1. Save message to conversation_messages table
        String metadataJson = metadata != null ? toJson(metadata) : "{}";

        String insertSql = """
            INSERT INTO conversation_messages (
                id, workflow_id, conversation_id, role, content, metadata,
                token_count, created_at
            ) VALUES (
                :id, :workflowId, :conversationId, :role, :content, :metadata::jsonb,
                :tokenCount, :createdAt
            )
            """;

        int tokenCount = estimateTokens(content);

        entityManager.createNativeQuery(insertSql)
                .setParameter("id", messageId)
                .setParameter("workflowId", workflowId)
                .setParameter("conversationId", conversationId)
                .setParameter("role", role)
                .setParameter("content", content)
                .setParameter("metadata", metadataJson)
                .setParameter("tokenCount", tokenCount)
                .setParameter("createdAt", java.sql.Timestamp.from(now))
                .executeUpdate();

        // 2. Generate and store embedding for semantic search
        if (embeddingConfig != null && embeddingConfig.isEnabled()) {
            try {
                float[] embedding = generateEmbedding(content, embeddingConfig);

                if (embedding != null) {
                    EmbeddingEntity embeddingEntity = new EmbeddingEntity();
                    embeddingEntity.workflowId = workflowId;
                    embeddingEntity.collectionName = getCollectionName(conversationId);
                    embeddingEntity.content = content;
                    embeddingEntity.embedding = embedding;
                    embeddingEntity.sourceId = messageId.toString();
                    embeddingEntity.sourceType = "conversation_message";
                    embeddingEntity.metadata = objectMapper.createObjectNode()
                            .put("role", role)
                            .put("conversationId", conversationId)
                            .put("messageId", messageId.toString())
                            .toString();
                    embeddingEntity.tokenCount = tokenCount;

                    vectorStoreService.store(embeddingEntity);
                    LOG.debugf("Stored embedding for message %s in conversation %s", messageId, conversationId);
                }
            } catch (Exception e) {
                LOG.warnf(e, "Failed to generate embedding for message %s, continuing without semantic search", messageId);
            }
        }

        LOG.debugf("Saved message %s: role=%s, tokens=%d, conversation=%s",
                messageId, role, tokenCount, conversationId);

        return messageId;
    }

    /**
     * Get recent messages (buffer memory).
     *
     * @param workflowId Workflow ID
     * @param conversationId Conversation ID
     * @param maxMessages Maximum number of messages to return
     * @param maxTokens Maximum total tokens (optional, 0 = unlimited)
     * @return List of messages in chronological order
     */
    public List<ConversationMessage> getRecentMessages(
            UUID workflowId,
            String conversationId,
            int maxMessages,
            int maxTokens) {

        String sql = """
            SELECT id, role, content, metadata, token_count, created_at
            FROM conversation_messages
            WHERE workflow_id = :workflowId
              AND conversation_id = :conversationId
            ORDER BY created_at DESC
            LIMIT :limit
            """;

        @SuppressWarnings("unchecked")
        List<Object[]> results = entityManager.createNativeQuery(sql)
                .setParameter("workflowId", workflowId)
                .setParameter("conversationId", conversationId)
                .setParameter("limit", maxMessages)
                .getResultList();

        List<ConversationMessage> messages = new ArrayList<>();
        int totalTokens = 0;

        for (Object[] row : results) {
            int tokenCount = ((Number) row[4]).intValue();

            // Check token limit
            if (maxTokens > 0 && totalTokens + tokenCount > maxTokens) {
                break;
            }

            ConversationMessage message = new ConversationMessage();
            message.id = (UUID) row[0];
            message.role = (String) row[1];
            message.content = (String) row[2];
            message.metadata = parseJson((String) row[3]);
            message.tokenCount = tokenCount;
            message.createdAt = ((java.sql.Timestamp) row[5]).toInstant();

            messages.add(message);
            totalTokens += tokenCount;
        }

        // Reverse to chronological order
        Collections.reverse(messages);

        LOG.debugf("Retrieved %d recent messages (%d tokens) for conversation %s",
                messages.size(), totalTokens, conversationId);

        return messages;
    }

    /**
     * Get semantically similar messages (semantic memory).
     *
     * @param workflowId Workflow ID
     * @param conversationId Conversation ID
     * @param query Query text to find similar messages
     * @param topK Number of similar messages to return
     * @param minScore Minimum similarity score (0-1)
     * @param embeddingConfig Embedding configuration
     * @return List of similar messages with scores
     */
    public List<ConversationMessage> getSimilarMessages(
            UUID workflowId,
            String conversationId,
            String query,
            int topK,
            double minScore,
            EmbeddingConfig embeddingConfig) {

        if (embeddingConfig == null || !embeddingConfig.isEnabled()) {
            LOG.debug("Embedding not configured, returning empty semantic results");
            return Collections.emptyList();
        }

        try {
            // Generate query embedding
            float[] queryEmbedding = generateEmbedding(query, embeddingConfig);
            if (queryEmbedding == null) {
                return Collections.emptyList();
            }

            // Search vector store
            List<VectorStoreService.VectorSearchResult> searchResults = vectorStoreService.search(
                    workflowId,
                    getCollectionName(conversationId),
                    queryEmbedding,
                    topK,
                    minScore > 0 ? minScore : null,
                    null
            );

            // Convert to ConversationMessage objects
            List<ConversationMessage> messages = new ArrayList<>();
            for (VectorStoreService.VectorSearchResult result : searchResults) {
                ConversationMessage message = new ConversationMessage();
                message.id = UUID.fromString(result.sourceId);
                message.content = result.content;
                message.similarityScore = result.score;
                message.metadata = result.getMetadataAsMap();

                // Get role from metadata
                if (message.metadata.containsKey("role")) {
                    message.role = (String) message.metadata.get("role");
                }

                messages.add(message);
            }

            LOG.debugf("Found %d semantically similar messages for query in conversation %s",
                    messages.size(), conversationId);

            return messages;

        } catch (Exception e) {
            LOG.warnf(e, "Failed to perform semantic search for conversation %s", conversationId);
            return Collections.emptyList();
        }
    }

    /**
     * Get hybrid memory (buffer + semantic, deduplicated).
     *
     * @param workflowId Workflow ID
     * @param conversationId Conversation ID
     * @param query Current query for semantic search
     * @param recentCount Number of recent messages to include
     * @param semanticCount Number of semantic matches to include
     * @param maxTokens Maximum total tokens
     * @param minScore Minimum similarity score for semantic results
     * @param embeddingConfig Embedding configuration
     * @return Combined list of messages
     */
    public List<ConversationMessage> getHybridMemory(
            UUID workflowId,
            String conversationId,
            String query,
            int recentCount,
            int semanticCount,
            int maxTokens,
            double minScore,
            EmbeddingConfig embeddingConfig) {

        // Get recent messages
        List<ConversationMessage> recentMessages = getRecentMessages(
                workflowId, conversationId, recentCount, 0);

        // Get semantic matches
        List<ConversationMessage> semanticMessages = getSimilarMessages(
                workflowId, conversationId, query, semanticCount, minScore, embeddingConfig);

        // Deduplicate and merge
        Set<UUID> seenIds = new HashSet<>();
        List<ConversationMessage> combined = new ArrayList<>();
        int totalTokens = 0;

        // Add recent messages first (preserve conversation flow)
        for (ConversationMessage msg : recentMessages) {
            if (maxTokens > 0 && totalTokens + msg.tokenCount > maxTokens) {
                break;
            }
            seenIds.add(msg.id);
            combined.add(msg);
            totalTokens += msg.tokenCount;
        }

        // Add semantic matches that aren't already included
        for (ConversationMessage msg : semanticMessages) {
            if (seenIds.contains(msg.id)) {
                continue;
            }
            if (maxTokens > 0 && totalTokens + msg.tokenCount > maxTokens) {
                break;
            }
            msg.fromSemanticSearch = true;
            combined.add(msg);
            totalTokens += msg.tokenCount;
        }

        // Sort by timestamp if available
        combined.sort(Comparator.comparing(m -> m.createdAt != null ? m.createdAt : Instant.MIN));

        LOG.debugf("Hybrid memory: %d recent + %d semantic = %d total (%d tokens) for conversation %s",
                recentMessages.size(), semanticMessages.size() - (combined.size() - recentMessages.size()),
                combined.size(), totalTokens, conversationId);

        return combined;
    }

    /**
     * Delete all messages for a conversation.
     */
    @Transactional
    public int deleteConversation(UUID workflowId, String conversationId) {
        // Delete from conversation_messages
        int deleted = entityManager.createNativeQuery("""
            DELETE FROM conversation_messages
            WHERE workflow_id = :workflowId AND conversation_id = :conversationId
            """)
                .setParameter("workflowId", workflowId)
                .setParameter("conversationId", conversationId)
                .executeUpdate();

        // Delete embeddings
        vectorStoreService.deleteCollection(workflowId, getCollectionName(conversationId));

        LOG.infof("Deleted conversation %s: %d messages", conversationId, deleted);
        return deleted;
    }

    /**
     * Get conversation statistics.
     */
    public ConversationStats getStats(UUID workflowId, String conversationId) {
        String sql = """
            SELECT
                COUNT(*) as message_count,
                SUM(token_count) as total_tokens,
                MIN(created_at) as first_message,
                MAX(created_at) as last_message
            FROM conversation_messages
            WHERE workflow_id = :workflowId AND conversation_id = :conversationId
            """;

        Object[] result = (Object[]) entityManager.createNativeQuery(sql)
                .setParameter("workflowId", workflowId)
                .setParameter("conversationId", conversationId)
                .getSingleResult();

        ConversationStats stats = new ConversationStats();
        stats.messageCount = ((Number) result[0]).longValue();
        stats.totalTokens = result[1] != null ? ((Number) result[1]).longValue() : 0;
        stats.firstMessage = result[2] != null ? ((java.sql.Timestamp) result[2]).toInstant() : null;
        stats.lastMessage = result[3] != null ? ((java.sql.Timestamp) result[3]).toInstant() : null;

        return stats;
    }

    /**
     * Format messages as LLM-ready array.
     */
    public ArrayNode formatAsLlmMessages(List<ConversationMessage> messages) {
        ArrayNode array = objectMapper.createArrayNode();

        for (ConversationMessage msg : messages) {
            ObjectNode msgNode = objectMapper.createObjectNode();
            msgNode.put("role", msg.role);
            msgNode.put("content", msg.content);

            // Add tool calls if present in metadata
            if (msg.metadata != null && msg.metadata.containsKey("tool_calls")) {
                msgNode.set("tool_calls", objectMapper.valueToTree(msg.metadata.get("tool_calls")));
            }

            array.add(msgNode);
        }

        return array;
    }

    // ========================================================================
    // Helper Methods
    // ========================================================================

    private String getCollectionName(String conversationId) {
        return MEMORY_COLLECTION_PREFIX + conversationId;
    }

    private float[] generateEmbedding(String text, EmbeddingConfig config) throws Exception {
        EmbeddingProvider provider = embeddingProviderFactory.getProvider(config.provider);
        if (provider == null) {
            throw new IllegalArgumentException("Unknown embedding provider: " + config.provider);
        }

        EmbeddingProvider.EmbeddingResult result = provider.embed(
                text,
                config.model != null ? config.model : provider.getDefaultModel(),
                config.apiKey,
                config.baseUrl
        );

        if (!result.isSuccess()) {
            throw new RuntimeException(result.getError());
        }

        return result.getEmbedding();
    }

    private int estimateTokens(String text) {
        if (text == null || text.isEmpty()) return 0;
        // Rough estimate: ~4 chars per token
        return (int) Math.ceil(text.length() / 4.0);
    }

    private String toJson(Map<String, Object> map) {
        try {
            return objectMapper.writeValueAsString(map);
        } catch (Exception e) {
            return "{}";
        }
    }

    private Map<String, Object> parseJson(String json) {
        if (json == null || json.isEmpty()) return new HashMap<>();
        try {
            return objectMapper.readValue(json, Map.class);
        } catch (Exception e) {
            return new HashMap<>();
        }
    }

    // ========================================================================
    // Data Classes
    // ========================================================================

    /**
     * Conversation message.
     */
    public static class ConversationMessage {
        public UUID id;
        public String role;
        public String content;
        public Map<String, Object> metadata;
        public int tokenCount;
        public Instant createdAt;
        public double similarityScore;
        public boolean fromSemanticSearch;
    }

    /**
     * Conversation statistics.
     */
    public static class ConversationStats {
        public long messageCount;
        public long totalTokens;
        public Instant firstMessage;
        public Instant lastMessage;
    }

    /**
     * Embedding configuration.
     */
    public static class EmbeddingConfig {
        public String provider = "openai";
        public String model;
        public String apiKey;
        public String baseUrl;
        private boolean enabled = true;

        public boolean isEnabled() {
            return enabled && provider != null;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }

        public static EmbeddingConfig disabled() {
            EmbeddingConfig config = new EmbeddingConfig();
            config.enabled = false;
            return config;
        }
    }
}
