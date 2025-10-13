/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

// Main component export
export * from './chatbot.component.js';

// Types and interfaces
export * from './chatbot.types.js';

// Core Controller (NEW - Framework Agnostic)
export * from './core/index.js';

// Providers
export * from './providers/index.js';

// Plugins
export * from './plugins/index.js';

// Storage
export * from './storage/index.js';

// Controllers (Lit-specific)
export * from './controllers/index.js';

// Interfaces
export * from './interfaces/index.js';

// Sub-components
export * from './chatbot-fab-container/chatbot-fab-container.component.js';
export * from './chatbot-agent/chatbot-agent.component.js';

// Services
export * from './shared/services/chat.service.js';

// Legacy exports for backward compatibility
export { Message } from './shared/interfaces/message.interface.js';
export { Sender } from './shared/interfaces/sender.enum.js';
