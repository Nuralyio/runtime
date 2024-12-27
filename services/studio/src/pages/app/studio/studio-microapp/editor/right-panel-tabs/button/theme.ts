import cssVariables from "./theme/css-vars.ts";
import { generateComponents } from "../../../common-blocks/studio-theme-block.ts";


export const StudioButtonTheme = generateComponents(cssVariables, "studio_button_theme_container");
