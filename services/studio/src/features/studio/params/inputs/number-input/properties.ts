/**
 * @fileoverview NumberInput Component Properties (TypeScript)
 * @module Studio/Params/Inputs/NumberInput/Properties
 *
 * @description
 * TypeScript-based property definitions for the NumberInput component.
 * NumberInput is a studio wrapper around nr-input with type="number".
 */

import {
  number,
  inputText,
  inputRadio,
  inputBoolean,
  type PropertyDefinition,
  type ComponentDefinition,
} from '../../../core/properties';
import {
  sizeRadioOptions,
  inputVariantOptions,
  statusRadioOptions,
} from '../../../core/handlers';

// === Property Definitions ===

const labelProperty = inputText('numberinput_label', 'label', 'Label')
  .placeholder('Enter label')
  .translatable()
  .build();

const placeholderProperty = inputText('numberinput_placeholder', 'placeholder', 'Placeholder')
  .default('Number input')
  .placeholder('Enter placeholder')
  .translatable()
  .build();

const helperTextProperty = inputText('numberinput_helper', 'helper', 'Helper Text')
  .placeholder('Enter helper text')
  .build();

const sizeProperty = inputRadio('numberinput_size', 'size', 'Size', sizeRadioOptions, 'medium').build();
const variantProperty = inputRadio('numberinput_variant', 'variant', 'Variant', inputVariantOptions, 'outlined').build();
const statusProperty = inputRadio('numberinput_status', 'status', 'Status', statusRadioOptions, 'default').build();

const minProperty = number('numberinput_min')
  .label('Min')
  .inputProperty('min')
  .width('180px')
  .default(0)
  .placeholder('0')
  .autoInputHandlers('string')
  .withInputHandler('min')
  .build();

const maxProperty = number('numberinput_max')
  .label('Max')
  .inputProperty('max')
  .width('180px')
  .placeholder('No limit')
  .autoInputHandlers('string')
  .withInputHandler('max')
  .build();

const stepProperty = number('numberinput_step')
  .label('Step')
  .inputProperty('step')
  .width('180px')
  .placeholder('1')
  .autoInputHandlers('string')
  .withInputHandler('step')
  .build();

const disabledProperty = inputBoolean('numberinput_disabled', 'disabled', 'Disabled').build();
const readonlyProperty = inputBoolean('numberinput_readonly', 'readonly', 'Read Only').build();
const requiredProperty = inputBoolean('numberinput_required', 'required', 'Required').build();
const hasFeedbackProperty = inputBoolean('numberinput_hasFeedback', 'hasFeedback', 'Has Feedback').build();

const nameProperty = inputText('numberinput_name', 'name', 'Name')
  .placeholder('field-name')
  .build();

// === Export ===

export const numberInputProperties: PropertyDefinition[] = [
  labelProperty,
  placeholderProperty,
  helperTextProperty,
  sizeProperty,
  variantProperty,
  statusProperty,
  minProperty,
  maxProperty,
  stepProperty,
  disabledProperty,
  readonlyProperty,
  requiredProperty,
  hasFeedbackProperty,
  nameProperty,
];

export const numberInputDefinition: ComponentDefinition = {
  type: 'number_input',
  name: 'Number Input',
  category: 'inputs',
  panel: {
    containerUuid: 'number_input_fields_collapse_container',
    containerName: 'Number Input Fields Container',
    collapseUuid: 'number_input_fields_collapse',
    collapseTitle: 'Number Input Properties',
  },
  properties: numberInputProperties,
  events: ['valueChange', 'focus', 'blur', 'keypress'],
  includeCommonProperties: [
    'component_value_text_block',
    'component_id_text_block',
    'display_block',
    'access_block',
    'component_hash_text_block',
  ],
};

export default numberInputDefinition;
