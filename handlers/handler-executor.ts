/**
 * @fileoverview Handler Executor
 * @module Runtime/Handlers/Executor
 * 
 * @description
 * Main orchestrator for executing component handlers with full runtime context.
 * 
 * This module is the bridge between component properties (input, style, event) and
 * the runtime execution environment. It coordinates:
 * - Runtime context setup (component state, parent relationships, proxies)
 * - Global function creation (GetVar, NavigateToPage, etc.)
 * - Handler compilation (via compiler module)
 * - Function execution with all required parameters
 * - Error handling and logging
 * 
 * **Execution Flow:**
 * ```
 * Component Event/Property Access
 *         │
 *         ▼
 * executeHandler(component, code, eventData, item)
 *         │
 *         ├─▶ Setup Runtime Context (setupRuntimeContext)
 *         │   - Set Current component
 *         │   - Attach values property
 *         │   - Create style proxy
 *         │   - Set event data
 *         │
 *         ├─▶ Extract Runtime Context (extractRuntimeContext)
 *         │   - Get Apps, Vars, Current, Values, etc.
 *         │
 *         ├─▶ Create Global Functions (createGlobalHandlerFunctions)
 *         │   - GetVar, SetVar, NavigateToPage, etc.
 *         │
 *         ├─▶ Compile Handler (compileHandlerFunction)
 *         │   - Check cache
 *         │   - Compile if needed
 *         │   - Return function
 *         │
 *         └─▶ Execute Function
 *             - Pass all 50+ parameters
 *             - Return result
 * ```
 * 
 * @example Basic Handler Execution
 * ```typescript
 * import { executeHandler } from './handler-executor';
 * 
 * const component = {
 *   uuid: 'btn-123',
 *   application_id: 'app-1',
 *   name: 'SubmitButton',
 *   event: { onClick: "NavigateToPage('Dashboard')" }
 * };
 * 
 * // Execute onClick handler
 * executeHandler(
 *   component,
 *   component.event.onClick,
 *   { event: clickEvent }
 * );
 * ```
 * 
 * @example Handler with Return Value
 * ```typescript
 * const displayNameHandler = "return GetVar('firstName') + ' ' + GetVar('lastName')";
 * const fullName = executeHandler(component, displayNameHandler);
 * console.log(fullName); // "John Doe"
 * ```
 * 
 * @example Collection Item Handler
 * ```typescript
 * // Handler for items in a collection (e.g., list items)
 * const itemHandler = "return Item.title.toUpperCase()";
 * 
 * collectionItems.forEach(item => {
 *   const result = executeHandler(
 *     collectionComponent,
 *     itemHandler,
 *     {},
 *     item // Item data available as "Item" parameter in handler
 *   );
 *   console.log(result);
 * });
 * ```
 */

import { RuntimeHelpers } from '@shared/utils/runtime-helpers';
import { isServer } from '@shared/utils/envirement';
import { eventDispatcher } from '@shared/utils/change-detection';
import Editor from '../state/editor';
import Database from '@nuraly/dbclient';

import { compileHandlerFunction } from './compiler';
import { setupRuntimeContext, extractRuntimeContext } from './context-setup';
import { createGlobalHandlerFunctions, registerGlobalFunctionsToExecuteInstance } from './runtime-api';

/**
 * Executes a component handler with full runtime context.
 * 
 * @description
 * This is the main entry point for handler execution. It orchestrates the entire
 * execution pipeline from context setup through function compilation to execution.
 * 
 * **What this function does:**
 * 1. Sets up runtime context (component state, proxies, event data)
 * 2. Extracts current runtime state (Apps, Vars, Current, etc.)
 * 3. Creates global functions available to handler code
 * 4. Compiles the handler code into an executable function (with caching)
 * 5. Executes the function with all runtime parameters
 * 6. Returns the result (or undefined if no return statement)
 * 
 * **SSR Behavior:**
 * - Handlers are NOT executed on the server (returns undefined immediately)
 * - This prevents side effects during SSR and ensures client-only execution
 * 
 * **Error Handling:**
 * - Syntax errors in handler code throw during compilation
 * - Runtime errors in handler code are thrown during execution
 * - Use try-catch in handler code for custom error handling
 * 
 * @param {any} component - The component context for execution
 *   Must have: uuid, application_id, name, input, style, event
 * 
 * @param {string} code - The handler code string to execute (JavaScript)
 *   Can include any valid JavaScript including async/await, if/else, loops, etc.
 * 
 * @param {any} [EventData={}] - Event data passed to the handler
 *   Typically contains: { event: DOMEvent, ... }
 *   Available as "Event" parameter in handler code
 * 
 * @param {any} [item={}] - Collection item data for handlers in collections
 *   Available as "Item" parameter in handler code
 *   Used when rendering lists/collections where each item needs custom behavior
 * 
 * @returns {any} The result of executing the handler (return value from handler code)
 *   Can be any JavaScript value: string, number, object, array, Promise, undefined, etc.
 * 
 * @example Simple Variable Access
 * ```typescript
 * const result = executeHandler(
 *   component,
 *   "return GetVar('username') || 'Guest'",
 *   {}
 * );
 * console.log(result); // "Guest" (if variable not set)
 * ```
 * 
 * @example Event Handler
 * ```typescript
 * // onClick handler
 * const clickHandler = `
 *   const count = GetVar('clickCount') || 0;
 *   SetVar('clickCount', count + 1);
 *   console.log('Button clicked:', count + 1, 'times');
 * `;
 * 
 * buttonElement.addEventListener('click', (event) => {
 *   executeHandler(buttonComponent, clickHandler, { event });
 * });
 * ```
 * 
 * @example Async Handler
 * ```typescript
 * const asyncHandler = `
 *   const userId = GetVar('currentUserId');
 *   const userData = await InvokeFunction('getUser', { id: userId });
 *   SetVar('userData', userData);
 *   updateInput(Current, 'displayName', 'static', userData.name);
 *   return userData;
 * `;
 * 
 * // Note: await needed because handler uses async operations
 * const userData = await executeHandler(component, asyncHandler);
 * ```
 * 
 * @example Collection Item Handler
 * ```typescript
 * // Handler that operates on each item in a collection
 * const itemHandler = `
 *   return {
 *     displayTitle: Item.title.toUpperCase(),
 *     isNew: (Date.now() - new Date(Item.createdAt)) < 86400000,
 *     authorName: Item.author.firstName + ' ' + Item.author.lastName
 *   };
 * `;
 * 
 * const items = [
 *   { title: 'First Post', createdAt: '2024-01-01', author: { firstName: 'John', lastName: 'Doe' } },
 *   { title: 'Second Post', createdAt: '2024-01-02', author: { firstName: 'Jane', lastName: 'Smith' } }
 * ];
 * 
 * items.forEach(item => {
 *   const result = executeHandler(component, itemHandler, {}, item);
 *   console.log(result);
 * });
 * ```
 * 
 * @example Error Handling in Handler Code
 * ```typescript
 * const safeHandler = `
 *   try {
 *     const result = await InvokeFunction('riskyOperation');
 *     SetVar('result', result);
 *     return result;
 *   } catch (error) {
 *     console.error('Operation failed:', error);
 *     SetVar('error', error.message);
 *     return { success: false, error: error.message };
 *   }
 * `;
 * 
 * const result = await executeHandler(component, safeHandler);
 * ```
 * 
 * @performance
 * - First execution: ~2-10ms (includes compilation)
 * - Cached execution: ~0.5-2ms (cache hit)
 * - Async handlers: Add await time to above numbers
 * 
 * @throws {SyntaxError} If handler code has invalid JavaScript syntax
 * @throws {ReferenceError} If handler code references undefined variables
 * @throws {Error} Any error thrown by handler code itself
 * 
 * @see {@link compileHandlerFunction} for compilation details
 * @see {@link setupRuntimeContext} for context setup details
 * @see {@link createGlobalHandlerFunctions} for available global functions
 */
export function executeHandler(
  component: any,
  code: string,
  EventData: any = {},
  item: any = {}
): any {
  // Setup runtime context for this component
  // This sets Current, attaches values proxy, creates style proxy, etc.
  setupRuntimeContext(component, EventData);

  // Skip execution on server (SSR)
  // Handlers are client-side only to prevent side effects during SSR
  if (isServer) {
    return;
  }

  // Extract all runtime context values
  const runtimeContext = extractRuntimeContext();

  // Create global functions available to the handler
  const globalFunctions = createGlobalHandlerFunctions(runtimeContext);
  
  // Register key functions to ExecuteInstance
  registerGlobalFunctionsToExecuteInstance(globalFunctions);

  // Compile the handler code
  const compiledFunction = compileHandlerFunction(code);

  // Create custom console that logs to Editor
  const customConsole = {
    log: Editor.Console.log,
    warn: Editor.Console.warn,
    error: Editor.Console.error,
    info: Editor.Console.info,
    debug: Editor.Console.debug,
  };

  // Execute the compiled function with all context and global functions
  return compiledFunction(
    Database,
    eventDispatcher,
    runtimeContext.PropertiesProxy,
    Editor,
    runtimeContext.Event,
    JSON.parse(JSON.stringify(item ?? {})),
    runtimeContext.Current,
    runtimeContext.currentPlatform,
    runtimeContext.Values,
    runtimeContext.Apps,
    runtimeContext.VarsProxy,
    globalFunctions.SetVar,
    globalFunctions.GetContextVar,
    globalFunctions.UpdateApplication,
    globalFunctions.GetVar,
    globalFunctions.GetComponent,
    globalFunctions.GetComponents,
    globalFunctions.AddComponent,
    globalFunctions.SetContextVar,
    globalFunctions.AddPage,
    globalFunctions.TraitCompoentFromSchema,
    globalFunctions.NavigateToUrl,
    globalFunctions.NavigateToHash,
    globalFunctions.NavigateToPage,
    globalFunctions.UpdatePage,
    runtimeContext.context,
    runtimeContext.applications,
    globalFunctions.updateInput,
    globalFunctions.updateInputHandlers,
    globalFunctions.deletePage,
    globalFunctions.CopyComponentToClipboard,
    globalFunctions.PasteComponentFromClipboard,
    globalFunctions.DeleteComponentAction,
    globalFunctions.updateName,
    globalFunctions.updateEvent,
    globalFunctions.updateStyleHandlers,
    EventData,
    globalFunctions.updateStyle,
    globalFunctions.openEditorTab,
    globalFunctions.setCurrentEditorTab,
    globalFunctions.InvokeFunction,
    RuntimeHelpers, // Passed as "Utils" parameter for handler code
    customConsole,
    globalFunctions.UploadFile,
    globalFunctions.BrowseFiles,
    component.Instance || {} // Component instance state (used by micro-apps)
  );
}
