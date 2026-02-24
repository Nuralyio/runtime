-- Baseline migration for Journal service
-- Generated from Hibernate entities

-- Log entries table with JSONB support
CREATE TABLE IF NOT EXISTS logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    service VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    level VARCHAR(10) DEFAULT 'INFO',
    correlation_id UUID,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_logs_service ON logs(service);
CREATE INDEX IF NOT EXISTS idx_logs_type ON logs(type);
CREATE INDEX IF NOT EXISTS idx_logs_correlation_id ON logs(correlation_id);
CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level);

-- GIN index for JSONB data queries
CREATE INDEX IF NOT EXISTS idx_logs_data ON logs USING GIN (data);
