/**
 * @module Runtime
 * @description Nuraly Runtime System - Core execution engine for the visual web application builder
 * 
 * The Runtime System is responsible for:
 * - **Handler Execution**: Compiling and executing JavaScript code from component properties
 * - **State Management**: Reactive state with proxy-based change detection
 * - **Component Lifecycle**: Managing component registration, hierarchy, and relationships
 * - **Runtime API**: Providing rich APIs for components to interact with the system
 * - **Editor Integration**: Connecting studio editor with runtime execution environment
 * 
 * @example Basic Usage
 * ```typescript
 * import { executeHandler, ExecuteInstance, Editor } from './';
 * 
 * // Execute a handler
 * const result = executeHandler(component, "GetVar('username')", { event: clickEvent });
 * 
 * // Access runtime state
 * ExecuteInstance.VarsProxy.username = 'John Doe';
 * const theme = ExecuteInstance.GetVar('theme');
 * 
 * // Check editor mode
 * if (Editor.getEditorMode()) {
 *   console.log('Running in editor mode');
 * }
 * ```
 * 
 * @example Advanced Usage - Creating Dynamic Applications
 * ```typescript
 * import { executeHandler, ExecuteInstance } from './';
 * 
 * // Handler code for dynamic component behavior
 * const handlerCode = `
 *   const count = GetVar('count') || 0;
 *   SetVar('count', count + 1);
 *   updateInput(Current, 'text', 'static', \`Clicked \${count + 1} times\`);
 * `;
 * 
 * // Execute handler when button is clicked
 * executeHandler(buttonComponent, handlerCode, { event: clickEvent });
 * ```
 * 
 * @see {@link ./README.md} for comprehensive documentation
 * @see {@link ./handlers/README.md} for handler execution details
 * @see {@link ./state/README.md} for state management details
 */

// ============================================================================
// Core Runtime Context and State Management
// ============================================================================

/**
 * RuntimeInstance - Main singleton instance of the RuntimeContext
 * @see {@link RuntimeContext} in ./state/runtime-context.ts
 */
export {
  RuntimeInstance,
  ExecuteInstance,
  Editor,
  RuntimeHelpers
} from './state';

// ============================================================================
// Redux Store - Application State
// ============================================================================

/**
 * Redux store atoms for component, application, page, and environment state
 * @see {@link ./redux/store} for store definitions
 */
export {
  // Component Store
  $components,
  $applicationComponents,
  $selectedComponent,
  $currentComponentId,
  $hoveredComponentId,
  $hoveredComponent,
  $draggingComponentInfo,
  $componentWithChildren,
  $runtimeStyles,
  $runtimeValues,
  $componentRuntimeValuesById,
  $componentRuntimeValueByKey,
  $componentsByUUIDs,
  $runtimeStylescomponentStyleByID,
  getAllChildrenRecursive,
  getDirectChildren,
  $componentById,
  setComponentRuntimeValue,
  setComponentRuntimeValues,
  setcomponentRuntimeStyleAttribute,
  clearComponentRuntimeValues,
  clearComponentRuntimeValue,
  clearAllRuntimeValues,
  clearComponentRuntimeStyleAttributes,
  fillComponentChildren,
  fillApplicationComponents,
  extractChildresIds,
  extractAllChildrenIds,
  // Application Store
  $applications,
  $currentApplication,
  $editorState,
  $resizing,
  // Page Store
  $pages,
  $currentPage,
  $currentPageViewPort,
  $pageZoom,
  $contextMenuEvent,
  $showBorder,
  $currentPageId,
  $microAppCurrentPage,
  $pageSize,
  $applicationPages,
  refreshPageStoreVar,
  // Context/Variables Store
  $context,
  // Environment Store
  ViewMode,
  $environment,
  // Toast Store
  $toasts,
  // Debug Store
  $debug,
  // Provider Store
  $providers,
  // Component Types
  type ComponentElement,
  type PageElement
} from './redux/store';

// ============================================================================
// Redux Actions
// ============================================================================

/**
 * Redux action creators for state mutations
 * @see {@link ./redux/actions} for action definitions
 */
export * from './redux/actions';

// ============================================================================
// Redux Handlers
// ============================================================================

/**
 * Redux handlers for complex state transformations
 * @see {@link ./redux/handlers} for handler definitions
 */
export * from './redux/handlers';

// ============================================================================
// Handler Execution System
// ============================================================================

/**
 * Handler execution utilities for compiling and running component handlers
 * @see {@link executeHandler} in ./handlers/handler-executor.ts
 * @see {@link compileHandlerFunction} in ./handlers/compiler.ts
 * @see {@link getContextFromComponent} in ./handlers/handler-executor.ts
 */
export {
  executeHandler,
  getContextFromComponent,
  compileHandlerFunction
} from './handlers';

// ============================================================================
// Utilities
// ============================================================================

/**
 * Utility functions for rendering, logging, validation, and more
 * @see {@link ./utils} for utility definitions
 */
export * from './utils';

// ============================================================================
// Runtime Components
// ============================================================================

/**
 * Note: MicroApp component was removed from runtime exports to prevent circular dependencies.
 * Import MicroApp directly from '../../shared/ui/components/runtime/MicroApp/MicroApp' if needed.
 */
