/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

/**
 * Base controller interface for all datepicker controllers
 */
export interface DatePickerBaseController {
  readonly host: DatePickerHost;
  handleError?(error: Error, context: string): void;
}

/**
 * Error handler interface
 */
export interface ErrorHandler {
  handleError(error: Error, context: string): void;
}

/**
 * Host interface defining the datepicker component's API
 */
export interface DatePickerHost {
  value: string;
  dateValue: string;
  defaultValue: string;
  disabled: boolean;
  required: boolean;
  range: boolean;
  locale: string;
  fieldFormat: string;
  minDate?: string;
  maxDate?: string;
  disabledDates?: string[];
  requestUpdate(): void;
  dispatchEvent(event: Event): boolean;
  getCurrentDate(): Date;
  formatDate(date: Date): string;
  parseDate(dateString: string): Date | null;
}
