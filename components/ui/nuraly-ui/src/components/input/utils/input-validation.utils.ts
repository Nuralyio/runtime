/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { INPUT_TYPE } from '../input.types.js';

/**
 * Validation utilities for input components
 */
export class InputValidationUtils {
  
  /**
   * Validates numeric properties (min, max, step) to ensure they are valid numbers
   */
  static validateNumericProperties(
    type: string,
    min?: string,
    max?: string,
    step?: string
  ): void {
    if (type === INPUT_TYPE.NUMBER) {
      if (min && isNaN(Number(min))) {
        console.warn(`Invalid min value: "${min}" is not a valid number`);
      }
      if (max && isNaN(Number(max))) {
        console.warn(`Invalid max value: "${max}" is not a valid number`);
      }
      if (step && isNaN(Number(step))) {
        console.warn(`Invalid step value: "${step}" is not a valid number`);
      }
      if (min && max && Number(min) >= Number(max)) {
        console.warn(`Invalid range: min value (${min}) should be less than max value (${max})`);
      }
    }
  }

  /**
   * Prevents non-numeric characters from being typed in number inputs
   */
  static preventNonNumericInput(
    keyDownEvent: KeyboardEvent,
    min?: string
  ): void {
    const key = keyDownEvent.key;
    const target = keyDownEvent.target as HTMLInputElement;
    const currentValue = target.value;
    const cursorPosition = target.selectionStart || 0;

    // Allow control keys (backspace, delete, tab, escape, enter, arrow keys, etc.)
    const allowedControlKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End', 'PageUp', 'PageDown'
    ];

    // Allow Ctrl/Cmd combinations (copy, paste, select all, etc.)
    if (keyDownEvent.ctrlKey || keyDownEvent.metaKey) {
      return;
    }

    // Allow control keys
    if (allowedControlKeys.includes(key)) {
      return;
    }

    // Allow digits
    if (/^\d$/.test(key)) {
      return;
    }

    // Allow decimal point (.) only once and allow it at the beginning for values like ".5"
    if (key === '.' || key === ',') {
      const hasDecimal = currentValue.includes('.') || currentValue.includes(',');
      if (!hasDecimal) {
        return;
      }
    }

    // Allow minus sign (-) only at the beginning and if min allows negative numbers
    if (key === '-') {
      const hasMinusSign = currentValue.includes('-');
      const minAllowsNegative = !min || Number(min) < 0;
      if (!hasMinusSign && cursorPosition === 0 && minAllowsNegative) {
        return;
      }
    }

    // Allow plus sign (+) only at the beginning
    if (key === '+') {
      const hasPlusSign = currentValue.includes('+');
      if (!hasPlusSign && cursorPosition === 0) {
        return;
      }
    }

    // If we reach here, prevent the key input
    keyDownEvent.preventDefault();
  }

  /**
   * Validates a numeric value against min/max constraints
   */
  static validateNumericValue(
    value: string,
    min?: string,
    max?: string
  ): { isValid: boolean; warnings: string[] } {
    const warnings: string[] = [];
    
    if (!value) {
      return { isValid: true, warnings };
    }

    const numericValue = Number(value);
    
    if (isNaN(numericValue)) {
      return { 
        isValid: false, 
        warnings: [`Invalid numeric value: "${value}"`] 
      };
    }

    // Check min/max constraints
    if (min && numericValue < Number(min)) {
      warnings.push(`Value ${numericValue} is below minimum ${min}`);
    }
    if (max && numericValue > Number(max)) {
      warnings.push(`Value ${numericValue} is above maximum ${max}`);
    }

    return { isValid: true, warnings };
  }
}
