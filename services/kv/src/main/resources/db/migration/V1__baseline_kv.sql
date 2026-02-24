-- Baseline migration for KV service
-- Generated from Hibernate entities

-- KV entries table
CREATE TABLE IF NOT EXISTS kv_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id VARCHAR(255) NOT NULL,
    scope VARCHAR(64),
    scoped_resource_id VARCHAR(255),
    key_path VARCHAR(512) NOT NULL,
    value_data TEXT,
    value_type VARCHAR(255) NOT NULL DEFAULT 'STRING',
    is_secret BOOLEAN DEFAULT FALSE,
    is_encrypted BOOLEAN DEFAULT FALSE,
    version BIGINT DEFAULT 1,
    expires_at TIMESTAMP WITH TIME ZONE,
    metadata TEXT,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uk_kv_entries_app_key UNIQUE (application_id, key_path)
);

-- KV entry versions table (for version history)
CREATE TABLE IF NOT EXISTS kv_entry_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id UUID NOT NULL,
    version BIGINT NOT NULL,
    value_data TEXT,
    changed_by VARCHAR(255),
    change_reason VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_entry_versions_entry FOREIGN KEY (entry_id) REFERENCES kv_entries(id) ON DELETE CASCADE
);

-- KV audit logs table
CREATE TABLE IF NOT EXISTS kv_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    namespace_id UUID,
    entry_id UUID,
    key_path VARCHAR(512),
    action VARCHAR(255) NOT NULL,
    user_id VARCHAR(255),
    success BOOLEAN NOT NULL DEFAULT TRUE,
    error_message VARCHAR(255),
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Indexes for KV entries
CREATE INDEX IF NOT EXISTS idx_kv_entries_app_id ON kv_entries(application_id);
CREATE INDEX IF NOT EXISTS idx_kv_entries_key_path ON kv_entries(key_path);
CREATE INDEX IF NOT EXISTS idx_kv_entries_scope ON kv_entries(scope);
CREATE INDEX IF NOT EXISTS idx_kv_entries_expires_at ON kv_entries(expires_at);

-- Indexes for KV entry versions
CREATE INDEX IF NOT EXISTS idx_kv_entry_versions_entry_id ON kv_entry_versions(entry_id);

-- Indexes for KV audit logs
CREATE INDEX IF NOT EXISTS idx_audit_namespace ON kv_audit_logs(namespace_id);
CREATE INDEX IF NOT EXISTS idx_audit_entry ON kv_audit_logs(entry_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON kv_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON kv_audit_logs(created_at);
