import { generateDynamicContainer } from "../../../utils/input-collapse-container-generator.ts";

export const StudioLinkCollapseContainer = generateDynamicContainer("link_collapse_container", [
    "component_value_text_block",
    "component_id_text_block",
    "link_url_block"
]); 