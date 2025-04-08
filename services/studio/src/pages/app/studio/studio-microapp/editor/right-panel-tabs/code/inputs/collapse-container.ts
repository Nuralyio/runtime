import { generateDynamicContainer } from "../../../utils/input-collapse-container-generator.ts";

export const StudioCodeCollapseContainer = generateDynamicContainer("code_collapse_container", [
    "code_theme_block",
    "code_language_block",
  "border_collapse_container"
]);