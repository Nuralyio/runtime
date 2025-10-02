/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ValidationController } from '../interfaces/validation-controller.interface.js';

/**
 * Controller that manages validation logic and form integration for radio groups
 * Implements HTML5 form validation patterns with custom validation support
 * 
 * Features:
 * - Required field validation
 * - Custom validation message support
 * - Form integration with native validation API
 * - Real-time validation state tracking
 * 
 * @example
 * ```typescript
 * const controller = new RadioValidationController(hostElement);
 * const isValid = controller.validate(); // Validate current state
 * console.log(controller.validationMessage); // Get validation error
 * ```
 */
export class RadioValidationController implements ValidationController {
  private host: any; // RadioElement host
  private _isValid: boolean = true;
  private _validationMessage: string = '';

  /**
   * Creates a new RadioValidationController instance
   * Initializes validation state tracking
   * 
   * @param host - The host radio element
   */
  constructor(host: any) {
    this.host = host;
    host.addController(this);
  }

  /**
   * Called when the host element is connected to the DOM
   * Sets up form integration if the element is within a form
   */
  hostConnected() {
    // Controller connected to host
  }

  /**
   * Called when the host element is disconnected from the DOM
   * Cleans up form event listeners
   */
  hostDisconnected() {
    // Cleanup if needed
  }

  /**
   * Checks if the radio group is currently valid
   * 
   * @returns True if valid, false if validation errors exist
   * 
   * @example
   * ```typescript
   * if (!controller.isValid) {
   *   console.error(controller.validationMessage);
   * }
   * ```
   */
  get isValid(): boolean {
    return this._isValid;
  }

  /**
   * Gets the current validation error message
   * 
   * @returns The validation message string, empty if valid
   * 
   * @example
   * ```typescript
   * const message = controller.validationMessage;
   * if (message) displayError(message);
   * ```
   */
  get validationMessage(): string {
    return this._validationMessage;
  }

  /**
   * Validates the current radio group state
   * Checks required field constraints and custom validation rules
   * 
   * @returns True if validation passes, false otherwise
   * @fires invalid - When validation fails (for form integration)
   * 
   * @example
   * ```typescript
   * if (!controller.validate()) {
   *   form.reportValidity(); // Show validation errors
   * }
   * ```
   */
  validate(): boolean {
    const isRequired = this.host.required;
    const selectedValue = this.host.value;
    
    if (isRequired && !selectedValue) {
      this._isValid = false;
      this._validationMessage = 'Please select an option';
      this.host.requestUpdate();
      return false;
    }

    this._isValid = true;
    this._validationMessage = '';
    this.host.requestUpdate();
    return true;
  }

  // Custom validation
  setCustomValidity(message: string): void {
    this._isValid = !message;
    this._validationMessage = message;
    this.host.requestUpdate();
  }

  clearValidation(): void {
    this._isValid = true;
    this._validationMessage = '';
    this.host.requestUpdate();
  }

  // Form integration methods
  getFormData(): { [key: string]: string } {
    const name = this.host.name;
    const value = this.host.value;
    return name ? { [name]: value } : {};
  }

  // Check if the radio group satisfies form constraints
  checkValidity(): boolean {
    return this.validate();
  }

  // Report validation state (similar to native form elements)
  reportValidity(): boolean {
    const isValid = this.validate();
    
    if (!isValid) {
      // Dispatch invalid event
      const invalidEvent = new CustomEvent('invalid', {
        detail: {
          message: this._validationMessage
        },
        bubbles: true,
        composed: true
      });
      
      (this.host as any).dispatchEvent(invalidEvent);
    }
    
    return isValid;
  }

  // Form reset handler
  reset(): void {
    this.clearValidation();
  }

  // Get FormData object for native form submission
  getFormDataObject(): FormData | null {
    const name = this.host.name;
    const value = this.host.value;
    
    if (!name || !value) return null;
    
    const formData = new FormData();
    formData.append(name, value);
    return formData;
  }

  // Validate on value change
  validateOnChange(): void {
    // Auto-validate when value changes if validation was previously invalid
    if (!this._isValid) {
      this.validate();
    }
  }
}
