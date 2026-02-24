/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { TimeValue } from '../timepicker.types.js';
import { TimePickerHost, TimeSelectionController } from '../interfaces/timepicker.interface.js';
import { TimeUtils } from '../utils/time.utils.js';
import { TIME_PICKER_EVENTS } from '../timepicker.types.js';

/**
 * Controller for handling time selection logic
 */
export class TimePickerSelectionController implements TimeSelectionController {
  private selectedTime: TimeValue | null = null;

  constructor(private host: TimePickerHost) {}

  /**
   * Select a time value
   */
  selectTime(time: TimeValue): void {
    if (!this.host.validateTime(time)) {
      return;
    }

    const previousTime = this.selectedTime;
    this.selectedTime = { ...time };

    // Dispatch time change event
    this.dispatchTimeChangeEvent(time, previousTime);
    
    // Request host update
    this.host.requestUpdate();
  }

  /**
   * Get currently selected time
   */
  getSelectedTime(): TimeValue | null {
    return this.selectedTime ? { ...this.selectedTime } : null;
  }

  /**
   * Clear current selection
   */
  clearSelection(): void {
    const previousTime = this.selectedTime;
    this.selectedTime = null;

    if (previousTime) {
      this.dispatchTimeChangeEvent(null, previousTime);
      this.host.requestUpdate();
    }
  }

  /**
   * Check if a time is currently selected
   */
  isTimeSelected(time: TimeValue): boolean {
    if (!this.selectedTime) {
      return false;
    }

    return TimeUtils.isTimeEqual(time, this.selectedTime);
  }

  /**
   * Set time without triggering events (for internal use)
   */
  setTimeInternal(time: TimeValue | null): void {
    this.selectedTime = time ? { ...time } : null;
  }

  /**
   * Update selected time with partial values
   */
  updateTime(updates: Partial<TimeValue>): void {
    if (!this.selectedTime) {
      // Create new time with current time as base
      const currentTime = TimeUtils.getCurrentTime();
      this.selectedTime = {
        ...currentTime,
        ...updates,
      };
    } else {
      // Update existing time
      this.selectedTime = {
        ...this.selectedTime,
        ...updates,
      };
    }

    if (this.host.validateTime(this.selectedTime)) {
      this.dispatchTimeChangeEvent(this.selectedTime, null);
      this.host.requestUpdate();
    }
  }

  /**
   * Increment time component
   */
  incrementTime(component: 'hours' | 'minutes' | 'seconds', step: number = 1): void {
    if (!this.selectedTime) {
      this.selectedTime = TimeUtils.getCurrentTime();
    }

    let newTime: TimeValue;

    switch (component) {
      case 'hours':
        newTime = TimeUtils.addTime(this.selectedTime, step, 0, 0);
        break;
      case 'minutes':
        newTime = TimeUtils.addTime(this.selectedTime, 0, step, 0);
        break;
      case 'seconds':
        newTime = TimeUtils.addTime(this.selectedTime, 0, 0, step);
        break;
      default:
        return;
    }

    this.selectTime(newTime);
  }

  /**
   * Decrement time component
   */
  decrementTime(component: 'hours' | 'minutes' | 'seconds', step: number = 1): void {
    this.incrementTime(component, -step);
  }

  /**
   * Set time from formatted string
   */
  setTimeFromString(timeString: string): boolean {
    const config = this.host.getConfig();
    const parsedTime = TimeUtils.parseTimeString(timeString, config.format);

    if (parsedTime && this.host.validateTime(parsedTime)) {
      this.selectTime(parsedTime);
      return true;
    }

    return false;
  }

  /**
   * Get formatted time string
   */
  getFormattedTime(): string {
    if (!this.selectedTime) {
      return '';
    }

    return this.host.formatTime(this.selectedTime);
  }

  /**
   * Dispatch time change event
   */
  private dispatchTimeChangeEvent(newTime: TimeValue | null, previousTime: TimeValue | null): void {
    const hostElement = this.host as any;
    
    if (!hostElement.dispatchEvent) {
      return;
    }

    const detail = {
      value: newTime ? this.host.formatTime(newTime) : '',
      timeValue: newTime,
      previousValue: previousTime ? this.host.formatTime(previousTime) : '',
      previousTimeValue: previousTime,
    };

    const event = new CustomEvent(TIME_PICKER_EVENTS.TIME_CHANGE, {
      detail,
      bubbles: true,
      composed: true,
    });

    hostElement.dispatchEvent(event);
  }

  /**
   * Reset to initial/default time
   */
  reset(): void {
    this.clearSelection();
  }

  /**
   * Set time to current time
   */
  setToCurrentTime(): void {
    const currentTime = TimeUtils.getCurrentTime();
    this.selectTime(currentTime);
  }

  /**
   * Round current time to nearest interval
   */
  roundToInterval(intervalMinutes: number): void {
    if (!this.selectedTime) {
      return;
    }

    const roundedTime = TimeUtils.roundToInterval(this.selectedTime, intervalMinutes);
    this.selectTime(roundedTime);
  }
}
