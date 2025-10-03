/**
 * Universal Component Auto-Loader
 * 
 * Automatically loads all components from their JSON configurations.
 * Each component needs 4 JSON files in its folder:
 * - _component-name-config.json
 * - _component-name-handlers.json
 * - _component-name-theme.json
 * - _component-name-meta.json
 * 
 * No properties.ts file needed anymore!
 */

import { loadComponentProperties } from "../../config/component-loader.ts";

/**
 * Component registry - maps component names to their JSON configs
 * Add new components here to auto-load them
 */
const COMPONENTS = {
  // Text Components
  "text-input": {
    configPath: "./text-input/_text-input-config.json",
    handlersPath: "./text-input/_text-input-handlers.json",
    themePath: "./text-input/_text-input-theme.json",
    metaPath: "./text-input/_text-input-meta.json",
    exportName: "StudioTextInput"
  },
  "text-label": {
    configPath: "./text-label/_text-label-config.json",
    handlersPath: "./text-label/_text-label-handlers.json",
    themePath: "./text-label/_text-label-theme.json",
    metaPath: "./text-label/_text-label-meta.json",
    exportName: "StudioTextLabel"
  },
  
  // Add more components here following the same pattern:
  // "component-name": {
  //   configPath: "./component-name/_component-name-config.json",
  //   handlersPath: "./component-name/_component-name-handlers.json",
  //   themePath: "./component-name/_component-name-theme.json",
  //   metaPath: "./component-name/_component-name-meta.json",
  //   exportName: "StudioComponentName"
  // }
};

/**
 * Load a single component from its JSON files
 */
async function loadComponent(name: string, paths: typeof COMPONENTS[keyof typeof COMPONENTS]) {
  try {
    const [fieldsConfig, handlersConfig, themeConfig, metadata] = await Promise.all([
      import(paths.configPath),
      import(paths.handlersPath),
      import(paths.themePath),
      import(paths.metaPath)
    ]);

    return {
      name: paths.exportName,
      components: loadComponentProperties(
        fieldsConfig.default,
        handlersConfig.default,
        themeConfig.default,
        metadata.default
      )
    };
  } catch (error) {
    console.error(`Failed to load component "${name}":`, error);
    return { name: paths.exportName, components: [] };
  }
}

/**
 * Load all registered components
 */
async function loadAllComponents() {
  const componentEntries = Object.entries(COMPONENTS);
  const loadedComponents = await Promise.all(
    componentEntries.map(([name, paths]) => loadComponent(name, paths))
  );
  
  return loadedComponents.reduce((acc, { name, components }) => {
    acc[name] = components;
    return acc;
  }, {} as Record<string, any[]>);
}

// For synchronous imports (using dynamic import syntax)
// Text Input
import textInputConfig from "./text-input/_text-input-config.json";
import textInputHandlers from "./text-input/_text-input-handlers.json";
import textInputTheme from "./text-input/_text-input-theme.json";
import textInputMeta from "./text-input/_text-input-meta.json";

export const StudioTextInput = loadComponentProperties(
  textInputConfig,
  textInputHandlers,
  textInputTheme,
  textInputMeta
);

// Text Label
import textLabelConfig from "./text-label/_text-label-config.json";
import textLabelHandlers from "./text-label/_text-label-handlers.json";
import textLabelTheme from "./text-label/_text-label-theme.json";
import textLabelMeta from "./text-label/_text-label-meta.json";

export const StudioTextLabel = loadComponentProperties(
  textLabelConfig,
  textLabelHandlers,
  textLabelTheme,
  textLabelMeta
);

// Datepicker
import datepickerConfig from "./datepicker/_datepicker-config.json";
import datepickerHandlers from "./datepicker/_datepicker-handlers.json";
import datepickerTheme from "./datepicker/_datepicker-theme.json";
import datepickerMeta from "./datepicker/_datepicker-meta.json";

export const StudioDatepicker = loadComponentProperties(
  datepickerConfig,
  datepickerHandlers,
  datepickerTheme,
  datepickerMeta
);

// Select
import selectConfig from "./select/_select-config.json";
import selectHandlers from "./select/_select-handlers.json";
import selectTheme from "./select/_select-theme.json";
import selectMeta from "./select/_select-meta.json";

export const StudioSelect = loadComponentProperties(
  selectConfig,
  selectHandlers,
  selectTheme,
  selectMeta
);

// Button
import buttonConfig from "./button/_button-config.json";
import buttonHandlers from "./button/_button-handlers.json";
import buttonTheme from "./button/_button-theme.json";
import buttonMeta from "./button/_button-meta.json";

export const StudioButton = loadComponentProperties(
  buttonConfig,
  buttonHandlers,
  buttonTheme,
  buttonMeta
);

// Checkbox
import checkboxConfig from "./checkbox/_checkbox-config.json";
import checkboxHandlers from "./checkbox/_checkbox-handlers.json";
import checkboxTheme from "./checkbox/_checkbox-theme.json";
import checkboxMeta from "./checkbox/_checkbox-meta.json";

export const StudioCheckbox = loadComponentProperties(
  checkboxConfig,
  checkboxHandlers,
  checkboxTheme,
  checkboxMeta
);

// Code
import codeConfig from "./code/_code-config.json";
import codeHandlers from "./code/_code-handlers.json";
import codeTheme from "./code/_code-theme.json";
import codeMeta from "./code/_code-meta.json";

export const StudioCode = loadComponentProperties(
  codeConfig,
  codeHandlers,
  codeTheme,
  codeMeta
);

// Collection
import collectionConfig from "./collection/_collection-config.json";
import collectionHandlers from "./collection/_collection-handlers.json";
import collectionTheme from "./collection/_collection-theme.json";
import collectionMeta from "./collection/_collection-meta.json";

export const StudioCollection = loadComponentProperties(
  collectionConfig,
  collectionHandlers,
  collectionTheme,
  collectionMeta
);

// Export all components as a single object (useful for dynamic access)
export const StudioComponents = {
  StudioTextInput,
  StudioTextLabel,
  StudioDatepicker,
  StudioSelect,
  StudioButton,
  StudioCheckbox,
  StudioCode,
  StudioCollection,
  // Add more components here as they're migrated
};

// Export async loader for future use
export { loadAllComponents };
