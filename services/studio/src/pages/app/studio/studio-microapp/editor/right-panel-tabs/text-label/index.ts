import { StudioTextLabelDesign } from "./design/design.ts";
import { StudioTextLabelHandler } from "./handler.ts";
import { StudioTextTheme } from "./theme.ts";
import { TextLabelInputs } from "./design/inputs";

export const StudioTextLabel =[
  ...StudioTextLabelDesign,
  ...StudioTextLabelHandler,
  ...StudioTextTheme,
  ...TextLabelInputs,
]