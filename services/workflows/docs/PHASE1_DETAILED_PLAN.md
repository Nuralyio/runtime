# Phase 1: Foundation - Detailed Implementation Plan

## Overview

Phase 1 establishes the foundation for RAG capabilities:
1. **PGVector Setup** - Enable vector storage in PostgreSQL
2. **EMBEDDING Node** - Convert text to vectors

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PHASE 1 ARCHITECTURE                                │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────┐
                              │   EMBEDDING     │
                              │     Node        │
                              └────────┬────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         │                  │                  │                     │
         ▼                  ▼                  ▼                     ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐  ┌─────────────────┐
│    OpenAI     │  │    Ollama     │  │    Cohere     │  │   Local ONNX    │
│   Embedding   │  │   Embedding   │  │   Embedding   │  │   Embedding     │
│   Provider    │  │   Provider    │  │   Provider    │  │   (no API key)  │
│   (cloud)     │  │   (local)     │  │   (cloud)     │  │                 │
└───────────────┘  └───────────────┘  └───────────────┘  └─────────────────┘
         │                  │                  │                     │
         └─────────────────────────────┼─────────────────────────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │    PGVector     │
                              │   PostgreSQL    │
                              └─────────────────┘
```

### Local Embedding Options Comparison

| Provider | API Key | Internet | Latency | Cost | Quality |
|----------|---------|----------|---------|------|---------|
| **OpenAI** | Required | Required | ~200ms | $0.0001/1K tokens | Excellent |
| **Ollama** | None | None | ~100ms | Free | Good-Excellent |
| **Local ONNX** | None | None | ~10ms | Free | Good |
| **Cohere** | Required | Required | ~150ms | $0.0001/1K tokens | Excellent |

**Recommendation:**
- **Production (quality):** OpenAI `text-embedding-3-small`
- **Production (privacy):** Ollama with `nomic-embed-text`
- **Development/Testing:** Local ONNX with `all-MiniLM-L6-v2`

---

## Task Breakdown

### Step 1: Database Migrations (Day 1)

#### 1.1 Create PGVector Extension Migration

**File:** `src/main/resources/db/migration/V3__pgvector_extension.sql`

```sql
-- ============================================================================
-- V3: Enable PGVector Extension for Vector Similarity Search
-- ============================================================================
-- PGVector is a PostgreSQL extension for storing and querying vector embeddings.
-- It supports various distance metrics: L2, inner product, and cosine distance.
--
-- Prerequisites:
--   - PostgreSQL 12+ with pgvector extension installed
--   - For Docker: Use pgvector/pgvector:pg16 image
--   - For local: CREATE EXTENSION requires superuser or extension owner
-- ============================================================================

-- Enable the vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify installation (optional, for debugging)
-- SELECT * FROM pg_extension WHERE extname = 'vector';
```

#### 1.2 Create Embeddings Table Migration

**File:** `src/main/resources/db/migration/V4__embeddings_table.sql`

```sql
-- ============================================================================
-- V4: Create Embeddings Table for RAG Vector Storage
-- ============================================================================
-- This table stores document chunks with their vector embeddings for
-- semantic similarity search. Each row represents a chunk of text with
-- its corresponding embedding vector.
--
-- Supported embedding dimensions:
--   - OpenAI text-embedding-ada-002: 1536 dimensions
--   - OpenAI text-embedding-3-small: 1536 dimensions
--   - OpenAI text-embedding-3-large: 3072 dimensions
--   - Cohere embed-english-v3.0: 1024 dimensions
--   - Ollama (varies by model): 384-4096 dimensions
--
-- We use 1536 as default (most common). For other dimensions, create
-- separate tables or use a larger dimension with padding.
-- ============================================================================

-- Main embeddings table
CREATE TABLE embeddings (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Multi-tenancy: isolate embeddings by application
    application_id UUID NOT NULL,

    -- Collection for organizing embeddings (e.g., "knowledge-base", "faq")
    collection_name VARCHAR(255) NOT NULL,

    -- The actual text content that was embedded
    content TEXT NOT NULL,

    -- Vector embedding (1536 dimensions for OpenAI ada-002)
    -- Can store up to 16000 dimensions, but queries slow down significantly
    embedding vector(1536),

    -- Flexible metadata storage (source info, tags, custom fields)
    metadata JSONB DEFAULT '{}',

    -- Reference to source document (for deduplication and updates)
    source_id VARCHAR(512),

    -- Type of source document (pdf, html, txt, markdown, etc.)
    source_type VARCHAR(100),

    -- Position of this chunk in the original document
    chunk_index INTEGER DEFAULT 0,

    -- Token count for this chunk (useful for context window management)
    token_count INTEGER,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- Indexes for Efficient Querying
-- ============================================================================

-- Vector similarity search index using IVFFlat
-- IVFFlat: Inverted File with Flat compression
--   - Faster than HNSW for bulk inserts
--   - Good balance of speed and accuracy
--   - lists=100 is good for up to ~1M vectors
--
-- For larger datasets (>1M), consider:
--   - Increase lists to sqrt(n) where n = total rows
--   - Or use HNSW index for better recall
CREATE INDEX idx_embeddings_vector ON embeddings
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- Composite index for filtering by app and collection before vector search
CREATE INDEX idx_embeddings_app_collection ON embeddings (application_id, collection_name);

-- GIN index for JSONB metadata queries (e.g., filter by tags, category)
CREATE INDEX idx_embeddings_metadata ON embeddings USING gin (metadata);

-- Index for source lookups (deduplication, updates)
CREATE INDEX idx_embeddings_source ON embeddings (application_id, collection_name, source_id);

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_embeddings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update timestamp
CREATE TRIGGER trg_embeddings_updated_at
    BEFORE UPDATE ON embeddings
    FOR EACH ROW
    EXECUTE FUNCTION update_embeddings_timestamp();

-- ============================================================================
-- Comments for Documentation
-- ============================================================================
COMMENT ON TABLE embeddings IS 'Vector embeddings for RAG (Retrieval-Augmented Generation)';
COMMENT ON COLUMN embeddings.collection_name IS 'Logical grouping of embeddings (e.g., knowledge-base, faq)';
COMMENT ON COLUMN embeddings.embedding IS 'Vector embedding (1536 dims for OpenAI ada-002)';
COMMENT ON COLUMN embeddings.metadata IS 'Flexible JSONB for source info, tags, custom fields';
COMMENT ON COLUMN embeddings.source_id IS 'Reference to original document for deduplication';
COMMENT ON COLUMN embeddings.chunk_index IS 'Position in original document (0-based)';
```

---

### Step 2: Entity Class (Day 1)

**File:** `src/main/java/com/nuraly/workflows/entity/EmbeddingEntity.java`

```java
package com.nuraly.workflows.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * Entity representing a vector embedding for RAG.
 *
 * Each embedding represents a chunk of text from a document,
 * along with its vector representation for similarity search.
 */
@Entity
@Table(name = "embeddings", indexes = {
    @Index(name = "idx_embeddings_app_collection", columnList = "application_id, collection_name"),
    @Index(name = "idx_embeddings_source", columnList = "application_id, collection_name, source_id")
})
@Getter
@Setter
public class EmbeddingEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @Column(name = "application_id", nullable = false)
    public UUID applicationId;

    @Column(name = "collection_name", nullable = false, length = 255)
    public String collectionName;

    @Column(nullable = false, columnDefinition = "TEXT")
    public String content;

    /**
     * Vector embedding stored as float array.
     * Note: PGVector operations are done via native queries.
     */
    @Column(columnDefinition = "vector(1536)")
    public float[] embedding;

    /**
     * Flexible metadata storage (source info, tags, etc.)
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    public Map<String, Object> metadata;

    @Column(name = "source_id", length = 512)
    public String sourceId;

    @Column(name = "source_type", length = 100)
    public String sourceType;

    @Column(name = "chunk_index")
    public Integer chunkIndex = 0;

    @Column(name = "token_count")
    public Integer tokenCount;

    @Column(name = "created_at")
    public Instant createdAt;

    @Column(name = "updated_at")
    public Instant updatedAt;

    @PrePersist
    public void prePersist() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }

    // ========================================================================
    // Static Query Methods (Panache style)
    // ========================================================================

    /**
     * Find all embeddings in a collection.
     */
    public static List<EmbeddingEntity> findByCollection(UUID applicationId, String collectionName) {
        return find("applicationId = ?1 and collectionName = ?2", applicationId, collectionName).list();
    }

    /**
     * Find embeddings by source ID (for updates/deduplication).
     */
    public static List<EmbeddingEntity> findBySource(UUID applicationId, String collectionName, String sourceId) {
        return find("applicationId = ?1 and collectionName = ?2 and sourceId = ?3",
                    applicationId, collectionName, sourceId).list();
    }

    /**
     * Delete all embeddings for a source (before re-ingestion).
     */
    public static long deleteBySource(UUID applicationId, String collectionName, String sourceId) {
        return delete("applicationId = ?1 and collectionName = ?2 and sourceId = ?3",
                      applicationId, collectionName, sourceId);
    }

    /**
     * Count embeddings in a collection.
     */
    public static long countByCollection(UUID applicationId, String collectionName) {
        return count("applicationId = ?1 and collectionName = ?2", applicationId, collectionName);
    }
}
```

---

### Step 3: Vector Store Service (Day 2)

**File:** `src/main/java/com/nuraly/workflows/vector/VectorStoreService.java`

```java
package com.nuraly.workflows.vector;

import com.nuraly.workflows.entity.EmbeddingEntity;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

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

    /**
     * Store a single embedding.
     */
    @Transactional
    public EmbeddingEntity store(EmbeddingEntity embedding) {
        // Use native query to properly insert vector
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

        UUID id = UUID.randomUUID();

        entityManager.createNativeQuery(sql)
            .setParameter("id", id)
            .setParameter("appId", embedding.applicationId)
            .setParameter("collection", embedding.collectionName)
            .setParameter("content", embedding.content)
            .setParameter("embedding", vectorToString(embedding.embedding))
            .setParameter("metadata", toJsonString(embedding.metadata))
            .setParameter("sourceId", embedding.sourceId)
            .setParameter("sourceType", embedding.sourceType)
            .setParameter("chunkIndex", embedding.chunkIndex)
            .setParameter("tokenCount", embedding.tokenCount)
            .executeUpdate();

        embedding.id = id;
        return embedding;
    }

    /**
     * Store multiple embeddings in batch.
     */
    @Transactional
    public List<UUID> storeBatch(List<EmbeddingEntity> embeddings) {
        List<UUID> ids = new ArrayList<>();

        for (EmbeddingEntity embedding : embeddings) {
            EmbeddingEntity stored = store(embedding);
            ids.add(stored.id);
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
            result.metadata = parseJsonMap((String) row[2]);
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
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            return mapper.writeValueAsString(map);
        } catch (Exception e) {
            return "{}";
        }
    }

    /**
     * Parse JSON string to map.
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> parseJsonMap(String json) {
        if (json == null || json.isEmpty()) return new HashMap<>();
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            return mapper.readValue(json, Map.class);
        } catch (Exception e) {
            return new HashMap<>();
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
        public Map<String, Object> metadata;
        public String sourceId;
        public String sourceType;
        public int chunkIndex;
        public double score;
    }

    /**
     * Collection statistics.
     */
    public static class CollectionStats {
        public long embeddingCount;
        public long sourceCount;
        public java.time.Instant firstCreated;
        public java.time.Instant lastUpdated;
    }
}
```

---

### Step 4: Embedding Provider Interface (Day 2)

**File:** `src/main/java/com/nuraly/workflows/embedding/EmbeddingProvider.java`

```java
package com.nuraly.workflows.embedding;

import java.util.List;

/**
 * Interface for embedding providers (OpenAI, Ollama, Cohere, etc.)
 *
 * Embedding providers convert text into vector representations
 * for semantic similarity search.
 */
public interface EmbeddingProvider {

    /**
     * Get the provider name (e.g., "openai", "ollama", "cohere")
     */
    String getName();

    /**
     * Check if this provider supports the given model
     */
    boolean supportsModel(String model);

    /**
     * Get the default embedding model for this provider
     */
    String getDefaultModel();

    /**
     * Get the embedding dimension for a model.
     * This is needed to validate vector dimensions.
     */
    int getEmbeddingDimension(String model);

    /**
     * Generate embedding for a single text.
     *
     * @param text The text to embed
     * @param model The model to use (null for default)
     * @param apiKey The API key
     * @param baseUrl Optional base URL (for self-hosted models)
     * @return Embedding result with vector
     */
    EmbeddingResult embed(String text, String model, String apiKey, String baseUrl);

    /**
     * Generate embeddings for multiple texts in batch.
     * More efficient than calling embed() multiple times.
     *
     * @param texts List of texts to embed
     * @param model The model to use (null for default)
     * @param apiKey The API key
     * @param baseUrl Optional base URL (for self-hosted models)
     * @return List of embedding results
     */
    List<EmbeddingResult> embedBatch(List<String> texts, String model, String apiKey, String baseUrl);

    /**
     * Result of an embedding operation.
     */
    class EmbeddingResult {
        private float[] embedding;
        private int tokenCount;
        private String error;
        private boolean success;

        public static EmbeddingResult success(float[] embedding, int tokenCount) {
            EmbeddingResult result = new EmbeddingResult();
            result.embedding = embedding;
            result.tokenCount = tokenCount;
            result.success = true;
            return result;
        }

        public static EmbeddingResult error(String error) {
            EmbeddingResult result = new EmbeddingResult();
            result.error = error;
            result.success = false;
            return result;
        }

        public float[] getEmbedding() { return embedding; }
        public int getTokenCount() { return tokenCount; }
        public String getError() { return error; }
        public boolean isSuccess() { return success; }
    }
}
```

---

### Step 5: OpenAI Embedding Provider (Day 3)

**File:** `src/main/java/com/nuraly/workflows/embedding/providers/OpenAiEmbeddingProvider.java`

```java
package com.nuraly.workflows.embedding.providers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.embedding.EmbeddingProvider;
import jakarta.enterprise.context.ApplicationScoped;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.ContentType;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.jboss.logging.Logger;

import java.util.*;

/**
 * OpenAI Embedding Provider.
 *
 * Supports models:
 *   - text-embedding-ada-002 (1536 dimensions, legacy)
 *   - text-embedding-3-small (1536 dimensions, recommended)
 *   - text-embedding-3-large (3072 dimensions, highest quality)
 */
@ApplicationScoped
public class OpenAiEmbeddingProvider implements EmbeddingProvider {

    private static final Logger LOG = Logger.getLogger(OpenAiEmbeddingProvider.class);
    private static final String API_URL = "https://api.openai.com/v1/embeddings";

    private static final Map<String, Integer> MODEL_DIMENSIONS = Map.of(
        "text-embedding-ada-002", 1536,
        "text-embedding-3-small", 1536,
        "text-embedding-3-large", 3072
    );

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String getName() {
        return "openai";
    }

    @Override
    public boolean supportsModel(String model) {
        return model != null && (MODEL_DIMENSIONS.containsKey(model) || model.startsWith("text-embedding"));
    }

    @Override
    public String getDefaultModel() {
        return "text-embedding-3-small";
    }

    @Override
    public int getEmbeddingDimension(String model) {
        return MODEL_DIMENSIONS.getOrDefault(model, 1536);
    }

    @Override
    public EmbeddingResult embed(String text, String model, String apiKey, String baseUrl) {
        List<EmbeddingResult> results = embedBatch(List.of(text), model, apiKey, baseUrl);
        return results.isEmpty() ? EmbeddingResult.error("No result returned") : results.get(0);
    }

    @Override
    public List<EmbeddingResult> embedBatch(List<String> texts, String model, String apiKey, String baseUrl) {
        if (texts == null || texts.isEmpty()) {
            return List.of();
        }

        String useModel = model != null ? model : getDefaultModel();
        String url = baseUrl != null ? baseUrl + "/v1/embeddings" : API_URL;

        try {
            // Build request body
            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("model", useModel);

            ArrayNode inputArray = objectMapper.createArrayNode();
            for (String text : texts) {
                inputArray.add(text);
            }
            requestBody.set("input", inputArray);

            // Make HTTP request
            try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
                HttpPost httpPost = new HttpPost(url);
                httpPost.addHeader("Content-Type", "application/json");
                httpPost.addHeader("Authorization", "Bearer " + apiKey);
                httpPost.setEntity(new StringEntity(
                    objectMapper.writeValueAsString(requestBody),
                    ContentType.APPLICATION_JSON
                ));

                var response = httpClient.execute(httpPost);
                int statusCode = response.getCode();
                String responseBody = EntityUtils.toString(response.getEntity());

                if (statusCode >= 200 && statusCode < 300) {
                    return parseResponse(responseBody, texts.size());
                } else {
                    String error = extractErrorMessage(responseBody);
                    LOG.errorf("OpenAI embedding error (status %d): %s", statusCode, error);

                    // Return error for all inputs
                    List<EmbeddingResult> errorResults = new ArrayList<>();
                    for (int i = 0; i < texts.size(); i++) {
                        errorResults.add(EmbeddingResult.error(error));
                    }
                    return errorResults;
                }
            }
        } catch (Exception e) {
            LOG.errorf("OpenAI embedding request failed: %s", e.getMessage());

            List<EmbeddingResult> errorResults = new ArrayList<>();
            for (int i = 0; i < texts.size(); i++) {
                errorResults.add(EmbeddingResult.error(e.getMessage()));
            }
            return errorResults;
        }
    }

    private List<EmbeddingResult> parseResponse(String responseBody, int expectedCount) {
        try {
            JsonNode json = objectMapper.readTree(responseBody);
            JsonNode dataArray = json.get("data");
            JsonNode usage = json.get("usage");

            int totalTokens = usage != null && usage.has("total_tokens")
                ? usage.get("total_tokens").asInt()
                : 0;
            int tokensPerItem = expectedCount > 0 ? totalTokens / expectedCount : 0;

            List<EmbeddingResult> results = new ArrayList<>();

            for (JsonNode item : dataArray) {
                JsonNode embeddingNode = item.get("embedding");
                float[] embedding = new float[embeddingNode.size()];

                for (int i = 0; i < embeddingNode.size(); i++) {
                    embedding[i] = (float) embeddingNode.get(i).asDouble();
                }

                results.add(EmbeddingResult.success(embedding, tokensPerItem));
            }

            return results;
        } catch (Exception e) {
            LOG.errorf("Failed to parse OpenAI embedding response: %s", e.getMessage());
            List<EmbeddingResult> errorResults = new ArrayList<>();
            for (int i = 0; i < expectedCount; i++) {
                errorResults.add(EmbeddingResult.error("Failed to parse response: " + e.getMessage()));
            }
            return errorResults;
        }
    }

    private String extractErrorMessage(String responseBody) {
        try {
            JsonNode json = objectMapper.readTree(responseBody);
            if (json.has("error") && json.get("error").has("message")) {
                return json.get("error").get("message").asText();
            }
            return responseBody;
        } catch (Exception e) {
            return responseBody;
        }
    }
}
```

---

### Step 6: Ollama Embedding Provider (Day 3)

**File:** `src/main/java/com/nuraly/workflows/embedding/providers/OllamaEmbeddingProvider.java`

```java
package com.nuraly.workflows.embedding.providers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.embedding.EmbeddingProvider;
import jakarta.enterprise.context.ApplicationScoped;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.ContentType;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.jboss.logging.Logger;

import java.util.*;

/**
 * Ollama Embedding Provider for local/self-hosted embeddings.
 *
 * Supports any Ollama model with embedding capability:
 *   - nomic-embed-text (768 dimensions)
 *   - mxbai-embed-large (1024 dimensions)
 *   - all-minilm (384 dimensions)
 *   - etc.
 *
 * Requires Ollama server running locally or accessible via network.
 */
@ApplicationScoped
public class OllamaEmbeddingProvider implements EmbeddingProvider {

    private static final Logger LOG = Logger.getLogger(OllamaEmbeddingProvider.class);

    private static final Map<String, Integer> KNOWN_DIMENSIONS = Map.of(
        "nomic-embed-text", 768,
        "mxbai-embed-large", 1024,
        "all-minilm", 384,
        "snowflake-arctic-embed", 1024
    );

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String getName() {
        return "ollama";
    }

    @Override
    public boolean supportsModel(String model) {
        // Ollama can run any model, so we accept all
        return model != null && !model.isEmpty();
    }

    @Override
    public String getDefaultModel() {
        return "nomic-embed-text";
    }

    @Override
    public int getEmbeddingDimension(String model) {
        // Return known dimension or default to 1536
        // The actual dimension will be determined at runtime
        return KNOWN_DIMENSIONS.getOrDefault(model, 1536);
    }

    @Override
    public EmbeddingResult embed(String text, String model, String apiKey, String baseUrl) {
        if (baseUrl == null || baseUrl.isEmpty()) {
            return EmbeddingResult.error("Ollama requires a base URL (e.g., http://localhost:11434)");
        }

        String useModel = model != null ? model : getDefaultModel();
        String url = baseUrl + "/api/embeddings";

        try {
            // Build request body
            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("model", useModel);
            requestBody.put("prompt", text);

            // Make HTTP request
            try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
                HttpPost httpPost = new HttpPost(url);
                httpPost.addHeader("Content-Type", "application/json");
                // Ollama typically doesn't require auth, but support it if provided
                if (apiKey != null && !apiKey.isEmpty()) {
                    httpPost.addHeader("Authorization", "Bearer " + apiKey);
                }
                httpPost.setEntity(new StringEntity(
                    objectMapper.writeValueAsString(requestBody),
                    ContentType.APPLICATION_JSON
                ));

                var response = httpClient.execute(httpPost);
                int statusCode = response.getCode();
                String responseBody = EntityUtils.toString(response.getEntity());

                if (statusCode >= 200 && statusCode < 300) {
                    return parseResponse(responseBody);
                } else {
                    LOG.errorf("Ollama embedding error (status %d): %s", statusCode, responseBody);
                    return EmbeddingResult.error("Ollama error: " + responseBody);
                }
            }
        } catch (Exception e) {
            LOG.errorf("Ollama embedding request failed: %s", e.getMessage());
            return EmbeddingResult.error("Ollama request failed: " + e.getMessage());
        }
    }

    @Override
    public List<EmbeddingResult> embedBatch(List<String> texts, String model, String apiKey, String baseUrl) {
        // Ollama doesn't support batch embedding natively, so we loop
        List<EmbeddingResult> results = new ArrayList<>();
        for (String text : texts) {
            results.add(embed(text, model, apiKey, baseUrl));
        }
        return results;
    }

    private EmbeddingResult parseResponse(String responseBody) {
        try {
            JsonNode json = objectMapper.readTree(responseBody);
            JsonNode embeddingNode = json.get("embedding");

            if (embeddingNode == null || !embeddingNode.isArray()) {
                return EmbeddingResult.error("No embedding in response");
            }

            float[] embedding = new float[embeddingNode.size()];
            for (int i = 0; i < embeddingNode.size(); i++) {
                embedding[i] = (float) embeddingNode.get(i).asDouble();
            }

            return EmbeddingResult.success(embedding, 0); // Ollama doesn't return token count
        } catch (Exception e) {
            return EmbeddingResult.error("Failed to parse Ollama response: " + e.getMessage());
        }
    }
}
```

---

### Step 6.5: Local ONNX Embedding Provider (Day 3) - NO API KEY REQUIRED

**Purpose:** Run sentence-transformer models locally without any API key or internet connection.

**Dependencies to Add (pom.xml):**
```xml
<!-- ONNX Runtime for local model inference -->
<dependency>
    <groupId>com.microsoft.onnxruntime</groupId>
    <artifactId>onnxruntime</artifactId>
    <version>1.17.0</version>
</dependency>

<!-- DJL HuggingFace Tokenizers for text tokenization -->
<dependency>
    <groupId>ai.djl.huggingface</groupId>
    <artifactId>tokenizers</artifactId>
    <version>0.30.0</version>
</dependency>
```

**Supported Local Models:**

| Model | Dimensions | Size | Quality | Use Case |
|-------|------------|------|---------|----------|
| `all-MiniLM-L6-v2` | 384 | 23MB | Good | Fast, general purpose |
| `all-MiniLM-L12-v2` | 384 | 34MB | Better | Balanced |
| `all-mpnet-base-v2` | 768 | 420MB | Best | High quality |
| `paraphrase-MiniLM-L6-v2` | 384 | 23MB | Good | Paraphrase detection |

**File:** `src/main/java/com/nuraly/workflows/embedding/providers/LocalOnnxEmbeddingProvider.java`

```java
package com.nuraly.workflows.embedding.providers;

import ai.djl.huggingface.tokenizers.HuggingFaceTokenizer;
import ai.onnxruntime.*;
import com.nuraly.workflows.embedding.EmbeddingProvider;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import jakarta.enterprise.context.ApplicationScoped;
import org.jboss.logging.Logger;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.*;

/**
 * Local ONNX Embedding Provider - No API key required!
 *
 * Runs sentence-transformer models locally using ONNX Runtime.
 * Perfect for:
 *   - Development and testing (no API costs)
 *   - Air-gapped environments (no internet)
 *   - Privacy-sensitive data (no external calls)
 *   - Low latency requirements (~10ms vs ~200ms for cloud)
 *
 * Default model: all-MiniLM-L6-v2 (384 dimensions, 23MB)
 *
 * Models are auto-downloaded from HuggingFace on first use.
 */
@ApplicationScoped
public class LocalOnnxEmbeddingProvider implements EmbeddingProvider {

    private static final Logger LOG = Logger.getLogger(LocalOnnxEmbeddingProvider.class);

    // Model configurations
    private static final Map<String, ModelConfig> MODELS = Map.of(
        "all-MiniLM-L6-v2", new ModelConfig(384,
            "https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/resolve/main/onnx/model.onnx",
            "https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/resolve/main/tokenizer.json"),
        "all-MiniLM-L12-v2", new ModelConfig(384,
            "https://huggingface.co/sentence-transformers/all-MiniLM-L12-v2/resolve/main/onnx/model.onnx",
            "https://huggingface.co/sentence-transformers/all-MiniLM-L12-v2/resolve/main/tokenizer.json"),
        "paraphrase-MiniLM-L6-v2", new ModelConfig(384,
            "https://huggingface.co/sentence-transformers/paraphrase-MiniLM-L6-v2/resolve/main/onnx/model.onnx",
            "https://huggingface.co/sentence-transformers/paraphrase-MiniLM-L6-v2/resolve/main/tokenizer.json")
    );

    private static final String DEFAULT_MODEL = "all-MiniLM-L6-v2";
    private static final Path CACHE_DIR = Path.of(System.getProperty("user.home"), ".cache", "nuraly", "models");

    private OrtEnvironment environment;
    private final Map<String, LoadedModel> loadedModels = new HashMap<>();

    @PostConstruct
    void init() {
        try {
            environment = OrtEnvironment.getEnvironment();
            LOG.info("ONNX Runtime initialized for local embeddings");
        } catch (Exception e) {
            LOG.error("Failed to initialize ONNX Runtime", e);
        }
    }

    @PreDestroy
    void cleanup() {
        for (LoadedModel model : loadedModels.values()) {
            try {
                model.session.close();
                model.tokenizer.close();
            } catch (Exception e) {
                LOG.warn("Error closing model", e);
            }
        }
    }

    @Override
    public String getName() {
        return "local";
    }

    @Override
    public boolean supportsModel(String model) {
        return MODELS.containsKey(model);
    }

    @Override
    public String getDefaultModel() {
        return DEFAULT_MODEL;
    }

    @Override
    public int getEmbeddingDimension(String model) {
        ModelConfig config = MODELS.get(model);
        return config != null ? config.dimensions : 384;
    }

    @Override
    public EmbeddingResult embed(String text, String model, String apiKey, String baseUrl) {
        // apiKey and baseUrl are ignored for local models
        String useModel = model != null && MODELS.containsKey(model) ? model : DEFAULT_MODEL;

        try {
            LoadedModel loaded = getOrLoadModel(useModel);
            float[] embedding = computeEmbedding(loaded, text);
            return EmbeddingResult.success(embedding, estimateTokenCount(text));
        } catch (Exception e) {
            LOG.errorf("Local embedding failed: %s", e.getMessage());
            return EmbeddingResult.error("Local embedding failed: " + e.getMessage());
        }
    }

    @Override
    public List<EmbeddingResult> embedBatch(List<String> texts, String model, String apiKey, String baseUrl) {
        String useModel = model != null && MODELS.containsKey(model) ? model : DEFAULT_MODEL;
        List<EmbeddingResult> results = new ArrayList<>();

        try {
            LoadedModel loaded = getOrLoadModel(useModel);

            for (String text : texts) {
                try {
                    float[] embedding = computeEmbedding(loaded, text);
                    results.add(EmbeddingResult.success(embedding, estimateTokenCount(text)));
                } catch (Exception e) {
                    results.add(EmbeddingResult.error(e.getMessage()));
                }
            }
        } catch (Exception e) {
            // Model loading failed - return errors for all
            for (int i = 0; i < texts.size(); i++) {
                results.add(EmbeddingResult.error("Model loading failed: " + e.getMessage()));
            }
        }

        return results;
    }

    /**
     * Get or load a model (lazy loading with caching).
     */
    private synchronized LoadedModel getOrLoadModel(String modelName) throws Exception {
        if (loadedModels.containsKey(modelName)) {
            return loadedModels.get(modelName);
        }

        LOG.infof("Loading local model: %s", modelName);
        ModelConfig config = MODELS.get(modelName);

        // Ensure cache directory exists
        Files.createDirectories(CACHE_DIR);

        // Download model if not cached
        Path modelPath = CACHE_DIR.resolve(modelName + ".onnx");
        Path tokenizerPath = CACHE_DIR.resolve(modelName + "_tokenizer.json");

        if (!Files.exists(modelPath)) {
            LOG.infof("Downloading model %s...", modelName);
            downloadFile(config.modelUrl, modelPath);
        }

        if (!Files.exists(tokenizerPath)) {
            LOG.infof("Downloading tokenizer for %s...", modelName);
            downloadFile(config.tokenizerUrl, tokenizerPath);
        }

        // Load model and tokenizer
        OrtSession.SessionOptions options = new OrtSession.SessionOptions();
        options.setOptimizationLevel(OrtSession.SessionOptions.OptLevel.ALL_OPT);

        OrtSession session = environment.createSession(modelPath.toString(), options);
        HuggingFaceTokenizer tokenizer = HuggingFaceTokenizer.newInstance(tokenizerPath);

        LoadedModel loaded = new LoadedModel(session, tokenizer, config.dimensions);
        loadedModels.put(modelName, loaded);

        LOG.infof("Model %s loaded successfully (%d dimensions)", modelName, config.dimensions);
        return loaded;
    }

    /**
     * Compute embedding for a single text.
     */
    private float[] computeEmbedding(LoadedModel model, String text) throws OrtException {
        // Tokenize
        var encoding = model.tokenizer.encode(text);
        long[] inputIds = encoding.getIds();
        long[] attentionMask = encoding.getAttentionMask();

        // Prepare inputs
        long[] shape = {1, inputIds.length};

        try (OnnxTensor inputIdsTensor = OnnxTensor.createTensor(environment,
                java.nio.LongBuffer.wrap(inputIds), shape);
             OnnxTensor attentionMaskTensor = OnnxTensor.createTensor(environment,
                java.nio.LongBuffer.wrap(attentionMask), shape)) {

            Map<String, OnnxTensor> inputs = Map.of(
                "input_ids", inputIdsTensor,
                "attention_mask", attentionMaskTensor
            );

            // Run inference
            try (OrtSession.Result result = model.session.run(inputs)) {
                // Get the output (last_hidden_state or sentence_embedding)
                float[][] output = (float[][]) result.get(0).getValue();

                // Mean pooling over sequence length
                float[] embedding = meanPooling(output, attentionMask);

                // L2 normalize
                normalize(embedding);

                return embedding;
            }
        }
    }

    /**
     * Mean pooling: average token embeddings weighted by attention mask.
     */
    private float[] meanPooling(float[][] tokenEmbeddings, long[] attentionMask) {
        int seqLen = tokenEmbeddings.length;
        int embDim = tokenEmbeddings[0].length;
        float[] result = new float[embDim];
        float maskSum = 0;

        for (int i = 0; i < seqLen; i++) {
            if (attentionMask[i] == 1) {
                maskSum += 1;
                for (int j = 0; j < embDim; j++) {
                    result[j] += tokenEmbeddings[i][j];
                }
            }
        }

        if (maskSum > 0) {
            for (int j = 0; j < embDim; j++) {
                result[j] /= maskSum;
            }
        }

        return result;
    }

    /**
     * L2 normalize embedding vector.
     */
    private void normalize(float[] embedding) {
        float norm = 0;
        for (float v : embedding) {
            norm += v * v;
        }
        norm = (float) Math.sqrt(norm);

        if (norm > 0) {
            for (int i = 0; i < embedding.length; i++) {
                embedding[i] /= norm;
            }
        }
    }

    /**
     * Download file from URL to path.
     */
    private void downloadFile(String urlStr, Path target) throws IOException {
        URL url = new URL(urlStr);
        try (InputStream in = url.openStream()) {
            Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
        }
    }

    /**
     * Estimate token count (rough approximation).
     */
    private int estimateTokenCount(String text) {
        // Rough estimate: ~4 characters per token
        return text.length() / 4;
    }

    // ========================================================================
    // Inner Classes
    // ========================================================================

    private static class ModelConfig {
        final int dimensions;
        final String modelUrl;
        final String tokenizerUrl;

        ModelConfig(int dimensions, String modelUrl, String tokenizerUrl) {
            this.dimensions = dimensions;
            this.modelUrl = modelUrl;
            this.tokenizerUrl = tokenizerUrl;
        }
    }

    private static class LoadedModel {
        final OrtSession session;
        final HuggingFaceTokenizer tokenizer;
        final int dimensions;

        LoadedModel(OrtSession session, HuggingFaceTokenizer tokenizer, int dimensions) {
            this.session = session;
            this.tokenizer = tokenizer;
            this.dimensions = dimensions;
        }
    }
}
```

**Usage in EMBEDDING Node:**
```json
{
  "provider": "local",
  "model": "all-MiniLM-L6-v2"
}
```

No `apiKeyPath` or `apiUrlPath` needed!

---

### Step 7: Embedding Provider Factory (Day 3)

**File:** `src/main/java/com/nuraly/workflows/embedding/EmbeddingProviderFactory.java`

```java
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
     * @param name The provider name (e.g., "openai", "ollama")
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
```

---

### Step 8: EMBEDDING Node Executor (Day 4)

**File:** `src/main/java/com/nuraly/workflows/engine/executors/EmbeddingNodeExecutor.java`

```java
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
 *   "provider": "openai" | "ollama" | "cohere",
 *   "model": "text-embedding-3-small",
 *   "apiKeyPath": "openai/embedding-key",
 *   "apiUrlPath": "ollama/server-url",  // For Ollama
 *   "inputField": "text",               // Field containing text(s) to embed
 *   "batchSize": 100                    // Max texts per API call
 * }
 *
 * Input:
 *   { "text": "Hello world" }
 *   OR
 *   { "texts": ["Hello", "World"] }
 *   OR
 *   { "chunks": [{ "content": "Hello" }, { "content": "World" }] }
 *
 * Output:
 *   { "embedding": [0.1, 0.2, ...], "dimension": 1536, "tokenCount": 5 }
 *   OR
 *   { "embeddings": [[...], [...]], "dimension": 1536, "tokenCount": 10 }
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

        // Get provider
        String providerName = config.has("provider") ? config.get("provider").asText() : "openai";
        EmbeddingProvider provider = providerFactory.getProvider(providerName);
        if (provider == null) {
            return NodeExecutionResult.failure("Unknown embedding provider: " + providerName);
        }

        // Get model
        String model = config.has("model") && !config.get("model").asText().isEmpty()
                ? config.get("model").asText()
                : provider.getDefaultModel();

        // Get API key
        String apiKeyPath = config.has("apiKeyPath") ? config.get("apiKeyPath").asText() : null;
        String apiKey = null;
        boolean isOllama = "ollama".equalsIgnoreCase(providerName);

        if (apiKeyPath != null && !apiKeyPath.isEmpty()) {
            apiKey = fetchFromKvStore(apiKeyPath, context);
            if (apiKey == null && !isOllama) {
                return NodeExecutionResult.failure("Failed to retrieve API key from KV store: " + apiKeyPath);
            }
        } else if (!isOllama) {
            return NodeExecutionResult.failure("API key path is required for " + providerName);
        }

        // Get API URL (for Ollama or custom endpoints)
        String apiUrlPath = config.has("apiUrlPath") ? config.get("apiUrlPath").asText() : null;
        String baseUrl = null;
        if (apiUrlPath != null && !apiUrlPath.isEmpty()) {
            baseUrl = fetchFromKvStore(apiUrlPath, context);
        }

        if (isOllama && (baseUrl == null || baseUrl.isEmpty())) {
            return NodeExecutionResult.failure("API URL is required for Ollama provider");
        }

        // Extract texts from input
        List<String> texts = extractTexts(context.getInput(), config);
        if (texts.isEmpty()) {
            return NodeExecutionResult.failure("No text(s) provided for embedding. " +
                    "Expected input.text, input.texts, or input.chunks");
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

        return NodeExecutionResult.success(output);
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

        return texts;
    }

    /**
     * Fetch value from KV store (copied from LlmNodeExecutor).
     */
    private String fetchFromKvStore(String keyPath, ExecutionContext context) {
        try {
            String appId = null;
            JsonNode input = context.getInput();
            if (input.has("applicationId")) {
                appId = input.get("applicationId").asText();
            } else if (context.getExecution() != null && context.getExecution().workflow != null) {
                appId = context.getExecution().workflow.applicationId != null ?
                        context.getExecution().workflow.applicationId.toString() : null;
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
```

---

### Step 9: Update NodeType Enum (Day 4)

**File:** `src/main/java/com/nuraly/workflows/entity/enums/NodeType.java`

Add to the enum:
```java
// RAG nodes
EMBEDDING,          // Generate embeddings from text
DOCUMENT_LOADER,    // Load and parse documents (Phase 2)
TEXT_SPLITTER,      // Split text into chunks (Phase 2)
VECTOR_WRITE,       // Write vectors to store (Phase 2)
VECTOR_SEARCH,      // Search vectors by similarity (Phase 3)
CONTEXT_BUILDER,    // Build context from retrieved docs (Phase 3)
RERANKER,           // Re-rank search results (Phase 4)
```

---

### Step 10: Tests (Day 5)

#### 10.1 EmbeddingProviderFactory Test

**File:** `src/test/java/com/nuraly/workflows/embedding/EmbeddingProviderFactoryTest.java`

```java
package com.nuraly.workflows.embedding;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
class EmbeddingProviderFactoryTest {

    @Inject
    EmbeddingProviderFactory factory;

    @Test
    void testOpenAiProviderExists() {
        assertTrue(factory.hasProvider("openai"));
        assertNotNull(factory.getProvider("openai"));
    }

    @Test
    void testOllamaProviderExists() {
        assertTrue(factory.hasProvider("ollama"));
        assertNotNull(factory.getProvider("ollama"));
    }

    @Test
    void testUnknownProviderReturnsNull() {
        assertFalse(factory.hasProvider("unknown"));
        assertNull(factory.getProvider("unknown"));
    }

    @Test
    void testGetAvailableProviders() {
        String[] providers = factory.getAvailableProviders();
        assertTrue(providers.length >= 2);
    }
}
```

#### 10.2 OpenAiEmbeddingProvider Test

**File:** `src/test/java/com/nuraly/workflows/embedding/providers/OpenAiEmbeddingProviderTest.java`

```java
package com.nuraly.workflows.embedding.providers;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class OpenAiEmbeddingProviderTest {

    private final OpenAiEmbeddingProvider provider = new OpenAiEmbeddingProvider();

    @Test
    void testGetName() {
        assertEquals("openai", provider.getName());
    }

    @Test
    void testGetDefaultModel() {
        assertEquals("text-embedding-3-small", provider.getDefaultModel());
    }

    @Test
    void testSupportsModel() {
        assertTrue(provider.supportsModel("text-embedding-ada-002"));
        assertTrue(provider.supportsModel("text-embedding-3-small"));
        assertTrue(provider.supportsModel("text-embedding-3-large"));
        assertFalse(provider.supportsModel("gpt-4")); // Chat model, not embedding
    }

    @Test
    void testGetEmbeddingDimension() {
        assertEquals(1536, provider.getEmbeddingDimension("text-embedding-ada-002"));
        assertEquals(1536, provider.getEmbeddingDimension("text-embedding-3-small"));
        assertEquals(3072, provider.getEmbeddingDimension("text-embedding-3-large"));
    }
}
```

#### 10.3 VectorStoreService Test

**File:** `src/test/java/com/nuraly/workflows/vector/VectorStoreServiceTest.java`

```java
package com.nuraly.workflows.vector;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;

import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
class VectorStoreServiceTest {

    @Inject
    VectorStoreService vectorStore;

    @Test
    @Transactional
    void testStoreAndSearch() {
        UUID appId = UUID.randomUUID();
        String collection = "test-collection";

        // Create test embedding (1536 dimensions)
        float[] embedding = new float[1536];
        for (int i = 0; i < embedding.length; i++) {
            embedding[i] = (float) Math.random();
        }

        // Store embedding
        var entity = new com.nuraly.workflows.entity.EmbeddingEntity();
        entity.applicationId = appId;
        entity.collectionName = collection;
        entity.content = "Test content";
        entity.embedding = embedding;
        entity.sourceId = "test-source";
        entity.metadata = Map.of("category", "test");

        vectorStore.store(entity);

        // Search
        var results = vectorStore.search(appId, collection, embedding, 10, 0.5, null);

        assertFalse(results.isEmpty());
        assertEquals("Test content", results.get(0).content);
        assertTrue(results.get(0).score >= 0.5);

        // Cleanup
        vectorStore.deleteCollection(appId, collection);
    }

    @Test
    void testCollectionStats() {
        UUID appId = UUID.randomUUID();
        String collection = "empty-collection";

        var stats = vectorStore.getCollectionStats(appId, collection);

        assertEquals(0, stats.embeddingCount);
        assertEquals(0, stats.sourceCount);
    }
}
```

---

## File Structure Summary

```
src/main/
├── java/com/nuraly/workflows/
│   ├── embedding/
│   │   ├── EmbeddingProvider.java              # Interface
│   │   ├── EmbeddingProviderFactory.java       # Factory
│   │   └── providers/
│   │       ├── OpenAiEmbeddingProvider.java    # OpenAI (cloud)
│   │       ├── OllamaEmbeddingProvider.java    # Ollama (local server)
│   │       └── LocalOnnxEmbeddingProvider.java # Local ONNX (no server!)
│   ├── vector/
│   │   └── VectorStoreService.java             # Vector operations
│   ├── entity/
│   │   └── EmbeddingEntity.java                # JPA entity
│   ├── entity/enums/
│   │   └── NodeType.java                       # Add EMBEDDING
│   └── engine/executors/
│       └── EmbeddingNodeExecutor.java          # Node executor
└── resources/db/migration/
    ├── V3__pgvector_extension.sql              # Enable PGVector
    └── V4__embeddings_table.sql                # Embeddings table

src/test/java/com/nuraly/workflows/
├── embedding/
│   ├── EmbeddingProviderFactoryTest.java
│   └── providers/
│       ├── OpenAiEmbeddingProviderTest.java
│       └── LocalOnnxEmbeddingProviderTest.java
└── vector/
    └── VectorStoreServiceTest.java
```

---

## Implementation Order

| Day | Task | Files |
|-----|------|-------|
| 1 | Database migrations | V3, V4 SQL files |
| 1 | Entity class | EmbeddingEntity.java |
| 2 | Vector store service | VectorStoreService.java |
| 2 | Embedding provider interface | EmbeddingProvider.java |
| 3 | OpenAI provider | OpenAiEmbeddingProvider.java |
| 3 | Ollama provider | OllamaEmbeddingProvider.java |
| 3 | **Local ONNX provider** | LocalOnnxEmbeddingProvider.java |
| 3 | Provider factory | EmbeddingProviderFactory.java |
| 4 | EMBEDDING node executor | EmbeddingNodeExecutor.java |
| 4 | Update NodeType enum | NodeType.java |
| 5 | Tests | All test files |
| 5 | Integration testing | Manual testing |

---

## Dependencies to Add (pom.xml)

```xml
<!-- PGVector support -->
<dependency>
    <groupId>com.pgvector</groupId>
    <artifactId>pgvector</artifactId>
    <version>0.1.4</version>
</dependency>

<!-- Local ONNX embeddings (no API key required!) -->
<dependency>
    <groupId>com.microsoft.onnxruntime</groupId>
    <artifactId>onnxruntime</artifactId>
    <version>1.17.0</version>
</dependency>
<dependency>
    <groupId>ai.djl.huggingface</groupId>
    <artifactId>tokenizers</artifactId>
    <version>0.30.0</version>
</dependency>
```

---

## Docker Setup for PGVector

Update your `docker-compose.yml` to use PGVector-enabled PostgreSQL:

```yaml
services:
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_USER: nuraly
      POSTGRES_PASSWORD: nuraly
      POSTGRES_DB: workflow
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

---

## Verification Checklist

After implementation, verify:

- [ ] PGVector extension enabled: `SELECT * FROM pg_extension WHERE extname = 'vector';`
- [ ] Embeddings table created: `\d embeddings`
- [ ] OpenAI embedding works: Create test workflow with EMBEDDING node
- [ ] Ollama embedding works: Test with local Ollama server
- [ ] **Local ONNX embedding works: Test without any API key!**
- [ ] Vector search returns results: Use VectorStoreService.search()
- [ ] All tests pass: `./mvnw test`

---

## Provider Quick Reference

| Provider | Config | API Key | Server | Best For |
|----------|--------|---------|--------|----------|
| `openai` | `{"provider": "openai", "model": "text-embedding-3-small", "apiKeyPath": "..."}` | Required | Cloud | Production quality |
| `ollama` | `{"provider": "ollama", "model": "nomic-embed-text", "apiUrlPath": "..."}` | None | Local | Privacy, self-hosted |
| `local` | `{"provider": "local", "model": "all-MiniLM-L6-v2"}` | **None** | **None** | Dev, testing, air-gapped |
