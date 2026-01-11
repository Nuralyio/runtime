/**
 * @fileoverview Translatable Properties Registry
 * @module Studio/Utils/TranslatableProperties
 *
 * Provides dynamic extraction of translatable properties from component configs.
 * Reads the `translatable: true` flag from each component's config.json properties.
 */

// Import component configs
import textInputConfig from '../params/inputs/text-input/config.json';
import textareaConfig from '../params/inputs/textarea/config.json';
import textLabelConfig from '../params/inputs/text-label/config.json';
import selectConfig from '../params/inputs/select/config.json';
import checkboxConfig from '../params/inputs/checkbox/config.json';
import datepickerConfig from '../params/inputs/datepicker/config.json';
import buttonConfig from '../params/navigation/button/config.json';
import linkConfig from '../params/navigation/link/config.json';
import dropdownConfig from '../params/navigation/dropdown/config.json';
import badgeConfig from '../params/display/badge/config.json';
import richtextConfig from '../params/content/Richtext/config.json';
import richtextEditorConfig from '../params/content/RichtextEditor/config.json';
import fileUploadConfig from '../params/media/file-upload/config.json';
import modalConfig from '../params/advanced/modal/config.json';
import menuConfig from '../params/data/menu/config.json';

/**
 * Property definition from config.json
 */
interface PropertyConfig {
  name: string;
  inputProperty?: string;
  label?: string;
  translatable?: boolean;
  [key: string]: any;
}

/**
 * Config structure from config.json files
 */
interface ComponentConfig {
  [configKey: string]: {
    properties?: PropertyConfig[];
    [key: string]: any;
  };
}

/**
 * Map of component types to their config objects
 */
const COMPONENT_CONFIGS: Record<string, ComponentConfig> = {
  text_input: textInputConfig,
  textarea: textareaConfig,
  text_label: textLabelConfig,
  select: selectConfig,
  checkbox: checkboxConfig,
  date_picker: datepickerConfig,
  button_input: buttonConfig,
  link: linkConfig,
  dropdown: dropdownConfig,
  badge: badgeConfig,
  rich_text: richtextConfig,
  rich_text_editor: richtextEditorConfig,
  file_upload: fileUploadConfig,
  modal: modalConfig,
  menu: menuConfig,
};

/**
 * Extract the properties array from a config object
 * Config files have a top-level key (e.g., "textInputFields") containing the properties
 */
function extractProperties(config: ComponentConfig): PropertyConfig[] {
  const configKey = Object.keys(config)[0];
  if (!configKey) return [];

  return config[configKey]?.properties || [];
}

/**
 * Get translatable property names for a component type
 * Reads from the component's config.json and returns properties with translatable: true
 *
 * @param componentType - The component type (e.g., "text_input", "button_input")
 * @returns Array of property names that are translatable
 *
 * @example
 * ```typescript
 * getTranslatableProperties('text_input');
 * // Returns: ['label', 'placeholder']
 *
 * getTranslatableProperties('text_label');
 * // Returns: ['value']
 * ```
 */
export function getTranslatableProperties(componentType: string): string[] {
  const config = COMPONENT_CONFIGS[componentType];
  if (!config) return [];

  const properties = extractProperties(config);

  return properties
    .filter(prop => prop.translatable === true)
    .map(prop => prop.inputProperty || prop.name);
}

/**
 * Get translatable property info for a component type
 * Returns full property objects with label and name
 *
 * @param componentType - The component type
 * @returns Array of property info objects with name and label
 */
export function getTranslatablePropertyInfo(componentType: string): Array<{ name: string; label: string }> {
  const config = COMPONENT_CONFIGS[componentType];
  if (!config) return [];

  const properties = extractProperties(config);

  return properties
    .filter(prop => prop.translatable === true)
    .map(prop => ({
      name: prop.inputProperty || prop.name,
      label: prop.label || prop.name
    }));
}

/**
 * Check if a component type has any translatable properties
 *
 * @param componentType - The component type
 * @returns Whether the component has translatable properties
 */
export function hasTranslatableProperties(componentType: string): boolean {
  return getTranslatableProperties(componentType).length > 0;
}

/**
 * Get all component types that have translatable properties
 *
 * @returns Array of component types with translatable properties
 */
export function getTranslatableComponentTypes(): string[] {
  return Object.keys(COMPONENT_CONFIGS).filter(type =>
    hasTranslatableProperties(type)
  );
}

export default {
  getTranslatableProperties,
  getTranslatablePropertyInfo,
  hasTranslatableProperties,
  getTranslatableComponentTypes,
};
