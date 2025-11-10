import { FileStorage, Navigation, Utils, ExecuteInstance } from '../core';
import { isServer } from '@shared/utils/envirement';
import { setVar } from '@shared/redux/store/context';
import { addPageHandler, updatePageHandler } from '@shared/redux/handlers/pages/handler';
import { traitCompoentFromSchema } from '@shared/utils/clipboard-utils';
import {
  updateComponentAttributes,
  addComponentAction,
  updateComponentName,
  deleteComponentAction
} from '@shared/redux/actions/component';
import { deletePageAction } from '@shared/redux/actions/page/deletePageAction';
import { copyCpmponentToClipboard, pasteComponentFromClipboard } from '@shared/utils/clipboard-utils';
import { updateApplication as updateSepecificApplication } from '@shared/redux/actions/application';
import { openEditorTab, setCurrentEditorTab } from '@shared/redux/actions/editor';
import { loadFunctionsHandler, invokeFunctionHandler } from '@shared/redux/handlers/functions';
import { GenerateName } from '@shared/utils/naming-generator';
import { eventDispatcher } from '@shared/utils/change-detection';
import type { ComponentElement } from '@shared/redux/store/component';
import type { PageElement } from '@shared/redux/handlers/pages/page.interface';
import Editor from '../core/Editor';
import Database from '@nuraly/dbclient';

// Helper function needed by executeHandler
const observe = (o, f) => new Proxy(o, { set: (a, b, c) => f(a, b, c) });

/**
 * Store for caching compiled handler functions to avoid re-compilation when the same code is executed
 */
const handlerFunctionCache: Record<string, Function> = {};

/**
 * Compiles a handler code string into an executable function with caching.
 * Handlers are JavaScript code strings from component properties (input, style, event).
 * 
 * @param {string} code - The handler code string to compile
 * @returns {Function} The compiled handler function
 */
export function compileHandlerFunction(code: string): Function {
  if (!handlerFunctionCache[code]) {
    handlerFunctionCache[code] = new Function(
      "FileStorage",
      "Database",
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
      "updateInputHandlers",
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
  return handlerFunctionCache[code];
}

/**
 * Executes a component handler with full runtime context.
 * Handlers are JavaScript code strings from component properties (input, style, event).
 * 
 * @param {ComponentElement} component - The component context for execution
 * @param {string} code - The handler code string to execute
 * @param {any} [EventData={}] - Event data passed to the handler
 * @param {any} [item={}] - Collection item data for handlers in collections
 * @returns {any} The result of executing the handler
 */
export function executeHandler(component: any, code: string, EventData: any = {}, item: any = {}): any {
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

  function updateInputHandlers(component: ComponentElement, inputName: string, value: any) {
    const eventData = { [inputName]: value };
    updateComponentAttributes(component.application_id, component.uuid, "inputHandlers", eventData);
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
    // Check if a pseudo-state is selected (e.g., :hover, :focus, :active)
    const selectedState = ExecuteInstance.Vars.selected_component_style_state;
    
    let eventData;
    if (selectedState && selectedState !== "default") {
      // Get existing pseudo-state styles to preserve other properties
      const existingPseudoStateStyles = component.style?.[selectedState] || {};
      
      // If a pseudo-state is selected, merge with existing pseudo-state properties
      eventData = {
        [selectedState]: {
          ...existingPseudoStateStyles,
          [symbol]: value
        }
      };
    } else {
      // Default behavior: set style directly
      eventData = { [symbol]: value };
    }
    
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
        return jsonData;
      } else {
        const textData = await result.text();
        return textData;
      }
    } catch (error) {
      console.error("Error in InvokeFunctionHandler:", error);
    }
  }
  
  // Compile and cache the handler function
  const closureFunction = compileHandlerFunction(code);
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
    Database,
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
    updateInputHandlers,
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

// Backward compatibility aliases - can be removed after migration
export const executeCodeWithClosure = executeHandler;
export const prepareClosureFunction = compileHandlerFunction;