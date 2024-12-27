import { StudioTableInputs } from "./inputs";
import { StudioTableDesign } from "./design.ts";
import { StudioTableHandler } from "./handler.ts";

export const StudioTable = [
  ...StudioTableDesign,
  ...StudioTableInputs,
  ...StudioTableHandler
];