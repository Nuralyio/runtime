/**
 * @fileoverview Component Properties Registry
 * @module Studio/Core/Properties/Registry
 *
 * @description
 * Central registry that imports all ComponentDefinition objects from properties.ts files
 * and converts them to the PropertyConfig format used by native panels.
 * This eliminates redundancy by providing a single source of truth for component properties.
 */

import type { PropertyDefinition, ComponentDefinition, PropertyType } from './types';

// === Import all component definitions ===

// Inputs
import { textLabelDefinition } from '../../params/inputs/text-label/properties';
import { textInputDefinition } from '../../params/inputs/text-input/properties';
import { checkboxDefinition } from '../../params/inputs/checkbox/properties';
import { selectDefinition } from '../../params/inputs/select/properties';
import { textareaDefinition } from '../../params/inputs/textarea/properties';
import { datepickerDefinition } from '../../params/inputs/datepicker/properties';
import { formDefinition } from '../../params/inputs/form/properties';
import { colorpickerDefinition } from '../../params/inputs/colorpicker/properties';

// Layout
import { containerDefinition } from '../../params/layout/container/properties';
import { gridRowDefinition } from '../../params/layout/grid-row/properties';
import { gridColDefinition } from '../../params/layout/grid-col/properties';
import { cardDefinition } from '../../params/layout/card/properties';

// Media
import { imageDefinition } from '../../params/media/image/properties';
import { iconDefinition } from '../../params/media/icon/properties';
import { videoDefinition } from '../../params/media/video/properties';
import { fileUploadDefinition } from '../../params/media/file-upload/properties';

// Navigation
import { buttonDefinition } from '../../params/navigation/button/properties';
import { linkDefinition } from '../../params/navigation/link/properties';
import { dropdownDefinition } from '../../params/navigation/dropdown/properties';

// Data
import { tableDefinition } from '../../params/data/table/properties';
import { collectionDefinition } from '../../params/data/collection/properties';
import { menuDefinition } from '../../params/data/menu/properties';

// Display
import { badgeDefinition } from '../../params/display/badge/properties';
import { tagDefinition } from '../../params/display/tag/properties';

// Content
import { codeDefinition } from '../../params/content/code/properties';
import { documentDefinition } from '../../params/content/document/properties';
import { richtextDefinition } from '../../params/content/Richtext/properties';
import { richtextEditorDefinition } from '../../params/content/RichtextEditor/properties';

// Advanced
import { chatbotDefinition } from '../../params/advanced/chatbot/properties';
import { modalDefinition } from '../../params/advanced/modal/properties';
import { embedDefinition } from '../../params/advanced/embed/properties';
import { workflowDefinition } from '../../params/advanced/workflow/properties';
import { refComponentDefinition } from '../../params/advanced/ref-component/properties';

// === Type definitions for native panel configs ===

export interface NativePropertyConfig {
  name: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'color' | 'textarea';
  options?: Array<{ label: string; value: string }>;
  placeholder?: string;
  inputProperty?: string;
  supportsHandler?: boolean;
  translatable?: boolean;
}

export interface NativeEventConfig {
  name: string;
  label: string;
  description: string;
}

// === Utility functions ===

/**
 * Maps PropertyDefinition type to native panel type
 */
function mapPropertyType(type: PropertyType): NativePropertyConfig['type'] {
  switch (type) {
    case 'text':
    case 'date':
    case 'icon':
    case 'event':
      return 'text';
    case 'textarea':
      return 'textarea';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'radio':
    case 'select':
      return 'select';
    case 'color':
      return 'color';
    default:
      return 'text';
  }
}

/**
 * Converts PropertyDefinition options to native format
 */
function convertOptions(options: PropertyDefinition['options']): Array<{ label: string; value: string }> | undefined {
  if (!options || options.length === 0) return undefined;

  return options.map(opt => ({
    label: ('label' in opt && opt.label) ? String(opt.label) : String(opt.value),
    value: String(opt.value),
  }));
}

/**
 * Converts a PropertyDefinition to NativePropertyConfig
 */
function convertProperty(prop: PropertyDefinition): NativePropertyConfig {
  // Use inputProperty if available, otherwise fall back to name
  const propName = prop.inputProperty || prop.name;

  return {
    name: propName,
    label: prop.label || propName,
    type: mapPropertyType(prop.type),
    options: convertOptions(prop.options),
    placeholder: prop.placeholder || '',
    inputProperty: propName,
    supportsHandler: prop.hasHandler ?? true,
    translatable: prop.translatable ?? false,
  };
}

/**
 * Capitalize first letter of a string
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Standard event label and description mappings
 */
const EVENT_METADATA: Record<string, { label: string; description: string }> = {
  click: { label: 'On Click', description: 'Triggered when clicked' },
  change: { label: 'On Change', description: 'Triggered when value changes' },
  valueChange: { label: 'On Change', description: 'Triggered when value changes' },
  focus: { label: 'On Focus', description: 'Triggered when focused' },
  blur: { label: 'On Blur', description: 'Triggered when loses focus' },
  submit: { label: 'On Submit', description: 'Triggered when submitted' },
  reset: { label: 'On Reset', description: 'Triggered when reset' },
  load: { label: 'On Load', description: 'Triggered when loaded' },
  error: { label: 'On Error', description: 'Triggered on error' },
  keypress: { label: 'On Key Press', description: 'Triggered on key press' },
  keydown: { label: 'On Key Down', description: 'Triggered on key down' },
  keyup: { label: 'On Key Up', description: 'Triggered on key up' },
  mouseenter: { label: 'On Mouse Enter', description: 'Triggered when mouse enters' },
  mouseleave: { label: 'On Mouse Leave', description: 'Triggered when mouse leaves' },
  open: { label: 'On Open', description: 'Triggered when opened' },
  close: { label: 'On Close', description: 'Triggered when closed' },
  select: { label: 'On Select', description: 'Triggered when selected' },
  search: { label: 'On Search', description: 'Triggered on search input' },
  play: { label: 'On Play', description: 'Triggered when playback starts' },
  pause: { label: 'On Pause', description: 'Triggered when paused' },
  ended: { label: 'On Ended', description: 'Triggered when playback ends' },
  upload: { label: 'On Upload', description: 'Triggered when uploaded' },
  remove: { label: 'On Remove', description: 'Triggered when removed' },
  validate: { label: 'On Validate', description: 'Triggered on validation' },
  rowClick: { label: 'On Row Click', description: 'Triggered when row is clicked' },
  selectionChange: { label: 'On Selection Change', description: 'Triggered when selection changes' },
  sort: { label: 'On Sort', description: 'Triggered when sorted' },
  filter: { label: 'On Filter', description: 'Triggered when filtered' },
  itemClick: { label: 'On Item Click', description: 'Triggered when item is clicked' },
  message: { label: 'On Message', description: 'Triggered on message' },
  send: { label: 'On Send', description: 'Triggered when sent' },
  receive: { label: 'On Receive', description: 'Triggered when received' },
  afterOpen: { label: 'After Open', description: 'Triggered after opening' },
  afterClose: { label: 'After Close', description: 'Triggered after closing' },
  start: { label: 'On Start', description: 'Triggered when started' },
  complete: { label: 'On Complete', description: 'Triggered when completed' },
  progress: { label: 'On Progress', description: 'Triggered on progress update' },
  checkedChange: { label: 'On Checked Change', description: 'Triggered when checked state changes' },
  checkboxChanged: { label: 'On Checkbox Changed', description: 'Triggered when checkbox state changes' },
};

/**
 * Converts events array to NativeEventConfig array
 */
function convertEvents(events: string[] = []): NativeEventConfig[] {
  return events.map(eventName => {
    const metadata = EVENT_METADATA[eventName];
    const eventHandlerName = `on${capitalize(eventName)}`;

    if (metadata) {
      return {
        name: eventHandlerName,
        label: metadata.label,
        description: metadata.description,
      };
    }

    // Fallback for unknown events
    return {
      name: eventHandlerName,
      label: `On ${capitalize(eventName)}`,
      description: `Triggered on ${eventName}`,
    };
  });
}

/**
 * Normalizes component type to use underscores (matching existing panel conventions)
 */
function normalizeType(type: string): string {
  return type.replace(/-/g, '_');
}

// === Component definitions registry ===

const ALL_DEFINITIONS: ComponentDefinition[] = [
  // Inputs
  textLabelDefinition,
  textInputDefinition,
  checkboxDefinition,
  selectDefinition,
  textareaDefinition,
  datepickerDefinition,
  formDefinition,
  colorpickerDefinition,
  // Layout
  containerDefinition,
  gridRowDefinition,
  gridColDefinition,
  cardDefinition,
  // Media
  imageDefinition,
  iconDefinition,
  videoDefinition,
  fileUploadDefinition,
  // Navigation
  buttonDefinition,
  linkDefinition,
  dropdownDefinition,
  // Data
  tableDefinition,
  collectionDefinition,
  menuDefinition,
  // Display
  badgeDefinition,
  tagDefinition,
  // Content
  codeDefinition,
  documentDefinition,
  richtextDefinition,
  richtextEditorDefinition,
  // Advanced
  chatbotDefinition,
  modalDefinition,
  embedDefinition,
  workflowDefinition,
  refComponentDefinition,
];

// === Build registry maps ===

/**
 * Component properties for the type-properties-panel
 * Maps component type to array of property configs
 */
export const COMPONENT_PROPERTIES: Record<string, NativePropertyConfig[]> = {};

/**
 * Component events for the handlers-panel
 * Maps component type to array of event configs
 */
export const COMPONENT_EVENTS: Record<string, NativeEventConfig[]> = {};

/**
 * Original component definitions for reference
 */
export const COMPONENT_DEFINITIONS: Record<string, ComponentDefinition> = {};

// Build the registries
for (const definition of ALL_DEFINITIONS) {
  const normalizedType = normalizeType(definition.type);

  // Store original definition
  COMPONENT_DEFINITIONS[normalizedType] = definition;

  // Convert and store properties
  COMPONENT_PROPERTIES[normalizedType] = definition.properties.map(convertProperty);

  // Convert and store events
  COMPONENT_EVENTS[normalizedType] = convertEvents(definition.events);
}

// === Special case mappings for backwards compatibility ===

// button_input maps to button
if (COMPONENT_PROPERTIES['button']) {
  COMPONENT_PROPERTIES['button_input'] = COMPONENT_PROPERTIES['button'];
  COMPONENT_EVENTS['button_input'] = COMPONENT_EVENTS['button'];
}

// date_picker maps to datepicker
if (COMPONENT_PROPERTIES['datepicker']) {
  COMPONENT_PROPERTIES['date_picker'] = COMPONENT_PROPERTIES['datepicker'];
  COMPONENT_EVENTS['date_picker'] = COMPONENT_EVENTS['datepicker'];
}

// text-label uses underscore in some places
if (COMPONENT_PROPERTIES['text_label']) {
  // Already normalized
}

// === Export utility functions ===

/**
 * Get properties for a component type
 */
export function getComponentProperties(type: string): NativePropertyConfig[] {
  const normalizedType = normalizeType(type);
  return COMPONENT_PROPERTIES[normalizedType] || [];
}

/**
 * Get events for a component type
 */
export function getComponentEvents(type: string): NativeEventConfig[] {
  const normalizedType = normalizeType(type);
  return COMPONENT_EVENTS[normalizedType] || [];
}

/**
 * Get the original component definition
 */
export function getComponentDefinition(type: string): ComponentDefinition | undefined {
  const normalizedType = normalizeType(type);
  return COMPONENT_DEFINITIONS[normalizedType];
}

/**
 * Check if a component type is registered
 */
export function isComponentRegistered(type: string): boolean {
  const normalizedType = normalizeType(type);
  return normalizedType in COMPONENT_DEFINITIONS;
}

/**
 * Get all registered component types
 */
export function getRegisteredComponentTypes(): string[] {
  return Object.keys(COMPONENT_DEFINITIONS);
}
