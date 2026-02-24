/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

// Core controller
export { ChatbotCoreController } from './chatbot-core.controller.js';

// Event bus
export { EventBus } from './event-bus.js';

// Handlers (domain operations)
export {
  StateHandler,
  MessageHandler,
  ThreadHandler,
  FileHandler,
  ModuleHandler,
  SuggestionHandler
} from './handlers/index.js';

// Services (infrastructure)
export {
  ProviderService,
  ValidationService,
  StorageService,
  PluginService
} from './services/index.js';

// Types and interfaces
export type {
  ChatbotState,
  ChatbotUICallbacks,
  ChatbotContext,
  SendMessageOptions,
  ValidationResult,
  ChatbotCoreConfig,
  ProviderCapabilities,
  ProviderConfig,
  ChatbotProvider,
  ChatbotStorage,
  ChatbotPlugin,
  ChatbotEvents
} from './types.js';

export { ValidationError } from './types.js';
