/**
 * Table Properties Block
 * 
 * This file generates table component configuration properties from a YAML configuration file
 * (table-config.yaml). It uses the generic JSON/YAML processor for generation.
 * 
 * The configuration is in table-config.yaml and processed by property-block-processor.ts
 */

import { generateFromConfig, type BlockConfig } from "../../../processors/property-block/index.ts";
import tableConfigYaml from "./table-config.yaml";

// Type assertion for the YAML config
const tableConfig = tableConfigYaml as { tableFields: BlockConfig };

// Generate table components from YAML config
const generatedTableComponents = generateFromConfig(
  tableConfig.tableFields,
  'table'
);

export default generatedTableComponents;
