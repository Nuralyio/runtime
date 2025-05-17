
// Example usage
import { generateDynamicContainer } from "../../../utils/input-collapse-container-generator.ts";

export const StudioCollapseContainer = generateDynamicContainer("video_collapse_container", [
  "video_src_text_block",
  "video_video_previewable_text_block",
  "size_collapse_container",
  "component_id_text_block",
  "value_text_block",
  "display_block"
]);
