-- Drop the node type check constraint if it exists
-- This constraint was added outside of Flyway migrations and prevents new node types from being saved
-- Hibernate/JPA validates enum values at the application level, making this constraint redundant

DO $$
BEGIN
    -- Drop constraint on workflow_nodes table
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'workflow_nodes_type_check'
        AND table_name = 'workflow_nodes'
    ) THEN
        ALTER TABLE workflow_nodes DROP CONSTRAINT workflow_nodes_type_check;
    END IF;

    -- Also check and drop on workflow_node_versions table if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'workflow_node_versions_type_check'
        AND table_name = 'workflow_node_versions'
    ) THEN
        ALTER TABLE workflow_node_versions DROP CONSTRAINT workflow_node_versions_type_check;
    END IF;
END $$;
