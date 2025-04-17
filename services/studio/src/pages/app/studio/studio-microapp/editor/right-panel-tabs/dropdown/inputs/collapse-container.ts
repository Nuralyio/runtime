import { generateDynamicContainer } from "../../../utils/input-collapse-container-generator.ts";

export const StudioDropdownCollapseContainer = generateDynamicContainer("dropdown_collapse_container", [
    "component_value_text_block",
    "component_id_text_block",
    "dropdown_data"
]); 