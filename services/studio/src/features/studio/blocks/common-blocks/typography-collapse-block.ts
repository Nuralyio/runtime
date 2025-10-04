/**
 * TYPOGRAPHY COLLAPSE BLOCK - JSON-DRIVEN APPROACH
 * 
 * This file now uses the generic JSON-driven approach instead of the complex factory system.
 * The configuration is in typography-config.json and processed by json-processor.ts
 */

import { GenericJsonProcessor, type BlockConfig } from "../../processors/json-processor.ts";
import typographyConfigRaw from "../../components-configuration/_shared/typography.config.json";
import { ComponentType } from "@shared/redux/store/component/interface.ts";

// Type assertion for the JSON config
const typographyConfig = typographyConfigRaw as { typographyInputs: BlockConfig };

// Generate typography components from JSON config
const generatedTypographyComponents = GenericJsonProcessor.generateFromConfig(
  typographyConfig.typographyInputs,
  'typography'
);

// Add the divider that's referenced
const divider = {
  uuid: "divider",
  name: "divider",
  component_type: ComponentType.Divider,
  application_id: "1",
  input: {}
};

export default [divider, ...generatedTypographyComponents];