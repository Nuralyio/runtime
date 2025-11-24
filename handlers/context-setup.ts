/**
 * @fileoverview Runtime Context Setup
 * @module Runtime/Handlers/ContextSetup
 * 
 * @description
 * Initializes and prepares the runtime execution context for handler execution.
 * 
 * This module is responsible for setting up the component's runtime environment
 * before a handler is executed. It ensures that all necessary state, proxies,
 * and relationships are in place for the handler to access and manipulate.
 * 
 * **Key Responsibilities:**
 * - Set the current component context
 * - Initialize component children array
 * - Attach reactive values property to components
 * - Create or retrieve style proxies for reactive style updates
 * - Set event data for handler access
 * - Propagate values properties to parent components
 * 
 * **Why This Is Needed:**
 * Handlers execute in an isolated context and need access to:
 * - The component they're running on (`Current`)
 * - The component's reactive values (`Instance`)
 * - Style properties with change detection (style proxy)
 * - Event information (`Event`)
 * - Parent component chain with values attached
 * 
 * @example Context Setup Flow
 * ```
 * Handler Triggered (e.g., onClick)
 *         │
 *         ▼
 * setupRuntimeContext(component, { event: clickEvent })
 *         │
 *         ├─▶ Set ExecuteInstance.Current = component
 *         │   (Handler can access via "Current" parameter)
 *         │
 *         ├─▶ Initialize children array if needed
 *         │   component.children = []
 *         │
 *         ├─▶ Attach values property (component.Instance)
 *         │   Creates reactive proxy for component state
 *         │
 *         ├─▶ Propagate to parent components
 *         │   Ensure parent.Instance exists recursively
 *         │
 *         ├─▶ Set event data
 *         │   ExecuteInstance.Event = clickEvent
 *         │
 *         └─▶ Create/get style proxy
 *             Reactive style updates with change detection
 * ```
 * 
 * @see {@link ExecuteInstance} for the runtime context singleton
 * @see {@link executeHandler} for the full execution flow
 */

import type { IRuntimeContext } from '../types/IRuntimeContext';

/**
 * Helper function to create observable proxies for style objects.
 * 
 * @description
 * Creates a Proxy that intercepts property assignments on style objects
 * and calls a callback function whenever a style property is changed.
 * 
 * This enables reactive style updates where changes to component styles
 * automatically trigger re-renders or other side effects.
 * 
 * @param {any} o - The object to observe (typically a style object)
 * @param {Function} f - Callback function called on property set
 *   Receives: (target, property, newValue)
 * 
 * @returns {Proxy} A proxy that wraps the object with set interception
 * 
 * @example Usage
 * ```typescript
 * const style = { color: 'red' };
 * const observedStyle = observe(style, (target, prop, value) => {
 *   console.log(`Style changed: ${prop} = ${value}`);
 *   // Trigger component update
 *   component.requestUpdate();
 * });
 * 
 * observedStyle.color = 'blue'; // Logs: "Style changed: color = blue"
 * ```
 * 
 * @private
 */
const observe = (o: any, f: (target: any, prop: string, value: any) => void) => new Proxy(o, {
  set: (target: any, prop: string | symbol, value: any) => {
    // Only process string properties (not Symbols)
    if (typeof prop === 'string') {
      f(target, prop, value);
    }
    // Set the property on the target
    target[prop] = value;
    return true;
  }
});

/**
 * Initializes the runtime context for a component handler execution.
 * 
 * @description
 * This function prepares the runtime environment before executing a handler.
 * It sets up all necessary component state, relationships, and proxies that
 * the handler will need to access and manipulate.
 * 
 * **Setup Process:**
 * 1. **Set Current Component**: Makes component accessible as `Current` in handlers
 * 2. **Initialize Children**: Creates empty children array if component has childrenIds
 * 3. **Attach Values Property**: Creates reactive `Instance` proxy for component state
 * 4. **Propagate to Parents**: Ensures all parent components also have values attached
 * 5. **Set Event Data**: Makes event information accessible as `Event` in handlers
 * 6. **Create Style Proxy**: Sets up reactive style object with change detection
 * 
 * **Component Values (Instance):**
 * Each component gets an `Instance` property that acts as a persistent state store.
 * This is backed by the global `$runtimeValues` store and provides:
 * - Component-scoped persistent state
 * - Reactive updates (changes trigger events)
 * - Survives component re-renders
 * - Accessible in handlers as `Current.Instance`
 * 
 * **Style Proxy:**
 * Component styles are wrapped in a Proxy that:
 * - Detects style property changes
 * - Calls `setcomponentRuntimeStyleAttribute` to update store
 * - Triggers component re-renders
 * - Cached to avoid duplicate proxy creation
 * 
 * @param {any} component - The component to execute the handler for
 *   Must have: uuid, uniqueUUID, application_id, childrenIds (optional)
 * 
 * @param {any} [EventData={}] - Event data to be available in the handler
 *   Typically: { event: DOMEvent, ...customData }
 *   Accessible as "Event" parameter in handler code
 * 
 * @returns {void}
 * 
 * @example Basic Setup
 * ```typescript
 * import { setupRuntimeContext } from './context-setup';
 * 
 * const component = {
 *   uuid: 'comp-123',
 *   uniqueUUID: 'comp-123-unique',
 *   application_id: 'app-1',
 *   name: 'MyButton',
 *   style: { backgroundColor: '#3b82f6' },
 *   parent: parentComponent
 * };
 * 
 * const clickEvent = new MouseEvent('click');
 * setupRuntimeContext(component, { event: clickEvent });
 * 
 * // Now the handler can access:
 * // - Current (the component)
 * // - Current.Instance (component state)
 * // - Event (the click event)
 * // - Current.style (reactive style proxy)
 * ```
 * 
 * @example Handler Accessing Setup Context
 * ```typescript
 * // After setupRuntimeContext, handler can do:
 * const handlerCode = `
 *   // Access current component
 *   console.log('Component:', Current.name);
 *   
 *   // Access component state
 *   Current.Instance.clickCount = (Current.Instance.clickCount || 0) + 1;
 *   
 *   // Access event data
 *   console.log('Clicked at:', Event.clientX, Event.clientY);
 *   
 *   // Update style (triggers proxy)
 *   Current.style.backgroundColor = '#f59e0b';
 *   
 *   // Access parent component
 *   if (Current.parent) {
 *     console.log('Parent:', Current.parent.name);
 *     Current.parent.Instance.childClicked = true;
 *   }
 * `;
 * ```
 * 
 * @example Parent Chain Values
 * ```typescript
 * // Component hierarchy:
 * // Container (parent)
 * //   └─ Button (current)
 * 
 * setupRuntimeContext(buttonComponent, { event: clickEvent });
 * 
 * // Both components now have Instance property:
 * buttonComponent.Instance.timesClicked = 1;
 * buttonComponent.parent.Instance.activeChildId = buttonComponent.uuid;
 * ```
 * 
 * @see {@link ExecuteInstance.attachValuesProperty} for values proxy creation
 * @see {@link ExecuteInstance.styleProxyCache} for style proxy caching
 */
export function setupRuntimeContext(context: IRuntimeContext, component: any, EventData: any = {}): void {
  context.Current = component;

  // Initialize children array if needed
  if (!component.children && component.childrenIds && Array.isArray(component.childrenIds)) {
    component.children = [];
    // Children will be populated in registerApplications
  }

  // Ensure the values property is attached to the component
  if (component.uniqueUUID) {
    context.attachValuesProperty(component);

    // Also attach values to parent components recursively
    let parentComponent = component.parent;
    while (parentComponent) {
      if (parentComponent.uniqueUUID) {
        context.attachValuesProperty(parentComponent);
      }
      parentComponent = parentComponent.parent;
    }
  }

  // Set event data
  context.Event = EventData.event;
  context.Current.style = context.Current.style ?? {};

  // Create or retrieve style proxy for reactive style updates
  if (!context.styleProxyCache.has(context.Current.style)) {
    const newProxy = observe(context.Current.style, (target, prop, value) => {
      context.setComponentRuntimeStyleAttribute(
        context.Current.uniqueUUID,
        prop,
        value
      );
    });

    context.Current.style = newProxy;
    context.styleProxyCache.set(context.Current.style, newProxy);
  } else {
    context.Current.style = context.styleProxyCache.get(context.Current.style);
  }
}

/**
 * Extracts runtime context values needed for handler execution.
 * 
 * @description
 * Gathers all runtime state from ExecuteInstance into a single object
 * that will be passed to global function creators and the handler itself.
 * 
 * This provides a snapshot of the current runtime state including:
 * - **context**: Global and application-scoped context variables
 * - **applications**: All loaded applications by ID
 * - **Apps**: All loaded applications by name
 * - **Values**: Component values registry
 * - **PropertiesProxy**: Reactive proxy for component properties
 * - **VarsProxy**: Reactive proxy for variables (GetVar/SetVar)
 * - **Current**: The currently executing component
 * - **currentPlatform**: Platform info (mobile, tablet, desktop)
 * - **Event**: Current event data (if any)
 * 
 * **Why Extract Context:**
 * Instead of accessing ExecuteInstance directly in handlers, we extract
 * the context to:
 * 1. Provide a clean, immutable snapshot of runtime state
 * 2. Make it easier to pass to function creators
 * 3. Improve testability (can mock the extracted context)
 * 4. Prevent accidental mutations of ExecuteInstance internals
 * 
 * @returns {Object} Object containing all runtime context values
 * @returns {Record<string, any>} .context - Global and app-scoped variables
 * @returns {Record<string, any>} .applications - Applications by ID
 * @returns {Record<string, any>} .Apps - Applications by name
 * @returns {Record<string, any>} .Values - Component values
 * @returns {Record<string, any>} .PropertiesProxy - Reactive component properties
 * @returns {Record<string, any>} .VarsProxy - Reactive variables proxy
 * @returns {any} .Current - Currently executing component
 * @returns {any} .currentPlatform - Platform information
 * @returns {Event} .Event - Current event object
 * 
 * @example Extracting Context
 * ```typescript
 * import { extractRuntimeContext } from './context-setup';
 * 
 * const runtimeContext = extractRuntimeContext();
 * 
 * console.log('Current component:', runtimeContext.Current.name);
 * console.log('Platform:', runtimeContext.currentPlatform.platform);
 * console.log('Apps:', Object.keys(runtimeContext.Apps));
 * ```
 * 
 * @example Using Extracted Context
 * ```typescript
 * import { extractRuntimeContext } from './context-setup';
 * import { createGlobalHandlerFunctions } from './runtime-api';
 * 
 * // Extract context
 * const runtimeContext = extractRuntimeContext();
 * 
 * // Create global functions with this context
 * const globalFunctions = createGlobalHandlerFunctions(runtimeContext);
 * 
 * // Now functions like GetVar, SetVar have access to the context
 * const username = globalFunctions.GetVar('username');
 * ```
 * 
 * @example Testing with Mocked Context
 * ```typescript
 * // Instead of extracting real context, provide mock
 * const mockContext = {
 *   context: { global: {} },
 *   applications: {},
 *   Apps: { TestApp: {} },
 *   Values: {},
 *   PropertiesProxy: {},
 *   VarsProxy: {},
 *   Current: { name: 'TestComponent' },
 *   currentPlatform: { platform: 'desktop' },
 *   Event: null,
 * };
 * 
 * const functions = createGlobalHandlerFunctions(mockContext);
 * // Test functions with controlled context
 * ```
 * 
 * @performance
 * Time complexity: O(1) - just object property access
 * Execution time: <0.1ms
 * 
 * @see {@link ExecuteInstance} for the source of these values
 * @see {@link createGlobalHandlerFunctions} for how this context is used
 */
export function extractRuntimeContext(context: IRuntimeContext) {
  return {
    context: context.context,
    applications: context.applications,
    Apps: context.Apps,
    Values: context.Values,
    PropertiesProxy: context.PropertiesProxy,
    VarsProxy: context.VarsProxy,
    Current: context.Current,
    currentPlatform: context.currentPlatform,
    Event: context.Event,
  };
}
