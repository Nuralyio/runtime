/**
 * Blocks Export
 * Centralized export for all studio block components
 */

// Page Blocks
export { default as studioPageInfoContainerBlock } from "./page-blocks/studio-page-info-container-block.ts";
export { default as studioPageNameBlock } from "./page-blocks/studio-page-name-block.ts";
export { default as studioPageUrlBlock } from "./page-blocks/studio-page-url-block.ts";
export { default as studioPageSEOBlock } from "./page-blocks/studio-page-seo-block.ts";
export { default as studioPageDefaultCheckboxBlock } from "./page-blocks/studio-page-default-checkbox-block.ts";
export { default as studioPageAccessControlBlock } from "./page-blocks/studio-page-access-control-block.ts";
export { PageThemeStudio } from "./page-blocks/themes.ts";

// Microapp Blocks
export { default as microAppSelectionBlocks } from "./microapp-blocks/micro-app-selection-blocks.ts";
export { default as microAppContainerBlocks } from "./microapp-blocks/micro-app-container-blocks.ts";

// Common Blocks
export { default as studioTypographyCollapseBlock } from "./common-blocks/typography-collapse-block.ts";
export { default as studioSizeCollpaseBlock } from "./common-blocks/size-collpase-block.ts";
export { default as commonInputsCollapseBlock } from "./common-blocks/common-inputs-collapse-block.ts";
export { default as studioBorderCollapse } from "./common-blocks/studio-border-collapse.ts";
export { default as studioBorderRadiusBlock } from "./common-blocks/studio-border-radius-block.ts";
export { default as studioBoxShadowBlock } from "./common-blocks/studio-box-shadow-block.ts";
export { default as studioBoxModelBlock } from "./common-blocks/studio-box-model-block.ts";
export { default as studioValidationRulesBlock } from "./common-blocks/studio-validation-rules-block.ts";
export { default as studioBorderManagerBlock } from "./common-blocks/studio-border-manager-block.ts";

// Dashboard Blocks
export { StudioDashboard } from "./dashboard-blocks/index.ts";

// Data Blocks
export { default as studioTablePropertiesBlock } from "../params/data/table/table-properties-block.ts";
