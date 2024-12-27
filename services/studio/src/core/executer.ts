import { GenerateName } from "utils/naming-generator";

import { $applications, $values } from "$store/apps";
import { $components } from "$store/component/store.ts";
import type { ComponentElement, ComponentType } from "$store/component/interface";
import { $context, setVar } from "$store/context";
import { addPageHandler, updatePageHandler } from "$store/handlers/pages/handler";
import { eventDispatcher } from "utils/change-detection";
import { isServer } from "utils/envirement";
import { addComponentAction } from "$store/actions/component/addComponentAction.ts";
import { updateComponentAttributes } from "$store/actions/component/updateComponentAttributes.ts";

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
  private functionCache: Record<string, Function> = {};

  /**
   * Private constructor to ensure singleton pattern.
   */
  private constructor() {
    this.registerContext();
    $applications.subscribe(() => this.registerApplications());
    $components.subscribe(() => this.registerApplications());
    eventDispatcher.on("component:refresh", () => this.registerApplications());
    $values.subscribe((values) => {
      this.Values = values;
    });
  }

  /**
   * Returns the singleton instance of the Executor class.
   * @returns {Executor} The singleton instance.
   */
  static getInstance(): Executor {
    if (!Executor.instance) {
      Executor.instance = new Executor();
    }
    return Executor.instance;
  }

  /**
   * Listens to the context and updates the internal context record.
   */
  registerContext() {
    $context.listen((context: any) => {
      Object.assign(this.context, context);
    });
  }

  /**
   * Registers applications and components, updating the internal context and applications records.
   */
  registerApplications() {
    const components = $components.get();
    const componentsList = this.flattenedComponents(components);
    let loadedApplication = $applications.get();
    let loadedApplicationObj = {};

    loadedApplication.map((app: any) => {
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

  /**
   * Prepares a closure function from the given code string and caches it.
   * @param {string} code - The code string to prepare.
   * @returns {Function} The prepared closure function.
   */
  prepareClosureFunction(code: string): Function {
    if (!this.functionCache[code]) {
      this.functionCache[code] = new Function(
        "Item",
        "Current",
        "Values",
        "Apps",
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
        `return (function() { ${code} }).apply(this);`
      );
    }
    return this.functionCache[code];
  }

  /**
   * Flattens the components store and filters out components with a parent.
   * @param {any} componentsStore - The components store.
   * @returns {any[]} The flattened components list.
   */
  private flattenedComponents(componentsStore: any): any[] {
    return Object.values(componentsStore).flat().filter((component: any) => !component.parent);
  }
}

const instance = Executor.getInstance();

/**
 * Executes the given code within a closure, providing access to various context and application data.
 * @param {any} component - The component to execute the code for.
 * @param {string} code - The code string to execute.
 * @param {any} [EventData={}] - Optional. Event data to pass to the closure function.
 * @param {any} [item={}] - Optional. Item data to pass to the closure function.
 * @returns {any} The result of executing the closure function.
 */
export function executeCodeWithClosure(component: any, code: string, EventData: any = {}, item: any = {}): any {

  if (isServer) {
    return;
  }
  const context = instance.context;
  const applications = instance.applications;
  const Apps = instance.Apps;
  const Values = instance.Values;

  /**
   * Sets a global variable.
   * @param {string} symbol - The variable symbol.
   * @param {any} value - The value to set.
   */
  function SetVar(symbol: string, value: any): void {
    setVar("global", symbol, value);
  }

  /**
   * Adds a page to the application.
   * @param {any} page - The page to add.
   * @returns {Promise<any>} A promise that resolves with the added page.
   */
  function AddPage(page: any): Promise<any> {
    return new Promise((resolve, reject) => {
      addPageHandler(page, (page: any) => {
        resolve(page);
      });

    });
  }

  /**
   * Updates a page in the application.
   * @param {any} page - The page to update.
   * @returns {Promise<any>} A promise that resolves with the updated page.
   */
  function updatePage(page: any): Promise<any> {
    return new Promise((resolve, reject) => {
      updatePageHandler(page, (page) => {
        resolve(page);
      });
    });
  }

  /**
   * Updates the style handlers of a component.
   * @param {ComponentElement} component - The component to update.
   * @param {string} symbol - The style handler symbol.
   * @param {any} value - The value to set.
   */
  function updateStyleHandlers(component: ComponentElement, symbol: string, value: any) {
    updateComponentAttributes(component.applicationId, component.uuid, "styleHandlers", { [symbol]: value });
  }

  /**
   * Gets a context variable.
   * @param {string} symbol - The variable symbol.
   * @param {string | null} customContentId - The custom content ID.
   * @param {any} component - The component.
   * @returns {any} The value of the context variable.
   */
  function GetContextVar(symbol: string, customContentId: string | null, component: any): any {
    const contentId = customContentId || component.applicationId;
    if (context && context[contentId] && context[contentId][symbol] && "value" in context[contentId][symbol]) {
      return context[contentId][symbol].value;
    } else {
      console.warn("Variable not found or invalid structure." + symbol);
    }
  }

  /**
   * Gets a global variable.
   * @param {string} symbol - The variable symbol.
   * @returns {any} The value of the global variable.
   */
  function GetVar(symbol: string): any {
    if (context && context["global"] && context["global"][symbol] && "value" in context["global"][symbol]) {
      return context["global"][symbol].value;
    } else {
      console.warn("Variable not found or invalid structure." + symbol);
    }
  }

  /**
   * Gets a component by its UUID.
   * @param {string} componentUuid - The component UUID.
   * @param {string} applicationId - The application ID.
   * @returns {any} The component.
   */
  function GetComponent(componentUuid: string, applicationId: string): any {
    return Object.values(applications[applicationId] || {}).find((c: ComponentElement) => c.uuid === componentUuid);
  }

  /**
   * Adds a component to the application.
   * @param {string} applicationId - The application ID.
   * @param {string} pageId - The page ID.
   * @param {ComponentType} componentType - The component type.
   */
  function AddComponent(applicationId: string, pageId: string, componentType: ComponentType): any {
    const generatedName = GenerateName(componentType);
    addComponentAction({ name: generatedName, component_type: componentType }, pageId, applicationId);
  }

  /**
   * Gets components by their IDs.
   * @param {string[]} componentIds - The component IDs.
   * @returns {any[]} The components.
   */
  function GetComponents(componentIds: string[]): any[] {
    return Object.values(applications).flat().filter((c: any) => componentIds.includes(c.uuid));
  }

  /**
   * Sets a context variable.
   * @param {string} symbol - The variable symbol.
   * @param {any} value - The value to set.
   * @param {any} component - The component.
   */
  function SetContextVar(symbol: string, value: any, component: any) {
    setVar(component.applicationId, symbol, value);
  }

  /**
   * Updates the input of a component.
   * @param {ComponentElement} component - The component to update.
   * @param {string} inputName - The input name.
   * @param {string} handlerType - The handler type.
   * @param {any} handlerValue - The handler value.
   */
  function updateInput(component: ComponentElement, inputName: string, handlerType: string, handlerValue: any) {
    const eventData = { [inputName]: { type: handlerType, value: handlerValue } };
    updateComponentAttributes(component.applicationId, component.uuid, "input", eventData);
  }

  /**
   * Updates the event of a component.
   * @param {ComponentElement} component - The component to update.
   * @param {string} symbol - The event symbol.
   * @param {any} value - The value to set.
   */
  function updateEvent(component: ComponentElement, symbol: string, value: any) {
    const eventData = { [symbol]: value };
    updateComponentAttributes(component.applicationId, component.uuid, "event", eventData);
  }

  /**
   * Updates the style of a component.
   * @param {ComponentElement} component - The component to update.
   * @param {string} symbol - The style symbol.
   * @param {any} value - The value to set.
   */
  function updateStyle(component: ComponentElement, symbol: string, value: any) {
    const eventData = { [symbol]: value };
    updateComponentAttributes(component.applicationId, component.uuid, "style", eventData);
  }

  const closureFunction = instance.prepareClosureFunction(code);

  return closureFunction(
    JSON.parse(JSON.stringify(item ?? {})),
    component,
    Values,
    Apps,
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
    updateStyle
  );
}
