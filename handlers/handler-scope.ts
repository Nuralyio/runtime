/**
 * @fileoverview Handler Scope - Transparent Variable Access with $ Prefix
 * @module Runtime/Handlers/HandlerScope
 *
 * @description
 * Creates a scope proxy that enables transparent reactive variable access in handlers.
 * Variables prefixed with `$` are automatically routed to VarsProxy for reactivity.
 *
 * This provides clear visual distinction between:
 * - `$username` → Reactive state (persisted in Vars, triggers updates)
 * - `username` → Local variable (temporary, disappears after handler)
 *
 * @example User writes:
 * ```javascript
 * // Reactive variables (stored in Vars)
 * $username = 'John'
 * $count = $count + 1
 *
 * // Local variables (temporary)
 * let temp = 'hello'
 * const MAX = 100
 * ```
 *
 * @example Which behaves like:
 * ```javascript
 * $username = 'John'
 * $count = $count + 1
 *
 * let temp = 'hello'
 * const MAX = 100
 * ```
 */

/**
 * Set of reserved parameter names that should NOT be routed to $
 * These are the built-in handler parameters and global objects.
 */
const RESERVED_NAMES = new Set([
  // Core runtime parameters
  'Database',
  'eventHandler',
  'Components',
  'Editor',
  'Event',
  'Item',
  'Current',
  'currentPlatform',
  'Values',
  'Apps',
  'Vars',
  'Instance',

  // Namespaced APIs (new clean API)
  'Nav',
  'UI',
  'Component',
  'Data',
  'Page',
  'App',
  'Var',

  // Variable functions
  'SetVar',
  'GetContextVar',
  'GetVar',
  'SetContextVar',

  // Component functions
  'GetComponent',
  'GetComponents',
  'AddComponent',
  'DeleteComponentAction',
  'CopyComponentToClipboard',
  'PasteComponentFromClipboard',

  // Application functions
  'UpdateApplication',
  'context',
  'applications',

  // Page functions
  'AddPage',
  'UpdatePage',
  'deletePage',

  // Navigation functions
  'NavigateToUrl',
  'NavigateToHash',
  'NavigateToPage',

  // Property update functions
  'updateInput',
  'updateName',
  'updateEvent',
  'updateStyle',
  'updateStyleHandlers',

  // Editor functions
  'openEditorTab',
  'setCurrentEditorTab',
  'TraitCompoentFromSchema',

  // Other functions
  'InvokeFunction',
  'Utils',
  'console',
  'UploadFile',
  'BrowseFiles',
  'EventData',

  // Toast functions
  'ShowToast',
  'ShowSuccessToast',
  'ShowErrorToast',
  'ShowWarningToast',
  'ShowInfoToast',
  'HideToast',
  'ClearAllToasts',

  // JavaScript built-ins that must be preserved
  'undefined',
  'null',
  'true',
  'false',
  'NaN',
  'Infinity',
  'globalThis',
  'window',
  'self',

  // Common globals
  'Math',
  'JSON',
  'Date',
  'Array',
  'Object',
  'String',
  'Number',
  'Boolean',
  'RegExp',
  'Error',
  'TypeError',
  'ReferenceError',
  'SyntaxError',
  'Promise',
  'Map',
  'Set',
  'WeakMap',
  'WeakSet',
  'Symbol',
  'Proxy',
  'Reflect',
  'parseInt',
  'parseFloat',
  'isNaN',
  'isFinite',
  'encodeURI',
  'decodeURI',
  'encodeURIComponent',
  'decodeURIComponent',
  'setTimeout',
  'setInterval',
  'clearTimeout',
  'clearInterval',
  'fetch',
  'Request',
  'Response',
  'Headers',
  'URL',
  'URLSearchParams',
  'FormData',
  'Blob',
  'File',
  'FileReader',
  'atob',
  'btoa',
  'crypto',
  'performance',
  'queueMicrotask',
  'requestAnimationFrame',
  'cancelAnimationFrame',

  // Control flow keywords (not variables but good to have)
  'arguments',
  'this',
]);

/**
 * Configuration for creating a handler scope
 */
export interface HandlerScopeConfig {
  /** The VarsProxy for reactive variable access */
  VarsProxy: Record<string, any>;

  /** All handler parameters as key-value pairs */
  parameters: Record<string, any>;
}

/**
 * Check if a property name is a reactive variable (starts with $)
 */
function isReactiveVar(prop: string): boolean {
  return prop.startsWith('$') && prop.length > 1;
}

/**
 * Strip the $ prefix from a reactive variable name
 */
function stripPrefix(prop: string): string {
  return prop.slice(1);
}

/**
 * Creates a handler execution scope that enables transparent variable access.
 *
 * The returned proxy intercepts all property access:
 * - Reserved names (Current, Event, etc.) return their actual values
 * - `$`-prefixed names are routed to VarsProxy for reactive get/set
 * - Other names resolve normally (local variables, globals)
 *
 * This is used with JavaScript's `with` statement to create a scope
 * where `$`-prefixed variables automatically become reactive.
 *
 * @param config - Configuration with VarsProxy and parameters
 * @returns A Proxy that can be used with `with` statement
 *
 * @example
 * ```typescript
 * const scope = createHandlerScope({
 *   VarsProxy: context.VarsProxy,
 *   parameters: { Current, Event, Apps, ... }
 * });
 *
 * // Execute code with transparent variable access
 * with (scope) {
 *   $username = 'John';  // Sets VarsProxy.username (reactive)
 *   $count++;            // Increments VarsProxy.count (reactive)
 *   let temp = 'local';  // Local variable (not reactive)
 * }
 * ```
 */
export function createHandlerScope(config: HandlerScopeConfig): any {
  const { VarsProxy, parameters } = config;

  return new Proxy(parameters, {
    /**
     * The `has` trap is critical for `with` statement behavior.
     * We claim to have:
     * - All reserved names (handler parameters)
     * - All $-prefixed names (reactive variables)
     */
    has(target, prop) {
      const propStr = String(prop);

      // Always claim reserved names
      if (RESERVED_NAMES.has(propStr)) {
        return true;
      }

      // Claim $-prefixed names for reactive variable access
      if (isReactiveVar(propStr)) {
        return true;
      }

      // Check if it's a handler parameter
      if (propStr in target) {
        return true;
      }

      // For other names, let them resolve normally (local vars, globals)
      // Returning false lets the `with` statement fall through to outer scope
      return false;
    },

    /**
     * Get property value.
     * - Reserved names get their actual values
     * - $-prefixed names get from VarsProxy (without the $ prefix)
     * - Other names shouldn't reach here (has() returns false)
     */
    get(target, prop, receiver) {
      const propStr = String(prop);

      // Symbol properties go to target
      if (typeof prop === 'symbol') {
        return target[prop];
      }

      // $-prefixed: route to VarsProxy (strip the $ prefix)
      if (isReactiveVar(propStr)) {
        const varName = stripPrefix(propStr);
        return VarsProxy[varName];
      }

      // Reserved names: return actual parameter value or global
      if (RESERVED_NAMES.has(propStr)) {
        if (propStr in target) {
          return target[propStr];
        }
        // Try globalThis for built-ins
        if (propStr in globalThis) {
          const value = (globalThis as any)[propStr];
          // Bind functions that need 'this' context (like fetch, setTimeout, etc.)
          if (typeof value === 'function' && ['fetch', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval', 'requestAnimationFrame', 'cancelAnimationFrame', 'queueMicrotask'].includes(propStr)) {
            return value.bind(globalThis);
          }
          return value;
        }
        return undefined;
      }

      // Check if it's a handler parameter
      if (propStr in target) {
        return target[propStr];
      }

      // Fallback to undefined (shouldn't normally reach here)
      return undefined;
    },

    /**
     * Set property value.
     * - $-prefixed names set to VarsProxy (without the $ prefix)
     * - Reserved names update actual values
     * - Other names shouldn't reach here
     */
    set(target, prop, value, receiver) {
      const propStr = String(prop);

      // Symbol properties go to target
      if (typeof prop === 'symbol') {
        target[prop] = value;
        return true;
      }

      // $-prefixed: route to VarsProxy (strip the $ prefix)
      if (isReactiveVar(propStr)) {
        const varName = stripPrefix(propStr);
        VarsProxy[varName] = value;
        return true;
      }

      // Don't allow setting reserved globals
      if (RESERVED_NAMES.has(propStr) && propStr in globalThis) {
        // Allow setting if it's a handler parameter (like Instance)
        if (propStr in target) {
          target[propStr] = value;
          return true;
        }
        // Ignore attempts to set globals
        return true;
      }

      // Check if it's a handler parameter
      if (propStr in target && RESERVED_NAMES.has(propStr)) {
        target[propStr] = value;
        return true;
      }

      // For non-$-prefixed, non-reserved: this shouldn't happen
      // but if it does, store on target
      target[propStr] = value;
      return true;
    },

    /**
     * Property descriptor for iteration support
     */
    getOwnPropertyDescriptor(target, prop) {
      const propStr = String(prop);

      // $-prefixed: describe from VarsProxy
      if (isReactiveVar(propStr)) {
        const varName = stripPrefix(propStr);
        if (varName in VarsProxy) {
          return {
            configurable: true,
            enumerable: true,
            value: VarsProxy[varName],
            writable: true,
          };
        }
        // Return a descriptor anyway so the variable can be set
        return {
          configurable: true,
          enumerable: true,
          value: undefined,
          writable: true,
        };
      }

      if (propStr in target) {
        return Object.getOwnPropertyDescriptor(target, propStr);
      }

      return undefined;
    },
  });
}
