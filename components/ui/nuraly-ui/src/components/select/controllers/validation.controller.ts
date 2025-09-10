import { ValidationController, ValidationState, SelectValidationEventDetail } from '../interfaces/index.js';
import { BaseSelectController } from './base.controller.js';
import { SelectSelectionController } from './selection.controller.js';

/**
 * Validation controller manages form validation logic and states
 */
export class SelectValidationController extends BaseSelectController implements ValidationController {
  private _isValid: boolean = true;
  private _validationMessage: string = '';
  private _validationState: ValidationState = ValidationState.Pristine;

  constructor(host: any, private selectionController: SelectSelectionController) {
    super(host);
  }

  /**
   * Get validation state
   */
  get isValid(): boolean {
    return this._isValid;
  }

  /**
   * Get validation message
   */
  get validationMessage(): string {
    return this._validationMessage;
  }

  /**
   * Get current validation state
   */
  get validationState(): ValidationState {
    return this._validationState;
  }

  /**
   * Validate the select component
   */
  validate(): boolean {
    try {
      this._validationState = ValidationState.Pending;
      
      const selectedOptions = this.selectionController.getSelectedOptions();
      const hasValue = selectedOptions.length > 0;
      
      // Required field validation
      if (this.host.required && !hasValue) {
        this.setValidationResult(false, 'This field is required', ValidationState.Invalid);
        return false;
      }

      // Custom validation logic can be added here
      
      this.setValidationResult(true, '', ValidationState.Valid);
      return true;
    } catch (error) {
      this.handleError(error as Error, 'validate');
      this.setValidationResult(false, 'Validation error occurred', ValidationState.Invalid);
      return false;
    }
  }

  /**
   * Reset validation state
   */
  reset(): void {
    try {
      this._isValid = true;
      this._validationMessage = '';
      this._validationState = ValidationState.Pristine;
      this.requestUpdate();
      
      this.dispatchValidationEvent();
    } catch (error) {
      this.handleError(error as Error, 'reset');
    }
  }

  /**
   * Get form data for form submission
   */
  getFormData(): { [key: string]: string | string[] } {
    try {
      const hostElement = this._host as any;
      const name = hostElement.name || hostElement.getAttribute('name') || 'select';
      const selectedOptions = this.selectionController.getSelectedOptions();
      
      if (this.host.multiple) {
        return { [name]: selectedOptions.map(option => option.value) };
      } else {
        return { [name]: selectedOptions[0]?.value || '' };
      }
    } catch (error) {
      this.handleError(error as Error, 'getFormData');
      return {};
    }
  }

  /**
   * Check validity (HTML5 constraint validation API)
   */
  checkValidity(): boolean {
    return this.validate();
  }

  /**
   * Report validity (HTML5 constraint validation API)
   */
  reportValidity(): boolean {
    const isValid = this.validate();
    
    if (!isValid) {
      // Focus the invalid element
      const hostElement = this._host as any;
      const focusableElement = hostElement.shadowRoot?.querySelector('.wrapper');
      if (focusableElement) {
        focusableElement.focus();
      }
    }
    
    return isValid;
  }

  /**
   * Set custom validity message
   */
  setCustomValidity(message: string): void {
    try {
      if (message) {
        this.setValidationResult(false, message, ValidationState.Invalid);
      } else {
        this.validate();
      }
    } catch (error) {
      this.handleError(error as Error, 'setCustomValidity');
    }
  }

  /**
   * Validate on value change
   */
  validateOnChange(): void {
    if (this._validationState !== ValidationState.Pristine) {
      this.validate();
    }
  }

  /**
   * Validate on blur
   */
  validateOnBlur(): void {
    if (this._validationState === ValidationState.Pristine) {
      this._validationState = ValidationState.Pending;
    }
    this.validate();
  }

  /**
   * Set validation result and dispatch event
   */
  private setValidationResult(isValid: boolean, message: string, state: ValidationState): void {
    const hasChanged = 
      this._isValid !== isValid || 
      this._validationMessage !== message || 
      this._validationState !== state;

    this._isValid = isValid;
    this._validationMessage = message;
    this._validationState = state;

    if (hasChanged) {
      this.requestUpdate();
      this.dispatchValidationEvent();
    }
  }

  /**
   * Dispatch validation event
   */
  private dispatchValidationEvent(): void {
    const detail: SelectValidationEventDetail = {
      isValid: this._isValid,
      validationMessage: this._validationMessage,
      validationState: this._validationState,
    };

    this.dispatchEvent(
      new CustomEvent('nr-validation', {
        detail,
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Host updated lifecycle - validate on selection change
   */
  override hostUpdated(): void {
    this.validateOnChange();
  }

  /**
   * Get validation CSS classes
   */
  getValidationClasses(): Record<string, boolean> {
    return {
      'valid': this._isValid && this._validationState === ValidationState.Valid,
      'invalid': !this._isValid && this._validationState === ValidationState.Invalid,
      'pending': this._validationState === ValidationState.Pending,
      'pristine': this._validationState === ValidationState.Pristine,
    };
  }

  /**
   * Get ARIA attributes for accessibility
   */
  getAriaAttributes(): Record<string, string> {
    const attributes: Record<string, string> = {};

    if (this.host.required) {
      attributes['aria-required'] = 'true';
    }

    if (!this._isValid) {
      attributes['aria-invalid'] = 'true';
      if (this._validationMessage) {
        attributes['aria-describedby'] = 'validation-message';
      }
    }

    return attributes;
  }
}
