/**
 * @fileoverview Datepicker Component Properties (TypeScript)
 * @module Studio/Params/Inputs/Datepicker/Properties
 *
 * @description
 * TypeScript-based property definitions for the Datepicker component.
 * Migrated from config.json to fully typed definitions.
 */

import {
  text,
  radio,
  select,
  date,
  inputText,
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

// === Custom Options ===

const localeOptions = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'French' },
  { value: 'ar', label: 'Arabic' },
  { value: 'es', label: 'Spanish' },
  { value: 'zh', label: 'Chinese' },
];

const formatOptions = [
  { value: 'DD/MM/YYYY', label: 'dd/mm/yyyy' },
  { value: 'MM/DD/YYYY', label: 'mm/dd/yyyy' },
  { value: 'YYYY/MM/DD', label: 'yyyy/mm/dd' },
];

// === Property Definitions ===

const valueProperty = inputText('datepickervalue', 'value', 'Value')
  .placeholder('Enter value')
  .build();

const labelProperty = inputText('label', 'label', 'Label')
  .placeholder('Enter label')
  .build();

const helperTextProperty = inputText('helperText', 'helper', 'Helper Text')
  .placeholder('Enter helper text')
  .build();

const placeholderProperty = inputText('placeholder', 'placeholder', 'Placeholder')
  .placeholder('Enter placeholder text')
  .build();

const localeProperty = select('locale')
  .label('Language')
  .inputProperty('locale')
  .width('180px')
  .default('en')
  .options(localeOptions)
  .valueHandler(new ComponentInputHandler('locale', 'en'))
  .stateHandler(new InputStateHandler('locale'))
  .onChange(new UpdateInputHandler('locale', 'value'))
  .withInputHandler('locale')
  .build();

const formatProperty = select('format')
  .label('Format')
  .inputProperty('format')
  .width('180px')
  .default('DD/MM/YYYY')
  .placeholder('Select format')
  .options(formatOptions)
  .valueHandler(new ComponentInputHandler('format', 'DD/MM/YYYY'))
  .stateHandler(new InputStateHandler('format'))
  .onChange(new UpdateInputHandler('format', 'value'))
  .withInputHandler('format')
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
  .build();

const disabledProperty = inputBoolean('disabled', 'disabled', 'Disabled').build();
const requiredProperty = inputBoolean('required', 'required', 'Required').build();
const rangeProperty = inputBoolean('range', 'range', 'Range Mode').build();

const minDateProperty = date('minDate')
  .label('Min Date')
  .inputProperty('minDate')
  .width('180px')
  .placeholder('YYYY-MM-DD')
  .format('YYYY-MM-DD')
  .valueHandler(new ComponentInputHandler('minDate', ''))
  .stateHandler(new InputStateHandler('minDate'))
  .on('onDateChange', new UpdateInputHandler('minDate', 'value'))
  .withInputHandler('minDate')
  .build();

const maxDateProperty = date('maxDate')
  .label('Max Date')
  .inputProperty('maxDate')
  .width('180px')
  .placeholder('YYYY-MM-DD')
  .format('YYYY-MM-DD')
  .valueHandler(new ComponentInputHandler('maxDate', ''))
  .stateHandler(new InputStateHandler('maxDate'))
  .on('onDateChange', new UpdateInputHandler('maxDate', 'value'))
  .withInputHandler('maxDate')
  .build();

// === Export ===

export const datepickerProperties: PropertyDefinition[] = [
  valueProperty,
  labelProperty,
  helperTextProperty,
  placeholderProperty,
  localeProperty,
  formatProperty,
  sizeProperty,
  disabledProperty,
  requiredProperty,
  rangeProperty,
  minDateProperty,
  maxDateProperty,
];

export const datepickerDefinition: ComponentDefinition = {
  type: 'datepicker',
  name: 'Datepicker',
  category: 'inputs',
  panel: {
    containerUuid: 'datepickerFields_collapse_container',
    containerName: 'Datepicker Fields Container',
    collapseUuid: 'datepickerFields_collapse',
    collapseTitle: 'Datepicker Properties',
  },
  properties: datepickerProperties,
  events: ['change', 'open', 'close'],
  includeCommonProperties: [
    'component_value_text_block',
    'component_id_text_block',
    'display_block',
    'access_block',
    'component_hash_text_block',
  ],
};

export default datepickerDefinition;
