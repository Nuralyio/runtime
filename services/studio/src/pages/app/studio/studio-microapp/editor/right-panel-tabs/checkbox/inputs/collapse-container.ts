import { generateDynamicContainer } from "../../../utils/input-collapse-container-generator.ts";

export const StudioCheckboxInputCollapseContainer = generateDynamicContainer("checkbox_input_collapse_container", [
  "component_value_text_block",
  "component_id_text_block",
  "label_text_block",
  "checkbox_checked_block",
  "position_collapse_container",
  "state_block",
  "size_block",
  "display_block"
]);
