import { StudioCollectionInputs } from "./inputs";
import { StudioButtonDesign } from "./desing.ts";
import { StudioCollectionHandler } from "./handler.ts";
import { StudioCollectionTheme } from "./theme.ts";

export const StudioCollection =[
  ...StudioCollectionInputs,
  ...StudioButtonDesign,
  ...StudioCollectionHandler,
  ...StudioCollectionTheme
]