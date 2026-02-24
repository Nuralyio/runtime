/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveController, ReactiveControllerHost } from 'lit';
import { DateSelectionController } from '../interfaces/index.js';
import { DatePickerHost } from '../interfaces/base-controller.interface.js';
import { DATE_PICKER_EVENTS } from '../datepicker.constant.js';

/**
 * Date selection controller for managing date selection logic
 * Handles single date, date range, and multiple date selections
 */
export class DatePickerSelectionController implements DateSelectionController, ReactiveController {
  public readonly host: ReactiveControllerHost & DatePickerHost;
  private selectedDates: Date[] = [];
  private selectedRange: { start: Date; end: Date } | null = null;

  constructor(host: ReactiveControllerHost & DatePickerHost) {
    this.host = host;
    this.host.addController(this);
  }

  hostConnected(): void {
    // Initialize selection from host value
    this.initializeFromHostValue();
  }

  hostDisconnected(): void {
    // Cleanup if needed
  }

  /**
   * Initialize selection state from host value
   */
  private initializeFromHostValue(): void {
    if (this.host.value || this.host.dateValue) {
      const dateString = this.host.value || this.host.dateValue;
      const date = this.host.parseDate(dateString);
      if (date) {
        this.selectedDates = [date];
      }
    }
  }

  /**
   * Select a single date
   */
  selectDate(date: Date): void {
    try {
      if (!this.isValidSelection(date)) {
        return;
      }

      if (this.host.range) {
        this.handleRangeSelection(date);
      } else {
        this.selectedDates = [date];
        this.updateHostValue();
        this.dispatchSelectionEvent(date);
      }

      this.host.requestUpdate();
    } catch (error) {
      this.handleError?.(error as Error, 'selectDate');
    }
  }

  /**
   * Handle range selection logic
   */
  private handleRangeSelection(date: Date): void {
    if (!this.selectedRange || this.selectedRange.end) {
      // Start new range
      this.selectedRange = { start: date, end: date };
      this.selectedDates = [date];
    } else {
      // Complete the range
      const startDate = this.selectedRange.start;
      if (date >= startDate) {
        this.selectedRange.end = date;
      } else {
        this.selectedRange = { start: date, end: startDate };
      }
      
      this.selectedDates = this.generateDateRange(this.selectedRange.start, this.selectedRange.end);
      this.dispatchRangeEvent(this.selectedRange.start, this.selectedRange.end);
    }

    this.updateHostValue();
  }

  /**
   * Generate array of dates between start and end (inclusive)
   */
  private generateDateRange(start: Date, end: Date): Date[] {
    const dates: Date[] = [];
    const current = new Date(start);
    
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  }

  /**
   * Select a date range
   */
  selectDateRange(startDate: Date, endDate: Date): void {
    try {
      if (!this.isValidSelection(startDate) || !this.isValidSelection(endDate)) {
        return;
      }

      // Ensure start is before end
      if (startDate > endDate) {
        [startDate, endDate] = [endDate, startDate];
      }

      this.selectedRange = { start: startDate, end: endDate };
      this.selectedDates = this.generateDateRange(startDate, endDate);
      
      this.updateHostValue();
      this.dispatchRangeEvent(startDate, endDate);
      this.host.requestUpdate();
    } catch (error) {
      this.handleError?.(error as Error, 'selectDateRange');
    }
  }

  /**
   * Clear all selections
   */
  clearSelection(): void {
    try {
      this.selectedDates = [];
      this.selectedRange = null;
      this.updateHostValue();
      this.host.requestUpdate();
      
      // Dispatch clear event
      this.host.dispatchEvent(
        new CustomEvent(DATE_PICKER_EVENTS.DATE_CHANGE, {
          detail: { value: '', dates: [], type: 'clear' },
          bubbles: true,
          composed: true,
        })
      );
    } catch (error) {
      this.handleError?.(error as Error, 'clearSelection');
    }
  }

  /**
   * Get selected date (single selection)
   */
  getSelectedDate(): Date | null {
    return this.selectedDates.length > 0 ? this.selectedDates[0] : null;
  }

  /**
   * Get selected date range
   */
  getSelectedDateRange(): { start: Date; end: Date } | null {
    return this.selectedRange;
  }

  /**
   * Get all selected dates
   */
  getSelectedDates(): Date[] {
    return [...this.selectedDates];
  }

  /**
   * Check if a date is selected
   */
  isDateSelected(date: Date): boolean {
    return this.selectedDates.some(selectedDate =>
      selectedDate.getFullYear() === date.getFullYear() &&
      selectedDate.getMonth() === date.getMonth() &&
      selectedDate.getDate() === date.getDate()
    );
  }

  /**
   * Check if a date selection is valid
   */
  isValidSelection(date: Date): boolean {
    // Check if date is disabled
    if (this.host.disabled) return false;
    
    // Check min/max dates
    if (this.host.minDate) {
      const minDate = this.host.parseDate(this.host.minDate);
      if (minDate && date < minDate) return false;
    }
    
    if (this.host.maxDate) {
      const maxDate = this.host.parseDate(this.host.maxDate);
      if (maxDate && date > maxDate) return false;
    }
    
    // Check disabled dates
    if (this.host.disabledDates) {
      const dateString = this.host.formatDate(date);
      if (this.host.disabledDates.includes(dateString)) return false;
    }
    
    return true;
  }

  /**
   * Format selected date as string
   */
  formatSelectedDate(): string {
    const selectedDate = this.getSelectedDate();
    return selectedDate ? this.host.formatDate(selectedDate) : '';
  }

  /**
   * Format selected range as string
   */
  formatSelectedRange(): string {
    if (!this.selectedRange) return '';
    
    const startStr = this.host.formatDate(this.selectedRange.start);
    const endStr = this.host.formatDate(this.selectedRange.end);
    
    return `${startStr} - ${endStr}`;
  }

  /**
   * Update host component value
   */
  private updateHostValue(): void {
    if (this.host.range && this.selectedRange) {
      // For range selection, update both value and dateValue
      const rangeString = this.formatSelectedRange();
      (this.host as any).value = rangeString;
      (this.host as any).dateValue = rangeString;
    } else {
      const dateString = this.formatSelectedDate();
      (this.host as any).value = dateString;
      (this.host as any).dateValue = dateString;
    }
  }

  /**
   * Dispatch single date selection event
   */
  private dispatchSelectionEvent(date: Date): void {
    this.host.dispatchEvent(
      new CustomEvent(DATE_PICKER_EVENTS.DATE_CHANGE, {
        detail: { 
          value: this.formatSelectedDate(), 
          date,
          dates: this.selectedDates,
          type: 'single'
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Dispatch range selection event
   */
  private dispatchRangeEvent(startDate: Date, endDate: Date): void {
    this.host.dispatchEvent(
      new CustomEvent(DATE_PICKER_EVENTS.RANGE_CHANGE, {
        detail: { 
          value: this.formatSelectedRange(),
          startDate,
          endDate,
          dates: this.selectedDates,
          type: 'range'
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Handle errors that occur within the controller
   */
  handleError(error: Error, context: string): void {
    console.error(`DatePickerSelectionController error in ${context}:`, error);
    this.host.dispatchEvent(
      new CustomEvent('datepicker-error', {
        detail: { error, context, controller: 'selection' },
        bubbles: true,
        composed: true,
      })
    );
  }
}
