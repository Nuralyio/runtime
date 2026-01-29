/**
 * @fileoverview Collection Component Properties (TypeScript)
 * @module Studio/Params/Data/Collection/Properties
 *
 * @description
 * TypeScript-based property definitions for the Collection component.
 * Migrated from config.json to fully typed definitions.
 */

import {
  text,
  number,
  select,
  type PropertyDefinition,
  type ComponentDefinition,
} from '../../../core/properties';
import {
  ComponentInputHandler,
  ComponentStyleHandler,
} from '../../../core/handlers';
import {
  InputStateHandler,
  DefaultStyleStateHandler,
} from '../../../core/handlers/state-handlers';
import {
  UpdateInputHandler,
  UpdateStyleHandler,
} from '../../../core/handlers/event-handlers';

// === Custom Options ===

const directionOptions = [
  { value: 'horizontal', label: 'Horizontal' },
  { value: 'vertical', label: 'Vertical' },
];

// === Property Definitions ===

const columnsProperty = number('collection_columns')
  .label('Columns')
  .inputProperty('columns')
  .width('180px')
  .default(1 as any)
  .placeholder('Number of columns')
  .valueHandler(new ComponentStyleHandler('--columns', '1'))
  .onChange(new UpdateStyleHandler('--columns'))
  .build();

const directionProperty = select('collection_direction')
  .label('Direction')
  .inputProperty('direction')
  .width('180px')
  .default('horizontal')
  .placeholder('Select direction')
  .options(directionOptions)
  .valueHandler(new ComponentInputHandler('direction', 'horizontal'))
  .stateHandler(new InputStateHandler('direction'))
  .onChange(new UpdateInputHandler('direction', 'value'))
  .withInputHandler('direction')
  .build();

const gapProperty = text('collection_gap')
  .label('Gap')
  .inputProperty('gap')
  .width('180px')
  .default('0px')
  .placeholder('e.g. 10px')
  .valueHandler(new ComponentStyleHandler('gap', '0px'))
  .stateHandler(new DefaultStyleStateHandler('gap'))
  .onChange(new UpdateStyleHandler('gap'))
  .withStyleHandler('gap')
  .build();

// === Export ===

export const collectionProperties: PropertyDefinition[] = [
  columnsProperty,
  directionProperty,
  gapProperty,
];

export const collectionDefinition: ComponentDefinition = {
  type: 'collection',
  name: 'Collection',
  category: 'data',
  panel: {
    containerUuid: 'collection_collapse_container',
    containerName: 'Collection Fields Container',
    collapseUuid: 'collection_collapse',
    collapseTitle: 'Collection Properties',
  },
  properties: collectionProperties,
  events: ['itemClick'],
  includeCommonProperties: [
    'component_value_text_block',
    'component_id_text_block',
    'display_block',
    'access_block',
    'component_hash_text_block',
  ],
};

export default collectionDefinition;
