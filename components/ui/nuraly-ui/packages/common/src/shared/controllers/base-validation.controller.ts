/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveControllerHost } from 'lit';
import { BaseComponentController, BaseHost } from './base.controller.js';

/**
 * Shared validation rule interface (matches src/shared/validation.types.ts)
 */
export interface SharedValidationRule {
  /** Validation function that returns true if valid */
  validator: (value: any) => boolean | Promise<boolean>;
  /** Error/warning message to display if validation fails */
  message: string;
  /** Validation level */
  level?: 'error' | 'warning';
  /** Whether this rule should block form submission */
  blocking?: boolean;
}

/**
 * Abstract base validation controller that provides shared validation
 * state management, form integration, and event dispatching.
 *
 * Used by input, textarea, select, and radio-group validation controllers
 * to avoid duplicating common validation patterns.
 *
 * @typeParam THost - The component host type
 */
export abstract class BaseValidationController<THost extends BaseHost & ReactiveControllerHost>
  extends BaseComponentController<THost> {

  protected _isValid = true;
  protected _validationMessage = '';
  protected _validationState: string = 'pristine';
  protected _rules: SharedValidationRule[] = [];

  /**
   * Whether the current value is valid
   */
  get isValid(): boolean {
    return this._isValid;
  }

  /**
   * Current validation message
   */
  get validationMessage(): string {
    return this._validationMessage;
  }

  /**
   * Current validation state (e.g., 'pristine', 'valid', 'invalid', 'warning', 'pending')
   */
  get validationState(): string {
    return this._validationState;
  }

  /**
   * Add a validation rule
   */
  addRule(rule: SharedValidationRule): void {
    this._rules.push(rule);
    this.requestUpdate();
  }

  /**
   * Remove validation rules matching the predicate
   */
  removeRule(predicate: (rule: SharedValidationRule) => boolean): void {
    this._rules = this._rules.filter(rule => !predicate(rule));
    this.requestUpdate();
  }

  /**
   * Clear all validation rules
   */
  clearRules(): void {
    this._rules = [];
    this.clearValidation();
  }

  /**
   * Clear validation state back to pristine
   */
  clearValidation(): void {
    this._isValid = true;
    this._validationMessage = '';
    this._validationState = 'pristine';
    this.requestUpdate();
    this.dispatchValidationEvent();
  }

  /**
   * HTML5 constraint validation API - check validity
   */
  checkValidity(): boolean {
    return this.validate() as boolean;
  }

  /**
   * HTML5 constraint validation API - report validity
   */
  reportValidity(): boolean {
    const isValid = this.checkValidity();
    if (!isValid) {
      this.dispatchValidationEvent();
    }
    return isValid;
  }

  /**
   * Dispatch a standardized 'nr-validation' event from the host
   */
  protected dispatchValidationEvent(): void {
    this.dispatchEvent(
      new CustomEvent('nr-validation', {
        detail: {
          isValid: this._isValid,
          validationMessage: this._validationMessage,
          validationState: this._validationState,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Component-specific validation logic.
   * Subclasses must implement this with their own validation.
   */
  abstract validate(): Promise<boolean> | boolean;
}
