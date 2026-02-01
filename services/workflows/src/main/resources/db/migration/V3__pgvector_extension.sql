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
