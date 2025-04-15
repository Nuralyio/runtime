import { generateDynamicContainer } from "../../../utils/input-collapse-container-generator.ts";

export const StudioSelectCollapseContainer = generateDynamicContainer("select_collapse_container", [
  "component_value_text_block",
  "component_id_text_block",
  "select_values_handler_block",
  "default_value_block",
  "label_text_block",
  "placeholder_text_block",
  "helper_text_block",
  "select_helper_color_block",
  "select_helper_font_size_vertical_container",
  "select_label_color_block",
  "select_label_font_size_vertical_container",
  "position_collapse_container",
  "status_block",
  "state_block",
  "size_block",
  "select_type_block",
  "select_selection_mode_block"
]);
