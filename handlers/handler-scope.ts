/**
 * @fileoverview Handler Scope - Transparent Variable Access
 * @module Runtime/Handlers/HandlerScope
 *
 * @description
 * Creates a scope proxy that enables transparent variable access in handlers.
 * Instead of writing `Vars.username = 'John'`, users can write `username = 'John'`.
 *
 * This works by creating a Proxy that intercepts all property access:
 * - Known properties (Current, Event, Apps, etc.) resolve to their values
 * - Unknown properties are routed to VarsProxy for reactive access
 *
 * @example User writes:
 * ```javascript
 * username = 'John'
 * count = count + 1
 * ```
 *
 * @example Which behaves like:
 * ```javascript
 * Vars.username = 'John'
 * Vars.count = Vars.count + 1
 * ```
 */

/**
 * Set of reserved parameter names that should NOT be routed to Vars.
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
 * Creates a handler execution scope that enables transparent variable access.
 *
 * The returned proxy intercepts all property access:
 * - Reserved names (Current, Event, etc.) return their actual values
 * - Unknown names are routed to VarsProxy for reactive get/set
 *
 * This is used with JavaScript's `with` statement to create a scope
 * where user variables automatically become reactive.
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
 *   username = 'John';  // Actually sets VarsProxy.username
 *   count++;            // Actually increments VarsProxy.count
 * }
 * ```
 */
export function createHandlerScope(config: HandlerScopeConfig): any {
  const { VarsProxy, parameters } = config;

  return new Proxy(parameters, {
    /**
     * The `has` trap is critical for `with` statement behavior.
     * Returning true for all properties makes them resolve through our proxy
     * instead of going to the outer scope or throwing ReferenceError.
     */
    has(target, prop) {
      // Always claim we have the property to capture all access
      return true;
    },

    /**
     * Get property value.
     * Reserved names get their actual values, unknown names go to VarsProxy.
     */
    get(target, prop, receiver) {
      const propStr = String(prop);

      // Symbol properties go to target
      if (typeof prop === 'symbol') {
        return target[prop];
      }

      // Reserved names: return actual parameter value or global
      if (RESERVED_NAMES.has(propStr)) {
        if (propStr in target) {
          return target[propStr];
        }
        // Try globalThis for built-ins
        if (propStr in globalThis) {
          return (globalThis as any)[propStr];
        }
        return undefined;
      }

      // Check if it's a handler parameter first
      if (propStr in target) {
        return target[propStr];
      }

      // Route to VarsProxy for reactive access
      return VarsProxy[propStr];
    },

    /**
     * Set property value.
     * Reserved names update actual values, unknown names go to VarsProxy.
     */
    set(target, prop, value, receiver) {
      const propStr = String(prop);

      // Symbol properties go to target
      if (typeof prop === 'symbol') {
        target[prop] = value;
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

      // Route to VarsProxy for reactive set
      VarsProxy[propStr] = value;
      return true;
    },

    /**
     * Property descriptor for iteration support
     */
    getOwnPropertyDescriptor(target, prop) {
      const propStr = String(prop);

      if (propStr in target) {
        return Object.getOwnPropertyDescriptor(target, propStr);
      }

      if (propStr in VarsProxy) {
        return {
          configurable: true,
          enumerable: true,
          value: VarsProxy[propStr],
          writable: true,
        };
      }

      return undefined;
    },
  });
}
