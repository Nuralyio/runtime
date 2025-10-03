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

// Export all components as a single object (useful for dynamic access)
export const StudioComponents = {
  StudioTextInput,
  StudioTextLabel,
  // Add more components here as they're migrated
};

// Export async loader for future use
export { loadAllComponents };
