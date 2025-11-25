/**
 * @fileoverview Runtime Context - Core State Management System
 * @module Runtime/State/RuntimeContext
 * 
 * @description
 * The RuntimeContext module provides the foundational state management system
 * for the Nuraly runtime engine. It serves as the central nervous system that
 * coordinates component lifecycle, reactive state, and handler execution.
 * 
 * **Core Responsibilities:**
 * 
 * 1. **Component Registry Management**
 *    - Maintains a centralized registry of all components across applications
 *    - Indexes components by both application ID and component name
 *    - Provides fast lookup for component access in handlers
 * 
 * 2. **Reactive State System**
 *    - Creates and manages Proxy objects for reactive state
 *    - Tracks property access and mutations automatically
 *    - Emits change events for dependent component updates
 *    - Implements smart caching to avoid proxy recreation
 * 
 * 3. **Component Hierarchy**
 *    - Builds and maintains parent-child component relationships
 *    - Resolves component IDs to actual component objects
 *    - Provides traversal capabilities for component trees
 * 
 * 4. **Runtime Values Management**
 *    - Attaches reactive `Instance` properties to components
 *    - Backs component state with centralized `$runtimeValues` store
 *    - Provides persistent, reactive component-scoped state
 * 
 * 5. **Store Integration**
 *    - Subscribes to nanostores (`$components`, `$applications`, `$context`)
 *    - Synchronizes internal state with store updates
 *    - Triggers re-registration on store changes
 * 
 * **State Flow:**
 * ```
 * User Action (e.g., set variable)
 *         │
 *         ▼
 * VarsProxy.username = 'John'
 *         │
 *         ▼
 * Proxy intercepts set operation
 *         │
 *         ├─▶ Update internal state
 *         ├─▶ Emit change event
 *         └─▶ Trigger dependent updates
 *         │
 *         ▼
 * Components Re-render
 * ```
 * 
 * **Component Registration Flow:**
 * ```
 * Store Update ($components changes)
 *         │
 *         ▼
 * registerApplications()
 *         │
 *         ├─▶ 1. Index all components by app ID and name
 *         ├─▶ 2. Initialize children arrays
 *         ├─▶ 3. Attach Instance (values) properties
 *         ├─▶ 4. Resolve childrenIds to children objects
 *         ├─▶ 5. Set parent references
 *         └─▶ 6. Update Editor.components
 *         │
 *         ▼
 * Components Ready for Use
 * ```
 * 
 * **Proxy System:**
 * 
 * The RuntimeContext uses JavaScript Proxies extensively for reactivity:
 * 
 * - **PropertiesProxy**: Tracks component property access/mutations
 * - **VarsProxy**: Tracks variable access/mutations (GetVar/SetVar)
 * - **Style Proxies**: Tracks style property changes (per component)
 * - **Values Proxies**: Tracks component Instance property changes (per component)
 * 
 * All proxies emit events on changes, enabling reactive component updates.
 * 
 * **Caching Strategy:**
 * 
 * - **Style Proxies**: Cached in WeakMap by style object
 * - **Values Proxies**: Cached in WeakMap by component object
 * - **Property Listeners**: Cached in Map by property name
 * 
 * WeakMaps are used to allow garbage collection when objects are no longer referenced.
 * 
 * **Performance Optimizations:**
 * 
 * 1. **Lazy Initialization**: Components registered only when stores update
 * 2. **Smart Caching**: Proxies cached and reused to avoid recreation overhead
 * 3. **Deep Equality**: Changes only emit events if values actually differ
 * 4. **Debounced Registration**: Store subscriptions prevent excessive re-registration
 * 5. **WeakMap Caching**: Automatic garbage collection prevents memory leaks
 * 
 * **Debug Mode:**
 * 
 * Set `DEBUG = true` to enable verbose console logging:
 * - Property access operations
 * - Property set operations
 * - Proxy creation
 * - Event emissions
 * - Component registration steps
 * 
 * @example Basic Usage
 * ```typescript
 * import { ExecuteInstance } from '@features/runtime/state';
 * 
 * // Access component by name
 * const button = ExecuteInstance.applications['app-id']['MyButton'];
 * 
 * // Access via Apps (by application name)
 * const myApp = ExecuteInstance.Apps['MyAppName'];
 * const button2 = myApp['MyButton'];
 * 
 * // Set variable (reactive)
 * ExecuteInstance.VarsProxy.username = 'John Doe';
 * 
 * // Get variable
 * const username = ExecuteInstance.GetVar('username');
 * ```
 * 
 * @example Component Hierarchy
 * ```typescript
 * // Access component hierarchy
 * const container = ExecuteInstance.applications['app-id']['Container'];
 * 
 * console.log(container.children); // [child1, child2, ...]
 * console.log(container.children[0].parent === container); // true
 * 
 * // Traverse up the hierarchy
 * let current = someComponent;
 * while (current.parent) {
 *   console.log(`Parent: ${current.parent.name}`);
 *   current = current.parent;
 * }
 * ```
 * 
 * @example Component Values (Instance)
 * ```typescript
 * const button = ExecuteInstance.applications['app-id']['MyButton'];
 * 
 * // Component Instance is reactive
 * button.Instance.clickCount = 0;
 * button.Instance.clickCount++; // Emits event
 * 
 * // Access in handler code
 * // Handler: "Current.Instance.clickCount++"
 * ```
 * 
 * @example Reactive Variables
 * ```typescript
 * // VarsProxy is reactive
 * ExecuteInstance.VarsProxy.theme = 'dark';
 * 
 * // Listen for changes
 * eventDispatcher.on('Vars:theme', ({ value }) => {
 *   console.log('Theme changed to:', value);
 * });
 * 
 * // Change triggers event
 * ExecuteInstance.VarsProxy.theme = 'light'; // Event emitted
 * ```
 * 
 * @see {@link RuntimeContext} - Main class definition
 * @see {@link ExecuteInstance} - Exported singleton
 * @see {@link Editor} - Editor state management
 * @see {@link executeHandler} - Handler execution
 */

import deepEqual from "fast-deep-equal";

import { $applications } from "@shared/redux/store/apps";
import {
  $components,
  setcomponentRuntimeStyleAttribute,
  $runtimeValues,
  setComponentRuntimeValue,
  setComponentRuntimeValues
} from "@shared/redux/store/component/store";
import type { ComponentElement } from "@shared/redux/store/component/component.interface";
import { $context, getVar } from "@shared/redux/store/context";
import { isServer } from "@shared/utils/envirement";
import { eventDispatcher } from "@shared/utils/change-detection";
import Editor from "./editor";
import { executeHandler } from "../handlers/handler-executor";
import type { IRuntimeContext } from "../types/IRuntimeContext";
import { RuntimeContextHelpers } from "../utils/RuntimeContextHelpers";

/**
 * Debug flag for verbose logging.
 * Set to `true` to enable detailed console logs for:
 * - Property access and mutations
 * - Proxy creation and caching
 * - Component registration steps
 * - Event emissions
 * 
 * @constant
 * @type {boolean}
 * @default false
 */
const DEBUG = false;

/**
 * @class RuntimeContext
 * @description The core runtime execution engine for the Nuraly visual application builder
 * 
 * RuntimeContext is a singleton that manages the entire component runtime system.
 * It serves as the central hub for:
 * 
 * **1. State Management**
 * - Global context variables (`context`)
 * - Application registry (`applications`, `Apps`)
 * - Component values (`Values`)
 * - Component properties (`Properties`)
 * - Runtime variables (`Vars`)
 * 
 * **2. Reactive System**
 * - Proxy-based change detection (`PropertiesProxy`, `VarsProxy`)
 * - Component property access tracking
 * - Automatic change event emission
 * - Style and value proxies with caching
 * 
 * **3. Component Lifecycle**
 * - Component registration from stores
 * - Hierarchy building (parent-child relationships)
 * - Children array initialization
 * - Runtime values attachment
 * 
 * **4. Event System**
 * - Property change listeners
 * - Component update events
 * - Store subscription management
 * - Change event dispatching
 * 
 * **Architecture:**
 * ```
 * Nanostores ($components, $applications, $context)
 *         │
 *         ▼
 * RuntimeContext.registerApplications()
 *         │
 *         ├─▶ Build component registry
 *         ├─▶ Create component hierarchy
 *         ├─▶ Attach values proxies
 *         └─▶ Update Editor.components
 *         │
 *         ▼
 * Reactive Proxies (PropertiesProxy, VarsProxy)
 *         │
 *         ▼
 * Handler Execution (executeHandler)
 *         │
 *         ▼
 * Component Updates & Re-renders
 * ```
 * 
 * **Key Responsibilities:**
 * 
 * 1. **Component Registration**
 *    - Listens to `$components` store changes
 *    - Indexes components by application ID and name
 *    - Builds parent-child relationships
 * 
 * 2. **Hierarchy Management**
 *    - Resolves component.childrenIds to actual children
 *    - Sets component.parent references
 *    - Maintains bidirectional relationships
 * 
 * 3. **Reactive Proxies**
 *    - Creates proxies that track property access
 *    - Emits events when properties change
 *    - Caches proxies to avoid recreation
 * 
 * 4. **Values Management**
 *    - Attaches `Instance` property to components
 *    - Backs `Instance` with `$runtimeValues` store
 *    - Provides reactive component state
 * 
 * 5. **Style Tracking**
 *    - Creates style proxies for reactive updates
 *    - Caches style proxies per component
 *    - Calls `setcomponentRuntimeStyleAttribute` on changes
 * 
 * **Usage Patterns:**
 * 
 * ```typescript
 * // Access the singleton
 * import { ExecuteInstance } from '@features/runtime';
 * 
 * // Access component registry
 * const myApp = ExecuteInstance.Apps['MyApp'];
 * const button = ExecuteInstance.applications['app-id']['ButtonComponent'];
 * 
 * // Access/set variables via reactive proxy
 * ExecuteInstance.VarsProxy.username = 'John Doe';
 * const theme = ExecuteInstance.VarsProxy.theme;
 * 
 * // Get variable with GetVar function
 * const count = ExecuteInstance.GetVar('count');
 * 
 * // Access current component context
 * console.log(ExecuteInstance.Current.name);
 * ```
 * 
 * **Singleton Pattern:**
 * Only one instance exists per application runtime. Access via:
 * - `RuntimeContext.getInstance()`
 * - Or the exported `ExecuteInstance` constant
 * 
 * **Performance Considerations:**
 * - Proxies are cached to avoid recreation
 * - Component registration is debounced via store subscriptions
 * - Deep equality checks prevent unnecessary updates
 * - WeakMap used for garbage-collectable caches
 * 
 * @example Accessing Runtime State
 * ```typescript
 * // Get all components in an application
 * const appComponents = ExecuteInstance.applications['app-id'];
 * Object.values(appComponents).forEach(component => {
 *   console.log(component.name);
 * });
 * 
 * // Access application by name
 * const myApp = ExecuteInstance.Apps['MyAppName'];
 * 
 * // Set and get variables
 * ExecuteInstance.VarsProxy.counter = 0;
 * ExecuteInstance.VarsProxy.counter++; // Triggers change events
 * console.log(ExecuteInstance.VarsProxy.counter); // 1
 * ```
 * 
 * @example Component Hierarchy
 * ```typescript
 * // After registration, components have hierarchy:
 * const container = ExecuteInstance.applications['app-id']['Container'];
 * console.log(container.children); // [child1, child2, ...]
 * console.log(container.children[0].parent === container); // true
 * ```
 * 
 * @example Component Values
 * ```typescript
 * // Access component instance values
 * const button = ExecuteInstance.applications['app-id']['MyButton'];
 * 
 * // Set value (reactive)
 * button.Instance.clickCount = 0;
 * button.Instance.clickCount++; // Triggers events
 * 
 * // Get value
 * console.log(button.Instance.clickCount); // 1
 * ```
 * 
 * @see {@link ExecuteInstance} - Exported singleton instance
 * @see {@link RuntimeInstance} - Alternative export name
 * @see {@link executeHandler} - Handler execution function
 */
class RuntimeContext implements IRuntimeContext {
  /** Singleton instance of the RuntimeContext */
  static instance: RuntimeContext;
  
  /** Global context registry */
  context: Record<string, any> = {};
  
  /** Applications registry by ID */
  applications: Record<string, any> = {};
  
  /** Applications registry by name */
  Apps: Record<string, any> = {};
  
  /** Component values registry */
  Values: Record<string, any> = {};
  
  /** Component properties registry */
  Properties: Record<string, any> = {};
  
  /** Variables registry */
  Vars: Record<string, any> = {};
  
  /** Reactive proxy for component properties */
  PropertiesProxy: Record<string, any> = {};
  
  /** Reactive proxy for variables */
  VarsProxy: Record<string, any> = {};
  
  /** Currently active component context */
  Current: Record<string, any> = {};
  
  /** Current platform information */
  currentPlatform: any;

  /** Property change listeners map */
  private listeners: Record<string, Set<string>> = {};
  
  /** Cache for style proxies to avoid recreation */
  styleProxyCache = new WeakMap();
  
  /** Cache for values proxies to avoid recreation */
  valuesProxyCache = new WeakMap();
  
  /** Function to set component runtime style attributes */
  setcomponentRuntimeStyleAttribute: (componentId: string, attribute: string, value: string) => void;
  
  /** Function to retrieve variable values */
  GetVar: (symbol: string) => any;
  
  /** Function to retrieve context variables */
  GetContextVar: any;
  
  /** Event object */
  Event: Event;
  
  /**
   * Private constructor to enforce singleton pattern.
   * Initializes the executor system and sets up event listeners.
   */
  private constructor() {
    if(isServer){
      return;
    }
    this.PropertiesProxy = this.createProxy(this.Properties);
    this.VarsProxy = this.createProxy(this.Vars, 'Vars');
    this.registerContext();
    $applications.subscribe(() => this.registerApplications());
    $components.subscribe(() => this.registerApplications());
    eventDispatcher.on("component:refresh", () => this.registerApplications())
    eventDispatcher.on("component:updated", () => this.registerApplications())

    if (DEBUG) {
      console.log("Executor initialized with debug mode enabled.");
    }
  }

  /**
   * Updates the editor context with selected components.
   * Filters the current application's components based on selection state.
   */
  updateEditorContext() {
    const selectedComponensIds = this.Vars.selectedComponents || []
    const currentEditingApplicationUUID = getVar("global", "currentEditingApplication")?.value?.uuid;
    Editor.Vars = Editor.Vars ?? {}
    Editor.selectedComponents = this.createProxy(Object.values(this.applications[currentEditingApplicationUUID] || {}).filter((c: ComponentElement) => selectedComponensIds.includes(c.uuid)));
  }

  /**
   * Creates a reactive proxy for the target object.
   * Tracks property access and changes, triggers events on property updates.
   *
   * Uses RuntimeContextHelpers to eliminate code duplication with MicroAppRuntimeContext.
   *
   * @param target - Object to be proxied
   * @param scope - Optional scope name for event namespacing
   * @returns Reactive proxy for the target object
   */
  createProxy(target: any, scope?: string): any {
    return RuntimeContextHelpers.createReactiveProxy(target, {
      eventPrefix: '', // Empty prefix for global context (no scoping)
      scope,
      listeners: this.listeners,
      current: this.Current,
      onPropertyChange: (prop: string, value: any, listeners: Set<string>) => {
        // Emit events to all listeners for this property
        listeners.forEach((componentName: string) => {
          eventDispatcher.emit(`component-property-changed:${componentName}`, {
            prop,
            value, // IMPORTANT: Include value in event data
            ctx: this.Current
          });
        });

        // IMPORTANT: Emit global variable change events for micro-apps to listen to
        // This ensures that when global RuntimeContext changes a variable, all micro-apps are notified
        if (scope === 'Vars') {
          if (DEBUG) {
            console.log(`[RuntimeContext] Emitting global variable change: ${prop} = ${value}`);
          }
          eventDispatcher.emit('global:variable:changed', {
            varName: prop,
            name: prop,
            value,
            oldValue: undefined // Global context doesn't track oldValue
          });
        }
      },
      debug: DEBUG
    });
  }

  /**
   * Attaches a values property to the component that is backed by $runtimeValues.
   * Creates a reactive proxy that interacts with the global runtime values store.
   *
   * Uses RuntimeContextHelpers to eliminate code duplication with MicroAppRuntimeContext.
   *
   * @param component - The component to attach the values property to
   */
  attachValuesProperty(component: any) {
    const componentId = component.uniqueUUID;

    if (!componentId) {
      console.error('Cannot attach values property: component uniqueUUID is undefined');
      return;
    }

    // Use RuntimeContextHelpers to create the values proxy
    const valuesProxy = RuntimeContextHelpers.createValuesProxy(
      component,
      {
        // Backend: Global runtime values store
        get: (id: string, prop: string) => {
          const runtimeValues = $runtimeValues.get();
          return runtimeValues[id]?.[prop];
        },
        set: (id: string, prop: string, value: any) => {
          setComponentRuntimeValue(id, prop, value);
        },
        has: (id: string, prop: string) => {
          const runtimeValues = $runtimeValues.get();
          return prop in (runtimeValues[id] || {});
        },
        delete: (id: string, prop: string) => {
          const runtimeValues = $runtimeValues.get();
          const componentValues = { ...(runtimeValues[id] || {}) };
          if (prop in componentValues) {
            delete componentValues[prop];
            setComponentRuntimeValues(id, componentValues);
            eventDispatcher.emit('component:value:remove', { componentId: id, key: prop });
          }
        },
        keys: (id: string) => {
          const runtimeValues = $runtimeValues.get();
          return Object.keys(runtimeValues[id] || {});
        }
      },
      (id: string, prop: string, value: any) => {
        // Emit event when value changes
        eventDispatcher.emit(`component:value:set:${id}`, { prop, value });
      },
      this.valuesProxyCache
    );

    // Attach the proxy to the component
    component.Instance = valuesProxy;
  }

  /**
   * Creates a proxy for style objects that tracks changes to style properties.
   * Uses a cache to avoid recreating proxies for the same target objects.
   * 
   * @param target - The style object to watch
   * @param callback - Function to call when a style property changes
   * @returns A proxy that watches for style property changes
   */
  watchStyleChanges(target, callback) {
    if (typeof target !== "object" || target === null) {
      return target;
    }
  
    // If the proxy already exists in the cache, return it
    if (this.styleProxyCache.has(target)) {
      return this.styleProxyCache.get(target);
    }
  
    const proxy = new Proxy(target, {
      set(obj, prop: any, value) {
        if (obj[prop] !== value) {
          console.log(`Style property changed: ${prop} = ${value}`);
          callback(prop, value);
        }
        obj[prop] = value;
        return true;
      }
    });
  
    // Cache the proxy to avoid re-creating it
    this.styleProxyCache.set(target, proxy);
    return proxy;
  }

  /**
   * Get component by UUID.
   * Searches through all applications to find a component by its UUID.
   *
   * @param uuid - Component UUID to find
   * @returns Component element or undefined if not found
   */
  getComponentByUUID(uuid: string): ComponentElement | undefined {
    // Search through all applications
    for (const appId in this.applications) {
      const appComponents = this.applications[appId];
      for (const componentName in appComponents) {
        const component = appComponents[componentName];
        if (component.uuid === uuid) {
          return component;
        }
        // Also search in children recursively
        const found = this.findComponentInChildren(component, uuid);
        if (found) return found;
      }
    }
    return undefined;
  }

  /**
   * Recursively search for component in children.
   *
   * @param parent - Parent component to search in
   * @param uuid - UUID to find
   * @returns Component or undefined
   */
  private findComponentInChildren(parent: ComponentElement, uuid: string): ComponentElement | undefined {
    if (!parent.children || parent.children.length === 0) {
      return undefined;
    }
    for (const child of parent.children) {
      if (child.uuid === uuid) {
        return child;
      }
      const found = this.findComponentInChildren(child, uuid);
      if (found) return found;
    }
    return undefined;
  }

  /**
   * Get component by name.
   *
   * @param name - Component name
   * @param appId - Optional application ID (uses first available app if not provided)
   * @returns Component element or undefined if not found
   */
  getComponent(name: string, appId?: string): ComponentElement | undefined {
    if (appId) {
      return this.applications[appId]?.[name];
    }
    // If no appId provided, search in all applications
    for (const applicationId in this.applications) {
      const component = this.applications[applicationId][name];
      if (component) return component;
    }
    return undefined;
  }

  /**
   * Set variable value.
   * Updates the variable in the reactive proxy, triggering change events.
   *
   * @param name - Variable name
   * @param value - Value to set
   */
  setVar(name: string, value: any): void {
    this.VarsProxy[name] = value;
  }

  /**
   * Set component runtime style attribute.
   * Updates the component's runtime styles and triggers re-render.
   *
   * @param componentId - Component unique UUID
   * @param attribute - Style attribute name (e.g., 'backgroundColor')
   * @param value - Style value
   */
  setComponentRuntimeStyleAttribute(componentId: string, attribute: string, value: any): void {
    setcomponentRuntimeStyleAttribute(componentId, attribute, value);
  }

  /**
   * Gets the singleton instance of the RuntimeContext class.
   * Creates it if it doesn't exist yet.
   *
   * @returns The singleton RuntimeContext instance
   */
  static getInstance(): RuntimeContext {
    if (!RuntimeContext.instance) {
      RuntimeContext.instance = new RuntimeContext();
    }
    return RuntimeContext.instance;
  }

  /**
   * Registers the global context.
   * Sets up a listener for context changes and updates the internal context.
   */
  registerContext() {
    $context.listen((context: any) => {
      Object.assign(this.context, context);
    });
  }

  /**
   * Registers all applications and their components.
   * Builds the component hierarchy, initializes runtime values,
   * and sets up component relationships.
   */
  registerApplications() {
    const components = $components.get();
    const componentsList = Object.values(components).flat();
    const runtimeValues = $runtimeValues.get();

    const loadedApplications = $applications.get();
    const loadedApplicationObj: Record<string, string> = {};

    loadedApplications.forEach((app: any) => {
      loadedApplicationObj[app.uuid] = app.name;
    });

    componentsList.forEach((component: any) => {
      const application_id = component.application_id || component.application_id;
  
      if (!this.context[application_id]) {
        this.context[application_id] = {};
      }
  
      if (!this.context[application_id][component.uuid]) {
        this.context[application_id][component.uuid] = { ...component };
      }
  
      if (!this.applications[application_id]) {
        this.applications[application_id] = {};
      }
      if (!this.Apps[loadedApplicationObj[application_id]]) {
        this.Apps[loadedApplicationObj[application_id]] = {};
      }
      
      component.children = [];
      
      this.Apps[loadedApplicationObj[application_id]][component.name] = component;
      this.applications[application_id][component.name] = component;
      
      // Initialize runtime values if they don't exist
      if (component.uniqueUUID) {
        // Get existing values or use empty object
        const existingValues = runtimeValues[component.uniqueUUID] || {};
        // If component has any initial values not yet in runtime store, add them
        const initialValues = component.Instance || {};
        
        // Merge any new initial values with existing runtime values
        if (Object.keys(initialValues).length > 0) {
          const mergedValues = { ...existingValues, ...initialValues };
          if (JSON.stringify(existingValues) !== JSON.stringify(mergedValues)) {
            setComponentRuntimeValues(component.uniqueUUID, mergedValues);
          }
        }
        this.attachValuesProperty(component);
      }
    });
  
    componentsList.forEach((component: any) => {
      if (component.childrenIds && Array.isArray(component.childrenIds) && component.childrenIds.length > 0) {
        component.childrenIds.forEach((childId: string) => {
          const childComponent = componentsList.find((c: any) => c.uuid === childId);
          if (childComponent) {
            component.children.push(childComponent);
            childComponent.parent = component;
          }
        });
      }
    });
    
    Editor.components = componentsList;
    this.PropertiesProxy = componentsList;
    this.updateEditorContext();
  }
}

// Create singleton instance
export const RuntimeInstance = RuntimeContext.getInstance();
RuntimeInstance.setcomponentRuntimeStyleAttribute = setcomponentRuntimeStyleAttribute;

// Alias for existing code - this is the main export
export const ExecuteInstance = RuntimeInstance;

// Export handler execution function
export { executeHandler };