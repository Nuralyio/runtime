/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveController, ReactiveControllerHost } from 'lit';
import { CalendarController } from '../interfaces/index.js';
import { DatePickerHost } from '../interfaces/base-controller.interface.js';
import { INavigationDate, IDayPresentation } from '../datepicker.type.js';
import { getMonthDetails } from '../core/month.helper.js';
import dayjs from 'dayjs';

/**
 * Calendar controller for managing calendar display and navigation
 * Handles month/year navigation, day generation, and calendar state
 */
export class DatePickerCalendarController implements CalendarController, ReactiveController {
  public readonly host: ReactiveControllerHost & DatePickerHost;
  public navigationDates: INavigationDate;
  public daysPresentation: IDayPresentation[] = [];

  constructor(
    host: ReactiveControllerHost & DatePickerHost,
    initialDate?: Date
  ) {
    this.host = host;
    this.host.addController(this);
    
    const current = initialDate || new Date();
    this.navigationDates = {
      start: {
        year: current.getFullYear(),
        month: current.getMonth() + 1,
        day: current.getDate(),
      },
    };
  }

  hostConnected(): void {
    this.updateCalendarDisplay();
  }

  hostDisconnected(): void {
    // Cleanup if needed
  }

  /**
   * Navigate to specific month and year
   */
  navigateToMonth(year: number, month: number): void {
    try {
      this.navigationDates.start.year = year;
      this.navigationDates.start.month = month;
      this.updateCalendarDisplay();
      this.host.requestUpdate();
    } catch (error) {
      this.handleError?.(error as Error, 'navigateToMonth');
    }
  }

  /**
   * Navigate to previous month
   */
  navigateToPreviousMonth(): void {
    try {
      let { year, month } = this.navigationDates.start;
      month--;
      if (month < 1) {
        month = 12;
        year--;
      }
      this.navigateToMonth(year, month);
    } catch (error) {
      this.handleError?.(error as Error, 'navigateToPreviousMonth');
    }
  }

  /**
   * Navigate to next month
   */
  navigateToNextMonth(): void {
    try {
      let { year, month } = this.navigationDates.start;
      month++;
      if (month > 12) {
        month = 1;
        year++;
      }
      this.navigateToMonth(year, month);
    } catch (error) {
      this.handleError?.(error as Error, 'navigateToNextMonth');
    }
  }

  /**
   * Navigate to previous year
   */
  navigateToPreviousYear(): void {
    try {
      const { year, month } = this.navigationDates.start;
      this.navigateToMonth(year - 1, month);
    } catch (error) {
      this.handleError?.(error as Error, 'navigateToPreviousYear');
    }
  }

  /**
   * Navigate to next year
   */
  navigateToNextYear(): void {
    try {
      const { year, month } = this.navigationDates.start;
      this.navigateToMonth(year + 1, month);
    } catch (error) {
      this.handleError?.(error as Error, 'navigateToNextYear');
    }
  }

  /**
   * Get current month days presentation
   */
  getCurrentMonthDays(): IDayPresentation[] {
    return this.daysPresentation;
  }

  /**
   * Check if date is in current month
   */
  isDateInCurrentMonth(date: Date): boolean {
    const { year, month } = this.navigationDates.start;
    return date.getFullYear() === year && date.getMonth() + 1 === month;
  }

  /**
   * Check if date is today
   */
  isDateToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  }

  /**
   * Check if date is selected
   */
  isDateSelected(date: Date): boolean {
    if (!this.host.value) return false;
    
    try {
      const selectedDate = this.host.parseDate(this.host.value);
      if (!selectedDate) return false;
      
      return (
        date.getFullYear() === selectedDate.getFullYear() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getDate() === selectedDate.getDate()
      );
    } catch {
      return false;
    }
  }

  /**
   * Check if date is disabled
   */
  isDateDisabled(date: Date): boolean {
    if (this.host.disabled) return true;
    
    // Check min/max dates if available
    if (this.host.minDate) {
      const minDate = this.host.parseDate(this.host.minDate);
      if (minDate && date < minDate) return true;
    }
    
    if (this.host.maxDate) {
      const maxDate = this.host.parseDate(this.host.maxDate);
      if (maxDate && date > maxDate) return true;
    }
    
    // Check disabled dates array if available
    if (this.host.disabledDates) {
      const dateString = this.host.formatDate(date);
      return this.host.disabledDates.includes(dateString);
    }
    
    return false;
  }

  /**
   * Check if date is in range (for range picker)
   */
  isDateInRange(_date: Date): boolean {
    if (!this.host.range) return false;
    
    // Implementation depends on range selection logic
    // This would need to be coordinated with DateSelectionController
    return false;
  }

  /**
   * Generate calendar days for given month and year
   */
  generateCalendarDays(year: number, month: number): IDayPresentation[] {
    try {
      const days = dayjs().localeData().weekdays();
      return getMonthDetails(year, month - 1, days);
    } catch (error) {
      this.handleError?.(error as Error, 'generateCalendarDays');
      return [];
    }
  }

  /**
   * Update calendar display with current navigation dates
   */
  updateCalendarDisplay(): void {
    try {
      const { year, month } = this.navigationDates.start;
      this.daysPresentation = this.generateCalendarDays(year, month);
      
      // Enhance days with additional state information
      this.daysPresentation = this.daysPresentation.map(day => ({
        ...day,
        isToday: this.isDateToday(new Date(day.year, day.month, day.date)),
        isSelected: this.isDateSelected(new Date(day.year, day.month, day.date)),
        isDisabled: this.isDateDisabled(new Date(day.year, day.month, day.date)),
        isInRange: this.isDateInRange(new Date(day.year, day.month, day.date)),
      }));
    } catch (error) {
      this.handleError?.(error as Error, 'updateCalendarDisplay');
    }
  }

  /**
   * Handle errors that occur within the controller
   */
  handleError(error: Error, context: string): void {
    console.error(`DatePickerCalendarController error in ${context}:`, error);
    // Dispatch custom error event if needed
    this.host.dispatchEvent(
      new CustomEvent('datepicker-error', {
        detail: { error, context, controller: 'calendar' },
        bubbles: true,
        composed: true,
      })
    );
  }
}
