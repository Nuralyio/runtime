import { generateDynamicContainer } from "../../../utils/input-collapse-container-generator.ts";

export const StudioImageCollapseContainer = generateDynamicContainer("image_input_collapse_container", [
  "component_value_text_block",
  "component_id_text_block",
  "image_previewable_text_block",
  "display_block",
  "image_alt_text_block",
  "image_src_text_block",
  "image_fallback_text_block"
]);
