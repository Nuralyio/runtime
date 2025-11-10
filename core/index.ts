/**
 * Runtime Core Module
 * 
 * This module provides the core runtime system for Nuraly components,
 * including context management, component lifecycle, and state tracking.
 * 
 * @example
 * ```typescript
 * // Import from core module
 * import { ExecuteInstance, Editor, Navigation } from '@features/runtime/core';
 * 
 * // Access runtime state
 * ExecuteInstance.VarsProxy.username = 'John';
 * const theme = ExecuteInstance.GetVar('theme');
 * ```
 */

export {
  RuntimeInstance,
  // Backward compatibility alias
  ExecuteInstance,
  // Handler execution functions
  executeHandler,
  executeCodeWithClosure
} from './RuntimeContext';

export { default as Editor } from './Editor';
export { Navigation } from './Navigation';
export { FileStorage } from './Storage';
export { Utils } from './Utils';
