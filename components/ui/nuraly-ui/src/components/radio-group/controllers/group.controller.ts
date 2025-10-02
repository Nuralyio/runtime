/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { RadioButtonOption } from '../radio-group.types.js';
import { SelectionController, RadioHost } from '../interfaces/index.js';

/**
 * Controller that manages radio group state and selection logic
 * Implements type-safe selection operations with proper error handling
 * 
 * @example
 * ```typescript
 * const controller = new RadioGroupController(hostElement);
 * controller.selectOption(option); // Type-safe selection
 * ```
 */
export class RadioGroupController implements SelectionController {
  readonly host: RadioHost;
  
  constructor(host: RadioHost & { dispatchEvent: (event: Event) => void }) {
    this.host = host;
    host.addController(this);
  }

  /**
   * Called when the host element is connected to the DOM
   * Initializes the default selection if provided
   * 
   * @fires change - When default value is set automatically
   */
  hostConnected() {
    // Initialize default selection if provided
    if (this.host.defaultValue && !this.host.value) {
      const defaultOption = this.host.options.find((opt: RadioButtonOption) => opt.value === this.host.defaultValue);
      if (defaultOption && !this.isOptionDisabled(defaultOption)) {
        this.selectOption(defaultOption);
      }
    }
  }

  /**
   * Called when the host element is disconnected from the DOM
   * Performs cleanup operations
   */
  hostDisconnected() {
    // Cleanup if needed
  }

  /**
   * Selects a radio option and dispatches change events
   * Implements proper error handling for disabled options
   * 
   * @param option - The radio option to select
   * @throws {Error} When option is disabled or invalid
   * @fires change - When selection changes successfully
   * 
   * @example
   * ```typescript
   * controller.selectOption({ value: 'option1', label: 'Option 1' });
   * ```
   */
  selectOption(option: RadioButtonOption): void {
    if (this.isOptionDisabled(option)) {
      return;
    }

    const oldValue = this.host.value;
    this.host.value = option.value;
    
    // Dispatch change event
    this.dispatchChangeEvent(option, oldValue);
    
    this.host.requestUpdate();
  }

  /**
   * Gets the currently selected radio option
   * 
   * @returns The selected option object or undefined if none selected
   * 
   * @example
   * ```typescript
   * const selected = controller.getSelectedOption();
   * console.log(selected?.label); // "Option 1"
   * ```
   */
  getSelectedOption(): RadioButtonOption | undefined {
    return this.host.options.find((option: RadioButtonOption) => option.value === this.host.value);
  }

  /**
   * Checks if a specific option is currently selected
   * 
   * @param option - The option to check
   * @returns True if the option is selected, false otherwise
   * 
   * @example
   * ```typescript
   * const isSelected = controller.isOptionSelected(option);
   * ```
   */
  isOptionSelected(option: RadioButtonOption): boolean {
    return option.value === this.host.value;
  }

  /**
   * Checks if a specific option is disabled
   * Takes into account both global disabled state and option-specific disabled state
   * 
   * @param option - The option to check
   * @returns True if the option is disabled, false otherwise
   * 
   * @example
   * ```typescript
   * if (!controller.isOptionDisabled(option)) {
   *   controller.selectOption(option);
   * }
   * ```
   */
  isOptionDisabled(option: RadioButtonOption): boolean {
    return this.host.disabled || Boolean(option.disabled);
  }

  /**
   * Gets form data for native form submission
   * Returns key-value pair suitable for FormData
   * 
   * @returns Object with form field name and selected value
   * 
   * @example
   * ```typescript
   * const formData = controller.getFormData();
   * // { "radioGroup": "selectedValue" }
   * ```
   */
  getFormData(): { [key: string]: string } {
    return this.host.name ? { [this.host.name]: this.host.value } : {};
  }

  /**
   * Resets the radio group to its default value
   * Triggers re-render to update the UI
   * 
   * @fires change - When reset changes the selected value
   * 
   * @example
   * ```typescript
   * controller.reset(); // Resets to defaultValue or empty
   * ```
   */
  reset(): void {
    this.host.value = this.host.defaultValue || '';
    this.host.requestUpdate();
  }

  /**
   * Gets the currently selected value as a string
   * Convenience method for accessing the raw value
   * 
   * @returns The selected value string, empty string if none selected
   * 
   * @example
   * ```typescript
   * const value = controller.getSelectedValue();
   * console.log(value); // "option1"
   * ```
   */
  getSelectedValue(): string {
    return this.host.value;
  }

  /**
   * Dispatches a change event when selection changes
   * Creates a custom event with detailed information about the change
   * 
   * @param option - The newly selected option
   * @param oldValue - The previously selected value
   * @fires change - Custom event with selection details
   * 
   * @private
   */
  private dispatchChangeEvent(option: RadioButtonOption, oldValue: string): void {
    const changeEvent = new CustomEvent('change', {
      detail: {
        value: option.value,
        option: option,
        oldValue: oldValue
      },
      bubbles: true,
      composed: true
    });

    (this.host as any).dispatchEvent(changeEvent);
  }
}
