/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

/**
 * Date picker option type for individual date selections
 */
export type DatePickerOption = {
  value: string;
  label: string;
  date: Date;
  disabled?: boolean;
  state?: DatePickerState;
  message?: string;
  htmlContent?: string;
  className?: string;
  style?: string;
  title?: string;
  id?: string;
};

/**
 * State types for date picker validation and feedback
 */
export type DatePickerState = 'error' | 'warning' | 'success';

/**
 * Navigation date structure for date picker
 */
export interface INavigationDate {
  start: {
    year: number;
    month: number;
    day: number;
  };
  end?: {
    year: number;
    month: number;
    day: number;
  };
}

/**
 * Day presentation structure for calendar rendering
 */
export interface IDayPresentation {
  date: number;
  day: number;
  dayString: string;
  month: number;
  valid: number;
  year: number;
  timestamp: number;
  isToday?: boolean;
  isSelected?: boolean;
  isInRange?: boolean;
  isDisabled?: boolean;
  state?: DatePickerState;
}

/**
 * Day information for month calculations
 */
export interface IDayInfo {
  dayIndex: number;
  numberOfDays: number;
  firstDay: number;
  year: number;
  month: number;
  days: string[];
}

/**
 * Raw date object for internal state management
 */
export interface DateRawObject {
  currentYear: number;
  currentMonth: number;
  currentDay: number;
  endYear?: number;
  endMonth?: number;
  endDay?: number;
}

/**
 * Date picker modes enumeration
 */
export enum DatePickerMode {
  Day = 'day',
  Month = 'month',  
  Year = 'year',
  Decade = 'decade',
}

/**
 * Date picker types enumeration
 */
export enum DatePickerType {
  Single = 'single',
  Range = 'range',
  Multiple = 'multiple',
}

/**
 * Date picker size enumeration
 */
export enum DatePickerSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}

/**
 * Date picker variant enumeration
 */
export enum DatePickerVariant {
  Default = 'default',
  Outlined = 'outlined',
  Filled = 'filled',
}

/**
 * Date format patterns
 */
export enum DatePickerFormat {
  ISO = 'YYYY-MM-DD',
  US = 'MM/DD/YYYY',
  EU = 'DD/MM/YYYY',
  Short = 'DD/MM/YY',
  Long = 'DD MMMM YYYY',
  Medium = 'DD MMM YYYY',
}

/**
 * Date picker placement options
 */
export enum DatePickerPlacement {
  Bottom = 'bottom',
  Top = 'top',
  Auto = 'auto',
}

/**
 * Legacy compatibility - keeping original Mode enum
 * @deprecated Use DatePickerMode instead
 */
export enum Mode {
  Day = 'day',
  Month = 'month',
  Year = 'year', 
  Decade = 'decade',
}
