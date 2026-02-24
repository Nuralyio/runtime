/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

/**
 * Standard interface that all form-compatible components should implement
 * This ensures consistent validation API across all form field components
 */
export interface FormFieldValidation {
  /** Component name for form submission */
  name?: string;
  
  /** Current field value */
  value: any;
  
  /** Required field indicator */
  required?: boolean;
  
  /** Disabled state */
  disabled?: boolean;
  
  /** Readonly state */
  readonly?: boolean;
  
  /** Current validation message */
  validationMessage?: string;
  
  /**
   * Validate the field and return true if valid
   */
  validate?(): boolean;
  
  /**
   * Check if the field satisfies HTML5 constraints
   */
  checkValidity?(): boolean;
  
  /**
   * Report validation state (shows validation UI)
   */
  reportValidity?(): boolean;
  
  /**
   * Set custom validation message
   */
  setCustomValidity?(message: string): void;
  
  /**
   * Reset field to initial state
   */
  reset?(): void;
  
  /**
   * Focus the field
   */
  focus?(): void;
}

/**
 * Enhanced validation interface for components with advanced validation features
 */
export interface AdvancedFormFieldValidation extends FormFieldValidation {
  /** Validation state details */
  isValid?: boolean;
  isTouched?: boolean;
  isDirty?: boolean;
  
  /** Validation rules */
  validationRules?: ValidationRule[];
  
  /** Custom validators */
  customValidators?: CustomValidator[];
  
  /**
   * Get detailed validation result
   */
  getValidationResult?(): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
  
  /**
   * Add custom validation rule
   */
  addValidationRule?(rule: ValidationRule): void;
  
  /**
   * Remove validation rule
   */
  removeValidationRule?(ruleId: string): void;
}

/**
 * Validation rule definition
 */
export interface ValidationRule {
  id: string;
  message: string;
  validator: (value: any) => boolean;
  severity?: 'error' | 'warning';
}

/**
 * Custom validator function
 */
export interface CustomValidator {
  id: string;
  validate: (value: any, element: any) => {
    isValid: boolean;
    message: string;
  };
}

/**
 * Validation event details
 */
export interface ValidationEventDetail {
  isValid: boolean;
  value: any;
  message: string;
  errors: string[];
  warnings?: string[];
  field?: string;
  timestamp: number;
}

/**
 * Form field registration info
 */
export interface FormFieldRegistration {
  element: HTMLElement & FormFieldValidation;
  name: string;
  type: string;
  initialValue: any;
  registrationTime: number;
}
