/**
 * @fileoverview SSR Handler Executor
 * @module Runtime/SSR/SSRHandlerExecutor
 *
 * @description
 * Executes handlers in SSR mode with side-effect collection.
 *
 * Key differences from client-side execution:
 * - Side effects (SetVar, NavigateToPage, etc.) are collected, not executed
 * - Uses request-scoped SSRRuntimeContext instead of global ExecuteInstance
 * - No event emission (SSR is one-shot render)
 * - Complexity limits enforced to prevent DoS
 */

import type { IRuntimeContext } from '../types/IRuntimeContext';
import type { SSRExecutionResult, SSRSideEffect, SSRSideEffectType, SSRHandlerOptions } from './types';
import type { SSRRuntimeContext } from './SSRRuntimeContext';
import { validateHandlerCode } from '../utils/handler-validator';
import { compileHandlerFunction, HANDLER_PARAMETERS, createHandlerScope } from '../handlers/compiler';
import { classifyHandler } from './handler-classifier';
import { analyzeComplexity, SSR_COMPLEXITY_LIMITS } from './complexity-analyzer';

/**
 * Execute a handler in SSR mode
 *
 * @param context - SSR runtime context (request-scoped)
 * @param component - Component the handler belongs to
 * @param code - Handler code string
 * @param EventData - Event data (typically empty for SSR)
 * @param item - Collection item data (if in a loop)
 * @param options - Execution options
 * @returns Execution result with value and collected side effects
 */
export function executeSSRHandler(
  context: IRuntimeContext,
  component: any,
  code: string,
  EventData: any = {},
  item: any = {},
  options: SSRHandlerOptions = {}
): SSRExecutionResult {
  const sideEffects: SSRSideEffect[] = [];
  const {
    timeoutMs = SSR_COMPLEXITY_LIMITS.maxTimeoutMs,
    collectSideEffects = true,
    handlerType = 'input',
  } = options;

  // Empty code returns undefined
  if (!code || code.trim() === '') {
    return { value: undefined, sideEffects: [] };
  }

  // 1. Validate code (same validation as client)
  const validation = validateHandlerCode(code);
  if (!validation.valid) {
    return {
      value: undefined,
      sideEffects: [],
      error: `Validation failed: ${validation.errors[0]?.message || 'Unknown error'}`,
    };
  }

  // 2. Check complexity limits
  const complexity = analyzeComplexity(code);
  if (complexity.exceedsLimits) {
    return {
      value: undefined,
      sideEffects: [],
      error: `Complexity exceeds SSR limits: ${complexity.reason}`,
    };
  }

  // 3. Classify handler
  const classification = classifyHandler(code);
  if (classification.classification === 'client-only') {
    // Skip client-only handlers, return undefined
    return {
      value: undefined,
      sideEffects: [],
      error: `Handler is client-only: ${classification.reason}`,
    };
  }

  // 4. Create SSR API surface
  const ssrAPI = createSSRAPI(context, component, sideEffects, collectSideEffects, handlerType);

  // 5. Compile function (benefits from cache)
  let compiledFn: Function;
  try {
    compiledFn = compileHandlerFunction(code);
  } catch (error) {
    return {
      value: undefined,
      sideEffects: [],
      error: `Compilation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }

  // 6. Execute with timing
  const startTime = performance.now();
  try {
    const result = compiledFn(...buildSSRParameters(context, ssrAPI, component, EventData, item));
    const elapsed = performance.now() - startTime;

    // Warn if slow (but don't fail)
    if (elapsed > SSR_COMPLEXITY_LIMITS.recommendedTimeoutMs) {
      console.warn(`SSR handler took ${elapsed.toFixed(2)}ms (recommended: ${SSR_COMPLEXITY_LIMITS.recommendedTimeoutMs}ms)`);
    }

    return {
      value: result,
      sideEffects,
    };
  } catch (error) {
    return {
      value: undefined,
      sideEffects,
      error: `Execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Create SSR API surface - safe APIs work, side-effect APIs are collected
 */
function createSSRAPI(
  context: IRuntimeContext,
  component: any,
  sideEffects: SSRSideEffect[],
  collectSideEffects: boolean,
  handlerType: string
): Record<string, any> {
  const ssrContext = context as SSRRuntimeContext;

  // Helper to create a side-effect collector
  const createCollector = (type: SSRSideEffectType) => {
    return (...args: any[]) => {
      if (collectSideEffects) {
        sideEffects.push({
          type,
          args,
          componentId: component.uuid,
          handlerType: handlerType as any,
        });
      }
      // Return undefined - value won't be available until client hydration
      return undefined;
    };
  };

  // Safe APIs - actually execute
  const safeAPIs = {
    // Variable access (read-only from context)
    GetVar: (name: string) => context.getVar(name),
    GetContextVar: (scope: string, name: string) => context.context[scope]?.[name]?.value,

    // Component queries
    GetComponent: (name: string, appId?: string) => context.getComponent(name, appId),
    GetComponents: () => context.getAllComponents?.() ?? [],

    // User/auth checks
    GetCurrentUser: () => ssrContext.getCurrentUser?.() ?? null,
    IsAuthenticated: () => ssrContext.isAuthenticated?.() ?? false,
    HasRole: (role: string) => ssrContext.hasRole?.(role) ?? false,
    HasAnyRole: (roles: string[]) => ssrContext.hasAnyRole?.(roles) ?? false,
    HasAllRoles: (roles: string[]) => ssrContext.hasAllRoles?.(roles) ?? false,
    CurrentUser: ssrContext.getCurrentUser?.() ?? null,

    // Context access
    Apps: context.Apps,
    Vars: context.VarsProxy,
    Values: context.Values,
    context: context.context,
    applications: context.applications,
    currentPlatform: context.currentPlatform,

    // Utilities
    Utils: {
      // Add any safe utility functions here
      formatDate: (date: Date | string) => new Date(date).toLocaleDateString(),
      formatNumber: (num: number) => num.toLocaleString(),
    },
    console: {
      log: (...args: any[]) => console.log('[SSR]', ...args),
      warn: (...args: any[]) => console.warn('[SSR]', ...args),
      error: (...args: any[]) => console.error('[SSR]', ...args),
      info: (...args: any[]) => console.info('[SSR]', ...args),
      debug: (...args: any[]) => console.debug('[SSR]', ...args),
    },
  };

  // Side-effect APIs - collect but don't execute
  const sideEffectAPIs = {
    // Variable mutations
    SetVar: createCollector('SetVar'),
    SetContextVar: createCollector('SetContextVar'),

    // Navigation
    NavigateToPage: createCollector('NavigateToPage'),
    NavigateToUrl: createCollector('NavigateToUrl'),
    NavigateToHash: createCollector('NavigateToHash'),

    // Toasts
    ShowToast: createCollector('ShowToast'),
    ShowSuccessToast: createCollector('ShowSuccessToast'),
    ShowErrorToast: createCollector('ShowErrorToast'),
    ShowWarningToast: createCollector('ShowWarningToast'),
    ShowInfoToast: createCollector('ShowInfoToast'),
    HideToast: createCollector('HideToast'),
    ClearAllToasts: createCollector('ClearAllToasts'),

    // Popconfirms
    ShowPopconfirm: createCollector('ShowPopconfirm'),
    Confirm: createCollector('Confirm'),
    ShowDeleteConfirm: createCollector('ShowDeleteConfirm'),
    ShowWarningConfirm: createCollector('ShowWarningConfirm'),
    ClosePopconfirm: createCollector('ClosePopconfirm'),
    CloseAllPopconfirms: createCollector('CloseAllPopconfirms'),

    // Modals
    OpenModal: createCollector('OpenModal'),
    CloseModal: createCollector('CloseModal'),
    ToggleModal: createCollector('ToggleModal'),
    ShowShareModal: createCollector('ShowShareModal'),
    CloseShareModal: createCollector('CloseShareModal'),

    // Component mutations
    AddComponent: createCollector('AddComponent'),
    DeleteComponentAction: createCollector('DeleteComponentAction'),
    updateInput: createCollector('updateInput'),
    updateName: createCollector('updateName'),
    updateEvent: createCollector('updateEvent'),
    updateStyle: createCollector('updateStyle'),
    updateStyleHandlers: createCollector('updateStyleHandlers'),
    CopyComponentToClipboard: createCollector('CopyComponentToClipboard'),
    PasteComponentFromClipboard: createCollector('PasteComponentFromClipboard'),
    TraitCompoentFromSchema: createCollector('TraitCompoentFromSchema'),

    // Application/Page mutations
    UpdateApplication: createCollector('UpdateApplication'),
    DeleteApplication: createCollector('DeleteApplication'),
    AddPage: createCollector('AddPage'),
    UpdatePage: createCollector('UpdatePage'),
    deletePage: createCollector('deletePage'),

    // Backend calls - these return undefined in SSR
    InvokeFunction: (...args: any[]) => {
      sideEffects.push({
        type: 'InvokeFunction',
        args,
        componentId: component.uuid,
        handlerType: handlerType as any,
      });
      // Return a promise that resolves to undefined for SSR
      return Promise.resolve(undefined);
    },
    UploadFile: createCollector('UploadFile'),
    BrowseFiles: createCollector('BrowseFiles'),

    // Editor mutations
    openEditorTab: createCollector('openEditorTab'),
    setCurrentEditorTab: createCollector('setCurrentEditorTab'),
  };

  return { ...safeAPIs, ...sideEffectAPIs };
}

/**
 * Build parameters array for compiled function execution
 * Must match HANDLER_PARAMETERS order from compiler.ts
 */
function buildSSRParameters(
  context: IRuntimeContext,
  ssrAPI: Record<string, any>,
  component: any,
  EventData: any,
  item: any
): any[] {
  // Create a no-op event dispatcher for SSR
  const noopEventDispatcher = {
    emit: () => {},
    on: () => () => {},
    off: () => {},
  };

  // Create a minimal Editor object for SSR
  const ssrEditor = {
    components: context.getAllComponents?.() ?? [],
    selectedComponents: [],
    Vars: {},
    Console: {
      log: (...args: any[]) => console.log('[SSR]', ...args),
      warn: (...args: any[]) => console.warn('[SSR]', ...args),
      error: (...args: any[]) => console.error('[SSR]', ...args),
      info: (...args: any[]) => console.info('[SSR]', ...args),
      debug: (...args: any[]) => console.debug('[SSR]', ...args),
    },
  };

  // Create namespaced APIs for SSR
  const Nav = {
    toPage: ssrAPI.NavigateToPage,
    toUrl: ssrAPI.NavigateToUrl,
    toHash: ssrAPI.NavigateToHash,
  };

  const UI = {
    showToast: ssrAPI.ShowToast,
    showSuccess: ssrAPI.ShowSuccessToast,
    showError: ssrAPI.ShowErrorToast,
    showWarning: ssrAPI.ShowWarningToast,
    showInfo: ssrAPI.ShowInfoToast,
    openModal: ssrAPI.OpenModal,
    closeModal: ssrAPI.CloseModal,
  };

  const Component = {
    get: ssrAPI.GetComponent,
    getAll: ssrAPI.GetComponents,
    add: ssrAPI.AddComponent,
    delete: ssrAPI.DeleteComponentAction,
  };

  const Data = {
    invoke: ssrAPI.InvokeFunction,
  };

  const Page = {
    add: ssrAPI.AddPage,
    update: ssrAPI.UpdatePage,
    delete: ssrAPI.deletePage,
  };

  const App = {
    update: ssrAPI.UpdateApplication,
    delete: ssrAPI.DeleteApplication,
  };

  const Var = {
    get: ssrAPI.GetVar,
    set: ssrAPI.SetVar,
    getContext: ssrAPI.GetContextVar,
    setContext: ssrAPI.SetContextVar,
  };

  // Build parameters in HANDLER_PARAMETERS order
  return [
    noopEventDispatcher,        // eventHandler
    context.PropertiesProxy,     // Components
    ssrEditor,                   // Editor
    EventData?.event,            // Event
    JSON.parse(JSON.stringify(item ?? {})), // Item
    component,                   // Current
    context.currentPlatform,     // currentPlatform
    context.Values,              // Values
    context.Apps,                // Apps
    context.VarsProxy,           // Vars
    ssrAPI.SetVar,               // SetVar
    ssrAPI.GetContextVar,        // GetContextVar
    ssrAPI.UpdateApplication,    // UpdateApplication
    ssrAPI.DeleteApplication,    // DeleteApplication
    ssrAPI.GetVar,               // GetVar
    ssrAPI.GetComponent,         // GetComponent
    ssrAPI.GetComponents,        // GetComponents
    ssrAPI.AddComponent,         // AddComponent
    ssrAPI.SetContextVar,        // SetContextVar
    ssrAPI.AddPage,              // AddPage
    ssrAPI.TraitCompoentFromSchema, // TraitCompoentFromSchema
    ssrAPI.NavigateToUrl,        // NavigateToUrl
    ssrAPI.NavigateToHash,       // NavigateToHash
    ssrAPI.NavigateToPage,       // NavigateToPage
    ssrAPI.UpdatePage,           // UpdatePage
    context.context,             // context
    context.applications,        // applications
    ssrAPI.updateInput,          // updateInput
    ssrAPI.deletePage,           // deletePage
    ssrAPI.CopyComponentToClipboard,  // CopyComponentToClipboard
    ssrAPI.PasteComponentFromClipboard, // PasteComponentFromClipboard
    ssrAPI.DeleteComponentAction, // DeleteComponentAction
    ssrAPI.updateName,           // updateName
    ssrAPI.updateEvent,          // updateEvent
    ssrAPI.updateStyleHandlers,  // updateStyleHandlers
    EventData,                   // EventData
    ssrAPI.updateStyle,          // updateStyle
    ssrAPI.openEditorTab,        // openEditorTab
    ssrAPI.setCurrentEditorTab,  // setCurrentEditorTab
    ssrAPI.InvokeFunction,       // InvokeFunction
    ssrAPI.Utils,                // Utils
    ssrAPI.console,              // console
    ssrAPI.UploadFile,           // UploadFile
    ssrAPI.BrowseFiles,          // BrowseFiles
    component.Instance || {},    // Instance
    ssrAPI.ShowToast,            // ShowToast
    ssrAPI.ShowSuccessToast,     // ShowSuccessToast
    ssrAPI.ShowErrorToast,       // ShowErrorToast
    ssrAPI.ShowWarningToast,     // ShowWarningToast
    ssrAPI.ShowInfoToast,        // ShowInfoToast
    ssrAPI.HideToast,            // HideToast
    ssrAPI.ClearAllToasts,       // ClearAllToasts
    ssrAPI.ShowPopconfirm,       // ShowPopconfirm
    ssrAPI.Confirm,              // Confirm
    ssrAPI.ShowDeleteConfirm,    // ShowDeleteConfirm
    ssrAPI.ShowWarningConfirm,   // ShowWarningConfirm
    ssrAPI.ClosePopconfirm,      // ClosePopconfirm
    ssrAPI.CloseAllPopconfirms,  // CloseAllPopconfirms
    ssrAPI.OpenModal,            // OpenModal
    ssrAPI.CloseModal,           // CloseModal
    ssrAPI.ToggleModal,          // ToggleModal
    ssrAPI.ShowShareModal,       // ShowShareModal
    ssrAPI.CloseShareModal,      // CloseShareModal
    createHandlerScope,          // __createScope__
    Nav,                         // Nav
    UI,                          // UI
    Component,                   // Component
    Data,                        // Data
    Page,                        // Page
    App,                         // App
    Var,                         // Var
    ssrAPI.GetCurrentUser,       // GetCurrentUser
    ssrAPI.IsAuthenticated,      // IsAuthenticated
    ssrAPI.HasRole,              // HasRole
    ssrAPI.HasAnyRole,           // HasAnyRole
    ssrAPI.HasAllRoles,          // HasAllRoles
    ssrAPI.CurrentUser,          // CurrentUser
    context.listeners || {},     // listeners
  ];
}

/**
 * Execute multiple handlers and collect all side effects
 */
export function executeSSRHandlers(
  context: IRuntimeContext,
  handlers: Array<{ component: any; code: string; type: 'input' | 'event' | 'style' }>
): {
  results: SSRExecutionResult[];
  allSideEffects: SSRSideEffect[];
} {
  const results: SSRExecutionResult[] = [];
  const allSideEffects: SSRSideEffect[] = [];

  for (const { component, code, type } of handlers) {
    const result = executeSSRHandler(context, component, code, {}, {}, {
      handlerType: type,
    });
    results.push(result);
    allSideEffects.push(...result.sideEffects);
  }

  return { results, allSideEffects };
}
