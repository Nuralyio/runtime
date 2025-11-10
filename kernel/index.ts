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

export {
  executeHandler,
  compileHandlerFunction,
  // Backward compatibility aliases
  executeCodeWithClosure,
  prepareClosureFunction
} from './HandlerExecutor';
