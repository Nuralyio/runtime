/**
 * Micro-App Runtime Context
 *
 * Provides an isolated runtime execution context for each micro-app instance.
 * Similar to the global RuntimeContext but scoped to a single micro-app.
 */

import deepEqual from 'fast-deep-equal'
import type { ComponentElement } from '../../redux/store/component/component.interface'
import { MicroAppStoreContext } from './MicroAppStoreContext'
import { VariableScope } from './VariableScopeManager'
import { eventDispatcher } from '../../utils/change-detection'
import { RuntimeContextHelpers } from '../../utils/RuntimeContextHelpers'

const DEBUG = false

export class MicroAppRuntimeContext {
  // Store context reference
  private storeContext: MicroAppStoreContext

  // Component registries
  public applications: Record<string, Record<string, ComponentElement>> = {}
  public Apps: Record<string, Record<string, ComponentElement>> = {}

  // Runtime state
  public Values: Record<string, any> = {}
  public Properties: Record<string, any> = {}
  public Vars: Record<string, any> = {}

  // Proxies
  public PropertiesProxy: any
  public VarsProxy: any
  public Current: Record<string, any> = {}

  // Caches
  private styleProxyCache = new WeakMap()
  private valuesProxyCache = new WeakMap()
  private listeners: Record<string, Set<string>> = {}

  // Subscriptions
  private subscriptions: Set<() => void> = new Set()

  // Scoped event namespace
  private eventNamespace: string

  constructor(storeContext: MicroAppStoreContext) {
    this.storeContext = storeContext
    this.eventNamespace = `microapp:${storeContext.microAppId}`

    // Initialize proxies
    this.PropertiesProxy = this.createProxy(this.Properties)
    this.VarsProxy = this.createVarsProxy()

    // Subscribe to store changes
    this.subscribeToStores()
  }

  /**
   * Create reactive proxy for variables with scope support
   */
  private createVarsProxy(): any {
    const self = this
    const scopeManager = this.storeContext.getVariableScopeManager()

    return new Proxy(this.Vars, {
      get(target, prop: string) {
        if (DEBUG) {
          console.log(`[MicroApp ${self.eventNamespace}] Getting var: ${String(prop)}`)
        }

        // Use scope manager for variable access
        return scopeManager.get(String(prop))
      },
      set(target, prop: string, value) {
        if (DEBUG) {
          console.log(`[MicroApp ${self.eventNamespace}] Setting var: ${String(prop)} = ${value}`)
        }

        const oldValue = scopeManager.get(String(prop))

        // Parse to determine target scope (check if prop starts with 'global.' or 'local.')
        const propStr = String(prop)
        let targetScope = VariableScope.LOCAL
        let varName = propStr

        if (propStr.startsWith('global.')) {
          targetScope = VariableScope.GLOBAL
          varName = propStr.substring(7) // Remove 'global.' prefix
        } else if (propStr.startsWith('local.')) {
          targetScope = VariableScope.LOCAL
          varName = propStr.substring(6) // Remove 'local.' prefix
        }

        // Set via scope manager (defaults to local scope)
        scopeManager.set(varName, value, targetScope)

        // Update internal Vars object for compatibility
        target[prop as string] = value

        // Emit scoped event if value changed
        if (!deepEqual(oldValue, value)) {
          // Emit micro-app scoped event
          eventDispatcher.emit(`${self.eventNamespace}:Vars:${String(prop)}`, {
            prop,
            value,
            oldValue
          })

          // For GLOBAL variables, emit a global event that all micro-apps can listen to
          if (targetScope === VariableScope.GLOBAL) {
            console.log(`[MicroApp ${self.eventNamespace}] Emitting global variable change: ${propStr}`)
            eventDispatcher.emit('global:variable:changed', {
              varName: propStr, // Use full prop name with 'global.' prefix
              name: varName, // Just the variable name without prefix
              value,
              oldValue
            })
          }

          // Trigger component input refresh for all components in this micro-app
          // This makes components with input handlers that reference this variable re-render
          self.storeContext.getComponents().forEach((component: any) => {
            eventDispatcher.emit(`component-input-refresh-request:${component.uuid}`, {
              varName: String(prop),
              value
            })
          })
        }

        return true
      },
      has(target, prop: string) {
        return scopeManager.has(String(prop))
      }
    })
  }

  /**
   * Create reactive proxy for properties.
   *
   * Uses RuntimeContextHelpers to eliminate code duplication with RuntimeContext.
   */
  private createProxy(target: any, scope?: string): any {
    return RuntimeContextHelpers.createReactiveProxy(target, {
      eventPrefix: this.eventNamespace, // Scoped prefix for micro-app isolation
      scope,
      listeners: this.listeners,
      current: this.Current,
      onPropertyChange: (prop: string, value: any, listeners: Set<string>) => {
        // Emit scoped events to all listeners for this property
        listeners.forEach((componentName: string) => {
          eventDispatcher.emit(`${this.eventNamespace}:component-property-changed:${componentName}`, {
            prop,
            value, // IMPORTANT: Include value in event data
            ctx: this.Current
          })
        })
      },
      debug: DEBUG
    })
  }

  /**
   * Subscribe to isolated store changes
   */
  private subscribeToStores(): void {
    // Subscribe to components changes
    const componentsUnsub = this.storeContext.$components.subscribe(() => {
      this.registerComponents()
    })
    this.subscriptions.add(componentsUnsub)

    // Subscribe to generic GLOBAL variable change events (emitted by any micro-app)
    // This ensures that when one micro-app changes a global variable, all micro-apps update
    const globalVarUnsub = eventDispatcher.on('global:variable:changed', (data: any) => {
      console.log(`[MicroApp ${this.eventNamespace}] Received global variable change: ${data.varName} = ${data.value}`)

      // Trigger component input refresh for all components in this micro-app
      const components = this.storeContext.getComponents()
      console.log(`[MicroApp ${this.eventNamespace}] Refreshing ${components.length} components`)

      components.forEach((component: any) => {
        eventDispatcher.emit(`component-input-refresh-request:${component.uuid}`, {
          varName: data.varName,
          value: data.value
        })
      })
    })
    this.subscriptions.add(globalVarUnsub)

    // Initial registration
    if (this.storeContext.isLoaded()) {
      this.registerComponents()
    }
  }

  /**
   * Register components from the isolated store
   */
  public registerComponents(): void {
    const components = this.storeContext.getComponents()
    const appUUID = this.storeContext.appUUID
    const runtimeValues = this.storeContext.$runtimeValues.get()

    if (DEBUG) {
      console.log(`[MicroApp ${this.eventNamespace}] Registering ${components.length} components`)
    }

    // Initialize registry for this app
    if (!this.applications[appUUID]) {
      this.applications[appUUID] = {}
    }

    // Index components by name
    components.forEach((component: ComponentElement) => {
      // Initialize children array
      component.children = []

      // Register component
      this.applications[appUUID][component.name] = component

      // Initialize runtime values
      if (component.uuid) {
        const existingValues = runtimeValues[component.uuid] || {}
        const initialValues = component.Instance || {}

        if (Object.keys(initialValues).length > 0) {
          const mergedValues = { ...existingValues, ...initialValues }
          this.storeContext.setRuntimeValue(component.uuid, 'values', mergedValues)
        }

        this.attachValuesProperty(component)
      }

      // Attach micro-app runtime context reference for isolated execution
      component.__microAppContext = {
        Vars: this.VarsProxy,
        runtimeContext: this
      }
    })

    // Resolve component hierarchy
    components.forEach((component: ComponentElement) => {
      if (component.childrenIds && component.childrenIds.length > 0) {
        component.children = component.childrenIds
          .map(childId => {
            const child = this.getComponentByUUID(childId)
            return child
          })
          .filter(Boolean) as ComponentElement[]

        // Set parent references
        component.children.forEach(child => {
          child.parent = component
        })
      }
    })

    if (DEBUG) {
      console.log(`[MicroApp ${this.eventNamespace}] Registration complete`)
    }
  }

  /**
   * Attach reactive Instance property to component.
   *
   * Uses RuntimeContextHelpers to eliminate code duplication with RuntimeContext.
   */
  private attachValuesProperty(component: ComponentElement): void {
    // Use RuntimeContextHelpers to create the values proxy
    const instanceProxy = RuntimeContextHelpers.createValuesProxy(
      component,
      {
        // Backend: Isolated store context
        get: (id: string, prop: string) => {
          return this.storeContext.getRuntimeValue(id, prop)
        },
        set: (id: string, prop: string, value: any) => {
          this.storeContext.setRuntimeValue(id, prop, value)
        },
        has: (id: string, prop: string) => {
          return this.storeContext.getRuntimeValue(id, prop) !== undefined
        }
      },
      (id: string, prop: string, value: any, oldValue?: any) => {
        // Emit scoped event when value changes
        eventDispatcher.emit(`${this.eventNamespace}:component-instance-changed:${id}`, {
          prop,
          value,
          oldValue,
          component
        })
      },
      this.valuesProxyCache
    )

    // Attach the proxy to the component
    component.Instance = instanceProxy
  }

  /**
   * Get component by UUID
   */
  public getComponentByUUID(uuid: string): ComponentElement | undefined {
    return this.storeContext.getComponentByUUID(uuid)
  }

  /**
   * Get component by name
   */
  public getComponent(name: string): ComponentElement | undefined {
    return this.applications[this.storeContext.appUUID]?.[name]
  }

  /**
   * Get all components in this micro-app
   */
  public getAllComponents(): ComponentElement[] {
    return Object.values(this.applications[this.storeContext.appUUID] || {})
  }

  /**
   * Get variable (with scope resolution)
   */
  public getVar(name: string): any {
    return this.storeContext.getVariableScopeManager().get(name)
  }

  /**
   * Set variable (defaults to local scope)
   */
  public setVar(name: string, value: any, scope: VariableScope = VariableScope.LOCAL): void {
    this.storeContext.getVariableScopeManager().set(name, value, scope)
  }

  /**
   * Subscribe to variable changes
   */
  public subscribeToVar(name: string, callback: (value: any) => void): () => void {
    return this.storeContext.getVariableScopeManager().subscribe(name, callback)
  }

  /**
   * Publish variable to global scope
   */
  public publishToGlobal(varName: string): void {
    this.storeContext.getVariableScopeManager().publishToGlobal(varName)
  }

  /**
   * Get scoped event name
   */
  public getScopedEventName(eventName: string): string {
    return `${this.eventNamespace}:${eventName}`
  }

  /**
   * Emit scoped event
   */
  public emitScopedEvent(eventName: string, data?: any): void {
    eventDispatcher.emit(this.getScopedEventName(eventName), data)
  }

  /**
   * Subscribe to scoped event
   */
  public onScopedEvent(eventName: string, handler: (data: any) => void): () => void {
    const scopedName = this.getScopedEventName(eventName)
    eventDispatcher.on(scopedName, handler)

    // Return unsubscribe function
    const unsubscribe = () => {
      eventDispatcher.off(scopedName, handler)
    }
    this.subscriptions.add(unsubscribe)
    return unsubscribe
  }

  /**
   * Get debug information
   */
  public getDebugInfo(): any {
    return {
      eventNamespace: this.eventNamespace,
      componentCount: Object.keys(this.applications[this.storeContext.appUUID] || {}).length,
      variableCount: Object.keys(this.Vars).length,
      listenerCount: Object.keys(this.listeners).length,
      storeInfo: this.storeContext.getDebugInfo()
    }
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    // Unsubscribe from all events
    this.subscriptions.forEach(unsub => {
      try {
        unsub()
      } catch (error) {
        console.error('Error unsubscribing:', error)
      }
    })
    this.subscriptions.clear()

    // Clear registries
    this.applications = {}
    this.Apps = {}
    this.Values = {}
    this.Properties = {}
    this.Vars = {}
    this.Current = {}

    // Clear caches
    this.styleProxyCache = new WeakMap()
    this.valuesProxyCache = new WeakMap()
    this.listeners = {}

    if (DEBUG) {
      console.log(`[MicroApp ${this.eventNamespace}] Cleaned up`)
    }
  }
}
