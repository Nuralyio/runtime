/**
 * @fileoverview RefComponent Properties (TypeScript)
 * @module Studio/Params/Advanced/RefComponent/Properties
 *
 * @description
 * TypeScript-based property definitions for the RefComponent component.
 * Migrated from config.json to fully typed definitions.
 */

import {
  inputText,
  type PropertyDefinition,
  type ComponentDefinition,
} from '../../../core/properties';

// === Property Definitions ===

const refProperty = inputText('refcomponent_ref', 'ref', 'Reference')
  .placeholder('Component UUID')
  .build();

// === Export ===

export const refComponentProperties: PropertyDefinition[] = [
  refProperty,
];

export const refComponentDefinition: ComponentDefinition = {
  type: 'ref-component',
  name: 'Reference Component',
  category: 'advanced',
  panel: {
    containerUuid: 'refcomponent_collapse_container',
    containerName: 'Ref Component Fields Container',
    collapseUuid: 'refcomponent_collapse',
    collapseTitle: 'Ref Component Properties',
  },
  properties: refComponentProperties,
  events: [],
  includeCommonProperties: [
    'component_value_text_block',
    'component_id_text_block',
    'display_block',
    'access_block',
    'component_hash_text_block',
  ],
};

export default refComponentDefinition;
