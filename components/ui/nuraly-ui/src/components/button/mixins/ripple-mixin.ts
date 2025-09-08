/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement } from 'lit';

type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * Interface for components that support ripple effect
 */
export interface RippleCapable {
  /**
   * Whether ripple effect is enabled
   */
  ripple: boolean;
  
  /**
   * Whether the component is disabled (affects ripple)
   */
  disabled: boolean;
  
  /**
   * Create ripple effect at click position
   */
  createRipple(event: MouseEvent): void;
  
  /**
   * Handle click events with ripple effect
   */
  handleRippleClick(event: MouseEvent): void;
}

/**
 * Mixin that provides ripple effect functionality for button-like components
 * 
 * @param superClass - The base class to extend
 * @returns Enhanced class with ripple effect capabilities
 * 
 * @example
 * ```typescript
 * export class MyButton extends RippleMixin(LitElement) {
 *   @property({ type: Boolean }) ripple = true;
 *   @property({ type: Boolean }) disabled = false;
 *   
 *   render() {
 *     return html`
 *       <button @click="${this.handleRippleClick}">
 *         <slot></slot>
 *       </button>
 *     `;
 *   }
 * }
 * ```
 */
export const RippleMixin = <T extends Constructor<LitElement>>(superClass: T) => {
  class RippleMixinClass extends superClass implements RippleCapable {
    
    declare ripple: boolean;
    declare disabled: boolean;
    
    /**
     * Creates ripple effect on button click
     * @param event - The click event
     */
    createRipple(event: MouseEvent): void {
      if (!this.ripple || this.disabled) return;

      const button = event.currentTarget as HTMLElement;
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;

      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';

      // Remove any existing ripples
      const existingRipples = button.querySelectorAll('.ripple');
      existingRipples.forEach(r => r.remove());

      button.appendChild(ripple);

      // Remove ripple after animation
      setTimeout(() => {
        ripple.remove();
      }, 600);
    }

    /**
     * Handle click events with ripple effect and dispatch custom event
     * @param event - The click event
     */
    handleRippleClick(event: MouseEvent): void {
      this.createRipple(event);
      
      // Dispatch custom button click event if EventHandling mixin is available
      if (typeof (this as any).dispatchCustomEvent === 'function') {
        (this as any).dispatchCustomEvent('button-click', {
          disabled: this.disabled,
          timestamp: Date.now(),
          coordinates: {
            x: event.clientX,
            y: event.clientY
          }
        });
      }
    }
  }

  return RippleMixinClass as Constructor<RippleCapable> & T;
};
