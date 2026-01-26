/**
 * @fileoverview Chatbot Component Properties (TypeScript)
 * @module Studio/Params/Advanced/Chatbot/Properties
 *
 * @description
 * TypeScript-based property definitions for the Chatbot component.
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
  ComputedValueHandler,
} from '../../../core/handlers';
import {
  InputStateHandler,
} from '../../../core/handlers/state-handlers';
import {
  UpdateInputHandler,
} from '../../../core/handlers/event-handlers';

// === Custom Options ===

const positionOptions = [
  { value: 'center-bottom', label: 'Center Bottom' },
  { value: 'bottom-right', label: 'Bottom Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
];

const sizeOptions = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
  { value: 'full', label: 'Full' },
];

const variantOptions = [
  { value: 'default', label: 'Default' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'chatgpt', label: 'ChatGPT' },
];

const messagesDisplayOptions = [
  { value: 'always', label: 'Always' },
  { value: 'never', label: 'Never (Input Only)' },
  { value: 'auto', label: 'Auto (When Messages)' },
];

const loadingIndicatorOptions = [
  { value: 'dots', label: 'Dots' },
  { value: 'spinner', label: 'Spinner' },
  { value: 'wave', label: 'Wave' },
  { value: 'typing', label: 'Typing' },
];

// === Property Definitions ===

const workflowIdProperty = select('chatbot_workflow_id')
  .label('Workflow')
  .inputProperty('workflowId')
  .width('180px')
  .placeholder('Select workflow')
  .valueHandler(new ComponentInputHandler('workflowId', ''))
  .stateHandler(new InputStateHandler('workflowId'))
  .onChange(new UpdateInputHandler('workflowId', 'value'))
  .withInputHandler('workflowId')
  .build();

const socketUrlProperty = inputText('chatbot_socket_url', 'socketUrl', 'Socket URL')
  .placeholder('Auto (current origin)')
  .build();

const titleProperty = inputText('chatbot_title', 'title', 'Title')
  .default('Chat')
  .placeholder('Chat title')
  .build();

const placeholderProperty = inputText('chatbot_placeholder', 'placeholder', 'Placeholder')
  .default('Type your message...')
  .placeholder('Input placeholder')
  .build();

const floatingProperty = inputBoolean('chatbot_floating', 'floating', 'Floating').build();
const draggableProperty = inputBoolean('chatbot_draggable', 'draggable', 'Draggable').build();

const positionProperty = select('chatbot_position')
  .label('Position')
  .inputProperty('position')
  .width('180px')
  .default('center-bottom')
  .placeholder('Select position')
  .options(positionOptions)
  .valueHandler(new ComponentInputHandler('position', 'center-bottom'))
  .stateHandler(new InputStateHandler('position'))
  .onChange(new UpdateInputHandler('position', 'value'))
  .withInputHandler('position')
  .build();

const sizeProperty = select('chatbot_size')
  .label('Size')
  .inputProperty('size')
  .width('180px')
  .default('medium')
  .placeholder('Select size')
  .options(sizeOptions)
  .valueHandler(new ComponentInputHandler('size', 'medium'))
  .stateHandler(new InputStateHandler('size'))
  .onChange(new UpdateInputHandler('size', 'value'))
  .withInputHandler('size')
  .build();

const variantProperty = select('chatbot_variant')
  .label('Variant')
  .inputProperty('variant')
  .width('180px')
  .default('default')
  .placeholder('Select variant')
  .options(variantOptions)
  .valueHandler(new ComponentInputHandler('variant', 'default'))
  .stateHandler(new InputStateHandler('variant'))
  .onChange(new UpdateInputHandler('variant', 'value'))
  .withInputHandler('variant')
  .build();

const messagesDisplayProperty = select('chatbot_messages_display')
  .label('Messages Display')
  .inputProperty('messagesDisplay')
  .width('180px')
  .default('always')
  .placeholder('Select display mode')
  .options(messagesDisplayOptions)
  .valueHandler(new ComponentInputHandler('messagesDisplay', 'always'))
  .stateHandler(new InputStateHandler('messagesDisplay'))
  .onChange(new UpdateInputHandler('messagesDisplay', 'value'))
  .withInputHandler('messagesDisplay')
  .build();

const showCloseButtonProperty = inputBoolean('chatbot_show_close_button', 'showCloseButton', 'Show Close Button').build();

const showSendButtonProperty = inputBoolean('chatbot_show_send_button', 'showSendButton', 'Show Send Button')
  .default(true)
  .build();

const boxedProperty = inputBoolean('chatbot_boxed', 'boxed', 'Boxed Layout').build();

const autoScrollProperty = inputBoolean('chatbot_auto_scroll', 'autoScroll', 'Auto Scroll')
  .default(true)
  .build();

const disabledProperty = inputBoolean('chatbot_disabled', 'disabled', 'Disabled').build();
const rtlProperty = inputBoolean('chatbot_rtl', 'isRTL', 'RTL').build();
const enableFileUploadProperty = inputBoolean('chatbot_enable_file_upload', 'enableFileUpload', 'Enable File Upload').build();
const showThreadsProperty = inputBoolean('chatbot_show_threads', 'showThreads', 'Show Threads').build();
const enableThreadCreationProperty = inputBoolean('chatbot_enable_thread_creation', 'enableThreadCreation', 'Enable Thread Creation').build();

const loadingIndicatorProperty = select('chatbot_loading_indicator')
  .label('Loading Indicator')
  .inputProperty('loadingIndicator')
  .width('180px')
  .default('dots')
  .placeholder('Select type')
  .options(loadingIndicatorOptions)
  .valueHandler(new ComponentInputHandler('loadingIndicator', 'dots'))
  .stateHandler(new InputStateHandler('loadingIndicator'))
  .onChange(new UpdateInputHandler('loadingIndicator', 'value'))
  .withInputHandler('loadingIndicator')
  .build();

const loadingTextProperty = inputText('chatbot_loading_text', 'loadingText', 'Loading Text')
  .default('Bot is typing...')
  .placeholder('Loading text')
  .build();

const debugProperty = inputBoolean('chatbot_debug', 'debug', 'Debug Mode').build();

const executionIdVariableProperty = inputText('chatbot_execution_id_variable', 'executionIdVariable', 'Execution ID Variable')
  .default('chatbot_execution_id')
  .placeholder('Variable name for execution ID')
  .build();

// === Export ===

export const chatbotProperties: PropertyDefinition[] = [
  workflowIdProperty,
  socketUrlProperty,
  titleProperty,
  placeholderProperty,
  floatingProperty,
  draggableProperty,
  positionProperty,
  sizeProperty,
  variantProperty,
  messagesDisplayProperty,
  showCloseButtonProperty,
  showSendButtonProperty,
  boxedProperty,
  autoScrollProperty,
  disabledProperty,
  rtlProperty,
  enableFileUploadProperty,
  showThreadsProperty,
  enableThreadCreationProperty,
  loadingIndicatorProperty,
  loadingTextProperty,
  debugProperty,
  executionIdVariableProperty,
];

export const chatbotDefinition: ComponentDefinition = {
  type: 'chatbot',
  name: 'Chatbot',
  category: 'advanced',
  panel: {
    containerUuid: 'chatbot_collapse_container',
    containerName: 'Chatbot Fields Container',
    collapseUuid: 'chatbot_collapse',
    collapseTitle: 'Chatbot Properties',
  },
  properties: chatbotProperties,
  events: ['message', 'send', 'receive', 'error'],
  includeCommonProperties: [
    'component_value_text_block',
    'component_id_text_block',
    'display_block',
    'access_block',
    'component_hash_text_block',
  ],
};

export default chatbotDefinition;
