-- Baseline migration for Workflows service
-- Generated from Hibernate entities

-- Workflows table
CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    application_id VARCHAR(255),
    created_by VARCHAR(255),
    status VARCHAR(255) NOT NULL DEFAULT 'DRAFT',
    version VARCHAR(255) DEFAULT '1.0.0',
    variables TEXT,
    viewport TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Workflow nodes table
CREATE TABLE IF NOT EXISTS workflow_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    configuration TEXT,
    ports TEXT,
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    retry_delay_ms INTEGER DEFAULT 1000,
    timeout_ms INTEGER DEFAULT 30000,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_nodes_workflow FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
);

-- Workflow edges table
CREATE TABLE IF NOT EXISTS workflow_edges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL,
    source_node_id UUID NOT NULL,
    target_node_id UUID NOT NULL,
    source_port_id VARCHAR(255),
    target_port_id VARCHAR(255),
    condition TEXT,
    label VARCHAR(255),
    priority INTEGER DEFAULT 0,
    CONSTRAINT fk_edges_workflow FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE,
    CONSTRAINT fk_edges_source_node FOREIGN KEY (source_node_id) REFERENCES workflow_nodes(id) ON DELETE CASCADE,
    CONSTRAINT fk_edges_target_node FOREIGN KEY (target_node_id) REFERENCES workflow_nodes(id) ON DELETE CASCADE
);

-- Workflow triggers table
CREATE TABLE IF NOT EXISTS workflow_triggers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    configuration TEXT,
    enabled BOOLEAN DEFAULT TRUE,
    webhook_token VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_triggers_workflow FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
);

-- Workflow executions table
CREATE TABLE IF NOT EXISTS workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL,
    status VARCHAR(255) NOT NULL DEFAULT 'PENDING',
    input_data TEXT,
    output_data TEXT,
    variables TEXT,
    error_message TEXT,
    triggered_by VARCHAR(255),
    trigger_type VARCHAR(255),
    revision INTEGER,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms BIGINT,
    version BIGINT DEFAULT 0,
    CONSTRAINT fk_executions_workflow FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
);

-- Node executions table
CREATE TABLE IF NOT EXISTS node_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID NOT NULL,
    node_id UUID NOT NULL,
    status VARCHAR(255) NOT NULL DEFAULT 'PENDING',
    input_data TEXT,
    output_data TEXT,
    error_message TEXT,
    attempt_number INTEGER DEFAULT 1,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms BIGINT,
    CONSTRAINT fk_node_exec_execution FOREIGN KEY (execution_id) REFERENCES workflow_executions(id) ON DELETE CASCADE,
    CONSTRAINT fk_node_exec_node FOREIGN KEY (node_id) REFERENCES workflow_nodes(id) ON DELETE CASCADE
);

-- Workflow versions table (version control)
CREATE TABLE IF NOT EXISTS workflow_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL,
    version INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    application_id VARCHAR(255),
    variables TEXT,
    viewport TEXT,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uk_workflow_versions UNIQUE (workflow_id, version)
);

-- Workflow node versions table
CREATE TABLE IF NOT EXISTS workflow_node_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id UUID NOT NULL,
    workflow_id UUID NOT NULL,
    version INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    configuration TEXT,
    ports TEXT,
    position_x INTEGER,
    position_y INTEGER,
    max_retries INTEGER,
    retry_delay_ms INTEGER,
    timeout_ms INTEGER,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uk_workflow_node_versions UNIQUE (node_id, version)
);

-- Workflow edge versions table
CREATE TABLE IF NOT EXISTS workflow_edge_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    edge_id UUID NOT NULL,
    workflow_id UUID NOT NULL,
    version INTEGER NOT NULL,
    source_node_id UUID NOT NULL,
    source_port_id VARCHAR(255),
    target_node_id UUID NOT NULL,
    target_port_id VARCHAR(255),
    condition TEXT,
    label VARCHAR(255),
    priority INTEGER,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uk_workflow_edge_versions UNIQUE (edge_id, version)
);

-- Workflow trigger versions table
CREATE TABLE IF NOT EXISTS workflow_trigger_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trigger_id UUID NOT NULL,
    workflow_id UUID NOT NULL,
    version INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    configuration TEXT,
    enabled BOOLEAN,
    webhook_token VARCHAR(255),
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uk_workflow_trigger_versions UNIQUE (trigger_id, version)
);

-- Workflow revisions table (snapshots)
CREATE TABLE IF NOT EXISTS workflow_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL,
    revision INTEGER NOT NULL,
    version_label VARCHAR(255),
    description TEXT,
    workflow_version INTEGER NOT NULL,
    node_refs TEXT,
    edge_refs TEXT,
    trigger_refs TEXT,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uk_workflow_revisions UNIQUE (workflow_id, revision)
);

-- Workflow published versions table
CREATE TABLE IF NOT EXISTS workflow_published_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL UNIQUE,
    revision INTEGER NOT NULL,
    published_by VARCHAR(255) NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for workflows
CREATE INDEX IF NOT EXISTS idx_workflows_application_id ON workflows(application_id);
CREATE INDEX IF NOT EXISTS idx_workflows_created_by ON workflows(created_by);
CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status);

-- Indexes for workflow nodes
CREATE INDEX IF NOT EXISTS idx_workflow_nodes_workflow_id ON workflow_nodes(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_nodes_type ON workflow_nodes(type);

-- Indexes for workflow edges
CREATE INDEX IF NOT EXISTS idx_workflow_edges_workflow_id ON workflow_edges(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_edges_source_node ON workflow_edges(source_node_id);
CREATE INDEX IF NOT EXISTS idx_workflow_edges_target_node ON workflow_edges(target_node_id);

-- Indexes for workflow triggers
CREATE INDEX IF NOT EXISTS idx_workflow_triggers_workflow_id ON workflow_triggers(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_triggers_type ON workflow_triggers(type);
CREATE INDEX IF NOT EXISTS idx_workflow_triggers_webhook_token ON workflow_triggers(webhook_token);

-- Indexes for workflow executions
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_started_at ON workflow_executions(started_at);

-- Indexes for node executions
CREATE INDEX IF NOT EXISTS idx_node_executions_execution_id ON node_executions(execution_id);
CREATE INDEX IF NOT EXISTS idx_node_executions_node_id ON node_executions(node_id);
CREATE INDEX IF NOT EXISTS idx_node_executions_status ON node_executions(status);

-- Indexes for version control tables
CREATE INDEX IF NOT EXISTS idx_workflow_versions_workflow_id ON workflow_versions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_node_versions_workflow_id ON workflow_node_versions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_edge_versions_workflow_id ON workflow_edge_versions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_trigger_versions_workflow_id ON workflow_trigger_versions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_revisions_workflow_id ON workflow_revisions(workflow_id);
