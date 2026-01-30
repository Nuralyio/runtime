# RAG Implementation Plan for Nuraly Workflow Engine

## Overview

This plan adds native RAG (Retrieval-Augmented Generation) capabilities to Nuraly without LangChain dependency.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         IMPLEMENTATION ROADMAP                              │
└─────────────────────────────────────────────────────────────────────────────┘

  Phase 1          Phase 2          Phase 3          Phase 4
  (Foundation)     (Ingestion)      (Query)          (Advanced)
      │                │                │                │
      ▼                ▼                ▼                ▼
 ┌─────────┐     ┌───────────┐    ┌───────────┐    ┌───────────┐
 │PGVector │     │ DOCUMENT_ │    │ VECTOR_   │    │ RERANKER  │
 │ Setup   │     │ LOADER    │    │ SEARCH    │    │           │
 └─────────┘     └───────────┘    └───────────┘    └───────────┘
 ┌─────────┐     ┌───────────┐    ┌───────────┐    ┌───────────┐
 │EMBEDDING│     │ TEXT_     │    │ CONTEXT_  │    │ HYBRID    │
 │  Node   │     │ SPLITTER  │    │ BUILDER   │    │ SEARCH    │
 └─────────┘     └───────────┘    └───────────┘    └───────────┘
      │          ┌───────────┐         │                │
      │          │ VECTOR_   │         │                │
      │          │ WRITE     │         │                │
      │          └───────────┘         │                │
      │                │                │                │
      └────────────────┴────────────────┴────────────────┘
                              │
                     MVP RAG Complete
```

---

## Phase 1: Foundation (Week 1-2)

### 1.1 PGVector Setup

**Objective:** Enable vector storage in existing PostgreSQL database.

**Tasks:**

| Task | Description | File |
|------|-------------|------|
| 1.1.1 | Add Flyway migration for PGVector extension | `src/main/resources/db/migration/V20__pgvector_extension.sql` |
| 1.1.2 | Create embeddings table | `src/main/resources/db/migration/V21__embeddings_table.sql` |
| 1.1.3 | Create EmbeddingEntity | `src/main/java/com/nuraly/workflows/entity/EmbeddingEntity.java` |
| 1.1.4 | Create EmbeddingRepository | `src/main/java/com/nuraly/workflows/repository/EmbeddingRepository.java` |

**Migration V20:**
```sql
-- Enable PGVector extension
CREATE EXTENSION IF NOT EXISTS vector;
```

**Migration V21:**
```sql
-- Embeddings table for RAG
CREATE TABLE embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL,
    collection_name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536),  -- OpenAI ada-002 dimension
    metadata JSONB,
    source_id VARCHAR(255),  -- Reference to original document
    source_type VARCHAR(100), -- pdf, html, txt, etc.
    chunk_index INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for similarity search
CREATE INDEX embeddings_vector_idx ON embeddings
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Index for filtering
CREATE INDEX embeddings_app_collection_idx ON embeddings (application_id, collection_name);
CREATE INDEX embeddings_metadata_idx ON embeddings USING gin (metadata);
```

---

### 1.2 EMBEDDING Node

**Objective:** Convert text to vectors using LLM providers.

**Files to Create:**

| File | Purpose |
|------|---------|
| `EmbeddingNodeExecutor.java` | Node executor |
| `EmbeddingProvider.java` | Interface for embedding providers |
| `OpenAiEmbeddingProvider.java` | OpenAI implementation |
| `OllamaEmbeddingProvider.java` | Ollama implementation |
| `EmbeddingProviderFactory.java` | Factory for providers |

**Node Configuration:**
```json
{
  "provider": "openai",
  "model": "text-embedding-ada-002",
  "apiKeyPath": "openai/api-key",
  "inputField": "text",
  "batchSize": 100
}
```

**Input/Output:**
```
Input:  { "text": "Hello world" }  OR  { "texts": ["Hello", "World"] }
Output: { "embedding": [0.1, 0.2, ...] }  OR  { "embeddings": [[...], [...]] }
```

**EmbeddingNodeExecutor.java Structure:**
```java
@ApplicationScoped
public class EmbeddingNodeExecutor implements NodeExecutor {

    @Inject
    EmbeddingProviderFactory providerFactory;

    @Override
    public NodeType getType() {
        return NodeType.EMBEDDING;
    }

    @Override
    public NodeExecutionResult execute(ExecutionContext context, WorkflowNodeEntity node) {
        // 1. Parse config (provider, model, apiKeyPath)
        // 2. Get text(s) from input
        // 3. Call embedding provider
        // 4. Return vector(s)
    }
}
```

---

## Phase 2: Document Ingestion (Week 3-4)

### 2.1 DOCUMENT_LOADER Node

**Objective:** Parse documents (PDF, Word, HTML, etc.) into text.

**Dependencies to Add (pom.xml):**
```xml
<!-- Apache Tika for document parsing -->
<dependency>
    <groupId>org.apache.tika</groupId>
    <artifactId>tika-core</artifactId>
    <version>2.9.1</version>
</dependency>
<dependency>
    <groupId>org.apache.tika</groupId>
    <artifactId>tika-parsers-standard-package</artifactId>
    <version>2.9.1</version>
</dependency>
```

**Files to Create:**

| File | Purpose |
|------|---------|
| `DocumentLoaderNodeExecutor.java` | Node executor |
| `DocumentParser.java` | Wrapper around Tika |

**Node Configuration:**
```json
{
  "sourceType": "file",
  "filePath": "${input.filePath}",
  "mimeType": "auto",
  "extractMetadata": true,
  "maxFileSize": 52428800
}
```

**Supported Formats:**
- PDF (.pdf)
- Microsoft Word (.docx, .doc)
- HTML (.html, .htm)
- Plain Text (.txt)
- Markdown (.md)
- CSV (.csv)
- JSON (.json)
- Excel (.xlsx, .xls)

**Input/Output:**
```
Input:  { "filePath": "/path/to/doc.pdf" } OR { "url": "https://..." } OR { "content": "base64..." }
Output: {
  "text": "Extracted text content...",
  "metadata": { "title": "...", "author": "...", "pages": 10 },
  "mimeType": "application/pdf",
  "size": 1024000
}
```

---

### 2.2 TEXT_SPLITTER Node

**Objective:** Chunk documents into smaller pieces for embedding.

**Files to Create:**

| File | Purpose |
|------|---------|
| `TextSplitterNodeExecutor.java` | Node executor |
| `TextSplitter.java` | Splitting strategies interface |
| `RecursiveTextSplitter.java` | Recursive character splitter |
| `TokenTextSplitter.java` | Token-based splitter |

**Node Configuration:**
```json
{
  "strategy": "recursive",
  "chunkSize": 1000,
  "chunkOverlap": 200,
  "separators": ["\n\n", "\n", " ", ""],
  "keepSeparator": true
}
```

**Splitting Strategies:**

| Strategy | Description |
|----------|-------------|
| `recursive` | Split by separators recursively (best for most docs) |
| `token` | Split by token count (for LLM context limits) |
| `sentence` | Split by sentences |
| `paragraph` | Split by paragraphs |

**Input/Output:**
```
Input:  { "text": "Long document text..." }
Output: {
  "chunks": [
    { "content": "Chunk 1...", "index": 0, "startChar": 0, "endChar": 999 },
    { "content": "Chunk 2...", "index": 1, "startChar": 800, "endChar": 1799 }
  ],
  "totalChunks": 15
}
```

---

### 2.3 VECTOR_WRITE Node

**Objective:** Store embeddings in PGVector.

**Files to Create:**

| File | Purpose |
|------|---------|
| `VectorWriteNodeExecutor.java` | Node executor |
| `VectorStoreService.java` | Service for vector operations |

**Node Configuration:**
```json
{
  "collectionName": "my-documents",
  "upsert": true,
  "sourceIdField": "documentId",
  "metadataFields": ["title", "author", "category"]
}
```

**Input/Output:**
```
Input: {
  "chunks": [{ "content": "...", "index": 0 }],
  "embeddings": [[0.1, 0.2, ...]],
  "metadata": { "title": "Doc 1" },
  "sourceId": "doc-123"
}
Output: {
  "stored": 15,
  "collectionName": "my-documents",
  "ids": ["uuid1", "uuid2", ...]
}
```

---

## Phase 3: Query Pipeline (Week 5-6)

### 3.1 VECTOR_SEARCH Node

**Objective:** Semantic similarity search in vector store.

**Files to Create:**

| File | Purpose |
|------|---------|
| `VectorSearchNodeExecutor.java` | Node executor |

**Node Configuration:**
```json
{
  "collectionName": "my-documents",
  "topK": 5,
  "minScore": 0.7,
  "filter": {
    "category": "technical"
  },
  "includeMetadata": true,
  "includeContent": true
}
```

**Input/Output:**
```
Input:  { "query": "What is RAG?", "embedding": [0.1, 0.2, ...] }
        OR { "query": "What is RAG?" }  (auto-embed if embedding not provided)
Output: {
  "results": [
    {
      "content": "RAG stands for...",
      "score": 0.92,
      "metadata": { "title": "AI Guide", "page": 5 },
      "sourceId": "doc-123"
    }
  ],
  "totalResults": 5
}
```

**SQL for Vector Search:**
```sql
SELECT id, content, metadata, source_id,
       1 - (embedding <=> $1::vector) as score
FROM embeddings
WHERE application_id = $2
  AND collection_name = $3
  AND (metadata @> $4::jsonb OR $4 IS NULL)
ORDER BY embedding <=> $1::vector
LIMIT $5
```

---

### 3.2 CONTEXT_BUILDER Node

**Objective:** Format retrieved documents into LLM context.

**Files to Create:**

| File | Purpose |
|------|---------|
| `ContextBuilderNodeExecutor.java` | Node executor |

**Node Configuration:**
```json
{
  "template": "Based on the following context:\n\n{{#each documents}}\n[{{index}}] {{content}}\nSource: {{metadata.title}}\n\n{{/each}}\n\nAnswer the question: {{query}}",
  "maxContextLength": 4000,
  "includeSourceReferences": true,
  "documentSeparator": "\n---\n"
}
```

**Input/Output:**
```
Input: {
  "query": "What is RAG?",
  "results": [{ "content": "...", "score": 0.9, "metadata": {...} }]
}
Output: {
  "context": "Based on the following context:\n\n[1] RAG stands for...\n\nAnswer: What is RAG?",
  "sources": [{ "title": "AI Guide", "sourceId": "doc-123" }],
  "truncated": false
}
```

---

## Phase 4: Advanced Features (Week 7-8)

### 4.1 RERANKER Node (Optional)

**Objective:** Re-rank search results using cross-encoder model.

**Options:**
1. Cohere Rerank API
2. Local cross-encoder via Ollama/HuggingFace

**Node Configuration:**
```json
{
  "provider": "cohere",
  "model": "rerank-english-v2.0",
  "apiKeyPath": "cohere/api-key",
  "topN": 3
}
```

---

### 4.2 Hybrid Search (Optional)

**Objective:** Combine vector search with keyword search (BM25).

**Implementation:**
- Add tsvector column to embeddings table
- Combine scores: `hybrid_score = alpha * vector_score + (1-alpha) * keyword_score`

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           INGESTION WORKFLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

   ┌─────────┐      ┌─────────────────┐      ┌────────────────┐
   │  START  │─────▶│ DOCUMENT_LOADER │─────▶│  TEXT_SPLITTER │
   └─────────┘      │                 │      │                │
                    │ • PDF           │      │ • chunkSize    │
                    │ • Word          │      │ • overlap      │
                    │ • HTML          │      │ • strategy     │
                    └─────────────────┘      └────────────────┘
                                                     │
                                                     ▼
                                             ┌────────────────┐
                                             │   EMBEDDING    │
                                             │                │
                                             │ • OpenAI       │
                                             │ • Ollama       │
                                             └────────────────┘
                                                     │
                                                     ▼
                                             ┌────────────────┐
                                             │  VECTOR_WRITE  │
                                             │                │
                                             │ • PGVector     │
                                             │ • collection   │
                                             └────────────────┘
                                                     │
                                                     ▼
                                                ┌─────────┐
                                                │   END   │
                                                └─────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                             QUERY WORKFLOW                                  │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌────────────┐      ┌───────────┐      ┌─────────────────┐
  │ CHAT_START │─────▶│ EMBEDDING │─────▶│  VECTOR_SEARCH  │
  └────────────┘      │           │      │                 │
        │             │ query ──▶ │      │ • topK: 5       │
        │             │   vector  │      │ • minScore: 0.7 │
        │             └───────────┘      └─────────────────┘
        │                                        │
        │                                        ▼
        │                              ┌─────────────────────┐
        │                              │   CONTEXT_BUILDER   │
        │                              │                     │
        │                              │ Format docs + query │
        │                              │ into prompt         │
        │                              └─────────────────────┘
        │                                        │
        │                                        ▼
        │                                 ┌──────────┐
        ▼                                 │   LLM    │
   ┌─────────┐                            │          │
   │ query   │───────────────────────────▶│ (exists) │
   └─────────┘                            └──────────┘
                                                │
                                                ▼
                                         ┌─────────────┐
                                         │ CHAT_OUTPUT │
                                         └─────────────┘
```

---

## File Structure

```
src/main/java/com/nuraly/workflows/
├── engine/
│   └── executors/
│       ├── EmbeddingNodeExecutor.java        # Phase 1
│       ├── DocumentLoaderNodeExecutor.java   # Phase 2
│       ├── TextSplitterNodeExecutor.java     # Phase 2
│       ├── VectorWriteNodeExecutor.java      # Phase 2
│       ├── VectorSearchNodeExecutor.java     # Phase 3
│       ├── ContextBuilderNodeExecutor.java   # Phase 3
│       └── RerankerNodeExecutor.java         # Phase 4
├── embedding/
│   ├── EmbeddingProvider.java
│   ├── EmbeddingProviderFactory.java
│   ├── OpenAiEmbeddingProvider.java
│   └── OllamaEmbeddingProvider.java
├── document/
│   ├── DocumentParser.java
│   └── TextSplitter.java
├── vector/
│   └── VectorStoreService.java
├── entity/
│   └── EmbeddingEntity.java
└── repository/
    └── EmbeddingRepository.java

src/main/resources/db/migration/
├── V20__pgvector_extension.sql
└── V21__embeddings_table.sql
```

---

## NodeType Enum Updates

Add to `NodeType.java`:
```java
// RAG nodes
EMBEDDING,      // Generate embeddings from text
DOCUMENT_LOADER,// Load and parse documents
TEXT_SPLITTER,  // Split text into chunks
VECTOR_WRITE,   // Write vectors to store
VECTOR_SEARCH,  // Search vectors by similarity
CONTEXT_BUILDER,// Build context from retrieved docs
RERANKER,       // Re-rank search results
```

---

## Dependencies to Add (pom.xml)

```xml
<!-- Apache Tika for document parsing -->
<dependency>
    <groupId>org.apache.tika</groupId>
    <artifactId>tika-core</artifactId>
    <version>2.9.1</version>
</dependency>
<dependency>
    <groupId>org.apache.tika</groupId>
    <artifactId>tika-parsers-standard-package</artifactId>
    <version>2.9.1</version>
</dependency>

<!-- PGVector support (if using native JDBC) -->
<dependency>
    <groupId>com.pgvector</groupId>
    <artifactId>pgvector</artifactId>
    <version>0.1.4</version>
</dependency>
```

---

## Implementation Checklist

### Phase 1: Foundation
- [ ] Add PGVector extension migration
- [ ] Create embeddings table migration
- [ ] Create EmbeddingEntity
- [ ] Create EmbeddingRepository
- [ ] Add EMBEDDING to NodeType enum
- [ ] Implement EmbeddingProvider interface
- [ ] Implement OpenAiEmbeddingProvider
- [ ] Implement OllamaEmbeddingProvider
- [ ] Implement EmbeddingProviderFactory
- [ ] Implement EmbeddingNodeExecutor
- [ ] Write tests for EmbeddingNodeExecutor

### Phase 2: Document Ingestion
- [ ] Add Apache Tika dependencies
- [ ] Add DOCUMENT_LOADER to NodeType enum
- [ ] Implement DocumentParser
- [ ] Implement DocumentLoaderNodeExecutor
- [ ] Add TEXT_SPLITTER to NodeType enum
- [ ] Implement TextSplitter interface
- [ ] Implement RecursiveTextSplitter
- [ ] Implement TextSplitterNodeExecutor
- [ ] Add VECTOR_WRITE to NodeType enum
- [ ] Implement VectorStoreService
- [ ] Implement VectorWriteNodeExecutor
- [ ] Write tests for ingestion nodes

### Phase 3: Query Pipeline
- [ ] Add VECTOR_SEARCH to NodeType enum
- [ ] Implement VectorSearchNodeExecutor
- [ ] Add CONTEXT_BUILDER to NodeType enum
- [ ] Implement ContextBuilderNodeExecutor
- [ ] Write tests for query nodes
- [ ] Create example RAG workflow

### Phase 4: Advanced (Optional)
- [ ] Add RERANKER to NodeType enum
- [ ] Implement RerankerNodeExecutor
- [ ] Add hybrid search support
- [ ] Performance optimization

---

## Estimated Effort

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1 | PGVector + Embedding | 1-2 weeks |
| Phase 2 | Document Ingestion | 2 weeks |
| Phase 3 | Query Pipeline | 1-2 weeks |
| Phase 4 | Advanced Features | 1-2 weeks |
| **Total** | **MVP RAG** | **5-8 weeks** |

---

## Success Criteria

After implementation, users should be able to:

1. **Ingest Documents**
   - Upload PDF/Word/HTML documents
   - Automatically chunk and embed
   - Store in vector database

2. **Query Documents**
   - Ask natural language questions
   - Get relevant context retrieved
   - Receive AI-generated answers with sources

3. **Build RAG Workflows Visually**
   - Drag-and-drop RAG nodes
   - Configure without code
   - See execution trace

---

## Example: Complete RAG Workflow JSON

```json
{
  "name": "Document Q&A RAG",
  "nodes": [
    {
      "id": "chat-start",
      "type": "CHAT_START",
      "name": "User Question"
    },
    {
      "id": "embed-query",
      "type": "EMBEDDING",
      "name": "Embed Query",
      "configuration": {
        "provider": "openai",
        "model": "text-embedding-ada-002",
        "apiKeyPath": "openai/api-key"
      }
    },
    {
      "id": "search",
      "type": "VECTOR_SEARCH",
      "name": "Find Relevant Docs",
      "configuration": {
        "collectionName": "knowledge-base",
        "topK": 5,
        "minScore": 0.7
      }
    },
    {
      "id": "context",
      "type": "CONTEXT_BUILDER",
      "name": "Build Context",
      "configuration": {
        "maxContextLength": 4000
      }
    },
    {
      "id": "llm",
      "type": "LLM",
      "name": "Generate Answer",
      "configuration": {
        "provider": "openai",
        "model": "gpt-4o",
        "apiKeyPath": "openai/api-key",
        "systemPrompt": "Answer based only on the provided context. Cite sources."
      }
    },
    {
      "id": "output",
      "type": "CHAT_OUTPUT",
      "name": "Send Response"
    }
  ],
  "edges": [
    { "source": "chat-start", "target": "embed-query" },
    { "source": "embed-query", "target": "search" },
    { "source": "search", "target": "context" },
    { "source": "context", "target": "llm" },
    { "source": "llm", "target": "output" }
  ]
}
```
