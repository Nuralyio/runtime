import { StudioComponentIdInput } from "./id.ts";
import { StudioInnerContainerInputAlignment } from "./inside-container-alignment.ts";
import { StudioComponentNameInput } from "./name.ts";

export const StudioCommonInputs = [
  ...StudioInnerContainerInputAlignment,
  ...StudioComponentNameInput,
  ...StudioComponentIdInput
]