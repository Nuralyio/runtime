/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { TimeValue, TimeFormat, TimePeriod } from '../timepicker.types.js';
import { TimePickerHost, TimeFormattingController } from '../interfaces/timepicker.interface.js';
import { TimeUtils } from '../utils/time.utils.js';
import { 
  DEFAULT_TIME_FORMAT, 
  DEFAULT_TIME_FORMAT_WITH_SECONDS,
  DEFAULT_12H_TIME_FORMAT,
  DEFAULT_12H_TIME_FORMAT_WITH_SECONDS
} from '../timepicker.constants.js';

/**
 * Controller for handling time formatting logic
 */
export class TimePickerFormattingController implements TimeFormattingController {
  constructor(private host: TimePickerHost) {}

  /**
   * Format time for display (user-facing format)
   */
  formatForDisplay(time: TimeValue): string {
    const config = this.host.getConfig();
    return TimeUtils.formatTimeValue(time, config.format, config.showSeconds);
  }

  /**
   * Format time for input field value
   */
  formatForInput(time: TimeValue): string {
    // Input format is typically the same as display format
    return this.formatForDisplay(time);
  }

  /**
   * Parse input value to TimeValue
   */
  parseInputValue(value: string): TimeValue | null {
    const config = this.host.getConfig();
    return TimeUtils.parseTimeString(value, config.format);
  }

  /**
   * Get time format pattern for the current configuration
   */
  getFormatPattern(): string {
    const config = this.host.getConfig();
    
    if (config.format === TimeFormat.TwelveHour) {
      return config.showSeconds ? DEFAULT_12H_TIME_FORMAT_WITH_SECONDS : DEFAULT_12H_TIME_FORMAT;
    } else {
      return config.showSeconds ? DEFAULT_TIME_FORMAT_WITH_SECONDS : DEFAULT_TIME_FORMAT;
    }
  }

  /**
   * Get placeholder text for input field
   */
  getPlaceholder(): string {
    const config = this.host.getConfig();
    
    if (config.format === TimeFormat.TwelveHour) {
      return config.showSeconds ? 'hh:mm:ss AM/PM' : 'hh:mm AM/PM';
    } else {
      return config.showSeconds ? 'HH:mm:ss' : 'HH:mm';
    }
  }

  /**
   * Format time component with leading zeros
   */
  formatTimeComponent(value: number, length: number = 2): string {
    return value.toString().padStart(length, '0');
  }

  /**
   * Format hours based on current format
   */
  formatHours(hours: number): string {
    const config = this.host.getConfig();
    
    if (config.format === TimeFormat.TwelveHour) {
      let displayHours = hours;
      if (displayHours === 0) {
        displayHours = 12;
      } else if (displayHours > 12) {
        displayHours -= 12;
      }
      return displayHours.toString();
    } else {
      return this.formatTimeComponent(hours);
    }
  }

  /**
   * Format minutes with leading zero
   */
  formatMinutes(minutes: number): string {
    return this.formatTimeComponent(minutes);
  }

  /**
   * Format seconds with leading zero
   */
  formatSeconds(seconds: number): string {
    return this.formatTimeComponent(seconds);
  }

  /**
   * Get period (AM/PM) for 12-hour format
   */
  getPeriod(hours: number): TimePeriod {
    return hours >= 12 ? TimePeriod.PM : TimePeriod.AM;
  }

  /**
   * Format time parts separately
   */
  formatTimeParts(time: TimeValue): {
    hours: string;
    minutes: string;
    seconds: string;
    period?: TimePeriod;
  } {
    const config = this.host.getConfig();
    
    return {
      hours: this.formatHours(time.hours),
      minutes: this.formatMinutes(time.minutes),
      seconds: this.formatSeconds(time.seconds),
      period: config.format === TimeFormat.TwelveHour ? this.getPeriod(time.hours) : undefined,
    };
  }

  /**
   * Parse time parts from string
   */
  parseTimeParts(timeString: string): {
    hours?: number;
    minutes?: number;
    seconds?: number;
    period?: TimePeriod;
  } | null {
    const config = this.host.getConfig();
    const parsedTime = TimeUtils.parseTimeString(timeString, config.format);
    
    if (!parsedTime) {
      return null;
    }

    return {
      hours: parsedTime.hours,
      minutes: parsedTime.minutes,
      seconds: parsedTime.seconds,
      period: config.format === TimeFormat.TwelveHour ? this.getPeriod(parsedTime.hours) : undefined,
    };
  }

  /**
   * Get time separator character
   */
  getTimeSeparator(): string {
    return ':';
  }

  /**
   * Check if format is valid
   */
  isValidFormat(_format: string): boolean {
    const testTime = TimeUtils.createTimeValue(12, 30, 45);
    try {
      const formatted = this.formatForDisplay(testTime);
      const parsed = this.parseInputValue(formatted);
      return parsed !== null;
    } catch {
      return false;
    }
  }

  /**
   * Get format examples
   */
  getFormatExamples(): string[] {
    const config = this.host.getConfig();
    const exampleTimes = [
      TimeUtils.createTimeValue(9, 15, 0),
      TimeUtils.createTimeValue(14, 30, 45),
      TimeUtils.createTimeValue(23, 59, 59),
    ];

    return exampleTimes.map(time => TimeUtils.formatTimeValue(time, config.format, config.showSeconds));
  }

  /**
   * Convert between formats
   */
  convertFormat(timeString: string, fromFormat: TimeFormat, toFormat: TimeFormat): string | null {
    const parsedTime = TimeUtils.parseTimeString(timeString, fromFormat);
    if (!parsedTime) {
      return null;
    }

    const config = this.host.getConfig();
    return TimeUtils.formatTimeValue(parsedTime, toFormat, config.showSeconds);
  }

  /**
   * Get human-readable time description
   */
  getTimeDescription(time: TimeValue): string {
    const config = this.host.getConfig();
    const formatted = TimeUtils.formatTimeValue(time, config.format, config.showSeconds);
    
    // Add contextual information
    const now = TimeUtils.getCurrentTime();
    const comparison = TimeUtils.compareTime(time, now);
    
    if (comparison === 0) {
      return `${formatted} (now)`;
    } else if (comparison > 0) {
      return `${formatted} (future)`;
    } else {
      return `${formatted} (past)`;
    }
  }
}
