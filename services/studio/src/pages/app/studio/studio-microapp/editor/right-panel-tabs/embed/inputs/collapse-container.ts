import { generateDynamicContainer } from "../../../utils/input-collapse-container-generator.ts";

export const StudioEmbedCollapseContainer = generateDynamicContainer("embed_collapse_container", [
    "component_value_text_block",
    "component_id_text_block",
    "embed_url_block"
]); 