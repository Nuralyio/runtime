/**
 * @fileoverview Icon Component Properties (TypeScript)
 * @module Studio/Params/Media/Icon/Properties
 *
 * @description
 * TypeScript-based property definitions for the Icon component.
 * Migrated from config.json to fully typed definitions.
 */

import {
  text,
  radio,
  select,
  icon,
  color,
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

const iconTypeOptions = [
  { value: 'solid', label: 'Solid' },
  { value: 'regular', label: 'Regular' },
];

const iconSizeOptions = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
  { value: 'xlarge', label: 'X-Large' },
  { value: 'xxlarge', label: 'XX-Large' },
];

// === Property Definitions ===

const iconProperty = icon('icon')
  .label('Icon Name')
  .inputProperty('name')
  .width('100%')
  .default('smile')
  .placeholder('Choose an icon')
  .valueHandler(new ComponentInputHandler('icon', 'smile'))
  .stateHandler(new InputStateHandler('icon'))
  .onChange(new UpdateInputHandler('icon', 'value'))
  .withInputHandler('icon')
  .build();

const typeProperty = radio('type')
  .label('Icon Type')
  .inputProperty('type')
  .width('180px')
  .default('solid')
  .options(iconTypeOptions)
  .valueHandler(new ComponentInputHandler('type', 'solid'))
  .stateHandler(new InputStateHandler('type'))
  .onChange(new UpdateInputHandler('type', 'value'))
  .withInputHandler('type')
  .build();

const sizeProperty = select('size')
  .label('Size')
  .inputProperty('size')
  .width('180px')
  .default('medium')
  .options(iconSizeOptions)
  .valueHandler(new ComponentInputHandler('size', 'medium'))
  .stateHandler(new InputStateHandler('size'))
  .onChange(new UpdateInputHandler('size', 'value'))
  .withInputHandler('size')
  .build();

const colorProperty = color('color')
  .label('Icon Color')
  .inputProperty('color')
  .width('180px')
  .valueHandler(new ComponentInputHandler('color', ''))
  .stateHandler(new InputStateHandler('color'))
  .onChange(new UpdateInputHandler('color', 'value'))
  .withInputHandler('color')
  .build();

const widthProperty = inputText('width', 'width', 'Width')
  .placeholder('e.g., 24px, 2rem')
  .build();

const heightProperty = inputText('height', 'height', 'Height')
  .placeholder('e.g., 24px, 2rem')
  .build();

const altProperty = inputText('alt', 'alt', 'Alt Text')
  .placeholder('Accessibility text')
  .build();

const clickableProperty = inputBoolean('clickable', 'clickable', 'Clickable').build();

// === Export ===

export const iconProperties: PropertyDefinition[] = [
  iconProperty,
  typeProperty,
  sizeProperty,
  colorProperty,
  widthProperty,
  heightProperty,
  altProperty,
  clickableProperty,
];

export const iconDefinition: ComponentDefinition = {
  type: 'icon',
  name: 'Icon',
  category: 'media',
  panel: {
    containerUuid: 'icon_collapse_container',
    containerName: 'Icon Fields Container',
    collapseUuid: 'icon_collapse',
    collapseTitle: 'Icon Properties',
  },
  properties: iconProperties,
  events: ['click'],
  includeCommonProperties: [
    'component_value_text_block',
    'component_id_text_block',
    'display_block',
    'access_block',
    'component_hash_text_block',
  ],
};

export default iconDefinition;
