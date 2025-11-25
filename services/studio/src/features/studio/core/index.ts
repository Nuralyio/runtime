/**
 * Core Export
 * Centralized export for all studio core utilities and components
 */

// Utilities
export { generateComponents as colorBlockGenerator } from "./utils/colorBlockGenerator.ts";
export { InputBlockContainerTheme as commonEditorTheme } from "./utils/common-editor-theme.ts";
export { createHandlersFromEvents as handlerGenerator } from "./utils/handler-generator.ts";
export { generateDynamicContainer as inputCollapseContainerGenerator } from "./utils/input-collapse-container-generator.ts";

// Helpers
export { COMMON_ATTRIBUTES } from "./helpers/common_attributes.ts";
export { flattenedComponents } from "./helpers/flatten-components.ts";

// Common Inputs
export { StudioCommonInputs } from "./inputs/index.ts";

// Individual Input Blocks (default exports)
export { default as studioDisplayBlock } from "./inputs/display.ts";
export { default as studioHelperTextBlock } from "./inputs/helper-text.ts";
export { default as studioPlaceholderBlock } from "./inputs/placeholder.ts";
export { default as studioIconPickerBlock } from "./inputs/icon.ts";

// Individual Input Blocks (named exports)
export { StudioComponentNameInput as studioNameBlock } from "./inputs/name.ts";
export { StudioComponentIdInput as studioIdBlock } from "./inputs/id.ts";
export { StudioTextValueInput as studioValueBlock } from "./inputs/value.ts";
