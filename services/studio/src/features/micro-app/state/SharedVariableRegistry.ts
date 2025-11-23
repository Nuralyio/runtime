/**
 * Shared Variable Registry (Singleton)
 *
 * Manages shared variable storage across all micro-app instances.
 * Provides app-level and global-level variable storage that is shared
 * between micro-apps while maintaining proper isolation.
 */

import { VariableScope, VariableScopeManager, type VariableDescriptor } from './VariableScopeManager'

export class SharedVariableRegistry {
  private static instance: SharedVariableRegistry

  // Shared storage
  private globalVars: Map<string, VariableDescriptor> = new Map()
  private appVars: Map<string, Map<string, VariableDescriptor>> = new Map()

  // Track active micro-apps for cleanup
  private activeMicroApps: Set<string> = new Set()

  private constructor() {
    this.initializeGlobalVars()
  }

  /**
   * Get singleton instance
   */
  static getInstance(): SharedVariableRegistry {
    if (!SharedVariableRegistry.instance) {
      SharedVariableRegistry.instance = new SharedVariableRegistry()
    }
    return SharedVariableRegistry.instance
  }

  /**
   * Initialize default global variables
   */
  private initializeGlobalVars(): void {
    // Set up default global variables
    this.globalVars.set('isAuthenticated', {
      value: false,
      scope: VariableScope.GLOBAL,
      subscribers: new Set()
    })

    this.globalVars.set('theme', {
      value: 'light',
      scope: VariableScope.GLOBAL,
      subscribers: new Set()
    })
  }

  /**
   * Get or create app-level variable storage
   */
  getAppVars(appId: string): Map<string, VariableDescriptor> {
    if (!this.appVars.has(appId)) {
      this.appVars.set(appId, new Map())
    }
    return this.appVars.get(appId)!
  }

  /**
   * Get global variable storage
   */
  getGlobalVars(): Map<string, VariableDescriptor> {
    return this.globalVars
  }

  /**
   * Create scope manager for a micro-app instance
   */
  createScopeManager(microAppId: string, appId: string): VariableScopeManager {
    this.activeMicroApps.add(microAppId)

    return new VariableScopeManager(
      microAppId,
      appId,
      this.getAppVars(appId),
      this.getGlobalVars()
    )
  }

  /**
   * Unregister micro-app (called on unmount)
   */
  unregisterMicroApp(microAppId: string): void {
    this.activeMicroApps.delete(microAppId)
  }

  /**
   * Clear app-level vars (when app unmounts)
   */
  clearAppVars(appId: string): void {
    const appVars = this.appVars.get(appId)
    if (appVars) {
      // Notify all subscribers
      appVars.forEach((descriptor) => {
        if (descriptor.subscribers) {
          descriptor.subscribers.forEach(callback => {
            try {
              callback(undefined)
            } catch (error) {
              console.error('Error in app var cleanup subscriber:', error)
            }
          })
          descriptor.subscribers.clear()
        }
      })

      appVars.clear()
      this.appVars.delete(appId)
    }
  }

  /**
   * Set a global variable directly
   */
  setGlobalVar(name: string, value: any, readonly: boolean = false): void {
    const existing = this.globalVars.get(name)

    this.globalVars.set(name, {
      value,
      scope: VariableScope.GLOBAL,
      readonly,
      subscribers: existing?.subscribers || new Set()
    })

    // Notify subscribers
    if (existing?.subscribers) {
      existing.subscribers.forEach(callback => {
        try {
          callback(value)
        } catch (error) {
          console.error('Error in global var subscriber:', error)
        }
      })
    }
  }

  /**
   * Get a global variable directly
   */
  getGlobalVar(name: string): any {
    return this.globalVars.get(name)?.value
  }

  /**
   * Subscribe to global variable changes
   */
  subscribeToGlobalVar(name: string, callback: (value: any) => void): () => void {
    let descriptor = this.globalVars.get(name)

    if (!descriptor) {
      // Create placeholder
      descriptor = {
        value: undefined,
        scope: VariableScope.GLOBAL,
        subscribers: new Set()
      }
      this.globalVars.set(name, descriptor)
    }

    descriptor.subscribers!.add(callback)

    // Return unsubscribe function
    return () => {
      descriptor?.subscribers?.delete(callback)
    }
  }

  /**
   * Get all active micro-app IDs
   */
  getActiveMicroApps(): string[] {
    return Array.from(this.activeMicroApps)
  }

  /**
   * Clear all (for testing or reset)
   */
  clearAll(): void {
    // Notify all subscribers
    this.appVars.forEach((appVarMap) => {
      appVarMap.forEach((descriptor) => {
        descriptor.subscribers?.clear()
      })
      appVarMap.clear()
    })

    this.globalVars.forEach((descriptor) => {
      descriptor.subscribers?.clear()
    })

    this.appVars.clear()
    this.globalVars.clear()
    this.activeMicroApps.clear()

    // Reinitialize defaults
    this.initializeGlobalVars()
  }

  /**
   * Debug helper
   */
  getDebugInfo(): any {
    return {
      activeMicroApps: Array.from(this.activeMicroApps),
      appCount: this.appVars.size,
      globalVarCount: this.globalVars.size,
      apps: Array.from(this.appVars.entries()).map(([appId, vars]) => ({
        appId,
        varCount: vars.size,
        vars: Array.from(vars.keys())
      })),
      globalVars: Array.from(this.globalVars.keys())
    }
  }

  /**
   * Export global variables (for persistence)
   */
  exportGlobalVars(): Record<string, any> {
    const result: Record<string, any> = {}
    this.globalVars.forEach((descriptor, name) => {
      if (!descriptor.readonly) {
        result[name] = descriptor.value
      }
    })
    return result
  }

  /**
   * Import global variables (from persistence)
   */
  importGlobalVars(vars: Record<string, any>): void {
    Object.entries(vars).forEach(([name, value]) => {
      this.setGlobalVar(name, value)
    })
  }
}
