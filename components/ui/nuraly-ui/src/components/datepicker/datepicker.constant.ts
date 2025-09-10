/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

/**
 * Date picker component constants
 */

export const EMPTY_STRING = '';

export const DEFAULT_LOCALE = 'en';

export const DEFAULT_DATE_FORMAT = 'DD/MM/YYYY';

export const CALENDAR_HEADER_HEIGHT = 60;

export const CALENDAR_DAY_HEIGHT = 40;

export const CALENDAR_ROWS = 6;

export const CALENDAR_COLS = 7;

export const YEARS_GRID_SIZE = 12;

export const MONTHS_PER_ROW = 3;

export const DECADE_SPAN = 10;

export const MIN_YEAR = 1900;

export const MAX_YEAR = 2100;

export const ANIMATION_DURATION = 200;

export const CALENDAR_Z_INDEX = 1000;

export const INPUT_FIELD_ID = 'date-input';

export const CALENDAR_CONTAINER_CLASS = 'calendar-container';

export const DATE_SEPARATOR = '-';

export const RANGE_SEPARATOR = ' - ';

export const KEYBOARD_KEYS = {
  ENTER: 'Enter',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  TAB: 'Tab',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
} as const;

export const ARIA_LABELS = {
  CALENDAR: 'Calendar',
  PREVIOUS_MONTH: 'Previous month',
  NEXT_MONTH: 'Next month',
  PREVIOUS_YEAR: 'Previous year',
  NEXT_YEAR: 'Next year',
  CHOOSE_DATE: 'Choose date',
  SELECTED_DATE: 'Selected date',
  TODAY: 'Today',
  WEEK: 'Week',
} as const;

export const DATE_PICKER_EVENTS = {
  DATE_CHANGE: 'nr-date-change',
  RANGE_CHANGE: 'nr-range-change',
  CALENDAR_OPEN: 'nr-calendar-open',
  CALENDAR_CLOSE: 'nr-calendar-close',
  FOCUS: 'nr-focus',
  BLUR: 'nr-blur',
  VALIDATION: 'nr-validation',
} as const;
