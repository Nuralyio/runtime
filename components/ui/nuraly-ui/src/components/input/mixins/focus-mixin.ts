/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement } from 'lit';

type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * Options for focus behavior
 */
export interface FocusOptions {
  preventScroll?: boolean;
  selectText?: boolean;
}

/**
 * Options for blur behavior
 */
export interface BlurOptions {
  relatedTarget?: Element | null;
}

/**
 * Interface for components that support focus operations
 */
export interface FocusCapable {
  /**
   * Focus the input element
   * @param options - Focus options
   */
  focus(options?: FocusOptions): void;

  /**
   * Blur the input element
   * @param options - Blur options
   */
  blur(options?: BlurOptions): void;

  /**
   * Check if the input is currently focused
   * @returns True if focused
   */
  isFocused(): boolean;
}

/**
 * Mixin that provides focus management capabilities to input components
 * 
 * @param superClass - The base class to extend
 * @returns Enhanced class with focus capabilities
 * 
 * @example
 * ```typescript
 * export class MyInput extends FocusMixin(LitElement) {
 *   @query('input') input!: HTMLInputElement;
 *   
 *   handleClick() {
 *     this.focus({ selectText: true });
 *   }
 * }
 * ```
 */
export const FocusMixin = <T extends Constructor<LitElement>>(superClass: T) => {
  class FocusMixinClass extends superClass implements FocusCapable {
    /**
     * Get the input element - must be implemented by the component
     */
    protected get inputElement(): HTMLInputElement | HTMLTextAreaElement {
      // Try to get from shadowRoot first (for custom elements)
      const shadowInput = this.shadowRoot?.querySelector('#input, input, textarea') as HTMLInputElement | HTMLTextAreaElement;
      if (shadowInput) {
        return shadowInput;
      }
      
      // Fallback to light DOM
      const input = this.querySelector('input, textarea') as HTMLInputElement | HTMLTextAreaElement;
      if (!input) {
        throw new Error('FocusMixin requires an input or textarea element');
      }
      return input;
    }

    override focus(options: FocusOptions = {}): void {
      const input = this.inputElement;
      if (input) {
        input.focus({ preventScroll: options.preventScroll });
        
        if (options.selectText) {
          input.select();
        }
      }
    }

    override blur(): void {
      const input = this.inputElement;
      if (input) {
        input.blur();
      }
    }

    isFocused(): boolean {
      const input = this.inputElement;
      return input ? document.activeElement === input : false;
    }
  }

  // Cast return type to the superClass type passed in
  return FocusMixinClass as Constructor<FocusCapable> & T;
};
