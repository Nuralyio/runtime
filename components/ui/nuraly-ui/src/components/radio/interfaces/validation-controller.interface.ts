/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { RadioBaseController } from './base-controller.interface.js';

/**
 * Interface for controllers that handle form validation
 */
export interface ValidationController extends RadioBaseController {
  /**
   * Validate the current radio group state
   * @returns True if the radio group passes validation
   */
  validate(): boolean;

  /**
   * Get the current validation message
   * @returns The validation message or empty string if valid
   */
  get validationMessage(): string;

  /**
   * Check if the radio group is currently valid
   * @returns True if the radio group is valid
   */
  get isValid(): boolean;

  /**
   * Get form data for form submission
   * @returns Object with name-value pairs for form submission
   */
  getFormData(): { [key: string]: string };

  /**
   * Get FormData object for native form submission
   * @returns FormData object or null if no data to submit
   */
  getFormDataObject(): FormData | null;

  /**
   * Reset validation state and clear any validation messages
   */
  reset(): void;

  /**
   * Report validation state (HTML5 form validation API)
   * @returns True if valid, dispatches invalid event if not
   */
  reportValidity(): boolean;
}
