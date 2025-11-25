/**
 * @fileoverview Runtime Context Interface
 * @module Runtime/Types/IRuntimeContext
 *
 * @description
 * Unified interface for runtime execution contexts.
 *
 * This interface defines the contract that any runtime context must implement
 * to support handler execution. It abstracts away the differences between:
 * - Global singleton runtime (ExecuteInstance)
 * - Isolated micro-app runtime (MicroAppRuntimeContext)
 *
 * By depending on this interface instead of concrete implementations,
 * the handler execution system can work with any context that provides
 * the required state and operations.
 *
 * **Key Design Principles:**
 * 1. Context-agnostic: Works with global or isolated stores
 * 2. Minimal surface area: Only what handler execution needs
 * 3. Clear ownership: Context owns state, executor owns execution
 * 4. No leaky abstractions: Interface doesn't expose implementation details
 */

import type { ComponentElement } from '@shared/redux/store/component/component.interface';

/**
 * Runtime execution context interface.
 *
 * Any context that implements this interface can be used with the
 * unified handler execution system.
 *
 * @interface IRuntimeContext
 */
export interface IRuntimeContext {
  // ============================================================================
  // Component Registry
  // ============================================================================

  /**
   * Components indexed by application UUID, then by component name.
   *
   * Structure: { [appUUID]: { [componentName]: ComponentElement } }
   *
   * @example
   * const button = context.applications['app-123']['SubmitButton'];
   */
  applications: Record<string, Record<string, ComponentElement>>;

  /**
   * Components indexed by application name, then by component name.
   *
   * Structure: { [appName]: { [componentName]: ComponentElement } }
   *
   * @example
   * const button = context.Apps['MyApp']['SubmitButton'];
   */
  Apps: Record<string, Record<string, ComponentElement>>;

  // ============================================================================
  // Context and State
  // ============================================================================

  /**
   * Global and application-scoped context variables.
   *
   * Structure: {
   *   global: { [varName]: { value, type } },
   *   [appUUID]: { [varName]: { value, type } }
   * }
   */
  context: Record<string, any>;

  /**
   * Component runtime values registry.
   * Maps component UUIDs to their runtime values.
   */
  Values: Record<string, any>;

  /**
   * Component properties registry.
   */
  Properties: Record<string, any>;

  /**
   * Variables storage (non-reactive).
   */
  Vars: Record<string, any>;

  // ============================================================================
  // Reactive Proxies
  // ============================================================================

  /**
   * Reactive proxy for component properties.
   * Tracks access and emits change events.
   */
  PropertiesProxy: any;

  /**
   * Reactive proxy for variables.
   * Tracks access and emits change events.
   */
  VarsProxy: any;

  // ============================================================================
  // Execution Context
  // ============================================================================

  /**
   * Currently executing component.
   * Set during handler execution to provide component context.
   */
  Current: Record<string, any>;

  /**
   * Current platform information (mobile, tablet, desktop).
   */
  currentPlatform: any;

  /**
   * Current event object (if handler was triggered by an event).
   */
  Event: Event | undefined;

  // ============================================================================
  // Component Operations
  // ============================================================================

  /**
   * Get component by UUID.
   *
   * @param uuid - Component UUID to find
   * @returns Component element or undefined if not found
   */
  getComponentByUUID(uuid: string): ComponentElement | undefined;

  /**
   * Get component by name.
   *
   * @param name - Component name
   * @param appId - Optional application ID (uses current app if not provided)
   * @returns Component element or undefined if not found
   */
  getComponent(name: string, appId?: string): ComponentElement | undefined;

  /**
   * Attach reactive Instance property to component.
   * Creates a proxy that reads/writes to the runtime values store.
   *
   * @param component - Component to attach Instance property to
   */
  attachValuesProperty(component: ComponentElement): void;

  // ============================================================================
  // Variable Operations
  // ============================================================================

  /**
   * Get variable value with scope resolution.
   *
   * @param name - Variable name
   * @returns Variable value or undefined if not found
   */
  getVar(name: string): any;

  /**
   * Set variable value.
   *
   * @param name - Variable name
   * @param value - Value to set
   */
  setVar(name: string, value: any): void;

  // ============================================================================
  // Style Operations
  // ============================================================================

  /**
   * Set component runtime style attribute.
   * Updates the component's runtime styles and triggers re-render.
   *
   * @param componentId - Component unique UUID
   * @param attribute - Style attribute name (e.g., 'backgroundColor')
   * @param value - Style value
   */
  setComponentRuntimeStyleAttribute(componentId: string, attribute: string, value: any): void;

  // ============================================================================
  // Caching
  // ============================================================================

  /**
   * Cache for style proxies to avoid recreation.
   * Uses WeakMap for automatic garbage collection.
   */
  styleProxyCache: WeakMap<any, any>;

  /**
   * Cache for values proxies to avoid recreation.
   * Uses WeakMap for automatic garbage collection.
   */
  valuesProxyCache: WeakMap<any, any>;
}
