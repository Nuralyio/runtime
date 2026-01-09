/**
 * @fileoverview SSR Type Definitions
 * @module Runtime/SSR/Types
 *
 * @description
 * Type definitions for server-side rendering of the runtime system.
 * These types define the contract between SSR context, handler execution,
 * and client hydration.
 */

import type { ComponentElement } from '../redux/store/component/component.interface';

/**
 * Application data for SSR initialization
 */
export interface SSRApplication {
  uuid: string;
  name: string;
  [key: string]: any;
}

/**
 * User data extracted from request headers
 */
export interface SSRUser {
  id: string;
  email?: string;
  roles?: string[];
  [key: string]: any;
}

/**
 * Initial data required to create an SSR runtime context
 */
export interface SSRInitialData {
  /** Components to render */
  components: ComponentElement[];

  /** Applications containing the components */
  applications: SSRApplication[];

  /** Initial variable values (from URL params, user context, defaults) */
  variables: Record<string, any>;

  /** Authenticated user (if any) */
  user: SSRUser | null;

  /** Current page ID being rendered */
  pageId: string;

  /** Detected platform */
  platform: 'desktop' | 'tablet' | 'mobile';

  /** URL parameters */
  params: Record<string, string>;

  /** Query string parameters */
  query: Record<string, string>;
}

/**
 * Side effect collected during SSR (to be executed on client)
 */
export interface SSRSideEffect {
  /** Type of side effect */
  type: SSRSideEffectType;

  /** Arguments for the side effect function */
  args: any[];

  /** Component that triggered this side effect */
  componentId: string;

  /** Handler type that generated this (input, event, style) */
  handlerType?: 'input' | 'event' | 'style';
}

/**
 * All possible side effect types that can be collected during SSR
 */
export type SSRSideEffectType =
  | 'SetVar'
  | 'SetContextVar'
  | 'NavigateToPage'
  | 'NavigateToUrl'
  | 'NavigateToHash'
  | 'ShowToast'
  | 'ShowSuccessToast'
  | 'ShowErrorToast'
  | 'ShowWarningToast'
  | 'ShowInfoToast'
  | 'HideToast'
  | 'ClearAllToasts'
  | 'ShowPopconfirm'
  | 'Confirm'
  | 'ShowDeleteConfirm'
  | 'ShowWarningConfirm'
  | 'ClosePopconfirm'
  | 'CloseAllPopconfirms'
  | 'OpenModal'
  | 'CloseModal'
  | 'ToggleModal'
  | 'ShowShareModal'
  | 'CloseShareModal'
  | 'AddComponent'
  | 'DeleteComponentAction'
  | 'updateInput'
  | 'updateName'
  | 'updateEvent'
  | 'updateStyle'
  | 'updateStyleHandlers'
  | 'CopyComponentToClipboard'
  | 'PasteComponentFromClipboard'
  | 'UpdateApplication'
  | 'DeleteApplication'
  | 'AddPage'
  | 'UpdatePage'
  | 'deletePage'
  | 'InvokeFunction'
  | 'UploadFile'
  | 'BrowseFiles'
  | 'openEditorTab'
  | 'setCurrentEditorTab';

/**
 * Result of SSR handler execution
 */
export interface SSRExecutionResult {
  /** Return value from handler (if any) */
  value: any;

  /** Side effects collected during execution */
  sideEffects: SSRSideEffect[];

  /** Error message if execution failed */
  error?: string;
}

/**
 * Result of full SSR rendering
 */
export interface SSRResult {
  /** Rendered HTML string */
  html: string;

  /** Data needed for client hydration */
  hydrationData: SSRHydrationData;

  /** All side effects collected during rendering */
  sideEffects: SSRSideEffect[];

  /** Timing information */
  timing: {
    totalMs: number;
    handlerExecutionMs: number;
    renderMs: number;
  };
}

/**
 * Data serialized for client hydration
 */
export interface SSRHydrationData {
  /** Variable values after SSR execution */
  variables: Record<string, any>;

  /** Pre-computed component input values */
  componentValues: Record<string, Record<string, any>>;

  /** Component runtime values (Instance) */
  componentInstances: Record<string, Record<string, any>>;
}

/**
 * Handler classification for SSR compatibility
 */
export type HandlerClassification =
  | 'ssr-safe'      // Can execute fully on server (read-only)
  | 'ssr-partial'   // Has side effects that will be collected
  | 'client-only';  // Should skip on server (async, complex)

/**
 * Result of handler classification analysis
 */
export interface HandlerClassificationResult {
  /** Classification result */
  classification: HandlerClassification;

  /** Side effect APIs found in the handler */
  sideEffectAPIs: string[];

  /** Reason for classification (if not ssr-safe) */
  reason?: string;
}

/**
 * Options for SSR handler execution
 */
export interface SSRHandlerOptions {
  /** Maximum execution time in milliseconds */
  timeoutMs?: number;

  /** Whether to collect side effects or ignore them */
  collectSideEffects?: boolean;

  /** Handler type being executed */
  handlerType?: 'input' | 'event' | 'style';
}

/**
 * Complexity analysis result
 */
export interface ComplexityResult {
  /** Total AST node count */
  nodeCount: number;

  /** Maximum nesting depth */
  maxDepth: number;

  /** Whether the handler contains loops */
  hasLoop: boolean;

  /** Whether complexity exceeds SSR limits */
  exceedsLimits: boolean;

  /** Reason if limits exceeded */
  reason?: string;
}
