import { createHandlersFromEvents } from "../../utils/handler-generator.ts";

export const StudioFileUploadHandler = createHandlersFromEvents
([
    {
        name: "onFilesChanged",
        label: "onFilesChanged"
      }

], "studio_FileUpload_handler");
