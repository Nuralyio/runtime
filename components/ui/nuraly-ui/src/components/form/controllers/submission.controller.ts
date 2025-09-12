/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { 
  FormSubmissionData, 
  FormSubmissionState, 
  FormFieldCapable,
  FORM_EVENTS 
} from '../form.types.js';

/**
 * Controller that handles form submission logic
 */
export class FormSubmissionController {
  private submissionState: FormSubmissionState = FormSubmissionState.Idle;
  private lastSubmissionData: FormSubmissionData | null = null;

  constructor(private host: any) {}

  /**
   * Get current submission state
   */
  getSubmissionState(): FormSubmissionState {
    return this.submissionState;
  }

  /**
   * Check if form is currently submitting
   */
  isSubmitting(): boolean {
    return this.submissionState === FormSubmissionState.Submitting;
  }

  /**
   * Collect form data from all registered fields
   */
  collectFormData(): FormSubmissionData {
    const formData = new FormData();
    const jsonData: Record<string, any> = {};
    const fields: Record<string, any> = {};

    // Get all form field elements
    const formFields = this.getFormFields();

    formFields.forEach(element => {
      const name = element.name || element.getAttribute('name');
      if (!name) return;

      const value = element.value;
      
      // Add to FormData
      if (value !== null && value !== undefined) {
        formData.append(name, String(value));
      }

      // Add to JSON data
      jsonData[name] = value;
      fields[name] = {
        element,
        value,
        name,
        type: element.tagName.toLowerCase(),
        required: element.required || false,
        disabled: element.disabled || false
      };
    });

    return {
      formData,
      jsonData,
      fields
    };
  }

  /**
   * Submit form with validation
   */
  async submitForm(customData?: Record<string, any>): Promise<FormSubmissionData> {
    if (this.isSubmitting()) {
      throw new Error('Form is already submitting');
    }

    try {
      this.setSubmissionState(FormSubmissionState.Submitting);

      // Validate form first
      const validationController = (this.host as any).validationController;
      if (validationController) {
        const validationResult = await validationController.validateForm();
        
        if (!validationResult.isValid) {
          // Focus first invalid field
          validationController.focusFirstInvalidField();
          
          // Dispatch submit attempt event
          this.dispatchSubmitAttemptEvent(validationResult);
          
          throw new Error(`Form validation failed: ${validationResult.summary}`);
        }
      }

      // Collect form data
      const submissionData = this.collectFormData();
      
      // Merge custom data if provided
      if (customData) {
        Object.assign(submissionData.jsonData, customData);
        Object.entries(customData).forEach(([key, value]) => {
          submissionData.formData.append(key, String(value));
        });
      }

      this.lastSubmissionData = submissionData;

      // Dispatch submit success event
      this.dispatchSubmitSuccessEvent(submissionData);
      
      this.setSubmissionState(FormSubmissionState.Success);
      
      return submissionData;

    } catch (error) {
      this.setSubmissionState(FormSubmissionState.Error);
      
      // Dispatch submit error event
      this.dispatchSubmitErrorEvent(error as Error);
      
      throw error;
    }
  }

  /**
   * Reset submission state
   */
  resetSubmission(): void {
    this.submissionState = FormSubmissionState.Idle;
    this.lastSubmissionData = null;
  }

  /**
   * Get last submission data
   */
  getLastSubmissionData(): FormSubmissionData | null {
    return this.lastSubmissionData;
  }

  /**
   * Get all form field elements from the host
   */
  private getFormFields(): (HTMLElement & FormFieldCapable)[] {
    const host = this.host;
    const fields: (HTMLElement & FormFieldCapable)[] = [];

    // Query for all potential form field elements
    const selectors = [
      'nr-input',
      'nr-select', 
      'nr-radio',
      'nr-checkbox',
      'nr-textarea',
      'nr-timepicker',
      'nr-datepicker',
      'input',
      'select',
      'textarea'
    ];

    // Search in light DOM
    selectors.forEach(selector => {
      const elements = host.querySelectorAll(selector);
      elements.forEach((element: HTMLElement & FormFieldCapable) => {
        if (element.name || element.getAttribute('name')) {
          fields.push(element);
        }
      });
    });

    // Search in slotted content
    const slots = host.shadowRoot?.querySelectorAll('slot') || [];
    slots.forEach((slot: HTMLSlotElement) => {
      const assignedElements = slot.assignedElements({ flatten: true });
      assignedElements.forEach(element => {
        selectors.forEach(selector => {
          if (element.matches && element.matches(selector)) {
            const fieldElement = element as HTMLElement & FormFieldCapable;
            if (fieldElement.name || fieldElement.getAttribute('name')) {
              fields.push(fieldElement);
            }
          }
          
          // Also search within the element
          const nestedFields = element.querySelectorAll(selector);
          nestedFields.forEach((nested) => {
            const fieldElement = nested as HTMLElement & FormFieldCapable;
            if (fieldElement.name || fieldElement.getAttribute('name')) {
              fields.push(fieldElement);
            }
          });
        });
      });
    });

    return fields;
  }

  /**
   * Set submission state and update host
   */
  private setSubmissionState(state: FormSubmissionState): void {
    this.submissionState = state;
    (this.host as any).requestUpdate?.();
  }

  /**
   * Dispatch submit attempt event
   */
  private dispatchSubmitAttemptEvent(validationResult: any): void {
    (this.host as any).dispatchCustomEvent?.(FORM_EVENTS.SUBMIT_ATTEMPT, {
      validationResult
    });
  }

  /**
   * Dispatch submit success event
   */
  private dispatchSubmitSuccessEvent(data: FormSubmissionData): void {
    (this.host as any).dispatchCustomEvent?.(FORM_EVENTS.SUBMIT_SUCCESS, {
      formData: data
    });
  }

  /**
   * Dispatch submit error event
   */
  private dispatchSubmitErrorEvent(error: Error): void {
    (this.host as any).dispatchCustomEvent?.(FORM_EVENTS.SUBMIT_ERROR, {
      error
    });
  }
}
