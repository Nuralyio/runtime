import { generateComponents } from "../../../common-blocks/studio-theme-block.ts";
import { StudioCollectionCSSVars } from "./css-var.ts";


export const StudioCollectionTheme = generateComponents(StudioCollectionCSSVars, "studio_collection_theme_container");
