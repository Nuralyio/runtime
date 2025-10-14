/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ValidatableComponent, FormFieldInfo } from '@nuralyui/common/mixins';

/**
 * Form validation states that can be applied to the form and its children
 */
export enum FormValidationState {
  Pristine = 'pristine',    // Form has not been interacted with
  Pending = 'pending',      // Validation is in progress
  Valid = 'valid',          // All form fields are valid
  Invalid = 'invalid',      // One or more form fields are invalid
  Submitted = 'submitted'   // Form has been submitted
}

/**
 * Form submission states
 */
export enum FormSubmissionState {
  Idle = 'idle',
  Submitting = 'submitting',
  Success = 'success',
  Error = 'error'
}

/**
 * Form configuration options
 */
export interface FormConfig {
  /** Enable real-time validation */
  validateOnChange?: boolean;
  /** Validate fields on blur */
  validateOnBlur?: boolean;
  /** Show validation errors immediately */
  showErrorsImmediately?: boolean;
  /** Prevent submission if invalid */
  preventInvalidSubmission?: boolean;
  /** Reset form after successful submission */
  resetOnSuccess?: boolean;
  /** Custom validation debounce delay (ms) */
  validationDelay?: number;
}

/**
 * Form field information
 */
export interface FormField extends FormFieldInfo {
  // FormField now extends the shared FormFieldInfo interface
}

/**
 * Form validation result
 */
export interface FormValidationResult {
  isValid: boolean;
  invalidFields: FormField[];
  validationErrors: Record<string, string>;
  summary: string;
}

/**
 * Form submission data
 */
export interface FormSubmissionData {
  formData: FormData;
  jsonData: Record<string, any>;
  fields: Record<string, any>;
}

/**
 * Interface that form field components must implement
 * @deprecated Use ValidatableComponent from shared/validation.types.js instead
 */
export interface FormFieldCapable extends ValidatableComponent {
  /** @deprecated This interface is replaced by ValidatableComponent */
}

/**
 * Form event details
 */
export interface FormEventDetail {
  formData?: FormSubmissionData;
  validationResult?: FormValidationResult;
  field?: FormField;
  error?: Error;
}

/**
 * Custom form events
 */
export const FORM_EVENTS = {
  VALIDATION_CHANGED: 'nr-form-validation-changed',
  FIELD_CHANGED: 'nr-form-field-changed',
  SUBMIT_ATTEMPT: 'nr-form-submit-attempt',
  SUBMIT_SUCCESS: 'nr-form-submit-success',
  SUBMIT_ERROR: 'nr-form-submit-error',
  RESET: 'nr-form-reset',
} as const;

export type FormEventType = typeof FORM_EVENTS[keyof typeof FORM_EVENTS];
