/**
 * @fileoverview Dropdown Component Properties (TypeScript)
 * @module Studio/Params/Navigation/Dropdown/Properties
 *
 * @description
 * TypeScript-based property definitions for the Dropdown component.
 * Migrated from config.json to fully typed definitions.
 */

import {
  text,
  select,
  event,
  inputText,
  inputBoolean,
  type PropertyDefinition,
  type ComponentDefinition,
} from '../../../core/properties';
import {
  ComponentInputHandler,
  ComputedValueHandler,
} from '../../../core/handlers';
import {
  InputStateHandler,
} from '../../../core/handlers/state-handlers';
import {
  UpdateInputHandler,
  CustomEventHandler,
} from '../../../core/handlers/event-handlers';

// === Custom Options ===

const modeOptions = [
  { value: 'options', label: 'Options' },
  { value: 'content', label: 'Content' },
];

const placementOptions = [
  { value: 'bottom', label: 'Bottom' },
  { value: 'bottom-start', label: 'Bottom Start' },
  { value: 'bottom-end', label: 'Bottom End' },
  { value: 'top', label: 'Top' },
  { value: 'top-start', label: 'Top Start' },
  { value: 'top-end', label: 'Top End' },
];

const triggerOptions = [
  { value: 'click', label: 'Click' },
  { value: 'hover', label: 'Hover' },
  { value: 'focus', label: 'Focus' },
  { value: 'manual', label: 'Manual' },
];

// === Property Definitions ===

const modeProperty = select('dropdown_mode')
  .label('Mode')
  .inputProperty('mode')
  .width('180px')
  .default('options')
  .placeholder('Select mode')
  .options(modeOptions)
  .valueHandler(new ComponentInputHandler('mode', 'options'))
  .stateHandler(new InputStateHandler('mode'))
  .onChange(new UpdateInputHandler('mode', 'value'))
  .build();

const editorOpenProperty = inputBoolean('dropdown_editor_open', 'editorOpen', 'Editor Open').build();

const optionsProperty = event('options')
  .label('Options')
  .valueHandler(new ComputedValueHandler((ctx) => {
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
  .on('codeChange', new CustomEventHandler((ctx) => {
    const selectedComponent = ctx.Utils.first(ctx.$selectedComponents);
    if (ctx.EventData.value !== selectedComponent?.input?.options?.value) {
      if (selectedComponent?.input?.options?.type !== 'handler') {
        ctx.updateInput(selectedComponent, 'options', selectedComponent?.input?.options?.type, JSON.parse(ctx.EventData.value));
      } else {
        ctx.updateInput(selectedComponent, 'options', 'handler', ctx.EventData.value);
      }
    }
  }))
  .build();

const labelProperty = inputText('dropdown_label', 'label', 'Label')
  .default('Dropdown')
  .placeholder('Button label')
  .build();

const placementProperty = select('dropdown_placement')
  .label('Placement')
  .inputProperty('placement')
  .width('180px')
  .default('bottom')
  .placeholder('Select placement')
  .options(placementOptions)
  .valueHandler(new ComponentInputHandler('placement', 'bottom'))
  .onChange(new UpdateInputHandler('placement', 'value'))
  .build();

const triggerProperty = select('dropdown_trigger')
  .label('Trigger')
  .inputProperty('trigger')
  .width('180px')
  .default('click')
  .placeholder('Select trigger')
  .options(triggerOptions)
  .valueHandler(new ComponentInputHandler('trigger', 'click'))
  .onChange(new UpdateInputHandler('trigger', 'value'))
  .build();

// === Export ===

export const dropdownProperties: PropertyDefinition[] = [
  modeProperty,
  editorOpenProperty,
  optionsProperty,
  labelProperty,
  placementProperty,
  triggerProperty,
];

export const dropdownDefinition: ComponentDefinition = {
  type: 'dropdown',
  name: 'Dropdown',
  category: 'navigation',
  panel: {
    containerUuid: 'dropdown_collapse_container',
    containerName: 'Dropdown Fields Container',
    collapseUuid: 'dropdown_collapse',
    collapseTitle: 'Dropdown Properties',
  },
  properties: dropdownProperties,
  events: ['open', 'close', 'select'],
  includeCommonProperties: [
    'component_value_text_block',
    'component_id_text_block',
    'display_block',
    'access_block',
    'component_hash_text_block',
  ],
};

export default dropdownDefinition;
