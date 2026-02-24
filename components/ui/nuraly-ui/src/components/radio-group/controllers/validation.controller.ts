/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveControllerHost } from 'lit';
import { BaseValidationController } from '@nuralyui/common/controllers';
import { ValidationController } from '../interfaces/validation-controller.interface.js';

/**
 * Host interface for radio group validation
 */
interface RadioGroupValidationHost extends ReactiveControllerHost {
  required: boolean;
  value: string;
  name: string;
  requestUpdate(): void;
  dispatchEvent(event: Event): boolean;
}

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
export class RadioValidationController extends BaseValidationController<RadioGroupValidationHost>
  implements ValidationController {

  /**
   * Validates the current radio group state
   * Checks required field constraints and custom validation rules
   *
   * @returns True if validation passes, false otherwise
   * @fires invalid - When validation fails (for form integration)
   */
  validate(): boolean {
    const isRequired = this.host.required;
    const selectedValue = this.host.value;

    if (isRequired && !selectedValue) {
      this._isValid = false;
      this._validationMessage = 'Please select an option';
      this.requestUpdate();
      return false;
    }

    this._isValid = true;
    this._validationMessage = '';
    this.requestUpdate();
    return true;
  }

  /**
   * Set a custom validation message
   */
  setCustomValidity(message: string): void {
    this._isValid = !message;
    this._validationMessage = message;
    this.requestUpdate();
  }

  /**
   * Get form data for form submission
   */
  getFormData(): { [key: string]: string } {
    const name = this.host.name;
    const value = this.host.value;
    return name ? { [name]: value } : {};
  }

  /**
   * Report validation state (similar to native form elements)
   */
  override reportValidity(): boolean {
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

      (this._host as unknown as EventTarget).dispatchEvent(invalidEvent);
    }

    return isValid;
  }

  /**
   * Form reset handler
   */
  reset(): void {
    this.clearValidation();
  }

  /**
   * Get FormData object for native form submission
   */
  getFormDataObject(): FormData | null {
    const name = this.host.name;
    const value = this.host.value;

    if (!name || !value) return null;

    const formData = new FormData();
    formData.append(name, value);
    return formData;
  }

  /**
   * Validate on value change
   */
  validateOnChange(): void {
    // Auto-validate when value changes if validation was previously invalid
    if (!this._isValid) {
      this.validate();
    }
  }
}
