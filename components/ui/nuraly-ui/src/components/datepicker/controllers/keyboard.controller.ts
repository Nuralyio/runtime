/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveController, ReactiveControllerHost } from 'lit';
import { KeyboardController } from '../interfaces/index.js';
import { DatePickerHost } from '../interfaces/base-controller.interface.js';
import { DatePickerCalendarController } from './calendar.controller.js';
import { DatePickerSelectionController } from './selection.controller.js';
import { KEYBOARD_KEYS } from '../datepicker.constant.js';

/**
 * Keyboard navigation controller for datepicker
 * Handles keyboard interactions and navigation within the calendar
 */
export class DatePickerKeyboardController implements KeyboardController, ReactiveController {
  public readonly host: ReactiveControllerHost & DatePickerHost;
  private focusedDate: Date;

  constructor(
    host: ReactiveControllerHost & DatePickerHost,
    private calendarController: DatePickerCalendarController,
    private selectionController: DatePickerSelectionController
  ) {
    this.host = host;
    this.host.addController(this);
    this.focusedDate = new Date();
  }

  hostConnected(): void {
    // Initialize focused date
    const selectedDate = this.selectionController.getSelectedDate();
    this.focusedDate = selectedDate || new Date();
  }

  hostDisconnected(): void {
    // Cleanup if needed
  }

  /**
   * Handle keyboard events
   */
  handleKeyDown(event: KeyboardEvent): void {
    try {
      switch (event.key) {
        case KEYBOARD_KEYS.ARROW_LEFT:
          event.preventDefault();
          this.navigateLeft();
          break;
        
        case KEYBOARD_KEYS.ARROW_RIGHT:
          event.preventDefault();
          this.navigateRight();
          break;
        
        case KEYBOARD_KEYS.ARROW_UP:
          event.preventDefault();
          this.navigateUp();
          break;
        
        case KEYBOARD_KEYS.ARROW_DOWN:
          event.preventDefault();
          this.navigateDown();
          break;
        
        case KEYBOARD_KEYS.HOME:
          event.preventDefault();
          this.navigateToFirstDayOfWeek();
          break;
        
        case KEYBOARD_KEYS.END:
          event.preventDefault();
          this.navigateToLastDayOfWeek();
          break;
        
        case KEYBOARD_KEYS.PAGE_UP:
          event.preventDefault();
          if (event.shiftKey) {
            this.navigateToPreviousYear();
          } else {
            this.navigateToPreviousMonth();
          }
          break;
        
        case KEYBOARD_KEYS.PAGE_DOWN:
          event.preventDefault();
          if (event.shiftKey) {
            this.navigateToNextYear();
          } else {
            this.navigateToNextMonth();
          }
          break;
        
        case KEYBOARD_KEYS.ENTER:
        case ' ':
          event.preventDefault();
          this.selectCurrentDate();
          break;
        
        case KEYBOARD_KEYS.ESCAPE:
          event.preventDefault();
          this.closeCalendar();
          break;
        
        default:
          // Handle other keys if needed
          break;
      }
      
      this.host.requestUpdate();
    } catch (error) {
      this.handleError?.(error as Error, 'handleKeyDown');
    }
  }

  /**
   * Navigate one day left
   */
  navigateLeft(): void {
    const newDate = new Date(this.focusedDate);
    newDate.setDate(newDate.getDate() - 1);
    this.setFocusedDate(newDate);
  }

  /**
   * Navigate one day right
   */
  navigateRight(): void {
    const newDate = new Date(this.focusedDate);
    newDate.setDate(newDate.getDate() + 1);
    this.setFocusedDate(newDate);
  }

  /**
   * Navigate one week up
   */
  navigateUp(): void {
    const newDate = new Date(this.focusedDate);
    newDate.setDate(newDate.getDate() - 7);
    this.setFocusedDate(newDate);
  }

  /**
   * Navigate one week down
   */
  navigateDown(): void {
    const newDate = new Date(this.focusedDate);
    newDate.setDate(newDate.getDate() + 7);
    this.setFocusedDate(newDate);
  }

  /**
   * Navigate to first day of current week
   */
  navigateToFirstDayOfWeek(): void {
    const newDate = new Date(this.focusedDate);
    const dayOfWeek = newDate.getDay();
    newDate.setDate(newDate.getDate() - dayOfWeek);
    this.setFocusedDate(newDate);
  }

  /**
   * Navigate to last day of current week
   */
  navigateToLastDayOfWeek(): void {
    const newDate = new Date(this.focusedDate);
    const dayOfWeek = newDate.getDay();
    newDate.setDate(newDate.getDate() + (6 - dayOfWeek));
    this.setFocusedDate(newDate);
  }

  /**
   * Navigate to first day of current month
   */
  navigateToFirstDayOfMonth(): void {
    const newDate = new Date(this.focusedDate);
    newDate.setDate(1);
    this.setFocusedDate(newDate);
  }

  /**
   * Navigate to last day of current month
   */
  navigateToLastDayOfMonth(): void {
    const newDate = new Date(this.focusedDate);
    newDate.setMonth(newDate.getMonth() + 1, 0);
    this.setFocusedDate(newDate);
  }

  /**
   * Navigate to previous month
   */
  private navigateToPreviousMonth(): void {
    const newDate = new Date(this.focusedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    this.setFocusedDate(newDate);
    this.calendarController.navigateToPreviousMonth();
  }

  /**
   * Navigate to next month
   */
  private navigateToNextMonth(): void {
    const newDate = new Date(this.focusedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    this.setFocusedDate(newDate);
    this.calendarController.navigateToNextMonth();
  }

  /**
   * Navigate to previous year
   */
  private navigateToPreviousYear(): void {
    const newDate = new Date(this.focusedDate);
    newDate.setFullYear(newDate.getFullYear() - 1);
    this.setFocusedDate(newDate);
    this.calendarController.navigateToPreviousYear();
  }

  /**
   * Navigate to next year
   */
  private navigateToNextYear(): void {
    const newDate = new Date(this.focusedDate);
    newDate.setFullYear(newDate.getFullYear() + 1);
    this.setFocusedDate(newDate);
    this.calendarController.navigateToNextYear();
  }

  /**
   * Set focused date and update calendar if needed
   */
  private setFocusedDate(date: Date): void {
    this.focusedDate = date;

    // Check if we need to navigate to a different month
    const currentMonth = this.calendarController.navigationDates.start.month;
    const currentYear = this.calendarController.navigationDates.start.year;
    
    if (date.getMonth() + 1 !== currentMonth || date.getFullYear() !== currentYear) {
      this.calendarController.navigateToMonth(date.getFullYear(), date.getMonth() + 1);
    }
  }

  /**
   * Select the currently focused date
   */
  selectCurrentDate(): void {
    if (this.selectionController.isValidSelection(this.focusedDate)) {
      this.selectionController.selectDate(this.focusedDate);
    }
  }

  /**
   * Close the calendar
   */
  closeCalendar(): void {
    // This would typically be handled by a positioning controller
    // For now, we'll dispatch an event
    this.host.dispatchEvent(
      new CustomEvent('calendar-close-request', {
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Get currently focused date
   */
  getFocusedDate(): Date {
    return new Date(this.focusedDate);
  }

  /**
   * Handle errors that occur within the controller
   */
  handleError(error: Error, context: string): void {
    console.error(`DatePickerKeyboardController error in ${context}:`, error);
    this.host.dispatchEvent(
      new CustomEvent('datepicker-error', {
        detail: { error, context, controller: 'keyboard' },
        bubbles: true,
        composed: true,
      })
    );
  }
}
