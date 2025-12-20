/**
 * @fileoverview Handler API Factory
 * @module Runtime/Handlers/HandlerAPIFactory
 *
 * @description
 * Factory function that creates the namespaced Handler API from runtime context.
 * This transforms the flat list of 50+ functions into organized namespaces.
 *
 * @example
 * ```typescript
 * const api = createHandlerAPI(runtimeContext, globalFunctions, component, eventData, item);
 *
 * // Now handlers can use clean namespaced access:
 * // Nav.toPage('Home')
 * // UI.toast('Saved!', 'success')
 * // Component.get('Button')
 * ```
 */

import type { HandlerAPI, NavAPI, UIAPI, ComponentAPI, DataAPI, PageAPI, AppAPI, EditorAPI, VarAPI, ToastType } from './handler-api';
import type { ComponentElement } from '../redux/store/component/component.interface';

/**
 * Runtime context extracted from RuntimeContext or MicroAppRuntimeContext
 */
interface RuntimeContextData {
  Current: any; // ComponentElement at runtime, but typed as any for flexibility
  Event: any;
  VarsProxy: Record<string, any>;
  Values: Record<string, any>;
  Apps: Record<string, any>;
  PropertiesProxy: any;
  currentPlatform: string;
  context: any;
  applications: Record<string, any>;
}

/**
 * Global functions created by createGlobalHandlerFunctions
 */
interface GlobalFunctions {
  // Navigation
  NavigateToPage: (pageName: string) => void;
  NavigateToUrl: (url: string, target?: string) => void;
  NavigateToHash: (hash: string) => void;

  // UI
  ShowToast: (message: string, duration?: number) => void;
  ShowSuccessToast: (message: string, duration?: number) => void;
  ShowErrorToast: (message: string, duration?: number) => void;
  ShowWarningToast: (message: string, duration?: number) => void;
  ShowInfoToast: (message: string, duration?: number) => void;
  HideToast: (id?: string) => void;
  ClearAllToasts: () => void;

  // Components
  GetComponent: (name: string) => ComponentElement | undefined;
  GetComponents: (pattern?: string) => ComponentElement[];
  AddComponent: (schema: any, parentId?: string) => ComponentElement | undefined;
  DeleteComponentAction: (component: ComponentElement) => void;
  CopyComponentToClipboard: (component: ComponentElement) => void;
  PasteComponentFromClipboard: (parentId?: string) => ComponentElement | undefined;
  updateInput: (component: ComponentElement, prop: string, type: string, value: any) => void;
  updateName: (component: ComponentElement, name: string) => void;
  updateEvent: (component: ComponentElement, eventName: string, handler: string) => void;
  updateStyle: (component: ComponentElement, prop: string, value: any) => void;
  updateStyleHandlers: (component: ComponentElement, handlers: Record<string, any>) => void;

  // Data
  InvokeFunction: (functionName: string, params?: Record<string, any>) => Promise<any>;
  UploadFile: (file: File | Blob, options?: any) => Promise<any>;
  BrowseFiles: (options?: any) => Promise<File[]>;

  // Pages
  AddPage: (pageData: any) => void;
  UpdatePage: (pageId: string, data: any) => void;
  deletePage: (pageId: string) => void;

  // App
  UpdateApplication: (data: any) => void;

  // Variables
  GetVar: (name: string) => any;
  SetVar: (name: string, value: any) => void;
  GetContextVar: (name: string) => any;
  SetContextVar: (name: string, value: any) => void;

  // Editor
  openEditorTab: (tabName: string) => void;
  setCurrentEditorTab: (tabName: string) => void;
  TraitCompoentFromSchema: (schema: any) => any;
}

/**
 * Creates the Navigation API namespace.
 */
function createNavAPI(globalFunctions: GlobalFunctions): NavAPI {
  return {
    toPage: globalFunctions.NavigateToPage,
    toUrl: (url: string, target?: '_blank' | '_self') => {
      globalFunctions.NavigateToUrl(url, target);
    },
    toHash: globalFunctions.NavigateToHash,
  };
}

/**
 * Creates the UI API namespace.
 */
function createUIAPI(globalFunctions: GlobalFunctions): UIAPI {
  return {
    toast: (message: string, type: ToastType = 'default', duration?: number) => {
      switch (type) {
        case 'success':
          globalFunctions.ShowSuccessToast(message, duration);
          break;
        case 'error':
          globalFunctions.ShowErrorToast(message, duration);
          break;
        case 'warning':
          globalFunctions.ShowWarningToast(message, duration);
          break;
        case 'info':
          globalFunctions.ShowInfoToast(message, duration);
          break;
        default:
          globalFunctions.ShowToast(message, duration);
      }
    },
    success: (message: string, duration?: number) => globalFunctions.ShowSuccessToast(message, duration),
    error: (message: string, duration?: number) => globalFunctions.ShowErrorToast(message, duration),
    warning: (message: string, duration?: number) => globalFunctions.ShowWarningToast(message, duration),
    info: (message: string, duration?: number) => globalFunctions.ShowInfoToast(message, duration),
    hideToast: globalFunctions.HideToast,
    clearToasts: globalFunctions.ClearAllToasts,
  };
}

/**
 * Creates the Component API namespace.
 */
function createComponentAPI(globalFunctions: GlobalFunctions): ComponentAPI {
  return {
    get: globalFunctions.GetComponent,
    getAll: globalFunctions.GetComponents,
    add: globalFunctions.AddComponent,
    delete: globalFunctions.DeleteComponentAction,
    copy: globalFunctions.CopyComponentToClipboard,
    paste: globalFunctions.PasteComponentFromClipboard,
    updateInput: globalFunctions.updateInput as any,
    updateName: globalFunctions.updateName,
    updateEvent: globalFunctions.updateEvent,
    updateStyle: globalFunctions.updateStyle,
    updateStyleHandlers: globalFunctions.updateStyleHandlers,
  };
}

/**
 * Creates the Data API namespace.
 */
function createDataAPI(globalFunctions: GlobalFunctions): DataAPI {
  return {
    invoke: globalFunctions.InvokeFunction,
    upload: globalFunctions.UploadFile,
    browse: globalFunctions.BrowseFiles,
  };
}

/**
 * Creates the Page API namespace.
 */
function createPageAPI(globalFunctions: GlobalFunctions): PageAPI {
  return {
    add: globalFunctions.AddPage,
    update: globalFunctions.UpdatePage,
    delete: globalFunctions.deletePage,
  };
}

/**
 * Creates the App API namespace.
 */
function createAppAPI(globalFunctions: GlobalFunctions, runtimeContext: RuntimeContextData): AppAPI {
  return {
    update: globalFunctions.UpdateApplication,
    all: runtimeContext.applications,
    context: runtimeContext.context,
  };
}

/**
 * Creates the Editor API namespace.
 */
function createEditorAPI(globalFunctions: GlobalFunctions, customConsole: any): EditorAPI {
  return {
    openTab: globalFunctions.openEditorTab,
    setTab: globalFunctions.setCurrentEditorTab,
    traitFromSchema: globalFunctions.TraitCompoentFromSchema,
    console: customConsole,
  };
}

/**
 * Creates the Variable API namespace.
 */
function createVarAPI(globalFunctions: GlobalFunctions): VarAPI {
  return {
    get: globalFunctions.GetVar,
    set: globalFunctions.SetVar,
    getContext: globalFunctions.GetContextVar,
    setContext: globalFunctions.SetContextVar,
  };
}

/**
 * Creates the complete namespaced Handler API.
 *
 * This factory transforms the flat list of runtime functions into organized
 * namespaces that are easier to discover, document, and use.
 *
 * @param runtimeContext - Extracted runtime context data
 * @param globalFunctions - Global handler functions
 * @param component - Current component being executed
 * @param eventData - Event data from triggering event
 * @param item - Item data for collection contexts
 * @param customConsole - Editor-aware console
 * @param database - Database client
 * @param eventDispatcher - Event dispatcher
 * @param utils - Utility functions (RuntimeHelpers)
 *
 * @returns Complete namespaced Handler API
 *
 * @example
 * ```typescript
 * const api = createHandlerAPI(runtimeContext, globalFunctions, ...);
 *
 * // In handler code:
 * Nav.toPage('Dashboard')
 * UI.toast('Welcome!', 'success')
 * const user = await Data.invoke('getUser', { id: 1 })
 * Component.updateInput(Current, 'name', 'static', user.name)
 * ```
 */
export function createHandlerAPI(
  runtimeContext: RuntimeContextData,
  globalFunctions: GlobalFunctions,
  component: ComponentElement,
  eventData: any,
  item: any,
  customConsole: any,
  database: any,
  eventDispatcher: any,
  utils: any
): HandlerAPI {
  return {
    // Namespaced APIs
    Nav: createNavAPI(globalFunctions),
    UI: createUIAPI(globalFunctions),
    Component: createComponentAPI(globalFunctions),
    Data: createDataAPI(globalFunctions),
    Page: createPageAPI(globalFunctions),
    App: createAppAPI(globalFunctions, runtimeContext),
    Editor: createEditorAPI(globalFunctions, customConsole),
    Var: createVarAPI(globalFunctions),

    // Direct access (commonly used values)
    Current: runtimeContext.Current,
    Event: runtimeContext.Event,
    Item: item,
    Instance: (component as any).Instance || {},
    Vars: runtimeContext.VarsProxy,
    Values: runtimeContext.Values,
    Apps: runtimeContext.Apps,
    Platform: runtimeContext.currentPlatform,
    Database: database,
    Events: eventDispatcher,
    Utils: utils,
    console: customConsole,
  };
}

/**
 * Extracts individual parameters from HandlerAPI for backwards compatibility.
 *
 * This allows the new namespaced API to coexist with legacy flat parameters.
 * During migration, handlers can use either style.
 *
 * @param api - The namespaced Handler API
 * @returns Object with all legacy parameter names mapped to their values
 */
export function extractLegacyParameters(api: HandlerAPI): Record<string, any> {
  return {
    // Core context
    Current: api.Current,
    Event: api.Event,
    Item: api.Item,
    Instance: api.Instance,
    Vars: api.Vars,
    Values: api.Values,
    Apps: api.Apps,
    currentPlatform: api.Platform,
    Database: api.Database,
    eventHandler: api.Events,
    Components: api.Component,
    Editor: api.Editor,
    Utils: api.Utils,
    console: api.console,
    context: api.App.context,
    applications: api.App.all,

    // Navigation
    NavigateToPage: api.Nav.toPage,
    NavigateToUrl: api.Nav.toUrl,
    NavigateToHash: api.Nav.toHash,

    // UI
    ShowToast: (msg: string, dur?: number) => api.UI.toast(msg, 'default', dur),
    ShowSuccessToast: api.UI.success,
    ShowErrorToast: api.UI.error,
    ShowWarningToast: api.UI.warning,
    ShowInfoToast: api.UI.info,
    HideToast: api.UI.hideToast,
    ClearAllToasts: api.UI.clearToasts,

    // Components
    GetComponent: api.Component.get,
    GetComponents: api.Component.getAll,
    AddComponent: api.Component.add,
    DeleteComponentAction: api.Component.delete,
    CopyComponentToClipboard: api.Component.copy,
    PasteComponentFromClipboard: api.Component.paste,
    updateInput: api.Component.updateInput,
    updateName: api.Component.updateName,
    updateEvent: api.Component.updateEvent,
    updateStyle: api.Component.updateStyle,
    updateStyleHandlers: api.Component.updateStyleHandlers,

    // Data
    InvokeFunction: api.Data.invoke,
    UploadFile: api.Data.upload,
    BrowseFiles: api.Data.browse,

    // Pages
    AddPage: api.Page.add,
    UpdatePage: api.Page.update,
    deletePage: api.Page.delete,

    // App
    UpdateApplication: api.App.update,

    // Variables
    GetVar: api.Var.get,
    SetVar: api.Var.set,
    GetContextVar: api.Var.getContext,
    SetContextVar: api.Var.setContext,

    // Editor
    openEditorTab: api.Editor.openTab,
    setCurrentEditorTab: api.Editor.setTab,
    TraitCompoentFromSchema: api.Editor.traitFromSchema,
  };
}
