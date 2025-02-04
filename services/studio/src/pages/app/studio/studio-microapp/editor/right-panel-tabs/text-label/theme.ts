import { generateComponents } from "../../../common-blocks/studio-theme-block.ts";
import { StudioTextLabelCssVar } from "./design/css-var.ts";


export const StudioTextTheme = generateComponents(StudioTextLabelCssVar, "parent_color_container");
