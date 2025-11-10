/**
 * @fileoverview Variable Management Functions
 * @module Runtime/Handlers/RuntimeAPI/Variables
 * 
 * @description
 * Provides global and context-scoped variable operations for handler code.
 * 
 * Variables in Nuraly are divided into two scopes:
 * 
 * **1. Global Variables**
 * - Shared across all applications
 * - Persist for the session
 * - Accessed with `GetVar(symbol)`
 * - Set with `SetVar(symbol, value)`
 * - Use cases: User authentication, theme, language, shared state
 * 
 * **2. Context Variables (Application-Scoped)**
 * - Scoped to a specific application
 * - Isolated between different apps
 * - Accessed with `GetContextVar(symbol, appId, component)`
 * - Set with `SetContextVar(symbol, value, component)`
 * - Use cases: App-specific state, page data, app configuration
 * 
 * **Storage Backend:**
 * Variables are stored in the `$context` nanostore with structure:
 * ```typescript
 * {
 *   global: {
 *     username: { value: "John Doe", type: "string" },
 *     theme: { value: { primary: "#3b82f6" }, type: "object" }
 *   },
 *   "app-id-1": {
 *     currentPage: { value: "dashboard", type: "string" },
 *     userData: { value: {...}, type: "object" }
 *   }
 * }
 * ```
 * 
 * @example Global Variables
 * ```javascript
 * // In handler code:
 * 
 * // Set global variable
 * SetVar('username', 'John Doe');
 * SetVar('theme', { primary: '#3b82f6', secondary: '#10b981' });
 * SetVar('isLoggedIn', true);
 * 
 * // Get global variable
 * const username = GetVar('username');
 * const theme = GetVar('theme');
 * console.log(username); // "John Doe"
 * console.log(theme.primary); // "#3b82f6"
 * 
 * // Variable doesn't exist
 * const missing = GetVar('nonexistent'); // undefined
 * const withDefault = GetVar('missing') || 'default'; // "default"
 * ```
 * 
 * @example Context Variables
 * ```javascript
 * // In handler code:
 * 
 * // Set context variable (app-scoped)
 * SetContextVar('currentPage', 'dashboard', Current);
 * SetContextVar('appData', { user: {...}, settings: {...} }, Current);
 * 
 * // Get context variable
 * const currentPage = GetContextVar('currentPage', null, Current);
 * const appData = GetContextVar('appData', null, Current);
 * 
 * // Get from specific app
 * const otherAppData = GetContextVar('data', 'other-app-id', Current);
 * ```
 * 
 * @example Variable Patterns
 * ```javascript
 * // Counter
 * const count = GetVar('count') || 0;
 * SetVar('count', count + 1);
 * 
 * // Toggle
 * const isOpen = GetVar('menuOpen') || false;
 * SetVar('menuOpen', !isOpen);
 * 
 * // Object update
 * const user = GetVar('user') || {};
 * SetVar('user', { ...user, lastLogin: Date.now() });
 * 
 * // Array manipulation
 * const items = GetVar('items') || [];
 * SetVar('items', [...items, newItem]);
 * ```
 */

import { setVar } from '@shared/redux/store/context';

/**
 * Creates variable management functions with closure over runtime context.
 * 
 * @param {any} runtimeContext - Runtime context containing context registry
 * @param {Record<string, any>} runtimeContext.context - Context variables registry
 * 
 * @returns {Object} Variable management functions
 */
export function createVariableFunctions(runtimeContext: any) {
  const { context } = runtimeContext;

  return {
    /**
     * Sets a global variable accessible across all applications.
     * 
     * @description
     * Stores a value in the global scope that persists for the session
     * and is accessible from any application or component.
     * 
     * **Use Cases:**
     * - User authentication state
     * - Application-wide theme/settings
     * - Language/locale preferences
     * - Shared data between applications
     * - Feature flags
     * 
     * **Storage:**
     * Stored in `$context.get().global[symbol]`
     * 
     * **Reactivity:**
     * Changes trigger store updates and component re-renders that depend on the variable.
     * 
     * @param {string} symbol - Variable name/key
     * @param {any} value - Value to store (any JSON-serializable value)
     * 
     * @returns {void}
     * 
     * @example Basic Usage
     * ```javascript
     * // Set primitive values
     * SetVar('username', 'John Doe');
     * SetVar('count', 42);
     * SetVar('isLoggedIn', true);
     * 
     * // Set objects
     * SetVar('user', {
     *   id: 123,
     *   name: 'John Doe',
     *   email: 'john@example.com'
     * });
     * 
     * // Set arrays
     * SetVar('items', ['apple', 'banana', 'cherry']);
     * ```
     * 
     * @example Updating Existing Variable
     * ```javascript
     * // Get current value, modify, set back
     * const count = GetVar('count') || 0;
     * SetVar('count', count + 1);
     * 
     * // Update object property
     * const settings = GetVar('settings') || {};
     * SetVar('settings', { ...settings, darkMode: true });
     * 
     * // Add to array
     * const items = GetVar('items') || [];
     * SetVar('items', [...items, newItem]);
     * ```
     * 
     * @example Authentication Pattern
     * ```javascript
     * // On login
     * SetVar('isLoggedIn', true);
     * SetVar('currentUser', { id: 123, name: 'John' });
     * SetVar('authToken', 'jwt-token-here');
     * 
     * // On logout
     * SetVar('isLoggedIn', false);
     * SetVar('currentUser', null);
     * SetVar('authToken', null);
     * ```
     */
    SetVar: (symbol: string, value: any): void => {
      setVar("global", symbol, value);
    },

    /**
     * Gets a global variable value.
     * 
     * @description
     * Retrieves a value from the global scope. Returns undefined if
     * the variable doesn't exist.
     * 
     * **Use Cases:**
     * - Check authentication status
     * - Get user preferences
     * - Access shared application state
     * - Retrieve cached data
     * 
     * **Storage:**
     * Reads from `$context.get().global[symbol].value`
     * 
     * @param {string} symbol - Variable name/key to retrieve
     * 
     * @returns {any} The variable value, or undefined if not found
     * 
     * @example Basic Usage
     * ```javascript
     * const username = GetVar('username');
     * const count = GetVar('count');
     * const user = GetVar('user');
     * 
     * console.log(username); // "John Doe" or undefined
     * ```
     * 
     * @example With Default Values
     * ```javascript
     * // Provide default if variable doesn't exist
     * const count = GetVar('count') || 0;
     * const theme = GetVar('theme') || 'light';
     * const settings = GetVar('settings') || { darkMode: false };
     * ```
     * 
     * @example Conditional Logic
     * ```javascript
     * // Check if variable exists
     * const isLoggedIn = GetVar('isLoggedIn');
     * if (isLoggedIn) {
     *   NavigateToPage('Dashboard');
     * } else {
     *   NavigateToPage('Login');
     * }
     * 
     * // Access nested properties safely
     * const user = GetVar('user');
     * const userName = user?.name || 'Guest';
     * ```
     * 
     * @example Display Pattern
     * ```javascript
     * // Use in component display
     * return `Welcome, ${GetVar('username') || 'Guest'}!`;
     * 
     * // Computed value
     * const firstName = GetVar('firstName');
     * const lastName = GetVar('lastName');
     * return `${firstName} ${lastName}`;
     * ```
     */
    GetVar: (symbol: string): any => {
      if (context && context["global"] && context["global"][symbol] && "value" in context["global"][symbol]) {
        return context["global"][symbol].value;
      }
    },

    /**
     * Gets a context-scoped (application-specific) variable.
     * 
     * @description
     * Retrieves a value from an application's context scope. Context variables
     * are isolated per application and don't affect other applications.
     * 
     * **Use Cases:**
     * - Application-specific state
     * - Page navigation state within an app
     * - App configuration data
     * - Isolated feature state
     * 
     * **Storage:**
     * Reads from `$context.get()[appId][symbol].value`
     * 
     * **Scope Resolution:**
     * - If `customContentId` provided, uses that as the scope
     * - Otherwise, uses `component.application_id` as the scope
     * 
     * @param {string} symbol - Variable name/key to retrieve
     * @param {string | null} customContentId - Optional custom context ID (app ID)
     * @param {any} component - Component object to get application_id from
     * 
     * @returns {any} The variable value, or null if not found
     * 
     * @example Basic Usage
     * ```javascript
     * // Get variable from current app context
     * const currentPage = GetContextVar('currentPage', null, Current);
     * const appSettings = GetContextVar('settings', null, Current);
     * 
     * console.log(currentPage); // "dashboard" or null
     * ```
     * 
     * @example Custom Context ID
     * ```javascript
     * // Get variable from specific app
     * const otherAppData = GetContextVar('userData', 'app-123', Current);
     * 
     * // Cross-app communication
     * const sharedState = GetContextVar('sharedData', 'main-app-id', Current);
     * ```
     * 
     * @example With Default Values
     * ```javascript
     * const currentPage = GetContextVar('currentPage', null, Current) || 'home';
     * const appConfig = GetContextVar('config', null, Current) || { initialized: false };
     * ```
     * 
     * @example Application Navigation
     * ```javascript
     * // Store and retrieve current page in app context
     * SetContextVar('currentPage', 'profile', Current);
     * 
     * // Later, in another component of same app:
     * const page = GetContextVar('currentPage', null, Current);
     * if (page === 'profile') {
     *   // Show profile-specific UI
     * }
     * ```
     */
    GetContextVar: (symbol: string, customContentId: string | null, component: any): any => {
      const contentId = customContentId || component?.application_id;
      if (context && context[contentId] && context[contentId]?.[symbol] && "value" in context[contentId]?.[symbol]) {
        return context[contentId]?.[symbol]?.value;
      }
      return null;
    },

    /**
     * Sets a context-scoped (application-specific) variable.
     * 
     * @description
     * Stores a value in an application's context scope. The value is isolated
     * to this application and won't affect other applications.
     * 
     * **Use Cases:**
     * - Store app-specific state
     * - Track navigation within an app
     * - App configuration
     * - Isolated feature data
     * 
     * **Storage:**
     * Stored in `$context.get()[appId][symbol]`
     * 
     * **Scope:**
     * Uses `component.application_id` to determine the scope
     * 
     * **Reactivity:**
     * Changes trigger store updates and re-renders of components in that app
     * that depend on the variable.
     * 
     * @param {string} symbol - Variable name/key
     * @param {any} value - Value to store (any JSON-serializable value)
     * @param {any} component - Component object to get application_id from
     * 
     * @returns {void}
     * 
     * @example Basic Usage
     * ```javascript
     * // Set context variable in current app
     * SetContextVar('currentPage', 'dashboard', Current);
     * SetContextVar('userData', { id: 123, name: 'John' }, Current);
     * SetContextVar('appSettings', { theme: 'dark', layout: 'grid' }, Current);
     * ```
     * 
     * @example Page Navigation State
     * ```javascript
     * // Store navigation history in app context
     * const history = GetContextVar('pageHistory', null, Current) || [];
     * SetContextVar('pageHistory', [...history, 'profile'], Current);
     * 
     * // Track current page
     * SetContextVar('currentPage', 'profile', Current);
     * SetContextVar('previousPage', GetContextVar('currentPage', null, Current), Current);
     * ```
     * 
     * @example App Configuration
     * ```javascript
     * // Initialize app config
     * SetContextVar('config', {
     *   apiEndpoint: '/api/v1',
     *   maxItems: 50,
     *   enableFeatureX: true
     * }, Current);
     * 
     * // Update config
     * const config = GetContextVar('config', null, Current);
     * SetContextVar('config', { ...config, maxItems: 100 }, Current);
     * ```
     * 
     * @example Isolated State Between Apps
     * ```javascript
     * // App A sets its own state
     * SetContextVar('currentUser', { id: 1, name: 'Alice' }, appAComponent);
     * 
     * // App B sets its own state (doesn't affect App A)
     * SetContextVar('currentUser', { id: 2, name: 'Bob' }, appBComponent);
     * 
     * // Each app has its own isolated state
     * ```
     */
    SetContextVar: (symbol: string, value: any, component: any) => {
      setVar(component.application_id, symbol, value);
    },
  };
}
