import { generateDynamicContainer } from "../../../utils/input-collapse-container-generator.ts";

// Example usage
export const StudioTextInputContainer = generateDynamicContainer("text_input_collapse_container", [
  "value_text_block",
  "helper_text_block",
  "label_text_block",
  "input_label_font_size_vertical_container",
  "input_helper_font_size_vertical_container",
  "placeholder_text_block",
  "position_collapse_container",
  "size_block",
  "input_type_block",
  "component_status_block",
  "state_block",
]);
