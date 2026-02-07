-- Add template support to workflows
ALTER TABLE workflows ADD COLUMN is_template BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX idx_workflows_is_template ON workflows(is_template);
