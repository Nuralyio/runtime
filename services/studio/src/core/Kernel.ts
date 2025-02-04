// Executor.ts

import { GenerateName } from "utils/naming-generator";

import { $applications, $values } from "$store/apps";
import { $components } from "$store/component/store.ts";
import type { ComponentElement, ComponentType } from "$store/component/interface";
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
import Editor from "./Editor"
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
  currentPlatform:any = {};

  Component: any = {};
  listner: any = {};
  private listeners: Record<string, Set<string>> = {};
  private proxyCache: WeakMap<object, any> = new WeakMap();

  private constructor() {
    this.PropertiesProxy = this.createProxy(this.Properties);
    this.VarsProxy = this.createProxy(this.Vars);
    this.registerContext();
    $applications.subscribe(() => this.registerApplications());
    $components.subscribe(() => this.registerApplications());
    $context.subscribe(()=>{
      this.currentPlatform = getVar("global", "currentPlatform")?.value ?? {
        platform: "desktop",
        isMobile: false,
      };
      this.registerApplications();
      this.updateEditorContext()

    });
    eventDispatcher.on("component:refresh", () => this.registerApplications())

    if (DEBUG) {
      console.log("Executor initialized with debug mode enabled.");
    }
  }

  updateEditorContext(){
    const selectedComponensIds = getVar( "global", "selectedComponents")?.value || []
    const currentEditingApplicationUUID = getVar("global", "currentEditingApplication")?.value?.uuid;
    Editor.selectedComponents = Object.values(this.applications[currentEditingApplicationUUID] || {}).filter((c: ComponentElement) => selectedComponensIds.includes(c.uuid));
    Editor.currentPlatform = this.currentPlatform;
    
  }
  private createProxy(target: any): any {
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
          if (self.proxyCache.has(value)) {
            return self.proxyCache.get(value);
          }

          const nestedProxy = new Proxy(value, {
            set(targetNested, propNested, valueNested, receiverNested) {
              const oldValue = targetNested[propNested as string];
              const result = Reflect.set(targetNested, propNested, valueNested, receiverNested);

              if (DEBUG) {
                console.log(
                  `[DEBUG] Updated nested property '${String(propNested)}' from '${oldValue}' to '${valueNested}'`
                );
              }

              if (oldValue !== valueNested) {
                self.listeners[String(prop)]?.forEach((componentName: string) => {
                  eventDispatcher.emit(`component-property-changed:${componentName}`, { prop, value: valueNested });
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
                  eventDispatcher.emit(`component-property-changed:${componentName}`, { prop });
                });
              }
              return result;
            },
          });

          self.proxyCache.set(value, nestedProxy);
          return nestedProxy;
        }
        return value;
      },
      set(target, prop, value, receiver) {
        const oldValue = target[prop as string];
        const result = Reflect.set(target, prop, value, receiver);

        if (DEBUG) {
          console.log(`[DEBUG] Set property '${String(prop)}' from '${oldValue}' to '${value}'`);
        }

        if (oldValue !== value) {
          self.listeners[String(prop)]?.forEach((componentName: string) => {
            eventDispatcher.emit(`component-property-changed:${componentName}`, { prop });
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
            eventDispatcher.emit(`component-property-changed:${componentName}`, { prop });
          });
        }
        return result;
      },
    });
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
      this.Apps[loadedApplicationObj[application_id]][component.name] = { ...component };

      this.applications[application_id][component.name] = { ...component };
    });
    Editor.components = componentsList;
    this.updateEditorContext()
    
  }

  prepareClosureFunction(code: string): Function {
    if (!this.functionCache[code]) {
      this.functionCache[code] = new Function(
        "Components",
        "Editor",
        "Item",
        "Current",
        "currentPlatform",
        "Values",
        "Apps",
        "Vars",
        "SetVar",
        "GetContextVar",
        "GetVar",
        "GetComponent",
        "GetComponents",
        "AddComponent",
        "SetContextVar",
        "AddPage",
        "UpdatePage",
        "context",
        "applications",
        "updateInput",
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
    return Object.values(componentsStore).flat().filter((component: any) => !component.parent);
  }
}

export const ExecuteInstance = Executor.getInstance();

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
    const contentId = customContentId || component.application_id;
    if (context && context[contentId] && context[contentId][symbol] && "value" in context[contentId][symbol]) {
      return context[contentId][symbol].value

        ;
    }
  }

  function GetVar(symbol: string): any {
    if (context && context["global"] && context["global"][symbol] && "value" in context["global"][symbol]) {
      return context["global"][symbol].value;
    }
  }

  function GetComponent(componentUuid: string, application_id: string): any {
    return Object.values(applications[application_id] || {}).find((c: ComponentElement) => c.uuid === componentUuid);
  }

  function AddComponent(application_id: string, pageId: string, componentType: ComponentType): any {
    const generatedName = GenerateName(componentType);
    addComponentAction({ name: generatedName, component_type: componentType }, pageId, application_id);
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

  function updateEvent(component: ComponentElement, symbol: string, value: any) {
    const eventData = { [symbol]: value };
    updateComponentAttributes(component.application_id, component.uuid, "event", eventData);
  }

  function updateStyle(component: ComponentElement, symbol: string, value: any) {
    const eventData = { [symbol]: value };
    updateComponentAttributes(component.application_id, component.uuid, "style", eventData);
  }

  async function InvokeFunction(id: string, payload: any={}) {
    try {
      const result = await invokeFunctionHandler(id, {
        payload: {
          data : payload
        }
      });
  
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

  return closureFunction(
    PropertiesProxy,
    Editor,
    JSON.parse(JSON.stringify(item ?? {})),
    Current,
    currentPlatform,
    Values,
    Apps,
    VarsProxy,
    SetVar,
    GetContextVar,
    GetVar,
    GetComponent,
    GetComponents,
    AddComponent,
    SetContextVar,
    AddPage,
    updatePage,
    context,
    applications,
    updateInput,
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