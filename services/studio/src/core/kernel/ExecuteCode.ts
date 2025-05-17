import { FileStorage } from '../Storage';
import { Navigation } from '../Navigation';
import { Utils } from '../Utils';
import { ExecuteInstance } from '../Kernel';
import { isServer } from 'utils/envirement';
import { setVar } from '$store/context';
import { addPageHandler, updatePageHandler } from '$store/handlers/pages/handler';
import { traitCompoentFromSchema } from '@utils/clipboard-utils';
import { updateComponentAttributes } from '$store/actions/component/updateComponentAttributes.ts';
import { addComponentAction } from '$store/actions/component/addComponentAction.ts';
import { updateComponentName } from '$store/actions/component/update-component-name';
import { deleteComponentAction } from '$store/actions/component/deleteComponentAction';
import { deletePageAction } from '$store/actions/page/deletePageAction';
import { copyCpmponentToClipboard, pasteComponentFromClipboard } from '@utils/clipboard-utils';
import { updateSepecificApplication } from '$store/actions/application/updateApplication';
import { openEditorTab } from '$store/actions/editor/openEditorTab.ts';
import { setCurrentEditorTab } from '$store/actions/editor/setCurrentEditorTab.ts';
import { loadFunctionsHandler } from '$store/handlers/functions/load-functions-handler';
import { GenerateName } from 'utils/naming-generator';
import { eventDispatcher } from '@utils/change-detection';
import type { ComponentElement } from '$store/component/interface';
import type { PageElement } from '$store/handlers/pages/interfaces/interface';
import Editor from '../Editor';
import { invokeFunctionHandler } from '$store/handlers/functions/invoke-function-handler';

// Helper function needed by executeCodeWithClosure
const observe = (o, f) => new Proxy(o, { set: (a, b, c) => f(a, b, c) });

/**
 * Store for caching compiled functions to avoid re-compilation when the same code is executed
 */
const functionCache: Record<string, Function> = {};

/**
 * Prepares a closure function from a code string.
 * @param {string} code - The code string to prepare as a closure function.
 * @returns {Function} The prepared closure function.
 */
export function prepareClosureFunction(code: string): Function {
  if (!functionCache[code]) {
    functionCache[code] = new Function(
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
      "console",
      `return (function() { ${code} }).apply(this);`
    );
  }
  return functionCache[code];
}

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
  
  // Use the extracted prepareClosureFunction
  const closureFunction = prepareClosureFunction(code);
  const customConsole = {
    log: Editor.Console.log,
    warn: Editor.Console.warn,
    error: Editor.Console.error,
    info: Editor.Console.info,
    debug: Editor.Console.debug,
  };
  

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
    Utils,
    customConsole
  );
}