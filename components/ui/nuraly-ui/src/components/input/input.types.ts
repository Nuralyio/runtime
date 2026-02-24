export const enum INPUT_STATE {
  Default = 'default',
  Error = 'error',
  Warning = 'warning',
  Success = 'success',
}

export const enum INPUT_SIZE {
  Large = 'large',
  Medium = 'medium',
  Small = 'small',
}

export const enum INPUT_VARIANT {
  Outlined = 'outlined',
  Filled = 'filled',
  Borderless = 'borderless',
  Underlined = 'underlined',
}

export const enum INPUT_TYPE {
  PASSWORD = 'password',
  TEXT = 'text',
  NUMBER = 'number',
  EMAIL = 'email',
  URL = 'url',
  TEL = 'tel',
  SEARCH = 'search',
  CALENDAR = 'calendar',
}

export interface FocusOptions {
  preventScroll?: boolean;
  cursor?: 'start' | 'end' | 'all' | number;
  select?: boolean;
}

export interface BlurOptions {
  preventScroll?: boolean;
  restoreCursor?: boolean;
}

export interface FocusChangeEvent {
  focused: boolean;
  cursorPosition?: number;
  selectedText?: string;
}

/**
 * Validation rule interface
 */
export interface ValidationRule {
  /** Validation rule type */
  type?: 'string' | 'number' | 'boolean' | 'method' | 'regexp' | 'integer' | 'float' | 'array' | 'object' | 'enum' | 'date' | 'url' | 'hex' | 'email';
  
  /** Required field */
  required?: boolean;
  
  /** Pattern to match */
  pattern?: RegExp;
  
  /** Minimum length for string/array */
  minLength?: number;
  
  /** Maximum length for string/array */
  maxLength?: number;
  
  /** Minimum value for number */
  min?: number;
  
  /** Maximum value for number */
  max?: number;
  
  /** Enumerable values */
  enum?: any[];
  
  /** Custom validation message */
  message?: string;
  
  /** Custom validator function */
  validator?: (rule: ValidationRule, value: any) => Promise<void> | void | { isValid: boolean; message?: string } | Promise<{ isValid: boolean; message?: string }>;
  
  /** Async validator function */
  asyncValidator?: (rule: ValidationRule, value: any) => Promise<void>;
  
  /** Transform value before validation */
  transform?: (value: any) => any;
  
  /** Validation trigger */
  trigger?: 'change' | 'blur' | 'submit';
  
  /** Validation level */
  warningOnly?: boolean;
}

/**
 * Input validation result
 */
export interface InputValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  hasError: boolean;
  hasWarning: boolean;
  errorMessage?: string;
  warningMessage?: string;
}

/**
 * Built-in validation patterns
 */
export const VALIDATION_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  PHONE: /^[\+]?[1-9][\d]{0,15}$/,
  PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  NUMERIC: /^\d+$/,
  ALPHA: /^[a-zA-Z]+$/,
  USERNAME: /^[a-zA-Z0-9_-]{3,16}$/,
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  IPV4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  CREDIT_CARD: /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})$/,
} as const;

/**
 * Pre-built validation rules
 */
export const VALIDATION_RULES = {
  required: (message?: string): ValidationRule => ({
    required: true,
    message: message || 'This field is required'
  }),
  
  email: (message?: string): ValidationRule => ({
    type: 'email',
    pattern: VALIDATION_PATTERNS.EMAIL,
    message: message || 'Please enter a valid email address'
  }),
  
  url: (message?: string): ValidationRule => ({
    type: 'url',
    pattern: VALIDATION_PATTERNS.URL,
    message: message || 'Please enter a valid URL'
  }),
  
  minLength: (min: number, message?: string): ValidationRule => ({
    minLength: min,
    message: message || `Minimum length is ${min} characters`
  }),
  
  maxLength: (max: number, message?: string): ValidationRule => ({
    maxLength: max,
    message: message || `Maximum length is ${max} characters`
  }),
  
  min: (min: number, message?: string): ValidationRule => ({
    type: 'number',
    min,
    message: message || `Minimum value is ${min}`
  }),
  
  max: (max: number, message?: string): ValidationRule => ({
    type: 'number',
    max,
    message: message || `Maximum value is ${max}`
  }),
  
  pattern: (pattern: RegExp, message?: string): ValidationRule => ({
    pattern,
    message: message || 'Invalid format'
  }),
  
  strongPassword: (message?: string): ValidationRule => ({
    pattern: VALIDATION_PATTERNS.PASSWORD_STRONG,
    message: message || 'Password must contain at least 8 characters, including uppercase, lowercase, number and special character'
  }),
  
  phone: (message?: string): ValidationRule => ({
    pattern: VALIDATION_PATTERNS.PHONE,
    message: message || 'Please enter a valid phone number'
  }),
  
  username: (message?: string): ValidationRule => ({
    pattern: VALIDATION_PATTERNS.USERNAME,
    message: message || 'Username must be 3-16 characters long and contain only letters, numbers, hyphens and underscores'
  }),
  
  creditCard: (message?: string): ValidationRule => ({
    pattern: VALIDATION_PATTERNS.CREDIT_CARD,
    message: message || 'Please enter a valid credit card number'
  }),
} as const;

export const EMPTY_STRING = '';
