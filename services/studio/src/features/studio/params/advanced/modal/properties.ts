/**
 * @fileoverview Modal Component Properties (TypeScript)
 * @module Studio/Params/Advanced/Modal/Properties
 *
 * @description
 * TypeScript-based property definitions for the Modal component.
 * Migrated from config.json to fully typed definitions.
 */

import {
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

const sizeOptions = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
  { value: 'xl', label: 'XL' },
];

const positionOptions = [
  { value: 'center', label: 'Center' },
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
];

const backdropOptions = [
  { value: 'closable', label: 'Closable' },
  { value: 'static', label: 'Static' },
  { value: 'none', label: 'None' },
];

const animationOptions = [
  { value: 'fade', label: 'Fade' },
  { value: 'zoom', label: 'Zoom' },
  { value: 'slide-up', label: 'Slide Up' },
  { value: 'slide-down', label: 'Slide Down' },
  { value: 'none', label: 'None' },
];

// === Property Definitions ===

const editorOpenProperty = inputBoolean('modal_editor_open', 'editorOpen', 'Editor Open').build();

const openProperty = inputBoolean('modal_open', 'open', 'Open').build();

const titleProperty = inputText('modal_title', 'modalTitle', 'Title')
  .placeholder('Modal Title')
  .build();

const sizeProperty = select('modal_size')
  .label('Size')
  .inputProperty('size')
  .width('180px')
  .default('medium')
  .placeholder('Select size')
  .options(sizeOptions)
  .valueHandler(new ComponentInputHandler('size', 'medium'))
  .stateHandler(new InputStateHandler('size'))
  .onChange(new UpdateInputHandler('size', 'value'))
  .withInputHandler('size')
  .build();

const positionProperty = select('modal_position')
  .label('Position')
  .inputProperty('position')
  .width('180px')
  .default('center')
  .placeholder('Select position')
  .options(positionOptions)
  .valueHandler(new ComponentInputHandler('position', 'center'))
  .stateHandler(new InputStateHandler('position'))
  .onChange(new UpdateInputHandler('position', 'value'))
  .withInputHandler('position')
  .build();

const backdropProperty = select('modal_backdrop')
  .label('Backdrop')
  .inputProperty('backdrop')
  .width('180px')
  .default('closable')
  .placeholder('Select backdrop')
  .options(backdropOptions)
  .valueHandler(new ComponentInputHandler('backdrop', 'closable'))
  .stateHandler(new InputStateHandler('backdrop'))
  .onChange(new UpdateInputHandler('backdrop', 'value'))
  .withInputHandler('backdrop')
  .build();

const closableProperty = inputBoolean('modal_closable', 'closable', 'Closable')
  .default(true)
  .build();

const animationProperty = select('modal_animation')
  .label('Animation')
  .inputProperty('animation')
  .width('180px')
  .default('fade')
  .placeholder('Select animation')
  .options(animationOptions)
  .valueHandler(new ComponentInputHandler('animation', 'fade'))
  .stateHandler(new InputStateHandler('animation'))
  .onChange(new UpdateInputHandler('animation', 'value'))
  .withInputHandler('animation')
  .build();

const showCloseButtonProperty = inputBoolean('modal_show_close_button', 'showCloseButton', 'Show Close Button')
  .default(true)
  .build();

const draggableProperty = inputBoolean('modal_draggable', 'modalDraggable', 'Draggable').build();

const widthProperty = inputText('modal_width', 'width', 'Width')
  .placeholder('e.g. 600px')
  .build();

const heightProperty = inputText('modal_height', 'height', 'Height')
  .placeholder('e.g. 400px')
  .build();

// === Export ===

export const modalProperties: PropertyDefinition[] = [
  editorOpenProperty,
  openProperty,
  titleProperty,
  sizeProperty,
  positionProperty,
  backdropProperty,
  closableProperty,
  animationProperty,
  showCloseButtonProperty,
  draggableProperty,
  widthProperty,
  heightProperty,
];

export const modalDefinition: ComponentDefinition = {
  type: 'modal',
  name: 'Modal',
  category: 'advanced',
  panel: {
    containerUuid: 'modal_collapse_container',
    containerName: 'Modal Fields Container',
    collapseUuid: 'modal_collapse',
    collapseTitle: 'Modal Properties',
  },
  properties: modalProperties,
  events: ['open', 'close', 'afterOpen', 'afterClose'],
  includeCommonProperties: [
    'component_value_text_block',
    'component_id_text_block',
    'display_block',
    'access_block',
    'component_hash_text_block',
  ],
};

export default modalDefinition;
