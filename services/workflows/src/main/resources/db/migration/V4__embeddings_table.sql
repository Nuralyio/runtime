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
--   - Local ONNX all-MiniLM-L6-v2: 384 dimensions
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
