/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveControllerHost } from 'lit';
import { TextareaHost } from './base.controller.js';
import { BaseValidationController, SharedValidationRule } from '@nuralyui/common/controllers';
import {
    ValidationRule,
    TextareaValidationResult,
    TEXTAREA_STATE
} from '../textarea.types.js';

/**
 * Validation event detail interface
 */
export interface TextareaValidationEventDetail {
  isValid: boolean;
  validationMessage: string;
  errors: string[];
  warnings: string[];
  validationResult: TextareaValidationResult;
}

/**
 * Extended textarea host interface for validation
 */
export interface TextareaValidationHost extends TextareaHost {
  rules: ValidationRule[];
  validateOnChange: boolean;
  validateOnBlur: boolean;
  hasFeedback: boolean;
  state: string;
  validationMessage?: string;
}

/**
 * Validation controller manages all validation logic for textarea components
 * This controller handles:
 * - Rule-based validation (required, patterns, custom validators, etc.)
 * - Validation timing (change, blur, submit)
 * - Validation state management
 * - Error and warning messages
 * - Character count validation
 */
export class TextareaValidationController extends BaseValidationController<TextareaValidationHost & ReactiveControllerHost> {
  private _validationResult?: TextareaValidationResult;
  private _validationDebounceMs = 300;
  private _validationTimeout?: ReturnType<typeof setTimeout>;

  /**
   * Get the validation host with extended interface
   */
  get validationHost(): TextareaValidationHost & ReactiveControllerHost {
    return this._host;
  }

  /**
   * Get current validation result
   */
  get validationResult(): TextareaValidationResult | undefined {
    return this._validationResult;
  }

  /**
   * Set validation debounce delay
   */
  setValidationDebounce(ms: number): void {
    this._validationDebounceMs = ms;
  }

  /**
   * Validate the current value against all rules (base contract)
   */
  override async validate(): Promise<boolean> {
    const result = await this.validateTextarea();
    return result.isValid;
  }

  /**
   * Validate the current value against all rules (textarea-specific, returns full result)
   */
  async validateTextarea(value?: string): Promise<TextareaValidationResult> {
    const valueToValidate = value ?? this.validationHost.value;
    const rules = this.validationHost.rules || [];

    // Don't run validation if there are no rules
    if (rules.length === 0) {
      this._validationResult = undefined;
      return {
        isValid: true,
        messages: [],
        level: 'success',
        blocking: false
      };
    }

    const messages: string[] = [];
    let hasError = false;
    let hasWarning = false;
    let isBlocking = false;

    for (const rule of rules) {
      try {
        const isValid = await rule.validator(valueToValidate);
        if (!isValid) {
          messages.push(rule.message);
          if (rule.level === 'error' || !rule.level) {
            hasError = true;
            if (rule.blocking !== false) {
              isBlocking = true;
            }
          } else if (rule.level === 'warning') {
            hasWarning = true;
          }
        }
      } catch (error) {
        this.handleError(error as Error, 'validation');
        messages.push(`Validation error: ${error}`);
        hasError = true;
        isBlocking = true;
      }
    }

    const level = hasError ? 'error' : hasWarning ? 'warning' : 'success';

    this._validationResult = {
      isValid: !hasError && !hasWarning,
      messages,
      level,
      blocking: isBlocking
    };

    // Update shared state
    this._isValid = this._validationResult.isValid;
    this._validationMessage = messages.join(', ');
    this._validationState = level === 'success' ? 'valid' : level;

    // Update host state based on validation
    this.updateHostValidationState();

    // Dispatch validation event
    this.dispatchTextareaValidationEvent();

    return this._validationResult;
  }

  /**
   * Validate with debouncing
   */
  validateDebounced(value?: string): Promise<TextareaValidationResult> {
    return new Promise((resolve) => {
      if (this._validationTimeout) {
        clearTimeout(this._validationTimeout);
      }

      this._validationTimeout = setTimeout(async () => {
        const result = await this.validateTextarea(value);
        resolve(result);
      }, this._validationDebounceMs);
    });
  }

  /**
   * Validate if change validation is enabled
   */
  async validateOnChangeIfEnabled(value?: string): Promise<TextareaValidationResult | undefined> {
    if (this.validationHost.validateOnChange && (this.validationHost.rules || []).length > 0) {
      return await this.validateDebounced(value);
    }
    return undefined;
  }

  /**
   * Validate if blur validation is enabled
   */
  async validateOnBlurIfEnabled(value?: string): Promise<TextareaValidationResult | undefined> {
    if (this.validationHost.validateOnBlur && (this.validationHost.rules || []).length > 0) {
      return await this.validateTextarea(value);
    }
    return undefined;
  }

  /**
   * Clear validation state
   */
  override clearValidation(): void {
    this._validationResult = undefined;
    this._isValid = true;
    this._validationMessage = '';
    this._validationState = 'pristine';

    if (this._validationTimeout) {
      clearTimeout(this._validationTimeout);
      this._validationTimeout = undefined;
    }

    // Reset state to default if it was set by validation
    if (this.validationHost.state !== TEXTAREA_STATE.Default) {
      this.validationHost.state = TEXTAREA_STATE.Default;
      this.requestUpdate();
    }

    this.dispatchTextareaValidationEvent();
  }

  /**
   * Check if the current value is valid according to validation rules
   */
  isCurrentlyValid(): boolean {
    return this._validationResult?.isValid ?? true;
  }

  /**
   * Check if validation is blocking (prevents form submission)
   */
  isBlocking(): boolean {
    return this._validationResult?.blocking ?? false;
  }

  /**
   * Get validation messages
   */
  getValidationMessages(): string[] {
    return this._validationResult?.messages ?? [];
  }

  /**
   * Add a validation rule to the host
   */
  override addRule(rule: SharedValidationRule): void {
    const rules = this.validationHost.rules || [];
    rules.push(rule as ValidationRule);
    this.validationHost.rules = rules;
    this.requestUpdate();
  }

  /**
   * Remove a validation rule from the host
   */
  override removeRule(predicate: (rule: SharedValidationRule) => boolean): void {
    const rules = this.validationHost.rules || [];
    this.validationHost.rules = rules.filter(rule => !predicate(rule));
    this.requestUpdate();
  }

  /**
   * Remove all validation rules
   */
  override clearRules(): void {
    this.validationHost.rules = [];
    this.clearValidation();
  }

  /**
   * Create a required field validation rule
   */
  static createRequiredRule(message = 'This field is required'): ValidationRule {
    return {
      validator: (value: string) => value.trim().length > 0,
      message,
      level: 'error',
      blocking: true
    };
  }

  /**
   * Create a minimum length validation rule
   */
  static createMinLengthRule(minLength: number, message?: string): ValidationRule {
    return {
      validator: (value: string) => value.length >= minLength,
      message: message || `Minimum ${minLength} characters required`,
      level: 'error',
      blocking: true
    };
  }

  /**
   * Create a maximum length validation rule
   */
  static createMaxLengthRule(maxLength: number, message?: string): ValidationRule {
    return {
      validator: (value: string) => value.length <= maxLength,
      message: message || `Maximum ${maxLength} characters allowed`,
      level: 'error',
      blocking: true
    };
  }

  /**
   * Create a pattern validation rule
   */
  static createPatternRule(pattern: RegExp, message: string): ValidationRule {
    return {
      validator: (value: string) => pattern.test(value),
      message,
      level: 'error',
      blocking: true
    };
  }

  /**
   * Update host validation state based on validation result
   */
  private updateHostValidationState(): void {
    if (!this._validationResult) return;

    const { level } = this._validationResult;

    if (level === 'error') {
      this.validationHost.state = TEXTAREA_STATE.Error;
    } else if (level === 'warning') {
      this.validationHost.state = TEXTAREA_STATE.Warning;
    } else if (this.validationHost.rules.length > 0) {
      // Only set success state if we have validation rules
      this.validationHost.state = TEXTAREA_STATE.Success;
    }

    this.requestUpdate();
  }

  /**
   * Dispatch textarea-specific validation event (standardized to nr-validation)
   */
  private dispatchTextareaValidationEvent(): void {
    const detail: TextareaValidationEventDetail = {
      isValid: this._validationResult?.isValid ?? true,
      validationMessage: this._validationResult?.messages.join(', ') ?? '',
      errors: this._validationResult?.messages.filter(() => this._validationResult?.level === 'error') ?? [],
      warnings: this._validationResult?.messages.filter(() => this._validationResult?.level === 'warning') ?? [],
      validationResult: this._validationResult || {
        isValid: true,
        messages: [],
        level: 'success',
        blocking: false
      }
    };

    this.safeExecute(
      () => this.dispatchEvent(
        new CustomEvent('nr-validation', {
          detail,
          bubbles: true,
          composed: true
        })
      ),
      'dispatchValidationEvent'
    );
  }

  /**
   * Cleanup on disconnect
   */
  override hostDisconnected(): void {
    if (this._validationTimeout) {
      clearTimeout(this._validationTimeout);
      this._validationTimeout = undefined;
    }
  }
}
