package com.nuraly.workflows.rag;

import com.nuraly.workflows.document.TextSplitter;
import com.nuraly.workflows.document.splitters.RecursiveCharacterTextSplitter;
import com.nuraly.workflows.document.loaders.PlainTextDocumentLoader;
import com.nuraly.workflows.entity.EmbeddingEntity;
import com.nuraly.workflows.test.PostgresVectorResource;
import com.nuraly.workflows.vector.VectorStoreService;
import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests for the complete RAG pipeline:
 * Document Loading -> Text Splitting -> Embedding (simulated) -> Vector Storage -> Search
 */
@QuarkusTest
@QuarkusTestResource(PostgresVectorResource.class)
class RagPipelineIT {

    @Inject
    VectorStoreService vectorStoreService;

    @Inject
    RecursiveCharacterTextSplitter textSplitter;

    @Inject
    PlainTextDocumentLoader textLoader;

    private static final UUID TEST_WORKFLOW_ID = UUID.randomUUID();
    private static final String TEST_COLLECTION = "rag-pipeline-test";

    @BeforeEach
    void cleanup() {
        vectorStoreService.deleteCollection(TEST_WORKFLOW_ID, TEST_COLLECTION);
    }

    @Test
    void testCompleteIngestionPipeline() throws Exception {
        // 1. Load document
        String documentText = """
            Introduction to Machine Learning

            Machine learning is a subset of artificial intelligence (AI) that provides systems
            the ability to automatically learn and improve from experience without being
            explicitly programmed. Machine learning focuses on the development of computer
            programs that can access data and use it to learn for themselves.

            The process of learning begins with observations or data, such as examples,
            direct experience, or instruction, in order to look for patterns in data and
            make better decisions in the future based on the examples that we provide.

            Types of Machine Learning

            There are three main types of machine learning:

            1. Supervised Learning - The algorithm is trained on labeled data.
            2. Unsupervised Learning - The algorithm finds patterns in unlabeled data.
            3. Reinforcement Learning - The algorithm learns through trial and error.

            Each type has its own use cases and applications in real-world scenarios.
            """;

        var loadedDoc = textLoader.loadFromString(documentText, "ml-intro.txt", Map.of("topic", "machine-learning"));

        assertNotNull(loadedDoc);
        assertEquals("ml-intro.txt", loadedDoc.getSourceId());
        assertEquals("txt", loadedDoc.getSourceType());

        // 2. Split into chunks
        List<TextSplitter.TextChunk> chunks = textSplitter.split(loadedDoc.getContent(), 300, 50);

        assertTrue(chunks.size() > 1, "Document should be split into multiple chunks");

        // 3. Create embeddings (simulated - using random vectors)
        List<EmbeddingEntity> embeddings = new ArrayList<>();
        Random random = new Random(42); // Fixed seed for reproducibility

        for (TextSplitter.TextChunk chunk : chunks) {
            EmbeddingEntity embedding = new EmbeddingEntity();
            embedding.workflowId = TEST_WORKFLOW_ID;
            embedding.collectionName = TEST_COLLECTION;
            embedding.content = chunk.getContent();
            embedding.embedding = simulateEmbedding(chunk.getContent(), random);
            embedding.metadata = "{\"topic\": \"machine-learning\"}";
            embedding.sourceId = loadedDoc.getSourceId();
            embedding.sourceType = loadedDoc.getSourceType();
            embedding.chunkIndex = chunk.getIndex();
            embedding.tokenCount = TextSplitter.estimateTokenCount(chunk.getContent());
            embeddings.add(embedding);
        }

        // 4. Store embeddings
        List<UUID> storedIds = vectorStoreService.storeBatch(embeddings);

        assertEquals(chunks.size(), storedIds.size());

        // 5. Verify storage
        VectorStoreService.CollectionStats stats = vectorStoreService.getCollectionStats(
                TEST_WORKFLOW_ID, TEST_COLLECTION);

        assertEquals(chunks.size(), stats.embeddingCount);
        assertEquals(1, stats.sourceCount);

        // 6. Search (using simulated query embedding)
        float[] queryEmbedding = simulateEmbedding("What are the types of machine learning?", random);
        List<VectorStoreService.VectorSearchResult> results = vectorStoreService.search(
                TEST_WORKFLOW_ID,
                TEST_COLLECTION,
                queryEmbedding,
                3,
                null,
                null
        );

        assertFalse(results.isEmpty(), "Search should return results");
        assertTrue(results.size() <= 3, "Should return at most topK results");

        for (VectorStoreService.VectorSearchResult result : results) {
            assertNotNull(result.content);
            assertNotNull(result.id);
            assertTrue(result.score >= 0 && result.score <= 1, "Score should be between 0 and 1");
        }
    }

    @Test
    void testMultiUserIsolation() throws Exception {
        // Test that different users can't see each other's data
        String userAContent = "User A's private financial data about investments.";
        String userBContent = "User B's private health records.";

        Random random = new Random(42);

        // Store User A's document
        EmbeddingEntity userAEmbedding = new EmbeddingEntity();
        userAEmbedding.workflowId = TEST_WORKFLOW_ID;
        userAEmbedding.isolationKey = "user-A";
        userAEmbedding.collectionName = TEST_COLLECTION;
        userAEmbedding.content = userAContent;
        userAEmbedding.embedding = simulateEmbedding(userAContent, random);
        userAEmbedding.sourceId = "user-a-doc.txt";
        userAEmbedding.sourceType = "txt";
        userAEmbedding.metadata = "{}";
        vectorStoreService.store(userAEmbedding);

        // Store User B's document
        EmbeddingEntity userBEmbedding = new EmbeddingEntity();
        userBEmbedding.workflowId = TEST_WORKFLOW_ID;
        userBEmbedding.isolationKey = "user-B";
        userBEmbedding.collectionName = TEST_COLLECTION;
        userBEmbedding.content = userBContent;
        userBEmbedding.embedding = simulateEmbedding(userBContent, random);
        userBEmbedding.sourceId = "user-b-doc.txt";
        userBEmbedding.sourceType = "txt";
        userBEmbedding.metadata = "{}";
        vectorStoreService.store(userBEmbedding);

        // User A searches - should only see their own data
        float[] queryVector = simulateEmbedding("financial data", random);
        List<VectorStoreService.VectorSearchResult> userAResults = vectorStoreService.search(
                TEST_WORKFLOW_ID,
                "user-A",
                TEST_COLLECTION,
                queryVector,
                10,
                null,
                null
        );

        assertEquals(1, userAResults.size());
        assertTrue(userAResults.get(0).content.contains("User A"));

        // User B searches - should only see their own data
        List<VectorStoreService.VectorSearchResult> userBResults = vectorStoreService.search(
                TEST_WORKFLOW_ID,
                "user-B",
                TEST_COLLECTION,
                queryVector,
                10,
                null,
                null
        );

        assertEquals(1, userBResults.size());
        assertTrue(userBResults.get(0).content.contains("User B"));
    }

    @Test
    void testDocumentUpdate() throws Exception {
        Random random = new Random(42);
        String sourceId = "updatable-doc.txt";

        // Store initial version
        String initialContent = "Initial version of the document.";
        EmbeddingEntity initialEmbedding = createEmbedding(initialContent, sourceId, random);
        vectorStoreService.store(initialEmbedding);

        assertTrue(vectorStoreService.sourceExists(TEST_WORKFLOW_ID, TEST_COLLECTION, sourceId));

        VectorStoreService.CollectionStats statsBefore = vectorStoreService.getCollectionStats(
                TEST_WORKFLOW_ID, TEST_COLLECTION);
        assertEquals(1, statsBefore.embeddingCount);

        // Delete old version (simulating upsert replace mode)
        int deleted = vectorStoreService.deleteBySource(TEST_WORKFLOW_ID, TEST_COLLECTION, sourceId);
        assertEquals(1, deleted);

        // Store updated version with multiple chunks
        List<EmbeddingEntity> updatedEmbeddings = new ArrayList<>();
        for (int i = 0; i < 3; i++) {
            String updatedContent = "Updated version chunk " + (i + 1) + " with more content.";
            EmbeddingEntity embedding = createEmbedding(updatedContent, sourceId, random);
            embedding.chunkIndex = i;
            updatedEmbeddings.add(embedding);
        }

        vectorStoreService.storeBatch(updatedEmbeddings);

        VectorStoreService.CollectionStats statsAfter = vectorStoreService.getCollectionStats(
                TEST_WORKFLOW_ID, TEST_COLLECTION);
        assertEquals(3, statsAfter.embeddingCount);
        assertEquals(1, statsAfter.sourceCount);
    }

    // Helper methods

    /**
     * Simulate embedding generation by creating a deterministic vector based on content.
     * In real usage, this would call the EmbeddingProvider.
     */
    private float[] simulateEmbedding(String text, Random random) {
        float[] vector = new float[128];
        // Use text hash to seed randomness for reproducible but content-based vectors
        random.setSeed(text.hashCode());
        for (int i = 0; i < vector.length; i++) {
            vector[i] = random.nextFloat();
        }
        // Normalize
        float norm = 0;
        for (float v : vector) {
            norm += v * v;
        }
        norm = (float) Math.sqrt(norm);
        for (int i = 0; i < vector.length; i++) {
            vector[i] /= norm;
        }
        return vector;
    }

    private EmbeddingEntity createEmbedding(String content, String sourceId, Random random) {
        EmbeddingEntity embedding = new EmbeddingEntity();
        embedding.workflowId = TEST_WORKFLOW_ID;
        embedding.collectionName = TEST_COLLECTION;
        embedding.content = content;
        embedding.embedding = simulateEmbedding(content, random);
        embedding.metadata = "{}";
        embedding.sourceId = sourceId;
        embedding.sourceType = "txt";
        embedding.chunkIndex = 0;
        embedding.tokenCount = content.split("\\s+").length;
        return embedding;
    }
}
