/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { TimeValue, TimePeriod, TimeFormat } from '../timepicker.types.js';
import { TIME_BOUNDARIES } from '../timepicker.constants.js';

/**
 * Time utility functions for time picker component
 */
export class TimeUtils {
  /**
   * Create a new TimeValue object
   */
  static createTimeValue(hours: number, minutes: number, seconds: number = 0, period?: TimePeriod): TimeValue {
    return {
      hours: Math.max(0, Math.min(hours, 23)),
      minutes: Math.max(0, Math.min(minutes, 59)),
      seconds: Math.max(0, Math.min(seconds, 59)),
      period,
    };
  }

  /**
   * Parse time string to TimeValue
   */
  static parseTimeString(timeString: string, format: TimeFormat = TimeFormat.TwentyFourHour): TimeValue | null {
    if (!timeString?.trim()) {
      return null;
    }

    const cleanTime = timeString.trim().toUpperCase();

    if (format === TimeFormat.TwelveHour) {
      return this.parse12HourTime(cleanTime);
    } else {
      return this.parse24HourTime(cleanTime);
    }
  }

  /**
   * Parse 24-hour format time string
   */
  private static parse24HourTime(timeString: string): TimeValue | null {
    const match = timeString.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    
    if (!match) {
      return null;
    }

    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const seconds = match[3] ? parseInt(match[3], 10) : 0;

    if (!this.isValidTime24(hours, minutes, seconds)) {
      return null;
    }

    return this.createTimeValue(hours, minutes, seconds);
  }

  /**
   * Parse 12-hour format time string
   */
  private static parse12HourTime(timeString: string): TimeValue | null {
    const match = timeString.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s?(AM|PM)$/);
    
    if (!match) {
      return null;
    }

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const seconds = match[3] ? parseInt(match[3], 10) : 0;
    const period = match[4] as TimePeriod;

    if (!this.isValidTime12(hours, minutes, seconds)) {
      return null;
    }

    // Convert to 24-hour format for internal storage
    if (period === TimePeriod.PM && hours !== 12) {
      hours += 12;
    } else if (period === TimePeriod.AM && hours === 12) {
      hours = 0;
    }

    return this.createTimeValue(hours, minutes, seconds, period);
  }

  /**
   * Format TimeValue to string
   */
  static formatTimeValue(time: TimeValue, format: TimeFormat = TimeFormat.TwentyFourHour, showSeconds: boolean = false): string {
    if (!time) {
      return '';
    }

    if (format === TimeFormat.TwelveHour) {
      return this.format12HourTime(time, showSeconds);
    } else {
      return this.format24HourTime(time, showSeconds);
    }
  }

  /**
   * Format time in 24-hour format
   */
  private static format24HourTime(time: TimeValue, showSeconds: boolean): string {
    const hours = time.hours.toString().padStart(2, '0');
    const minutes = time.minutes.toString().padStart(2, '0');
    
    if (showSeconds) {
      const seconds = time.seconds.toString().padStart(2, '0');
      return `${hours}:${minutes}:${seconds}`;
    }
    
    return `${hours}:${minutes}`;
  }

  /**
   * Format time in 12-hour format
   */
  private static format12HourTime(time: TimeValue, showSeconds: boolean): string {
    let hours = time.hours;
    const minutes = time.minutes.toString().padStart(2, '0');
    const period = hours >= 12 ? TimePeriod.PM : TimePeriod.AM;

    // Convert to 12-hour format
    if (hours === 0) {
      hours = 12;
    } else if (hours > 12) {
      hours -= 12;
    }

    const hoursStr = hours.toString();
    
    if (showSeconds) {
      const seconds = time.seconds.toString().padStart(2, '0');
      return `${hoursStr}:${minutes}:${seconds} ${period}`;
    }
    
    return `${hoursStr}:${minutes} ${period}`;
  }

  /**
   * Get current time as TimeValue
   */
  static getCurrentTime(): TimeValue {
    const now = new Date();
    return this.createTimeValue(
      now.getHours(),
      now.getMinutes(),
      now.getSeconds()
    );
  }

  /**
   * Compare two TimeValue objects
   */
  static compareTime(time1: TimeValue, time2: TimeValue): number {
    const totalSeconds1 = time1.hours * 3600 + time1.minutes * 60 + time1.seconds;
    const totalSeconds2 = time2.hours * 3600 + time2.minutes * 60 + time2.seconds;
    return totalSeconds1 - totalSeconds2;
  }

  /**
   * Check if two TimeValue objects are equal
   */
  static isTimeEqual(time1: TimeValue, time2: TimeValue): boolean {
    return this.compareTime(time1, time2) === 0;
  }

  /**
   * Validate 24-hour time components
   */
  private static isValidTime24(hours: number, minutes: number, seconds: number = 0): boolean {
    return (
      hours >= TIME_BOUNDARIES.MIN_HOUR_24 && 
      hours <= TIME_BOUNDARIES.MAX_HOUR_24 &&
      minutes >= TIME_BOUNDARIES.MIN_MINUTE && 
      minutes <= TIME_BOUNDARIES.MAX_MINUTE &&
      seconds >= TIME_BOUNDARIES.MIN_SECOND && 
      seconds <= TIME_BOUNDARIES.MAX_SECOND
    );
  }

  /**
   * Validate 12-hour time components
   */
  private static isValidTime12(hours: number, minutes: number, seconds: number = 0): boolean {
    return (
      hours >= TIME_BOUNDARIES.MIN_HOUR_12 && 
      hours <= TIME_BOUNDARIES.MAX_HOUR_12 &&
      minutes >= TIME_BOUNDARIES.MIN_MINUTE && 
      minutes <= TIME_BOUNDARIES.MAX_MINUTE &&
      seconds >= TIME_BOUNDARIES.MIN_SECOND && 
      seconds <= TIME_BOUNDARIES.MAX_SECOND
    );
  }

  /**
   * Add time to a TimeValue
   */
  static addTime(time: TimeValue, hoursToAdd: number, minutesToAdd: number, secondsToAdd: number = 0): TimeValue {
    let totalSeconds = time.hours * 3600 + time.minutes * 60 + time.seconds;
    totalSeconds += hoursToAdd * 3600 + minutesToAdd * 60 + secondsToAdd;

    // Handle overflow/underflow
    totalSeconds = ((totalSeconds % 86400) + 86400) % 86400;

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return this.createTimeValue(hours, minutes, seconds);
  }

  /**
   * Generate time options for dropdowns
   */
  static generateTimeOptions(interval: number = 15, format: TimeFormat = TimeFormat.TwentyFourHour, showSeconds: boolean = false): Array<{value: string, label: string}> {
    const options: Array<{value: string, label: string}> = [];
    
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const timeValue = this.createTimeValue(hour, minute, 0);
        const formatted = this.formatTimeValue(timeValue, format, showSeconds);
        options.push({
          value: formatted,
          label: formatted,
        });
      }
    }

    return options;
  }

  /**
   * Round time to nearest interval
   */
  static roundToInterval(time: TimeValue, intervalMinutes: number): TimeValue {
    const totalMinutes = time.hours * 60 + time.minutes;
    const roundedMinutes = Math.round(totalMinutes / intervalMinutes) * intervalMinutes;
    
    const hours = Math.floor(roundedMinutes / 60) % 24;
    const minutes = roundedMinutes % 60;

    return this.createTimeValue(hours, minutes, time.seconds);
  }

  /**
   * Check if time is within range
   */
  static isTimeInRange(time: TimeValue, minTime: TimeValue | null, maxTime: TimeValue | null): boolean {
    if (minTime && this.compareTime(time, minTime) < 0) {
      return false;
    }
    
    if (maxTime && this.compareTime(time, maxTime) > 0) {
      return false;
    }

    return true;
  }

  /**
   * Convert Date object to TimeValue
   */
  static dateToTimeValue(date: Date): TimeValue {
    return this.createTimeValue(
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    );
  }

  /**
   * Convert TimeValue to Date object (using current date)
   */
  static timeValueToDate(time: TimeValue, baseDate?: Date): Date {
    const date = baseDate ? new Date(baseDate) : new Date();
    date.setHours(time.hours, time.minutes, time.seconds, 0);
    return date;
  }
}
