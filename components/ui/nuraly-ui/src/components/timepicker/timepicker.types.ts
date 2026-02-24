/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

/**
 * Time format types - supports 12-hour and 24-hour formats
 */
export enum TimeFormat {
  TwentyFourHour = '24h',
  TwelveHour = '12h',
}

/**
 * Time picker display modes
 */
export enum TimePickerMode {
  Hours = 'hours',
  Minutes = 'minutes',
  Seconds = 'seconds',
}

/**
 * Time picker sizes
 */
export enum TimePickerSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}

/**
 * Time picker variants
 */
export enum TimePickerVariant {
  Default = 'default',
  Outlined = 'outlined',
  Filled = 'filled',
}

/**
 * Time picker states for validation
 */
export enum TimePickerState {
  Default = 'default',
  Error = 'error',
  Warning = 'warning',
  Success = 'success',
}

/**
 * Time picker placement options for dropdown
 */
export enum TimePickerPlacement {
  Bottom = 'bottom',
  Top = 'top',
  Auto = 'auto',
}

/**
 * Time selection step increments
 */
export enum TimeStep {
  One = 1,
  Five = 5,
  Ten = 10,
  Fifteen = 15,
  Thirty = 30,
}

/**
 * Time period for 12-hour format
 */
export enum TimePeriod {
  AM = 'AM',
  PM = 'PM',
}

/**
 * Time structure interface
 */
export interface TimeValue {
  hours: number;
  minutes: number;
  seconds: number;
  period?: TimePeriod;
}

/**
 * Time picker option for dropdowns
 */
export interface TimePickerOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/**
 * Time validation constraints
 */
export interface TimeConstraints {
  minTime?: string;
  maxTime?: string;
  disabledTimes?: string[];
  enabledTimes?: string[];
}

/**
 * Time picker configuration
 */
export interface TimePickerConfig {
  format: TimeFormat;
  showSeconds: boolean;
  step: {
    hours: TimeStep;
    minutes: TimeStep;
    seconds: TimeStep;
  };
  use12HourClock: boolean;
  minuteInterval: number;
  secondInterval: number;
}

/**
 * Time picker event details
 */
export interface TimeChangeEventDetail {
  value: string;
  timeValue: TimeValue;
  formattedValue: string;
}

/**
 * Default time formats
 */
export const DEFAULT_TIME_FORMATS = {
  [TimeFormat.TwentyFourHour]: 'HH:mm',
  [TimeFormat.TwelveHour]: 'hh:mm A',
} as const;

/**
 * Default time format with seconds
 */
export const DEFAULT_TIME_FORMATS_WITH_SECONDS = {
  [TimeFormat.TwentyFourHour]: 'HH:mm:ss',
  [TimeFormat.TwelveHour]: 'hh:mm:ss A',
} as const;

/**
 * Time picker constants
 */
export const TIME_PICKER_CONSTANTS = {
  HOURS_24: 24,
  HOURS_12: 12,
  MINUTES: 60,
  SECONDS: 60,
  DEFAULT_STEP: 1,
  DEFAULT_MINUTE_INTERVAL: 1,
  DEFAULT_SECOND_INTERVAL: 1,
} as const;

/**
 * Time picker events
 */
export const TIME_PICKER_EVENTS = {
  TIME_CHANGE: 'nr-time-change',
  FOCUS: 'nr-focus',
  BLUR: 'nr-blur',
  CLOCK_OPEN: 'nr-clock-open',
  CLOCK_CLOSE: 'nr-clock-close',
  VALIDATION: 'nr-validation',
} as const;

/**
 * Empty time value
 */
export const EMPTY_TIME_VALUE: TimeValue = {
  hours: 0,
  minutes: 0,
  seconds: 0,
  period: TimePeriod.AM,
};
