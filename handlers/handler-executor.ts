/**
 * Handler Executor
 * 
 * Main orchestrator for executing component handlers with full runtime context.
 * Handlers are JavaScript code strings from component properties (input, style, event)
 * that need to be evaluated with access to the Nuraly runtime API.
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
 * @param component - The component context for execution
 * @param code - The handler code string to execute
 * @param EventData - Event data passed to the handler
 * @param item - Collection item data for handlers in collections
 * @returns The result of executing the handler
 * 
 * @example
 * ```typescript
 * const result = executeHandler(
 *   component, 
 *   "GetVar('username')", 
 *   { event: clickEvent },
 *   itemData
 * );
 * ```
 */
export function executeHandler(
  component: any,
  code: string,
  EventData: any = {},
  item: any = {}
): any {
  // Setup runtime context for this component
  setupRuntimeContext(component, EventData);

  // Skip execution on server
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
    globalFunctions.BrowseFiles
  );
}
