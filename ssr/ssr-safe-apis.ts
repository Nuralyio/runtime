/**
 * @fileoverview SSR-Safe API Definitions
 * @module Runtime/SSR/SSRSafeAPIs
 *
 * @description
 * Defines which runtime APIs are safe to execute during SSR and which
 * have side effects that need to be collected for client-side execution.
 *
 * SSR-Safe APIs:
 * - Read-only operations (GetVar, GetComponent, etc.)
 * - Pure computations (no external effects)
 * - User/auth checks
 *
 * Side-Effect APIs:
 * - State mutations (SetVar, updateInput, etc.)
 * - Navigation
 * - UI notifications (toasts, modals)
 * - Backend calls (InvokeFunction)
 */

/**
 * APIs that are safe to execute during SSR (read-only, no side effects)
 */
export const SSR_SAFE_APIS = new Set([
  // Variable access (read-only)
  'GetVar',
  'GetContextVar',

  // Component queries (read-only)
  'GetComponent',
  'GetComponents',

  // User/auth checks (read-only)
  'GetCurrentUser',
  'IsAuthenticated',
  'HasRole',
  'HasAnyRole',
  'HasAllRoles',
  'CurrentUser',

  // Context access (read-only)
  'Item',
  'Current',
  'Values',
  'Apps',
  'Vars', // Read-only access via proxy
  'Event',
  'currentPlatform',
  'context',
  'applications',
  'Instance',
  'Components',
  'Editor',
  'EventData',

  // Utilities (pure functions)
  'Utils',
  'console',

  // Namespaced read-only APIs
  'Nav',
  'UI',
  'Component',
  'Data',
  'Page',
  'App',
  'Var',
]);

/**
 * APIs that have side effects - will be collected but NOT executed during SSR
 */
export const SSR_SIDE_EFFECT_APIS = new Set([
  // Variable mutations
  'SetVar',
  'SetContextVar',

  // Navigation
  'NavigateToPage',
  'NavigateToUrl',
  'NavigateToHash',

  // UI notifications - Toasts
  'ShowToast',
  'ShowSuccessToast',
  'ShowErrorToast',
  'ShowWarningToast',
  'ShowInfoToast',
  'HideToast',
  'ClearAllToasts',

  // UI notifications - Popconfirms
  'ShowPopconfirm',
  'Confirm',
  'ShowDeleteConfirm',
  'ShowWarningConfirm',
  'ClosePopconfirm',
  'CloseAllPopconfirms',

  // UI notifications - Modals
  'OpenModal',
  'CloseModal',
  'ToggleModal',
  'ShowShareModal',
  'CloseShareModal',

  // Component mutations
  'AddComponent',
  'DeleteComponentAction',
  'updateInput',
  'updateName',
  'updateEvent',
  'updateStyle',
  'updateStyleHandlers',
  'CopyComponentToClipboard',
  'PasteComponentFromClipboard',
  'TraitCompoentFromSchema',

  // Application/Page mutations
  'UpdateApplication',
  'DeleteApplication',
  'AddPage',
  'UpdatePage',
  'deletePage',

  // Backend calls (async)
  'InvokeFunction',
  'UploadFile',
  'BrowseFiles',

  // Editor mutations
  'openEditorTab',
  'setCurrentEditorTab',
]);

/**
 * APIs that should cause a handler to be classified as client-only
 * (typically async operations that can't be reasonably executed in SSR)
 */
export const SSR_CLIENT_ONLY_APIS = new Set([
  'InvokeFunction', // Async backend call
  'UploadFile', // File operations
  'BrowseFiles', // File operations
]);

/**
 * Check if an API is safe for SSR execution
 */
export function isSSRSafeAPI(apiName: string): boolean {
  return SSR_SAFE_APIS.has(apiName);
}

/**
 * Check if an API has side effects
 */
export function isSSRSideEffectAPI(apiName: string): boolean {
  return SSR_SIDE_EFFECT_APIS.has(apiName);
}

/**
 * Check if an API should force client-only execution
 */
export function isClientOnlyAPI(apiName: string): boolean {
  return SSR_CLIENT_ONLY_APIS.has(apiName);
}

/**
 * Get all known API names (for validation)
 */
export function getAllKnownAPIs(): Set<string> {
  return new Set([...SSR_SAFE_APIS, ...SSR_SIDE_EFFECT_APIS]);
}
