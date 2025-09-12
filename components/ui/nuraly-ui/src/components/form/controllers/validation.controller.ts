/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import {
  FormField,
  FormFieldCapable,
  FormValidationResult,
  FormValidationState,
  FORM_EVENTS
} from '../form.types.js';

/**
 * Controller that coordinates validation across all form fields
 * This does NOT perform validation - it coordinates existing component validations
 */
export class FormValidationController {
  private fields: Map<string, FormField> = new Map();
  private validationState: FormValidationState = FormValidationState.Pristine;
  private validationPromise: Promise<FormValidationResult> | null = null;

  constructor(private host: any) {}

  /**
   * Register a form field for validation coordination
   */
  registerField(element: HTMLElement & FormFieldCapable): void {
    const name = element.name || element.getAttribute('name') || `field-${Date.now()}`;
    
    const field: FormField = {
      element,
      name,
      value: element.value,
      isValid: element.checkValidity?.() ?? true,
      validationMessage: element.validationMessage || '',
      required: element.required ?? false,
      touched: false,
      dirty: false
    };

    this.fields.set(name, field);

    // Listen for field changes
    this.addFieldListeners(element, name);
  }

  /**
   * Unregister a form field
   */
  unregisterField(name: string): void {
    const field = this.fields.get(name);
    if (field) {
      this.removeFieldListeners(field.element);
      this.fields.delete(name);
    }
  }

  /**
   * Add event listeners to a form field
   */
  private addFieldListeners(element: HTMLElement, fieldName: string): void {
    element.addEventListener('nr-validation', (event) => this.handleFieldValidation(fieldName, event as CustomEvent));
  }

  /**
   * Remove event listeners from a form field
   */
  private removeFieldListeners(_element: HTMLElement): void {
    // Remove all event listeners (implementation depends on your needs)
    // You might want to store listener references for proper cleanup
  }


  /**
   * Handle field validation event
   */
  private handleFieldValidation(fieldName: string, event?: CustomEvent): void {
    const field = this.fields.get(fieldName);
    if (!field) return;

    if (event && event.detail) {
      // Use the detailed validation information from the nr-validation event
      field.isValid = event.detail.isValid || false;
      field.validationMessage = event.detail.validationMessage || '';
    } else {
      // Fallback to basic HTML validation
      field.isValid = field.element.checkValidity?.() ?? true;
      field.validationMessage = field.element.validationMessage || '';
    }

    // Update form validation state based on all fields
    this.updateFormValidationState();
  }

  /**
   * Update form validation state based on current field states
   */
  private updateFormValidationState(): void {
    const invalidFields = this.getInvalidFields();
    const isFormValid = invalidFields.length === 0;
    
    this.validationState = isFormValid ? FormValidationState.Valid : FormValidationState.Invalid;
    
    const result: FormValidationResult = {
      isValid: isFormValid,
      invalidFields,
      validationErrors: this.buildValidationErrors(),
      summary: isFormValid ? 'Form is valid' : `${invalidFields.length} field(s) have errors`
    };
    
    this.dispatchValidationEvent(result);
  }

  /**
   * Build validation errors object from current field states
   */
  private buildValidationErrors(): Record<string, string> {
    const errors: Record<string, string> = {};
    for (const [name, field] of this.fields) {
      if (!field.isValid && field.validationMessage) {
        errors[name] = field.validationMessage;
      }
    }
    return errors;
  }

 

  /**
   * Validate all form fields (coordinates existing validations)
   */
  validateForm(): Promise<FormValidationResult> {
    // Return existing promise if validation is in progress
    if (this.validationPromise) {
      return this.validationPromise;
    }

    this.validationState = FormValidationState.Pending;

    this.validationPromise = this.performValidation();
    
    return this.validationPromise;
  }

  /**
   * Perform the actual validation coordination
   */
  private async performValidation(): Promise<FormValidationResult> {
    const invalidFields: FormField[] = [];
    const validationErrors: Record<string, string> = {};

    // Check each field's validation state
    for (const [name, field] of this.fields) {
      // Trigger validation on the field component itself
      const isValid = field.element.checkValidity?.() ?? true;
      
      field.isValid = isValid;
      field.validationMessage = field.element.validationMessage || '';

      if (!isValid) {
        invalidFields.push(field);
        validationErrors[name] = field.validationMessage;
      }
    }

    const isFormValid = invalidFields.length === 0;
    this.validationState = isFormValid ? FormValidationState.Valid : FormValidationState.Invalid;

    const result: FormValidationResult = {
      isValid: isFormValid,
      invalidFields,
      validationErrors,
      summary: isFormValid ? 'Form is valid' : `${invalidFields.length} field(s) have errors`
    };

    this.dispatchValidationEvent(result);

    this.validationPromise = null;

    return result;
  }

  /**
   * Get current validation state
   */
  getValidationState(): FormValidationState {
    return this.validationState;
  }

  /**
   * Get all registered fields
   */
  getFields(): FormField[] {
    return Array.from(this.fields.values());
  }

  /**
   * Get invalid fields
   */
  getInvalidFields(): FormField[] {
    return Array.from(this.fields.values()).filter(field => !field.isValid);
  }

  /**
   * Check if form is valid
   */
  isValid(): boolean {
    return this.validationState === FormValidationState.Valid && 
           Array.from(this.fields.values()).every(field => field.isValid);
  }

  /**
   * Focus first invalid field
   */
  focusFirstInvalidField(): boolean {
    const invalidField = Array.from(this.fields.values()).find(field => !field.isValid);
    if (invalidField && typeof invalidField.element.focus === 'function') {
      invalidField.element.focus();
      return true;
    }
    return false;
  }

  /**
   * Reset all fields
   */
  reset(): void {
    for (const field of this.fields.values()) {
      if (typeof field.element.reset === 'function') {
        field.element.reset();
      }
      field.touched = false;
      field.dirty = false;
      field.isValid = true;
      field.validationMessage = '';
    }
    
    this.validationState = FormValidationState.Pristine;
    this.dispatchResetEvent();
  }

  

  /**
   * Dispatch validation event
   */
  private dispatchValidationEvent(result: FormValidationResult): void {
    (this.host as any).dispatchCustomEvent?.(FORM_EVENTS.VALIDATION_CHANGED, {
      validationResult: result
    });
  }

  /**
   * Dispatch reset event
   */
  private dispatchResetEvent(): void {
    (this.host as any).dispatchCustomEvent?.(FORM_EVENTS.RESET, {});
  }
}
