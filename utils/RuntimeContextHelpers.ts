/**
 * @fileoverview Runtime Context Helpers
 * @module Runtime/Utils/RuntimeContextHelpers
 *
 * @description
 * Shared utility functions for RuntimeContext and MicroAppRuntimeContext.
 *
 * This module eliminates code duplication by extracting common proxy creation
 * and component management logic that was previously duplicated between the
 * global RuntimeContext and the isolated MicroAppRuntimeContext.
 *
 * Key functions:
 * - createReactiveProxy: Creates reactive proxies with configurable event dispatching
 * - createValuesProxy: Creates component Instance proxies with configurable backends
 * - createNestedProxy: Creates proxies for nested object properties
 *
 * @see {@link RuntimeContext} - Global singleton context
 * @see {@link MicroAppRuntimeContext} - Isolated per-instance context
 */

import deepEqual from 'fast-deep-equal';
import { eventDispatcher } from './change-detection';
import type { ComponentElement } from '../redux/store/component/component.interface';

/**
 * Configuration for reactive proxy creation
 */
export interface ReactiveProxyConfig {
  /** Event prefix for scoped events (empty string for global) */
  eventPrefix: string;

  /** Optional scope name for additional event namespacing */
  scope?: string;

  /** Map of property listeners */
  listeners: Record<string, Set<string>>;

  /** Current execution context */
  current: Record<string, any>;

  /** Callback when property changes */
  onPropertyChange: (prop: string, value: any, listeners: Set<string>) => void;

}

/**
 * Configuration for nested proxy creation
 */
interface NestedProxyConfig extends ReactiveProxyConfig {
  /** Parent property name */
  parentProp: string;
}

/**
 * Backend interface for values proxy
 */
export interface ValuesProxyBackend {
  /** Get value from backend store */
  get: (componentId: string, prop: string) => any;

  /** Set value in backend store */
  set: (componentId: string, prop: string, value: any) => void;

  /** Check if property exists in backend store */
  has: (componentId: string, prop: string) => boolean;

  /** Delete property from backend store */
  delete?: (componentId: string, prop: string) => void;

  /** Get all keys from backend store */
  keys?: (componentId: string) => string[];
}

/**
 * Runtime Context Helpers
 *
 * Utility class with static methods for creating reactive proxies and managing
 * component state. Used by both RuntimeContext and MicroAppRuntimeContext to
 * eliminate code duplication.
 */
export class RuntimeContextHelpers {
  /**
   * Create a reactive proxy for an object with configurable event dispatching.
   *
   * This proxy tracks property access and changes, maintains listeners,
   * and emits events when properties are modified.
   *
   * @param target - Object to wrap with proxy
   * @param config - Configuration for proxy behavior
   * @returns Reactive proxy for the target object
   *
   * @example
   * ```typescript
   * const proxy = RuntimeContextHelpers.createReactiveProxy(myObject, {
   *   eventPrefix: 'microapp:123',
   *   scope: 'Vars',
   *   listeners: this.listeners,
   *   current: this.Current,
   *   onPropertyChange: (prop, value, listeners) => {
   *     listeners.forEach(name => {
   *       eventDispatcher.emit(`${eventPrefix}:changed:${name}`, { prop, value });
   *     });
   *   }
   * });
   * ```
   */
  static createReactiveProxy<T extends object>(
    target: T,
    config: ReactiveProxyConfig
  ): T {
    const { eventPrefix, scope, listeners, current, onPropertyChange } = config;

    if (typeof target !== 'object' || target === null) {
      return target;
    }

    return new Proxy(target, {
      get(proxyTarget, prop, receiver) {
        const value = Reflect.get(proxyTarget, prop, receiver);

        // Track listener for this property
        if (!listeners[String(prop)]) {
          listeners[String(prop)] = new Set<string>();
        }

        if (current.name) {
          listeners[String(prop)].add(current.name);
        }

        // Create nested proxy for object values
        if (typeof value === 'object' && value !== null) {
          return RuntimeContextHelpers.createNestedProxy(value, {
            ...config,
            parentProp: String(prop)
          });
        }

        return value;
      },

      set(proxyTarget, prop, value, receiver) {
        const oldValue = proxyTarget[prop as keyof T];

        // Guard: Don't emit events if value hasn't changed
        // Wrap in try-catch to handle proxy objects that may not have valueOf
        let valuesEqual = false;
        try {
          valuesEqual = deepEqual(oldValue, value);
        } catch (e) {
          // If deepEqual fails (e.g., comparing proxies), assume values are different
          valuesEqual = false;
        }

        if (valuesEqual) {
          return true;
        }

        const result = Reflect.set(proxyTarget, prop, value, receiver);

        // Emit property change events
        const propListeners = listeners[String(prop)] || new Set<string>();
        onPropertyChange(String(prop), value, propListeners);

        // Emit scope-specific event if scope is provided
        if (scope) {
          const eventName = eventPrefix
            ? `${eventPrefix}:${scope}:${String(prop)}`
            : `${scope}:${String(prop)}`;

          eventDispatcher.emit(eventName, {
            value,
            ctx: current // IMPORTANT: Include ctx for scope events (e.g., Vars:selectedComponents)
          });
        }

        return result;
      }
    });
  }

  /**
   * Create a nested proxy for object properties.
   *
   * Nested proxies maintain the same reactive behavior as the parent proxy
   * but track changes to nested properties separately.
   *
   * @param target - Nested object to wrap
   * @param config - Configuration including parent property name
   * @returns Reactive proxy for nested object
   */
  private static createNestedProxy<T extends object>(
    target: T,
    config: NestedProxyConfig
  ): T {
    const { eventPrefix, scope, listeners, current, parentProp } = config;

    return new Proxy(target, {
      set(proxyTarget, prop, value, receiver) {
        const oldValue = proxyTarget[prop as keyof T];
        const result = Reflect.set(proxyTarget, prop, value, receiver);

        // Check if value changed, with error handling for proxy objects
        let valuesEqual = false;
        try {
          valuesEqual = deepEqual(oldValue, value);
        } catch (e) {
          // If deepEqual fails (e.g., comparing proxies), assume values are different
          valuesEqual = false;
        }

        if (!valuesEqual) {
          // Emit to parent property listeners
          const parentListeners = listeners[parentProp] || new Set<string>();
          parentListeners.forEach((componentName: string) => {
            const eventName = eventPrefix
              ? `${eventPrefix}:component-property-changed:${componentName}`
              : `component-property-changed:${componentName}`;

            eventDispatcher.emit(eventName, {
              prop: parentProp,
              value,
              ctx: current
            });
          });

          // Emit nested scope event if scope is provided
          if (scope) {
            const eventName = eventPrefix
              ? `${eventPrefix}:${scope}:${parentProp}.${String(prop)}`
              : `${scope}:${parentProp}.${String(prop)}`;

            eventDispatcher.emit(eventName, {
              prop,
              value,
              oldValue,
              parent: parentProp
            });
          }
        }

        return result;
      },

      deleteProperty(proxyTarget, prop) {
        const result = Reflect.deleteProperty(proxyTarget, prop);

        if (result) {
          // Emit to parent property listeners
          const parentListeners = listeners[parentProp] || new Set<string>();
          parentListeners.forEach((componentName: string) => {
            const eventName = eventPrefix
              ? `${eventPrefix}:component-property-changed:${componentName}`
              : `component-property-changed:${componentName}`;

            eventDispatcher.emit(eventName, {
              prop: parentProp,
              ctx: current
            });
          });
        }

        return result;
      }
    });
  }

  /**
   * Create a values proxy for component Instance property.
   *
   * This proxy provides reactive access to component runtime values,
   * reading from and writing to a configurable backend store.
   *
   * @param component - Component to create values proxy for
   * @param backend - Backend store interface
   * @param onValueChange - Callback when value changes
   * @param cache - Optional WeakMap cache for proxy reuse
   * @returns Reactive proxy for component values
   *
   * @example
   * ```typescript
   * // For global RuntimeContext
   * const proxy = RuntimeContextHelpers.createValuesProxy(component, {
   *   get: (id, prop) => $runtimeValues.get()[id]?.[prop],
   *   set: (id, prop, value) => setComponentRuntimeValue(id, prop, value),
   *   has: (id, prop) => prop in ($runtimeValues.get()[id] || {})
   * }, (id, prop, value) => {
   *   eventDispatcher.emit(`component:value:set:${id}`, { prop, value });
   * });
   *
   * // For MicroAppRuntimeContext
   * const proxy = RuntimeContextHelpers.createValuesProxy(component, {
   *   get: (id, prop) => storeContext.getRuntimeValue(id, prop),
   *   set: (id, prop, value) => storeContext.setRuntimeValue(id, prop, value),
   *   has: (id, prop) => storeContext.getRuntimeValue(id, prop) !== undefined
   * }, (id, prop, value) => {
   *   eventDispatcher.emit(`${eventNamespace}:component-instance-changed:${id}`, { prop, value });
   * });
   * ```
   */
  static createValuesProxy(
    component: ComponentElement,
    backend: ValuesProxyBackend,
    onValueChange: (componentId: string, prop: string, value: any, oldValue?: any) => void,
    cache?: WeakMap<ComponentElement, any>
  ): any {
    // Use cache if provided
    if (cache?.has(component)) {
      return cache.get(component);
    }

    const componentId = component.uuid || (component as any).uniqueUUID;

    if (!componentId) {
      console.error('Cannot create values proxy: component UUID is undefined', component);
      return {};
    }

    const valuesProxy = new Proxy({}, {
      get: (target, prop: string) => {
        return backend.get(componentId, prop);
      },

      set: (target, prop: string, value: any) => {
        const oldValue = backend.get(componentId, prop);
        backend.set(componentId, prop, value);

        // Emit change event if value changed
        if (!deepEqual(oldValue, value)) {
          onValueChange(componentId, prop, value, oldValue);
        }

        return true;
      },

      has: (target, prop: string) => {
        return backend.has(componentId, prop);
      },

      deleteProperty: (target, prop: string) => {
        if (backend.delete) {
          backend.delete(componentId, prop);
          onValueChange(componentId, prop, undefined);
        }
        return true;
      },

      ownKeys: (target) => {
        if (backend.keys) {
          return backend.keys(componentId);
        }
        return [];
      },

      getOwnPropertyDescriptor: (target, prop: string) => {
        if (backend.has(componentId, prop)) {
          return {
            enumerable: true,
            configurable: true
          };
        }
        return undefined;
      }
    });

    // Cache the proxy if cache provided
    if (cache) {
      cache.set(component, valuesProxy);
    }

    return valuesProxy;
  }

  /**
   * Register component hierarchy (parent-child relationships).
   *
   * This shared logic resolves component childrenIds into actual component
   * references and sets up bidirectional parent-child relationships.
   *
   * @param components - Array of components to process
   * @param getComponentByUUID - Function to retrieve component by UUID
   * @param debug - Optional debug logging
   *
   * @example
   * ```typescript
   * RuntimeContextHelpers.registerComponentHierarchy(
   *   components,
   *   (uuid) => this.applications[appUUID][uuid],
   *   DEBUG
   * );
   * ```
   */
  static registerComponentHierarchy(
    components: ComponentElement[],
    getComponentByUUID: (uuid: string) => ComponentElement | undefined,
    debug: boolean = false
  ): void {
    components.forEach((component: ComponentElement) => {
      // Initialize children array if needed
      if (!component.children) {
        component.children = [];
      }

      // Resolve childrenIds to actual component references
      if (component.childrenIds && Array.isArray(component.childrenIds) && component.childrenIds.length > 0) {
        component.children = component.childrenIds
          .map(childId => {
            const child = getComponentByUUID(childId);

            if (!child && debug) {
              console.warn(
                `Warning: Child component with UUID "${childId}" not found for parent "${component.name}" (UUID: ${component.uuid})`
              );
            }

            return child;
          })
          .filter(Boolean) as ComponentElement[];

        // Set parent references
        component.children.forEach(child => {
          child.parent = component;
        });
      }
    });
  }
}
