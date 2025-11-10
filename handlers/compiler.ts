/**
 * Handler Function Compiler
 * 
 * Compiles handler code strings into executable functions with caching.
 * Handlers are JavaScript code from component properties that need to be
 * evaluated with access to runtime context and global APIs.
 */

/**
 * Cache for compiled handler functions to avoid re-compilation
 */
const handlerFunctionCache: Record<string, Function> = {};

/**
 * List of all parameters passed to compiled handler functions.
 * These must match the order in executeHandler when calling the function.
 */
export const HANDLER_PARAMETERS = [
  "Database",
  "eventHandler",
  "Components",
  "Editor",
  "Event",
  "Item",
  "Current",
  "currentPlatform",
  "Values",
  "Apps",
  "Vars",
  "SetVar",
  "GetContextVar",
  "UpdateApplication",
  "GetVar",
  "GetComponent",
  "GetComponents",
  "AddComponent",
  "SetContextVar",
  "AddPage",
  "TraitCompoentFromSchema",
  "NavigateToUrl",
  "NavigateToHash",
  "NavigateToPage",
  "UpdatePage",
  "context",
  "applications",
  "updateInput",
  "updateInputHandlers",
  "deletePage",
  "CopyComponentToClipboard",
  "PasteComponentFromClipboard",
  "DeleteComponentAction",
  "updateName",
  "updateEvent",
  "updateStyleHandlers",
  "EventData",
  "updateStyle",
  "openEditorTab",
  "setCurrentEditorTab",
  "InvokeFunction",
  "Utils",
  "console",
  "UploadFile",
  "BrowseFiles",
] as const;

/**
 * Compiles a handler code string into an executable function with caching.
 * 
 * @param code - The handler code string to compile
 * @returns The compiled handler function
 * 
 * @example
 * ```typescript
 * const fn = compileHandlerFunction("return GetVar('username')");
 * const result = fn(...allParameters);
 * ```
 */
export function compileHandlerFunction(code: string): Function {
  if (!handlerFunctionCache[code]) {
    handlerFunctionCache[code] = new Function(
      ...HANDLER_PARAMETERS,
      `return (function() { ${code} }).apply(this);`
    );
  }
  return handlerFunctionCache[code];
}

/**
 * Clears the handler function cache.
 * Useful for testing or when you need to force recompilation.
 */
export function clearHandlerCache(): void {
  Object.keys(handlerFunctionCache).forEach(key => delete handlerFunctionCache[key]);
}

/**
 * Gets the current cache size
 */
export function getHandlerCacheSize(): number {
  return Object.keys(handlerFunctionCache).length;
}
