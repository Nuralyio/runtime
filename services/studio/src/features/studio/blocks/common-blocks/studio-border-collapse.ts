/**
 * BORDER COLLAPSE BLOCK - JSON-DRIVEN APPROACH
 * 
 * This file now uses the generic JSON-driven approach instead of the complex factory system.
 * The configuration is in border-config.json and processed by property-block-processor.ts
 */

import { generateFromConfig, type BlockConfig } from "../../processors/property-block/index.ts";
import borderConfigRaw from "../../params/_shared/border.config.json";
import { ComponentType } from "@shared/redux/store/component/component.interface.ts";
import { COMMON_ATTRIBUTES } from "../../core/helpers/common_attributes.ts";

// Type assertion for the JSON config
const borderConfig = borderConfigRaw as { borderInputs: BlockConfig };

// Generate border components from JSON config
const generatedBorderComponents = generateFromConfig(
  borderConfig.borderInputs,
  'border'
);

// Filter out the auto-generated empty properties container
// We'll replace it with our custom one that includes the child blocks
const filteredComponents = generatedBorderComponents.filter(
  component => component.uuid !== "border_collapse_container_childrens"
);

// Add the child container that references other blocks
const borderChildrenContainer = {
  uuid: "border_collapse_container_childrens",
  application_id: "1",
  name: "Border Children Container",
  component_type: ComponentType.Container,
  ...COMMON_ATTRIBUTES,
  style: {},
  childrenIds: ["border_radius_vertical_container", "box_model_vertical_container", "box_shadow_block"]
};

// Add divider
const divider = {
  uuid: "divider",
  name: "divider",
  component_type: ComponentType.Divider,
  application_id: "1",
  input: {}
};

export default [divider, ...filteredComponents, borderChildrenContainer];