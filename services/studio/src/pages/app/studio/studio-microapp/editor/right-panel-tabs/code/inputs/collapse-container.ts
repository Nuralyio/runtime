import { generateDynamicContainer } from "../../../utils/input-collapse-container-generator.ts";

export const StudioCodeCollapseContainer = generateDynamicContainer("code_collapse_container", [
    "component_value_text_block",
    "component_id_text_block",
    "code_theme_block",
    "code_language_block",
  "border_collapse_container"
]);