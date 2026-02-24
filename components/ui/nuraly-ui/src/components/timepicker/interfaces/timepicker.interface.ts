/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { TimeValue, TimePickerConfig } from '../timepicker.types.js';

/**
 * Base controller interface for time picker host
 */
export interface TimePickerHost {
  /**
   * Get current time value
   */
  getCurrentTime(): TimeValue;

  /**
   * Set time value
   */
  setTime(time: TimeValue): void;

  /**
   * Format time value to string
   */
  formatTime(time: TimeValue): string;

  /**
   * Parse time string to TimeValue
   */
  parseTime(timeString: string): TimeValue | null;

  /**
   * Get time picker configuration
   */
  getConfig(): TimePickerConfig;

  /**
   * Validate time value
   */
  validateTime(time: TimeValue): boolean;

  /**
   * Request component update
   */
  requestUpdate(): void;
}

/**
 * Time selection controller interface
 */
export interface TimeSelectionController {
  /**
   * Select time value
   */
  selectTime(time: TimeValue): void;

  /**
   * Get selected time
   */
  getSelectedTime(): TimeValue | null;

  /**
   * Clear selection
   */
  clearSelection(): void;

  /**
   * Check if time is selected
   */
  isTimeSelected(time: TimeValue): boolean;
}

/**
 * Time validation controller interface
 */
export interface TimeValidationController {
  /**
   * Validate time constraints
   */
  validateConstraints(time: TimeValue): boolean;

  /**
   * Check if time is within min/max bounds
   */
  isTimeInBounds(time: TimeValue): boolean;

  /**
   * Check if time is disabled
   */
  isTimeDisabled(time: TimeValue): boolean;

  /**
   * Get validation message
   */
  getValidationMessage(time: TimeValue): string;
}

/**
 * Time formatting controller interface
 */
export interface TimeFormattingController {
  /**
   * Format time to display string
   */
  formatForDisplay(time: TimeValue): string;

  /**
   * Format time to input value
   */
  formatForInput(time: TimeValue): string;

  /**
   * Parse input value to time
   */
  parseInputValue(value: string): TimeValue | null;

  /**
   * Get time format pattern
   */
  getFormatPattern(): string;
}
