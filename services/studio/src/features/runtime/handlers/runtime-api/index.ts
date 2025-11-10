/**
 * @fileoverview Runtime API - Global Functions for Handler Code
 * @module Runtime/Handlers/RuntimeAPI
 * 
 * @description
 * Main entry point that aggregates all runtime API functions available to handler code.
 * 
 * The Runtime API provides a rich set of global functions that handler code can use
 * to interact with the Nuraly system. These functions are automatically injected into
 * the execution context of every handler.
 * 
 * **API Categories:**
 * 
 * 1. **Variable Management** (`variables.ts`)
 *    - `GetVar`, `SetVar` - Global variables
 *    - `GetContextVar`, `SetContextVar` - App-scoped variables
 * 
 * 2. **Component Management** (`components.ts`)
 *    - `GetComponent`, `GetComponents` - Component queries
 *    - `AddComponent`, `DeleteComponentAction` - Component CRUD
 *    - `CopyComponentToClipboard`, `PasteComponentFromClipboard` - Clipboard ops
 * 
 * 3. **Component Properties** (`component-properties.ts`)
 *    - `updateName`, `updateInput`, `updateStyle`, `updateEvent` - Property updates
 *    - `updateInputHandlers`, `updateStyleHandlers` - Handler updates
 * 
 * 4. **Page Management** (`pages.ts`)
 *    - `AddPage`, `UpdatePage`, `deletePage` - Page CRUD
 * 
 * 5. **Application Management** (`applications.ts`)
 *    - `UpdateApplication` - Application updates
 * 
 * 6. **Navigation** (`navigation.ts`)
 *    - `NavigateToUrl`, `NavigateToHash`, `NavigateToPage` - Navigation functions
 * 
 * 7. **Storage** (`storage.ts`)
 *    - `UploadFile`, `BrowseFiles` - File storage operations
 * 
 * 8. **Backend Functions** (`functions.ts`)
 *    - `InvokeFunction` - Call studio backend functions
 * 
 * 9. **Editor** (`editor.ts`)
 *    - `openEditorTab`, `setCurrentEditorTab` - Editor UI
 *    - `TraitCompoentFromSchema` - Schema imports
 * 
 * **Usage in Handler Code:**
 * All these functions are available directly in handler code without imports:
 * 
 * ```javascript
 * // Handler code (no imports needed)
 * const username = GetVar('username');
 * SetVar('count', GetVar('count') + 1);
 * NavigateToPage('Dashboard');
 * updateInput(Current, 'text', 'static', 'Hello');
 * ```
 * 
 * **Function Injection:**
 * These functions are injected into handlers via the `HANDLER_PARAMETERS` array
 * in `compiler.ts`. Each function is passed as a parameter when executing the
 * compiled handler function.
 * 
 * @example Using Runtime API in Handlers
 * ```javascript
 * // Example handler code that uses multiple API functions:
 * 
 * // Variable management
 * const count = GetVar('clickCount') || 0;
 * SetVar('clickCount', count + 1);
 * 
 * // Component management
 * const button = GetComponent('button-id', Current.application_id);
 * updateStyle(button, 'backgroundColor', '#3b82f6');
 * 
 * // Navigation
 * if (count + 1 >= 10) {
 *   NavigateToPage('Congratulations');
 * }
 * 
 * // Backend function call
 * const result = await InvokeFunction('recordClick', { count: count + 1 });
 * 
 * // Update current component
 * updateInput(Current, 'label', 'static', `Clicked ${count + 1} times`);
 * ```
 * 
 * @example Creating and Using Global Functions
 * ```typescript
 * import { createGlobalHandlerFunctions } from './runtime-api';
 * 
 * const runtimeContext = {
 *   context: { global: {} },
 *   applications: {},
 *   Apps: {},
 *   // ... other context
 * };
 * 
 * // Create all global functions
 * const globalFunctions = createGlobalHandlerFunctions(runtimeContext);
 * 
 * // Now you can call them
 * globalFunctions.SetVar('username', 'John');
 * const username = globalFunctions.GetVar('username');
 * ```
 * 
 * @see {@link ./variables.ts} for variable management functions
 * @see {@link ./components.ts} for component management functions
 * @see {@link ./navigation.ts} for navigation functions
 * @see {@link ../compiler.ts} for HANDLER_PARAMETERS
 */

import { ExecuteInstance } from '../../state';
import { createVariableFunctions } from './variables';
import { createComponentFunctions } from './components';
import { createComponentPropertyFunctions } from './component-properties';
import { createPageFunctions } from './pages';
import { createApplicationFunctions } from './applications';
import { createNavigationFunctions } from './navigation';
import { createStorageFunctions } from './storage';
import { createFunctionInvocationFunctions } from './functions';
import { createEditorFunctions } from './editor';

/**
 * Creates all global functions available to handler code.
 * 
 * @description
 * Aggregates all runtime API function creators into a single object.
 * These functions are injected into the handler execution context and
 * become available as global functions in handler code.
 * 
 * **Function Categories Created:**
 * - Variable functions (GetVar, SetVar, GetContextVar, SetContextVar)
 * - Component functions (GetComponent, AddComponent, DeleteComponentAction, etc.)
 * - Component property functions (updateInput, updateStyle, updateEvent, etc.)
 * - Page functions (AddPage, UpdatePage, deletePage)
 * - Application functions (UpdateApplication)
 * - Navigation functions (NavigateToPage, NavigateToUrl, NavigateToHash)
 * - Storage functions (UploadFile, BrowseFiles)
 * - Function invocation (InvokeFunction)
 * - Editor functions (openEditorTab, setCurrentEditorTab, TraitCompoentFromSchema)
 * 
 * **Why Create Functions This Way:**
 * 1. **Closure over runtime context**: Functions have access to current context
 * 2. **Modularity**: Each category in separate file for maintainability
 * 3. **Testability**: Can create functions with mock context for testing
 * 4. **Consistency**: All functions created with same pattern
 * 
 * @param {any} runtimeContext - The runtime context object containing:
 *   - context: Global and app-scoped variables
 *   - applications: Applications registry by ID
 *   - Apps: Applications registry by name
 *   - Values: Component values
 *   - Current: Currently executing component
 *   - Event: Current event data
 *   - ... other runtime state
 * 
 * @returns {Object} Object containing all global handler functions
 *   The returned object has ~50+ functions available to handler code
 * 
 * @example Creating Global Functions
 * ```typescript
 * import { createGlobalHandlerFunctions } from './runtime-api';
 * import { extractRuntimeContext } from '../context-setup';
 * 
 * // Extract current runtime context
 * const runtimeContext = extractRuntimeContext();
 * 
 * // Create all global functions with this context
 * const globalFunctions = createGlobalHandlerFunctions(runtimeContext);
 * 
 * // Functions now have closure over the runtime context
 * console.log(Object.keys(globalFunctions));
 * // ['GetVar', 'SetVar', 'GetComponent', 'NavigateToPage', ...]
 * ```
 * 
 * @example Using Created Functions
 * ```typescript
 * const globalFunctions = createGlobalHandlerFunctions(runtimeContext);
 * 
 * // Set a variable
 * globalFunctions.SetVar('username', 'John Doe');
 * 
 * // Get a variable
 * const username = globalFunctions.GetVar('username');
 * console.log(username); // "John Doe"
 * 
 * // Navigate
 * globalFunctions.NavigateToPage('Dashboard');
 * 
 * // Get component
 * const component = globalFunctions.GetComponent('comp-123', 'app-1');
 * 
 * // Update component
 * globalFunctions.updateInput(component, 'text', 'static', 'Hello');
 * ```
 * 
 * @see {@link createVariableFunctions} for variable management
 * @see {@link createComponentFunctions} for component management
 * @see {@link createNavigationFunctions} for navigation
 */
export function createGlobalHandlerFunctions(runtimeContext: any) {
  return {
    ...createVariableFunctions(runtimeContext),
    ...createComponentFunctions(runtimeContext),
    ...createComponentPropertyFunctions(),
    ...createPageFunctions(),
    ...createApplicationFunctions(),
    ...createNavigationFunctions(),
    ...createStorageFunctions(),
    ...createFunctionInvocationFunctions(),
    ...createEditorFunctions(),
  };
}

/**
 * Registers key global functions to ExecuteInstance for internal use.
 * 
 * @description
 * Some functions need to be accessible from ExecuteInstance itself
 * (not just in handler code). This function registers those functions.
 * 
 * Currently registers:
 * - `GetVar`: Needed internally for variable access
 * - `GetContextVar`: Needed internally for context variable access
 * 
 * **Why This Is Needed:**
 * ExecuteInstance needs these functions to:
 * - Access variables during component registration
 * - Set up component values properties
 * - Internal state management operations
 * 
 * @param {any} globalFunctions - The global functions object from createGlobalHandlerFunctions
 * 
 * @returns {void}
 * 
 * @example Registration Flow
 * ```typescript
 * // In handler-executor.ts:
 * 
 * // 1. Create global functions
 * const globalFunctions = createGlobalHandlerFunctions(runtimeContext);
 * 
 * // 2. Register to ExecuteInstance
 * registerGlobalFunctionsToExecuteInstance(globalFunctions);
 * 
 * // 3. Now ExecuteInstance can use these functions
 * const username = ExecuteInstance.GetVar('username');
 * ```
 * 
 * @see {@link ExecuteInstance} in ../state/runtime-context.ts
 */
export function registerGlobalFunctionsToExecuteInstance(globalFunctions: any): void {
  ExecuteInstance.GetVar = globalFunctions.GetVar;
  ExecuteInstance.GetContextVar = globalFunctions.GetContextVar;
}
