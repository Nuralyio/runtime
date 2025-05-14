// Executor.ts

import { GenerateName } from "utils/naming-generator";
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
import { $context, getVar, setVar } from "$store/context";
import { addPageHandler, updatePageHandler } from "$store/handlers/pages/handler";
import { isServer } from "utils/envirement";
import { addComponentAction } from "$store/actions/component/addComponentAction.ts";
import { updateComponentAttributes } from "$store/actions/component/updateComponentAttributes.ts";
import { openEditorTab } from "$store/actions/editor/openEditorTab.ts";
import { setCurrentEditorTab } from "$store/actions/editor/setCurrentEditorTab.ts";
import { eventDispatcher } from "@utils/change-detection";
import { invokeFunctionHandler } from "$store/handlers/functions/invoke-function-handler";
import { Utils } from "./Utils";
import Editor from "./Editor";
import { Navigation } from "./Navigation";
import { updateComponentName } from "$store/actions/component/update-component-name";
import { copyCpmponentToClipboard, pasteComponentFromClipboard, traitCompoentFromSchema } from "@utils/clipboard-utils";
import { deleteComponentAction } from "$store/actions/component/deleteComponentAction";
import type { PageElement } from "$store/handlers/pages/interfaces/interface";
import { deletePageAction } from "$store/actions/page/deletePageAction";
import { updateSepecificApplication } from "$store/actions/application/updateApplication";
import { loadFunctionsHandler } from "$store/handlers/functions/load-functions-handler";
import { FileStorage } from "./Storage";
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
  private functionCache: Record<string, Function> = {};
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
        const componentValues = runtimeValues[componentId] || {};
        return componentValues[prop];
      },
      
      set: (target, prop, value) => {
        // Set the value in the store
        setComponentRuntimeValue(componentId, prop.toString(), value);
        console.log(`component:value:set:${componentId}`)
        eventDispatcher.emit(`component:value:set:${componentId}`)
        return true;
      },
      
      deleteProperty: (target, prop) => {
        // Clear the specific value from the store
        const runtimeValues = $runtimeValues.get();
        const componentValues = { ...(runtimeValues[componentId] || {}) };
        
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
        const componentValues = runtimeValues[componentId] || {};
        
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

  prepareClosureFunction(code: string): Function {
    console.log= Editor.log;
    if (!this.functionCache[code]) {
      this.functionCache[code] = new Function(
        "FileStorage",
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
        "Navigation",
        "UpdatePage",
        "context",
        "applications",
        "updateInput",
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
        `return (function() { ${code} }).apply(this);`
      );
    }
    return this.functionCache[code];
  }

  private flattenedComponents(componentsStore: any): any[] {
    return Object.values(componentsStore).flat();
  }
}

export const ExecuteInstance = Executor.getInstance();
ExecuteInstance.setcomponentRuntimeStyleAttribute = setcomponentRuntimeStyleAttribute;
const observe = (o, f) => new Proxy(o, { set: (a, b, c) => f(a, b, c) })

/**
 * Executes the given code within a closure, providing access to various context and application data.
 * @param {any} component - The component to execute the code for.
 * @param {string} code - The code string to execute.
 * @param {any} [EventData={}] - Optional. Event data to pass to the closure function.
 * @param {any} [item={}] - Optional. Item data to pass to the closure function.
 * @returns {any} The result of executing the closure function.
 */
export function executeCodeWithClosure(component: any, code: string, EventData: any = {}, item: any = {}): any {
  ExecuteInstance.Current = component;
  
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
  
  ExecuteInstance.Event = EventData.event;
  ExecuteInstance.Current.style = ExecuteInstance.Current.style ?? {};

  // Style handling remains the same
  if (!ExecuteInstance.styleProxyCache.has(ExecuteInstance.Current.style)) {
    const newProxy = observe(ExecuteInstance.Current.style, (target, prop, value) => {
      ExecuteInstance.setcomponentRuntimeStyleAttribute(
        ExecuteInstance.Current.uniqueUUID,
        prop,
        value
      );
    });

    ExecuteInstance.Current.style = newProxy;
  } else {
    ExecuteInstance.Current.style = ExecuteInstance.styleProxyCache.get(ExecuteInstance.Current.style);
  }

  if (isServer) {
    return;
  }

  const context = ExecuteInstance.context;
  const applications = ExecuteInstance.applications;
  const Apps = ExecuteInstance.Apps;
  const Values = ExecuteInstance.Values;
  const PropertiesProxy = ExecuteInstance.PropertiesProxy;
  const VarsProxy = ExecuteInstance.VarsProxy;
  const Current = ExecuteInstance.Current;
  const currentPlatform = ExecuteInstance.currentPlatform;
  const Event = ExecuteInstance.Event;
  
  function SetVar(symbol: string, value: any): void {
    setVar("global", symbol, value);
  }

  function AddPage(page: any): Promise<any> {
    return new Promise((resolve) => {
      addPageHandler(page, (page: any) => {
        resolve(page);
      });
    });
  }

  function TraitCompoentFromSchema(text) {
    traitCompoentFromSchema(text);
  }

  function updatePage(page: any): Promise<any> {
    return new Promise((resolve) => {
      updatePageHandler(page, (page) => {
        resolve(page);
      });
    });
  }

  function updateStyleHandlers(component: ComponentElement, symbol: string, value: any) {
    updateComponentAttributes(component.application_id, component.uuid, "styleHandlers", { [symbol]: value });
  }

  function GetContextVar(symbol: string, customContentId: string | null, component: any): any {
    const contentId = customContentId || component?.application_id;
    if (context && context[contentId] && context[contentId]?.[symbol] && "value" in context[contentId]?.[symbol]) {
      return context[contentId]?.[symbol]?.value;
    }
    return null;
  }

  function UpdateApplication(application) {
    updateSepecificApplication(application);
  }

  function GetVar(symbol: string): any {
    if (context && context["global"] && context["global"][symbol] && "value" in context["global"][symbol]) {
      return context["global"][symbol].value;
    }
  }

  ExecuteInstance.GetVar = GetVar;
  ExecuteInstance.GetContextVar = GetContextVar;

  function GetComponent(componentUuid: string, application_id: string): any {
    return Editor.components.find((c: ComponentElement) => c.uuid === componentUuid);
  }

  function AddComponent({ application_id, pageId, componentType, additionalData }): any {
    const generatedName = GenerateName(componentType);
    addComponentAction({ name: generatedName, component_type: componentType, ...additionalData }, pageId, application_id);
  }

  function GetComponents(componentIds: string[]): any[] {
    return Object.values(applications).flat().filter((c: any) => componentIds.includes(c.uuid));
  }

  function SetContextVar(symbol: string, value: any, component: any) {
    setVar(component.application_id, symbol, value);
  }

  function updateInput(component: ComponentElement, inputName: string, handlerType: string, handlerValue: any) {
    const eventData = { [inputName]: { type: handlerType, value: handlerValue } };
    updateComponentAttributes(component.application_id, component.uuid, "input", eventData);
  }

  function deletePage(page: PageElement) {
    const userInput = confirm("Are you sure you want to delete this page?");
    if (userInput) {
      deletePageAction(page);
    }
  }

  function CopyComponentToClipboard(component: ComponentElement) {
    copyCpmponentToClipboard(component);
  }

  function PasteComponentFromClipboard() {
    pasteComponentFromClipboard();
  }
  
  function DeleteComponentAction(component: ComponentElement) {
    const userInput = confirm("Are you sure you want to delete this component?");
    if (userInput) {
      deleteComponentAction(
        component.uuid,
        component.application_id,
      );
    }
  }

  function updateName(component: ComponentElement, componentName: string) {
    updateComponentName(component.application_id, component.uuid, componentName);
  }

  function updateEvent(component: ComponentElement, symbol: string, value: any) {
    const eventData = { [symbol]: value };
    updateComponentAttributes(component.application_id, component.uuid, "event", eventData);
  }

  function updateStyle(component: ComponentElement, symbol: string, value: any) {
    const eventData = { [symbol]: value };
    updateComponentAttributes(component.application_id, component.uuid, "style", eventData);
  }

  async function InvokeFunction(name: string, payload: any = {}) {
    if(!ExecuteInstance.Vars.studio_functions){
      const functions = await loadFunctionsHandler();
      ExecuteInstance.VarsProxy.studio_functions = [...functions]
    }
    const targetFunction = (ExecuteInstance.Vars.studio_functions ?? []).find(_function => _function.label === name)
    try {
      const result = await invokeFunctionHandler(targetFunction.id, payload);

      const contentType = result.headers?.get("Content-Type") || "";

      if (contentType.includes("application/json")) {
        const jsonData = await result.json();
        console.log("JSON Response:", jsonData);
        return jsonData;
      } else {
        const textData = await result.text();
        console.log("Text Response:", textData);
        return textData;
      }
    } catch (error) {
      console.error("Error in InvokeFunctionHandler:", error);
    }
  }
  
  const closureFunction = ExecuteInstance.prepareClosureFunction(code);

  // Execute the closure with all the needed context
  return closureFunction(
    FileStorage,
    eventDispatcher,
    PropertiesProxy,
    Editor,
    Event,
    JSON.parse(JSON.stringify(item ?? {})),
    Current,
    currentPlatform,
    Values,
    Apps,
    VarsProxy,
    SetVar,
    GetContextVar,
    UpdateApplication,
    GetVar,
    GetComponent,
    GetComponents,
    AddComponent,
    SetContextVar,
    AddPage,
    TraitCompoentFromSchema,
    Navigation,
    updatePage,
    context,
    applications,
    updateInput,
    deletePage,
    CopyComponentToClipboard,
    PasteComponentFromClipboard,
    DeleteComponentAction,
    updateName,
    updateEvent,
    updateStyleHandlers,
    EventData,
    updateStyle,
    openEditorTab,
    setCurrentEditorTab,
    InvokeFunction,
    Utils
  );
}