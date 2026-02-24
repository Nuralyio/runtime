/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { TimeValue, TimeConstraints } from '../timepicker.types.js';
import { TimePickerHost, TimeValidationController } from '../interfaces/timepicker.interface.js';
import { TimeUtils } from '../utils/time.utils.js';

/**
 * Controller for handling time validation logic
 */
export class TimePickerValidationController implements TimeValidationController {
  private constraints: TimeConstraints = {};

  constructor(private host: TimePickerHost) {}

  /**
   * Set validation constraints
   */
  setConstraints(constraints: TimeConstraints): void {
    this.constraints = { ...constraints };
  }

  /**
   * Get current constraints
   */
  getConstraints(): TimeConstraints {
    return { ...this.constraints };
  }

  /**
   * Validate time against all constraints
   */
  validateConstraints(time: TimeValue): boolean {
    return (
      this.isTimeInBounds(time) &&
      !this.isTimeDisabled(time) &&
      this.isTimeEnabled(time)
    );
  }

  /**
   * Check if time is within min/max bounds
   */
  isTimeInBounds(time: TimeValue): boolean {
    let minTime: TimeValue | null = null;
    let maxTime: TimeValue | null = null;

    // Parse min time constraint
    if (this.constraints.minTime) {
      const config = this.host.getConfig();
      minTime = TimeUtils.parseTimeString(this.constraints.minTime, config.format);
    }

    // Parse max time constraint
    if (this.constraints.maxTime) {
      const config = this.host.getConfig();
      maxTime = TimeUtils.parseTimeString(this.constraints.maxTime, config.format);
    }

    return TimeUtils.isTimeInRange(time, minTime, maxTime);
  }

  /**
   * Check if time is explicitly disabled
   */
  isTimeDisabled(time: TimeValue): boolean {
    if (!this.constraints.disabledTimes || this.constraints.disabledTimes.length === 0) {
      return false;
    }

    const timeString = this.host.formatTime(time);
    return this.constraints.disabledTimes.includes(timeString);
  }

  /**
   * Check if time is in enabled times list (if specified)
   */
  isTimeEnabled(time: TimeValue): boolean {
    // If no enabled times specified, all times are enabled (except disabled ones)
    if (!this.constraints.enabledTimes || this.constraints.enabledTimes.length === 0) {
      return true;
    }

    const timeString = this.host.formatTime(time);
    return this.constraints.enabledTimes.includes(timeString);
  }

  /**
   * Get validation message for a time
   */
  getValidationMessage(time: TimeValue): string {
    if (!this.isTimeInBounds(time)) {
      return this.getBoundsValidationMessage(time);
    }

    if (this.isTimeDisabled(time)) {
      return 'This time is not available';
    }

    if (!this.isTimeEnabled(time)) {
      return 'This time is not in the allowed time range';
    }

    return '';
  }

  /**
   * Get bounds validation message
   */
  private getBoundsValidationMessage(time: TimeValue): string {
    const config = this.host.getConfig();
    let message = '';

    if (this.constraints.minTime && this.constraints.maxTime) {
      message = `Time must be between ${this.constraints.minTime} and ${this.constraints.maxTime}`;
    } else if (this.constraints.minTime) {
      const minTime = TimeUtils.parseTimeString(this.constraints.minTime, config.format);
      if (minTime && TimeUtils.compareTime(time, minTime) < 0) {
        message = `Time must be after ${this.constraints.minTime}`;
      }
    } else if (this.constraints.maxTime) {
      const maxTime = TimeUtils.parseTimeString(this.constraints.maxTime, config.format);
      if (maxTime && TimeUtils.compareTime(time, maxTime) > 0) {
        message = `Time must be before ${this.constraints.maxTime}`;
      }
    }

    return message;
  }

  /**
   * Validate time format
   */
  validateTimeFormat(timeString: string): boolean {
    const config = this.host.getConfig();
    const parsedTime = TimeUtils.parseTimeString(timeString, config.format);
    return parsedTime !== null;
  }

  /**
   * Get validation result with details
   */
  getValidationResult(time: TimeValue): {
    isValid: boolean;
    message: string;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (!this.isTimeInBounds(time)) {
      errors.push(this.getBoundsValidationMessage(time));
    }

    if (this.isTimeDisabled(time)) {
      errors.push('This time is disabled');
    }

    if (!this.isTimeEnabled(time)) {
      errors.push('This time is not in the allowed range');
    }

    return {
      isValid: errors.length === 0,
      message: errors.length > 0 ? errors[0] : '',
      errors,
    };
  }

  /**
   * Find nearest valid time
   */
  findNearestValidTime(time: TimeValue): TimeValue | null {
    if (this.validateConstraints(time)) {
      return time;
    }

    // Try nearby times (within 1 hour range)
    for (let minuteOffset = 1; minuteOffset <= 60; minuteOffset++) {
      // Try adding minutes
      const laterTime = TimeUtils.addTime(time, 0, minuteOffset, 0);
      if (this.validateConstraints(laterTime)) {
        return laterTime;
      }

      // Try subtracting minutes
      const earlierTime = TimeUtils.addTime(time, 0, -minuteOffset, 0);
      if (this.validateConstraints(earlierTime)) {
        return earlierTime;
      }
    }

    return null;
  }

  /**
   * Check if current time selection is valid
   */
  isCurrentSelectionValid(): boolean {
    const selectedTime = this.host.getCurrentTime();
    return this.validateConstraints(selectedTime);
  }

  /**
   * Set min time constraint
   */
  setMinTime(minTime: string | null): void {
    this.constraints.minTime = minTime || undefined;
  }

  /**
   * Set max time constraint
   */
  setMaxTime(maxTime: string | null): void {
    this.constraints.maxTime = maxTime || undefined;
  }

  /**
   * Set disabled times
   */
  setDisabledTimes(disabledTimes: string[]): void {
    this.constraints.disabledTimes = [...disabledTimes];
  }

  /**
   * Set enabled times
   */
  setEnabledTimes(enabledTimes: string[]): void {
    this.constraints.enabledTimes = [...enabledTimes];
  }

  /**
   * Clear all constraints
   */
  clearConstraints(): void {
    this.constraints = {};
  }
}
