/**
 * Micro-App Handler Executor
 *
 * Provides sandboxed execution environment for handlers within a micro-app.
 * Prevents handlers from accessing global state and ensures isolation.
 */

import { MicroAppRuntimeContext } from '../state/MicroAppRuntimeContext'
import type { ComponentElement } from '@shared/redux/store/component/component.interface'

export class MicroAppHandlerExecutor {
  private runtimeContext: MicroAppRuntimeContext
  private sandboxGlobals: any

  constructor(runtimeContext: MicroAppRuntimeContext) {
    this.runtimeContext = runtimeContext
    this.initializeSandbox()
  }

  /**
   * Initialize sandboxed globals for handler execution
   */
  private initializeSandbox(): void {
    const storeContext = (this.runtimeContext as any).storeContext

    this.sandboxGlobals = {
      // Scoped ExecuteInstance
      ExecuteInstance: {
        applications: this.runtimeContext.applications,
        Apps: this.runtimeContext.Apps,
        VarsProxy: this.runtimeContext.VarsProxy,
        PropertiesProxy: this.runtimeContext.PropertiesProxy,
        Current: this.runtimeContext.Current,
        GetVar: (name: string) => this.runtimeContext.getVar(name),
        SetVar: (name: string, value: any) => this.runtimeContext.setVar(name, value),
        // Variable scope methods
        publishToApp: (varName: string) => this.runtimeContext.publishToApp(varName),
        publishToGlobal: (varName: string) => this.runtimeContext.publishToGlobal(varName)
      },

      // Scoped Vars access
      Vars: this.runtimeContext.VarsProxy,

      // Scoped Properties access
      Properties: this.runtimeContext.PropertiesProxy,

      // Current component context
      Current: this.runtimeContext.Current,

      // Utility functions
      GetVar: (name: string) => this.runtimeContext.getVar(name),
      SetVar: (name: string, value: any) => this.runtimeContext.setVar(name, value),

      // Page navigation
      navigateTo: (pageId: string) => {
        const pageManager = storeContext.pageManager
        return pageManager?.navigateTo(pageId) || false
      },
      navigateToPage: (pageName: string) => {
        const pageManager = storeContext.pageManager
        return pageManager?.navigateToByName(pageName) || false
      },

      // Message bus access
      sendMessage: (message: any) => {
        storeContext.getMessageBus().send({
          from: storeContext.microAppId,
          ...message
        })
      },

      // Console access (for debugging)
      console: {
        log: (...args: any[]) => console.log(`[MicroApp ${storeContext.microAppId}]`, ...args),
        warn: (...args: any[]) => console.warn(`[MicroApp ${storeContext.microAppId}]`, ...args),
        error: (...args: any[]) => console.error(`[MicroApp ${storeContext.microAppId}]`, ...args),
        info: (...args: any[]) => console.info(`[MicroApp ${storeContext.microAppId}]`, ...args)
      },

      // Math, Date, and other safe built-ins
      Math: Math,
      Date: Date,
      JSON: JSON,
      Array: Array,
      Object: Object,
      String: String,
      Number: Number,
      Boolean: Boolean,

      // Prevent access to dangerous globals
      window: undefined,
      document: undefined,
      global: undefined,
      process: undefined,
      require: undefined,
      eval: undefined,
      Function: undefined,

      // Prevent access to global stores (enforce isolation)
      $components: undefined,
      $pages: undefined,
      $context: undefined,
      $applications: undefined
    }
  }

  /**
   * Execute handler code in sandboxed context
   * @param handlerCode - The handler code string to execute
   * @param component - The component context
   * @param event - Optional event object
   * @returns The result of handler execution
   */
  executeHandler(handlerCode: string, component: ComponentElement, event?: any): any {
    try {
      // Set current component context
      this.runtimeContext.Current = component

      // Add event to sandbox if provided
      const sandboxWithEvent = event
        ? { ...this.sandboxGlobals, Event: event, event: event }
        : this.sandboxGlobals

      // Create function with sandboxed globals
      const paramNames = Object.keys(sandboxWithEvent)
      const paramValues = Object.values(sandboxWithEvent)

      // Wrap handler code to handle both expressions and statements
      const wrappedCode = `
        try {
          ${handlerCode}
        } catch (error) {
          console.error('Handler execution error:', error);
          throw error;
        }
      `

      const func = new Function(...paramNames, wrappedCode)

      // Execute with sandboxed context
      return func.apply(component, paramValues)
    } catch (error) {
      console.error(`Handler execution error in micro-app:`, error)
      console.error(`Handler code:`, handlerCode)
      throw error
    } finally {
      // Clear current context
      this.runtimeContext.Current = {}
    }
  }

  /**
   * Execute handler code and return result
   * @param handlerCode - The handler code string
   * @param component - The component context
   * @param event - Optional event object
   * @returns The result
   */
  executeExpression(handlerCode: string, component: ComponentElement, event?: any): any {
    try {
      // Set current component context
      this.runtimeContext.Current = component

      // Add event to sandbox if provided
      const sandboxWithEvent = event
        ? { ...this.sandboxGlobals, Event: event, event: event }
        : this.sandboxGlobals

      // Create function with sandboxed globals
      const paramNames = Object.keys(sandboxWithEvent)
      const paramValues = Object.values(sandboxWithEvent)

      // Wrap as return statement for expression evaluation
      const func = new Function(...paramNames, `return (${handlerCode})`)

      // Execute with sandboxed context
      return func.apply(component, paramValues)
    } catch (error) {
      console.error(`Expression execution error in micro-app:`, error)
      console.error(`Expression:`, handlerCode)
      return undefined
    } finally {
      // Clear current context
      this.runtimeContext.Current = {}
    }
  }

  /**
   * Validate handler code for security
   * @param handlerCode - The code to validate
   * @returns True if code is safe, false otherwise
   */
  validateHandlerCode(handlerCode: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // Check for dangerous patterns
    const dangerousPatterns = [
      { pattern: /window\./g, message: 'Direct window access not allowed' },
      { pattern: /document\./g, message: 'Direct document access not allowed' },
      { pattern: /global\./g, message: 'Direct global access not allowed' },
      { pattern: /process\./g, message: 'Process access not allowed' },
      { pattern: /require\(/g, message: 'Require not allowed' },
      { pattern: /import\(/g, message: 'Dynamic import not allowed' },
      { pattern: /eval\(/g, message: 'Eval not allowed' },
      { pattern: /Function\(/g, message: 'Function constructor not allowed' },
      { pattern: /\$components/g, message: 'Direct store access not allowed' },
      { pattern: /\$pages/g, message: 'Direct store access not allowed' },
      { pattern: /\$context/g, message: 'Direct store access not allowed' }
    ]

    for (const { pattern, message } of dangerousPatterns) {
      if (pattern.test(handlerCode)) {
        errors.push(message)
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Execute handler with validation
   * @param handlerCode - The handler code
   * @param component - The component context
   * @param event - Optional event
   * @returns Execution result or undefined if validation fails
   */
  executeHandlerSafe(handlerCode: string, component: ComponentElement, event?: any): any {
    const validation = this.validateHandlerCode(handlerCode)

    if (!validation.valid) {
      console.error('Handler validation failed:', validation.errors)
      return undefined
    }

    return this.executeHandler(handlerCode, component, event)
  }

  /**
   * Update sandbox globals (e.g., when stores change)
   */
  updateSandbox(): void {
    this.initializeSandbox()
  }

  /**
   * Get sandbox globals (for debugging)
   */
  getSandboxGlobals(): any {
    return { ...this.sandboxGlobals }
  }
}
