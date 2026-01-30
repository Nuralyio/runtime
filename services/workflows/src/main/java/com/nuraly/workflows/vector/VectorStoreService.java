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
                id, application_id, collection_name, content, embedding,
                metadata, source_id, source_type, chunk_index, token_count,
                created_at, updated_at
            ) VALUES (
                :id, :appId, :collection, :content, :embedding::vector,
                :metadata::jsonb, :sourceId, :sourceType, :chunkIndex, :tokenCount,
                NOW(), NOW()
            )
            """;

        entityManager.createNativeQuery(sql)
            .setParameter("id", id)
            .setParameter("appId", embedding.applicationId)
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
     * @param applicationId Application ID for multi-tenancy
     * @param collectionName Collection to search in
     * @param queryEmbedding Query vector
     * @param topK Number of results to return
     * @param minScore Minimum similarity score (0-1)
     * @param metadataFilter Optional JSONB filter
     * @return List of search results with scores
     */
    public List<VectorSearchResult> search(
            UUID applicationId,
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
            WHERE application_id = :appId
              AND collection_name = :collection
            """);

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
            .setParameter("appId", applicationId)
            .setParameter("collection", collectionName)
            .setParameter("topK", topK);

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
    public int deleteBySource(UUID applicationId, String collectionName, String sourceId) {
        return entityManager.createNativeQuery("""
            DELETE FROM embeddings
            WHERE application_id = :appId
              AND collection_name = :collection
              AND source_id = :sourceId
            """)
            .setParameter("appId", applicationId)
            .setParameter("collection", collectionName)
            .setParameter("sourceId", sourceId)
            .executeUpdate();
    }

    /**
     * Delete all embeddings in a collection.
     */
    @Transactional
    public int deleteCollection(UUID applicationId, String collectionName) {
        return entityManager.createNativeQuery("""
            DELETE FROM embeddings
            WHERE application_id = :appId
              AND collection_name = :collection
            """)
            .setParameter("appId", applicationId)
            .setParameter("collection", collectionName)
            .executeUpdate();
    }

    /**
     * Get collection statistics.
     */
    public CollectionStats getCollectionStats(UUID applicationId, String collectionName) {
        Object[] result = (Object[]) entityManager.createNativeQuery("""
            SELECT
                COUNT(*) as count,
                COUNT(DISTINCT source_id) as sources,
                MIN(created_at) as first_created,
                MAX(updated_at) as last_updated
            FROM embeddings
            WHERE application_id = :appId
              AND collection_name = :collection
            """)
            .setParameter("appId", applicationId)
            .setParameter("collection", collectionName)
            .getSingleResult();

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
    public boolean sourceExists(UUID applicationId, String collectionName, String sourceId) {
        Long count = (Long) entityManager.createNativeQuery("""
            SELECT COUNT(*) FROM embeddings
            WHERE application_id = :appId
              AND collection_name = :collection
              AND source_id = :sourceId
            """)
            .setParameter("appId", applicationId)
            .setParameter("collection", collectionName)
            .setParameter("sourceId", sourceId)
            .getSingleResult();

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
