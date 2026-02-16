-- ============================================================================
-- V13: Convert Large Object OID references to inline TEXT
-- ============================================================================
-- Hibernate @Lob on String fields caused PostgreSQL to store values as
-- Large Objects (OIDs) instead of inline text. After removing @Lob from
-- the entities, existing rows still have OID references that need to be
-- converted to the actual text content.
-- ============================================================================

-- Convert workflow_nodes.ports from OID to inline text
UPDATE workflow_nodes
SET ports = convert_from(lo_get(ports::oid), 'UTF8')
WHERE ports IS NOT NULL
  AND ports ~ '^\d+$';

-- Convert workflow_nodes.configuration from OID to inline text
UPDATE workflow_nodes
SET configuration = convert_from(lo_get(configuration::oid), 'UTF8')
WHERE configuration IS NOT NULL
  AND configuration ~ '^\d+$';

-- Convert workflow_edges.condition_expression from OID to inline text
UPDATE workflow_edges
SET condition_expression = convert_from(lo_get(condition_expression::oid), 'UTF8')
WHERE condition_expression IS NOT NULL
  AND condition_expression ~ '^\d+$';

-- Convert workflows.description from OID to inline text
UPDATE workflows
SET description = convert_from(lo_get(description::oid), 'UTF8')
WHERE description IS NOT NULL
  AND description ~ '^\d+$';

-- Convert workflows.variables from OID to inline text
UPDATE workflows
SET variables = convert_from(lo_get(variables::oid), 'UTF8')
WHERE variables IS NOT NULL
  AND variables ~ '^\d+$';

-- Convert workflows.viewport from OID to inline text
UPDATE workflows
SET viewport = convert_from(lo_get(viewport::oid), 'UTF8')
WHERE viewport IS NOT NULL
  AND viewport ~ '^\d+$';

-- Convert workflow_executions text fields from OID to inline text
UPDATE workflow_executions
SET input_data = convert_from(lo_get(input_data::oid), 'UTF8')
WHERE input_data IS NOT NULL
  AND input_data ~ '^\d+$';

UPDATE workflow_executions
SET output_data = convert_from(lo_get(output_data::oid), 'UTF8')
WHERE output_data IS NOT NULL
  AND output_data ~ '^\d+$';

UPDATE workflow_executions
SET variables = convert_from(lo_get(variables::oid), 'UTF8')
WHERE variables IS NOT NULL
  AND variables ~ '^\d+$';

UPDATE workflow_executions
SET error_message = convert_from(lo_get(error_message::oid), 'UTF8')
WHERE error_message IS NOT NULL
  AND error_message ~ '^\d+$';

-- Convert node_executions text fields from OID to inline text
UPDATE node_executions
SET input_data = convert_from(lo_get(input_data::oid), 'UTF8')
WHERE input_data IS NOT NULL
  AND input_data ~ '^\d+$';

UPDATE node_executions
SET output_data = convert_from(lo_get(output_data::oid), 'UTF8')
WHERE output_data IS NOT NULL
  AND output_data ~ '^\d+$';

UPDATE node_executions
SET error_message = convert_from(lo_get(error_message::oid), 'UTF8')
WHERE error_message IS NOT NULL
  AND error_message ~ '^\d+$';
