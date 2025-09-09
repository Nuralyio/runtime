/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement, PropertyValueMap } from 'lit';
import { property, state } from 'lit/decorators.js';
import { RadioButtonOption } from '../radio.type.js';

type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * Interface for components that support radio group functionality
 */
export interface RadioGroupCapable {
  options: RadioButtonOption[];
  selectedOption: string;
  value: string;
  isAllDisabled: boolean;
  handleSelectionChange(option: RadioButtonOption): void;
  getSelectedOption(): RadioButtonOption | undefined;
  isOptionSelected(option: RadioButtonOption): boolean;
  isOptionDisabled(option: RadioButtonOption): boolean;
}

/**
 * Mixin that provides radio group functionality for managing multiple radio options
 * 
 * @param superClass - The base class to extend
 * @returns Enhanced class with radio group capabilities
 * 
 * @example
 * ```typescript
 * export class RadioComponent extends RadioGroupMixin(LitElement) {
 *   connectedCallback() {
 *     super.connectedCallback();
 *     this.options = [
 *       { value: 'option1', label: 'Option 1' },
 *       { value: 'option2', label: 'Option 2' }
 *     ];
 *   }
 * }
 * ```
 */
export const RadioGroupMixin = <T extends Constructor<LitElement>>(superClass: T) => {
  class RadioGroupMixinClass extends superClass implements RadioGroupCapable {
    
    @property({ type: Array })
    options: RadioButtonOption[] = [];

    @property({ type: String, attribute: 'value' })
    value: string = '';

    @state()
    selectedOption: string = '';

    @state()
    isAllDisabled: boolean = false;

    override willUpdate(changedProperties: PropertyValueMap<any>): void {
      super.willUpdate(changedProperties);
      
      // Initialize or update selection when value changes
      if (changedProperties.has('value')) {
        const previousValue = changedProperties.get('value');
        if (this.value !== previousValue) {
          this.selectedOption = this.value;
        }
      }

      // Initialize selectedOption if not set and value exists
      if (!this.selectedOption && this.value) {
        this.selectedOption = this.value;
      }

      // Check if all options should be disabled based on current selection
      if (changedProperties.has('options') || changedProperties.has('value')) {
        this.updateDisabledState();
      }
    }

    /**
     * Update the disabled state based on options and current value
     */
    private updateDisabledState(): void {
      const selectedOptionConfig = this.options.find(option => option.value === this.value);
      this.isAllDisabled = Boolean(selectedOptionConfig?.disabled);
    }

    /**
     * Handle selection change for a radio option
     */
    handleSelectionChange(option: RadioButtonOption): void {
      if (this.isOptionDisabled(option)) {
        return;
      }

      const previousValue = this.selectedOption;
      
      // Update both the internal state and the value property
      // This ensures the UI re-renders properly
      this.selectedOption = option.value;
      this.value = option.value;

      // Force a re-render to update button classes
      this.requestUpdate();

      // Dispatch change event using event handler mixin
      this.dispatchChangeEvent(option, previousValue);
    }

    /**
     * Dispatch change event helper method
     */
    private dispatchChangeEvent(option: RadioButtonOption, previousValue: string): void {
      if ('dispatchInputEvent' in this && typeof (this as any).dispatchInputEvent === 'function') {
        (this as any).dispatchInputEvent('change', {
          value: (this as any).selectedOption,
          previousValue,
          selectedOption: option,
          target: this
        });
      } else {
        // Fallback to native event dispatch
        this.dispatchEvent(new CustomEvent('change', {
          detail: {
            value: (this as any).selectedOption,
            previousValue,
            selectedOption: option,
            target: this
          },
          bubbles: true,
          composed: true
        }));
      }
    }

    /**
     * Get the currently selected option object
     */
    getSelectedOption(): RadioButtonOption | undefined {
      return this.options.find(option => option.value === this.selectedOption);
    }

    /**
     * Check if an option is currently selected
     */
    isOptionSelected(option: RadioButtonOption): boolean {
      return option.value === this.selectedOption;
    }

    /**
     * Check if an option is disabled (individually or globally)
     */
    isOptionDisabled(option: RadioButtonOption): boolean {
      return Boolean(option.disabled) || this.isAllDisabled;
    }
  }

  return RadioGroupMixinClass as Constructor<RadioGroupCapable> & T;
};
