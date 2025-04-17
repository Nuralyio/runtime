import { generateDynamicContainer } from "../../../utils/input-collapse-container-generator.ts";

export const StudioInputCollapseContainer = generateDynamicContainer("button_input_collapse_container", [
  "component_value_text_block",
  "component_id_text_block",
  "label_text_block",
  "display_block",
  "size_block",
  "button_type_block",
  "divider",
  "icon_picker_block",
  "button_icon_position_block",
  "divider",
  "state_block",
  "divider"
]);
