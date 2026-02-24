/**
 * @module Runtime/Handlers
 * @description Handler Execution System for Nuraly Runtime
 * 
 * This module provides the complete handler execution infrastructure for the
 * Nuraly visual application builder. It enables dynamic JavaScript execution
 * within component properties with full access to the runtime API.
 * 
 * **What Are Handlers?**
 * Handlers are JavaScript code strings stored in component properties that are
 * compiled and executed at runtime. They power dynamic behavior in Nuraly apps:
 * - Input values: `input.text = { type: "handler", value: "GetVar('title')" }`
 * - Style values: `style.color = { type: "handler", value: "GetVar('theme').primary" }`
 * - Event handlers: `event.onClick = "NavigateToPage('Dashboard')"`
 * 
 * **Architecture:**
 * ```
 * Handler Execution Flow:
 * 
 * Component Property     →  Handler String
 *         │                      │
 *         │                      ▼
 *         │              Compiler (with cache)
 *         │                      │
 *         │                      ▼
 *         │              Compiled Function
 *         │                      │
 *         ▼                      ▼
 * Context Setup    →    Handler Executor    ←   Runtime API
 *         │                      │                    │
 *         │                      ▼                    │
 *         └──────────────►  Execution  ◄─────────────┘
 *                              │
 *                              ▼
 *                          Result
 * ```
 * 
 * **Key Components:**
 * - **Compiler** (`compiler.ts`): Compiles handler strings into functions with caching
 * - **Executor** (`handler-executor.ts`): Orchestrates execution with full context
 * - **Context Setup** (`context-setup.ts`): Prepares component state and proxies
 * - **Runtime API** (`runtime-api/`): Provides global functions for handler code
 * 
 * **Performance Features:**
 * - ✅ Function compilation caching (>95% cache hit rate)
 * - ✅ Proxy caching for styles and values
 * - ✅ Lazy context initialization
 * - ✅ SSR skipping (client-side only execution)
 * 
 * @example Basic Handler Execution
 * ```typescript
 * import { executeHandler } from './';
 * 
 * // Simple handler
 * const result = executeHandler(
 *   component,
 *   "return GetVar('username') || 'Guest'",
 *   { event: clickEvent }
 * );
 * console.log(result); // "Guest"
 * ```
 * 
 * @example Complex Handler with Multiple Operations
 * ```typescript
 * import { executeHandler } from './';
 * 
 * const complexHandler = `
 *   // Get current count
 *   const count = GetVar('count') || 0;
 *   
 *   // Increment
 *   SetVar('count', count + 1);
 *   
 *   // Update UI
 *   updateInput(Current, 'text', 'static', \`Count: \${count + 1}\`);
 *   
 *   // Navigate at threshold
 *   if (count + 1 >= 10) {
 *     NavigateToPage('Congratulations');
 *   }
 *   
 *   return count + 1;
 * `;
 * 
 * const newCount = executeHandler(buttonComponent, complexHandler, { event: clickEvent });
 * ```
 * 
 * @example Async Handler with Backend Call
 * ```typescript
 * const asyncHandler = `
 *   const userId = GetVar('currentUserId');
 *   const userData = await InvokeFunction('getUserData', { id: userId });
 *   
 *   SetVar('currentUser', userData);
 *   updateInput(Current, 'userName', 'static', userData.name);
 *   
 *   return userData;
 * `;
 * 
 * const userData = await executeHandler(component, asyncHandler);
 * ```
 * 
 * @example Compilation and Caching
 * ```typescript
 * import { compileHandlerFunction, getHandlerCacheSize } from './';
 * 
 * const code = "return GetVar('username')";
 * 
 * // First call: compiles and caches
 * const fn1 = compileHandlerFunction(code);
 * 
 * // Second call: retrieves from cache (fast)
 * const fn2 = compileHandlerFunction(code);
 * 
 * console.log(fn1 === fn2); // true (same function object)
 * console.log(getHandlerCacheSize()); // 1
 * ```
 * 
 * @see {@link executeHandler} Main handler execution function
 * @see {@link compileHandlerFunction} Handler compilation with caching
 * @see {@link setupRuntimeContext} Context initialization
 * @see {@link createGlobalHandlerFunctions} Runtime API function creation
 */

// ============================================================================
// Main Handler Executor
// ============================================================================

/**
 * Main function for executing handlers with full runtime context.
 * This is the primary entry point for all handler execution.
 *
 * @see {@link handler-executor.ts} for implementation details
 */
export {
  executeHandler,
  getContextFromComponent
} from './handler-executor';

// ============================================================================
// Handler Compiler
// ============================================================================

/**
 * Handler compilation utilities with automatic caching.
 * Compiles JavaScript code strings into executable functions.
 *
 * @see {@link compiler.ts} for implementation details
 */
export {
  compileHandlerFunction,
  clearHandlerCache,
  getHandlerCacheSize,
  HANDLER_PARAMETERS,
  setTransparentVarsEnabled,
  isTransparentVarsEnabled,
  createHandlerScope
} from './compiler';

// ============================================================================
// Context Management
// ============================================================================

/**
 * Runtime context setup and extraction utilities.
 * Prepares component state, proxies, and event data before execution.
 * 
 * @see {@link context-setup.ts} for implementation details
 */
export {
  setupRuntimeContext,
  extractRuntimeContext
} from './context-setup';

// ============================================================================
// Global Functions (Runtime API)
// ============================================================================

/**
 * Global function creation for handler code.
 * Creates all GetVar, SetVar, NavigateToPage, etc. functions.
 *
 * @see {@link runtime-api/index.ts} for implementation details
 */
export {
  createGlobalHandlerFunctions
} from './runtime-api';

// ============================================================================
// Namespaced Handler API
// ============================================================================

/**
 * Namespaced Handler API for clean, organized access to runtime functions.
 * Provides Nav, UI, Component, Data, Page, App, Var namespaces.
 *
 * @see {@link handler-api.ts} for type definitions
 * @see {@link handler-api-factory.ts} for factory implementation
 */
export {
  createHandlerAPI,
  extractLegacyParameters
} from './handler-api-factory';

export type {
  HandlerAPI,
  NavAPI,
  UIAPI,
  ComponentAPI,
  DataAPI,
  PageAPI,
  AppAPI,
  EditorAPI,
  VarAPI,
  ToastType
} from './handler-api';
