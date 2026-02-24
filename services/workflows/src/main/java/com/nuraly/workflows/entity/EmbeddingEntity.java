package com.nuraly.workflows.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.List;
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
    @Index(name = "idx_embeddings_workflow_collection", columnList = "workflow_id, collection_name"),
    @Index(name = "idx_embeddings_source", columnList = "workflow_id, collection_name, source_id")
})
@Getter
@Setter
public class EmbeddingEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @Column(name = "workflow_id", nullable = false)
    public UUID workflowId;

    /**
     * Optional user-defined isolation key for partitioning data.
     * Examples: user_id, tenant_id, session_id, customer_id
     */
    @Column(name = "isolation_key", length = 255)
    public String isolationKey;

    @Column(name = "collection_name", nullable = false, length = 255)
    public String collectionName;

    @Column(nullable = false, columnDefinition = "TEXT")
    public String content;

    /**
     * Vector embedding stored as float array.
     * Note: PGVector operations are done via native queries.
     * This field is not directly mapped - use VectorStoreService for operations.
     */
    @Transient
    public float[] embedding;

    /**
     * Flexible metadata storage (source info, tags, etc.)
     */
    @Column(columnDefinition = "jsonb")
    public String metadata;

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
    public static List<EmbeddingEntity> findByCollection(UUID workflowId, String collectionName) {
        return find("workflowId = ?1 and collectionName = ?2", workflowId, collectionName).list();
    }

    /**
     * Find all embeddings in a collection with isolation key.
     */
    public static List<EmbeddingEntity> findByCollection(UUID workflowId, String isolationKey, String collectionName) {
        if (isolationKey == null || isolationKey.isEmpty()) {
            return findByCollection(workflowId, collectionName);
        }
        return find("workflowId = ?1 and isolationKey = ?2 and collectionName = ?3",
                    workflowId, isolationKey, collectionName).list();
    }

    /**
     * Find embeddings by source ID (for updates/deduplication).
     */
    public static List<EmbeddingEntity> findBySource(UUID workflowId, String collectionName, String sourceId) {
        return find("workflowId = ?1 and collectionName = ?2 and sourceId = ?3",
                    workflowId, collectionName, sourceId).list();
    }

    /**
     * Find embeddings by source ID with isolation key.
     */
    public static List<EmbeddingEntity> findBySource(UUID workflowId, String isolationKey, String collectionName, String sourceId) {
        if (isolationKey == null || isolationKey.isEmpty()) {
            return findBySource(workflowId, collectionName, sourceId);
        }
        return find("workflowId = ?1 and isolationKey = ?2 and collectionName = ?3 and sourceId = ?4",
                    workflowId, isolationKey, collectionName, sourceId).list();
    }

    /**
     * Delete all embeddings for a source (before re-ingestion).
     */
    public static long deleteBySource(UUID workflowId, String collectionName, String sourceId) {
        return delete("workflowId = ?1 and collectionName = ?2 and sourceId = ?3",
                      workflowId, collectionName, sourceId);
    }

    /**
     * Delete all embeddings for a source with isolation key.
     */
    public static long deleteBySource(UUID workflowId, String isolationKey, String collectionName, String sourceId) {
        if (isolationKey == null || isolationKey.isEmpty()) {
            return deleteBySource(workflowId, collectionName, sourceId);
        }
        return delete("workflowId = ?1 and isolationKey = ?2 and collectionName = ?3 and sourceId = ?4",
                      workflowId, isolationKey, collectionName, sourceId);
    }

    /**
     * Count embeddings in a collection.
     */
    public static long countByCollection(UUID workflowId, String collectionName) {
        return count("workflowId = ?1 and collectionName = ?2", workflowId, collectionName);
    }

    /**
     * Count embeddings in a collection with isolation key.
     */
    public static long countByCollection(UUID workflowId, String isolationKey, String collectionName) {
        if (isolationKey == null || isolationKey.isEmpty()) {
            return countByCollection(workflowId, collectionName);
        }
        return count("workflowId = ?1 and isolationKey = ?2 and collectionName = ?3",
                     workflowId, isolationKey, collectionName);
    }
}
