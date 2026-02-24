/**
 * @fileoverview Embed Component Properties (TypeScript)
 * @module Studio/Params/Advanced/Embed/Properties
 *
 * @description
 * TypeScript-based property definitions for the Embed component.
 * Migrated from config.json to fully typed definitions.
 */

import {
  inputText,
  type PropertyDefinition,
  type ComponentDefinition,
} from '../../../core/properties';

// === Property Definitions ===

const urlProperty = inputText('url', 'url', 'URL')
  .placeholder('https://nuraly.io')
  .build();

// === Export ===

export const embedProperties: PropertyDefinition[] = [
  urlProperty,
];

export const embedDefinition: ComponentDefinition = {
  type: 'embed',
  name: 'Embed',
  category: 'advanced',
  panel: {
    containerUuid: 'embed_collapse_container',
    containerName: 'Embed Fields Container',
    collapseUuid: 'embed_collapse',
    collapseTitle: 'Embed Properties',
  },
  properties: embedProperties,
  events: ['load', 'error', 'click', 'focus', 'blur'],
  includeCommonProperties: [
    'component_value_text_block',
    'component_id_text_block',
    'display_block',
    'access_block',
    'component_hash_text_block',
  ],
};

export default embedDefinition;
