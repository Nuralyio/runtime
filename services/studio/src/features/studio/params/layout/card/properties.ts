/**
 * @fileoverview Card Component Properties (TypeScript)
 * @module Studio/Params/Layout/Card/Properties
 *
 * @description
 * TypeScript-based property definitions for the Card component.
 * Migrated from card-config.json to fully typed definitions.
 */

import {
  text,
  radio,
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

const cardSizeOptions = [
  { value: 'small', label: 'S' },
  { value: 'default', label: 'M' },
];

const borderedOptions = [
  { value: false, icon: 'toggle-off' },
  { value: true, icon: 'toggle-on' },
];

// === Property Definitions ===

const titleProperty = text('card_title')
  .label('Title')
  .inputProperty('title')
  .width('180px')
  .default('')
  .placeholder('Card title')
  .valueHandler(new ComponentInputHandler('title', ''))
  .stateHandler(new InputStateHandler('title'))
  .onChange(new UpdateInputHandler('title', 'string'))
  .build();

const sizeProperty = radio('card_size')
  .label('Size')
  .inputProperty('size')
  .width('180px')
  .default('default')
  .options(cardSizeOptions)
  .stateHandler(new InputStateHandler('size'))
  .onChange(new UpdateInputHandler('size', 'string'))
  .withInputHandler('size')
  .build();

const borderedProperty = radio('card_bordered')
  .label('Bordered')
  .inputProperty('bordered')
  .width('180px')
  .default(true as any)
  .options(borderedOptions)
  .stateHandler(new InputStateHandler('bordered'))
  .onChange(new UpdateInputHandler('bordered', 'boolean'))
  .withInputHandler('bordered')
  .build();

const hoverableProperty = inputBoolean('card_hoverable', 'hoverable', 'Hoverable').build();

const loadingProperty = inputBoolean('card_loading', 'loading', 'Loading').build();

// === Export ===

export const cardProperties: PropertyDefinition[] = [
  titleProperty,
  sizeProperty,
  borderedProperty,
  hoverableProperty,
  loadingProperty,
];

export const cardDefinition: ComponentDefinition = {
  type: 'card',
  name: 'Card',
  category: 'layout',
  panel: {
    containerUuid: 'card_fields_collapse_container',
    containerName: 'Card Fields Container',
    collapseUuid: 'card_fields_collapse',
    collapseTitle: 'Card Properties',
  },
  properties: cardProperties,
  events: ['click'],
  includeCommonProperties: [
    'component_value_text_block',
    'component_id_text_block',
    'display_block',
    'access_block',
    'component_hash_text_block',
  ],
};

export default cardDefinition;
