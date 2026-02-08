-- Migration for persistent trigger ownership and cluster-aware locking
-- Supports long-running triggers like Telegram bots, Slack Socket Mode, etc.

-- Add new columns to workflow_triggers for persistent trigger support
ALTER TABLE workflow_triggers
ADD COLUMN IF NOT EXISTS credential_key VARCHAR(255),
ADD COLUMN IF NOT EXISTS environment VARCHAR(50) DEFAULT 'production',
ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS desired_state VARCHAR(50) DEFAULT 'ACTIVE',
ADD COLUMN IF NOT EXISTS buffer_queue VARCHAR(255);

-- Create trigger_ownership table for distributed locking
CREATE TABLE IF NOT EXISTS trigger_ownership (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_key VARCHAR(255) NOT NULL UNIQUE,
    active_trigger_id UUID,
    owner_instance_id VARCHAR(255),
    lease_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_heartbeat_at TIMESTAMP WITH TIME ZONE,
    connection_state VARCHAR(50) NOT NULL DEFAULT 'DISCONNECTED',
    state_reason VARCHAR(500),
    priority_trigger_id UUID,
    priority_expires_at TIMESTAMP WITH TIME ZONE,
    messages_received BIGINT DEFAULT 0,
    last_message_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_trigger_ownership_trigger FOREIGN KEY (active_trigger_id) REFERENCES workflow_triggers(id) ON DELETE SET NULL
);

-- Indexes for trigger_ownership
CREATE UNIQUE INDEX IF NOT EXISTS idx_trigger_ownership_resource ON trigger_ownership(resource_key);
CREATE INDEX IF NOT EXISTS idx_trigger_ownership_instance ON trigger_ownership(owner_instance_id);
CREATE INDEX IF NOT EXISTS idx_trigger_ownership_expires ON trigger_ownership(lease_expires_at);

-- Index for workflow_triggers credential lookup
CREATE INDEX IF NOT EXISTS idx_workflow_triggers_credential ON workflow_triggers(credential_key);
CREATE INDEX IF NOT EXISTS idx_workflow_triggers_environment ON workflow_triggers(environment);
