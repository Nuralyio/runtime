/**
 * @fileoverview Document Component Properties (TypeScript)
 * @module Studio/Params/Content/Document/Properties
 *
 * @description
 * TypeScript-based property definitions for the Document component.
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

const documentTypeOptions = [
  { value: 'pdf', label: 'PDF' },
  { value: 'image', label: 'Image' },
  { value: 'other', label: 'Other' },
];

// === Property Definitions ===

const srcProperty = inputText('document_src', 'src', 'Source URL')
  .placeholder('Document URL')
  .build();

const typeProperty = select('document_type')
  .label('Document Type')
  .inputProperty('type')
  .width('180px')
  .default('pdf')
  .placeholder('Select document type')
  .options(documentTypeOptions)
  .valueHandler(new ComponentInputHandler('type', 'pdf'))
  .stateHandler(new InputStateHandler('type'))
  .onChange(new UpdateInputHandler('type', 'value'))
  .withInputHandler('type')
  .build();

const previewableProperty = inputBoolean('document_previewable', 'previewable', 'Previewable').build();

// === Export ===

export const documentProperties: PropertyDefinition[] = [
  srcProperty,
  typeProperty,
  previewableProperty,
];

export const documentDefinition: ComponentDefinition = {
  type: 'document',
  name: 'Document',
  category: 'content',
  panel: {
    containerUuid: 'document_collapse_container',
    containerName: 'Document Fields Container',
    collapseUuid: 'document_collapse',
    collapseTitle: 'Document Properties',
  },
  properties: documentProperties,
  events: ['load', 'error', 'click'],
  includeCommonProperties: [
    'component_value_text_block',
    'component_id_text_block',
    'display_block',
    'access_block',
    'component_hash_text_block',
  ],
};

export default documentDefinition;
