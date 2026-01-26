/**
 * @fileoverview Select Component Properties (TypeScript)
 * @module Studio/Params/Inputs/Select/Properties
 *
 * @description
 * TypeScript-based property definitions for the Select component.
 * Migrated from config.json to fully typed definitions.
 */

import {
  text,
  number,
  radio,
  event,
  inputText,
  inputBoolean,
  type PropertyDefinition,
  type ComponentDefinition,
} from '../../../core/properties';
import {
  ComponentInputHandler,
  sizeRadioOptions,
  HandlerValueGetter,
  createDisabledAwareRadioHandler,
} from '../../../core/handlers';
import {
  InputStateHandler,
} from '../../../core/handlers/state-handlers';
import {
  UpdateInputHandler,
  UpdateInputAsHandlerHandler,
} from '../../../core/handlers/event-handlers';

// === Custom Options ===

const selectTypeOptions = [
  { value: 'default', label: 'Default' },
  { value: 'inline', label: 'Inline' },
];

const selectionModeOptions = [
  { value: 'single', label: 'Single' },
  { value: 'multiple', label: 'Multiple' },
];

// === Property Definitions ===

const labelProperty = inputText('label', 'label', 'Label')
  .placeholder('Select label')
  .build();

const placeholderProperty = inputText('placeholder', 'placeholder', 'Placeholder')
  .default('Select an option')
  .placeholder('Placeholder text')
  .build();

const optionsProperty = event('options')
  .label('Options')
  .width('50px')
  .handlerType('input')
  .handlerProperty('options')
  .valueHandler(new HandlerValueGetter('options', 'input'))
  .handlerValueGetter(new HandlerValueGetter('options', 'input'))
  .handlerEventUpdate(new UpdateInputAsHandlerHandler('options'))
  .build();

const valueProperty = inputText('select_value', 'value', 'Value')
  .placeholder('Selected value')
  .build();

const typeProperty = radio('select_type')
  .label('Type')
  .inputProperty('type')
  .width('180px')
  .default('default')
  .options(selectTypeOptions)
  .valueHandler(createDisabledAwareRadioHandler('type', selectTypeOptions, 'default', 'default'))
  .stateHandler(new InputStateHandler('type'))
  .onChange(new UpdateInputHandler('type', 'value'))
  .withInputHandler('type')
  .build();

const selectionModeProperty = radio('select_selection_mode')
  .label('Selection Mode')
  .inputProperty('selectionMode')
  .width('180px')
  .default('single')
  .options(selectionModeOptions)
  .valueHandler(createDisabledAwareRadioHandler('selectionMode', selectionModeOptions, 'single', 'default'))
  .stateHandler(new InputStateHandler('selectionMode'))
  .onChange(new UpdateInputHandler('selectionMode', 'value'))
  .withInputHandler('selectionMode')
  .build();

const sizeProperty = radio('sizeselect')
  .label('Size')
  .inputProperty('size')
  .width('180px')
  .default('medium')
  .options(sizeRadioOptions)
  .valueHandler(createDisabledAwareRadioHandler('size', sizeRadioOptions, 'medium', 'default'))
  .stateHandler(new InputStateHandler('size'))
  .onChange(new UpdateInputHandler('size', 'value'))
  .withInputHandler('size')
  .build();

const searchableProperty = inputBoolean('searchable', 'searchable', 'Searchable').build();

const searchPlaceholderProperty = inputText('searchPlaceholder', 'searchPlaceholder', 'Search Placeholder')
  .default('Search options...')
  .placeholder('Search placeholder text')
  .build();

const clearableProperty = inputBoolean('clearable', 'clearable', 'Clearable').build();
const disabledProperty = inputBoolean('disabled', 'disabled', 'Disabled').build();

// === Export ===

export const selectProperties: PropertyDefinition[] = [
  labelProperty,
  placeholderProperty,
  optionsProperty,
  valueProperty,
  typeProperty,
  selectionModeProperty,
  sizeProperty,
  searchableProperty,
  searchPlaceholderProperty,
  clearableProperty,
  disabledProperty,
];

export const selectDefinition: ComponentDefinition = {
  type: 'select',
  name: 'Select',
  category: 'inputs',
  panel: {
    containerUuid: 'select_collapse_container',
    containerName: 'Select Fields Container',
    collapseUuid: 'select_collapse',
    collapseTitle: 'Select Properties',
  },
  properties: selectProperties,
  events: ['change', 'search', 'focus', 'blur'],
  includeCommonProperties: [
    'component_value_text_block',
    'component_id_text_block',
    'display_block',
    'access_block',
    'component_hash_text_block',
  ],
};

export default selectDefinition;
