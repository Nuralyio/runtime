import { StudioContainerInputs } from "./inputs";
import { StudioContainerHandler } from "./handler.ts";
import { StudioContainerDesign } from "./design.ts";
import { StudioContainerTheme } from "./theme.ts";

export const StudioContainer = [
  ...StudioContainerInputs,
  ...StudioContainerHandler,
  ...StudioContainerDesign,
  ...StudioContainerTheme
]