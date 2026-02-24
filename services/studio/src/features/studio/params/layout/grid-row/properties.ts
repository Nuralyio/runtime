/**
 * @fileoverview Grid Row Component Properties (TypeScript)
 * @module Studio/Params/Layout/GridRow/Properties
 *
 * @description
 * TypeScript-based property definitions for the Grid Row component.
 * Migrated from config.json to fully typed definitions.
 */

import {
  number,
  select,
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

const alignOptions = [
  { value: '', label: 'None' },
  { value: 'top', label: 'Top' },
  { value: 'middle', label: 'Middle' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'stretch', label: 'Stretch' },
];

const justifyOptions = [
  { value: '', label: 'None' },
  { value: 'start', label: 'Start' },
  { value: 'end', label: 'End' },
  { value: 'center', label: 'Center' },
  { value: 'space-around', label: 'Space Around' },
  { value: 'space-between', label: 'Space Between' },
  { value: 'space-evenly', label: 'Space Evenly' },
];

// === Property Definitions ===

const gutterProperty = number('gutter')
  .label('Gutter (spacing)')
  .inputProperty('gutter')
  .width('153px')
  .default(0 as any)
  .valueHandler(new ComponentInputHandler('gutter', 0))
  .stateHandler(new InputStateHandler('gutter'))
  .onChange(new UpdateInputHandler('gutter', 'value'))
  .build();

const alignProperty = select('align')
  .label('Vertical Align')
  .inputProperty('align')
  .width('180px')
  .default('')
  .placeholder('Alignment')
  .options(alignOptions)
  .valueHandler(new ComponentInputHandler('align', ''))
  .stateHandler(new InputStateHandler('align'))
  .onChange(new UpdateInputHandler('align', 'value'))
  .build();

const justifyProperty = select('justify')
  .label('Horizontal Align')
  .inputProperty('justify')
  .width('180px')
  .default('')
  .placeholder('Justify')
  .options(justifyOptions)
  .valueHandler(new ComponentInputHandler('justify', ''))
  .stateHandler(new InputStateHandler('justify'))
  .onChange(new UpdateInputHandler('justify', 'value'))
  .build();

const wrapProperty = inputBoolean('wrap', 'wrap', 'Wrap Columns')
  .default(true)
  .build();

// === Export ===

export const gridRowProperties: PropertyDefinition[] = [
  gutterProperty,
  alignProperty,
  justifyProperty,
  wrapProperty,
];

export const gridRowDefinition: ComponentDefinition = {
  type: 'grid-row',
  name: 'Grid Row',
  category: 'layout',
  panel: {
    containerUuid: 'grid_row_collapse_container',
    containerName: 'Grid Row Fields Container',
    collapseUuid: 'grid_row_collapse',
    collapseTitle: 'Grid Row Properties',
  },
  properties: gridRowProperties,
  events: [],
  includeCommonProperties: [
    'component_value_text_block',
    'component_id_text_block',
    'display_block',
    'access_block',
    'component_hash_text_block',
  ],
};

export default gridRowDefinition;
