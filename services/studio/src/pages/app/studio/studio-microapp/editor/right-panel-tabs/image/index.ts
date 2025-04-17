import { StudioImageHandler } from "./handler.ts";
import { StudioImageDesign } from "./design.ts";
import { StudioImageInputs } from "./inputs";
import { StudioImageTheme } from "./theme.ts";

export const StudioImage = [
  ...StudioImageHandler,
  ...StudioImageDesign,
  ...StudioImageInputs,
  ...StudioImageTheme
];