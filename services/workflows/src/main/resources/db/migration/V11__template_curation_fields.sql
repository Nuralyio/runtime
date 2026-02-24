ALTER TABLE workflows ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS editor_choice BOOLEAN DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_workflows_verified ON workflows(verified);
CREATE INDEX IF NOT EXISTS idx_workflows_editor_choice ON workflows(editor_choice);
