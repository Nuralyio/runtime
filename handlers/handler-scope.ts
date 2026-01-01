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
  'DeleteApplication',
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

  // User functions
  'GetCurrentUser',
  'IsAuthenticated',
  'HasRole',
  'HasAnyRole',
  'HasAllRoles',
  'CurrentUser',

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

  /** Apps registry for component lookup by name */
  Apps?: Record<string, Record<string, any>>;

  /** Cache for component proxies to avoid recreation */
  componentProxyCache?: WeakMap<any, any>;
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
 * Find a component by name across all apps
 * @param Apps - The Apps registry
 * @param name - Component name to find
 * @returns The component or null if not found
 */
function findComponentByName(Apps: Record<string, Record<string, any>> | undefined, name: string): any | null {
  if (!Apps) return null;
  for (const appName in Apps) {
    if (Apps[appName]?.[name]) {
      return Apps[appName][name];
    }
  }
  return null;
}

/**
 * Create a merged proxy for a component that exposes Instance values directly
 *
 * This allows `Input1.value` instead of `Input1.Instance.value`
 * - Get: Instance values first, then component properties
 * - Set: Always writes to Instance (runtime values)
 *
 * @param component - The component to wrap
 * @param cache - Cache to store proxies for reuse
 * @returns A proxy that merges Instance values with component properties
 */
function createComponentProxy(component: any, cache?: WeakMap<any, any>): any {
  // Return cached proxy if available
  if (cache?.has(component)) {
    return cache.get(component);
  }

  const proxy = new Proxy(component, {
    get(target, prop) {
      const propStr = String(prop);

      // Symbol properties go directly to target
      if (typeof prop === 'symbol') {
        return target[prop];
      }

      // Instance values take priority (runtime values)
      if (target.Instance?.[propStr] !== undefined) {
        return target.Instance[propStr];
      }

      // Fall back to component properties
      return target[propStr];
    },

    set(target, prop, value) {
      const propStr = String(prop);

      // Symbol properties go directly to target
      if (typeof prop === 'symbol') {
        target[prop] = value;
        return true;
      }

      // Always write to Instance (runtime values)
      if (!target.Instance) {
        // Instance should already exist, but ensure it does
        console.warn(`Component ${target.name} has no Instance property`);
        return false;
      }

      target.Instance[propStr] = value;
      return true;
    }
  });

  // Cache the proxy
  if (cache) {
    cache.set(component, proxy);
  }

  return proxy;
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
  const { VarsProxy, parameters, Apps, componentProxyCache } = config;

  return new Proxy(parameters, {
    /**
     * The `has` trap is critical for `with` statement behavior.
     * We claim to have:
     * - All reserved names (handler parameters)
     * - All $-prefixed names (reactive variables)
     * - Component names (for direct component access like Input1.value)
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

      // Check if it's a component name (for direct component access)
      if (findComponentByName(Apps, propStr)) {
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
     * - Component names return merged proxy (Instance + component props)
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

      // Check if it's a component name - return merged proxy
      const component = findComponentByName(Apps, propStr);
      if (component) {
        return createComponentProxy(component, componentProxyCache);
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
