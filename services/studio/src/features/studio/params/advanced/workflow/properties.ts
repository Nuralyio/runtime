/**
 * @fileoverview Workflow Component Properties (TypeScript)
 * @module Studio/Params/Advanced/Workflow/Properties
 *
 * @description
 * TypeScript-based property definitions for the Workflow component.
 * Migrated from config.json to fully typed definitions.
 */

import {
  text,
  number,
  textarea,
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

const triggerTypeOptions = [
  { value: 'manual', label: 'Manual' },
  { value: 'on_event', label: 'On Event' },
  { value: 'on_load', label: 'On Load' },
  { value: 'on_submit', label: 'On Submit' },
];

// === Property Definitions ===

const workflowIdProperty = select('workflow_id')
  .label('Workflow')
  .inputProperty('workflowId')
  .width('180px')
  .placeholder('Select workflow')
  .valueHandler(new ComponentInputHandler('workflowId', ''))
  .stateHandler(new InputStateHandler('workflowId'))
  .onChange(new UpdateInputHandler('workflowId', 'value'))
  .withInputHandler('workflowId')
  .build();

const triggerTypeProperty = select('workflow_trigger_type')
  .label('Trigger Type')
  .inputProperty('triggerType')
  .width('180px')
  .default('manual')
  .placeholder('Select trigger')
  .options(triggerTypeOptions)
  .valueHandler(new ComponentInputHandler('triggerType', 'manual'))
  .stateHandler(new InputStateHandler('triggerType'))
  .onChange(new UpdateInputHandler('triggerType', 'value'))
  .withInputHandler('triggerType')
  .build();

const autoExecuteProperty = inputBoolean('workflow_auto_execute', 'autoExecute', 'Auto Execute').build();

const inputMappingProperty = textarea('workflow_input_mapping')
  .label('Input Mapping')
  .inputProperty('inputMapping')
  .width('180px')
  .default('{}')
  .placeholder('JSON input mapping')
  .valueHandler(new ComponentInputHandler('inputMapping', '{}'))
  .stateHandler(new InputStateHandler('inputMapping'))
  .onChange(new UpdateInputHandler('inputMapping', 'value'))
  .withInputHandler('inputMapping')
  .build();

const outputVariableProperty = inputText('workflow_output_variable', 'outputVariable', 'Output Variable')
  .placeholder('Variable name')
  .build();

const showStatusProperty = inputBoolean('workflow_show_status', 'showStatus', 'Show Status')
  .default(true)
  .build();

const timeoutProperty = number('workflow_timeout')
  .label('Timeout (ms)')
  .inputProperty('timeout')
  .width('180px')
  .default(30000 as any)
  .placeholder('30000')
  .valueHandler(new ComponentInputHandler('timeout', 30000))
  .stateHandler(new InputStateHandler('timeout'))
  .onChange(new UpdateInputHandler('timeout', 'value'))
  .withInputHandler('timeout')
  .build();

const readonlyProperty = inputBoolean('workflow_readonly', 'readonly', 'Read Only').build();

const executionIdProperty = inputText('workflow_execution_id', 'executionId', 'Execution ID')
  .placeholder('{{chatbot_execution_id}}')
  .build();

// === Export ===

export const workflowProperties: PropertyDefinition[] = [
  workflowIdProperty,
  triggerTypeProperty,
  autoExecuteProperty,
  inputMappingProperty,
  outputVariableProperty,
  showStatusProperty,
  timeoutProperty,
  readonlyProperty,
  executionIdProperty,
];

export const workflowDefinition: ComponentDefinition = {
  type: 'workflow',
  name: 'Workflow',
  category: 'advanced',
  panel: {
    containerUuid: 'workflow_collapse_container',
    containerName: 'Workflow Fields Container',
    collapseUuid: 'workflow_collapse',
    collapseTitle: 'Workflow Properties',
  },
  properties: workflowProperties,
  events: ['start', 'complete', 'error', 'progress'],
  includeCommonProperties: [
    'component_value_text_block',
    'component_id_text_block',
    'display_block',
    'access_block',
    'component_hash_text_block',
  ],
};

export default workflowDefinition;
