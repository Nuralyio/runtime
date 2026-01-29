/**
 * @fileoverview Tag Component Properties (TypeScript)
 * @module Studio/Params/Display/Tag/Properties
 *
 * @description
 * TypeScript-based property definitions for the Tag component.
 * Migrated from tag-config.json to fully typed definitions.
 */

import {
  text,
  icon,
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

// === Property Definitions ===

const labelProperty = text('tag_label')
  .label('Label')
  .inputProperty('label')
  .width('180px')
  .default('')
  .placeholder('Tag label')
  .valueHandler(new ComponentInputHandler('label', ''))
  .stateHandler(new InputStateHandler('label'))
  .onChange(new UpdateInputHandler('label', 'string'))
  .build();

const closableProperty = inputBoolean('tag_closable', 'closable', 'Closable').build();

const iconProperty = icon('tag_icon')
  .label('Icon')
  .inputProperty('icon')
  .width('180px')
  .default('')
  .placeholder('Choose an icon')
  .valueHandler(new ComponentInputHandler('icon', ''))
  .stateHandler(new InputStateHandler('icon'))
  .onChange(new UpdateInputHandler('icon', 'value'))
  .withInputHandler('icon')
  .build();

const borderedProperty = inputBoolean('tag_bordered', 'bordered', 'Bordered')
  .default(true)
  .build();

// === Export ===

export const tagProperties: PropertyDefinition[] = [
  labelProperty,
  closableProperty,
  iconProperty,
  borderedProperty,
];

export const tagDefinition: ComponentDefinition = {
  type: 'tag',
  name: 'Tag',
  category: 'display',
  panel: {
    containerUuid: 'tag_fields_collapse_container',
    containerName: 'Tag Fields Container',
    collapseUuid: 'tag_fields_collapse',
    collapseTitle: 'Tag Properties',
  },
  properties: tagProperties,
  events: ['click', 'close'],
  includeCommonProperties: [
    'component_value_text_block',
    'component_id_text_block',
    'display_block',
    'access_block',
    'component_hash_text_block',
  ],
};

export default tagDefinition;
