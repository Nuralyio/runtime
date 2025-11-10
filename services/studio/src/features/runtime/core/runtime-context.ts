import deepEqual from "fast-deep-equal";

import { $applications } from "@shared/redux/store/apps";
import {
  $components,
  setcomponentRuntimeStyleAttribute,
  $runtimeValues,
  setComponentRuntimeValue,
  setComponentRuntimeValues
} from "@shared/redux/store/component/store";
import type { ComponentElement } from "@shared/redux/store/component/component.interface";
import { $context, getVar } from "@shared/redux/store/context";
import { isServer } from "@shared/utils/envirement";
import { eventDispatcher } from "@shared/utils/change-detection";
import Editor from "./editor";
import { executeHandler } from "../kernel/handler-executor";

const DEBUG = false;

/**
 * The RuntimeContext class manages the component runtime system.
 * It provides a centralized state management system for components,
 * applications, and their values.
 * 
 * It handles:
 * - Context and application registration
 * - Component hierarchy management
 * - Reactive property management with proxy-based tracking
 * - Runtime value management for components
 * - Event dispatching for component changes
 */
class RuntimeContext {
  /** Singleton instance of the RuntimeContext */
  static instance: RuntimeContext;
  
  /** Global context registry */
  context: Record<string, any> = {};
  
  /** Applications registry by ID */
  applications: Record<string, any> = {};
  
  /** Applications registry by name */
  Apps: Record<string, any> = {};
  
  /** Component values registry */
  Values: Record<string, any> = {};
  
  /** Component properties registry */
  Properties: Record<string, any> = {};
  
  /** Variables registry */
  Vars: Record<string, any> = {};
  
  /** Reactive proxy for component properties */
  PropertiesProxy: Record<string, any> = {};
  
  /** Reactive proxy for variables */
  VarsProxy: Record<string, any> = {};
  
  /** Currently active component context */
  Current: Record<string, any> = {};
  
  /** Current platform information */
  currentPlatform: any;

  /** Property change listeners map */
  private listeners: Record<string, Set<string>> = {};
  
  /** Cache for style proxies to avoid recreation */
  styleProxyCache = new WeakMap();
  
  /** Cache for values proxies to avoid recreation */
  valuesProxyCache = new WeakMap();
  
  /** Function to set component runtime style attributes */
  setcomponentRuntimeStyleAttribute: (componentId: string, attribute: string, value: string) => void;
  
  /** Function to retrieve variable values */
  GetVar: (symbol: string) => any;
  
  /** Function to retrieve context variables */
  GetContextVar: any;
  
  /** Event object */
  Event: Event;
  
  /**
   * Private constructor to enforce singleton pattern.
   * Initializes the executor system and sets up event listeners.
   */
  private constructor() {
    if(isServer){
      return;
    }
    this.PropertiesProxy = this.createProxy(this.Properties);
    this.VarsProxy = this.createProxy(this.Vars, 'Vars');
    this.registerContext();
    $applications.subscribe(() => this.registerApplications());
    $components.subscribe(() => this.registerApplications());
    eventDispatcher.on("component:refresh", () => this.registerApplications())
    eventDispatcher.on("component:updated", () => this.registerApplications())

    if (DEBUG) {
      console.log("Executor initialized with debug mode enabled.");
    }
  }

  /**
   * Updates the editor context with selected components.
   * Filters the current application's components based on selection state.
   */
  updateEditorContext() {
    const selectedComponensIds = this.Vars.selectedComponents || []
    const currentEditingApplicationUUID = getVar("global", "currentEditingApplication")?.value?.uuid;
    Editor.Vars = Editor.Vars ?? {}
    Editor.selectedComponents = this.createProxy(Object.values(this.applications[currentEditingApplicationUUID] || {}).filter((c: ComponentElement) => selectedComponensIds.includes(c.uuid)));
  }

  /**
   * Creates a reactive proxy for the target object.
   * Tracks property access and changes, triggers events on property updates.
   * 
   * @param target - Object to be proxied
   * @param scope - Optional scope name for event namespacing
   * @returns Reactive proxy for the target object
   */
  createProxy(target: any, scope?): any {
    const self = this;
  
    if (typeof target !== "object" || target === null) {
      return target;
    }
  
    return new Proxy(target, {
      get(target, prop, receiver) {
        if (DEBUG) {
          console.log(`[DEBUG] Accessing property '${String(prop)}'`);
        }
  
        const value = Reflect.get(target, prop, receiver);
  
        if (!self.listeners[String(prop)]) {
          self.listeners[String(prop)] = new Set<string>();
        }
  
        if (self.Current.name) {
          self.listeners[String(prop)].add(self.Current.name);
        }
  
        if (typeof value === "object" && value !== null) {
          const nestedProxy = new Proxy(value, {
            set(targetNested, propNested, valueNested, receiverNested) {
              const oldValue = targetNested[propNested as string];
              const result = Reflect.set(targetNested, propNested, valueNested, receiverNested);
  
              if (DEBUG) {
                console.log(
                  `[DEBUG] Updated nested property '${String(propNested)}' from '${oldValue}' to '${valueNested}'`
                );
              }
  
              if (!deepEqual(oldValue, valueNested)) {
                self.listeners[String(prop)]?.forEach((componentName: string) => {
                  eventDispatcher.emit(`component-property-changed:${componentName}`, {
                    prop,
                    value: valueNested,
                    ctx: self.Current
                  });
                });
              }
  
              return result;
            },
            deleteProperty(targetNested, propNested) {
              if (DEBUG) {
                console.log(`[DEBUG] Deleting nested property '${String(propNested)}'`);
              }
  
              const result = Reflect.deleteProperty(targetNested, propNested);
              if (result) {
                self.listeners[String(prop)]?.forEach((componentName: string) => {
                  eventDispatcher.emit(`component-property-changed:${componentName}`, {
                    prop,
                    ctx: self.Current
                  });
                });
              }
              return result;
            },
          });
  
          return nestedProxy;
        }
  
        return value;
      },
  
      set(target, prop, value, receiver) {
        const oldValue = target[prop as string];
        const result = Reflect.set(target, prop, value, receiver);
  
        if (scope) {
          eventDispatcher.emit(`${scope}:${String(prop)}`, { value, ctx: self.Current });
        }
  
        if (DEBUG) {
          console.log(`[DEBUG] Set property '${String(prop)}' from '${oldValue}' to '${value}'`);
        }
  
        if (!deepEqual(oldValue, value)) {
          self.listeners[String(prop)]?.forEach((componentName: string) => {
            eventDispatcher.emit(`component-property-changed:${componentName}`, {
              prop,
              ctx: self.Current
            });
          });
        }
  
        return result;
      },
  
      deleteProperty(target, prop) {
        if (DEBUG) {
          console.log(`[DEBUG] Deleting property '${String(prop)}'`);
        }
  
        const result = Reflect.deleteProperty(target, prop);
        if (result) {
          self.listeners[String(prop)]?.forEach((componentName: string) => {
            eventDispatcher.emit(`component-property-changed:${componentName}`, {
              prop,
              ctx: self.Current
            });
          });
        }
        return result;
      },
    });
  }

  /**
   * Attaches a values property to the component that is backed by $runtimeValues.
   * Creates a reactive proxy that interacts with the global runtime values store.
   * 
   * @param component - The component to attach the values property to
   */
  attachValuesProperty(component: any) {
    const componentId = component.uniqueUUID;
    
    if (!componentId) {
      console.error('Cannot attach values property: component uniqueUUID is undefined');
      return;
    }
    
    // If we already created a proxy for this component, return it
    if (this.valuesProxyCache.has(component)) {
      component.Instance = this.valuesProxyCache.get(component);
      return;
    }
    
    // Create a proxy object that reads/writes to the runtime values store
    const valuesProxy = new Proxy({}, {
      get: (target, prop) => {
        // Get the current values from the store
        const runtimeValues = $runtimeValues.get();
        const componentValues :any= runtimeValues[componentId] || {};
        return componentValues[prop];
      },
      
      set: (target, prop, value) => {
        // Set the value in the store
        setComponentRuntimeValue(componentId, prop.toString(), value);
        eventDispatcher.emit(`component:value:set:${componentId}`)
        return true;
      },
      
      deleteProperty: (target, prop) => {
        // Clear the specific value from the store
        const runtimeValues = $runtimeValues.get();
        const componentValues : any = { ...(runtimeValues[componentId] || {}) };
        
        if (prop in componentValues) {
          delete componentValues[prop];
          setComponentRuntimeValues(componentId, componentValues);
          
          // Emit an event
          eventDispatcher.emit('component:value:remove', {
            componentId,
            key: prop
          });
        }
        
        return true;
      },
      
      // Support iterating over values with Object.keys, for...in, etc.
      ownKeys: (target) => {
        const runtimeValues = $runtimeValues.get();
        const componentValues = runtimeValues[componentId] || {};
        return Reflect.ownKeys(componentValues);
      },
      
      getOwnPropertyDescriptor: (target, prop) => {
        const runtimeValues = $runtimeValues.get();
        const componentValues :any= runtimeValues[componentId] || {};
        
        if (prop in componentValues) {
          return {
            value: componentValues[prop],
            writable: true,
            enumerable: true,
            configurable: true
          };
        }
        
        return undefined;
      },
      
      has: (target, prop) => {
        const runtimeValues = $runtimeValues.get();
        const componentValues = runtimeValues[componentId] || {};
        return prop in componentValues;
      }
    });
    
    // Cache the proxy
    this.valuesProxyCache.set(component, valuesProxy);
    
    // Attach the proxy to the component
    component.Instance = valuesProxy;
  }

  /**
   * Creates a proxy for style objects that tracks changes to style properties.
   * Uses a cache to avoid recreating proxies for the same target objects.
   * 
   * @param target - The style object to watch
   * @param callback - Function to call when a style property changes
   * @returns A proxy that watches for style property changes
   */
  watchStyleChanges(target, callback) {
    if (typeof target !== "object" || target === null) {
      return target;
    }
  
    // If the proxy already exists in the cache, return it
    if (this.styleProxyCache.has(target)) {
      return this.styleProxyCache.get(target);
    }
  
    const proxy = new Proxy(target, {
      set(obj, prop: any, value) {
        if (obj[prop] !== value) {
          console.log(`Style property changed: ${prop} = ${value}`);
          callback(prop, value);
        }
        obj[prop] = value;
        return true;
      }
    });
  
    // Cache the proxy to avoid re-creating it
    this.styleProxyCache.set(target, proxy);
    return proxy;
  }

  /**
   * Gets the singleton instance of the RuntimeContext class.
   * Creates it if it doesn't exist yet.
   * 
   * @returns The singleton RuntimeContext instance
   */
  static getInstance(): RuntimeContext {
    if (!RuntimeContext.instance) {
      RuntimeContext.instance = new RuntimeContext();
    }
    return RuntimeContext.instance;
  }

  /**
   * Registers the global context.
   * Sets up a listener for context changes and updates the internal context.
   */
  registerContext() {
    $context.listen((context: any) => {
      Object.assign(this.context, context);
    });
  }

  /**
   * Registers all applications and their components.
   * Builds the component hierarchy, initializes runtime values,
   * and sets up component relationships.
   */
  registerApplications() {
    const components = $components.get();
    const componentsList = Object.values(components).flat();
    const runtimeValues = $runtimeValues.get();

    const loadedApplications = $applications.get();
    const loadedApplicationObj: Record<string, string> = {};

    loadedApplications.forEach((app: any) => {
      loadedApplicationObj[app.uuid] = app.name;
    });

    componentsList.forEach((component: any) => {
      const application_id = component.application_id || component.application_id;
  
      if (!this.context[application_id]) {
        this.context[application_id] = {};
      }
  
      if (!this.context[application_id][component.uuid]) {
        this.context[application_id][component.uuid] = { ...component };
      }
  
      if (!this.applications[application_id]) {
        this.applications[application_id] = {};
      }
      if (!this.Apps[loadedApplicationObj[application_id]]) {
        this.Apps[loadedApplicationObj[application_id]] = {};
      }
      
      component.children = [];
      
      this.Apps[loadedApplicationObj[application_id]][component.name] = component;
      this.applications[application_id][component.name] = component;
      
      // Initialize runtime values if they don't exist
      if (component.uniqueUUID) {
        // Get existing values or use empty object
        const existingValues = runtimeValues[component.uniqueUUID] || {};
        // If component has any initial values not yet in runtime store, add them
        const initialValues = component.Instance || {};
        
        // Merge any new initial values with existing runtime values
        if (Object.keys(initialValues).length > 0) {
          const mergedValues = { ...existingValues, ...initialValues };
          if (JSON.stringify(existingValues) !== JSON.stringify(mergedValues)) {
            setComponentRuntimeValues(component.uniqueUUID, mergedValues);
          }
        }
        this.attachValuesProperty(component);
      }
    });
  
    componentsList.forEach((component: any) => {
      if (component.childrenIds && Array.isArray(component.childrenIds) && component.childrenIds.length > 0) {
        component.childrenIds.forEach((childId: string) => {
          const childComponent = componentsList.find((c: any) => c.uuid === childId);
          if (childComponent) {
            component.children.push(childComponent);
            childComponent.parent = component;
          }
        });
      }
    });
    
    Editor.components = componentsList;
    this.PropertiesProxy = componentsList;
    this.updateEditorContext();
  }
}

// Create singleton instance
export const RuntimeInstance = RuntimeContext.getInstance();
RuntimeInstance.setcomponentRuntimeStyleAttribute = setcomponentRuntimeStyleAttribute;

// Alias for existing code - this is the main export
export const ExecuteInstance = RuntimeInstance;

// Export handler execution function
export { executeHandler };