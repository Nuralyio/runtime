/**
 * @fileoverview Panel Component Properties (TypeScript)
 * @module Studio/Params/Layout/Panel/Properties
 *
 * @description
 * TypeScript-based property definitions for the Panel component.
 */

import {
  icon,
  select,
  inputText,
  inputRadio,
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

const modeOptions = [
  { value: 'panel', label: 'Panel' },
  { value: 'window', label: 'Window' },
  { value: 'embedded', label: 'Embedded' },
];

const sizeOptions = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

const positionOptions = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
];

const maximizePositionOptions = [
  { value: 'center', label: 'Center' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-right', label: 'Top Right' },
];

// === Property Definitions ===

const titleProperty = inputText('panel_title', 'title', 'Title')
  .placeholder('Panel title')
  .translatable()
  .build();

const iconProperty = icon('panel_icon')
  .label('Icon')
  .inputProperty('icon')
  .width('180px')
  .placeholder('Choose an icon')
  .valueHandler(new ComponentInputHandler('icon', ''))
  .stateHandler(new InputStateHandler('icon'))
  .on('iconChanged', new UpdateInputHandler('icon', 'string'))
  .withInputHandler('icon')
  .build();

const modeProperty = inputRadio('panel_mode', 'mode', 'Mode', modeOptions, 'panel').build();
const sizeProperty = inputRadio('panel_size', 'size', 'Size', sizeOptions, 'medium').build();
const positionProperty = inputRadio('panel_position', 'position', 'Position', positionOptions, 'right').build();

const maximizePositionProperty = select('panel_maximizePosition')
  .label('Maximize Position')
  .inputProperty('maximizePosition')
  .width('180px')
  .default('center')
  .options(maximizePositionOptions)
  .stateHandler(new InputStateHandler('maximizePosition'))
  .onChange(new UpdateInputHandler('maximizePosition', 'string'))
  .withInputHandler('maximizePosition')
  .build();

const widthProperty = inputText('panel_width', 'width', 'Width')
  .placeholder('e.g. 400px')
  .build();

const heightProperty = inputText('panel_height', 'height', 'Height')
  .placeholder('e.g. 300px')
  .build();

const openProperty = inputBoolean('panel_open', 'open', 'Open')
  .default(true)
  .build();

const draggableProperty = inputBoolean('panel_draggable', 'draggable', 'Draggable')
  .default(true)
  .build();

const resizableProperty = inputBoolean('panel_resizable', 'resizable', 'Resizable').build();
const collapsibleProperty = inputBoolean('panel_collapsible', 'collapsible', 'Collapsible').build();
const minimizableProperty = inputBoolean('panel_minimizable', 'minimizable', 'Minimizable')
  .default(true)
  .build();
const closableProperty = inputBoolean('panel_closable', 'closable', 'Closable').build();
const animatedProperty = inputBoolean('panel_animated', 'animated', 'Animated').build();

// === Export ===

export const panelProperties: PropertyDefinition[] = [
  titleProperty,
  iconProperty,
  modeProperty,
  sizeProperty,
  positionProperty,
  maximizePositionProperty,
  widthProperty,
  heightProperty,
  openProperty,
  draggableProperty,
  resizableProperty,
  collapsibleProperty,
  minimizableProperty,
  closableProperty,
  animatedProperty,
];

export const panelDefinition: ComponentDefinition = {
  type: 'panel',
  name: 'Panel',
  category: 'layout',
  panel: {
    containerUuid: 'panel_fields_collapse_container',
    containerName: 'Panel Fields Container',
    collapseUuid: 'panel_fields_collapse',
    collapseTitle: 'Panel Properties',
  },
  properties: panelProperties,
  events: ['close', 'open'],
  includeCommonProperties: [
    'component_id_text_block',
    'display_block',
    'access_block',
    'component_hash_text_block',
  ],
};

export default panelDefinition;
