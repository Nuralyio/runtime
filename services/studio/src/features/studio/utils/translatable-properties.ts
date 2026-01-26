/**
 * @fileoverview Translatable Properties Registry
 * @module Studio/Utils/TranslatableProperties
 *
 * Provides dynamic extraction of translatable properties from component definitions.
 * Reads the `translatable: true` flag from each component's TypeScript property definitions.
 */

// Import component definitions from TypeScript properties files
import { textInputDefinition } from '../params/inputs/text-input/properties';
import { textareaDefinition } from '../params/inputs/textarea/properties';
import { textLabelDefinition } from '../params/inputs/text-label/properties';
import { selectDefinition } from '../params/inputs/select/properties';
import { checkboxDefinition } from '../params/inputs/checkbox/properties';
import { datepickerDefinition } from '../params/inputs/datepicker/properties';
import { buttonDefinition } from '../params/navigation/button/properties';
import { linkDefinition } from '../params/navigation/link/properties';
import { dropdownDefinition } from '../params/navigation/dropdown/properties';
import { badgeDefinition } from '../params/display/badge/properties';
import { richtextDefinition } from '../params/content/Richtext/properties';
import { richtextEditorDefinition } from '../params/content/RichtextEditor/properties';
import { fileUploadDefinition } from '../params/media/file-upload/properties';
import { modalDefinition } from '../params/advanced/modal/properties';
import { menuDefinition } from '../params/data/menu/properties';
import type { ComponentDefinition, PropertyDefinition } from '../core/properties/types';

/**
 * Map of component types to their definition objects
 */
const COMPONENT_DEFINITIONS: Record<string, ComponentDefinition> = {
  text_input: textInputDefinition,
  textarea: textareaDefinition,
  text_label: textLabelDefinition,
  select: selectDefinition,
  checkbox: checkboxDefinition,
  date_picker: datepickerDefinition,
  button_input: buttonDefinition,
  link: linkDefinition,
  dropdown: dropdownDefinition,
  badge: badgeDefinition,
  rich_text: richtextDefinition,
  rich_text_editor: richtextEditorDefinition,
  file_upload: fileUploadDefinition,
  modal: modalDefinition,
  menu: menuDefinition,
};

/**
 * Get translatable property names for a component type
 * Reads from the component's TypeScript definition and returns properties with translatable: true
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
  const definition = COMPONENT_DEFINITIONS[componentType];
  if (!definition) return [];

  return definition.properties
    .filter((prop: PropertyDefinition) => prop.translatable === true)
    .map((prop: PropertyDefinition) => prop.inputProperty || prop.name);
}

/**
 * Get translatable property info for a component type
 * Returns full property objects with label and name
 *
 * @param componentType - The component type
 * @returns Array of property info objects with name and label
 */
export function getTranslatablePropertyInfo(componentType: string): Array<{ name: string; label: string }> {
  const definition = COMPONENT_DEFINITIONS[componentType];
  if (!definition) return [];

  return definition.properties
    .filter((prop: PropertyDefinition) => prop.translatable === true)
    .map((prop: PropertyDefinition) => ({
      name: prop.inputProperty || prop.name,
      label: prop.label || prop.name,
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
  return Object.keys(COMPONENT_DEFINITIONS).filter((type) => hasTranslatableProperties(type));
}

export default {
  getTranslatableProperties,
  getTranslatablePropertyInfo,
  hasTranslatableProperties,
  getTranslatableComponentTypes,
};
