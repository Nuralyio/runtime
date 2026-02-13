/**
 * @fileoverview Slider Component Properties (TypeScript)
 * @module Studio/Params/Inputs/Slider/Properties
 *
 * @description
 * TypeScript-based property definitions for the Slider component.
 * Replaces legacy YAML configuration files.
 */

import {
  number,
  inputBoolean,
  type PropertyDefinition,
  type ComponentDefinition,
} from '../../../core/properties';

// === Property Definitions ===

const valueProperty = number('slider_value')
  .label('Value')
  .inputProperty('value')
  .width('180px')
  .default(0)
  .placeholder('0')
  .autoInputHandlers('string')
  .withInputHandler('value')
  .build();

const minProperty = number('slider_min')
  .label('Min')
  .inputProperty('min')
  .width('180px')
  .default(0)
  .placeholder('0')
  .autoInputHandlers('string')
  .withInputHandler('min')
  .build();

const maxProperty = number('slider_max')
  .label('Max')
  .inputProperty('max')
  .width('180px')
  .default(100)
  .placeholder('100')
  .autoInputHandlers('string')
  .withInputHandler('max')
  .build();

const stepProperty = number('slider_step')
  .label('Step')
  .inputProperty('step')
  .width('180px')
  .default(1)
  .min(0)
  .placeholder('1')
  .autoInputHandlers('string')
  .withInputHandler('step')
  .build();

const disabledProperty = inputBoolean('slider_disabled', 'disabled', 'Disabled').build();
const verticalProperty = inputBoolean('slider_vertical', 'vertical', 'Vertical').build();
const showTooltipProperty = inputBoolean('slider_showTooltip', 'showTooltip', 'Show Tooltip')
  .default(true)
  .build();
const showMarksProperty = inputBoolean('slider_showMarks', 'showMarks', 'Show Marks').build();
const rangeProperty = inputBoolean('slider_range', 'range', 'Range Mode').build();

// === Export ===

export const sliderProperties: PropertyDefinition[] = [
  valueProperty,
  minProperty,
  maxProperty,
  stepProperty,
  disabledProperty,
  verticalProperty,
  showTooltipProperty,
  showMarksProperty,
  rangeProperty,
];

export const sliderDefinition: ComponentDefinition = {
  type: 'slider',
  name: 'Slider',
  category: 'inputs',
  panel: {
    containerUuid: 'slider_fields_collapse_container',
    containerName: 'Slider Fields Container',
    collapseUuid: 'slider_fields_collapse',
    collapseTitle: 'Slider Properties',
  },
  properties: sliderProperties,
  events: ['change'],
  includeCommonProperties: [
    'component_value_text_block',
    'component_id_text_block',
    'display_block',
    'access_block',
    'component_hash_text_block',
  ],
};

export default sliderDefinition;
