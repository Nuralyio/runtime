/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

/**
 * Validation event detail structure that validation controllers emit
 */
export interface ValidationEventDetail {
  /** Whether the field is currently valid */
  isValid: boolean;
  /** Current validation message */
  validationMessage: string;
  /** Current validation state */
  validationState: string;
  /** Array of error messages */
  errors: string[];
  /** Array of warning messages */
  warnings: string[];
  /** Complete validation result object */
  validationResult: any; // Generic to allow different validation result types
}

/**
 * Validation status information returned by getValidationStatus()
 */
export interface ValidationStatus {
  /** Whether the field is currently valid */
  isValid: boolean;
  /** Whether validation is currently in progress */
  isValidating?: boolean;
  /** Array of error messages */
  errors: string[];
  /** Array of warning messages */
  warnings: string[];
}

/**
 * Generic validation rule interface
 */
export interface ValidationRule {
  /** Validation function */
  validator: (value: any) => boolean | Promise<boolean>;
  /** Error/warning message */
  message: string;
  /** Validation level */
  level?: 'error' | 'warning';
  /** Whether this rule blocks form submission */
  blocking?: boolean;
}

/**
 * Interface for components that support validation through events and API
 * This is the shared pattern used by input, textarea, and other form field components
 */
export interface ValidatableComponent {
  /** Field name for form submission */
  name?: string;
  /** Field value */
  value: any;
  /** Required field indicator */
  required?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Readonly state */
  readonly?: boolean;
  /** Current validation message */
  validationMessage?: string;

  // Validation API Methods
  /** Add a validation rule */
  addRule?(rule: ValidationRule): void;
  /** Remove validation rules matching predicate */
  removeRule?(predicate: (rule: ValidationRule) => boolean): void;
  /** Clear all validation rules */
  clearRules?(): void;
  /** Get current validation status */
  getValidationStatus(): ValidationStatus;
  /** Trigger validation manually */
  validate(): Promise<boolean> | boolean;
  /** Clear validation state */
  clearValidation?(): void;

  // Event-based Integration
  /** Dispatches 'nr-validation' events with ValidationEventDetail */
  addEventListener(type: 'nr-validation', listener: (event: CustomEvent<ValidationEventDetail>) => void): void;
  /** Removes 'nr-validation' event listeners */
  removeEventListener(type: 'nr-validation', listener: (event: CustomEvent<ValidationEventDetail>) => void): void;
}

/**
 * Form field information for form integration
 */
export interface FormFieldInfo {
  element: HTMLElement & ValidatableComponent;
  name: string;
  value: any;
  isValid: boolean;
  validationMessage: string;
  required: boolean;
  touched: boolean;
  dirty: boolean;
}

/**
 * Constants for validation events
 */
export const VALIDATION_EVENTS = {
  VALIDATION: 'nr-validation',
  FIELD_FOCUS: 'nr-focus',
  FIELD_BLUR: 'nr-blur',
  FIELD_CHANGE: 'nr-change',
  FIELD_INPUT: 'nr-input',
  FIELD_CLEAR: 'nr-clear'
} as const;

export type ValidationEventType = typeof VALIDATION_EVENTS[keyof typeof VALIDATION_EVENTS];