import { generateComponents } from "../../../common-blocks/studio-theme-block.ts";
import { StudioImageCSSVars } from "./css-var.ts";


export const StudioImageTheme = generateComponents(StudioImageCSSVars, "studio_image_theme_container");
