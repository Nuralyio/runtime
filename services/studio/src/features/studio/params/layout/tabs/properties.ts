/**
 * @fileoverview Tabs Component Properties (TypeScript)
 * @module Studio/Params/Layout/Tabs/Properties
 *
 * @description
 * TypeScript-based property definitions for the Tabs component.
 */

import {
  number,
  select,
  inputRadio,
  inputBoolean,
  type PropertyDefinition,
  type ComponentDefinition,
} from '../../../core/properties';
import {
  sizeRadioOptions,
} from '../../../core/handlers';
import {
  InputStateHandler,
} from '../../../core/handlers/state-handlers';
import {
  UpdateInputHandler,
} from '../../../core/handlers/event-handlers';

// === Custom Options ===

const orientationOptions = [
  { value: 'horizontal', label: 'Horizontal' },
  { value: 'vertical', label: 'Vertical' },
];

const alignOptions = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
  { value: 'stretch', label: 'Stretch' },
];

const variantOptions = [
  { value: 'default', label: 'Default' },
  { value: 'card', label: 'Card' },
  { value: 'line', label: 'Line' },
  { value: 'bordered', label: 'Bordered' },
];

// === Property Definitions ===

const activeTabProperty = number('tabs_activeTab')
  .label('Active Tab')
  .inputProperty('activeTab')
  .width('180px')
  .default(0)
  .min(0)
  .placeholder('0')
  .autoInputHandlers('string')
  .withInputHandler('activeTab')
  .build();

const orientationProperty = inputRadio('tabs_orientation', 'orientation', 'Orientation', orientationOptions, 'horizontal').build();
const sizeProperty = inputRadio('tabs_tabSize', 'tabSize', 'Size', sizeRadioOptions, 'medium').build();

const alignProperty = select('tabs_align')
  .label('Align')
  .inputProperty('align')
  .width('180px')
  .default('left')
  .options(alignOptions)
  .stateHandler(new InputStateHandler('align'))
  .onChange(new UpdateInputHandler('align', 'string'))
  .withInputHandler('align')
  .build();

const variantProperty = select('tabs_variant')
  .label('Variant')
  .inputProperty('variant')
  .width('180px')
  .default('default')
  .options(variantOptions)
  .stateHandler(new InputStateHandler('variant'))
  .onChange(new UpdateInputHandler('variant', 'string'))
  .withInputHandler('variant')
  .build();

const animatedProperty = inputBoolean('tabs_animated', 'animated', 'Animated')
  .default(true)
  .build();

const destroyInactiveProperty = inputBoolean('tabs_destroyInactiveTabPane', 'destroyInactiveTabPane', 'Destroy Inactive').build();

// === Export ===

export const tabsProperties: PropertyDefinition[] = [
  activeTabProperty,
  orientationProperty,
  alignProperty,
  sizeProperty,
  variantProperty,
  animatedProperty,
  destroyInactiveProperty,
];

export const tabsDefinition: ComponentDefinition = {
  type: 'tabs',
  name: 'Tabs',
  category: 'layout',
  panel: {
    containerUuid: 'tabs_fields_collapse_container',
    containerName: 'Tabs Fields Container',
    collapseUuid: 'tabs_fields_collapse',
    collapseTitle: 'Tabs Properties',
  },
  properties: tabsProperties,
  events: ['change', 'click'],
  includeCommonProperties: [
    'component_id_text_block',
    'display_block',
    'access_block',
    'component_hash_text_block',
  ],
};

export default tabsDefinition;
