/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement } from 'lit';

type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * Interface for components that support keyboard interaction
 */
export interface KeyboardCapable {
  /**
   * Whether the component is disabled
   */
  disabled: boolean;
  
  /**
   * Handle keyboard activation (Enter/Space)
   */
  handleKeyboardActivation(event: KeyboardEvent): void;
  
  /**
   * Handle keydown events with proper focus management
   */
  handleKeydown(event: KeyboardEvent): void;
}

/**
 * Mixin that provides keyboard interaction capabilities for button-like components
 * Handles Enter and Space key activation following ARIA best practices
 * 
 * @param superClass - The base class to extend
 * @returns Enhanced class with keyboard interaction capabilities
 * 
 * @example
 * ```typescript
 * export class MyButton extends KeyboardMixin(LitElement) {
 *   @property({ type: Boolean }) disabled = false;
 *   
 *   render() {
 *     return html`
 *       <button 
 *         @keydown="${this.handleKeydown}"
 *         tabindex="${this.disabled ? '-1' : '0'}"
 *       >
 *         <slot></slot>
 *       </button>
 *     `;
 *   }
 * }
 * ```
 */
export const KeyboardMixin = <T extends Constructor<LitElement>>(superClass: T) => {
  class KeyboardMixinClass extends superClass implements KeyboardCapable {
    
    declare disabled: boolean;
    
    /**
     * Handle keyboard activation (Enter/Space keys)
     * @param event - The keyboard event
     */
    handleKeyboardActivation(event: KeyboardEvent): void {
      if (this.disabled) return;
      
      // Check if EventHandlerMixin is available for proper key checking
      const isActivationKey = typeof (this as any).isActivationKey === 'function'
        ? (this as any).isActivationKey(event)
        : (event.key === 'Enter' || event.key === ' ');
      
      if (isActivationKey) {
        event.preventDefault();
        
        // Trigger click event for consistency
        this.click();
        
        // Dispatch custom keyboard activation event if EventHandling mixin is available
        if (typeof (this as any).dispatchCustomEvent === 'function') {
          (this as any).dispatchCustomEvent('keyboard-activation', {
            key: event.key,
            timestamp: Date.now(),
            target: this
          });
        }
      }
    }

    /**
     * Handle keydown events with proper disabled state checking
     * @param event - The keyboard event
     */
    handleKeydown(event: KeyboardEvent): void {
      if (this.disabled) {
        // Allow readonly navigation keys even when disabled
        const isNavigationKey = typeof (this as any).isReadonlyKeyAllowed === 'function'
          ? (this as any).isReadonlyKeyAllowed(event)
          : ['Tab', 'Shift', 'Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key);
        
        if (!isNavigationKey) {
          event.preventDefault();
          return;
        }
      }
      
      this.handleKeyboardActivation(event);
    }
  }

  return KeyboardMixinClass as Constructor<KeyboardCapable> & T;
};
