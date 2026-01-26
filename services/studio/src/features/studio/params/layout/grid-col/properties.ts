/**
 * @fileoverview Grid Column Component Properties (TypeScript)
 * @module Studio/Params/Layout/GridCol/Properties
 *
 * @description
 * TypeScript-based property definitions for the Grid Column component.
 * Migrated from config.json to fully typed definitions.
 */

import {
  text,
  number,
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

// === Property Definitions ===

const spanProperty = number('span')
  .label('Span (1-24)')
  .inputProperty('span')
  .width('153px')
  .default(24 as any)
  .min(1)
  .max(24)
  .valueHandler(new ComponentInputHandler('span', 24))
  .stateHandler(new InputStateHandler('span'))
  .onChange(new UpdateInputHandler('span', 'value'))
  .build();

const offsetProperty = number('offset')
  .label('Offset (0-23)')
  .inputProperty('offset')
  .width('153px')
  .default(0 as any)
  .min(0)
  .max(23)
  .valueHandler(new ComponentInputHandler('offset', 0))
  .stateHandler(new InputStateHandler('offset'))
  .onChange(new UpdateInputHandler('offset', 'value'))
  .build();

const orderProperty = number('order')
  .label('Order')
  .inputProperty('order')
  .width('153px')
  .valueHandler(new ComponentInputHandler('order', ''))
  .stateHandler(new InputStateHandler('order'))
  .onChange(new UpdateInputHandler('order', 'value'))
  .build();

const pullProperty = number('pull')
  .label('Pull')
  .inputProperty('pull')
  .width('100px')
  .default(0 as any)
  .min(0)
  .max(24)
  .valueHandler(new ComponentInputHandler('pull', 0))
  .stateHandler(new InputStateHandler('pull'))
  .onChange(new UpdateInputHandler('pull', 'value'))
  .build();

const pushProperty = number('push')
  .label('Push')
  .inputProperty('push')
  .width('100px')
  .default(0 as any)
  .min(0)
  .max(24)
  .valueHandler(new ComponentInputHandler('push', 0))
  .stateHandler(new InputStateHandler('push'))
  .onChange(new UpdateInputHandler('push', 'value'))
  .build();

const flexProperty = text('flex')
  .label('Flex')
  .inputProperty('flex')
  .width('153px')
  .placeholder('auto, 1, 100px...')
  .valueHandler(new ComponentInputHandler('flex', ''))
  .stateHandler(new InputStateHandler('flex'))
  .onChange(new UpdateInputHandler('flex', 'value'))
  .build();

// === Export ===

export const gridColProperties: PropertyDefinition[] = [
  spanProperty,
  offsetProperty,
  orderProperty,
  pullProperty,
  pushProperty,
  flexProperty,
];

export const gridColDefinition: ComponentDefinition = {
  type: 'grid-col',
  name: 'Grid Column',
  category: 'layout',
  panel: {
    containerUuid: 'grid_col_collapse_container',
    containerName: 'Grid Col Fields Container',
    collapseUuid: 'grid_col_collapse',
    collapseTitle: 'Grid Column Properties',
  },
  properties: gridColProperties,
  events: [],
  includeCommonProperties: [
    'component_value_text_block',
    'component_id_text_block',
    'display_block',
    'access_block',
    'component_hash_text_block',
  ],
};

export default gridColDefinition;
