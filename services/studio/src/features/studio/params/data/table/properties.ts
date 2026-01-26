/**
 * @fileoverview Table Component Properties (TypeScript)
 * @module Studio/Params/Data/Table/Properties
 *
 * @description
 * TypeScript-based property definitions for the Table component.
 * Migrated from config.json to fully typed definitions.
 */

import {
  text,
  number,
  radio,
  icon,
  event,
  inputText,
  inputBoolean,
  type PropertyDefinition,
  type ComponentDefinition,
} from '../../../core/properties';
import {
  ComponentInputHandler,
  HandlerValueGetter,
  ComputedValueHandler,
} from '../../../core/handlers';
import {
  InputStateHandler,
  DefaultStyleStateHandler,
} from '../../../core/handlers/state-handlers';
import {
  UpdateInputHandler,
  UpdateStyleHandler,
  UpdateInputAsHandlerHandler,
  CustomEventHandler,
} from '../../../core/handlers/event-handlers';

// === Custom Options ===

const sizeOptions = [
  { value: 'small', label: 'S' },
  { value: 'normal', label: 'M' },
  { value: 'large', label: 'L' },
];

const selectionModeOptions = [
  { value: '', icon: 'ban' },
  { value: 'single', icon: 'check' },
  { value: 'multiple', icon: 'list-check' },
];

// === Property Definitions ===

const dataProperty = event('table_data')
  .label('Data Source')
  .inputProperty('data')
  .width('180px')
  .placeholder('Configure data')
  .handlerType('input')
  .handlerProperty('data')
  .valueHandler(new ComputedValueHandler((ctx) => {
    const selectedComponent = ctx.Utils.first(ctx.$selectedComponents);
    const input = ctx.Editor.getComponentBreakpointInput(selectedComponent, 'data');
    return input?.type === 'handler' ? (input.value || '') : '';
  }))
  .handlerValueGetter(new ComputedValueHandler((ctx) => {
    const selectedComponent = ctx.Utils.first(ctx.$selectedComponents);
    const input = ctx.Editor.getComponentBreakpointInput(selectedComponent, 'data');
    return input?.type === 'handler' ? (input.value || '') : '';
  }))
  .handlerEventUpdate(new CustomEventHandler((ctx) => {
    ctx.updateInput(ctx.Utils.first(ctx.$selectedComponents), 'data', 'handler', ctx.EventData.value);
  }))
  .build();

const sizeProperty = radio('table_size')
  .label('Size')
  .inputProperty('size')
  .width('180px')
  .default('normal')
  .options(sizeOptions)
  .stateHandler(new DefaultStyleStateHandler('size'))
  .onChange(new UpdateStyleHandler('size'))
  .withStyleHandler('size')
  .build();

const selectionModeProperty = radio('table_selectionMode')
  .label('Selection')
  .inputProperty('selectionMode')
  .width('180px')
  .default('')
  .options(selectionModeOptions)
  .stateHandler(new InputStateHandler('selectionMode'))
  .onChange(new UpdateInputHandler('selectionMode', 'value'))
  .withInputHandler('selectionMode')
  .build();

const filterProperty = inputBoolean('table_filter', 'filter', 'Filter').build();
const fixedHeaderProperty = inputBoolean('table_fixedHeader', 'fixedHeader', 'Fixed Header').build();

const expandableProperty = inputText('table_expandable', 'expandable', 'Expandable Row')
  .placeholder('Row property key')
  .build();

const loadingProperty = inputBoolean('table_loading', 'loading', 'Loading').build();

const emptyTextProperty = inputText('table_emptyText', 'emptyText', 'Empty Text')
  .default('No data available')
  .placeholder('Empty state message')
  .build();

const emptyIconProperty = icon('table_emptyIcon')
  .label('Empty Icon')
  .inputProperty('emptyIcon')
  .width('180px')
  .placeholder('Select icon')
  .valueHandler(new ComponentInputHandler('emptyIcon', ''))
  .stateHandler(new InputStateHandler('emptyIcon'))
  .on('iconChanged', new UpdateInputHandler('emptyIcon', 'value'))
  .withInputHandler('emptyIcon')
  .build();

const scrollConfigXProperty = number('table_scrollConfigX')
  .label('Scroll X')
  .inputProperty('scrollConfigX')
  .width('80px')
  .placeholder('width')
  .valueHandler(new ComputedValueHandler((ctx) => {
    const selectedComponent = ctx.Utils.first(ctx.$selectedComponents);
    const input = ctx.Editor.getComponentBreakpointInput(selectedComponent, 'scrollConfig');
    return input?.value?.x || '';
  }))
  .stateHandler(new InputStateHandler('scrollConfig'))
  .onValueChange(new CustomEventHandler((ctx) => {
    const selectedComponent = ctx.Utils.first(ctx.$selectedComponents);
    const input = ctx.Editor.getComponentBreakpointInput(selectedComponent, 'scrollConfig');
    const current = input?.value || {};
    ctx.updateInput(selectedComponent, 'scrollConfig', 'value', { ...current, x: Number(ctx.EventData.value) });
  }))
  .withInputHandler('scrollConfigX')
  .build();

const scrollConfigYProperty = number('table_scrollConfigY')
  .label('Scroll Y')
  .inputProperty('scrollConfigY')
  .width('80px')
  .placeholder('height')
  .valueHandler(new ComputedValueHandler((ctx) => {
    const selectedComponent = ctx.Utils.first(ctx.$selectedComponents);
    const input = ctx.Editor.getComponentBreakpointInput(selectedComponent, 'scrollConfig');
    return input?.value?.y || '';
  }))
  .stateHandler(new InputStateHandler('scrollConfig'))
  .onValueChange(new CustomEventHandler((ctx) => {
    const selectedComponent = ctx.Utils.first(ctx.$selectedComponents);
    const input = ctx.Editor.getComponentBreakpointInput(selectedComponent, 'scrollConfig');
    const current = input?.value || {};
    ctx.updateInput(selectedComponent, 'scrollConfig', 'value', { ...current, y: Number(ctx.EventData.value) });
  }))
  .withInputHandler('scrollConfigY')
  .build();

// === Export ===

export const tableProperties: PropertyDefinition[] = [
  dataProperty,
  sizeProperty,
  selectionModeProperty,
  filterProperty,
  fixedHeaderProperty,
  expandableProperty,
  loadingProperty,
  emptyTextProperty,
  emptyIconProperty,
  scrollConfigXProperty,
  scrollConfigYProperty,
];

export const tableDefinition: ComponentDefinition = {
  type: 'table',
  name: 'Table',
  category: 'data',
  panel: {
    containerUuid: 'table_fields_collapse_container',
    containerName: 'Table Fields Container',
    collapseUuid: 'table_fields_collapse',
    collapseTitle: 'Table Properties',
  },
  properties: tableProperties,
  events: ['rowClick', 'selectionChange', 'sort', 'filter'],
  includeCommonProperties: [
    'component_value_text_block',
    'component_id_text_block',
    'display_block',
    'access_block',
    'component_hash_text_block',
  ],
};

export default tableDefinition;
