/**
 * @fileoverview Collapse Component Properties (TypeScript)
 * @module Studio/Params/Layout/Collapse/Properties
 *
 * @description
 * TypeScript-based property definitions for the Collapse component.
 */

import {
  inputText,
  inputRadio,
  inputBoolean,
  type PropertyDefinition,
  type ComponentDefinition,
} from '../../../core/properties';
import {
  sizeRadioOptions,
} from '../../../core/handlers';

// === Custom Options ===

const variantOptions = [
  { value: 'default', label: 'Default' },
  { value: 'bordered', label: 'Bordered' },
  { value: 'ghost', label: 'Ghost' },
];

const animationOptions = [
  { value: 'slide', label: 'Slide' },
  { value: 'fade', label: 'Fade' },
  { value: 'none', label: 'None' },
];

// === Property Definitions ===

const sizeProperty = inputRadio('collapse_size', 'size', 'Size', sizeRadioOptions, 'medium').build();
const variantProperty = inputRadio('collapse_variant', 'variant', 'Variant', variantOptions, 'default').build();
const animationProperty = inputRadio('collapse_animation', 'animation', 'Animation', animationOptions, 'slide').build();

const accordionProperty = inputBoolean('collapse_accordion', 'accordion', 'Accordion').build();
const allowMultipleProperty = inputBoolean('collapse_allowMultiple', 'allowMultiple', 'Allow Multiple').build();
const disabledProperty = inputBoolean('collapse_disabled', 'disabled', 'Disabled').build();

const expandIconProperty = inputText('collapse_expandIcon', 'expandIcon', 'Expand Icon')
  .default('chevron-right')
  .placeholder('Icon name')
  .build();

const collapseIconProperty = inputText('collapse_collapseIcon', 'collapseIcon', 'Collapse Icon')
  .default('chevron-down')
  .placeholder('Icon name')
  .build();

// === Export ===

export const collapseProperties: PropertyDefinition[] = [
  sizeProperty,
  variantProperty,
  animationProperty,
  accordionProperty,
  allowMultipleProperty,
  disabledProperty,
  expandIconProperty,
  collapseIconProperty,
];

export const collapseDefinition: ComponentDefinition = {
  type: 'collapse',
  name: 'Collapse',
  category: 'layout',
  panel: {
    containerUuid: 'collapse_fields_collapse_container',
    containerName: 'Collapse Fields Container',
    collapseUuid: 'collapse_fields_collapse',
    collapseTitle: 'Collapse Properties',
  },
  properties: collapseProperties,
  events: ['change'],
  includeCommonProperties: [
    'component_id_text_block',
    'display_block',
    'access_block',
    'component_hash_text_block',
  ],
};

export default collapseDefinition;
