export const enum TEXTAREA_STATE {
  Default = 'default',
  Error = 'error',
  Warning = 'warning',
  Success = 'success',
}

export const enum TEXTAREA_SIZE {
  Large = 'large',
  Medium = 'medium',
  Small = 'small',
}

export const enum TEXTAREA_VARIANT {
  Default = '',
  Outlined = 'outlined',
  Filled = 'filled',
  Borderless = 'borderless',
  Underlined = 'underlined',
}

export const enum TEXTAREA_RESIZE {
  None = 'none',
  Vertical = 'vertical',
  Horizontal = 'horizontal',
  Both = 'both',
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
  /** Validation function that returns true if valid */
  validator: (value: string) => boolean | Promise<boolean>;
  /** Error message to display if validation fails */
  message: string;
  /** Rule severity level */
  level?: 'error' | 'warning';
  /** Whether this rule should block form submission */
  blocking?: boolean;
}

/**
 * Validation result interface
 */
export interface TextareaValidationResult {
  /** Whether the current value is valid */
  isValid: boolean;
  /** Array of validation messages (errors/warnings) */
  messages: string[];
  /** Validation level (error or warning) */
  level: 'error' | 'warning' | 'success';
  /** Whether validation is blocking */
  blocking: boolean;
}

/**
 * Textarea change event detail interface
 */
export interface TextareaChangeEvent {
  /** Current textarea value */
  value: string;
  /** Character count */
  length: number;
  /** Whether max length is exceeded */
  exceedsMaxLength: boolean;
  /** Validation result */
  validation?: TextareaValidationResult;
}

/**
 * Textarea resize event detail interface
 */
export interface TextareaResizeEvent {
  /** New width in pixels */
  width: number;
  /** New height in pixels */
  height: number;
  /** Resize direction */
  direction: 'horizontal' | 'vertical' | 'both';
}

export const EMPTY_STRING = '';

/**
 * Common textarea configuration constants
 */
export const TEXTAREA_DEFAULTS = {
  ROWS: 3,
  COLS: 50,
  MAX_LENGTH: 1000,
  RESIZE: TEXTAREA_RESIZE.Vertical,
  SIZE: TEXTAREA_SIZE.Medium,
  STATE: TEXTAREA_STATE.Default,
  VARIANT: TEXTAREA_VARIANT.Underlined,
} as const;