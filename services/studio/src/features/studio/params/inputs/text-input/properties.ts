/**
 * @fileoverview TextInput Component Properties (TypeScript)
 * @module Studio/Params/Inputs/TextInput/Properties
 *
 * @description
 * TypeScript-based property definitions for the TextInput component.
 * This replaces the JSON config.json with fully typed, IDE-supported definitions.
 *
 * Migration from: config.json (363 lines)
 * Migration to: properties.ts (~200 lines, fully typed)
 */

import {
  text,
  number,
  boolean,
  radio,
  inputText,
  inputBoolean,
  type PropertyDefinition,
  type ComponentDefinition,
} from '../../../core/properties';
import {
  ComponentInputHandler,
  ComponentInputRadioHandler,
  HandlerValueGetter,
  ComputedValueHandler,
} from '../../../core/handlers/value-handlers';
import {
  InputStateHandler,
} from '../../../core/handlers/state-handlers';
import {
  UpdateInputHandler,
  UpdateInputAsHandlerHandler,
  CustomEventHandler,
} from '../../../core/handlers/event-handlers';
import type { HandlerContext, RadioOption } from '../../../core/handlers/types';

// === Custom Handlers for Complex Properties ===

/**
 * Custom value handler for the Type radio property.
 * Returns options with dynamic disabled state based on handler presence.
 */
class TypeRadioValueHandler extends ComputedValueHandler<[RadioOption[], string, string]> {
  constructor() {
    super((ctx: HandlerContext) => {
      const selectedComponent = ctx.Utils.first(ctx.$selectedComponents);
      let currentType = '';
      let isDisabled = false;

      const typeInput = selectedComponent?.input?.type as { type?: string; value?: string } | undefined;
      if (typeInput?.type === 'handler' && typeInput?.value) {
        isDisabled = true;
      } else {
        currentType = typeInput?.value || 'text';
      }

      const options: RadioOption[] = [
        { value: 'text', icon: 'font', disabled: isDisabled },
        { value: 'password', icon: 'lock', disabled: isDisabled },
        { value: 'email', icon: 'envelope', disabled: isDisabled },
        { value: 'number', icon: 'hashtag', disabled: isDisabled },
      ];

      return [options, currentType, 'button'];
    });
  }
}

/**
 * Custom value handler for the Status radio property.
 * Returns options with dynamic disabled state based on handler presence.
 */
class StatusRadioValueHandler extends ComputedValueHandler<[RadioOption[], string, string]> {
  constructor() {
    super((ctx: HandlerContext) => {
      const selectedComponent = ctx.Utils.first(ctx.$selectedComponents);
      let currentStatus = '';
      let isDisabled = false;

      const statusInput = selectedComponent?.input?.status as { type?: string; value?: string } | undefined;
      if (statusInput?.type === 'handler' && statusInput?.value !== '') {
        isDisabled = true;
      } else {
        currentStatus = statusInput?.value || 'default';
      }

      const options: RadioOption[] = [
        { value: 'default', icon: 'font-awesome', disabled: isDisabled },
        { value: 'warning', icon: 'triangle-exclamation', disabled: isDisabled },
        { value: 'error', icon: 'circle-exclamation', disabled: isDisabled },
      ];

      return [options, currentStatus, 'button'];
    });
  }
}

// === Property Definitions ===

/**
 * Label property - text input with translation support.
 */
const labelProperty = inputText('textinput_label', 'label', 'Label')
  .placeholder('Enter label')
  .translatable()
  .build();

/**
 * Placeholder property - text input with translation support.
 */
const placeholderProperty = inputText('textinput_placeholder', 'placeholder', 'Placeholder')
  .placeholder('Enter placeholder')
  .translatable()
  .build();

/**
 * Helper text property.
 */
const helperTextProperty = inputText('textinput_helperText', 'helper', 'Helper Text')
  .placeholder('Enter helper text')
  .build();

/**
 * Type property - radio with icons for text/password/email/number.
 */
const typeProperty = radio('textinput_type')
  .label('Type')
  .inputProperty('type')
  .width('180px')
  .default('text')
  .valueHandler(new TypeRadioValueHandler())
  .on('changed', new UpdateInputHandler('type', 'string'))
  .withInputHandler('type')
  .build();

/**
 * Size property - radio for small/medium/large.
 */
const sizeProperty = radio('textinput_size')
  .label('Size')
  .inputProperty('size')
  .width('180px')
  .default('medium')
  .autoRadioHandlers([
    { label: 'Small', value: 'small' },
    { label: 'Medium', value: 'medium' },
    { label: 'Large', value: 'large' },
  ], 'medium')
  .withInputHandler('size')
  .build();

/**
 * Variant property - radio for outlined/filled/underlined/borderless.
 */
const variantProperty = radio('textinput_variant')
  .label('Variant')
  .inputProperty('variant')
  .width('180px')
  .default('outlined')
  .autoRadioHandlers([
    { label: 'Outlined', value: 'outlined' },
    { label: 'Filled', value: 'filled' },
    { label: 'Underlined', value: 'underlined' },
    { label: 'Borderless', value: 'borderless' },
  ], 'outlined')
  .withInputHandler('variant')
  .build();

/**
 * Status property - radio with icons for default/warning/error.
 */
const statusProperty = radio('textinput_status')
  .label('Status')
  .inputProperty('status')
  .width('180px')
  .default('default')
  .valueHandler(new StatusRadioValueHandler())
  .on('changed', new CustomEventHandler((ctx) => {
    const selectedComponent = ctx.Utils.first(ctx.$selectedComponents);
    if (!selectedComponent) return;
    const statusValue = ctx.EventData.value || 'default';
    ctx.updateInput(selectedComponent, 'status', 'string', statusValue);
  }))
  .withInputHandler('status')
  .handlerValueGetter(new HandlerValueGetter('status', 'input'))
  .handlerEventUpdate(new UpdateInputAsHandlerHandler('status'))
  .build();

/**
 * Read Only property - boolean toggle.
 */
const readonlyProperty = inputBoolean('textinput_readonly', 'readonly', 'Read Only')
  .build();

/**
 * Required property - boolean toggle.
 */
const requiredProperty = inputBoolean('textinput_required', 'required', 'Required')
  .build();

/**
 * Allow Clear property - boolean toggle.
 */
const allowClearProperty = inputBoolean('textinput_allowClear', 'allowClear', 'Allow Clear')
  .build();

/**
 * With Copy property - boolean toggle.
 */
const withCopyProperty = inputBoolean('textinput_withCopy', 'withCopy', 'With Copy')
  .build();

/**
 * Show Count property - boolean toggle.
 */
const showCountProperty = inputBoolean('textinput_showCount', 'showCount', 'Show Count')
  .build();

/**
 * Has Feedback property - boolean toggle.
 */
const hasFeedbackProperty = inputBoolean('textinput_hasFeedback', 'hasFeedback', 'Has Feedback')
  .build();

/**
 * Step property - number input for number type.
 */
const stepProperty = number('textinput_step')
  .label('Step (Number)')
  .inputProperty('step')
  .width('180px')
  .placeholder('1')
  .autoInputHandlers('string') // Step is stored as string
  .withInputHandler('step')
  .build();

/**
 * Name property - form field name.
 */
const nameProperty = inputText('textinput_name', 'name', 'Name')
  .placeholder('field-name')
  .build();

/**
 * Autocomplete property - HTML autocomplete attribute.
 */
const autocompleteProperty = text('textinput_autocomplete')
  .label('Autocomplete')
  .inputProperty('autocomplete')
  .width('180px')
  .default('off')
  .placeholder('off')
  .autoInputHandlers('string')
  .withInputHandler('autocomplete')
  .build();

// === Export Property Array ===

/**
 * All TextInput properties in display order.
 */
export const textInputProperties: PropertyDefinition[] = [
  labelProperty,
  placeholderProperty,
  helperTextProperty,
  typeProperty,
  sizeProperty,
  variantProperty,
  statusProperty,
  readonlyProperty,
  requiredProperty,
  allowClearProperty,
  withCopyProperty,
  showCountProperty,
  hasFeedbackProperty,
  stepProperty,
  nameProperty,
  autocompleteProperty,
];

// === Export Component Definition ===

/**
 * Complete TextInput component definition.
 */
export const textInputDefinition: ComponentDefinition = {
  type: 'text_input',
  name: 'TextInput',
  category: 'inputs',
  panel: {
    containerUuid: 'text_input_fields_collapse_container',
    containerName: 'Text Input Fields Container',
    collapseUuid: 'text_input_fields_collapse',
    collapseTitle: 'Input Fields',
  },
  properties: textInputProperties,
  events: ['valueChange', 'focus', 'blur', 'keypress', 'keydown', 'keyup'],
  themeVariables: [
    '--input-bg',
    '--input-border',
    '--input-text',
    '--input-placeholder',
    '--input-focus-border',
  ],
  includeCommonProperties: [
    'component_value_text_block',
    'component_id_text_block',
    'display_block',
    'access_block',
    'component_hash_text_block',
  ],
};

// === Default Export ===

export default textInputDefinition;
