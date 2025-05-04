import { StudioFileUploadHandler } from "./handler.ts";
import { StudioFileUploadDesign } from "./design.ts";
import { StudioFileUploadInputs } from "./inputs";
import { StudioFileUploadTheme } from "./theme.ts";

export const StudioFileUpload = [
  ...StudioFileUploadHandler,
  ...StudioFileUploadDesign,
  ...StudioFileUploadInputs,
  ...StudioFileUploadTheme
];