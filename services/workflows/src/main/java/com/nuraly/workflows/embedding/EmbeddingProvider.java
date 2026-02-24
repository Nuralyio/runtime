package com.nuraly.workflows.embedding;

import java.util.List;

/**
 * Interface for embedding providers (OpenAI, Ollama, Local ONNX, etc.)
 *
 * Embedding providers convert text into vector representations
 * for semantic similarity search.
 */
public interface EmbeddingProvider {

    /**
     * Get the provider name (e.g., "openai", "ollama", "local")
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
     * @param apiKey The API key (may be null for local providers)
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
     * @param apiKey The API key (may be null for local providers)
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
