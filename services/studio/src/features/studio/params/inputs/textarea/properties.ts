/**
 * @fileoverview Textarea Component Properties (TypeScript)
 * @module Studio/Params/Inputs/Textarea/Properties
 *
 * @description
 * TypeScript-based property definitions for the Textarea component.
 * Migrated from config.json to fully typed definitions.
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
  createDisabledAwareRadioHandler,
  createIconRadioHandler,
  sizeRadioOptions,
  textareaVariantOptions,
  stateRadioOptions,
  resizeRadioOptions,
  HandlerValueGetter,
} from '../../../core/handlers';
import {
  UpdateInputHandler,
  UpdateInputAsHandlerHandler,
  CustomEventHandler,
} from '../../../core/handlers/event-handlers';

// === Property Definitions ===

const labelProperty = inputText('textarea_label', 'label', 'Label')
  .placeholder('Enter label')
  .translatable()
  .build();

const placeholderProperty = inputText('textarea_placeholder', 'placeholder', 'Placeholder')
  .placeholder('Enter placeholder')
  .translatable()
  .build();

const helperTextProperty = inputText('textarea_helperText', 'helperText', 'Helper Text')
  .placeholder('Enter helper text')
  .build();

const sizeProperty = radio('textarea_size')
  .label('Size')
  .inputProperty('size')
  .width('180px')
  .default('medium')
  .valueHandler(createDisabledAwareRadioHandler('size', sizeRadioOptions, 'medium', 'default'))
  .on('changed', new UpdateInputHandler('size', 'string'))
  .withInputHandler('size')
  .build();

const variantProperty = radio('textarea_variant')
  .label('Variant')
  .inputProperty('variant')
  .width('180px')
  .default('underlined')
  .valueHandler(createDisabledAwareRadioHandler('variant', textareaVariantOptions, 'underlined', 'default'))
  .on('changed', new UpdateInputHandler('variant', 'string'))
  .withInputHandler('variant')
  .build();

const stateProperty = radio('textarea_state')
  .label('State')
  .inputProperty('state')
  .width('180px')
  .default('default')
  .valueHandler(createIconRadioHandler('state', stateRadioOptions, 'default'))
  .on('changed', new CustomEventHandler((ctx) => {
    const selectedComponent = ctx.Utils.first(ctx.$selectedComponents);
    if (!selectedComponent) return;
    const stateValue = ctx.EventData.value || 'default';
    ctx.updateInput(selectedComponent, 'state', 'string', stateValue);
  }))
  .withInputHandler('state')
  .handlerValueGetter(new HandlerValueGetter('state', 'input'))
  .handlerEventUpdate(new UpdateInputAsHandlerHandler('state'))
  .build();

const resizeProperty = radio('textarea_resize')
  .label('Resize')
  .inputProperty('resize')
  .width('180px')
  .default('vertical')
  .valueHandler(createDisabledAwareRadioHandler('resize', resizeRadioOptions, 'vertical', 'default'))
  .on('changed', new UpdateInputHandler('resize', 'string'))
  .withInputHandler('resize')
  .build();

const rowsProperty = number('textarea_rows')
  .label('Rows')
  .inputProperty('rows')
  .width('180px')
  .default(4 as any)
  .placeholder('4')
  .autoInputHandlers('number')
  .withInputHandler('rows')
  .build();

const colsProperty = number('textarea_cols')
  .label('Cols')
  .inputProperty('cols')
  .width('180px')
  .placeholder('50')
  .autoInputHandlers('number')
  .withInputHandler('cols')
  .build();

const readonlyProperty = inputBoolean('textarea_readonly', 'readonly', 'Read Only').build();
const requiredProperty = inputBoolean('textarea_required', 'required', 'Required').build();
const allowClearProperty = inputBoolean('textarea_allowClear', 'allowClear', 'Allow Clear').build();
const showCountProperty = inputBoolean('textarea_showCount', 'showCount', 'Show Count').build();
const autoResizeProperty = inputBoolean('textarea_autoResize', 'autoResize', 'Auto Resize').build();
const hasFeedbackProperty = inputBoolean('textarea_hasFeedback', 'hasFeedback', 'Has Feedback').build();

const maxLengthProperty = number('textarea_maxLength')
  .label('Max Length')
  .inputProperty('maxLength')
  .width('180px')
  .placeholder('500')
  .autoInputHandlers('number')
  .withInputHandler('maxLength')
  .build();

const minHeightProperty = number('textarea_minHeight')
  .label('Min Height')
  .inputProperty('minHeight')
  .width('180px')
  .placeholder('100')
  .autoInputHandlers('number')
  .withInputHandler('minHeight')
  .build();

const maxHeightProperty = number('textarea_maxHeight')
  .label('Max Height')
  .inputProperty('maxHeight')
  .width('180px')
  .placeholder('400')
  .autoInputHandlers('number')
  .withInputHandler('maxHeight')
  .build();

const nameProperty = inputText('textarea_name', 'name', 'Name')
  .placeholder('field-name')
  .build();

const autocompleteProperty = text('textarea_autocomplete')
  .label('Autocomplete')
  .inputProperty('autocomplete')
  .width('180px')
  .default('off')
  .placeholder('off')
  .autoInputHandlers('string')
  .withInputHandler('autocomplete')
  .build();

// === Export ===

export const textareaProperties: PropertyDefinition[] = [
  labelProperty,
  placeholderProperty,
  helperTextProperty,
  sizeProperty,
  variantProperty,
  stateProperty,
  resizeProperty,
  rowsProperty,
  colsProperty,
  readonlyProperty,
  requiredProperty,
  allowClearProperty,
  showCountProperty,
  autoResizeProperty,
  hasFeedbackProperty,
  maxLengthProperty,
  minHeightProperty,
  maxHeightProperty,
  nameProperty,
  autocompleteProperty,
];

export const textareaDefinition: ComponentDefinition = {
  type: 'textarea',
  name: 'Textarea',
  category: 'inputs',
  panel: {
    containerUuid: 'textarea_fields_collapse_container',
    containerName: 'Textarea Fields Container',
    collapseUuid: 'textarea_fields_collapse',
    collapseTitle: 'Textarea Fields',
  },
  properties: textareaProperties,
  events: ['valueChange', 'focus', 'blur', 'keypress', 'clear'],
  includeCommonProperties: [
    'component_value_text_block',
    'component_id_text_block',
    'display_block',
    'access_block',
    'component_hash_text_block',
  ],
};

export default textareaDefinition;
