export const enum INPUT_STATE {
  Default = 'default',
  Error = 'error',
  Warning = 'warning',
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

export const EMPTY_STRING = '';
