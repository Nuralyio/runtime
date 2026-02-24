/**
 * @fileoverview Button Component Properties (TypeScript)
 * @module Studio/Params/Navigation/Button/Properties
 *
 * @description
 * TypeScript-based property definitions for the Button component.
 * Migrated from config.json to fully typed definitions.
 */

import {
  text,
  radio,
  select,
  icon,
  inputText,
  inputBoolean,
  type PropertyDefinition,
  type ComponentDefinition,
} from '../../../core/properties';
import {
  ComponentInputHandler,
  ComponentInputSelectHandler,
  createDisabledAwareRadioHandler,
  sizeRadioOptions,
  buttonShapeOptions,
  iconPositionOptions,
} from '../../../core/handlers';
import {
  InputStateHandler,
} from '../../../core/handlers/state-handlers';
import {
  UpdateInputHandler,
} from '../../../core/handlers/event-handlers';

// === Custom Options ===

const buttonTypeOptions = [
  { value: 'default', label: 'Default' },
  { value: 'primary', label: 'Primary' },
  { value: 'secondary', label: 'Secondary' },
  { value: 'tertiary', label: 'Tertiary' },
  { value: 'danger', label: 'Danger' },
  { value: 'ghost', label: 'Ghost' },
  { value: 'text', label: 'Text' },
  { value: 'link', label: 'Link' },
];

const linkTargetOptions = [
  { label: 'Same Tab (_self)', value: '_self' },
  { label: 'New Tab (_blank)', value: '_blank' },
  { label: 'Parent Frame (_parent)', value: '_parent' },
  { label: 'Top Frame (_top)', value: '_top' },
];

const htmlTypeOptions = [
  { label: 'Button', value: 'button' },
  { label: 'Submit', value: 'submit' },
  { label: 'Reset', value: 'reset' },
];

// === Property Definitions ===

const labelProperty = inputText('button_label', 'label', 'Label')
  .default('Button')
  .placeholder('Button text')
  .translatable()
  .build();

const typeProperty = radio('button_type')
  .label('Type')
  .inputProperty('type')
  .width('180px')
  .default('default')
  .valueHandler(createDisabledAwareRadioHandler('type', buttonTypeOptions, 'default', 'default'))
  .on('changed', new UpdateInputHandler('type', 'string'))
  .withInputHandler('type')
  .build();

const sizeProperty = radio('button_size')
  .label('Size')
  .inputProperty('size')
  .width('180px')
  .default('medium')
  .valueHandler(createDisabledAwareRadioHandler('size', sizeRadioOptions, 'medium', 'default'))
  .withInputHandler('size')
  .build();

const shapeProperty = radio('button_shape')
  .label('Shape')
  .inputProperty('shape')
  .width('180px')
  .default('default')
  .valueHandler(createDisabledAwareRadioHandler('shape', buttonShapeOptions, 'default', 'default'))
  .on('changed', new UpdateInputHandler('shape', 'string'))
  .withInputHandler('shape')
  .build();

const disabledProperty = inputBoolean('button_disabled', 'disabled', 'Disabled').build();
const loadingProperty = inputBoolean('button_loading', 'loading', 'Loading').build();
const blockProperty = inputBoolean('button_block', 'block', 'Full Width').build();
const dashedProperty = inputBoolean('button_dashed', 'dashed', 'Dashed Border').build();

const rippleProperty = inputBoolean('button_ripple', 'ripple', 'Ripple Effect')
  .default(true)
  .build();

const iconProperty = icon('button_icon')
  .label('Icon')
  .inputProperty('icon')
  .width('180px')
  .placeholder('Choose an icon')
  .valueHandler(new ComponentInputHandler('icon', ''))
  .stateHandler(new InputStateHandler('icon'))
  .on('iconChanged', new UpdateInputHandler('icon', 'string'))
  .withInputHandler('icon')
  .build();

const iconLeftProperty = icon('button_iconLeft')
  .label('Icon Left')
  .inputProperty('iconLeft')
  .width('180px')
  .placeholder('Choose left icon')
  .valueHandler(new ComponentInputHandler('iconLeft', ''))
  .stateHandler(new InputStateHandler('iconLeft'))
  .on('iconChanged', new UpdateInputHandler('iconLeft', 'string'))
  .withInputHandler('iconLeft')
  .build();

const iconRightProperty = icon('button_iconRight')
  .label('Icon Right')
  .inputProperty('iconRight')
  .width('180px')
  .placeholder('Choose right icon')
  .valueHandler(new ComponentInputHandler('iconRight', ''))
  .stateHandler(new InputStateHandler('iconRight'))
  .on('iconChanged', new UpdateInputHandler('iconRight', 'string'))
  .withInputHandler('iconRight')
  .build();

const iconPositionProperty = radio('button_iconPosition')
  .label('Icon Position')
  .inputProperty('iconPosition')
  .width('180px')
  .default('left')
  .valueHandler(createDisabledAwareRadioHandler('iconPosition', iconPositionOptions, 'left', 'default'))
  .on('changed', new UpdateInputHandler('iconPosition', 'string'))
  .withInputHandler('iconPosition')
  .build();

const hrefProperty = inputText('button_href', 'href', 'Link URL')
  .placeholder('https://example.com')
  .build();

const targetProperty = select('button_target')
  .label('Link Target')
  .inputProperty('target')
  .width('180px')
  .default('_self')
  .options(linkTargetOptions)
  .valueHandler(new ComponentInputSelectHandler('target', '_self'))
  .stateHandler(new InputStateHandler('target'))
  .on('changed', new UpdateInputHandler('target', 'string'))
  .withInputHandler('target')
  .build();

const htmlTypeProperty = select('button_htmlType')
  .label('HTML Type')
  .inputProperty('htmlType')
  .width('180px')
  .default('button')
  .options(htmlTypeOptions)
  .valueHandler(new ComponentInputSelectHandler('htmlType', 'button'))
  .stateHandler(new InputStateHandler('htmlType'))
  .on('changed', new UpdateInputHandler('htmlType', 'string'))
  .withInputHandler('htmlType')
  .build();

const ariaLabelProperty = inputText('button_buttonAriaLabel', 'buttonAriaLabel', 'Aria Label')
  .placeholder('Custom aria-label')
  .build();

const ariaDescribedByProperty = inputText('button_ariaDescribedBy', 'ariaDescribedBy', 'Aria Described By')
  .placeholder('Element IDs')
  .build();

// === Export ===

export const buttonProperties: PropertyDefinition[] = [
  labelProperty,
  typeProperty,
  sizeProperty,
  shapeProperty,
  disabledProperty,
  loadingProperty,
  blockProperty,
  dashedProperty,
  rippleProperty,
  iconProperty,
  iconLeftProperty,
  iconRightProperty,
  iconPositionProperty,
  hrefProperty,
  targetProperty,
  htmlTypeProperty,
  ariaLabelProperty,
  ariaDescribedByProperty,
];

export const buttonDefinition: ComponentDefinition = {
  type: 'button',
  name: 'Button',
  category: 'navigation',
  panel: {
    containerUuid: 'button_collapse_container',
    containerName: 'Button Fields Container',
    collapseUuid: 'button_collapse',
    collapseTitle: 'Button Properties',
  },
  properties: buttonProperties,
  events: ['click', 'focus', 'blur', 'mouseenter', 'mouseleave'],
  includeCommonProperties: [
    'component_value_text_block',
    'component_id_text_block',
    'display_block',
    'access_block',
    'component_hash_text_block',
  ],
};

export default buttonDefinition;
