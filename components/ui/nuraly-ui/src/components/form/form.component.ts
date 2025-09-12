/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styles } from './form.style.js';
import { 
  FormConfig, 
  FormValidationState, 
  FormSubmissionState,
  FormEventDetail,
  FORM_EVENTS
} from './form.types.js';
import { NuralyUIBaseMixin } from '../../shared/base-mixin.js';
import { FormValidationController } from './controllers/validation.controller.js';
import { FormSubmissionController } from './controllers/submission.controller.js';

/**
 * Comprehensive form component with Ant Design-like API
 * 
 * Key Features:
 * - Coordinates validation across all form fields (does NOT validate itself)
 * - Handles form submission with built-in validation checks
 * - Provides form state management and events
 * - Integrates with existing component validation controllers
 * - Supports both programmatic and user-driven interactions
 * - Ant Design-like API for field manipulation and validation
 * 
 * @example Basic Usage
 * ```html
 * <nr-form @nr-form-submit-success="${handleSuccess}" validate-on-change>
 *   <nr-input name="username" required></nr-input>
 *   <nr-input name="email" type="email" required></nr-input>
 *   <nr-button type="submit">Submit</nr-button>
 * </nr-form>
 * ```
 * 
 * @example Programmatic Usage (Ant Design style)
 * ```typescript
 * const form = document.querySelector('nr-form');
 * 
 * // Set field values
 * form.setFieldsValue({ username: 'john', email: 'john@example.com' });
 * 
 * // Get field values
 * const values = form.getFieldsValue();
 * 
 * // Validate and submit
 * try {
 *   const values = await form.finish();
 *   console.log('Form submitted:', values);
 * } catch (errors) {
 *   console.log('Validation failed:', errors);
 * }
 * 
 * // Reset specific fields
 * form.resetFields(['username']);
 * ```
 * 
 * @fires nr-form-validation-changed - Validation state changes
 * @fires nr-form-field-changed - Individual field changes
 * @fires nr-form-submit-attempt - Form submission attempted
 * @fires nr-form-submit-success - Form submitted successfully
 * @fires nr-form-submit-error - Form submission failed
 * @fires nr-form-reset - Form was reset
 * 
 * @slot default - Form content (inputs, buttons, etc.)
 */
@customElement('nr-form')
export class NrFormElement extends NuralyUIBaseMixin(LitElement) {
  static override styles = styles;

  /** Form configuration */
  @property({ type: Object })
  config: FormConfig = {
    validateOnChange: false,  // Default to false - only validate on blur
    validateOnBlur: true,
    showErrorsImmediately: false,
    preventInvalidSubmission: true,
    resetOnSuccess: false,
    validationDelay: 300
  };

  /** Enable real-time validation on field changes */
  @property({ type: Boolean, attribute: 'validate-on-change' })
  validateOnChange = false;  // Default to false

  /** Enable validation on field blur */
  @property({ type: Boolean, attribute: 'validate-on-blur' })
  validateOnBlur = true;

  /** Prevent form submission if validation fails */
  @property({ type: Boolean, attribute: 'prevent-invalid-submission' })
  preventInvalidSubmission = true;

  /** Reset form after successful submission */
  @property({ type: Boolean, attribute: 'reset-on-success' })
  resetOnSuccess = false;

  /** Form action URL for native submission */
  @property({ type: String })
  action?: string;

  /** Form method for native submission */
  @property({ type: String })
  method: 'GET' | 'POST' = 'POST';

  /** Form encoding type */
  @property({ type: String, attribute: 'enctype' })
  enctype: string = 'multipart/form-data';

  /** Target for form submission */
  @property({ type: String })
  target?: string;

  /** Disable the entire form */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /** Form validation state */
  @state()
  private _validationState: FormValidationState = FormValidationState.Pristine;

  /** Form submission state */
  @state()
  private _submissionState: FormSubmissionState = FormSubmissionState.Idle;

  /** Validation controller */
  private validationController = new FormValidationController(this);

  /** Submission controller */
  private submissionController = new FormSubmissionController(this);

  /** Get current validation state */
  get validationState(): FormValidationState {
    return this._validationState;
  }

  /** Get current submission state */
  get submissionState(): FormSubmissionState {
    return this._submissionState;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setupFormObserver();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.cleanupFormObserver();
  }

  override willUpdate(changedProperties: PropertyValues): void {
    super.willUpdate(changedProperties);
    
    // Update config when properties change
    if (changedProperties.has('validateOnChange') || 
        changedProperties.has('validateOnBlur') ||
        changedProperties.has('preventInvalidSubmission') ||
        changedProperties.has('resetOnSuccess')) {
      this.config = {
        ...this.config,
        validateOnChange: this.validateOnChange,
        validateOnBlur: this.validateOnBlur,
        preventInvalidSubmission: this.preventInvalidSubmission,
        resetOnSuccess: this.resetOnSuccess
      };
    }
  }

  override firstUpdated(): void {
    this.registerExistingFields();
    this.setupFormEvents();
  }

  /**
   * Setup mutation observer to detect new form fields
   */
  private setupFormObserver(): void {
    // Implementation for observing DOM changes to register new fields
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.registerFieldsInElement(node as Element);
          }
        });
      });
    });

    observer.observe(this, { 
      childList: true, 
      subtree: true 
    });

    (this as any)._formObserver = observer;
  }

  /**
   * Cleanup mutation observer
   */
  private cleanupFormObserver(): void {
    const observer = (this as any)._formObserver;
    if (observer) {
      observer.disconnect();
    }
  }

  /**
   * Register existing form fields
   */
  private registerExistingFields(): void {
    this.registerFieldsInElement(this);
  }

  /**
   * Register form fields in an element
   */
  private registerFieldsInElement(element: Element): void {
    const selectors = [
      'nr-input', 'nr-select', 'nr-radio', 'nr-checkbox', 
      'nr-textarea', 'nr-timepicker', 'nr-datepicker'
    ];

    selectors.forEach(selector => {
      const fields = element.querySelectorAll(selector);
      fields.forEach(field => {
        if (field.getAttribute('name')) {
          this.validationController.registerField(field as any);
        }
      });
    });
  }

  /**
   * Setup form events
   */
  private setupFormEvents(): void {
    // Listen for form submission
    this.addEventListener('submit', this.handleFormSubmit);
    
    // Listen for form reset
    this.addEventListener('reset', this.handleFormReset);

    // Listen for validation events
    this.addEventListener(FORM_EVENTS.VALIDATION_CHANGED, this.handleValidationChanged as EventListener);
  }

  /**
   * Handle form submission
   */
  private async handleFormSubmit(event: Event): Promise<void> {
    event.preventDefault();

    if (this.disabled) {
      return;
    }

    try {
      const submissionData = await this.submissionController.submitForm();
      
      if (this.resetOnSuccess) {
        this.reset();
      }

      // If action is specified, perform native submission
      if (this.action) {
        this.performNativeSubmission(submissionData.formData);
      }

    } catch (error) {
      console.error('Form submission failed:', error);
      // Error events are already dispatched by submission controller
    }
  }

  /**
   * Handle form reset
   */
  private handleFormReset(event: Event): void {
    event.preventDefault();
    this.reset();
  }

  /**
   * Handle validation state changes
   */
  private handleValidationChanged = (event: Event): void => {
    const customEvent = event as CustomEvent<FormEventDetail>;
    const result = customEvent.detail.validationResult;
    if (result) {
      this._validationState = result.isValid ? 
        FormValidationState.Valid : 
        FormValidationState.Invalid;
    }
  };

  /**
   * Perform native form submission
   */
  private performNativeSubmission(formData: FormData): void {
    const form = document.createElement('form');
    form.action = this.action!;
    form.method = this.method;
    form.enctype = this.enctype;
    if (this.target) form.target = this.target;

    // Add form data as hidden inputs
    for (const [name, value] of formData.entries()) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value as string;
      form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  }

  /**
   * Validate the form
   */
  async validate(): Promise<boolean> {
    const result = await this.validationController.validateForm();
    return result.isValid;
  }

  /**
   * Submit the form programmatically
   */
  async submit(customData?: Record<string, any>): Promise<void> {
    await this.submissionController.submitForm(customData);
  }

  /**
   * Reset the form
   */
  reset(): void {
    this.validationController.reset();
    this.submissionController.resetSubmission();
    this._validationState = FormValidationState.Pristine;
    this._submissionState = FormSubmissionState.Idle;
  }

  /**
   * Check if form is valid
   */
  get isValid(): boolean {
    return this.validationController.isValid();
  }

  /**
   * Check if form is submitting
   */
  get isSubmitting(): boolean {
    return this.submissionController.isSubmitting();
  }

  /**
   * Get form data
   */
  getFormData() {
    return this.submissionController.collectFormData();
  }

  /**
   * Get invalid fields
   */
  getInvalidFields() {
    return this.validationController.getInvalidFields();
  }

  // ============================================
  // ANT DESIGN FORM API METHODS
  // ============================================

  /**
   * Get values of all fields (Ant Design style)
   * @returns Object containing all field values
   */
  getFieldsValue(nameList?: string[]): Record<string, any> {
    const formData = this.getFormData();
    const values = formData.jsonData;
    
    if (nameList && nameList.length > 0) {
      const filteredValues: Record<string, any> = {};
      nameList.forEach(name => {
        if (name in values) {
          filteredValues[name] = values[name];
        }
      });
      return filteredValues;
    }
    
    return values;
  }

  /**
   * Get value of specific field (Ant Design style)
   * @param name Field name
   * @returns Field value
   */
  getFieldValue(name: string): any {
    const values = this.getFieldsValue();
    return values[name];
  }

  /**
   * Set values of fields (Ant Design style)
   * @param values Object containing field values to set
   */
  setFieldsValue(values: Record<string, any>): void {
    Object.entries(values).forEach(([name, value]) => {
      this.setFieldValue(name, value);
    });
  }

  /**
   * Set value of specific field (Ant Design style)
   * @param name Field name
   * @param value Field value
   */
  setFieldValue(name: string, value: any): void {
    const fields = this.validationController.getFields();
    const field = fields.find(f => f.name === name);
    
    if (field && field.element) {
      field.element.value = value;
      field.value = value;
      // Trigger change event to update validation
      field.element.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  /**
   * Validate specific fields (Ant Design style)
   * @param nameList Array of field names to validate, if empty validates all
   * @returns Promise with validation result
   */
  async validateFields(nameList?: string[]): Promise<Record<string, any>> {
    const result = await this.validationController.validateForm();
    
    if (nameList && nameList.length > 0) {
      // Filter validation errors for specific fields
      const filteredErrors: Record<string, string> = {};
      nameList.forEach(name => {
        if (result.validationErrors[name]) {
          filteredErrors[name] = result.validationErrors[name];
        }
      });
      
      if (Object.keys(filteredErrors).length > 0) {
        throw new Error(JSON.stringify(filteredErrors));
      }
      
      return this.getFieldsValue(nameList);
    }
    
    if (!result.isValid) {
      throw new Error(JSON.stringify(result.validationErrors));
    }
    
    return this.getFieldsValue();
  }

  /**
   * Reset specific fields (Ant Design style)
   * @param nameList Array of field names to reset, if empty resets all
   */
  resetFields(nameList?: string[]): void {
    if (!nameList || nameList.length === 0) {
      this.reset();
      return;
    }
    
    const fields = this.validationController.getFields();
    nameList.forEach(name => {
      const field = fields.find(f => f.name === name);
      if (field && field.element) {
        // Reset value
        field.element.value = '';
        field.value = '';
        field.touched = false;
        field.dirty = false;
        field.isValid = true;
        field.validationMessage = '';
        
        // Trigger change event
        field.element.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  }

  /**
   * Get field error (Ant Design style)
   * @param name Field name
   * @returns Field error message or null
   */
  getFieldError(name: string): string | null {
    const fields = this.validationController.getFields();
    const field = fields.find(f => f.name === name);
    return field && !field.isValid ? field.validationMessage : null;
  }

  /**
   * Get all field errors (Ant Design style)
   * @param nameList Array of field names, if empty returns all
   * @returns Object containing field errors
   */
  getFieldsError(nameList?: string[]): Record<string, string | null> {
    const fields = this.validationController.getFields();
    const errors: Record<string, string | null> = {};
    
    const targetFields = nameList 
      ? fields.filter(f => nameList.includes(f.name))
      : fields;
    
    targetFields.forEach(field => {
      errors[field.name] = field.isValid ? null : field.validationMessage;
    });
    
    return errors;
  }

  /**
   * Check if field has been touched (Ant Design style)
   * @param name Field name
   * @returns Whether field has been touched
   */
  isFieldTouched(name: string): boolean {
    const fields = this.validationController.getFields();
    const field = fields.find(f => f.name === name);
    return field ? field.touched : false;
  }

  /**
   * Check if any fields have been touched (Ant Design style)
   * @param nameList Array of field names, if empty checks all
   * @returns Whether any of the specified fields have been touched
   */
  isFieldsTouched(nameList?: string[]): boolean {
    const fields = this.validationController.getFields();
    const targetFields = nameList 
      ? fields.filter(f => nameList.includes(f.name))
      : fields;
    
    return targetFields.some(field => field.touched);
  }

  /**
   * Check if field value has been modified (Ant Design style)
   * @param name Field name
   * @returns Whether field has been modified
   */
  isFieldDirty(name: string): boolean {
    const fields = this.validationController.getFields();
    const field = fields.find(f => f.name === name);
    return field ? field.dirty : false;
  }

  /**
   * Check if any fields have been modified (Ant Design style)
   * @param nameList Array of field names, if empty checks all
   * @returns Whether any of the specified fields have been modified
   */
  isFieldsDirty(nameList?: string[]): boolean {
    const fields = this.validationController.getFields();
    const targetFields = nameList 
      ? fields.filter(f => nameList.includes(f.name))
      : fields;
    
    return targetFields.some(field => field.dirty);
  }

  /**
   * Get field instance (Ant Design style)
   * @param name Field name
   * @returns Field element or null
   */
  getFieldInstance(name: string): HTMLElement | null {
    const fields = this.validationController.getFields();
    const field = fields.find(f => f.name === name);
    return field ? field.element : null;
  }

  /**
   * Scroll to first error field (Ant Design style)
   * @returns Whether scrolled to a field
   */
  scrollToField(name?: string): boolean {
    if (name) {
      const fieldElement = this.getFieldInstance(name);
      if (fieldElement) {
        fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (typeof fieldElement.focus === 'function') {
          fieldElement.focus();
        }
        return true;
      }
      return false;
    }
    
    // Scroll to first invalid field
    return this.validationController.focusFirstInvalidField();
  }

  /**
   * Submit form and validate (Ant Design style)
   * @returns Promise with form values
   */
  async finish(): Promise<Record<string, any>> {
    try {
      const values = await this.validateFields();
      await this.submit();
      return values;
    } catch (error) {
      this.scrollToField();
      throw error;
    }
  }

  /**
   * Get field names that have validation errors
   * @returns Array of field names with errors
   */
  getFieldsWithErrors(): string[] {
    const fields = this.validationController.getFields();
    return fields
      .filter(field => !field.isValid)
      .map(field => field.name);
  }

  /**
   * Check if form has any validation errors
   * @returns Whether form has errors
   */
  hasErrors(): boolean {
    return this.getFieldsWithErrors().length > 0;
  }

  /**
   * Get summary of form state
   * @returns Object with form state information
   */
  getFormState(): {
    isValid: boolean;
    isSubmitting: boolean;
    hasErrors: boolean;
    errorCount: number;
    fieldCount: number;
    touchedFields: string[];
    dirtyFields: string[];
    invalidFields: string[];
  } {
    const fields = this.validationController.getFields();
    
    return {
      isValid: this.isValid,
      isSubmitting: this.isSubmitting,
      hasErrors: this.hasErrors(),
      errorCount: this.getFieldsWithErrors().length,
      fieldCount: fields.length,
      touchedFields: fields.filter(f => f.touched).map(f => f.name),
      dirtyFields: fields.filter(f => f.dirty).map(f => f.name),
      invalidFields: this.getFieldsWithErrors()
    };
  }

  /**
   * Set form loading state (useful for async operations)
   * @param loading Whether form is in loading state
   */
  setLoading(loading: boolean): void {
    this.disabled = loading;
    this.requestUpdate();
  }

  override render() {
    return html`
      <form 
        action="${this.action || ''}"
        method="${this.method.toLowerCase() as 'get' | 'post'}"
        enctype="${this.enctype as 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain'}"
        target="${this.target || ''}"
        class="form-wrapper"
        data-disabled="${this.disabled}"
        novalidate
      >
        <slot></slot>
      </form>
    `;
  }
}
