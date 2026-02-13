/**
 * @fileoverview Divider Component Properties (TypeScript)
 * @module Studio/Params/Display/Divider/Properties
 *
 * @description
 * TypeScript-based property definitions for the Divider component.
 */

import {
  inputText,
  inputRadio,
  inputBoolean,
  type PropertyDefinition,
  type ComponentDefinition,
} from '../../../core/properties';

// === Custom Options ===

const directionOptions = [
  { value: 'horizontal', label: 'Horizontal' },
  { value: 'vertical', label: 'Vertical' },
];

const variantOptions = [
  { value: 'solid', label: 'Solid' },
  { value: 'dashed', label: 'Dashed' },
  { value: 'dotted', label: 'Dotted' },
];

const orientationOptions = [
  { value: 'start', label: 'Start' },
  { value: 'center', label: 'Center' },
  { value: 'end', label: 'End' },
];

const sizeOptions = [
  { value: 'small', label: 'Small' },
  { value: 'middle', label: 'Middle' },
  { value: 'large', label: 'Large' },
];

// === Property Definitions ===

const textProperty = inputText('divider_text', 'text', 'Text')
  .placeholder('Divider text')
  .translatable()
  .build();

const directionProperty = inputRadio('divider_direction', 'direction', 'Direction', directionOptions, 'horizontal').build();
const variantProperty = inputRadio('divider_variant', 'variant', 'Variant', variantOptions, 'solid').build();
const orientationProperty = inputRadio('divider_textOrientation', 'textOrientation', 'Text Orientation', orientationOptions, 'center').build();
const sizeProperty = inputRadio('divider_size', 'size', 'Size', sizeOptions, 'middle').build();

const dashedProperty = inputBoolean('divider_dashed', 'dashed', 'Dashed').build();
const plainProperty = inputBoolean('divider_plain', 'plain', 'Plain')
  .default(true)
  .build();

const orientationMarginProperty = inputText('divider_orientationMargin', 'orientationMargin', 'Orientation Margin')
  .placeholder('e.g. 20px')
  .build();

// === Export ===

export const dividerProperties: PropertyDefinition[] = [
  textProperty,
  directionProperty,
  variantProperty,
  orientationProperty,
  sizeProperty,
  dashedProperty,
  plainProperty,
  orientationMarginProperty,
];

export const dividerDefinition: ComponentDefinition = {
  type: 'divider',
  name: 'Divider',
  category: 'display',
  panel: {
    containerUuid: 'divider_fields_collapse_container',
    containerName: 'Divider Fields Container',
    collapseUuid: 'divider_fields_collapse',
    collapseTitle: 'Divider Properties',
  },
  properties: dividerProperties,
  events: ['click'],
  includeCommonProperties: [
    'component_id_text_block',
    'display_block',
    'access_block',
    'component_hash_text_block',
  ],
};

export default dividerDefinition;
