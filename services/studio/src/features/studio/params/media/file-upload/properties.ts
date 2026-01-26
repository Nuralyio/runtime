/**
 * @fileoverview FileUpload Component Properties (TypeScript)
 * @module Studio/Params/Media/FileUpload/Properties
 *
 * @description
 * TypeScript-based property definitions for the FileUpload component.
 * Migrated from config.json to fully typed definitions.
 *
 * Note: FileUpload has no custom properties, only common properties.
 */

import {
  type PropertyDefinition,
  type ComponentDefinition,
} from '../../../core/properties';

// === Property Definitions ===

// FileUpload has no custom properties

// === Export ===

export const fileUploadProperties: PropertyDefinition[] = [];

export const fileUploadDefinition: ComponentDefinition = {
  type: 'file-upload',
  name: 'File Upload',
  category: 'media',
  panel: {
    containerUuid: 'FileUpload_input_collapse_container',
    containerName: 'FileUpload Fields Container',
    collapseUuid: 'FileUpload_collapse',
    collapseTitle: 'File Upload Properties',
  },
  properties: fileUploadProperties,
  events: ['change', 'upload', 'remove'],
  includeCommonProperties: [
    'component_value_text_block',
    'component_id_text_block',
    'display_block',
    'access_block',
    'component_hash_text_block',
    'FileUpload_alt_text_block',
    'FileUpload_src_text_block',
    'FileUpload_fallback_text_block',
  ],
};

export default fileUploadDefinition;
