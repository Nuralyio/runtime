/**
 * @fileoverview RichtextEditor Component Properties (TypeScript)
 * @module Studio/Params/Content/RichtextEditor/Properties
 *
 * @description
 * TypeScript-based property definitions for the RichtextEditor component.
 * Migrated from config.json to fully typed definitions.
 *
 * Note: RichtextEditor has no custom properties, only common properties.
 */

import {
  type PropertyDefinition,
  type ComponentDefinition,
} from '../../../core/properties';

// === Property Definitions ===

// RichtextEditor has no custom properties

// === Export ===

export const richtextEditorProperties: PropertyDefinition[] = [];

export const richtextEditorDefinition: ComponentDefinition = {
  type: 'richtext-editor',
  name: 'Rich Text Editor',
  category: 'content',
  panel: {
    containerUuid: 'rich_text_editor_collapse_container',
    containerName: 'Rich Text Editor Fields Container',
    collapseUuid: 'rich_text_editor_collapse',
    collapseTitle: 'Rich Text Editor Properties',
  },
  properties: richtextEditorProperties,
  events: ['change', 'focus', 'blur'],
  includeCommonProperties: [
    'component_value_text_block',
    'component_id_text_block',
    'display_block',
    'access_block',
    'component_hash_text_block',
  ],
};

export default richtextEditorDefinition;
