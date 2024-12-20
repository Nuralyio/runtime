

import { generateDynamicContainer } from "../../../utils/input-collapse-container-generator.ts";

export const StudioCheckboxInputCollapseContainer = generateDynamicContainer("checkbox_input_collapse_container", [
  'label_text_block',
  'checkbox_checked_block',
  'position_collapse_container',
  'state_block',
  'size_block',
  "display_block"
]);
