import { StudioTextLabelHandler } from "./handler.ts";
import {StudioDocumentTheme} from "./theme.ts";
import {DocumentInputs} from "./inputs";

export const StudioDocument = [
    ...StudioDocumentTheme,
    ...StudioTextLabelHandler,
    ...DocumentInputs
];