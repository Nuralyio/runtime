/**
 * @fileoverview Handler API - Namespaced API for Handler Execution
 * @module Runtime/Handlers/HandlerAPI
 *
 * @description
 * Provides a clean, namespaced API structure for handler code execution.
 * Instead of 50+ individual parameters, handlers receive organized namespaces.
 *
 * This follows patterns from professional tools like:
 * - Figma Plugin API: `figma.currentPage`, `figma.ui.postMessage()`
 * - Unity: `Transform.position`, `Input.GetKey()`
 * - Godot: `Input.is_action_pressed()`, `OS.get_time()`
 *
 * @example Handler code with namespaced API:
 * ```javascript
 * // Navigation
 * Nav.toPage('Dashboard')
 * Nav.toUrl('https://example.com')
 *
 * // UI feedback
 * UI.toast('Saved!', 'success')
 * UI.clearToasts()
 *
 * // Component operations
 * const btn = Component.get('SubmitButton')
 * Component.update(Current, 'text', 'static', 'Hello')
 *
 * // Data operations
 * const result = await Data.invoke('getUserData', { id: 123 })
 * await Data.upload(file)
 *
 * // Variables (reactive)
 * Vars.username = 'John'
 * const count = Vars.count || 0
 *
 * // Or with $ prefix
 * $username = 'John'
 * $count++
 * ```
 */

import type { ComponentElement } from '../redux/store/component/component.interface';

// ============================================================================
// Navigation API
// ============================================================================

/**
 * Navigation namespace for page and URL navigation.
 */
export interface NavAPI {
  /** Navigate to a page by name */
  toPage: (pageName: string) => void;

  /** Navigate to an external URL */
  toUrl: (url: string, target?: '_blank' | '_self') => void;

  /** Navigate to a hash/anchor */
  toHash: (hash: string) => void;
}

// ============================================================================
// UI API
// ============================================================================

/**
 * Toast notification types for UI.toast()
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'default';

/**
 * UI namespace for visual feedback and notifications.
 */
export interface UIAPI {
  /** Show a toast notification */
  toast: (message: string, type?: ToastType, duration?: number) => void;

  /** Show success toast (shorthand) */
  success: (message: string, duration?: number) => void;

  /** Show error toast (shorthand) */
  error: (message: string, duration?: number) => void;

  /** Show warning toast (shorthand) */
  warning: (message: string, duration?: number) => void;

  /** Show info toast (shorthand) */
  info: (message: string, duration?: number) => void;

  /** Hide a specific toast or all toasts */
  hideToast: (id?: string) => void;

  /** Clear all active toasts */
  clearToasts: () => void;
}

// ============================================================================
// Component API
// ============================================================================

/**
 * Component namespace for component operations.
 */
export interface ComponentAPI {
  /** Get a component by name */
  get: (name: string) => ComponentElement | undefined;

  /** Get multiple components by name pattern or all */
  getAll: (pattern?: string) => ComponentElement[];

  /** Add a new component */
  add: (schema: any, parentId?: string) => ComponentElement | undefined;

  /** Delete a component */
  delete: (component: ComponentElement) => void;

  /** Copy component to clipboard */
  copy: (component: ComponentElement) => void;

  /** Paste component from clipboard */
  paste: (parentId?: string) => ComponentElement | undefined;

  /** Update component input property */
  updateInput: (
    component: ComponentElement,
    prop: string,
    type: 'static' | 'handler',
    value: any
  ) => void;

  /** Update component name */
  updateName: (component: ComponentElement, name: string) => void;

  /** Update component event handler */
  updateEvent: (component: ComponentElement, eventName: string, handler: string) => void;

  /** Update component style */
  updateStyle: (component: ComponentElement, prop: string, value: any) => void;

  /** Update component style handlers */
  updateStyleHandlers: (component: ComponentElement, handlers: Record<string, any>) => void;
}

// ============================================================================
// Data API
// ============================================================================

/**
 * Data namespace for backend operations and file handling.
 */
export interface DataAPI {
  /** Invoke a backend function */
  invoke: (functionName: string, params?: Record<string, any>) => Promise<any>;

  /** Upload a file */
  upload: (file: File | Blob, options?: { path?: string }) => Promise<any>;

  /** Browse for files (opens file picker) */
  browse: (options?: { accept?: string; multiple?: boolean }) => Promise<File[]>;
}

// ============================================================================
// Page API
// ============================================================================

/**
 * Page namespace for page management operations.
 */
export interface PageAPI {
  /** Add a new page */
  add: (pageData: any) => void;

  /** Update page properties */
  update: (pageId: string, data: any) => void;

  /** Delete a page */
  delete: (pageId: string) => void;
}

// ============================================================================
// App API
// ============================================================================

/**
 * App namespace for application-level operations.
 */
export interface AppAPI {
  /** Update application settings */
  update: (data: any) => void;

  /** Get all applications */
  all: Record<string, any>;

  /** Get current application context */
  context: any;
}

// ============================================================================
// Editor API
// ============================================================================

/**
 * Editor namespace for editor-specific operations.
 * Only available in edit mode, not in preview/published apps.
 */
export interface EditorAPI {
  /** Open an editor tab */
  openTab: (tabName: string) => void;

  /** Set current editor tab */
  setTab: (tabName: string) => void;

  /** Trait component from schema */
  traitFromSchema: (schema: any) => any;

  /** Console logging (appears in editor console) */
  console: {
    log: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;
    info: (...args: any[]) => void;
    debug: (...args: any[]) => void;
  };
}

// ============================================================================
// Variable API
// ============================================================================

/**
 * Variable namespace for reactive state management.
 */
export interface VarAPI {
  /** Get a variable value */
  get: (name: string) => any;

  /** Set a variable value */
  set: (name: string, value: any) => void;

  /** Get context variable */
  getContext: (name: string) => any;

  /** Set context variable */
  setContext: (name: string, value: any) => void;
}

// ============================================================================
// Complete Handler API
// ============================================================================

/**
 * Complete Handler API structure passed to handler code.
 *
 * This combines all namespaced APIs into a single object that provides
 * clean, organized access to all runtime functionality.
 */
export interface HandlerAPI {
  // ==================== Namespaced APIs ====================

  /** Navigation operations */
  Nav: NavAPI;

  /** UI feedback (toasts, etc.) */
  UI: UIAPI;

  /** Component operations */
  Component: ComponentAPI;

  /** Data/backend operations */
  Data: DataAPI;

  /** Page management */
  Page: PageAPI;

  /** Application operations */
  App: AppAPI;

  /** Editor operations (edit mode only) */
  Editor: EditorAPI;

  /** Variable get/set functions */
  Var: VarAPI;

  // ==================== Direct Access ====================

  /** Current component being executed */
  Current: ComponentElement;

  /** Event data from triggering event */
  Event: any;

  /** Item data (for collection/list contexts) */
  Item: any;

  /** Component instance state */
  Instance: any;

  /** Direct Vars proxy for reactive access */
  Vars: Record<string, any>;

  /** Direct Values proxy */
  Values: Record<string, any>;

  /** All applications */
  Apps: Record<string, any>;

  /** Current platform info */
  Platform: string;

  /** Database client */
  Database: any;

  /** Event dispatcher for custom events */
  Events: any;

  /** Utility functions */
  Utils: any;

  /** Console (editor-aware logging) */
  console: Console;
}

// ============================================================================
// Legacy Parameter Names (for backwards compatibility)
// ============================================================================

/**
 * Maps legacy parameter names to their new namespaced locations.
 * This allows gradual migration from old API to new namespaced API.
 */
export const LEGACY_TO_NAMESPACED: Record<string, string> = {
  // Navigation
  NavigateToPage: 'Nav.toPage',
  NavigateToUrl: 'Nav.toUrl',
  NavigateToHash: 'Nav.toHash',

  // UI
  ShowToast: 'UI.toast',
  ShowSuccessToast: 'UI.success',
  ShowErrorToast: 'UI.error',
  ShowWarningToast: 'UI.warning',
  ShowInfoToast: 'UI.info',
  HideToast: 'UI.hideToast',
  ClearAllToasts: 'UI.clearToasts',

  // Components
  GetComponent: 'Component.get',
  GetComponents: 'Component.getAll',
  AddComponent: 'Component.add',
  DeleteComponentAction: 'Component.delete',
  CopyComponentToClipboard: 'Component.copy',
  PasteComponentFromClipboard: 'Component.paste',
  updateInput: 'Component.updateInput',
  updateName: 'Component.updateName',
  updateEvent: 'Component.updateEvent',
  updateStyle: 'Component.updateStyle',
  updateStyleHandlers: 'Component.updateStyleHandlers',

  // Data
  InvokeFunction: 'Data.invoke',
  UploadFile: 'Data.upload',
  BrowseFiles: 'Data.browse',

  // Pages
  AddPage: 'Page.add',
  UpdatePage: 'Page.update',
  deletePage: 'Page.delete',

  // App
  UpdateApplication: 'App.update',

  // Variables
  GetVar: 'Var.get',
  SetVar: 'Var.set',
  GetContextVar: 'Var.getContext',
  SetContextVar: 'Var.setContext',

  // Editor
  openEditorTab: 'Editor.openTab',
  setCurrentEditorTab: 'Editor.setTab',
  TraitCompoentFromSchema: 'Editor.traitFromSchema',
};
