import { generateComponents } from "../../../common-blocks/studio-theme-block.ts";
import cssVariables from "../button/theme/css-vars.ts";


export const StudioTextTheme = generateComponents(cssVariables, "parent_color_container");
