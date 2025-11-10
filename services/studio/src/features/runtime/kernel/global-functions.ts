/**
 * Global Handler Functions
 * 
 * Provides the global API functions that are available to handler code.
 * These functions allow handlers to interact with the runtime system,
 * manage components, variables, pages, and more.
 */

import { ExecuteInstance } from '../core';
import Editor from '../core/Editor';
import { setVar } from '@shared/redux/store/context';
import { addPageHandler, updatePageHandler } from '@shared/redux/handlers/pages/handler';
import { traitCompoentFromSchema } from '@shared/utils/clipboard-utils';
import {
  updateComponentAttributes,
  addComponentAction,
  updateComponentName,
  deleteComponentAction
} from '@shared/redux/actions/component';
import type { ComponentElement } from '@shared/redux/store/component';
import { deletePageAction } from '@shared/redux/actions/page/deletePageAction';
import { copyCpmponentToClipboard, pasteComponentFromClipboard } from '@shared/utils/clipboard-utils';
import { updateApplication as updateSepecificApplication } from '@shared/redux/actions/application';
import { openEditorTab, setCurrentEditorTab } from '@shared/redux/actions/editor';
import { loadFunctionsHandler, invokeFunctionHandler } from '@shared/redux/handlers/functions';
import { GenerateName } from '@shared/utils/naming-generator';
import type { PageElement } from '@shared/redux/handlers/pages/page.interface';

/**
 * Creates all global functions available to handler code.
 * These functions are injected into the handler execution context.
 * 
 * @param runtimeContext - The runtime context object
 * @returns Object containing all global handler functions
 */
export function createGlobalHandlerFunctions(runtimeContext: any) {
  const { context, applications } = runtimeContext;

  return {
    // Variable Management
    SetVar: (symbol: string, value: any): void => {
      setVar("global", symbol, value);
    },

    GetVar: (symbol: string): any => {
      if (context && context["global"] && context["global"][symbol] && "value" in context["global"][symbol]) {
        return context["global"][symbol].value;
      }
    },

    GetContextVar: (symbol: string, customContentId: string | null, component: any): any => {
      const contentId = customContentId || component?.application_id;
      if (context && context[contentId] && context[contentId]?.[symbol] && "value" in context[contentId]?.[symbol]) {
        return context[contentId]?.[symbol]?.value;
      }
      return null;
    },

    SetContextVar: (symbol: string, value: any, component: any) => {
      setVar(component.application_id, symbol, value);
    },

    // Component Management
    GetComponent: (componentUuid: string, application_id: string): any => {
      return Editor.components.find((c: ComponentElement) => c.uuid === componentUuid);
    },

    GetComponents: (componentIds: string[]): any[] => {
      return Object.values(applications).flat().filter((c: any) => componentIds.includes(c.uuid));
    },

    AddComponent: ({ application_id, pageId, componentType, additionalData }): any => {
      const generatedName = GenerateName(componentType);
      addComponentAction({ name: generatedName, component_type: componentType, ...additionalData }, pageId, application_id);
    },

    DeleteComponentAction: (component: ComponentElement) => {
      const userInput = confirm("Are you sure you want to delete this component?");
      if (userInput) {
        deleteComponentAction(component.uuid, component.application_id);
      }
    },

    CopyComponentToClipboard: (component: ComponentElement) => {
      copyCpmponentToClipboard(component);
    },

    PasteComponentFromClipboard: () => {
      pasteComponentFromClipboard();
    },

    // Component Property Updates
    updateName: (component: ComponentElement, componentName: string) => {
      updateComponentName(component.application_id, component.uuid, componentName);
    },

    updateInput: (component: ComponentElement, inputName: string, handlerType: string, handlerValue: any) => {
      const eventData = { [inputName]: { type: handlerType, value: handlerValue } };
      updateComponentAttributes(component.application_id, component.uuid, "input", eventData);
    },

    updateInputHandlers: (component: ComponentElement, inputName: string, value: any) => {
      const eventData = { [inputName]: value };
      updateComponentAttributes(component.application_id, component.uuid, "inputHandlers", eventData);
    },

    updateEvent: (component: ComponentElement, symbol: string, value: any) => {
      const eventData = { [symbol]: value };
      updateComponentAttributes(component.application_id, component.uuid, "event", eventData);
    },

    updateStyle: (component: ComponentElement, symbol: string, value: any) => {
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
    },

    updateStyleHandlers: (component: ComponentElement, symbol: string, value: any) => {
      updateComponentAttributes(component.application_id, component.uuid, "styleHandlers", { [symbol]: value });
    },

    // Page Management
    AddPage: (page: any): Promise<any> => {
      return new Promise((resolve) => {
        addPageHandler(page, (page: any) => {
          resolve(page);
        });
      });
    },

    UpdatePage: (page: any): Promise<any> => {
      return new Promise((resolve) => {
        updatePageHandler(page, (page) => {
          resolve(page);
        });
      });
    },

    deletePage: (page: PageElement) => {
      const userInput = confirm("Are you sure you want to delete this page?");
      if (userInput) {
        deletePageAction(page);
      }
    },

    // Application Management
    UpdateApplication: (application) => {
      updateSepecificApplication(application);
    },

    // Utility Functions
    TraitCompoentFromSchema: (text) => {
      traitCompoentFromSchema(text);
    },

    // Function Invocation
    InvokeFunction: async (name: string, payload: any = {}) => {
      if (!ExecuteInstance.Vars.studio_functions) {
        const functions = await loadFunctionsHandler();
        ExecuteInstance.VarsProxy.studio_functions = [...functions];
      }
      const targetFunction = (ExecuteInstance.Vars.studio_functions ?? []).find(_function => _function.label === name);
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
    },

    // Navigation Functions
    NavigateToUrl: (url: string): void => {
      window.location.href = url;
      ExecuteInstance.Event?.preventDefault?.();
      ExecuteInstance.Event?.stopPropagation?.();
    },

    NavigateToHash: (hash: string): void => {
      window.location.hash = hash;
      if (hash) {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
      ExecuteInstance.Event?.preventDefault?.();
      ExecuteInstance.Event?.stopPropagation?.();
    },

    NavigateToPage: (pageName: string): void => {
      ExecuteInstance.Event?.preventDefault?.();
      ExecuteInstance.Event?.stopPropagation?.();
      const currentEditingApplication = ExecuteInstance.GetVar("currentEditingApplication");
      const appPages = ExecuteInstance.GetContextVar(
        currentEditingApplication?.uuid + ".appPages",
        currentEditingApplication?.uuid
      );
      const targetPage = appPages?.find((pageItem: any) => pageItem.name === pageName);
      if (targetPage) {
        ExecuteInstance.VarsProxy.currentPage = targetPage.uuid;
      }
    },

    // Editor Functions
    openEditorTab,
    setCurrentEditorTab,
  };
}

/**
 * Sets up ExecuteInstance with GetVar and GetContextVar functions
 */
export function registerGlobalFunctionsToExecuteInstance(globalFunctions: any): void {
  ExecuteInstance.GetVar = globalFunctions.GetVar;
  ExecuteInstance.GetContextVar = globalFunctions.GetContextVar;
}
