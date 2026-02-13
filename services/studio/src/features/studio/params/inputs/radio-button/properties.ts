/**
 * @fileoverview RadioButton Component Properties (TypeScript)
 * @module Studio/Params/Inputs/RadioButton/Properties
 *
 * @description
 * TypeScript-based property definitions for the RadioButton component.
 * The studio wrapper uses nr-radio-group internally.
 */

import {
  inputText,
  inputRadio,
  inputBoolean,
  type PropertyDefinition,
  type ComponentDefinition,
} from '../../../core/properties';
import {
  sizeRadioOptions,
} from '../../../core/handlers';

// === Custom Options ===

const radioTypeOptions = [
  { value: 'default', label: 'Default' },
  { value: 'button', label: 'Button' },
];

const directionOptions = [
  { value: 'vertical', label: 'Vertical' },
  { value: 'horizontal', label: 'Horizontal' },
];

const positionOptions = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
];

// === Property Definitions ===

const defaultValueProperty = inputText('radiobutton_currentValue', 'currentValue', 'Default Value')
  .placeholder('Default selected value')
  .build();

const helperProperty = inputText('radiobutton_helper', 'helper', 'Helper Text')
  .placeholder('Enter helper text')
  .build();

const nameProperty = inputText('radiobutton_name', 'name', 'Name')
  .default('radioGroup')
  .placeholder('Radio group name')
  .build();

const typeProperty = inputRadio('radiobutton_type', 'type', 'Type', radioTypeOptions, 'default').build();
const sizeProperty = inputRadio('radiobutton_size', 'size', 'Size', sizeRadioOptions, 'medium').build();
const directionProperty = inputRadio('radiobutton_direction', 'direction', 'Direction', directionOptions, 'vertical').build();
const positionProperty = inputRadio('radiobutton_position', 'position', 'Position', positionOptions, 'left').build();

const disabledProperty = inputBoolean('radiobutton_disabled', 'disabled', 'Disabled').build();
const requiredProperty = inputBoolean('radiobutton_required', 'required', 'Required').build();
const autoWidthProperty = inputBoolean('radiobutton_autoWidth', 'autoWidth', 'Auto Width').build();

// === Export ===

export const radioButtonProperties: PropertyDefinition[] = [
  defaultValueProperty,
  helperProperty,
  typeProperty,
  sizeProperty,
  directionProperty,
  positionProperty,
  disabledProperty,
  requiredProperty,
  autoWidthProperty,
  nameProperty,
];

export const radioButtonDefinition: ComponentDefinition = {
  type: 'radio_button',
  name: 'Radio Button',
  category: 'inputs',
  panel: {
    containerUuid: 'radiobutton_fields_collapse_container',
    containerName: 'Radio Button Fields Container',
    collapseUuid: 'radiobutton_fields_collapse',
    collapseTitle: 'Radio Button Properties',
  },
  properties: radioButtonProperties,
  events: ['change'],
  includeCommonProperties: [
    'component_value_text_block',
    'component_id_text_block',
    'display_block',
    'access_block',
    'component_hash_text_block',
  ],
};

export default radioButtonDefinition;
