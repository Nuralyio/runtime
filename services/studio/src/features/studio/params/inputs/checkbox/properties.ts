/**
 * @fileoverview Checkbox Component Properties (TypeScript)
 * @module Studio/Params/Inputs/Checkbox/Properties
 *
 * @description
 * TypeScript-based property definitions for the Checkbox component.
 * Migrated from config.json to fully typed definitions.
 */

import {
  text,
  radio,
  inputBoolean,
  type PropertyDefinition,
  type ComponentDefinition,
} from '../../../core/properties';
import {
  ComponentInputHandler,
  sizeRadioOptions,
} from '../../../core/handlers';
import {
  InputStateHandler,
} from '../../../core/handlers/state-handlers';
import {
  UpdateInputHandler,
} from '../../../core/handlers/event-handlers';

// === Property Definitions ===

const labelProperty = text('label')
  .label('Label')
  .width('180px')
  .default('Checkbox')
  .placeholder('Checkbox label')
  .valueHandler(new ComponentInputHandler('label', 'Checkbox'))
  .stateHandler(new InputStateHandler('label'))
  .onValueChange(new UpdateInputHandler('label', 'value'))
  .build();

const idProperty = text('id')
  .label('ID')
  .width('180px')
  .placeholder('Component ID')
  .autoInputHandlers('string')
  .build();

const checkedProperty = radio('checked')
  .label('State')
  .inputProperty('value')
  .width('180px')
  .default(false as any)
  .options([
    { label: '✓', value: 'true' },
    { label: '✗', value: 'false' },
    { label: '—', value: 'indeterminate' },
  ])
  .stateHandler(new InputStateHandler('value'))
  .onChange(new UpdateInputHandler('value', 'value'))
  .withInputHandler('value')
  .valueHandler(new ComponentInputHandler('value', false))
  .build();

const sizeProperty = radio('sizeoption')
  .label('Size')
  .inputProperty('size')
  .width('180px')
  .default('medium')
  .options(sizeRadioOptions)
  .stateHandler(new InputStateHandler('size'))
  .onChange(new UpdateInputHandler('size', 'value'))
  .withInputHandler('size')
  .valueHandler(new ComponentInputHandler('size', 'medium'))
  .build();

const disabledProperty = inputBoolean('checboxdisabled', 'disabled', 'Disabled').build();

// === Export ===

export const checkboxProperties: PropertyDefinition[] = [
  labelProperty,
  idProperty,
  checkedProperty,
  sizeProperty,
  disabledProperty,
];

export const checkboxDefinition: ComponentDefinition = {
  type: 'checkbox',
  name: 'Checkbox',
  category: 'inputs',
  panel: {
    containerUuid: 'checkbox_collapse_container',
    containerName: 'Checkbox Fields Container',
    collapseUuid: 'checkbox_collapse',
    collapseTitle: 'Checkbox Properties',
  },
  properties: checkboxProperties,
  events: ['change', 'checkboxChanged'],
  includeCommonProperties: [
    'component_value_text_block',
    'component_id_text_block',
    'display_block',
    'access_block',
    'component_hash_text_block',
  ],
};

export default checkboxDefinition;
