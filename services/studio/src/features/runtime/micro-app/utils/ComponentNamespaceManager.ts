/**
 * Component Namespace Manager
 *
 * Prevents component name collisions between micro-apps by adding namespace prefixes.
 * Provides utilities for namespacing and resolving component names.
 */

import type { ComponentElement } from '../redux/store/component/component.interface'

export class ComponentNamespaceManager {
  private namespacePrefix: string
  private microAppId: string

  constructor(microAppId: string) {
    this.microAppId = microAppId
    this.namespacePrefix = `microapp_${microAppId}`
  }

  /**
   * Namespace a single component
   */
  namespaceComponent(component: ComponentElement): ComponentElement {
    return {
      ...component,
      // Keep original name for internal use, add namespaced name for external access
      name: `${this.namespacePrefix}__${component.name}`,
      originalName: component.name,
      // Keep UUID unchanged as it's already unique
      uuid: component.uuid,
      // Namespace children IDs if present
      childrenIds: component.childrenIds?.map(id => id) // UUIDs don't need namespacing
    }
  }

  /**
   * Namespace all components in a tree
   */
  namespaceTree(components: ComponentElement[]): ComponentElement[] {
    return components.map(c => this.namespaceComponent(c))
  }

  /**
   * Resolve namespaced name back to original
   */
  resolveNamespacedName(namespacedName: string): string {
    if (namespacedName.startsWith(`${this.namespacePrefix}__`)) {
      return namespacedName.replace(`${this.namespacePrefix}__`, '')
    }
    return namespacedName
  }

  /**
   * Check if a name is namespaced
   */
  isNamespaced(name: string): boolean {
    return name.startsWith(`${this.namespacePrefix}__`)
  }

  /**
   * Get namespace prefix
   */
  getPrefix(): string {
    return this.namespacePrefix
  }

  /**
   * Create namespaced name
   */
  createNamespacedName(originalName: string): string {
    return `${this.namespacePrefix}__${originalName}`
  }

  /**
   * Extract micro-app ID from namespaced name
   */
  static extractMicroAppId(namespacedName: string): string | null {
    const match = namespacedName.match(/^microapp_([^_]+)__/)
    return match ? match[1] : null
  }

  /**
   * Check if name belongs to this micro-app
   */
  belongsToThisMicroApp(name: string): boolean {
    const microAppId = ComponentNamespaceManager.extractMicroAppId(name)
    return microAppId === this.microAppId
  }
}
