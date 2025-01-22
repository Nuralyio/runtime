import { StudioTextInputDesign } from "./design";
import { StudioTextInputContainer } from "./inputs/collapse-container.ts";
import { StudioTextInputHandler } from "./handler.ts";
import { StudioTextValueInput } from "./inputs";

export const StudioTextInput = [
  ...StudioTextInputDesign,
  ...StudioTextInputContainer,
  ...StudioTextInputHandler,
  ...StudioTextValueInput
  ]