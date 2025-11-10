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
  ExecuteInstance,
  executeHandler
} from './runtime-context';

export { default as Editor } from './editor';
export { Navigation } from './navigation';
export { FileStorage } from './storage';
export { Utils } from './utils';
