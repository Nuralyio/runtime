import { StudioContainerCollapseContainer } from "./collapse-container.ts";
import { StudioContainerInputDirection } from "./direction.ts";
import { StudioContainerGapInput } from "./gap.ts";
import { StudioInputAlignmentDirection } from "./alignement.ts";
import { StudioContainerInputLayout } from "./layout.ts";

export const StudioContainerInputs = [
  ...StudioContainerCollapseContainer,
  ...StudioContainerInputDirection,
  ...StudioContainerGapInput,
  ...StudioInputAlignmentDirection,
  ...StudioContainerInputLayout
]