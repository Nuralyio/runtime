/**
 * @fileoverview EmbedURL Component Properties (TypeScript)
 * @module Studio/Params/Navigation/EmbedURL/Properties
 *
 * @description
 * TypeScript-based property definitions for the EmbedURL component.
 * EmbedURL renders an iframe with the specified URL.
 */

import {
  inputText,
  type PropertyDefinition,
  type ComponentDefinition,
} from '../../../core/properties';

// === Property Definitions ===

const urlProperty = inputText('embedurl_url', 'url', 'URL')
  .placeholder('https://example.com')
  .build();

// === Export ===

export const embedUrlProperties: PropertyDefinition[] = [
  urlProperty,
];

export const embedUrlDefinition: ComponentDefinition = {
  type: 'embed_url',
  name: 'Embed URL',
  category: 'navigation',
  panel: {
    containerUuid: 'embedurl_fields_collapse_container',
    containerName: 'Embed URL Fields Container',
    collapseUuid: 'embedurl_fields_collapse',
    collapseTitle: 'Embed URL Properties',
  },
  properties: embedUrlProperties,
  events: ['load', 'error', 'focus', 'blur', 'click'],
  includeCommonProperties: [
    'component_id_text_block',
    'display_block',
    'access_block',
    'component_hash_text_block',
  ],
};

export default embedUrlDefinition;
