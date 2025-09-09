/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement } from 'lit';
import { RadioButtonOption } from '../radio.type.js';

type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * Interface for components that support keyboard navigation in radio groups
 */
export interface RadioKeyboardCapable {
  handleKeyDown(event: KeyboardEvent): void;
  navigateToNextOption(): void;
  navigateToPreviousOption(): void;
  selectCurrentOption(): void;
  getCurrentOptionIndex(): number;
}

/**
 * Mixin that provides keyboard navigation functionality for radio groups
 * Implements standard radio group keyboard behavior (arrow keys, space/enter)
 * 
 * @param superClass - The base class to extend
 * @returns Enhanced class with keyboard navigation capabilities
 * 
 * @example
 * ```typescript
 * export class RadioComponent extends RadioKeyboardMixin(LitElement) {
 *   connectedCallback() {
 *     super.connectedCallback();
 *     this.addEventListener('keydown', this.handleKeyDown.bind(this));
 *   }
 * }
 * ```
 */
export const RadioKeyboardMixin = <T extends Constructor<LitElement>>(superClass: T) => {
  class RadioKeyboardMixinClass extends superClass implements RadioKeyboardCapable {

    /**
     * Handle keyboard events for radio group navigation
     */
    handleKeyDown(event: KeyboardEvent): void {
      // Handle activation keys (Space, Enter)
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        this.selectCurrentOption();
        return;
      }

      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          event.preventDefault();
          this.navigateToNextOption();
          break;
        
        case 'ArrowUp':
        case 'ArrowLeft':
          event.preventDefault();
          this.navigateToPreviousOption();
          break;
        
        case 'Home':
          event.preventDefault();
          if ('setFocusedOption' in this) {
            (this as any).setFocusedOption(0);
          }
          break;
        
        case 'End':
          event.preventDefault();
          const options = this.getAvailableOptions();
          if ('setFocusedOption' in this) {
            (this as any).setFocusedOption(options.length - 1);
          }
          break;
      }
    }

    /**
     * Navigate to the next available option
     */
    navigateToNextOption(): void {
      const options = this.getAvailableOptions();
      if (options.length === 0) return;

      let nextIndex = this.getCurrentOptionIndex() + 1;
      if (nextIndex >= options.length) {
        nextIndex = 0; // Wrap to beginning
      }

      if ('setFocusedOption' in this) {
        (this as any).setFocusedOption(nextIndex);
      }
    }

    /**
     * Navigate to the previous available option
     */
    navigateToPreviousOption(): void {
      const options = this.getAvailableOptions();
      if (options.length === 0) return;

      let previousIndex = this.getCurrentOptionIndex() - 1;
      if (previousIndex < 0) {
        previousIndex = options.length - 1; // Wrap to end
      }

      if ('setFocusedOption' in this) {
        (this as any).setFocusedOption(previousIndex);
      }
    }

    /**
     * Select the currently focused option
     */
    selectCurrentOption(): void {
      const options = this.getAvailableOptions();
      const currentIndex = this.getCurrentOptionIndex();
      
      if (currentIndex >= 0 && currentIndex < options.length) {
        const option = options[currentIndex];
        if ('handleSelectionChange' in this) {
          (this as any).handleSelectionChange(option);
        }
      }
    }

    /**
     * Get the current focused option index - delegates to focus mixin
     */
    getCurrentOptionIndex(): number {
      if ('focusedOptionIndex' in this) {
        return (this as any).focusedOptionIndex;
      }
      return -1;
    }

    /**
     * Get only the available (non-disabled) options
     */
    private getAvailableOptions(): RadioButtonOption[] {
      if (!('options' in this)) return [];
      
      const options = (this as any).options as RadioButtonOption[];
      return options.filter(option => !this.isOptionDisabledForKeyboard(option));
    }

    /**
     * Check if option is disabled for keyboard navigation
     */
    private isOptionDisabledForKeyboard(option: RadioButtonOption): boolean {
      if ('isOptionDisabled' in this) {
        return (this as any).isOptionDisabled(option);
      }
      return Boolean(option.disabled);
    }
  }

  return RadioKeyboardMixinClass as Constructor<RadioKeyboardCapable> & T;
};
