/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement } from 'lit';

type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * Options for checkbox focus behavior
 */
export interface CheckboxFocusOptions {
  preventScroll?: boolean;
}

/**
 * Interface for components that support checkbox focus operations
 */
export interface CheckboxFocusCapable {
  /**
   * Focus the checkbox input element
   * @param options - Focus options
   */
  focus(options?: CheckboxFocusOptions): void;

  /**
   * Blur the checkbox input element
   */
  blur(): void;

  /**
   * Check if the checkbox is currently focused
   * @returns True if focused
   */
  isFocused(): boolean;

  /**
   * Get the native checkbox input element
   * @returns The checkbox input element or null
   */
  get nativeElement(): HTMLInputElement | null;
}

/**
 * Mixin that provides focus management capabilities to checkbox components
 * 
 * @param superClass - The base class to extend
 * @returns Enhanced class with checkbox focus capabilities
 * 
 * @example
 * ```typescript
 * export class MyCheckbox extends CheckboxFocusMixin(LitElement) {
 *   handleClick() {
 *     this.focus();
 *   }
 * }
 * ```
 */
export const CheckboxFocusMixin = <T extends Constructor<LitElement>>(superClass: T) => {
  class CheckboxFocusMixinClass extends superClass implements CheckboxFocusCapable {
    /**
     * Get the checkbox input element
     */
    protected get checkboxElement(): HTMLInputElement {
      const input = this.shadowRoot?.querySelector('input[type="checkbox"]') as HTMLInputElement;
      if (!input) {
        throw new Error('CheckboxFocusMixin requires a checkbox input element');
      }
      return input;
    }

    override focus(options: CheckboxFocusOptions = {}): void {
      const input = this.checkboxElement;
      if (input) {
        input.focus({ preventScroll: options.preventScroll });
      }
    }

    override blur(): void {
      const input = this.checkboxElement;
      if (input) {
        input.blur();
      }
    }

    isFocused(): boolean {
      const input = this.checkboxElement;
      return input ? document.activeElement === input : false;
    }

    get nativeElement(): HTMLInputElement | null {
      return this.shadowRoot?.querySelector('input[type="checkbox"]') || null;
    }
  }

  return CheckboxFocusMixinClass as Constructor<CheckboxFocusCapable> & T;
};
