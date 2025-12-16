/**
 * Table Properties Block
 * 
 * This file generates table component configuration properties from a JSON configuration file
 * (config.json). It uses the generic JSON processor for generation.
 * 
 * The configuration is in config.json and processed by property-block-processor.ts
 */

import { generateFromConfig, type BlockConfig } from "../../../processors/property-block/index.ts";
import tableConfig from "./config.json";

// Type assertion for the JSON config
const tableConfigData = tableConfig as { tableFields: BlockConfig };

// Generate table components from JSON config
const generatedTableComponents = generateFromConfig(
  tableConfigData.tableFields,
  'table'
);

export default generatedTableComponents;
