/**
 * @fileoverview ColorPicker Component Properties (TypeScript)
 * @module Studio/Params/Inputs/ColorPicker/Properties
 *
 * @description
 * TypeScript-based property definitions for the ColorPicker component.
 */

import {
  text,
  color,
  radio,
  select,
  inputText,
  inputBoolean,
  type PropertyDefinition,
  type ComponentDefinition,
} from '../../../core/properties';
import {
  ComponentInputHandler,
  createDisabledAwareRadioHandler,
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
  { value: 'default', label: 'Default' },
  { value: 'large', label: 'Large' },
];

const triggerOptions = [
  { value: 'click', label: 'Click' },
  { value: 'hover', label: 'Hover' },
  { value: 'manual', label: 'Manual' },
];

const placementOptions = [
  { value: 'auto', label: 'Auto' },
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
];

const animationOptions = [
  { value: 'fade', label: 'Fade' },
  { value: 'slide', label: 'Slide' },
  { value: 'scale', label: 'Scale' },
  { value: 'none', label: 'None' },
];

const formatOptions = [
  { value: 'hex', label: 'Hex' },
  { value: 'rgb', label: 'RGB' },
  { value: 'rgba', label: 'RGBA' },
  { value: 'hsl', label: 'HSL' },
  { value: 'hsla', label: 'HSLA' },
];

// === Property Definitions ===

const colorProperty = color('colorpicker_color')
  .label('Color')
  .inputProperty('color')
  .width('180px')
  .default('#3498db')
  .placeholder('Pick a color')
  .valueHandler(new ComponentInputHandler('color', '#3498db'))
  .stateHandler(new InputStateHandler('color'))
  .onChange(new UpdateInputHandler('color', 'string'))
  .withInputHandler('color')
  .build();

const labelProperty = inputText('colorpicker_label', 'label', 'Label')
  .default('')
  .placeholder('Label text')
  .translatable()
  .build();

const helperTextProperty = inputText('colorpicker_helperText', 'helperText', 'Helper Text')
  .default('')
  .placeholder('Helper text')
  .translatable()
  .build();

const sizeProperty = radio('colorpicker_size')
  .label('Size')
  .inputProperty('size')
  .width('180px')
  .default('default')
  .valueHandler(createDisabledAwareRadioHandler('size', sizeOptions, 'default', 'default'))
  .on('changed', new UpdateInputHandler('size', 'string'))
  .withInputHandler('size')
  .build();

const formatProperty = select('colorpicker_format')
  .label('Format')
  .inputProperty('format')
  .width('180px')
  .default('hex')
  .options(formatOptions)
  .stateHandler(new InputStateHandler('format'))
  .onChange(new UpdateInputHandler('format', 'string'))
  .withInputHandler('format')
  .build();

const triggerProperty = radio('colorpicker_trigger')
  .label('Trigger')
  .inputProperty('trigger')
  .width('180px')
  .default('click')
  .valueHandler(createDisabledAwareRadioHandler('trigger', triggerOptions, 'click', 'default'))
  .on('changed', new UpdateInputHandler('trigger', 'string'))
  .withInputHandler('trigger')
  .build();

const placementProperty = radio('colorpicker_placement')
  .label('Placement')
  .inputProperty('placement')
  .width('180px')
  .default('auto')
  .valueHandler(createDisabledAwareRadioHandler('placement', placementOptions, 'auto', 'default'))
  .on('changed', new UpdateInputHandler('placement', 'string'))
  .withInputHandler('placement')
  .build();

const animationProperty = select('colorpicker_animation')
  .label('Animation')
  .inputProperty('animation')
  .width('180px')
  .default('fade')
  .options(animationOptions)
  .stateHandler(new InputStateHandler('animation'))
  .onChange(new UpdateInputHandler('animation', 'string'))
  .withInputHandler('animation')
  .build();

const disabledProperty = inputBoolean('colorpicker_disabled', 'disabled', 'Disabled').build();

const showInputProperty = inputBoolean('colorpicker_showInput', 'showInput', 'Show Input')
  .default(true)
  .build();

const showCopyButtonProperty = inputBoolean('colorpicker_showCopyButton', 'showCopyButton', 'Show Copy Button')
  .default(true)
  .build();

const closeOnSelectProperty = inputBoolean('colorpicker_closeOnSelect', 'closeOnSelect', 'Close on Select').build();

const closeOnOutsideClickProperty = inputBoolean('colorpicker_closeOnOutsideClick', 'closeOnOutsideClick', 'Close on Outside Click')
  .default(true)
  .build();

const closeOnEscapeProperty = inputBoolean('colorpicker_closeOnEscape', 'closeOnEscape', 'Close on Escape')
  .default(true)
  .build();

const inputPlaceholderProperty = inputText('colorpicker_inputPlaceholder', 'inputPlaceholder', 'Input Placeholder')
  .default('Enter color')
  .placeholder('Placeholder text')
  .build();

// === Export ===

export const colorpickerProperties: PropertyDefinition[] = [
  colorProperty,
  labelProperty,
  helperTextProperty,
  formatProperty,
  sizeProperty,
  triggerProperty,
  placementProperty,
  animationProperty,
  disabledProperty,
  showInputProperty,
  showCopyButtonProperty,
  closeOnSelectProperty,
  closeOnOutsideClickProperty,
  closeOnEscapeProperty,
  inputPlaceholderProperty,
];

export const colorpickerDefinition: ComponentDefinition = {
  type: 'color_picker',
  name: 'ColorPicker',
  category: 'inputs',
  panel: {
    containerUuid: 'colorpicker_fields_collapse_container',
    containerName: 'ColorPicker Fields Container',
    collapseUuid: 'colorpicker_fields_collapse',
    collapseTitle: 'ColorPicker Properties',
  },
  properties: colorpickerProperties,
  events: ['change', 'open', 'close'],
  includeCommonProperties: [
    'component_value_text_block',
    'component_id_text_block',
    'display_block',
    'access_block',
    'component_hash_text_block',
  ],
};

export default colorpickerDefinition;
