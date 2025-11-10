/**
 * Runtime Kernel Module
 * 
 * This module provides handler execution utilities for the Nuraly runtime system.
 * Handlers are JavaScript code strings from component properties that are compiled
 * and executed with full runtime context.
 * 
 * @example
 * ```typescript
 * // Import from kernel module
 * import { executeHandler, compileHandlerFunction } from '@features/runtime/kernel';
 * 
 * // Execute a handler
 * const result = executeHandler(component, "GetVar('username')", { event: clickEvent });
 * ```
 */

// Main handler executor
export {
  executeHandler
} from './handler-executor';

// Handler compiler
export {
  compileHandlerFunction,
  clearHandlerCache,
  getHandlerCacheSize,
  HANDLER_PARAMETERS
} from './compiler';

// Context management
export {
  setupRuntimeContext,
  extractRuntimeContext
} from './context-setup';

// Global functions
export {
  createGlobalHandlerFunctions,
  registerGlobalFunctionsToExecuteInstance
} from './global-functions';
