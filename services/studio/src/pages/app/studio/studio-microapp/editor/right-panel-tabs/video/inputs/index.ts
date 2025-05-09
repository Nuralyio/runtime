import { StudioCollapseContainer } from "./collapse-container.ts";
import {StudioVideoSrcInput} from "./src.ts";
import {StudioVideoPreviewableInput} from "./previewable.ts";

export const VideoInputs = [
  ...StudioVideoSrcInput,
  ...StudioCollapseContainer,
  ...StudioVideoPreviewableInput
];