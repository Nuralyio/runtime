/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement } from 'lit';

type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * Interface for components that support text selection operations
 */
export interface SelectionCapable {
  /**
   * Select all text in the input
   */
  selectAll(): void;

  /**
   * Select a range of text in the input
   * @param start - Start position
   * @param end - End position
   */
  selectRange(start: number, end: number): void;

  /**
   * Get the current cursor position
   * @returns The cursor position or null if not available
   */
  getCursorPosition(): number | null;

  /**
   * Set the cursor position
   * @param position - The position to set
   */
  setCursorPosition(position: number): void;

  /**
   * Get the currently selected text
   * @returns The selected text or empty string
   */
  getSelectedText(): string;
}

/**
 * Mixin that provides text selection capabilities to input components
 * 
 * @param superClass - The base class to extend
 * @returns Enhanced class with selection capabilities
 * 
 * @example
 * ```typescript
 * export class MyInput extends SelectionMixin(LitElement) {
 *   @query('input') input!: HTMLInputElement;
 *   
 *   handleDoubleClick() {
 *     this.selectAll();
 *   }
 * }
 * ```
 */
export const SelectionMixin = <T extends Constructor<LitElement>>(superClass: T) => {
  class SelectionMixinClass extends superClass implements SelectionCapable {
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
        throw new Error('SelectionMixin requires an input or textarea element');
      }
      return input;
    }

    selectAll(): void {
      const input = this.inputElement;
      if (input) {
        input.select();
      }
    }

    selectRange(start: number, end: number): void {
      const input = this.inputElement;
      if (input && input.setSelectionRange) {
        input.focus();
        input.setSelectionRange(start, end);
      }
    }

    getCursorPosition(): number | null {
      const input = this.inputElement;
      if (input && typeof input.selectionStart === 'number') {
        return input.selectionStart;
      }
      return null;
    }

    setCursorPosition(position: number): void {
      const input = this.inputElement;
      if (input && input.setSelectionRange) {
        input.focus();
        input.setSelectionRange(position, position);
      }
    }

    getSelectedText(): string {
      const input = this.inputElement;
      if (input && input.selectionStart !== null && input.selectionEnd !== null) {
        return input.value.substring(input.selectionStart, input.selectionEnd);
      }
      return '';
    }
  }

  // Cast return type to the superClass type passed in
  return SelectionMixinClass as Constructor<SelectionCapable> & T;
};
