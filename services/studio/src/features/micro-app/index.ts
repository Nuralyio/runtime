/**
 * Micro-App Module
 *
 * Self-contained micro-app infrastructure with isolated stores and runtime context.
 * Provides complete isolation between micro-app instances with layered variable scope.
 */

// State management
export { MicroAppStoreContext } from './state/MicroAppStoreContext'
export { MicroAppRuntimeContext } from './state/MicroAppRuntimeContext'
export { MicroAppPageManager } from './state/MicroAppPageManager'
export {
  VariableScopeManager,
  VariableScope,
  type VariableDescriptor
} from './state/VariableScopeManager'
export { SharedVariableRegistry } from './state/SharedVariableRegistry'

// Messaging
export {
  MicroAppMessageBus,
  MessageTypes,
  type Message,
  type MessageHandler,
  type MessageType
} from './messaging/MicroAppMessageBus'

// Utilities
export { ComponentNamespaceManager } from './utils/ComponentNamespaceManager'
