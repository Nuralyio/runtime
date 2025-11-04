/**
 * TABLE PROPERTIES BLOCK - YAML-DRIVEN APPROACH
 * 
 * Provides comprehensive table properties configuration:
 * - Data source configuration
 * - Table size (small, normal, large)
 * - Selection mode (none, single, multiple)
 * - Filter toggle
 * - Fixed header
 * - Expandable rows
 * - Loading state
 * - Empty state (text and icon)
 * - Scroll configuration (x, y)
 * 
 * The configuration is in table-config.yaml and processed by json-processor.ts
 */

import { GenericJsonProcessor, type BlockConfig } from "../../../processors/json-processor.ts";
import tableConfigYaml from "./table-config.yaml";

// Type assertion for the YAML config
const tableConfig = tableConfigYaml as { tableFields: BlockConfig };

// Generate table components from YAML config
const generatedTableComponents = GenericJsonProcessor.generateFromConfig(
  tableConfig.tableFields,
  'table'
);

export default generatedTableComponents;
