/**
 * @fileoverview Link Component Properties (TypeScript)
 * @module Studio/Params/Navigation/Link/Properties
 *
 * @description
 * TypeScript-based property definitions for the Link component.
 * Migrated from config.json to fully typed definitions.
 */

import {
  select,
  inputText,
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

const targetOptions = [
  { value: '_self', label: 'Same Tab (_self)' },
  { value: '_blank', label: 'New Tab (_blank)' },
  { value: '_parent', label: 'Parent Frame (_parent)' },
  { value: '_top', label: 'Top Frame (_top)' },
];

// === Property Definitions ===

const labelProperty = inputText('label', 'label', 'Label')
  .default('Link')
  .placeholder('Link text')
  .build();

const urlProperty = inputText('url', 'url', 'URL')
  .placeholder('https://example.com')
  .build();

const targetProperty = select('target')
  .label('Target')
  .inputProperty('target')
  .width('180px')
  .default('_self')
  .options(targetOptions)
  .valueHandler(new ComponentInputHandler('target', '_self'))
  .stateHandler(new InputStateHandler('target'))
  .onChange(new UpdateInputHandler('target', 'value'))
  .withInputHandler('target')
  .build();

// === Export ===

export const linkProperties: PropertyDefinition[] = [
  labelProperty,
  urlProperty,
  targetProperty,
];

export const linkDefinition: ComponentDefinition = {
  type: 'link',
  name: 'Link',
  category: 'navigation',
  panel: {
    containerUuid: 'link_collapse_container',
    containerName: 'Link Fields Container',
    collapseUuid: 'link_collapse',
    collapseTitle: 'Link Properties',
  },
  properties: linkProperties,
  events: ['click'],
  includeCommonProperties: [
    'component_value_text_block',
    'component_id_text_block',
    'display_block',
    'access_block',
    'component_hash_text_block',
  ],
};

export default linkDefinition;
