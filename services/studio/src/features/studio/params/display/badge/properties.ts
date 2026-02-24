/**
 * @fileoverview Badge Component Properties (TypeScript)
 * @module Studio/Params/Display/Badge/Properties
 *
 * @description
 * TypeScript-based property definitions for the Badge component.
 * Migrated from config.json to fully typed definitions.
 */

import {
  text,
  number,
  radio,
  select,
  inputText,
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

const badgeSizeOptions = [
  { value: 'small', label: 'S' },
  { value: 'default', label: 'M' },
];

const colorOptions = [
  { value: '', label: 'Default' },
  { value: 'primary', label: 'Primary' },
  { value: 'success', label: 'Success' },
  { value: 'warning', label: 'Warning' },
  { value: 'danger', label: 'Danger' },
];

const statusOptions = [
  { value: '', label: 'None' },
  { value: 'default', label: 'Default' },
  { value: 'processing', label: 'Processing' },
  { value: 'success', label: 'Success' },
  { value: 'error', label: 'Error' },
  { value: 'warning', label: 'Warning' },
];

const ribbonPlacementOptions = [
  { value: 'start', icon: 'arrow-left' },
  { value: 'end', icon: 'arrow-right' },
];

// === Property Definitions ===

const countProperty = number('badge_count')
  .label('Count')
  .inputProperty('count')
  .width('80px')
  .default('0' as any)
  .placeholder('0')
  .valueHandler(new ComponentInputHandler('count', 0))
  .stateHandler(new InputStateHandler('count'))
  .onChange(new UpdateInputHandler('count', 'value'))
  .withInputHandler('count')
  .build();

const textProperty = inputText('badge_text', 'text', 'Text')
  .placeholder('Badge text')
  .build();

const dotProperty = inputBoolean('badge_dot', 'dot', 'Dot Badge').build();
const showZeroProperty = inputBoolean('badge_showZero', 'showZero', 'Show Zero').build();

const overflowCountProperty = number('badge_overflowCount')
  .label('Overflow Count')
  .inputProperty('overflowCount')
  .width('80px')
  .default('99' as any)
  .placeholder('99')
  .valueHandler(new ComponentInputHandler('overflowCount', 99))
  .stateHandler(new InputStateHandler('overflowCount'))
  .onChange(new UpdateInputHandler('overflowCount', 'value'))
  .withInputHandler('overflowCount')
  .build();

const sizeProperty = radio('badge_size')
  .label('Size')
  .inputProperty('size')
  .width('180px')
  .default('default')
  .options(badgeSizeOptions)
  .stateHandler(new InputStateHandler('size'))
  .onChange(new UpdateInputHandler('size', 'value'))
  .withInputHandler('size')
  .build();

const colorProperty = select('badge_color')
  .label('Color')
  .inputProperty('color')
  .width('180px')
  .default('')
  .options(colorOptions)
  .valueHandler(new ComponentInputHandler('color', ''))
  .stateHandler(new InputStateHandler('color'))
  .onChange(new UpdateInputHandler('color', 'value'))
  .withInputHandler('color')
  .build();

const statusProperty = select('badge_status')
  .label('Status')
  .inputProperty('status')
  .width('180px')
  .default('')
  .options(statusOptions)
  .valueHandler(new ComponentInputHandler('status', ''))
  .stateHandler(new InputStateHandler('status'))
  .onChange(new UpdateInputHandler('status', 'value'))
  .withInputHandler('status')
  .build();

const ribbonProperty = inputBoolean('badge_ribbon', 'ribbon', 'Ribbon').build();

const ribbonPlacementProperty = radio('badge_ribbonPlacement')
  .label('Ribbon Position')
  .inputProperty('ribbonPlacement')
  .width('180px')
  .default('end')
  .options(ribbonPlacementOptions)
  .stateHandler(new InputStateHandler('ribbonPlacement'))
  .onChange(new UpdateInputHandler('ribbonPlacement', 'value'))
  .withInputHandler('ribbonPlacement')
  .build();

// === Export ===

export const badgeProperties: PropertyDefinition[] = [
  countProperty,
  textProperty,
  dotProperty,
  showZeroProperty,
  overflowCountProperty,
  sizeProperty,
  colorProperty,
  statusProperty,
  ribbonProperty,
  ribbonPlacementProperty,
];

export const badgeDefinition: ComponentDefinition = {
  type: 'badge',
  name: 'Badge',
  category: 'display',
  panel: {
    containerUuid: 'badge_fields_collapse_container',
    containerName: 'Badge Fields Container',
    collapseUuid: 'badge_fields_collapse',
    collapseTitle: 'Badge Properties',
  },
  properties: badgeProperties,
  events: ['click'],
  includeCommonProperties: [
    'component_value_text_block',
    'component_id_text_block',
    'display_block',
    'access_block',
    'component_hash_text_block',
  ],
};

export default badgeDefinition;
