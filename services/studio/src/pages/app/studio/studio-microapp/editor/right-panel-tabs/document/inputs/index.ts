import { StudioCollapseContainer } from "./collapse-container.ts";
import {StudioDocumentPreviewableInput} from "./previewable.ts";
import {StudioDocumentSrcInput} from "./src.ts";

export const DocumentInputs = [
  ...StudioCollapseContainer,
    ...StudioDocumentPreviewableInput,
    ...StudioDocumentSrcInput
];