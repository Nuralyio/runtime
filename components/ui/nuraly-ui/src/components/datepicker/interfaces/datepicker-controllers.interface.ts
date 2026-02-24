/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { DatePickerBaseController } from './base-controller.interface.js';
import { INavigationDate, IDayPresentation } from '../datepicker.types.js';

/**
 * Calendar controller interface for managing calendar display and navigation
 */
export interface CalendarController extends DatePickerBaseController {
  navigationDates: INavigationDate;
  daysPresentation: IDayPresentation[];
  
  navigateToMonth(year: number, month: number): void;
  navigateToPreviousMonth(): void;
  navigateToNextMonth(): void;
  navigateToPreviousYear(): void;
  navigateToNextYear(): void;
  
  getCurrentMonthDays(): IDayPresentation[];
  isDateInCurrentMonth(date: Date): boolean;
  isDateToday(date: Date): boolean;
  isDateSelected(date: Date): boolean;
  isDateDisabled(date: Date): boolean;
  isDateInRange(date: Date): boolean;
  
  generateCalendarDays(year: number, month: number): IDayPresentation[];
  updateCalendarDisplay(): void;
}

/**
 * Date selection controller interface
 */
export interface DateSelectionController extends DatePickerBaseController {
  selectDate(date: Date): void;
  selectDateRange(startDate: Date, endDate: Date): void;
  clearSelection(): void;
  
  getSelectedDate(): Date | null;
  getSelectedDateRange(): { start: Date; end: Date } | null;
  getSelectedDates(): Date[];
  
  isDateSelected(date: Date): boolean;
  isValidSelection(date: Date): boolean;
  
  formatSelectedDate(): string;
  formatSelectedRange(): string;
}

/**
 * Keyboard navigation controller interface
 */
export interface KeyboardController extends DatePickerBaseController {
  handleKeyDown(event: KeyboardEvent): void;
  
  navigateUp(): void;
  navigateDown(): void;
  navigateLeft(): void;
  navigateRight(): void;
  
  navigateToFirstDayOfWeek(): void;
  navigateToLastDayOfWeek(): void;
  navigateToFirstDayOfMonth(): void;
  navigateToLastDayOfMonth(): void;
  
  selectCurrentDate(): void;
  closeCalendar(): void;
}

/**
 * Focus management controller interface
 */
export interface FocusController extends DatePickerBaseController {
  setFocusedDate(date: Date): void;
  getFocusedDate(): Date | null;
  
  focus(): void;
  blur(): void;
  
  focusCalendar(): void;
  focusInput(): void;
  
  setTabIndex(element: HTMLElement, index: number): void;
  updateFocusableElements(): void;
}

/**
 * Validation controller interface
 */
export interface ValidationController extends DatePickerBaseController {
  validate(): boolean;
  reset(): void;
  
  getFormData(): { [key: string]: string };
  
  readonly isValid: boolean;
  readonly validationMessage: string;
  
  validateDate(date: Date): boolean;
  validateDateRange(startDate: Date, endDate: Date): boolean;
  validateMinMaxDate(date: Date): boolean;
  validateDisabledDates(date: Date): boolean;
  
  setValidationState(isValid: boolean, message?: string): void;
  clearValidation(): void;
}

/**
 * Calendar positioning controller interface
 */
export interface PositioningController extends DatePickerBaseController {
  positionCalendar(): void;
  updatePosition(): void;
  
  calculateOptimalPosition(): { top: number; left: number; placement: string };
  hasSpaceBelow(): boolean;
  hasSpaceAbove(): boolean;
  
  openCalendar(): void;
  closeCalendar(): void;
  toggleCalendar(): void;
  
  handleClickOutside(event: MouseEvent): void;
  handleScroll(): void;
}
