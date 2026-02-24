import { ReactiveControllerHost } from 'lit';
import { ValidationController, ValidationState, SelectValidationEventDetail, SelectHost } from '../interfaces/index.js';
import { BaseValidationController } from '@nuralyui/common/controllers';
import { SelectSelectionController } from './selection.controller.js';

/**
 * Validation controller manages form validation logic and states
 */
export class SelectValidationController extends BaseValidationController<SelectHost & ReactiveControllerHost>
  implements ValidationController {

  private selectionController: SelectSelectionController;

  constructor(host: any, selectionController: SelectSelectionController) {
    super(host);
    this.selectionController = selectionController;
  }

  /**
   * Override validation state getter to return the enum type
   */
  override get validationState(): ValidationState {
    return this._validationState as ValidationState;
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
   * Report validity (HTML5 constraint validation API)
   */
  override reportValidity(): boolean {
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
   * Override to include select-specific detail
   */
  protected override dispatchValidationEvent(): void {
    const detail: SelectValidationEventDetail = {
      isValid: this._isValid,
      validationMessage: this._validationMessage,
      validationState: this._validationState as ValidationState,
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
