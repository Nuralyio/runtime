/**
 * @fileoverview Form Component Properties (TypeScript)
 * @module Studio/Params/Inputs/Form/Properties
 *
 * @description
 * TypeScript-based property definitions for the Form component.
 * Migrated from config.json to fully typed definitions.
 */

import {
  radio,
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

const methodOptions = [
  { value: 'POST', label: 'POST' },
  { value: 'GET', label: 'GET' },
];

// === Property Definitions ===

const validateOnChangeProperty = inputBoolean('form_validateOnChange', 'validateOnChange', 'Validate On Change').build();

const validateOnBlurProperty = inputBoolean('form_validateOnBlur', 'validateOnBlur', 'Validate On Blur')
  .default(true)
  .build();

const preventInvalidSubmissionProperty = inputBoolean('form_preventInvalidSubmission', 'preventInvalidSubmission', 'Prevent Invalid Submission')
  .default(true)
  .build();

const resetOnSuccessProperty = inputBoolean('form_resetOnSuccess', 'resetOnSuccess', 'Reset On Success').build();

const disabledProperty = inputBoolean('form_disabled', 'disabled', 'Disabled').build();

const actionProperty = inputText('form_action', 'action', 'Action URL')
  .placeholder('https://example.com/submit')
  .build();

const methodProperty = radio('form_method')
  .label('Method')
  .inputProperty('method')
  .width('180px')
  .default('POST')
  .options(methodOptions)
  .valueHandler(new ComponentInputHandler('method', 'POST'))
  .stateHandler(new InputStateHandler('method'))
  .onChange(new UpdateInputHandler('method', 'string'))
  .withInputHandler('method')
  .build();

// === Export ===

export const formProperties: PropertyDefinition[] = [
  validateOnChangeProperty,
  validateOnBlurProperty,
  preventInvalidSubmissionProperty,
  resetOnSuccessProperty,
  disabledProperty,
  actionProperty,
  methodProperty,
];

export const formDefinition: ComponentDefinition = {
  type: 'form',
  name: 'Form',
  category: 'inputs',
  panel: {
    containerUuid: 'form_fields_collapse_container',
    containerName: 'Form Fields Container',
    collapseUuid: 'form_fields_collapse',
    collapseTitle: 'Form Settings',
  },
  properties: formProperties,
  events: ['submit', 'reset', 'validate', 'fieldChange'],
  includeCommonProperties: [
    'component_value_text_block',
    'component_id_text_block',
    'display_block',
    'access_block',
    'component_hash_text_block',
  ],
};

export default formDefinition;
