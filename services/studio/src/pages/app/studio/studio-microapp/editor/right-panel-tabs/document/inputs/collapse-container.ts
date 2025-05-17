
import { generateDynamicContainer } from "../../../utils/input-collapse-container-generator.ts";

export const StudioCollapseContainer = generateDynamicContainer("document_collapse_container", [
  "document_document_previewable_text_block",
  "document_src_text_block",
  "size_collapse_container",
  "display_block"
]);
