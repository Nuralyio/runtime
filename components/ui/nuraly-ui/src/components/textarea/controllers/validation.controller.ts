/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { BaseTextareaController, TextareaHost } from './base.controller.js';
import { ReactiveControllerHost } from 'lit';
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
export class TextareaValidationController extends BaseTextareaController {
  private _validationResult?: TextareaValidationResult;
  private _validationDebounceMs = 300;
  private _validationTimeout?: ReturnType<typeof setTimeout>;

  constructor(host: TextareaValidationHost & ReactiveControllerHost) {
    super(host);
  }

  /**
   * Get the validation host with extended interface
   */
  get validationHost(): TextareaValidationHost & ReactiveControllerHost {
    return this._host as TextareaValidationHost & ReactiveControllerHost;
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
   * Validate the current value against all rules
   */
  async validate(value?: string): Promise<TextareaValidationResult> {
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

    // Update host state based on validation
    this.updateHostValidationState();

    // Dispatch validation event
    this.dispatchValidationEvent();

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
        const result = await this.validate(value);
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
      return await this.validate(value);
    }
    return undefined;
  }

  /**
   * Clear validation state
   */
  clearValidation(): void {
    this._validationResult = undefined;
    
    if (this._validationTimeout) {
      clearTimeout(this._validationTimeout);
      this._validationTimeout = undefined;
    }

    // Reset state to default if it was set by validation
    if (this.validationHost.state !== TEXTAREA_STATE.Default) {
      this.validationHost.state = TEXTAREA_STATE.Default;
      this.requestHostUpdate();
    }

    this.dispatchValidationEvent();
  }

  /**
   * Check if the current value is valid according to validation rules
   */
  isValid(): boolean {
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
   * Add a validation rule
   */
  addRule(rule: ValidationRule): void {
    const rules = this.validationHost.rules || [];
    rules.push(rule);
    this.validationHost.rules = rules;
    this.requestHostUpdate();
  }

  /**
   * Remove a validation rule
   */
  removeRule(predicate: (rule: ValidationRule) => boolean): void {
    const rules = this.validationHost.rules || [];
    this.validationHost.rules = rules.filter(rule => !predicate(rule));
    this.requestHostUpdate();
  }

  /**
   * Remove all validation rules
   */
  clearRules(): void {
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

    this.requestHostUpdate();
  }

  /**
   * Dispatch validation event
   */
  private dispatchValidationEvent(): void {
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

    const event = new CustomEvent('textarea-validation', {
      detail,
      bubbles: true,
      composed: true
    });

    this.safeExecute(() => this._host.dispatchEvent(event), 'dispatchValidationEvent');
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