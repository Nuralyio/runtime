/**
 * @fileoverview Richtext Component Properties (TypeScript)
 * @module Studio/Params/Content/Richtext/Properties
 *
 * @description
 * TypeScript-based property definitions for the Richtext component.
 * Migrated from config.json to fully typed definitions.
 */

import {
  textarea,
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

const valueProperty = textarea('richtext_value')
  .label('Content')
  .inputProperty('value')
  .width('180px')
  .placeholder('Enter HTML content')
  .valueHandler(new ComponentInputHandler('value', ''))
  .stateHandler(new InputStateHandler('value'))
  .onChange(new UpdateInputHandler('value', 'string'))
  .withInputHandler('value')
  .build();

// === Export ===

export const richtextProperties: PropertyDefinition[] = [
  valueProperty,
];

export const richtextDefinition: ComponentDefinition = {
  type: 'richtext',
  name: 'Rich Text',
  category: 'content',
  panel: {
    containerUuid: 'rich_text_collapse_container',
    containerName: 'Rich Text Fields Container',
    collapseUuid: 'rich_text_collapse',
    collapseTitle: 'Rich Text Properties',
  },
  properties: richtextProperties,
  events: [],
  includeCommonProperties: [
    'component_value_text_block',
    'component_id_text_block',
    'display_block',
    'access_block',
    'component_hash_text_block',
  ],
};

export default richtextDefinition;
