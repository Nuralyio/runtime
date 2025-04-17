import { StudioTableInputs } from "./inputs";
import { StudioTableDesign } from "./design.ts";
import { StudioTableHandler } from "./handler.ts";
import { StudioTableTheme } from "./theme.ts";

export const StudioTable = [
  ...StudioTableDesign,
  ...StudioTableInputs,
  ...StudioTableHandler,
  ...StudioTableTheme
];