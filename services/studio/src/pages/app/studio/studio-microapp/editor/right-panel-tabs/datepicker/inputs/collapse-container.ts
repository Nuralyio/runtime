import { generateDynamicContainer } from "../../../utils/input-collapse-container-generator.ts";

export const StudioInputCollapseContainer = generateDynamicContainer("datepicker_input_collapse_container", [
  "component_value_text_block",
  "value_text_block",
  "datepicker_locale_block",
  "size_block",
  "position_collapse_container",
  "status_block",
  "state_block",
  "helper_text_block",
  "label_text_block",
  "datepicker_format_block",
  "datepicker_date_change_event_block"
]);
