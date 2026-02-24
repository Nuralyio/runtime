/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveController, ReactiveControllerHost } from 'lit';
import { PositioningController } from '../interfaces/index.js';
import { DatePickerHost } from '../interfaces/base-controller.interface.js';
import { DATE_PICKER_EVENTS, CALENDAR_Z_INDEX } from '../datepicker.constant.js';

/**
 * Positioning controller for datepicker calendar
 * Handles calendar positioning, opening, closing, and click outside detection
 */
export class DatePickerPositioningController implements PositioningController, ReactiveController {
  public readonly host: ReactiveControllerHost & DatePickerHost;
  private isCalendarOpen = false;
  private clickOutsideHandler?: (event: MouseEvent) => void;
  private scrollHandler?: () => void;

  constructor(host: ReactiveControllerHost & DatePickerHost) {
    this.host = host;
    this.host.addController(this);
  }

  hostConnected(): void {
    this.setupEventListeners();
  }

  hostDisconnected(): void {
    this.cleanupEventListeners();
  }

  /**
   * Setup global event listeners
   */
  private setupEventListeners(): void {
    this.clickOutsideHandler = this.handleClickOutside.bind(this);
    this.scrollHandler = this.handleScroll.bind(this);
    
    document.addEventListener('click', this.clickOutsideHandler);
    document.addEventListener('scroll', this.scrollHandler);
    window.addEventListener('resize', this.scrollHandler);
  }

  /**
   * Cleanup global event listeners
   */
  private cleanupEventListeners(): void {
    if (this.clickOutsideHandler) {
      document.removeEventListener('click', this.clickOutsideHandler);
    }
    if (this.scrollHandler) {
      document.removeEventListener('scroll', this.scrollHandler);
      window.removeEventListener('resize', this.scrollHandler);
    }
  }

  /**
   * Position the calendar relative to the input
   */
  async positionCalendar(): Promise<void> {
    if (!this.isCalendarOpen) return;

    try {
      await this.host.requestUpdate();
      await new Promise(resolve => setTimeout(resolve, 0)); // Wait for DOM update

      const hostElement = this.host as any;
      const dateInput = hostElement.shadowRoot?.querySelector('#date-input');
      const calendarContainer = hostElement.shadowRoot?.querySelector('.calendar-container');

      if (!dateInput || !calendarContainer) return;

      const position = this.calculateOptimalPosition();
      
      calendarContainer.style.position = 'fixed';
      calendarContainer.style.top = `${position.top}px`;
      calendarContainer.style.left = `${position.left}px`;
      calendarContainer.style.zIndex = String(CALENDAR_Z_INDEX);
      
      // Add placement class for styling
      calendarContainer.classList.remove('placement-top', 'placement-bottom');
      calendarContainer.classList.add(`placement-${position.placement}`);
    } catch (error) {
      this.handleError?.(error as Error, 'positionCalendar');
    }
  }

  /**
   * Update calendar position
   */
  updatePosition(): void {
    if (this.isCalendarOpen) {
      this.positionCalendar();
    }
  }

  /**
   * Calculate optimal position for calendar
   */
  calculateOptimalPosition(): { top: number; left: number; placement: string } {
    const hostElement = this.host as any;
    const dateInput = hostElement.shadowRoot?.querySelector('#date-input');
    const calendarContainer = hostElement.shadowRoot?.querySelector('.calendar-container');

    if (!dateInput || !calendarContainer) {
      return { top: 0, left: 0, placement: 'bottom' };
    }

    const inputRect = dateInput.getBoundingClientRect();
    const calendarRect = calendarContainer.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    let top = inputRect.bottom;
    let left = inputRect.left;
    let placement = 'bottom';

    // Check if there's enough space below
    if (inputRect.bottom + calendarRect.height > viewportHeight && this.hasSpaceAbove()) {
      top = inputRect.top - calendarRect.height;
      placement = 'top';
    }

    // Ensure calendar doesn't overflow horizontally
    if (left + calendarRect.width > viewportWidth) {
      left = viewportWidth - calendarRect.width - 10; // 10px margin
    }

    // Ensure calendar doesn't go off-screen to the left
    if (left < 10) {
      left = 10;
    }

    return { top, left, placement };
  }

  /**
   * Check if there's space below the input
   */
  hasSpaceBelow(): boolean {
    const hostElement = this.host as any;
    const dateInput = hostElement.shadowRoot?.querySelector('#date-input');
    const calendarContainer = hostElement.shadowRoot?.querySelector('.calendar-container');

    if (!dateInput || !calendarContainer) return false;

    const inputRect = dateInput.getBoundingClientRect();
    const calendarHeight = calendarContainer.getBoundingClientRect().height;
    const availableSpace = window.innerHeight - inputRect.bottom;

    return availableSpace >= calendarHeight;
  }

  /**
   * Check if there's space above the input
   */
  hasSpaceAbove(): boolean {
    const hostElement = this.host as any;
    const dateInput = hostElement.shadowRoot?.querySelector('#date-input');
    const calendarContainer = hostElement.shadowRoot?.querySelector('.calendar-container');

    if (!dateInput || !calendarContainer) return false;

    const inputRect = dateInput.getBoundingClientRect();
    const calendarHeight = calendarContainer.getBoundingClientRect().height;

    return inputRect.top >= calendarHeight;
  }

  /**
   * Open the calendar
   */
  openCalendar(): void {
    try {
      this.isCalendarOpen = true;
      (this.host as any).openedCalendar = true;
      
      // Position calendar after DOM update
      requestAnimationFrame(() => {
        this.positionCalendar();
      });

      this.host.dispatchEvent(
        new CustomEvent(DATE_PICKER_EVENTS.CALENDAR_OPEN, {
          bubbles: true,
          composed: true,
        })
      );

      this.host.requestUpdate();
    } catch (error) {
      this.handleError?.(error as Error, 'openCalendar');
    }
  }

  /**
   * Close the calendar
   */
  closeCalendar(): void {
    try {
      this.isCalendarOpen = false;
      (this.host as any).openedCalendar = false;

      this.host.dispatchEvent(
        new CustomEvent(DATE_PICKER_EVENTS.CALENDAR_CLOSE, {
          bubbles: true,
          composed: true,
        })
      );

      this.host.requestUpdate();
    } catch (error) {
      this.handleError?.(error as Error, 'closeCalendar');
    }
  }

  /**
   * Toggle calendar open/close state
   */
  toggleCalendar(): void {
    if (this.isCalendarOpen) {
      this.closeCalendar();
    } else {
      this.openCalendar();
    }
  }

  /**
   * Handle click outside calendar
   */
  handleClickOutside(event: MouseEvent): void {
    if (!this.isCalendarOpen) return;

    const hostElement = this.host as any;
    const composedPath = event.composedPath();
    
    // Check if click was inside the host element
    if (!composedPath.includes(hostElement)) {
      this.closeCalendar();
    }
  }

  /**
   * Handle scroll events
   */
  handleScroll(): void {
    if (this.isCalendarOpen) {
      // Reposition calendar on scroll
      requestAnimationFrame(() => {
        this.positionCalendar();
      });
    }
  }

  /**
   * Check if calendar is currently open
   */
  get isOpen(): boolean {
    return this.isCalendarOpen;
  }

  /**
   * Handle errors that occur within the controller
   */
  handleError(error: Error, context: string): void {
    console.error(`DatePickerPositioningController error in ${context}:`, error);
    this.host.dispatchEvent(
      new CustomEvent('datepicker-error', {
        detail: { error, context, controller: 'positioning' },
        bubbles: true,
        composed: true,
      })
    );
  }
}
