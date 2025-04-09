import { generateDynamicContainer } from "../../../utils/input-collapse-container-generator.ts";

export const StudioIconCollapseContainer = generateDynamicContainer("refcomponent_collapse_container", [
    "component_value_text_block",
    "component_id_text_block",
    "component_refs_block"
]);
