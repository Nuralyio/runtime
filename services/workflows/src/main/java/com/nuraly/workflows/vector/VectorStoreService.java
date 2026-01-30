package com.nuraly.workflows.vector;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nuraly.workflows.entity.EmbeddingEntity;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

import java.time.Instant;
import java.util.*;

/**
 * Service for vector storage and similarity search operations.
 * Uses native SQL for PGVector-specific operations.
 */
@ApplicationScoped
public class VectorStoreService {

    private static final Logger LOG = Logger.getLogger(VectorStoreService.class);

    @Inject
    EntityManager entityManager;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Store a single embedding.
     */
    @Transactional
    public UUID store(EmbeddingEntity embedding) {
        UUID id = UUID.randomUUID();

        String sql = """
            INSERT INTO embeddings (
                id, workflow_id, isolation_key, collection_name, content, embedding,
                metadata, source_id, source_type, chunk_index, token_count,
                created_at, updated_at
            ) VALUES (
                :id, :workflowId, :isolationKey, :collection, :content, :embedding::vector,
                :metadata::jsonb, :sourceId, :sourceType, :chunkIndex, :tokenCount,
                NOW(), NOW()
            )
            """;

        entityManager.createNativeQuery(sql)
            .setParameter("id", id)
            .setParameter("workflowId", embedding.workflowId)
            .setParameter("isolationKey", embedding.isolationKey)
            .setParameter("collection", embedding.collectionName)
            .setParameter("content", embedding.content)
            .setParameter("embedding", vectorToString(embedding.embedding))
            .setParameter("metadata", embedding.metadata != null ? embedding.metadata : "{}")
            .setParameter("sourceId", embedding.sourceId)
            .setParameter("sourceType", embedding.sourceType)
            .setParameter("chunkIndex", embedding.chunkIndex != null ? embedding.chunkIndex : 0)
            .setParameter("tokenCount", embedding.tokenCount)
            .executeUpdate();

        return id;
    }

    /**
     * Store multiple embeddings in batch.
     */
    @Transactional
    public List<UUID> storeBatch(List<EmbeddingEntity> embeddings) {
        List<UUID> ids = new ArrayList<>();

        for (EmbeddingEntity embedding : embeddings) {
            UUID id = store(embedding);
            ids.add(id);
        }

        return ids;
    }

    /**
     * Search for similar embeddings using cosine similarity.
     *
     * @param workflowId Workflow ID for multi-tenancy
     * @param collectionName Collection to search in
     * @param queryEmbedding Query vector
     * @param topK Number of results to return
     * @param minScore Minimum similarity score (0-1)
     * @param metadataFilter Optional JSONB filter
     * @return List of search results with scores
     */
    public List<VectorSearchResult> search(
            UUID workflowId,
            String collectionName,
            float[] queryEmbedding,
            int topK,
            Double minScore,
            Map<String, Object> metadataFilter) {
        return search(workflowId, null, collectionName, queryEmbedding, topK, minScore, metadataFilter);
    }

    /**
     * Search for similar embeddings using cosine similarity with isolation key.
     *
     * @param workflowId Workflow ID for multi-tenancy
     * @param isolationKey Optional user-defined isolation key (e.g., user_id, tenant_id)
     * @param collectionName Collection to search in
     * @param queryEmbedding Query vector
     * @param topK Number of results to return
     * @param minScore Minimum similarity score (0-1)
     * @param metadataFilter Optional JSONB filter
     * @return List of search results with scores
     */
    public List<VectorSearchResult> search(
            UUID workflowId,
            String isolationKey,
            String collectionName,
            float[] queryEmbedding,
            int topK,
            Double minScore,
            Map<String, Object> metadataFilter) {

        // Build the query
        StringBuilder sql = new StringBuilder("""
            SELECT
                id,
                content,
                metadata,
                source_id,
                source_type,
                chunk_index,
                1 - (embedding <=> :query::vector) as score
            FROM embeddings
            WHERE workflow_id = :workflowId
              AND collection_name = :collection
            """);

        // Add isolation key filter if provided
        if (isolationKey != null && !isolationKey.isEmpty()) {
            sql.append(" AND isolation_key = :isolationKey");
        }

        // Add metadata filter if provided
        if (metadataFilter != null && !metadataFilter.isEmpty()) {
            sql.append(" AND metadata @> :metadataFilter::jsonb");
        }

        // Add minimum score filter
        if (minScore != null && minScore > 0) {
            sql.append(" AND 1 - (embedding <=> :query::vector) >= :minScore");
        }

        sql.append(" ORDER BY embedding <=> :query::vector");
        sql.append(" LIMIT :topK");

        var query = entityManager.createNativeQuery(sql.toString())
            .setParameter("query", vectorToString(queryEmbedding))
            .setParameter("workflowId", workflowId)
            .setParameter("collection", collectionName)
            .setParameter("topK", topK);

        if (isolationKey != null && !isolationKey.isEmpty()) {
            query.setParameter("isolationKey", isolationKey);
        }

        if (metadataFilter != null && !metadataFilter.isEmpty()) {
            query.setParameter("metadataFilter", toJsonString(metadataFilter));
        }

        if (minScore != null && minScore > 0) {
            query.setParameter("minScore", minScore);
        }

        @SuppressWarnings("unchecked")
        List<Object[]> results = query.getResultList();

        List<VectorSearchResult> searchResults = new ArrayList<>();
        for (Object[] row : results) {
            VectorSearchResult result = new VectorSearchResult();
            result.id = (UUID) row[0];
            result.content = (String) row[1];
            result.metadata = (String) row[2];
            result.sourceId = (String) row[3];
            result.sourceType = (String) row[4];
            result.chunkIndex = row[5] != null ? ((Number) row[5]).intValue() : 0;
            result.score = ((Number) row[6]).doubleValue();
            searchResults.add(result);
        }

        LOG.debugf("Vector search returned %d results for collection '%s'",
                   searchResults.size(), collectionName);

        return searchResults;
    }

    /**
     * Delete embeddings by source ID.
     */
    @Transactional
    public int deleteBySource(UUID workflowId, String collectionName, String sourceId) {
        return deleteBySource(workflowId, null, collectionName, sourceId);
    }

    /**
     * Delete embeddings by source ID with isolation key.
     */
    @Transactional
    public int deleteBySource(UUID workflowId, String isolationKey, String collectionName, String sourceId) {
        StringBuilder sql = new StringBuilder("""
            DELETE FROM embeddings
            WHERE workflow_id = :workflowId
              AND collection_name = :collection
              AND source_id = :sourceId
            """);

        if (isolationKey != null && !isolationKey.isEmpty()) {
            sql.append(" AND isolation_key = :isolationKey");
        }

        var query = entityManager.createNativeQuery(sql.toString())
            .setParameter("workflowId", workflowId)
            .setParameter("collection", collectionName)
            .setParameter("sourceId", sourceId);

        if (isolationKey != null && !isolationKey.isEmpty()) {
            query.setParameter("isolationKey", isolationKey);
        }

        return query.executeUpdate();
    }

    /**
     * Delete all embeddings in a collection.
     */
    @Transactional
    public int deleteCollection(UUID workflowId, String collectionName) {
        return deleteCollection(workflowId, null, collectionName);
    }

    /**
     * Delete all embeddings in a collection with isolation key.
     */
    @Transactional
    public int deleteCollection(UUID workflowId, String isolationKey, String collectionName) {
        StringBuilder sql = new StringBuilder("""
            DELETE FROM embeddings
            WHERE workflow_id = :workflowId
              AND collection_name = :collection
            """);

        if (isolationKey != null && !isolationKey.isEmpty()) {
            sql.append(" AND isolation_key = :isolationKey");
        }

        var query = entityManager.createNativeQuery(sql.toString())
            .setParameter("workflowId", workflowId)
            .setParameter("collection", collectionName);

        if (isolationKey != null && !isolationKey.isEmpty()) {
            query.setParameter("isolationKey", isolationKey);
        }

        return query.executeUpdate();
    }

    /**
     * Get collection statistics.
     */
    public CollectionStats getCollectionStats(UUID workflowId, String collectionName) {
        return getCollectionStats(workflowId, null, collectionName);
    }

    /**
     * Get collection statistics with isolation key.
     */
    public CollectionStats getCollectionStats(UUID workflowId, String isolationKey, String collectionName) {
        StringBuilder sql = new StringBuilder("""
            SELECT
                COUNT(*) as count,
                COUNT(DISTINCT source_id) as sources,
                MIN(created_at) as first_created,
                MAX(updated_at) as last_updated
            FROM embeddings
            WHERE workflow_id = :workflowId
              AND collection_name = :collection
            """);

        if (isolationKey != null && !isolationKey.isEmpty()) {
            sql.append(" AND isolation_key = :isolationKey");
        }

        var query = entityManager.createNativeQuery(sql.toString())
            .setParameter("workflowId", workflowId)
            .setParameter("collection", collectionName);

        if (isolationKey != null && !isolationKey.isEmpty()) {
            query.setParameter("isolationKey", isolationKey);
        }

        Object[] result = (Object[]) query.getSingleResult();

        CollectionStats stats = new CollectionStats();
        stats.embeddingCount = ((Number) result[0]).longValue();
        stats.sourceCount = ((Number) result[1]).longValue();
        stats.firstCreated = result[2] != null ? ((java.sql.Timestamp) result[2]).toInstant() : null;
        stats.lastUpdated = result[3] != null ? ((java.sql.Timestamp) result[3]).toInstant() : null;
        return stats;
    }

    /**
     * Check if a source already exists in a collection.
     */
    public boolean sourceExists(UUID workflowId, String collectionName, String sourceId) {
        return sourceExists(workflowId, null, collectionName, sourceId);
    }

    /**
     * Check if a source already exists in a collection with isolation key.
     */
    public boolean sourceExists(UUID workflowId, String isolationKey, String collectionName, String sourceId) {
        StringBuilder sql = new StringBuilder("""
            SELECT COUNT(*) FROM embeddings
            WHERE workflow_id = :workflowId
              AND collection_name = :collection
              AND source_id = :sourceId
            """);

        if (isolationKey != null && !isolationKey.isEmpty()) {
            sql.append(" AND isolation_key = :isolationKey");
        }

        var query = entityManager.createNativeQuery(sql.toString())
            .setParameter("workflowId", workflowId)
            .setParameter("collection", collectionName)
            .setParameter("sourceId", sourceId);

        if (isolationKey != null && !isolationKey.isEmpty()) {
            query.setParameter("isolationKey", isolationKey);
        }

        Long count = (Long) query.getSingleResult();
        return count > 0;
    }

    // ========================================================================
    // Helper Methods
    // ========================================================================

    /**
     * Convert float array to PGVector string format: '[0.1,0.2,0.3]'
     */
    private String vectorToString(float[] vector) {
        if (vector == null) return null;

        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < vector.length; i++) {
            if (i > 0) sb.append(",");
            sb.append(vector[i]);
        }
        sb.append("]");
        return sb.toString();
    }

    /**
     * Convert map to JSON string for JSONB columns.
     */
    private String toJsonString(Map<String, Object> map) {
        if (map == null || map.isEmpty()) return "{}";
        try {
            return objectMapper.writeValueAsString(map);
        } catch (Exception e) {
            return "{}";
        }
    }

    // ========================================================================
    // Result Classes
    // ========================================================================

    /**
     * Vector search result.
     */
    public static class VectorSearchResult {
        public UUID id;
        public String content;
        public String metadata;
        public String sourceId;
        public String sourceType;
        public int chunkIndex;
        public double score;

        public Map<String, Object> getMetadataAsMap() {
            if (metadata == null || metadata.isEmpty()) return new HashMap<>();
            try {
                ObjectMapper mapper = new ObjectMapper();
                return mapper.readValue(metadata, Map.class);
            } catch (Exception e) {
                return new HashMap<>();
            }
        }
    }

    /**
     * Collection statistics.
     */
    public static class CollectionStats {
        public long embeddingCount;
        public long sourceCount;
        public Instant firstCreated;
        public Instant lastUpdated;
    }
}
