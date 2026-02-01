-- Add support for annotation node types: NOTE and FRAME
-- These are visual-only nodes used for documenting and organizing workflows
-- They have no ports and do not participate in workflow execution

-- NOTE: No schema changes required since V6 removed the node_type constraint
-- The NodeType enum in Java now includes NOTE and FRAME values
-- This migration serves as documentation that these types are now supported

-- Node types added:
-- NOTE  - Text annotation for documenting workflows, supports customizable colors and font sizes
-- FRAME - Visual grouping container for organizing related nodes together

COMMENT ON TABLE workflow_nodes IS 'Workflow nodes including execution nodes and annotation nodes (NOTE, FRAME)';
