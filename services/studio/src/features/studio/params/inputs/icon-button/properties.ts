/**
 * @fileoverview IconButton Component Properties (TypeScript)
 * @module Studio/Params/Inputs/IconButton/Properties
 *
 * @description
 * TypeScript-based property definitions for the IconButton component.
 * IconButton is a studio wrapper around nr-button focused on icon-driven actions.
 */

import {
  icon,
  inputText,
  inputRadio,
  inputBoolean,
  type PropertyDefinition,
  type ComponentDefinition,
} from '../../../core/properties';
import {
  ComponentInputHandler,
  sizeRadioOptions,
  buttonTypeOptions,
  iconPositionOptions,
} from '../../../core/handlers';
import {
  InputStateHandler,
} from '../../../core/handlers/state-handlers';
import {
  UpdateInputHandler,
} from '../../../core/handlers/event-handlers';

// === Property Definitions ===

const iconProperty = icon('iconbutton_icon')
  .label('Icon')
  .inputProperty('icon')
  .width('180px')
  .placeholder('Choose an icon')
  .valueHandler(new ComponentInputHandler('icon', ''))
  .stateHandler(new InputStateHandler('icon'))
  .on('iconChanged', new UpdateInputHandler('icon', 'string'))
  .withInputHandler('icon')
  .build();

const titleProperty = inputText('iconbutton_title', 'title', 'Title')
  .default('')
  .placeholder('Button title/tooltip')
  .translatable()
  .build();

const typeProperty = inputRadio('iconbutton_type', 'color', 'Type', buttonTypeOptions, 'default').build();
const sizeProperty = inputRadio('iconbutton_size', 'size', 'Size', sizeRadioOptions, 'small').build();
const iconPositionProperty = inputRadio('iconbutton_iconPosition', 'iconPosition', 'Icon Position', iconPositionOptions, 'left').build();

const disabledProperty = inputBoolean('iconbutton_disabled', 'disabled', 'Disabled').build();
const loadingProperty = inputBoolean('iconbutton_loading', 'loading', 'Loading').build();
const blockProperty = inputBoolean('iconbutton_block', 'block', 'Full Width').build();
const dashedProperty = inputBoolean('iconbutton_dashed', 'dashed', 'Dashed Border').build();

// === Export ===

export const iconButtonProperties: PropertyDefinition[] = [
  iconProperty,
  titleProperty,
  typeProperty,
  sizeProperty,
  iconPositionProperty,
  disabledProperty,
  loadingProperty,
  blockProperty,
  dashedProperty,
];

export const iconButtonDefinition: ComponentDefinition = {
  type: 'icon_button',
  name: 'Icon Button',
  category: 'inputs',
  panel: {
    containerUuid: 'iconbutton_fields_collapse_container',
    containerName: 'Icon Button Fields Container',
    collapseUuid: 'iconbutton_fields_collapse',
    collapseTitle: 'Icon Button Properties',
  },
  properties: iconButtonProperties,
  events: ['click'],
  includeCommonProperties: [
    'component_value_text_block',
    'component_id_text_block',
    'display_block',
    'access_block',
    'component_hash_text_block',
  ],
};

export default iconButtonDefinition;
