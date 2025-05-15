// Executor.ts

import deepEqual from "fast-deep-equal";

import { $applications } from "$store/apps";
import {
  $components,
  setcomponentRuntimeStyleAttribute,
  $runtimeValues,
  setComponentRuntimeValue,
  setComponentRuntimeValues
} from "$store/component/store.ts";
import type { ComponentElement } from "$store/component/interface";
import { $context, getVar } from "$store/context";
import { isServer } from "utils/envirement";
import { eventDispatcher } from "@utils/change-detection";
import Editor from "./Editor";
import { executeCodeWithClosure } from "./ExecuteCode";

const DEBUG = false;

/**
 * The Executor class manages the context and applications for a system.
 * It provides methods to register context and applications, flatten components,
 * and prepare closure functions for code execution.
 */
class Executor {
  static instance: Executor;
  context: Record<string, any> = {};
  applications: Record<string, any> = {};
  Apps: Record<string, any> = {};
  Values: Record<string, any> = {};
  Properties: Record<string, any> = {};
  Vars: Record<string, any> = {};
  PropertiesProxy: Record<string, any> = {};
  VarsProxy: Record<string, any> = {};
  Current: Record<string, any> = {};
  currentPlatform: any;

  private listeners: Record<string, Set<string>> = {};
  styleProxyCache = new WeakMap();
  valuesProxyCache = new WeakMap();
  setcomponentRuntimeStyleAttribute: (componentId: string, attribute: string, value: string) => void;
  GetVar: (symbol: string) => any;
  GetContextVar: any;
  Event: Event;
  
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

  updateEditorContext() {
    const selectedComponensIds = this.Vars.selectedComponents || []
    const currentEditingApplicationUUID = getVar("global", "currentEditingApplication")?.value?.uuid;
    Editor.Vars = Editor.Vars ?? {}
    Editor.selectedComponents = this.createProxy(Object.values(this.applications[currentEditingApplicationUUID] || {}).filter((c: ComponentElement) => selectedComponensIds.includes(c.uuid)));
  }

  // Keep the createProxy method for other purposes, but don't use it for values
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
   * Attaches a values property to the component that is backed by $runtimeValues
   * @param component The component to attach the values property to
   */
  attachValuesProperty(component: any) {
    const componentId = component.uniqueUUID;
    
    if (!componentId) {
      console.error('Cannot attach values property: component uniqueUUID is undefined');
      return;
    }
    
    // If we already created a proxy for this component, return it
    if (this.valuesProxyCache.has(component)) {
      component.values = this.valuesProxyCache.get(component);
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
    component.values = valuesProxy;
  }

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

  static getInstance(): Executor {
    if (!Executor.instance) {
      Executor.instance = new Executor();
    }
    return Executor.instance;
  }

  registerContext() {
    $context.listen((context: any) => {
      Object.assign(this.context, context);
    });
  }

  registerApplications() {
    const components = $components.get();
    const componentsList = this.flattenedComponents(components);
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
        const initialValues = component.values || {};
        
        // Merge any new initial values with existing runtime values
        if (Object.keys(initialValues).length > 0) {
          const mergedValues = { ...existingValues, ...initialValues };
          if (JSON.stringify(existingValues) !== JSON.stringify(mergedValues)) {
            setComponentRuntimeValues(component.uniqueUUID, mergedValues);
          }
        }
        
        // Create a special property on the component that connects to the runtime store
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

  private flattenedComponents(componentsStore: any): any[] {
    return Object.values(componentsStore).flat();
  }
}

export const ExecuteInstance = Executor.getInstance();
ExecuteInstance.setcomponentRuntimeStyleAttribute = setcomponentRuntimeStyleAttribute;

// Export the imported function
export { executeCodeWithClosure };