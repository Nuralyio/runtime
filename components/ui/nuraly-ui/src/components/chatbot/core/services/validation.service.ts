/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import type { ValidationResult, ChatbotCoreConfig } from '../types.js';
import type { ChatbotValidationRule } from '../../chatbot.types.js';

/**
 * ValidationService - Handles validation logic
 * Validates messages and files according to configured rules
 */
export class ValidationService {
  private validators: ChatbotValidationRule[] = [];

  constructor(config: ChatbotCoreConfig) {
    this.validators = config.validators || [];
  }

  async validateMessage(text: string): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!text.trim()) {
      errors.push('Message cannot be empty');
    }

    for (const validator of this.validators) {
      try {
        const isValid = await validator.validator(text);
        if (!isValid) {
          errors.push(validator.errorMessage);
          if (validator.warningMessage) {
            warnings.push(validator.warningMessage);
          }
        }
      } catch (error) {
        this.logError('Validation error:', error);
        errors.push('Validation failed');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  validateFile(file: File, config?: { maxFileSize?: number; allowedTypes?: string[] }): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const maxSize = config?.maxFileSize || 10 * 1024 * 1024;
    if (file.size > maxSize) {
      errors.push(`File size exceeds maximum allowed (${this.formatFileSize(maxSize)})`);
    }

    if (config?.allowedTypes && config.allowedTypes.length > 0) {
      const isAllowed = config.allowedTypes.some(type => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        return file.type.includes(type);
      });

      if (!isAllowed) {
        errors.push(`File type not allowed. Allowed types: ${config.allowedTypes.join(', ')}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  addValidator(validator: ChatbotValidationRule): void {
    this.validators.push(validator);
  }

  removeValidator(ruleId: string): void {
    this.validators = this.validators.filter(v => v.id !== ruleId);
  }

  clearValidators(): void {
    this.validators = [];
  }

  getValidators(): ChatbotValidationRule[] {
    return [...this.validators];
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  private logError(message: string, error: any): void {
    console.error(`[ValidationService] ${message}`, error);
  }
}
