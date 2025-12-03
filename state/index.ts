/**
 * Runtime State Module
 * 
 * This module provides the core runtime state system for Nuraly components,
 * including context management, component lifecycle, and state tracking.
 * 
 * @example
 * ```typescript
 * // Import from state module
 * import { ExecuteInstance, Editor } from './';
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
export { RuntimeHelpers } from '../utils/runtime-helpers';
