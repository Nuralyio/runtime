// Executor.ts

import { GenerateName } from "utils/naming-generator";

import { $applications, $values } from "$store/apps";
import { $components } from "$store/component/store.ts";
import type { ComponentElement, ComponentType } from "$store/component/interface";
import { $context, setVar } from "$store/context";
import { addPageHandler, updatePageHandler } from "$store/handlers/pages/handler";
import { isServer } from "utils/envirement";
import { addComponentAction } from "$store/actions/component/addComponentAction.ts";
import { updateComponentAttributes } from "$store/actions/component/updateComponentAttributes.ts";
import { openEditorTab } from "$store/actions/editor/openEditorTab.ts";
import { setCurrentEditorTab } from "$store/actions/editor/setCurrentEditorTab.ts";
import { eventDispatcher } from "@utils/change-detection";
import { invokeFunctionHandler } from "$store/handlers/functions/invoke-function-handler";

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
      this.registerApplications()
    });
    eventDispatcher.on("component:refresh", () => this.registerApplications())

    if (DEBUG) {
      console.log("Executor initialized with debug mode enabled.");
    }
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
      const applicationId = component.applicationId || component.application_id;

      if (!this.context[applicationId]) {
        this.context[applicationId] = {};
      }

      if (!this.context[applicationId][component.uuid]) {
        this.context[applicationId][component.uuid] = { ...component };
      }

      if (!this.applications[applicationId]) {
        this.applications[applicationId] = {};
      }
      if (!this.Apps[loadedApplicationObj[applicationId]]) {
        this.Apps[loadedApplicationObj[applicationId]] = {};
      }
      this.Apps[loadedApplicationObj[applicationId]][component.name] = { ...component };

      this.applications[applicationId][component.name] = { ...component };
    });
  }

  prepareClosureFunction(code: string): Function {
    if (!this.functionCache[code]) {
      this.functionCache[code] = new Function(
        "Components",
        "Item",
        "Current",
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
    updateComponentAttributes(component.applicationId, component.uuid, "styleHandlers", { [symbol]: value });
  }

  function GetContextVar(symbol: string, customContentId: string | null, component: any): any {
    const contentId = customContentId || component.applicationId;
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

  function GetComponent(componentUuid: string, applicationId: string): any {
    return Object.values(applications[applicationId] || {}).find((c: ComponentElement) => c.uuid === componentUuid);
  }

  function AddComponent(applicationId: string, pageId: string, componentType: ComponentType): any {
    const generatedName = GenerateName(componentType);
    addComponentAction({ name: generatedName, component_type: componentType }, pageId, applicationId);
  }

  function GetComponents(componentIds: string[]): any[] {
    return Object.values(applications).flat().filter((c: any) => componentIds.includes(c.uuid));
  }

  function SetContextVar(symbol: string, value: any, component: any) {
    setVar(component.applicationId, symbol, value);
  }

  function updateInput(component: ComponentElement, inputName: string, handlerType: string, handlerValue: any) {
    const eventData = { [inputName]: { type: handlerType, value: handlerValue } };
    updateComponentAttributes(component.applicationId, component.uuid, "input", eventData);
  }

  function updateEvent(component: ComponentElement, symbol: string, value: any) {
    const eventData = { [symbol]: value };
    updateComponentAttributes(component.applicationId, component.uuid, "event", eventData);
  }

  function updateStyle(component: ComponentElement, symbol: string, value: any) {
    const eventData = { [symbol]: value };
    updateComponentAttributes(component.applicationId, component.uuid, "style", eventData);
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
    JSON.parse(JSON.stringify(item ?? {})),
    Current,
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
    InvokeFunction
  );
}