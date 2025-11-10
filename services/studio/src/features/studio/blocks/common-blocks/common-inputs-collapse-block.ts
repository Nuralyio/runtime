/**
 * COMMON INPUTS COLLAPSE BLOCK - JSON-DRIVEN APPROACH
 * 
 * Provides common input fields used across multiple component types:
 * - Name (component name)
 * - ID (component id)
 * - Value (component value)
 * - Display (show/hide toggle with icons)
 * 
 * The configuration is in common-inputs-config.json and processed by property-block-processor.ts
 */

import { generateFromConfig, type BlockConfig } from "../../processors/property-block/index.ts";
import commonInputsConfigRaw from "../../params/_shared/common-inputs.config.json";

// Type assertion for the JSON config
const commonInputsConfig = commonInputsConfigRaw as { commonInputs: BlockConfig };

// Generate common inputs components from JSON config
const generatedCommonInputsComponents = generateFromConfig(
  commonInputsConfig.commonInputs,
  'common-inputs'
);

export default generatedCommonInputsComponents;
