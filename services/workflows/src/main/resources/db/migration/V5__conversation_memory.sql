-- Conversation memory table for RAG-enhanced chat history
-- Stores conversation messages with metadata for buffer and semantic memory

CREATE TABLE IF NOT EXISTS conversation_messages (
    id UUID PRIMARY KEY,
    workflow_id UUID NOT NULL,
    conversation_id VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,  -- user, assistant, system, tool
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    token_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Foreign key to workflows table
    CONSTRAINT fk_conversation_workflow
        FOREIGN KEY (workflow_id)
        REFERENCES workflows(id)
        ON DELETE CASCADE
);

-- Index for efficient conversation retrieval
CREATE INDEX IF NOT EXISTS idx_conversation_messages_lookup
    ON conversation_messages(workflow_id, conversation_id, created_at DESC);

-- Index for role filtering
CREATE INDEX IF NOT EXISTS idx_conversation_messages_role
    ON conversation_messages(conversation_id, role);

-- Index for recent messages query
CREATE INDEX IF NOT EXISTS idx_conversation_messages_recent
    ON conversation_messages(workflow_id, conversation_id, created_at DESC)
    INCLUDE (role, content, token_count);

-- Add comment for documentation
COMMENT ON TABLE conversation_messages IS 'Stores conversation history for RAG-enhanced memory. Messages are linked to embeddings table via source_id for semantic search.';
COMMENT ON COLUMN conversation_messages.conversation_id IS 'Unique identifier for a conversation thread (e.g., session ID, thread ID)';
COMMENT ON COLUMN conversation_messages.role IS 'Message role: user, assistant, system, or tool';
COMMENT ON COLUMN conversation_messages.metadata IS 'Additional data like tool_calls, function responses, etc.';
COMMENT ON COLUMN conversation_messages.token_count IS 'Estimated token count for context window management';
