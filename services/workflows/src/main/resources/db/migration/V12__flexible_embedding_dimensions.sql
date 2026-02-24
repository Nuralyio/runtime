-- ============================================================================
-- V12: Change embedding column to flexible dimensions
-- ============================================================================
-- The original column was vector(1536), hardcoded for OpenAI ada-002.
-- Different embedding models produce different dimensions (384, 768, 1024,
-- 1536, 3072). Using untyped vector allows any model to work.
-- The IVFFlat/HNSW indexes require fixed dimensions, so we drop the vector
-- index. Filtering on (workflow_id, collection_name) via the composite index
-- narrows the search set, keeping brute-force cosine distance fast enough
-- for typical RAG workloads (< 100K vectors per collection).
-- ============================================================================

-- Drop the existing IVFFlat index (tied to 1536 dimensions)
DROP INDEX IF EXISTS idx_embeddings_vector;

-- Alter the column to accept any vector dimension
ALTER TABLE embeddings ALTER COLUMN embedding TYPE vector USING embedding::vector;
