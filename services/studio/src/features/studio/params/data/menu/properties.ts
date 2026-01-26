/**
 * @fileoverview Menu Component Properties (TypeScript)
 * @module Studio/Params/Data/Menu/Properties
 *
 * @description
 * TypeScript-based property definitions for the Menu component.
 * Migrated from config.json to fully typed definitions.
 */

import {
  radio,
  event,
  type PropertyDefinition,
  type ComponentDefinition,
} from '../../../core/properties';
import {
  ComputedValueHandler,
  sizeRadioOptions,
} from '../../../core/handlers';
import {
  InputStateHandler,
} from '../../../core/handlers/state-handlers';
import {
  UpdateInputHandler,
  CustomEventHandler,
} from '../../../core/handlers/event-handlers';

// === Custom Options ===

const arrowPositionOptions = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
];

// === Property Definitions ===

const itemsProperty = event('items')
  .label('Items')
  .width('50px')
  .handlerType('input')
  .handlerProperty('options')
  .handlerValueGetter(new ComputedValueHandler((ctx) => {
    const parameter = 'options';
    let labelHandler = '';
    const selectedComponent = ctx.Utils.first(ctx.$selectedComponents);
    if (selectedComponent?.input?.options?.type === 'handler' && selectedComponent?.input?.options?.value) {
      labelHandler = selectedComponent?.input?.options.value;
    } else if (selectedComponent?.input?.options?.type === 'array' && selectedComponent?.input?.options?.value) {
      labelHandler = JSON.stringify(selectedComponent?.input?.options.value, null, 2);
    }
    return [parameter, labelHandler];
  }))
  .handlerEventUpdate(new CustomEventHandler((ctx) => {
    const selectedComponent = ctx.Utils.first(ctx.$selectedComponents);
    if (ctx.EventData.value !== selectedComponent?.input?.options?.value) {
      const isNotHandler = !ctx.EventData.value.includes('return');
      if (isNotHandler) {
        ctx.updateInput(
          selectedComponent,
          'options',
          selectedComponent?.input?.options?.type,
          JSON.parse(ctx.EventData.value)
        );
      } else {
        ctx.updateInput(
          selectedComponent,
          'items',
          'handler',
          ctx.EventData.value
        );
      }
    }
  }))
  .build();

const sizeProperty = radio('menusize')
  .label('Size')
  .inputProperty('size')
  .width('180px')
  .default('medium')
  .options(sizeRadioOptions)
  .stateHandler(new InputStateHandler('size'))
  .withInputHandler('size')
  .build();

const arrowPositionProperty = radio('menuarrowPosition')
  .label('Arrow Position')
  .inputProperty('arrowPosition')
  .width('180px')
  .default('right')
  .options(arrowPositionOptions)
  .stateHandler(new InputStateHandler('arrowPosition'))
  .onChange(new UpdateInputHandler('arrowPosition', 'value'))
  .withInputHandler('arrowPosition')
  .build();

// === Export ===

export const menuProperties: PropertyDefinition[] = [
  itemsProperty,
  sizeProperty,
  arrowPositionProperty,
];

export const menuDefinition: ComponentDefinition = {
  type: 'menu',
  name: 'Menu',
  category: 'data',
  panel: {
    containerUuid: 'menu_collapse_container',
    containerName: 'Menu Fields Container',
    collapseUuid: 'menu_collapse',
    collapseTitle: 'Menu Properties',
  },
  properties: menuProperties,
  events: ['select', 'open', 'close'],
  includeCommonProperties: [
    'component_value_text_block',
    'component_id_text_block',
    'display_block',
    'access_block',
    'component_hash_text_block',
  ],
};

export default menuDefinition;
