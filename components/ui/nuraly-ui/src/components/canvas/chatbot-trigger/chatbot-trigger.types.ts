/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

/**
 * Chatbot trigger event types
 */
export enum ChatbotTriggerEvent {
  MESSAGE_RECEIVED = 'MESSAGE_RECEIVED',
  MESSAGE_SENT = 'MESSAGE_SENT',
  SUGGESTION_CLICKED = 'SUGGESTION_CLICKED',
  FILE_UPLOADED = 'FILE_UPLOADED',
  THREAD_CREATED = 'THREAD_CREATED',
  MODULE_SELECTED = 'MODULE_SELECTED',
  SESSION_STARTED = 'SESSION_STARTED',
}

/**
 * Chatbot trigger event metadata
 */
export interface ChatbotTriggerEventMeta {
  value: ChatbotTriggerEvent;
  label: string;
  icon: string;
  description: string;
}

/**
 * Available trigger events with metadata
 */
export const CHATBOT_TRIGGER_EVENTS: ChatbotTriggerEventMeta[] = [
  { value: ChatbotTriggerEvent.MESSAGE_SENT, label: 'Message Sent', icon: 'send', description: 'When user sends a message' },
  { value: ChatbotTriggerEvent.MESSAGE_RECEIVED, label: 'Message Received', icon: 'message-square', description: 'When bot receives a message' },
  { value: ChatbotTriggerEvent.SUGGESTION_CLICKED, label: 'Suggestion Clicked', icon: 'mouse-pointer', description: 'When user clicks a suggestion' },
  { value: ChatbotTriggerEvent.FILE_UPLOADED, label: 'File Uploaded', icon: 'upload', description: 'When user uploads a file' },
  { value: ChatbotTriggerEvent.THREAD_CREATED, label: 'Thread Created', icon: 'message-circle', description: 'When a new thread is created' },
  { value: ChatbotTriggerEvent.MODULE_SELECTED, label: 'Module Selected', icon: 'grid', description: 'When user selects a module' },
  { value: ChatbotTriggerEvent.SESSION_STARTED, label: 'Session Started', icon: 'play', description: 'When chat session starts' },
];

/**
 * Chatbot size options
 */
export type ChatbotTriggerSize = 'small' | 'medium' | 'large' | 'full';

/**
 * Chatbot variant options
 */
export type ChatbotTriggerVariant = 'default' | 'minimal' | 'rounded' | 'chatgpt';

/**
 * Chatbot loading indicator types
 */
export type ChatbotTriggerLoadingType = 'dots' | 'spinner' | 'wave' | 'typing';

/**
 * Message filter condition
 */
export interface MessageFilterCondition {
  field: 'text' | 'sender' | 'hasFiles' | 'metadata';
  operator: 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'matches' | 'exists';
  value?: string;
}

/**
 * Suggestion configuration
 */
export interface SuggestionConfig {
  id: string;
  text: string;
  icon?: string;
  description?: string;
}

/**
 * Module configuration for chatbot
 */
export interface ModuleConfig {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  enabled: boolean;
}

/**
 * Chatbot trigger node configuration
 */
export interface ChatbotTriggerConfiguration {
  // Trigger settings
  triggerEvents: ChatbotTriggerEvent[];
  messageFilter: MessageFilterCondition[] | null;

  // Chatbot appearance
  size: ChatbotTriggerSize;
  variant: ChatbotTriggerVariant;
  placeholder: string;
  loadingIndicator: ChatbotTriggerLoadingType;
  loadingText: string;

  // Features
  enableFileUpload: boolean;
  enableThreads: boolean;
  enableSuggestions: boolean;
  enableModules: boolean;
  boxedLayout: boolean;

  // Execution behavior
  alwaysOpenPlan: boolean;

  // Suggestions
  suggestions: SuggestionConfig[];

  // Modules
  modules: ModuleConfig[];

  // Welcome message
  welcomeMessage: string;

  // Output
  outputVariable: string;
}

/**
 * Default configuration for Chatbot Trigger nodes
 */
export const DEFAULT_CHATBOT_TRIGGER_CONFIG: ChatbotTriggerConfiguration = {
  triggerEvents: [ChatbotTriggerEvent.MESSAGE_SENT],
  messageFilter: null,
  size: 'medium',
  variant: 'default',
  placeholder: 'Type your message...',
  loadingIndicator: 'dots',
  loadingText: 'Processing...',
  enableFileUpload: false,
  enableThreads: false,
  enableSuggestions: true,
  enableModules: false,
  boxedLayout: false,
  alwaysOpenPlan: false,
  suggestions: [],
  modules: [],
  welcomeMessage: '',
  outputVariable: 'chatMessage',
};

/**
 * Output data structure from chatbot trigger
 */
export interface ChatbotTriggerOutput {
  event: ChatbotTriggerEvent;
  message?: {
    id: string;
    text: string;
    sender: 'user' | 'bot' | 'system';
    timestamp: string;
    files?: Array<{
      id: string;
      name: string;
      type: string;
      size: number;
      url?: string;
    }>;
    metadata?: Record<string, unknown>;
  };
  suggestion?: {
    id: string;
    text: string;
  };
  file?: {
    id: string;
    name: string;
    type: string;
    size: number;
    url?: string;
  };
  thread?: {
    id: string;
    title: string;
  };
  module?: {
    id: string;
    name: string;
  };
  selectedModules?: string[];
  sessionId?: string;
}

/**
 * Configuration section definition
 */
export interface ChatbotConfigSection {
  id: string;
  title: string;
  description?: string;
  collapsed?: boolean;
}

/**
 * Chatbot trigger configuration sections
 */
export const CHATBOT_TRIGGER_SECTIONS: ChatbotConfigSection[] = [
  { id: 'trigger', title: 'Trigger', description: 'Configure when the workflow should trigger' },
  { id: 'appearance', title: 'Appearance', description: 'Customize the chatbot look and feel' },
  { id: 'features', title: 'Features', description: 'Enable or disable chatbot features' },
  { id: 'suggestions', title: 'Suggestions', description: 'Configure quick action suggestions' },
  { id: 'welcome', title: 'Welcome', description: 'Set up the welcome message' },
  { id: 'output', title: 'Output', description: 'Configure output variable' },
];

/**
 * Validate Chatbot Trigger configuration
 */
export interface ValidationError {
  field: string;
  message: string;
}

export function validateChatbotTriggerConfig(config: ChatbotTriggerConfiguration): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!config.triggerEvents || config.triggerEvents.length === 0) {
    errors.push({ field: 'triggerEvents', message: 'At least one trigger event is required' });
  }

  if (!config.outputVariable || config.outputVariable.trim() === '') {
    errors.push({ field: 'outputVariable', message: 'Output variable name is required' });
  }

  return errors;
}

/**
 * Generate preview text for Chatbot Trigger node
 */
export function generateChatbotTriggerPreview(config: ChatbotTriggerConfiguration): string {
  const eventCount = config.triggerEvents.length;
  if (eventCount === 0) {
    return 'Configure trigger events';
  }

  if (eventCount === 1) {
    const event = CHATBOT_TRIGGER_EVENTS.find(e => e.value === config.triggerEvents[0]);
    return `On ${event?.label || config.triggerEvents[0]}`;
  }

  return `On ${eventCount} events`;
}
