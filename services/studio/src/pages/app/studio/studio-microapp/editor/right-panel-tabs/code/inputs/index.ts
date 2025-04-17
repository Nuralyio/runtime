import { StudioLanguageThemeInput } from "./code-language";
import { StudiocodeThemeInput } from "./code-theme";
import { StudioCodeCollapseContainer } from "./collapse-container";

export const StudioCodeInputs = [
    ...StudioCodeCollapseContainer,
    ...StudiocodeThemeInput,
    ...StudioLanguageThemeInput
];
