import { generateComponents } from "../../../common-blocks/studio-theme-block.ts";
import { StudioSelectCSSVars } from "./css-var.ts";


export const StudioSelectTheme = generateComponents(StudioSelectCSSVars, "parent_color_container");
