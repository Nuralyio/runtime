/**
 * Runtime Context Setup
 * 
 * Initializes the runtime context for handler execution,
 * including component state, style proxies, and event data.
 */

import { ExecuteInstance } from '../core';

/**
 * Helper function to create observable proxies for style objects
 */
const observe = (o: any, f: Function) => new Proxy(o, { set: (a, b, c) => f(a, b, c) });

/**
 * Initializes the runtime context for a component handler execution.
 * Sets up component state, parent relationships, style proxies, and event data.
 * 
 * @param component - The component to execute the handler for
 * @param EventData - Event data to be available in the handler
 */
export function setupRuntimeContext(component: any, EventData: any = {}): void {
  ExecuteInstance.Current = component;
  
  // Initialize children array if needed
  if (!component.children && component.childrenIds && Array.isArray(component.childrenIds)) {
    component.children = [];
    // Children will be populated in registerApplications
  }
  
  // Ensure the values property is attached to the component
  if (component.uniqueUUID) {
    ExecuteInstance.attachValuesProperty(component);
    
    // Also attach values to parent components recursively
    let parentComponent = component.parent;
    while (parentComponent) {
      if (parentComponent.uniqueUUID) {
        ExecuteInstance.attachValuesProperty(parentComponent);
      }
      parentComponent = parentComponent.parent;
    }
  }
  
  // Set event data
  ExecuteInstance.Event = EventData.event;
  ExecuteInstance.Current.style = ExecuteInstance.Current.style ?? {};

  // Create or retrieve style proxy for reactive style updates
  if (!ExecuteInstance.styleProxyCache.has(ExecuteInstance.Current.style)) {
    const newProxy = observe(ExecuteInstance.Current.style, (target, prop, value) => {
      ExecuteInstance.setcomponentRuntimeStyleAttribute(
        ExecuteInstance.Current.uniqueUUID,
        prop,
        value
      );
    });

    ExecuteInstance.Current.style = newProxy;
    ExecuteInstance.styleProxyCache.set(ExecuteInstance.Current.style, newProxy);
  } else {
    ExecuteInstance.Current.style = ExecuteInstance.styleProxyCache.get(ExecuteInstance.Current.style);
  }
}

/**
 * Extracts runtime context values needed for handler execution
 * @returns Object containing all runtime context values
 */
export function extractRuntimeContext() {
  return {
    context: ExecuteInstance.context,
    applications: ExecuteInstance.applications,
    Apps: ExecuteInstance.Apps,
    Values: ExecuteInstance.Values,
    PropertiesProxy: ExecuteInstance.PropertiesProxy,
    VarsProxy: ExecuteInstance.VarsProxy,
    Current: ExecuteInstance.Current,
    currentPlatform: ExecuteInstance.currentPlatform,
    Event: ExecuteInstance.Event,
  };
}
