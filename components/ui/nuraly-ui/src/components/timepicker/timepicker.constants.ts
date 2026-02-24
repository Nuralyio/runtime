/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { TimeFormat, TimeStep } from './timepicker.types.js';

/**
 * Default time picker configuration
 */
export const DEFAULT_TIME_CONFIG = {
  format: TimeFormat.TwentyFourHour,
  showSeconds: false,
  minuteInterval: 1,
  secondInterval: 1,
  use12HourClock: false,
} as const;

/**
 * Default time display formats
 */
export const DEFAULT_TIME_FORMAT = 'HH:mm';
export const DEFAULT_TIME_FORMAT_WITH_SECONDS = 'HH:mm:ss';
export const DEFAULT_12H_TIME_FORMAT = 'hh:mm A';
export const DEFAULT_12H_TIME_FORMAT_WITH_SECONDS = 'hh:mm:ss A';

/**
 * Time input field ID
 */
export const TIME_INPUT_FIELD_ID = 'time-input-field';

/**
 * Clock container CSS class
 */
export const CLOCK_CONTAINER_CLASS = 'time-picker-clock-container';

/**
 * Time validation patterns
 */
export const TIME_VALIDATION_PATTERNS = {
  TWENTY_FOUR_HOUR: /^([01]?[0-9]|2[0-3]):([0-5]?[0-9])(:([0-5]?[0-9]))?$/,
  TWELVE_HOUR: /^(0?[1-9]|1[0-2]):([0-5]?[0-9])(:([0-5]?[0-9]))?\s?(AM|PM|am|pm)$/,
} as const;

/**
 * Time boundaries
 */
export const TIME_BOUNDARIES = {
  MIN_HOUR_24: 0,
  MAX_HOUR_24: 23,
  MIN_HOUR_12: 1,
  MAX_HOUR_12: 12,
  MIN_MINUTE: 0,
  MAX_MINUTE: 59,
  MIN_SECOND: 0,
  MAX_SECOND: 59,
} as const;

/**
 * Default step values
 */
export const DEFAULT_STEPS = {
  HOURS: TimeStep.One,
  MINUTES: TimeStep.One,
  SECONDS: TimeStep.One,
} as const;

/**
 * Time picker CSS classes
 */
export const TIME_PICKER_CLASSES = {
  CONTAINER: 'time-picker',
  INPUT: 'time-picker__input',
  CLOCK: 'time-picker__clock',
  DROPDOWN: 'time-picker__dropdown',
  HOUR: 'time-picker__hour',
  MINUTE: 'time-picker__minute',
  SECOND: 'time-picker__second',
  PERIOD: 'time-picker__period',
  BUTTON: 'time-picker__button',
  SEPARATOR: 'time-picker__separator',
} as const;

/**
 * Clock face constants
 */
export const CLOCK_FACE = {
  RADIUS: 100,
  CENTER: 50,
  HOUR_HAND_LENGTH: 30,
  MINUTE_HAND_LENGTH: 40,
  SECOND_HAND_LENGTH: 45,
} as const;
