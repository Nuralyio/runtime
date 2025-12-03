/**
 * Micro-App Store Context
 *
 * Manages isolated store instances for each micro-app.
 * Each micro-app gets its own components, pages, and context stores.
 */

import { atom, map, deepMap, type WritableAtom, type MapStore, type DeepMapStore } from 'nanostores'
import type { ComponentElement } from '../../redux/store/component/component.interface'
import type { PageElement } from '../../redux/handlers/pages/page.interface'
import { SharedVariableRegistry } from './SharedVariableRegistry'
import { VariableScopeManager } from './VariableScopeManager'
import { MicroAppMessageBus } from '../messaging/MicroAppMessageBus'
import { $components } from '../../redux/store/component/store'
import { $pages } from '../../redux/store/page'

// Forward declaration to avoid circular dependency
type MicroAppPageManager = import('./MicroAppPageManager').MicroAppPageManager

export interface ComponentStore {
  [key: string]: ComponentElement[]
}

export interface PageStore {
  [key: string]: PageElement[]
}

export interface ContextVarStore {
  [key: string]: { [varName: string]: any } | undefined
}

export type EnvironmentMode = 'Edit' | 'Preview'

// Studio app UUID - special case for editor that doesn't load from API
const STUDIO_APP_UUID = "1"

export class MicroAppStoreContext {
  // Identity
  public readonly microAppId: string
  public readonly appUUID: string

  // Isolated stores (nanostores)
  private _$components: DeepMapStore<ComponentStore>
  private _$pages: MapStore<PageStore>
  private _$context: MapStore<ContextVarStore>
  private _$runtimeValues: MapStore<Record<string, any>>
  private _$runtimeStyles: MapStore<Record<string, any>>
  private _$environment: WritableAtom<EnvironmentMode>

  // Variable scope manager
  private variableScopeManager: VariableScopeManager

  // Message bus
  private messageBus: MicroAppMessageBus

  // Page manager (set after initialization for handler access)
  private _pageManager?: MicroAppPageManager

  // Subscriptions for cleanup
  private subscriptions: Set<() => void> = new Set()

  // Load state
  private _isLoaded: boolean = false
  private _loadPromise: Promise<void> | null = null

  // Pre-loaded data
  private preloadedComponents?: ComponentElement[]
  private preloadedPages?: PageElement[]

  constructor(
    microAppId: string,
    appUUID: string,
    preloadedComponents?: ComponentElement[],
    preloadedPages?: PageElement[]
  ) {
    this.microAppId = microAppId
    this.appUUID = appUUID
    this.preloadedComponents = preloadedComponents
    this.preloadedPages = preloadedPages

    // Initialize isolated stores
    this._$components = deepMap<ComponentStore>({})
    this._$pages = map<PageStore>({})
    this._$context = map<ContextVarStore>({})
    this._$runtimeValues = map<Record<string, any>>({})
    this._$runtimeStyles = map<Record<string, any>>({})
    this._$environment = atom<EnvironmentMode>('Preview')

    // Initialize variable scope manager
    const registry = SharedVariableRegistry.getInstance()
    this.variableScopeManager = registry.createScopeManager(microAppId)

    // Get message bus instance
    this.messageBus = MicroAppMessageBus.getInstance()
  }

  /**
   * Load application data from API
   */
  async loadApplication(): Promise<void> {
    // Return existing load promise if already loading
    if (this._loadPromise !== null) {
      return this._loadPromise
    }

    // Return immediately if already loaded
    if (this._isLoaded) {
      return Promise.resolve()
    }

    this._loadPromise = this._doLoadApplication()
    return this._loadPromise
  }

  private async _doLoadApplication(): Promise<void> {
    try {
      let componentsLoaded = false
      let pagesLoaded = false

      // 1. Check for pre-loaded data passed directly (highest priority)
      if (this.preloadedComponents && this.preloadedComponents.length > 0) {
        this._$components.setKey(this.appUUID, this.preloadedComponents)
        componentsLoaded = true
      }

      if (this.preloadedPages && this.preloadedPages.length > 0) {
        this._$pages.setKey(this.appUUID, this.preloadedPages)
        pagesLoaded = true
      }

      // 2. Check if components are already loaded in global store (non-AJAX case)
      // This handles pre-loaded apps like studio (uuid="1") from studio-entrypoint.ts
      // or SSR-hydrated apps from window.__INITIAL_COMPONENT_STATE__
      if (!componentsLoaded || !pagesLoaded) {
        // Try to get from global store (non-AJAX)
        if (!componentsLoaded && typeof window !== 'undefined') {
          const existingComponents = $components.get()[this.appUUID]
          if (existingComponents && existingComponents.length > 0) {
            // Components already loaded - copy to isolated store
            this._$components.setKey(this.appUUID, existingComponents)
            componentsLoaded = true
          }
        }

        if (!pagesLoaded && typeof window !== 'undefined') {
          const existingPages = $pages.get()[this.appUUID]
          if (existingPages && existingPages.length > 0) {
            // Pages already loaded - copy to isolated store
            this._$pages.setKey(this.appUUID, existingPages)
            pagesLoaded = true
          }
        }
      }

      // 3. If still not loaded, fetch from API (AJAX)
      // Studio app (UUID "1") doesn't load from API as it's the editor itself
      if (!componentsLoaded && this.appUUID !== STUDIO_APP_UUID) {
        const componentsResponse = await fetch(`/api/components/application/${this.appUUID}`)
        if (componentsResponse.ok) {
          const data = await componentsResponse.json()
          // Handle both array and object with array format
          const components = Array.isArray(data)
            ? data.map((item: any) => item.component || item)
            : data
          this._$components.setKey(this.appUUID, components)
          componentsLoaded = true
        }
      }

      if (!pagesLoaded && this.appUUID !== STUDIO_APP_UUID) {
        const pagesResponse = await fetch(`/api/pages/application/${this.appUUID}`)
        if (pagesResponse.ok) {
          const pages = await pagesResponse.json()
          this._$pages.setKey(this.appUUID, pages)
          pagesLoaded = true
        }
      }

      // Initialize context for this app
      this._$context.setKey(this.appUUID, {})

      this._isLoaded = true

      // Determine loading source
      const loadingSource = this.preloadedComponents
        ? 'direct'
        : componentsLoaded && pagesLoaded
        ? 'cache'
        : 'api'

      // Notify other micro-apps
      this.messageBus.send({
        from: this.microAppId,
        type: 'MICRO_APP_MOUNTED',
        payload: {
          appUUID: this.appUUID,
          loadingSource,
          componentsCount: this._$components.get()[this.appUUID]?.length || 0,
          pagesCount: this._$pages.get()[this.appUUID]?.length || 0
        }
      })

    } catch (error) {
      console.error(`Failed to load micro-app ${this.microAppId}:`, error)
      throw error
    } finally {
      this._loadPromise = null
    }
  }

  /**
   * Get components store
   */
  get $components(): DeepMapStore<ComponentStore> {
    return this._$components
  }

  /**
   * Get pages store
   */
  get $pages(): MapStore<PageStore> {
    return this._$pages
  }

  /**
   * Get context store
   */
  get $context(): MapStore<ContextVarStore> {
    return this._$context
  }

  /**
   * Get runtime values store
   */
  get $runtimeValues(): MapStore<Record<string, any>> {
    return this._$runtimeValues
  }

  /**
   * Get runtime styles store
   */
  get $runtimeStyles(): MapStore<Record<string, any>> {
    return this._$runtimeStyles
  }

  /**
   * Get environment store
   */
  get $environment(): WritableAtom<EnvironmentMode> {
    return this._$environment
  }

  /**
   * Get variable scope manager
   */
  getVariableScopeManager(): VariableScopeManager {
    return this.variableScopeManager
  }

  /**
   * Get message bus
   */
  getMessageBus(): MicroAppMessageBus {
    return this.messageBus
  }

  /**
   * Set page manager reference (for handler access)
   */
  setPageManager(pageManager: MicroAppPageManager): void {
    this._pageManager = pageManager
  }

  /**
   * Get page manager reference
   */
  getPageManager(): MicroAppPageManager | undefined {
    return this._pageManager
  }

  /**
   * Get components for this app
   */
  getComponents(): ComponentElement[] {
    return this._$components.get()[this.appUUID] || []
  }

  /**
   * Set components for this app
   */
  setComponents(components: ComponentElement[]): void {
    this._$components.setKey(this.appUUID, components)
  }

  /**
   * Get pages for this app
   */
  getPages(): PageElement[] {
    return this._$pages.get()[this.appUUID] || []
  }

  /**
   * Set pages for this app
   */
  setPages(pages: PageElement[]): void {
    this._$pages.setKey(this.appUUID, pages)
  }

  /**
   * Get a component by UUID
   */
  getComponentByUUID(uuid: string): ComponentElement | undefined {
    const components = this.getComponents()
    return this.findComponentRecursive(components, uuid)
  }

  private findComponentRecursive(components: ComponentElement[], uuid: string): ComponentElement | undefined {
    for (const component of components) {
      if (component.uuid === uuid) {
        return component
      }
      if (component.children && component.children.length > 0) {
        const found = this.findComponentRecursive(component.children, uuid)
        if (found) return found
      }
    }
    return undefined
  }

  /**
   * Subscribe to store changes
   */
  subscribe(store: any, handler: () => void): () => void {
    const unsubscribe = store.subscribe(handler)
    this.subscriptions.add(unsubscribe)
    return unsubscribe
  }

  /**
   * Check if application is loaded
   */
  isLoaded(): boolean {
    return this._isLoaded
  }

  /**
   * Set runtime value for a component
   */
  setRuntimeValue(componentId: string, key: string, value: any): void {
    const current = this._$runtimeValues.get()
    const componentValues = current[componentId] || {}

    this._$runtimeValues.setKey(componentId, {
      ...componentValues,
      [key]: value
    })
  }

  /**
   * Get runtime value for a component
   */
  getRuntimeValue(componentId: string, key: string): any {
    const current = this._$runtimeValues.get()
    return current[componentId]?.[key]
  }

  /**
   * Set runtime style for a component
   */
  setRuntimeStyle(componentId: string, styleKey: string, value: any): void {
    const current = this._$runtimeStyles.get()
    const componentStyles = current[componentId] || {}

    this._$runtimeStyles.setKey(componentId, {
      ...componentStyles,
      [styleKey]: value
    })
  }

  /**
   * Get runtime style for a component
   */
  getRuntimeStyle(componentId: string, styleKey: string): any {
    const current = this._$runtimeStyles.get()
    return current[componentId]?.[styleKey]
  }

  /**
   * Get debug information
   */
  getDebugInfo(): any {
    return {
      microAppId: this.microAppId,
      appUUID: this.appUUID,
      isLoaded: this._isLoaded,
      componentCount: this.getComponents().length,
      pageCount: this.getPages().length,
      variableScopeInfo: this.variableScopeManager.getDebugInfo(),
      runtimeValueCount: Object.keys(this._$runtimeValues.get()).length,
      runtimeStyleCount: Object.keys(this._$runtimeStyles.get()).length
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    // Notify other micro-apps before cleanup
    this.messageBus.send({
      from: this.microAppId,
      type: 'MICRO_APP_UNMOUNTING',
      payload: { appUUID: this.appUUID }
    })

    // Unsubscribe all store listeners
    this.subscriptions.forEach(unsub => {
      try {
        unsub()
      } catch (error) {
        console.error('Error unsubscribing:', error)
      }
    })
    this.subscriptions.clear()

    // Cleanup variable scope manager
    this.variableScopeManager.cleanup()

    // Unregister from shared registry
    const registry = SharedVariableRegistry.getInstance()
    registry.unregisterMicroApp(this.microAppId)

    // Clear stores
    this._$components.setKey(this.appUUID, [])
    this._$pages.setKey(this.appUUID, [])
    this._$context.setKey(this.appUUID, {})
    this._$runtimeValues.set({})
    this._$runtimeStyles.set({})

    this._isLoaded = false
  }
}
