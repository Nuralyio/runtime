/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { BaseInputController, InputHost } from './base.controller.js';
import { InputValidationResult } from '../input.types.js';

/**
 * Validation states for tracking validation lifecycle
 */
export enum ValidationState {
  Pristine = 'pristine',
  Pending = 'pending',
  Valid = 'valid',
  Invalid = 'invalid',
  Warning = 'warning'
}

/**
 * Enhanced input host interface for state management
 */
export interface ValidationStateHost extends InputHost {
  validationTrigger: 'change' | 'blur' | 'submit';
  validateOnChangeInput: boolean;
  validateOnBlurInput: boolean;
  validationDebounce?: number;
  allowWarnings: boolean;
}

/**
 * State controller interface for validation state management
 */
export interface StateController {
  validationState: ValidationState;
  isValidating: boolean;
  isValid: boolean;
  validationMessage: string;
  validationResult: InputValidationResult;
  
  setValidationState(state: ValidationState): void;
  setValidationResult(result: InputValidationResult): void;
  setValidating(validating: boolean): void;
  shouldValidateOnChange(): boolean;
  shouldValidateOnBlur(): boolean;
  clearDebounceTimer(): void;
  debounceValidation(callback: () => void): void;
}

/**
 * Validation state controller manages all state-related aspects of validation
 * including timing, debouncing, and state transitions.
 */
export class ValidationStateController extends BaseInputController implements StateController {
  private _validationState: ValidationState = ValidationState.Pristine;
  private _isValidating: boolean = false;
  private _isValid: boolean = true;
  private _validationMessage: string = '';
  private _validationResult: InputValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    hasError: false,
    hasWarning: false
  };
  private _debounceTimer: number | null = null;

  protected get stateHost(): ValidationStateHost {
    return this.host as unknown as ValidationStateHost;
  }

  /**
   * Get current validation state
   */
  get validationState(): ValidationState {
    return this._validationState;
  }

  /**
   * Check if currently validating
   */
  get isValidating(): boolean {
    return this._isValidating;
  }

  /**
   * Get validation validity status
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
   * Get validation result
   */
  get validationResult(): InputValidationResult {
    return this._validationResult;
  }

  /**
   * Set validation state and update component
   */
  setValidationState(state: ValidationState): void {
    if (this._validationState !== state) {
      const previousState = this._validationState;
      this._validationState = state;
      
      this.dispatchStateChangeEvent(previousState, state);
      this.requestUpdate();
    }
  }

  /**
   * Set validation result and update related state
   */
  setValidationResult(result: InputValidationResult): void {
    this._validationResult = result;
    this._isValid = result.isValid;
    this._validationMessage = result.hasError ? result.errorMessage || '' :
                              result.hasWarning ? result.warningMessage || '' : '';
    
    // Update validation state based on result
    let newState = ValidationState.Valid;
    if (result.hasError) {
      newState = ValidationState.Invalid;
    } else if (result.hasWarning && this.stateHost.allowWarnings) {
      newState = ValidationState.Warning;
    }
    
    this.setValidationState(newState);
  }

  /**
   * Set validating status
   */
  setValidating(validating: boolean): void {
    if (this._isValidating !== validating) {
      this._isValidating = validating;
      
      if (validating) {
        this.setValidationState(ValidationState.Pending);
      }
      
      this.requestUpdate();
    }
  }

  /**
   * Check if validation should occur on change events
   */
  shouldValidateOnChange(): boolean {
    return this.stateHost.validateOnChangeInput && 
           (this.stateHost.validationTrigger === 'change' || 
            this._validationState !== ValidationState.Pristine);
  }

  /**
   * Check if validation should occur on blur events
   */
  shouldValidateOnBlur(): boolean {
    return this.stateHost.validateOnBlurInput && 
           (this.stateHost.validationTrigger === 'blur' || 
            this.stateHost.validationTrigger === 'change');
  }

  /**
   * Clear any existing debounce timer
   */
  clearDebounceTimer(): void {
    if (this._debounceTimer !== null) {
      clearTimeout(this._debounceTimer);
      this._debounceTimer = null;
    }
  }

  /**
   * Debounce validation execution
   */
  debounceValidation(callback: () => void): void {
    this.clearDebounceTimer();
    
    const debounceTime = this.stateHost.validationDebounce;
    if (debounceTime && debounceTime > 0) {
      this._debounceTimer = window.setTimeout(() => {
        this._debounceTimer = null;
        callback();
      }, debounceTime);
    } else {
      // Execute immediately if no debounce time
      callback();
    }
  }

  /**
   * Reset validation state to pristine
   */
  resetValidationState(): void {
    this.clearDebounceTimer();
    this._validationState = ValidationState.Pristine;
    this._isValidating = false;
    this._isValid = true;
    this._validationMessage = '';
    this._validationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      hasError: false,
      hasWarning: false
    };
    this.requestUpdate();
  }

  /**
   * Mark as touched (no longer pristine)
   */
  markAsTouched(): void {
    if (this._validationState === ValidationState.Pristine) {
      this.setValidationState(ValidationState.Valid);
    }
  }

  /**
   * Check if validation state is pristine
   */
  isPristine(): boolean {
    return this._validationState === ValidationState.Pristine;
  }

  /**
   * Check if validation state has error
   */
  hasError(): boolean {
    return this._validationState === ValidationState.Invalid;
  }

  /**
   * Check if validation state has warning
   */
  hasWarning(): boolean {
    return this._validationState === ValidationState.Warning;
  }

  /**
   * Check if validation is pending
   */
  isPending(): boolean {
    return this._validationState === ValidationState.Pending;
  }

  /**
   * Get state summary for external use
   */
  getStateSummary(): {
    state: ValidationState;
    isValidating: boolean;
    isValid: boolean;
    message: string;
    result: InputValidationResult;
    isPristine: boolean;
    hasError: boolean;
    hasWarning: boolean;
    shouldValidateOnChange: boolean;
    shouldValidateOnBlur: boolean;
  } {
    return {
      state: this._validationState,
      isValidating: this._isValidating,
      isValid: this._isValid,
      message: this._validationMessage,
      result: this._validationResult,
      isPristine: this.isPristine(),
      hasError: this.hasError(),
      hasWarning: this.hasWarning(),
      shouldValidateOnChange: this.shouldValidateOnChange(),
      shouldValidateOnBlur: this.shouldValidateOnBlur()
    };
  }

  /**
   * Handle component lifecycle - cleanup timers
   */
  override hostDisconnected(): void {
    super.hostDisconnected();
    this.clearDebounceTimer();
  }

  /**
   * Dispatch state change events
   */
  private dispatchStateChangeEvent(previousState: ValidationState, newState: ValidationState): void {
    this.dispatchEvent(
      new CustomEvent('nr-validation-state-change', {
        detail: {
          previousState,
          newState,
          isValidating: this._isValidating,
          isValid: this._isValid,
          validationResult: this._validationResult
        },
        bubbles: true,
        composed: true
      })
    );
  }
}
