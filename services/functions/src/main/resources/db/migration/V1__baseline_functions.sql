-- Baseline migration for Functions service
-- Generated from Hibernate entities

-- Functions table
CREATE TABLE IF NOT EXISTS functions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label VARCHAR(255),
    description VARCHAR(255),
    template VARCHAR(255),
    runtime VARCHAR(255),
    handler TEXT,
    application_id VARCHAR(255),
    created_by VARCHAR(255)
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    source VARCHAR(255) NOT NULL,
    payload TEXT,
    status VARCHAR(255) NOT NULL,
    retry_count INTEGER NOT NULL DEFAULT 0,
    processing_time TIMESTAMP WITH TIME ZONE
);

-- Indexes for events
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);

-- Indexes for functions
CREATE INDEX IF NOT EXISTS idx_functions_application_id ON functions(application_id);
CREATE INDEX IF NOT EXISTS idx_functions_created_by ON functions(created_by);
