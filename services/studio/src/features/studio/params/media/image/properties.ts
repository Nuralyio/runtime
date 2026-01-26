/**
 * @fileoverview Image Component Properties (TypeScript)
 * @module Studio/Params/Media/Image/Properties
 *
 * @description
 * TypeScript-based property definitions for the Image component.
 * Migrated from config.json to fully typed definitions.
 */

import {
  text,
  select,
  inputText,
  inputBoolean,
  type PropertyDefinition,
  type ComponentDefinition,
} from '../../../core/properties';
import {
  ComponentInputHandler,
} from '../../../core/handlers';
import {
  InputStateHandler,
} from '../../../core/handlers/state-handlers';
import {
  UpdateInputHandler,
} from '../../../core/handlers/event-handlers';

// === Custom Options ===

const fitOptions = [
  { value: 'none', label: 'None' },
  { value: 'fill', label: 'Fill' },
  { value: 'contain', label: 'Contain' },
  { value: 'cover', label: 'Cover' },
  { value: 'scale-down', label: 'Scale Down' },
];

// === Property Definitions ===

const srcProperty = inputText('src', 'src', 'Source URL')
  .placeholder('Image URL')
  .build();

const darkSrcProperty = inputText('darkSrc', 'darkSrc', 'Dark Mode URL')
  .placeholder('Dark mode image URL')
  .build();

const altProperty = inputText('alt', 'alt', 'Alt Text')
  .placeholder('Image description')
  .build();

const fallbackProperty = inputText('fallback', 'fallback', 'Fallback URL')
  .placeholder('Fallback image URL')
  .build();

const fitProperty = select('fit')
  .label('Object Fit')
  .inputProperty('fit')
  .width('180px')
  .default('cover')
  .placeholder('Select fit mode')
  .options(fitOptions)
  .valueHandler(new ComponentInputHandler('fit', 'cover'))
  .stateHandler(new InputStateHandler('fit'))
  .onChange(new UpdateInputHandler('fit', 'value'))
  .withInputHandler('fit')
  .build();

const previewableProperty = inputBoolean('previewable', 'previewable', 'Previewable').build();
const blockProperty = inputBoolean('block', 'block', 'Block Display').build();

// === Export ===

export const imageProperties: PropertyDefinition[] = [
  srcProperty,
  darkSrcProperty,
  altProperty,
  fallbackProperty,
  fitProperty,
  previewableProperty,
  blockProperty,
];

export const imageDefinition: ComponentDefinition = {
  type: 'image',
  name: 'Image',
  category: 'media',
  panel: {
    containerUuid: 'image_input_collapse_container',
    containerName: 'Image Fields Container',
    collapseUuid: 'image_input_collapse',
    collapseTitle: 'Image Properties',
  },
  properties: imageProperties,
  events: ['load', 'error', 'click'],
  includeCommonProperties: [
    'component_value_text_block',
    'component_id_text_block',
    'display_block',
    'access_block',
    'component_hash_text_block',
  ],
};

export default imageDefinition;
