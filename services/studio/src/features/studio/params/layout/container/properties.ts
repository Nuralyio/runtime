/**
 * @fileoverview Container Component Properties (TypeScript)
 * @module Studio/Params/Layout/Container/Properties
 *
 * @description
 * TypeScript-based property definitions for the Container component.
 * Migrated from config.json to fully typed definitions.
 */

import {
  text,
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

const directionOptions = [
  { value: 'vertical', label: 'Vertical' },
  { value: 'horizontal', label: 'Horizontal' },
];

const layoutOptions = [
  { value: 'fluid', label: 'Fluid' },
  { value: 'boxed', label: 'Boxed' },
  { value: 'fixed', label: 'Fixed' },
];

const justifyOptions = [
  { value: '', label: 'None' },
  { value: 'flex-start', label: 'Start' },
  { value: 'center', label: 'Center' },
  { value: 'flex-end', label: 'End' },
  { value: 'space-between', label: 'Space Between' },
  { value: 'space-around', label: 'Space Around' },
  { value: 'space-evenly', label: 'Space Evenly' },
];

const alignOptions = [
  { value: '', label: 'None' },
  { value: 'stretch', label: 'Stretch' },
  { value: 'flex-start', label: 'Start' },
  { value: 'center', label: 'Center' },
  { value: 'flex-end', label: 'End' },
  { value: 'baseline', label: 'Baseline' },
];

// === Property Definitions ===

const directionProperty = select('container_direction')
  .label('Direction')
  .inputProperty('direction')
  .width('180px')
  .default('vertical')
  .placeholder('Select direction')
  .options(directionOptions)
  .valueHandler(new ComponentInputHandler('direction', 'vertical'))
  .stateHandler(new InputStateHandler('direction'))
  .onChange(new UpdateInputHandler('direction', 'value'))
  .withInputHandler('direction')
  .build();

const layoutProperty = select('container_layout')
  .label('Layout')
  .inputProperty('layout')
  .width('180px')
  .default('fluid')
  .placeholder('Select layout')
  .options(layoutOptions)
  .valueHandler(new ComponentInputHandler('layout', 'fluid'))
  .stateHandler(new InputStateHandler('layout'))
  .onChange(new UpdateInputHandler('layout', 'value'))
  .withInputHandler('layout')
  .build();

const justifyProperty = select('container_justify')
  .label('Justify')
  .inputProperty('justify')
  .width('180px')
  .default('')
  .placeholder('Select justify')
  .options(justifyOptions)
  .valueHandler(new ComponentInputHandler('justify', ''))
  .stateHandler(new InputStateHandler('justify'))
  .onChange(new UpdateInputHandler('justify', 'value'))
  .withInputHandler('justify')
  .build();

const alignProperty = select('container_align')
  .label('Align')
  .inputProperty('align')
  .width('180px')
  .default('')
  .placeholder('Select align')
  .options(alignOptions)
  .valueHandler(new ComponentInputHandler('align', ''))
  .stateHandler(new InputStateHandler('align'))
  .onChange(new UpdateInputHandler('align', 'value'))
  .withInputHandler('align')
  .build();

const gapProperty = text('container_gap')
  .label('Gap')
  .inputProperty('gap')
  .width('180px')
  .default('0')
  .placeholder('e.g. 10px or 10')
  .valueHandler(new ComponentInputHandler('gap', '0'))
  .stateHandler(new InputStateHandler('gap'))
  .onChange(new UpdateInputHandler('gap', 'value'))
  .withInputHandler('gap')
  .build();

const wrapProperty = inputBoolean('container_wrap', 'wrap', 'Wrap').build();

// === Export ===

export const containerProperties: PropertyDefinition[] = [
  directionProperty,
  layoutProperty,
  justifyProperty,
  alignProperty,
  gapProperty,
  wrapProperty,
];

export const containerDefinition: ComponentDefinition = {
  type: 'container',
  name: 'Container',
  category: 'layout',
  panel: {
    containerUuid: 'container_collapse_container',
    containerName: 'Container Fields Container',
    collapseUuid: 'container_collapse',
    collapseTitle: 'Container Properties',
  },
  properties: containerProperties,
  events: ['click'],
  includeCommonProperties: [
    'component_value_text_block',
    'component_id_text_block',
    'display_block',
    'access_block',
    'component_hash_text_block',
  ],
};

export default containerDefinition;
