/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { BaseInputController, InputHost } from './base.controller.js';
import { ReactiveControllerHost } from 'lit';
import { html, TemplateResult } from 'lit';
import { ValidationRule, InputValidationResult, VALIDATION_PATTERNS, VALIDATION_RULES } from '../input.types.js';
import { ValidationStateController, ValidationState } from './state.controller.js';

/**
 * Validation event detail interface
 */
export interface InputValidationEventDetail {
  isValid: boolean;
  validationMessage: string;
  validationState: ValidationState;
  errors: string[];
  warnings: string[];
  validationResult: InputValidationResult;
}

/**
 * Extended input host interface for validation
 */
export interface InputValidationHost extends InputHost {
  rules: ValidationRule[];
  validateOnChangeInput: boolean;
  validateOnBlurInput: boolean;
  validationTrigger: 'change' | 'blur' | 'submit';
  hasFeedback: boolean;
  allowWarnings: boolean;
  validationDebounce?: number;
  maxLength?: number;
  min?: string;
  max?: string;
  state: string;
  validationMessage?: string;
}

/**
 * Validation controller manages all validation logic for input components
 * This controller handles:
 * - Rule-based validation (required, patterns, custom validators, etc.)
 * - Validation timing (change, blur, submit)
 * - Validation state management
 * - Error and warning messages
 * - Integration with form validation
 */
export class InputValidationController extends BaseInputController {
  private stateController = new ValidationStateController(this._host);

  private get validationHost(): InputValidationHost {
    return this._host as unknown as InputValidationHost;
  }

  constructor(host: InputValidationHost & ReactiveControllerHost) {
    super(host);
  }

  /**
   * Get validation state
   */
  get isValid(): boolean {
    return this.stateController.isValid;
  }

  /**
   * Get validation message
   */
  get validationMessage(): string {
    return this.stateController.validationMessage;
  }

  /**
   * Get current validation state
   */
  get validationState(): ValidationState {
    return this.stateController.validationState;
  }

  /**
   * Get validation result
   */
  get validationResult(): InputValidationResult {
    return this.stateController.validationResult;
  }

  /**
   * Check if currently validating
   */
  get isValidating(): boolean {
    return this.stateController.isValidating;
  }

  /**
   * Initialize validation rules based on input properties
   */
  override hostConnected(): void {
    this.setupValidationRules();
  }

  /**
   * Handle host updates - trigger validation if needed
   */
  override hostUpdated(): void {
    // Don't trigger validation during component updates to prevent loops
    // Validation will be triggered by user interactions (change, blur, etc.)
  }

  /**
   * Setup default validation rules based on input properties
   */
  setupValidationRules(): void {
    const autoRules: ValidationRule[] = [];
    const host = this.validationHost;

    // Auto-add email validation for email inputs
    if (host.type === 'email') {
      autoRules.push(VALIDATION_RULES.email());
    }

    // Auto-add URL validation for URL inputs
    if (host.type === 'url') {
      autoRules.push(VALIDATION_RULES.url());
    }

    // Auto-add required validation if required attribute is set
    if (host.required) {
      autoRules.push(VALIDATION_RULES.required(host.label ? `${host.label} is required` : undefined));
    }

    // Auto-add length validations
    if (host.maxLength) {
      autoRules.push(VALIDATION_RULES.maxLength(host.maxLength));
    }

    // Auto-add number validations
    if (host.type === 'number') {
      if (host.min !== undefined) {
        autoRules.push(VALIDATION_RULES.min(Number(host.min)));
      }
      if (host.max !== undefined) {
        autoRules.push(VALIDATION_RULES.max(Number(host.max)));
      }
    }

    // Merge auto rules with manual rules (manual rules take precedence)
    const existingRules = host.rules || [];
    const mergedRules = [...autoRules.filter(rule => 
      !existingRules.some(manualRule => this.isSameRuleType(rule, manualRule))
    ), ...existingRules];

    if (JSON.stringify(host.rules) !== JSON.stringify(mergedRules)) {
      host.rules = mergedRules;
      this.requestUpdate();
    }
  }

  /**
   * Validate the input value
   */
  validate(): boolean {
    try {
      this.stateController.setValidationState(ValidationState.Pending);
      this.stateController.setValidating(true);
      
      // Dispatch event to show loading state
      this.dispatchValidationEvent();
      
      // Perform async validation if any async validators exist
      const hasAsync = this.hasAsyncValidators();
      if (hasAsync) {
        this.performAsyncValidation(this.validationHost.value);
        return true; // Return true for now, will be updated when async completes
      }
      
      const result = this.performDetailedValidation(this.validationHost.value);
      this.stateController.setValidationResult(result);
      
      if (result.hasError) {
        this.setValidationResult(false, this.stateController.validationMessage, ValidationState.Invalid);
      } else if (result.hasWarning && this.validationHost.allowWarnings) {
        this.setValidationResult(true, this.stateController.validationMessage, ValidationState.Warning);
      } else {
        this.setValidationResult(true, '', ValidationState.Valid);
      }

      this.stateController.setValidating(false);
      this.updateHostValidationState();
      
      return result.isValid;
    } catch (error) {
      this.handleError(error as Error, 'validate');
      this.stateController.setValidating(false);
      this.setValidationResult(false, 'Validation error occurred', ValidationState.Invalid);
      this.updateHostValidationState();
      return false;
    }
  }

  /**
   * Validate on value change
   */
  validateOnChange(): void {
    if (!this.stateController.shouldValidateOnChange()) return;
    
    this.stateController.debounceValidation(() => {
      this.validate();
    });
  }

  /**
   * Validate on blur
   */
  validateOnBlur(): void {
    if (!this.stateController.shouldValidateOnBlur()) return;
    
    // Clear any pending debounced validation on blur and validate immediately
    this.stateController.clearDebounceTimer();
    this.validate();
  }

  /**
   * Add validation rule dynamically
   */
  addRule(rule: ValidationRule): void {
    const currentRules = this.validationHost.rules || [];
    this.validationHost.rules = [...currentRules, rule];
    this.requestUpdate();
  }

  /**
   * Remove validation rule
   */
  removeRule(predicate: (rule: ValidationRule) => boolean): void {
    const currentRules = this.validationHost.rules || [];
    this.validationHost.rules = currentRules.filter(rule => !predicate(rule));
    this.requestUpdate();
  }

  /**
   * Clear all validation rules
   */
  clearRules(): void {
    this.validationHost.rules = [];
    this.reset();
  }

  /**
   * Check if any rules have async validators
   */
  private hasAsyncValidators(): boolean {
    const rules = this.validationHost.rules || [];
    const hasAsync = rules.some(rule => 
      rule.asyncValidator || 
      (rule.validator && this.isValidatorAsync(rule.validator))
    );
    return hasAsync;
  }

  /**
   * Check if a validator function is async (returns a Promise)
   */
  private isValidatorAsync(validator: Function): boolean {
    // For now, assume any validator that mentions Promise or async keywords is async
    const funcString = validator.toString();
    return funcString.includes('Promise') || 
           funcString.includes('async') ||
           funcString.includes('setTimeout') ||
           funcString.includes('new Promise');
  }

  /**
   * Perform async validation
   */
  private async performAsyncValidation(value: string): Promise<void> {
    try {
      this.stateController.setValidating(true);
      this.updateHostValidationState();

      const errors: string[] = [];
      const warnings: string[] = [];
      const rules = this.validationHost.rules || [];

      // First run synchronous validations
      for (const rule of rules) {
        if (!rule.asyncValidator && (!rule.validator || !this.isValidatorAsync(rule.validator))) {
          const ruleResult = this.validateRule(rule, value);
          if (!ruleResult.isValid) {
            if (rule.warningOnly && this.validationHost.allowWarnings) {
              warnings.push(ruleResult.message);
            } else {
              errors.push(ruleResult.message);
            }
          }
        }
      }

      if (errors.length > 0) {
        this.stateController.setValidationResult({
          isValid: false,
          errors,
          warnings,
          hasError: true,
          hasWarning: warnings.length > 0,
          errorMessage: errors[0],
          warningMessage: warnings[0]
        });
        this.setValidationResult(false, this.stateController.validationMessage, ValidationState.Invalid);
        this.stateController.setValidating(false);
        this.updateHostValidationState();
        return;
      }

      // Run async validations
      for (const rule of rules) {
        if (rule.asyncValidator || (rule.validator && this.isValidatorAsync(rule.validator))) {
          try {
            await this.validateAsyncRule(rule, value);
          } catch (error) {
            const message = (error as Error).message || rule.message || 'Validation failed';
            if (rule.warningOnly && this.validationHost.allowWarnings) {
              warnings.push(message);
            } else {
              errors.push(message);
            }
          }
        }
      }

      const hasError = errors.length > 0;
      const hasWarning = warnings.length > 0;

      this.stateController.setValidationResult({
        isValid: !hasError,
        errors,
        warnings,
        hasError,
        hasWarning,
        errorMessage: errors[0],
        warningMessage: warnings[0]
      });

      if (hasError) {
        this.setValidationResult(false, this.stateController.validationMessage, ValidationState.Invalid);
      } else if (hasWarning && this.validationHost.allowWarnings) {
        this.setValidationResult(true, this.stateController.validationMessage, ValidationState.Warning);
      } else {
        this.setValidationResult(true, '', ValidationState.Valid);
      }

      this.stateController.setValidating(false);
      this.updateHostValidationState();

    } catch (error) {
      this.handleError(error as Error, 'performAsyncValidation');
      this.stateController.setValidating(false);
      this.setValidationResult(false, 'Async validation error occurred', ValidationState.Invalid);
      this.updateHostValidationState();
    }
  }

  /**
   * Validate a single async rule
   */
  private async validateAsyncRule(rule: ValidationRule, value: string): Promise<void> {
    if (rule.asyncValidator) {
      await rule.asyncValidator(rule, value);
    } else if (rule.validator) {
      const result = rule.validator(rule, value);
      
      if (result && typeof result === 'object' && 'then' in result) {
        await result;
      }
    }
  }

  /**
   * Reset validation state
   */
  reset(): void {
    this.stateController.setValidationResult({
      isValid: true,
      errors: [],
      warnings: [],
      hasError: false,
      hasWarning: false
    });
    this.stateController.setValidationState(ValidationState.Pristine);
    this.stateController.setValidating(false);
    
    this.updateHostValidationState();
    this.dispatchValidationEvent();
  }

  /**
   * Get current validation status
   */
  getValidationStatus(): {
    isValid: boolean;
    isValidating: boolean;
    errors: string[];
    warnings: string[];
    validationResult: InputValidationResult;
  } {
    return {
      isValid: this.stateController.validationResult.isValid,
      isValidating: this.stateController.isValidating,
      errors: this.stateController.validationResult.errors,
      warnings: this.stateController.validationResult.warnings,
      validationResult: this.stateController.validationResult
    };
  }

  /**
   * Set validation result externally (for form integration)
   */
  setValidationStatus(result: InputValidationResult): void {
    this.stateController.setValidationResult(result);
    
    if (result.hasError) {
      this.setValidationResult(false, this.stateController.validationMessage, ValidationState.Invalid);
    } else if (result.hasWarning) {
      this.setValidationResult(true, this.stateController.validationMessage, ValidationState.Warning);
    } else if (result.isValid) {
      this.setValidationResult(true, '', ValidationState.Valid);
    } else {
      this.setValidationResult(true, '', ValidationState.Pristine);
    }
    
    this.updateHostValidationState();
  }

  // ========================================
  // PRIVATE METHODS
  // ========================================

  /**
   * Perform detailed validation with warnings and errors
   */
  private performDetailedValidation(value: string): InputValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const rules = this.validationHost.rules || [];

    for (const rule of rules) {
      const ruleResult = this.validateRule(rule, value);
      
      if (!ruleResult.isValid) {
        if (rule.warningOnly && this.validationHost.allowWarnings) {
          warnings.push(ruleResult.message);
        } else {
          errors.push(ruleResult.message);
        }
      }
    }

    const hasError = errors.length > 0;
    const hasWarning = warnings.length > 0;

    return {
      isValid: !hasError,
      errors,
      warnings,
      hasError,
      hasWarning,
      errorMessage: errors[0],
      warningMessage: warnings[0]
    };
  }

  /**
   * Validate a single rule
   */
  private validateRule(rule: ValidationRule, value: string): { isValid: boolean; message: string } {
    // Skip async validators - they should be handled separately
    if (rule.asyncValidator || (rule.validator && this.isValidatorAsync(rule.validator))) {
      return { isValid: true, message: '' };
    }

    // Transform value if transformer is provided
    const transformedValue = rule.transform ? rule.transform(value) : value;

    // Required validation
    if (rule.required && this.isValueEmpty(value)) {
      return { 
        isValid: false, 
        message: rule.message || `${this.validationHost.label || 'This field'} is required` 
      };
    }

    // Skip further validation if value is empty and not required
    if (this.isValueEmpty(value) && !rule.required) {
      return { isValid: true, message: '' };
    }

    // Type validation
    if (rule.type) {
      const typeResult = this.validateType(rule.type, transformedValue);
      if (!typeResult.isValid) {
        return { 
          isValid: false, 
          message: rule.message || typeResult.message 
        };
      }
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(transformedValue)) {
      return { 
        isValid: false, 
        message: rule.message || 'Invalid format' 
      };
    }

    // Length validation
    if (rule.minLength !== undefined && transformedValue.length < rule.minLength) {
      return { 
        isValid: false, 
        message: rule.message || `Minimum length is ${rule.minLength} characters` 
      };
    }

    if (rule.maxLength !== undefined && transformedValue.length > rule.maxLength) {
      return { 
        isValid: false, 
        message: rule.message || `Maximum length is ${rule.maxLength} characters` 
      };
    }

    // Number range validation
    if (rule.type === 'number' || this.validationHost.type === 'number') {
      const numValue = Number(transformedValue);
      
      if (rule.min !== undefined && numValue < rule.min) {
        return { 
          isValid: false, 
          message: rule.message || `Minimum value is ${rule.min}` 
        };
      }

      if (rule.max !== undefined && numValue > rule.max) {
        return { 
          isValid: false, 
          message: rule.message || `Maximum value is ${rule.max}` 
        };
      }
    }

    // Enum validation
    if (rule.enum && !rule.enum.includes(transformedValue)) {
      return { 
        isValid: false, 
        message: rule.message || `Value must be one of: ${rule.enum.join(', ')}` 
      };
    }

    // Custom validator (synchronous only)
    if (rule.validator) {
      try {
        const result = rule.validator(rule, transformedValue);
        
        if (result && typeof result === 'object' && 'isValid' in result) {
          return {
            isValid: result.isValid,
            message: result.isValid ? '' : (result.message || rule.message || 'Validation failed')
          };
        }
        
        return { isValid: true, message: '' };
      } catch (error) {
        return { 
          isValid: false, 
          message: rule.message || (error as Error).message || 'Validation failed' 
        };
      }
    }

    return { isValid: true, message: '' };
  }  /**
   * Validate value type
   */
  private validateType(type: string, value: string): { isValid: boolean; message: string } {
    switch (type) {
      case 'email':
        return {
          isValid: VALIDATION_PATTERNS.EMAIL.test(value),
          message: 'Please enter a valid email address'
        };
      case 'url':
        return {
          isValid: VALIDATION_PATTERNS.URL.test(value),
          message: 'Please enter a valid URL'
        };
      case 'number':
      case 'integer':
        return {
          isValid: !isNaN(Number(value)) && (type === 'number' || Number.isInteger(Number(value))),
          message: `Please enter a valid ${type}`
        };
      case 'float':
        return {
          isValid: !isNaN(parseFloat(value)),
          message: 'Please enter a valid number'
        };
      default:
        return { isValid: true, message: '' };
    }
  }

  /**
   * Check if value is empty
   */
  private isValueEmpty(value: string): boolean {
    return value === null || value === undefined || value === '';
  }

  /**
   * Check if two rules are the same type
   */
  private isSameRuleType(rule1: ValidationRule, rule2: ValidationRule): boolean {
    return rule1.type === rule2.type && 
           rule1.required === rule2.required &&
           !!rule1.pattern === !!rule2.pattern;
  }

  /**
   * Set validation result and dispatch event
   */
  private setValidationResult(isValid: boolean, message: string, state: ValidationState): void {
    const hasChanged = 
      this.stateController.isValid !== isValid || 
      this.stateController.validationMessage !== message || 
      this.stateController.validationState !== state;

    // Update state controller
    this.stateController.setValidationState(state);
    this.stateController.setValidationResult({
      isValid,
      errors: isValid ? [] : [message],
      warnings: [],
      hasError: !isValid,
      hasWarning: false,
      errorMessage: isValid ? '' : message,
      warningMessage: ''
    });

    if (hasChanged) {
      this.dispatchValidationEvent();
    }
  }

  /**
   * Update host component validation state
   */
  private updateHostValidationState(): void {
    // Don't directly modify host properties to avoid infinite update loops
    // Instead, rely on the host component to listen to validation events
    // and update its own state accordingly
    this.dispatchValidationEvent();
  }

  /**
   * Dispatch validation event
   */
  private dispatchValidationEvent(): void {
    const detail: InputValidationEventDetail = {
      isValid: this.stateController.isValid,
      validationMessage: this.stateController.validationMessage,
      validationState: this.stateController.validationState,
      errors: this.stateController.validationResult.errors,
      warnings: this.stateController.validationResult.warnings,
      validationResult: this.stateController.validationResult
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
   * Get validation classes for CSS styling
   */
  getValidationClasses(): Record<string, boolean> {
    const host = this.host as any;
    const validationHost = this.host as InputValidationHost;
    return {
      'valid': this.stateController.validationResult.isValid && !this.stateController.validationResult.hasWarning,
      'invalid': this.stateController.validationResult.hasError,
      'warning': this.stateController.validationResult.hasWarning && !this.stateController.validationResult.hasError,
      'validating': this.stateController.isValidating,
      'has-feedback': validationHost.hasFeedback || false,
      'touched': host.isTouched || false,
      'dirty': host.isDirty || false,
      'required': this.host.required || false
    };
  }

  /**
   * Check if validation feedback should be shown
   */
  hasValidationFeedback(): boolean {
    const host = this.host as any; // Cast to any to handle potential type issues
    const hasFeedback = host.hasFeedback;
    return !!hasFeedback && (
      this.stateController.isValidating || 
      this.stateController.validationResult.hasError || 
      this.stateController.validationResult.hasWarning ||
      (this.stateController.validationResult.isValid && host.value && host.value.trim() !== '' && 
       this.stateController.validationState !== ValidationState.Pristine)
    );
  }

  /**
   * Render validation feedback icon
   */
  renderValidationIcon(): TemplateResult | string {
    const host = this.host as any; // Cast to any to handle potential type issues
    if (!host.hasFeedback) return '';
    
    let iconName = '';
    let iconClass = '';
    
    if (this.stateController.isValidating) {
      iconName = 'hourglass-half';
      iconClass = 'validation-loading';
    } 
    else if (this.stateController.validationResult.hasError) {
      iconName = 'exclamation-circle';
      iconClass = 'validation-error';
    } 
    else if (this.stateController.validationResult.hasWarning) {
      iconName = 'exclamation-triangle';
      iconClass = 'validation-warning';
    } 
    else if (this.stateController.validationResult.isValid && host.value && host.value.trim() !== '' && 
             this.stateController.validationState !== ValidationState.Pristine) {
      iconName = 'check-circle';
      iconClass = 'validation-success';
    }
    
    if (!iconName) return '';
    
    return html`
      <hy-icon 
        name="${iconName}" 
        class="validation-icon ${iconClass}"
        part="validation-icon">
      </hy-icon>
    `;
  }

  /**
   * Render validation message
   */
  renderValidationMessage(): TemplateResult | string {
    const hasError = this.stateController.validationResult.hasError;
    const hasWarning = this.stateController.validationResult.hasWarning && !hasError;
    const message = hasError ? this.stateController.validationResult.errorMessage : 
                   hasWarning ? this.stateController.validationResult.warningMessage : '';
    
    if (!message) return '';
    
    return html`
      <div class="validation-message ${hasError ? 'error' : 'warning'}" 
           part="validation-message"
           role="alert"
           aria-live="polite">
        ${message}
      </div>
    `;
  }

  /**
   * Clear debounce timer (delegate to state controller)
   */
  clearDebounceTimer(): void {
    this.stateController.clearDebounceTimer();
  }

  /**
   * Get validation state for external components
   */
  getValidationRenderState(): {
    classes: Record<string, boolean>;
    hasValidationFeedback: boolean;
    isValidating: boolean;
    validationResult: InputValidationResult;
    validationState: ValidationState;
  } {
    return {
      classes: this.getValidationClasses(),
      hasValidationFeedback: this.hasValidationFeedback(),
      isValidating: this.stateController.isValidating,
      validationResult: this.stateController.validationResult,
      validationState: this.stateController.validationState
    };
  }
}
