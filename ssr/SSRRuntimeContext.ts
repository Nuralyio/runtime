/**
 * @fileoverview SSR Runtime Context
 * @module Runtime/SSR/SSRRuntimeContext
 *
 * @description
 * Request-scoped implementation of IRuntimeContext for server-side rendering.
 *
 * Unlike the client-side ExecuteInstance (singleton), SSRRuntimeContext is:
 * - Created fresh for each SSR request
 * - Garbage collected after request completes
 * - Isolated from other concurrent requests
 * - Does not use global nanostores
 *
 * This prevents request contamination where Request A's SetVar could
 * affect Request B's GetVar.
 */

import type { IRuntimeContext } from '../types/IRuntimeContext';
import type { ComponentElement } from '../redux/store/component/component.interface';
import type { SSRInitialData, SSRUser, SSRApplication } from './types';

/**
 * Request-scoped runtime context for SSR
 *
 * Implements the same IRuntimeContext interface as ExecuteInstance,
 * but all state is local to the instance (no singletons, no global stores).
 */
export class SSRRuntimeContext implements IRuntimeContext {
  // ============================================================================
  // Component Registry (request-scoped)
  // ============================================================================

  /** Components indexed by application UUID, then by component name */
  applications: Record<string, Record<string, ComponentElement>> = {};

  /** Components indexed by application name, then by component name */
  Apps: Record<string, Record<string, ComponentElement>> = {};

  // ============================================================================
  // Context and State (request-scoped)
  // ============================================================================

  /** Global and application-scoped context variables */
  context: Record<string, any> = {};

  /** Component runtime values registry */
  Values: Record<string, any> = {};

  /** Component properties registry */
  Properties: Record<string, any> = {};

  /** Variables storage */
  Vars: Record<string, any> = {};

  // ============================================================================
  // Reactive Proxies (simplified for SSR - no events needed)
  // ============================================================================

  /** Proxy for component properties */
  PropertiesProxy: any;

  /** Proxy for variables */
  VarsProxy: any;

  // ============================================================================
  // Execution Context
  // ============================================================================

  /** Currently executing component */
  Current: Record<string, any> = {};

  /** Current platform information */
  currentPlatform: { platform: string; isMobile: boolean; isTablet: boolean; isDesktop: boolean };

  /** Current event object (typically null during SSR) */
  Event: Event | undefined;

  // ============================================================================
  // Caching (request-scoped)
  // ============================================================================

  /** Cache for style proxies */
  styleProxyCache = new WeakMap<any, any>();

  /** Cache for values proxies */
  valuesProxyCache = new WeakMap<any, any>();

  /** Listener registry (minimal for SSR) */
  listeners: Record<string, Set<string>> = {};

  // ============================================================================
  // SSR-specific state
  // ============================================================================

  /** User data for this request */
  private user: SSRUser | null;

  /** Component values (Instance) storage */
  private componentValues: Record<string, Record<string, any>> = {};

  /** Original initial data for reference */
  private initialData: SSRInitialData;

  /**
   * Create a new SSR runtime context
   *
   * @param initialData - Data to initialize the context with
   */
  constructor(initialData: SSRInitialData) {
    this.initialData = initialData;
    this.user = initialData.user;

    // Initialize platform info
    this.currentPlatform = {
      platform: initialData.platform,
      isMobile: initialData.platform === 'mobile',
      isTablet: initialData.platform === 'tablet',
      isDesktop: initialData.platform === 'desktop',
    };

    // Initialize variables from initial data
    this.Vars = { ...initialData.variables };

    // Create proxies for SSR (simplified, no event emission)
    this.PropertiesProxy = this.createSSRProxy(this.Properties);
    this.VarsProxy = this.createSSRProxy(this.Vars);

    // Register applications and components
    this.registerFromInitialData(initialData);
  }

  /**
   * Register applications and components from initial data
   */
  private registerFromInitialData(data: SSRInitialData): void {
    // Build application name mapping
    const appNameMap: Record<string, string> = {};
    for (const app of data.applications) {
      appNameMap[app.uuid] = app.name;
      this.applications[app.uuid] = {};
      this.Apps[app.name] = {};
    }

    // Register components
    for (const component of data.components) {
      const appId = component.application_id;
      const appName = appNameMap[appId];

      if (!this.applications[appId]) {
        this.applications[appId] = {};
      }
      if (appName && !this.Apps[appName]) {
        this.Apps[appName] = {};
      }

      // Initialize component
      component.children = [];

      // Register by name
      this.applications[appId][component.name] = component;
      if (appName) {
        this.Apps[appName][component.name] = component;
      }

      // Initialize component context
      if (!this.context[appId]) {
        this.context[appId] = {};
      }
      this.context[appId][component.uuid] = { ...component };

      // Attach values property
      if (component.uniqueUUID) {
        this.attachValuesProperty(component);
      }
    }

    // Build component hierarchy (parent-child relationships)
    for (const component of data.components) {
      if (component.children_ids && Array.isArray(component.children_ids)) {
        for (const childId of component.children_ids) {
          const child = data.components.find(c => c.uuid === childId);
          if (child) {
            component.children.push(child);
            child.parent = component;
          }
        }
      }
    }
  }

  /**
   * Create a simplified proxy for SSR (no event emission)
   */
  private createSSRProxy(target: Record<string, any>): Record<string, any> {
    return new Proxy(target, {
      get: (obj, prop: string) => {
        return obj[prop];
      },
      set: (obj, prop: string, value) => {
        obj[prop] = value;
        return true;
      },
      has: (obj, prop: string) => {
        return prop in obj;
      },
      ownKeys: (obj) => {
        return Object.keys(obj);
      },
      getOwnPropertyDescriptor: (obj, prop: string) => {
        return Object.getOwnPropertyDescriptor(obj, prop);
      },
    });
  }

  // ============================================================================
  // IRuntimeContext Implementation
  // ============================================================================

  /**
   * Get component by UUID
   */
  getComponentByUUID(uuid: string): ComponentElement | undefined {
    for (const appId in this.applications) {
      const appComponents = this.applications[appId];
      for (const componentName in appComponents) {
        const component = appComponents[componentName];
        if (component.uuid === uuid) {
          return component;
        }
        // Search children recursively
        const found = this.findInChildren(component, uuid);
        if (found) return found;
      }
    }
    return undefined;
  }

  /**
   * Recursively search for component in children
   */
  private findInChildren(parent: ComponentElement, uuid: string): ComponentElement | undefined {
    if (!parent.children || parent.children.length === 0) {
      return undefined;
    }
    for (const child of parent.children) {
      if (child.uuid === uuid) {
        return child;
      }
      const found = this.findInChildren(child, uuid);
      if (found) return found;
    }
    return undefined;
  }

  /**
   * Get component by name
   */
  getComponent(name: string, appId?: string): ComponentElement | undefined {
    if (appId) {
      return this.applications[appId]?.[name];
    }
    // Search in all applications
    for (const applicationId in this.applications) {
      const component = this.applications[applicationId][name];
      if (component) return component;
    }
    return undefined;
  }

  /**
   * Attach reactive Instance property to component
   */
  attachValuesProperty(component: ComponentElement): void {
    const componentId = component.uniqueUUID;

    if (!componentId) {
      return;
    }

    // Initialize storage for this component
    if (!this.componentValues[componentId]) {
      this.componentValues[componentId] = {};
    }

    // Check cache first
    if (this.valuesProxyCache.has(component)) {
      component.Instance = this.valuesProxyCache.get(component);
      return;
    }

    // Create proxy for component values
    const valuesProxy = new Proxy({} as Record<string, any>, {
      get: (_, prop: string) => {
        return this.componentValues[componentId]?.[prop];
      },
      set: (_, prop: string, value) => {
        if (!this.componentValues[componentId]) {
          this.componentValues[componentId] = {};
        }
        this.componentValues[componentId][prop] = value;
        return true;
      },
      has: (_, prop: string) => {
        return prop in (this.componentValues[componentId] || {});
      },
      ownKeys: () => {
        return Object.keys(this.componentValues[componentId] || {});
      },
      getOwnPropertyDescriptor: (_, prop: string) => {
        if (prop in (this.componentValues[componentId] || {})) {
          return {
            enumerable: true,
            configurable: true,
            value: this.componentValues[componentId][prop],
          };
        }
        return undefined;
      },
    });

    // Cache and attach
    this.valuesProxyCache.set(component, valuesProxy);
    component.Instance = valuesProxy;
  }

  /**
   * Get variable value
   */
  getVar(name: string): any {
    return this.Vars[name];
  }

  /**
   * Set variable value
   */
  setVar(name: string, value: any): void {
    this.Vars[name] = value;
  }

  /**
   * Set component runtime style attribute (no-op for SSR initial render)
   */
  setComponentRuntimeStyleAttribute(componentId: string, attribute: string, value: any): void {
    // For SSR, we just store the value - no store updates needed
    // The styles will be applied when rendering
  }

  // ============================================================================
  // SSR-specific methods
  // ============================================================================

  /**
   * Get the current user for this request
   */
  getCurrentUser(): SSRUser | null {
    return this.user;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.user !== null;
  }

  /**
   * Check if user has a specific role
   */
  hasRole(role: string): boolean {
    return this.user?.roles?.includes(role) ?? false;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    if (!this.user?.roles) return false;
    return roles.some(role => this.user!.roles!.includes(role));
  }

  /**
   * Check if user has all of the specified roles
   */
  hasAllRoles(roles: string[]): boolean {
    if (!this.user?.roles) return false;
    return roles.every(role => this.user!.roles!.includes(role));
  }

  /**
   * Get all variables (for hydration data)
   */
  getVariables(): Record<string, any> {
    return { ...this.Vars };
  }

  /**
   * Get all component values (for hydration data)
   */
  getComponentValues(): Record<string, Record<string, any>> {
    return { ...this.componentValues };
  }

  /**
   * Get all components as a flat list
   */
  getAllComponents(): ComponentElement[] {
    const components: ComponentElement[] = [];
    for (const appId in this.applications) {
      for (const name in this.applications[appId]) {
        components.push(this.applications[appId][name]);
      }
    }
    return components;
  }
}
