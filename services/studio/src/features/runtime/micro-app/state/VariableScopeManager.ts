/**
 * Variable Scope System for Micro-Apps
 *
 * Provides a two-tier variable scope system:
 * - LOCAL: Isolated to single micro-app instance
 * - GLOBAL: Shared across all apps and micro-apps
 */

export enum VariableScope {
  LOCAL = 'local',
  GLOBAL = 'global'
}

export interface VariableDescriptor {
  value: any
  scope: VariableScope
  readonly?: boolean
  subscribers?: Set<(value: any) => void>
}

export class VariableScopeManager {
  // Scope storage
  private localVars: Map<string, VariableDescriptor>
  private globalVars: Map<string, VariableDescriptor>  // Shared reference

  // Identity
  private microAppId: string

  // Protected variables that cannot be modified
  private protectedGlobalVars = new Set([
    'global.systemConfig',
    'global.apiKeys',
    'global.credentials'
  ])

  constructor(
    microAppId: string,
    globalVars: Map<string, VariableDescriptor>
  ) {
    this.microAppId = microAppId
    this.localVars = new Map()
    this.globalVars = globalVars  // Reference to shared global vars
  }

  /**
   * Get variable with scope resolution (local → global)
   * Supports explicit scope: "global.userName", "local.tempData"
   * Or auto-resolution: "userName" (searches local → global)
   */
  get(varName: string): any {
    // Parse scope prefix if exists
    const { scope, name } = this.parseVarName(varName)

    if (scope) {
      // Explicit scope requested
      return this.getFromScope(name, scope)
    }

    // Auto-resolution: local → global
    if (this.localVars.has(name)) {
      return this.localVars.get(name)!.value
    }
    if (this.globalVars.has(name)) {
      return this.globalVars.get(name)!.value
    }

    return undefined
  }

  /**
   * Set variable in specified scope
   * Supports explicit scope via prefix or scope parameter
   */
  set(varName: string, value: any, scope: VariableScope = VariableScope.LOCAL): void {
    const { scope: explicitScope, name } = this.parseVarName(varName)
    const targetScope = explicitScope || scope

    // Check for protected variables
    const fullName = targetScope !== VariableScope.LOCAL ? `${targetScope}.${name}` : name
    if (this.protectedGlobalVars.has(fullName)) {
      console.warn(`Cannot modify protected variable: ${fullName}`)
      return
    }

    // Check readonly
    const existingDescriptor = this.getDescriptorFromScope(name, targetScope)
    if (existingDescriptor?.readonly) {
      console.warn(`Cannot modify readonly variable: ${fullName}`)
      return
    }

    const descriptor: VariableDescriptor = {
      value,
      scope: targetScope,
      subscribers: existingDescriptor?.subscribers || new Set()
    }

    switch (targetScope) {
      case VariableScope.LOCAL:
        this.localVars.set(name, descriptor)
        break
      case VariableScope.GLOBAL:
        this.globalVars.set(name, descriptor)
        break
    }

    // Notify subscribers
    this.notifySubscribers(name, targetScope, value)
  }

  /**
   * Parse variable name with scope prefix
   * Examples: "global.userName", "local.tempData", "myVar"
   */
  private parseVarName(varName: string): { scope: VariableScope | null, name: string } {
    const parts = varName.split('.')

    if (parts.length > 1) {
      const scopePrefix = parts[0].toLowerCase()
      if (Object.values(VariableScope).includes(scopePrefix as VariableScope)) {
        return {
          scope: scopePrefix as VariableScope,
          name: parts.slice(1).join('.')
        }
      }
    }

    return { scope: null, name: varName }
  }

  private getFromScope(name: string, scope: VariableScope): any {
    switch (scope) {
      case VariableScope.LOCAL:
        return this.localVars.get(name)?.value
      case VariableScope.GLOBAL:
        return this.globalVars.get(name)?.value
    }
  }

  /**
   * Subscribe to variable changes across any scope
   */
  subscribe(varName: string, callback: (value: any) => void): () => void {
    const { scope, name } = this.parseVarName(varName)

    // Determine target scope: use explicit scope if provided, otherwise resolve from current state
    const targetScope = scope ?? this.resolveScope(name)
    const descriptor = this.getDescriptorFromScope(name, targetScope)

    if (descriptor) {
      descriptor.subscribers!.add(callback)
    } else {
      // Create placeholder descriptor for future variable
      const newDescriptor: VariableDescriptor = {
        value: undefined,
        scope: targetScope,
        subscribers: new Set([callback])
      }

      switch (targetScope) {
        case VariableScope.LOCAL:
          this.localVars.set(name, newDescriptor)
          break
        case VariableScope.GLOBAL:
          this.globalVars.set(name, newDescriptor)
          break
      }
    }

    // Return unsubscribe function
    return () => {
      const desc = this.getDescriptorFromScope(name, targetScope)
      desc?.subscribers?.delete(callback)
    }
  }

  private resolveScope(name: string): VariableScope {
    if (this.localVars.has(name)) return VariableScope.LOCAL
    if (this.globalVars.has(name)) return VariableScope.GLOBAL
    return VariableScope.LOCAL  // Default to local
  }

  private getDescriptorFromScope(name: string, scope: VariableScope): VariableDescriptor | undefined {
    switch (scope) {
      case VariableScope.LOCAL:
        return this.localVars.get(name)
      case VariableScope.GLOBAL:
        return this.globalVars.get(name)
    }
  }

  private notifySubscribers(name: string, scope: VariableScope, value: any): void {
    const descriptor = this.getDescriptorFromScope(name, scope)
    if (descriptor?.subscribers) {
      descriptor.subscribers.forEach(callback => {
        try {
          callback(value)
        } catch (error) {
          console.error('Error in variable subscriber:', error)
        }
      })
    }
  }

  /**
   * Publish variable to global scope
   */
  publishToGlobal(varName: string): void {
    const { name } = this.parseVarName(varName)
    const currentValue = this.get(varName)
    if (currentValue !== undefined) {
      this.set(`global.${name}`, currentValue, VariableScope.GLOBAL)
    } else {
      console.warn(`Variable "${varName}" not found or is undefined`)
    }
  }

  /**
   * Check if variable exists in any scope
   */
  has(varName: string): boolean {
    const { scope, name } = this.parseVarName(varName)

    if (scope) {
      return this.getDescriptorFromScope(name, scope) !== undefined
    }

    return this.localVars.has(name) ||
           this.globalVars.has(name)
  }

  /**
   * Delete variable from scope
   */
  delete(varName: string): boolean {
    const { scope, name } = this.parseVarName(varName)

    if (scope) {
      switch (scope) {
        case VariableScope.LOCAL:
          return this.localVars.delete(name)
        case VariableScope.GLOBAL:
          return this.globalVars.delete(name)
      }
    }

    // Try to delete from local first, then global
    return this.localVars.delete(name) ||
           this.globalVars.delete(name)
  }

  /**
   * Get all variables by scope
   */
  getAllLocal(): Record<string, any> {
    return Object.fromEntries(
      Array.from(this.localVars.entries()).map(([k, v]) => [k, v.value])
    )
  }

  getAllGlobal(): Record<string, any> {
    return Object.fromEntries(
      Array.from(this.globalVars.entries()).map(([k, v]) => [k, v.value])
    )
  }

  /**
   * Get all variables from all scopes
   */
  getAll(): Record<string, any> {
    return {
      ...this.getAllGlobal(),
      ...this.getAllLocal()
    }
  }

  /**
   * Cleanup - only clears local vars, keeps shared references
   */
  cleanup(): void {
    // Notify all subscribers before clearing
    this.localVars.forEach((descriptor, name) => {
      if (descriptor.subscribers) {
        descriptor.subscribers.forEach(callback => {
          try {
            callback(undefined)
          } catch (error) {
            console.error('Error in cleanup subscriber:', error)
          }
        })
        descriptor.subscribers.clear()
      }
    })

    this.localVars.clear()
  }

  /**
   * Debug helper - get scope information
   */
  getDebugInfo(): any {
    return {
      microAppId: this.microAppId,
      localVarCount: this.localVars.size,
      globalVarCount: this.globalVars.size,
      localVars: Array.from(this.localVars.keys()),
      globalVars: Array.from(this.globalVars.keys())
    }
  }
}
