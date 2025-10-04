/**
 * BORDER COLLAPSE BLOCK - JSON-DRIVEN APPROACH
 * 
 * Container for border-related properties (border radius, box shadow).
 * The configuration is in border-config.json and processed by json-processor.ts
 */

import { GenericJsonProcessor, type BlockConfig } from "../../processors/json-processor.ts";
import borderConfigRaw from "../../components/_shared/border.config.json";
import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../core/helpers/common_attributes.ts";

// Type assertion for the JSON config
const borderConfig = borderConfigRaw as { borderInputs: BlockConfig };

// Generate border components from JSON config
const generatedBorderComponents = GenericJsonProcessor.generateFromConfig(
  borderConfig.borderInputs,
  'border'
);

// Add the child container that references other blocks
const borderChildrenContainer = {
  uuid: "border_collapse_container_childrens",
  application_id: "1",
  name: "Border Children Container",
  component_type: ComponentType.Container,
  ...COMMON_ATTRIBUTES,
  style: {},
  childrenIds: ["border_radius_vertical_container", "box_shadow_block"]
};

// Add divider
const divider = {
  uuid: "divider",
  name: "divider",
  component_type: ComponentType.Divider,
  application_id: "1",
  input: {}
};

export default [divider, ...generatedBorderComponents, borderChildrenContainer];