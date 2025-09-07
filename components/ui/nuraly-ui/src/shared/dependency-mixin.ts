/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement } from 'lit';

/**
 * Interface for components that need dependency validation
 */
export interface DependencyAware {
  requiredComponents: string[];
  validateDependencies(): void;
  isComponentAvailable(componentName: string): boolean;
}

type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * Mixin that adds dependency validation functionality to LitElement components
 * 
 * @param superClass - The base class to extend (typically LitElement)
 * @returns Enhanced class with dependency validation capabilities
 * 
 * @example
 * ```typescript
 * @customElement('my-component')
 * export class MyComponent extends DependencyValidationMixin(LitElement) {
 *   requiredComponents = ['hy-icon', 'hy-tooltip'];
 *   
 *   override connectedCallback() {
 *     super.connectedCallback();
 *     this.validateDependencies();
 *   }
 * }
 * ```
 */
export const DependencyValidationMixin = <T extends Constructor<LitElement>>(superClass: T) => {
  class DependencyValidationClass extends superClass implements DependencyAware {
    /**
     * Array of required component names that must be registered
     * This should be set by the implementing component
     */
    requiredComponents: string[] = [];

    /**
     * Validates that all required component dependencies are available
     * @throws {Error} When required components are not registered
     */
    validateDependencies(): void {
      for (const componentName of this.requiredComponents) {
        if (!this.isComponentAvailable(componentName)) {
          throw new Error(
            `Required component "${componentName}" is not registered. ` +
            `Please import and register the component before using ${this.tagName.toLowerCase()}. ` +
            `Example: import '@nuralyui/${componentName}';`
          );
        }
      }
    }

    /**
     * Validates dependencies with custom error handling
     * @param onError - Custom error handler function
     * @returns boolean indicating if all dependencies are available
     */
    validateDependenciesWithHandler(onError?: (componentName: string, error: Error) => void): boolean {
      let allAvailable = true;
      
      for (const componentName of this.requiredComponents) {
        if (!this.isComponentAvailable(componentName)) {
          allAvailable = false;
          const error = new Error(
            `Required component "${componentName}" is not registered. ` +
            `Please import and register the component before using ${this.tagName.toLowerCase()}.`
          );
          
          if (onError) {
            onError(componentName, error);
          } else {
            console.error(error.message);
          }
        }
      }
      
      return allAvailable;
    }

    /**
     * Checks if a specific component is available
     * @param componentName - The name of the component to check
     * @returns boolean indicating if component is registered
     */
    isComponentAvailable(componentName: string): boolean {
      return !!customElements.get(componentName);
    }

    /**
     * Gets a list of missing dependencies
     * @returns Array of component names that are not registered
     */
    getMissingDependencies(): string[] {
      return this.requiredComponents.filter(
        componentName => !this.isComponentAvailable(componentName)
      );
    }

    /**
     * Checks if all dependencies are available without throwing errors
     * @returns boolean indicating if all dependencies are available
     */
    areDependenciesAvailable(): boolean {
      return this.requiredComponents.every(
        componentName => this.isComponentAvailable(componentName)
      );
    }

    /**
     * Adds a required component to the dependency list
     * @param componentName - The component name to add
     */
    addRequiredComponent(componentName: string): void {
      if (!this.requiredComponents.includes(componentName)) {
        this.requiredComponents.push(componentName);
      }
    }

    /**
     * Removes a required component from the dependency list
     * @param componentName - The component name to remove
     */
    removeRequiredComponent(componentName: string): void {
      const index = this.requiredComponents.indexOf(componentName);
      if (index > -1) {
        this.requiredComponents.splice(index, 1);
      }
    }
  }

  return DependencyValidationClass as Constructor<DependencyAware> & T;
};
