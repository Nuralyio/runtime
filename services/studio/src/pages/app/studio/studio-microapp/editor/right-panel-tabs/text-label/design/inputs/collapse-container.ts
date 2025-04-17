import { generateDynamicContainer } from "../../../../utils/input-collapse-container-generator.ts";

// Example usage
export const StudioCollapseContainer = generateDynamicContainer("text_label_collapse_container", [
  "component_value_text_block",
  "component_id_text_block",
  "value_text_block",
  "display_block"
]);
