package com.nuraly.workflows.vector;

import com.nuraly.workflows.entity.EmbeddingEntity;
import com.nuraly.workflows.test.PostgresVectorResource;
import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests for VectorStoreService using Testcontainers with PostgreSQL + PGVector.
 */
@QuarkusTest
@QuarkusTestResource(PostgresVectorResource.class)
class VectorStoreServiceIT {

    @Inject
    VectorStoreService vectorStoreService;

    private static final UUID TEST_WORKFLOW_ID = UUID.randomUUID();
    private static final String TEST_COLLECTION = "test-collection";

    @BeforeEach
    @Transactional
    void cleanup() {
        // Clean up test data before each test
        vectorStoreService.deleteCollection(TEST_WORKFLOW_ID, TEST_COLLECTION);
    }

    @Test
    void testStoreSingleEmbedding() {
        EmbeddingEntity embedding = createEmbedding("Test content", new float[]{0.1f, 0.2f, 0.3f, 0.4f});

        UUID id = vectorStoreService.store(embedding);

        assertNotNull(id);
        VectorStoreService.CollectionStats stats = vectorStoreService.getCollectionStats(
                TEST_WORKFLOW_ID, TEST_COLLECTION);
        assertEquals(1, stats.embeddingCount);
    }

    @Test
    void testStoreBatch() {
        List<EmbeddingEntity> embeddings = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            embeddings.add(createEmbedding("Content " + i, randomVector(128)));
        }

        List<UUID> ids = vectorStoreService.storeBatch(embeddings);

        assertEquals(10, ids.size());
        VectorStoreService.CollectionStats stats = vectorStoreService.getCollectionStats(
                TEST_WORKFLOW_ID, TEST_COLLECTION);
        assertEquals(10, stats.embeddingCount);
    }

    @Test
    void testStoreLargeBatch() {
        // Test batch INSERT optimization (triggers at > 5 embeddings)
        List<EmbeddingEntity> embeddings = new ArrayList<>();
        for (int i = 0; i < 50; i++) {
            embeddings.add(createEmbedding("Content " + i, randomVector(128)));
        }

        List<UUID> ids = vectorStoreService.storeBatch(embeddings);

        assertEquals(50, ids.size());
        VectorStoreService.CollectionStats stats = vectorStoreService.getCollectionStats(
                TEST_WORKFLOW_ID, TEST_COLLECTION);
        assertEquals(50, stats.embeddingCount);
    }

    @Test
    void testSimilaritySearch() {
        // Store some embeddings
        float[] baseVector = new float[128];
        Arrays.fill(baseVector, 0.1f);

        EmbeddingEntity embedding1 = createEmbedding("First document about Java programming", baseVector);
        vectorStoreService.store(embedding1);

        // Create a slightly different vector for second document
        float[] vector2 = Arrays.copyOf(baseVector, baseVector.length);
        vector2[0] = 0.2f;
        vector2[1] = 0.3f;
        EmbeddingEntity embedding2 = createEmbedding("Second document about Python", vector2);
        vectorStoreService.store(embedding2);

        // Create very different vector for third document
        float[] vector3 = new float[128];
        Arrays.fill(vector3, 0.9f);
        EmbeddingEntity embedding3 = createEmbedding("Third document about cooking", vector3);
        vectorStoreService.store(embedding3);

        // Search with a vector similar to the first document
        List<VectorStoreService.VectorSearchResult> results = vectorStoreService.search(
                TEST_WORKFLOW_ID,
                TEST_COLLECTION,
                baseVector,
                3,
                null,
                null
        );

        assertEquals(3, results.size());
        // First result should be the most similar (highest score)
        assertTrue(results.get(0).score > results.get(1).score);
        assertTrue(results.get(1).score > results.get(2).score);
    }

    @Test
    void testSearchWithMinScore() {
        // Store embeddings with different similarity levels
        float[] baseVector = new float[128];
        Arrays.fill(baseVector, 0.1f);

        EmbeddingEntity embedding1 = createEmbedding("Similar document", baseVector);
        vectorStoreService.store(embedding1);

        float[] differentVector = new float[128];
        Arrays.fill(differentVector, 0.9f);
        EmbeddingEntity embedding2 = createEmbedding("Different document", differentVector);
        vectorStoreService.store(embedding2);

        // Search with high minimum score threshold
        List<VectorStoreService.VectorSearchResult> results = vectorStoreService.search(
                TEST_WORKFLOW_ID,
                TEST_COLLECTION,
                baseVector,
                10,
                0.9, // High threshold
                null
        );

        // Should only return highly similar documents
        for (VectorStoreService.VectorSearchResult result : results) {
            assertTrue(result.score >= 0.9, "Score should be >= 0.9, was: " + result.score);
        }
    }

    @Test
    void testSearchWithIsolationKey() {
        // Store embeddings for different users
        float[] vector = randomVector(128);

        EmbeddingEntity userAEmbedding = createEmbedding("User A content", vector);
        userAEmbedding.isolationKey = "user-A";
        vectorStoreService.store(userAEmbedding);

        EmbeddingEntity userBEmbedding = createEmbedding("User B content", vector);
        userBEmbedding.isolationKey = "user-B";
        vectorStoreService.store(userBEmbedding);

        // Search for user A only
        List<VectorStoreService.VectorSearchResult> resultsA = vectorStoreService.search(
                TEST_WORKFLOW_ID,
                "user-A",
                TEST_COLLECTION,
                vector,
                10,
                null,
                null
        );

        assertEquals(1, resultsA.size());
        assertEquals("User A content", resultsA.get(0).content);

        // Search for user B only
        List<VectorStoreService.VectorSearchResult> resultsB = vectorStoreService.search(
                TEST_WORKFLOW_ID,
                "user-B",
                TEST_COLLECTION,
                vector,
                10,
                null,
                null
        );

        assertEquals(1, resultsB.size());
        assertEquals("User B content", resultsB.get(0).content);
    }

    @Test
    void testDeleteBySource() {
        // Store multiple embeddings from same source
        float[] vector = randomVector(128);

        for (int i = 0; i < 5; i++) {
            EmbeddingEntity embedding = createEmbedding("Chunk " + i, vector);
            embedding.sourceId = "document.pdf";
            embedding.chunkIndex = i;
            vectorStoreService.store(embedding);
        }

        // Store embedding from different source
        EmbeddingEntity otherEmbedding = createEmbedding("Other content", vector);
        otherEmbedding.sourceId = "other.txt";
        vectorStoreService.store(otherEmbedding);

        VectorStoreService.CollectionStats statsBefore = vectorStoreService.getCollectionStats(
                TEST_WORKFLOW_ID, TEST_COLLECTION);
        assertEquals(6, statsBefore.embeddingCount);

        // Delete embeddings from document.pdf
        int deleted = vectorStoreService.deleteBySource(
                TEST_WORKFLOW_ID, TEST_COLLECTION, "document.pdf");

        assertEquals(5, deleted);

        VectorStoreService.CollectionStats statsAfter = vectorStoreService.getCollectionStats(
                TEST_WORKFLOW_ID, TEST_COLLECTION);
        assertEquals(1, statsAfter.embeddingCount);
    }

    @Test
    void testSourceExists() {
        float[] vector = randomVector(128);
        EmbeddingEntity embedding = createEmbedding("Test content", vector);
        embedding.sourceId = "existing-document.pdf";
        vectorStoreService.store(embedding);

        assertTrue(vectorStoreService.sourceExists(TEST_WORKFLOW_ID, TEST_COLLECTION, "existing-document.pdf"));
        assertFalse(vectorStoreService.sourceExists(TEST_WORKFLOW_ID, TEST_COLLECTION, "non-existing.pdf"));
    }

    @Test
    void testCollectionStats() {
        // Store embeddings from different sources
        float[] vector = randomVector(128);

        for (int i = 0; i < 10; i++) {
            EmbeddingEntity embedding = createEmbedding("Content " + i, vector);
            embedding.sourceId = "source-" + (i % 3); // 3 different sources
            vectorStoreService.store(embedding);
        }

        VectorStoreService.CollectionStats stats = vectorStoreService.getCollectionStats(
                TEST_WORKFLOW_ID, TEST_COLLECTION);

        assertEquals(10, stats.embeddingCount);
        assertEquals(3, stats.sourceCount);
        assertNotNull(stats.firstCreated);
        assertNotNull(stats.lastUpdated);
    }

    @Test
    void testStoreBatchChunked() {
        List<EmbeddingEntity> embeddings = new ArrayList<>();
        for (int i = 0; i < 100; i++) {
            embeddings.add(createEmbedding("Content " + i, randomVector(128)));
        }

        // Store in chunks of 25
        List<UUID> ids = vectorStoreService.storeBatchChunked(embeddings, 25);

        assertEquals(100, ids.size());
        VectorStoreService.CollectionStats stats = vectorStoreService.getCollectionStats(
                TEST_WORKFLOW_ID, TEST_COLLECTION);
        assertEquals(100, stats.embeddingCount);
    }

    // Helper methods

    private EmbeddingEntity createEmbedding(String content, float[] vector) {
        EmbeddingEntity embedding = new EmbeddingEntity();
        embedding.workflowId = TEST_WORKFLOW_ID;
        embedding.collectionName = TEST_COLLECTION;
        embedding.content = content;
        embedding.embedding = vector;
        embedding.metadata = "{}";
        embedding.sourceId = "test-source";
        embedding.sourceType = "txt";
        embedding.chunkIndex = 0;
        embedding.tokenCount = content.split("\\s+").length;
        return embedding;
    }

    private float[] randomVector(int dimension) {
        Random random = new Random();
        float[] vector = new float[dimension];
        for (int i = 0; i < dimension; i++) {
            vector[i] = random.nextFloat();
        }
        return vector;
    }
}
