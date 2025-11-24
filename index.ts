/**
 * @module Runtime
 * @description Nuraly Runtime System - Core execution engine for the visual web application builder
 * 
 * The Runtime System is responsible for:
 * - **Handler Execution**: Compiling and executing JavaScript code from component properties
 * - **State Management**: Reactive state with proxy-based change detection
 * - **Component Lifecycle**: Managing component registration, hierarchy, and relationships
 * - **Runtime API**: Providing rich APIs for components to interact with the system
 * - **Editor Integration**: Connecting studio editor with runtime execution environment
 * 
 * @example Basic Usage
 * ```typescript
 * import { executeHandler, ExecuteInstance, Editor } from '@features/runtime';
 * 
 * // Execute a handler
 * const result = executeHandler(component, "GetVar('username')", { event: clickEvent });
 * 
 * // Access runtime state
 * ExecuteInstance.VarsProxy.username = 'John Doe';
 * const theme = ExecuteInstance.GetVar('theme');
 * 
 * // Check editor mode
 * if (Editor.getEditorMode()) {
 *   console.log('Running in editor mode');
 * }
 * ```
 * 
 * @example Advanced Usage - Creating Dynamic Applications
 * ```typescript
 * import { executeHandler, ExecuteInstance } from '@features/runtime';
 * 
 * // Handler code for dynamic component behavior
 * const handlerCode = `
 *   const count = GetVar('count') || 0;
 *   SetVar('count', count + 1);
 *   updateInput(Current, 'text', 'static', \`Clicked \${count + 1} times\`);
 * `;
 * 
 * // Execute handler when button is clicked
 * executeHandler(buttonComponent, handlerCode, { event: clickEvent });
 * ```
 * 
 * @see {@link ./README.md} for comprehensive documentation
 * @see {@link ./handlers/README.md} for handler execution details
 * @see {@link ./state/README.md} for state management details
 */

// ============================================================================
// Core Runtime Context and State Management
// ============================================================================

/**
 * RuntimeInstance - Main singleton instance of the RuntimeContext
 * @see {@link RuntimeContext} in ./state/runtime-context.ts
 */
export {
  RuntimeInstance,
  ExecuteInstance,
  Editor,
  RuntimeHelpers
} from './state';

// ============================================================================
// Handler Execution System
// ============================================================================

/**
 * Handler execution utilities for compiling and running component handlers
 * @see {@link executeHandler} in ./handlers/handler-executor.ts
 * @see {@link compileHandlerFunction} in ./handlers/compiler.ts
 * @see {@link getContextFromComponent} in ./handlers/handler-executor.ts
 */
export {
  executeHandler,
  getContextFromComponent,
  compileHandlerFunction
} from './handlers';

// ============================================================================
// Runtime Components
// ============================================================================

/**
 * MicroApp component - Renders isolated micro-applications
 * @see {@link MicroApp} in @shared/ui/components/runtime/MicroApp/MicroApp.ts
 */
export { MicroApp } from '@shared/ui/components/runtime/MicroApp/MicroApp';
