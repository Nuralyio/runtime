/**
 * @fileoverview TextLabel Component Properties (TypeScript)
 * @module Studio/Params/Inputs/TextLabel/Properties
 *
 * @description
 * TypeScript-based property definitions for the TextLabel component.
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

const sizeOptions = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

const variantOptions = [
  { value: 'default', label: 'Default' },
  { value: 'secondary', label: 'Secondary' },
  { value: 'success', label: 'Success' },
  { value: 'warning', label: 'Warning' },
  { value: 'error', label: 'Error' },
];

// === Property Definitions ===

const valueProperty = text('value')
  .label('Text')
  .inputProperty('value')
  .width('150px')
  .default('Text label')
  .placeholder('Enter text')
  .valueHandler(new ComponentInputHandler('value', 'Text label'))
  .stateHandler(new InputStateHandler('value'))
  .onChange(new UpdateInputHandler('value', 'string'))
  .withInputHandler('value')
  .translatable()
  .build();

const sizeProperty = select('size')
  .label('Size')
  .inputProperty('size')
  .width('180px')
  .default('medium')
  .options(sizeOptions)
  .valueHandler(new ComponentInputHandler('size', 'medium'))
  .stateHandler(new InputStateHandler('size'))
  .on('changed', new UpdateInputHandler('size', 'string'))
  .build();

const variantProperty = select('variant')
  .label('Variant')
  .inputProperty('variant')
  .width('180px')
  .default('default')
  .options(variantOptions)
  .valueHandler(new ComponentInputHandler('variant', 'default'))
  .stateHandler(new InputStateHandler('variant'))
  .on('changed', new UpdateInputHandler('variant', 'string'))
  .build();

const requiredProperty = inputBoolean('required', 'required', 'Required').build();

const forProperty = inputText('for', 'for', 'For (Input ID)')
  .placeholder('Enter input ID')
  .build();

// === Export ===

export const textLabelProperties: PropertyDefinition[] = [
  valueProperty,
  sizeProperty,
  variantProperty,
  requiredProperty,
  forProperty,
];

export const textLabelDefinition: ComponentDefinition = {
  type: 'text-label',
  name: 'Text Label',
  category: 'inputs',
  panel: {
    containerUuid: 'text_label_properties_collapse_container',
    containerName: 'Text Label Properties Container',
    collapseUuid: 'text_label_properties_collapse',
    collapseTitle: 'Label Properties',
  },
  properties: textLabelProperties,
  events: ['click'],
  includeCommonProperties: [
    'component_value_text_block',
    'component_id_text_block',
    'display_block',
    'access_block',
    'component_hash_text_block',
  ],
};

export default textLabelDefinition;
