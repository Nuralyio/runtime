import { StudioTextValueInput } from "../../../../common/inputs/value.ts";
import { StudioCollapseContainer } from "./collapse-container.ts";
import { StudioButtonStateInput } from "../../../button/inputs/state.ts";

export const TextLabelInputs = [
  ...StudioTextValueInput,
  ...StudioCollapseContainer,
  ...StudioButtonStateInput
];