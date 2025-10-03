/**
 * Universal Component Property Loader
 * 
 * Generates studio component properties from JSON configuration files.
 * Each component needs 4 files:
 * - _component-config.json      (field definitions)
 * - _component-handlers.json    (event handlers)
 * - _component-theme.json       (CSS variables/theme)
 * - _component-meta.json        (NEW: component metadata)
 */

import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";
import { GenericJsonProcessor, type BlockConfig } from "./json-processor.ts";
import { createHandlersFromEvents } from "../editor/utils/handler-generator.ts";
import { generateComponents } from "../common-blocks/studio-theme-block.ts";

// Type definitions
type CssVarItem = { 
  label: string; 
  cssVar: string;
  type?: "color" | "text" | "number" | "select";
  defaultValue?: string;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
};
type CssVarGroup = { name: string; items: CssVarItem[]; open?: boolean };
type CssVarSection = { name: string; open?: boolean; items: CssVarGroup[] };

type HandlerConfig = {
  handlerPrefix: string;
  events: Array<{ name: string; label: string }>;
};

/**
 * Component metadata configuration
 */
export interface ComponentMetadata {
  /** Unique identifier for the parent container */
  uuid: string;
  
  /** Display name for the parent container */
  name: string;
  
  /** ID for theme container (usually uuid + "_theme_container") */
  themeContainerId: string;
  
  /** Config key for field components (e.g., "textInputFields", "textLabelFields") */
  configKey: string;
  
  /** Child component IDs to include in the parent container */
  childrenIds: string[];
  
  /** Optional: Custom container styles */
  containerStyle?: Record<string, string>;
}

/**
 * Loads and generates component properties from JSON configs
 * 
 * @param fieldsConfig - Field configuration JSON
 * @param handlersConfig - Event handlers configuration JSON
 * @param themeConfig - Theme/CSS variables configuration JSON
 * @param metadata - Component metadata
 * @returns Array of component definitions ready for studio
 * 
 * @example
 * ```typescript
 * import fieldsConfig from "./_text-input-config.json";
 * import handlersConfig from "./_text-input-handlers.json";
 * import themeConfig from "./_text-input-theme.json";
 * import metadata from "./_text-input-meta.json";
 * 
 * export const StudioTextInput = loadComponentProperties(
 *   fieldsConfig,
 *   handlersConfig,
 *   themeConfig,
 *   metadata
 * );
 * ```
 */
export function loadComponentProperties(
  fieldsConfig: any,
  handlersConfig: any,
  themeConfig: any,
  metadata: ComponentMetadata
) {
  // Type assertions
  const fieldsConfigTyped = fieldsConfig as Record<string, BlockConfig>;
  const handlersConfigTyped = handlersConfig as HandlerConfig;
  const themeConfigTyped = themeConfig as CssVarSection[];

  // Generate field components from JSON config
  const fieldComponents = GenericJsonProcessor.generateFromConfig(
    fieldsConfigTyped[metadata.configKey],
    metadata.configKey
  );

  // Generate handlers from JSON config
  const handlerComponents = createHandlersFromEvents(
    handlersConfigTyped.events,
    handlersConfigTyped.handlerPrefix
  );

  // Generate theme components from JSON config
  const themeComponents = generateComponents(
    themeConfigTyped,
    metadata.themeContainerId
  );

  // Build parent container
  const parentContainer = {
    uuid: metadata.uuid,
    application_id: "1",
    name: metadata.name,
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: metadata.containerStyle || {
      display: "flex",
      "flex-direction": "column"
    },
    childrenIds: metadata.childrenIds
  };

  // Combine all components
  return [
    parentContainer,
    ...fieldComponents,
    ...handlerComponents,
    ...themeComponents
  ];
}

/**
 * Simplified loader that auto-imports JSON files based on component name
 * Requires consistent naming convention:
 * - _[component]-config.json
 * - _[component]-handlers.json
 * - _[component]-theme.json
 * - _[component]-meta.json
 */
export function createComponentLoader(componentName: string) {
  return (
    fieldsConfig: any,
    handlersConfig: any,
    themeConfig: any,
    metadata: ComponentMetadata
  ) => {
    return loadComponentProperties(
      fieldsConfig,
      handlersConfig,
      themeConfig,
      metadata
    );
  };
}
