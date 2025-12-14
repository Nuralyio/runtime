/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html, nothing, PropertyValues, TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { choose } from 'lit/directives/choose.js';
import { classMap } from 'lit/directives/class-map.js';
import { NuralyUIBaseMixin } from '@nuralyui/common/mixins';
import { styles } from './datepicker.style.js';
import {
  DatePickerMode,
  DatePickerType,
  DatePickerSize,
  DatePickerVariant,
  DatePickerPlacement,
  INavigationDate,
  IDayPresentation,
  DatePickerState,
} from './datepicker.types.js';
import {
  DEFAULT_DATE_FORMAT,
  DEFAULT_LOCALE,
  INPUT_FIELD_ID,
  CALENDAR_CONTAINER_CLASS,
  DATE_PICKER_EVENTS,
} from './datepicker.constant.js';
import {
  DatePickerCalendarController,
  DatePickerSelectionController,
  DatePickerKeyboardController,
  DatePickerPositioningController,
} from './controllers/index.js';
import { SharedDropdownController } from '@nuralyui/common/controllers';
import { DatePickerHost } from './interfaces/base-controller.interface.js';
import dayjs from 'dayjs';
import { renderMonthsTemplate } from './templates/months.template.js';
import { renderYearsTemplate } from './templates/years.template.js';
import { renderDays } from './templates/days.template.js';

import { capitalizeFirstLetter } from './utils/string.helper.js';
import './utils/locale.helper.js';
import { INPUT_STATE } from '../input/input.types.js';

/**
 * HyDatePicker - A comprehensive date picker component
 * 
 * @element nr-datepicker
 * 
 * @fires nr-date-change - Fired when a date is selected
 * @fires nr-range-change - Fired when a date range is selected
 * @fires nr-calendar-open - Fired when calendar is opened
 * @fires nr-calendar-close - Fired when calendar is closed
 * @fires nr-focus - Fired when component receives focus
 * @fires nr-blur - Fired when component loses focus
 * @fires nr-validation - Fired when validation state changes
 * 
 * @slot label - Label content for the input field
 * @slot helper-text - Helper text content below the input field
 * @slot icon - Icon content for the input field
 * 
 * @csspart input - The input field part
 * @csspart calendar - The calendar container part
 * @csspart header - The calendar header part
 * @csspart days - The days grid part
 * @csspart day - Individual day cell part
 * @csspart months - The months grid part
 * @csspart years - The years grid part
 * 
 * @example
 * ```html
 * <nr-datepicker 
 *   label="Select Date"
 *   field-format="DD/MM/YYYY"
 *   @nr-date-change="${this.handleDateChange}">
 * </nr-datepicker>
 * ```
 * 
 * @example Range picker
 * ```html
 * <nr-datepicker 
 *   range
 *   label="Select Date Range"
 *   @nr-range-change="${this.handleRangeChange}">
 * </nr-datepicker>
 * ```
 */
@customElement('nr-datepicker')
export class HyDatePickerElement extends NuralyUIBaseMixin(LitElement) implements DatePickerHost {
  static override styles = styles;
  override requiredComponents = ['nr-input', 'nr-button', 'nr-icon', 'hy-select'];

  // Controllers - following the delegation pattern
  private calendarController = new DatePickerCalendarController(this);
  private selectionController = new DatePickerSelectionController(this);
  private keyboardController = new DatePickerKeyboardController(this, this.calendarController, this.selectionController);
  private positioningController = new DatePickerPositioningController(this);
  private dropdownController = new SharedDropdownController(this);

  // Core properties following the architecture pattern
  @property({ type: String }) name = '';
  @property({ type: String }) value = '';
  @property({ type: String, attribute: 'date-value' }) dateValue = '';
  @property({ type: String, attribute: 'default-value' }) defaultValue = '';
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) required = false;
  @property({ type: String }) locale = DEFAULT_LOCALE;
  @property({ type: String, attribute: 'field-format' }) fieldFormat = DEFAULT_DATE_FORMAT;

  // Date picker specific properties
  @property({ type: Boolean }) range = false;
  @property({ type: String, attribute: 'min-date' }) minDate?: string;
  @property({ type: String, attribute: 'max-date' }) maxDate?: string;
  @property({ type: Array, attribute: 'disabled-dates' }) disabledDates?: string[];

  // UI properties
  @property({ type: String }) type: DatePickerType = DatePickerType.Single;
  @property({ type: String }) size: DatePickerSize = DatePickerSize.Medium;
  @property({ type: String }) variant: DatePickerVariant = DatePickerVariant.Default;
  @property({ type: String }) placement: DatePickerPlacement = DatePickerPlacement.Auto;
  @property({ type: String }) label = '';
  @property({ type: String }) helper = '';
  @property({ type: String }) placeholder = '';
  @property({ type: String }) state: DatePickerState | INPUT_STATE = INPUT_STATE.Default;
  @property({ type: Boolean, attribute: 'use-select-dropdowns' }) useSelectDropdowns = false;

  // Calendar state
  @property({ reflect: true, type: Boolean, attribute: 'opened-calendar' }) openedCalendar = false;
  @property({ type: String }) mode: DatePickerMode = DatePickerMode.Day;
  


  // Internal state  
  @state() private currentMode: DatePickerMode = DatePickerMode.Day;
  @state() private monthsShort = dayjs().localeData().monthsShort();
  @state() private months = dayjs().localeData().months();
  @state() private days = dayjs().localeData().weekdays();
  @state() private weekdaysShort = dayjs().localeData().weekdaysShort();
  @state() private inputFieldValue = '';
  @state() private currentYear = new Date().getFullYear();
  @state() private currentMonth = new Date().getMonth() + 1;
  @state() private currentDay = new Date().getDate();
  @state() private endYear?: number;
  @state() private endMonth?: number;
  @state() private endDay?: number;

  // Navigation dates for calendar display
  @state() navigationDates: INavigationDate = {
    start: {
      year: this.currentYear,
      month: this.currentMonth,
      day: this.currentDay,
    },
  };

  // Query selectors
  @query(`#${INPUT_FIELD_ID}`) dateInput!: HTMLElement;
  @query(`.${CALENDAR_CONTAINER_CLASS}`) calendarContainer!: HTMLElement;

  // Component constants
  private readonly INPUT_TYPE = 'calendar';

  override connectedCallback(): void {
    super.connectedCallback();
    this.initializeComponent();
    
    // Add dropdown selection event listeners
    this.addEventListener('month-selected', this.handleMonthSelected.bind(this));
    this.addEventListener('year-selected', this.handleYearSelected.bind(this));
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    // Controllers handle their own cleanup
  }

  override firstUpdated(_changedProperties: PropertyValues): void {
    super.firstUpdated(_changedProperties);
    this.initializeRangeIfNeeded();
    this.updateInputField();
    this.setupDropdownController();
  }

  private setupDropdownController(): void {
    // The dropdown controller will be set up dynamically when needed
    // since we have multiple dropdowns (month and year)
  }

  override willUpdate(changedProperties: PropertyValues): void {
    super.willUpdate(changedProperties);
    this.handlePropertyChanges(changedProperties);
  }

  /**
   * Initialize component state
   */
  private initializeComponent(): void {
    // Set up event listeners for calendar close requests
    this.addEventListener('calendar-close-request', () => {
      this.positioningController.closeCalendar();
    });
  }

  /**
   * Initialize range properties if range mode is enabled
   */
  private initializeRangeIfNeeded(): void {
    if (this.range) {
      this.endYear = this.currentYear;
      this.endMonth = this.currentMonth;
      this.endDay = this.currentDay;
    }
  }

  /**
   * Handle property changes with proper delegation
   */
  private handlePropertyChanges(changedProperties: PropertyValues): void {
    if (changedProperties.has('fieldFormat')) {
      this.updateInputField();
    }

    if (changedProperties.has('openedCalendar') && this.openedCalendar) {
      this.calendarController.updateCalendarDisplay();
      // Calendar positioning is now handled by SharedDropdownController in openCalendar()
    }

    if (changedProperties.has('dateValue') && this.dateValue) {
      this.handleDateValueChange();
    }

    if (this.hasDatePropertiesChanged(changedProperties)) {
      this.updateInputField();
      this.dispatchDateChange();
    }

    if (changedProperties.has('locale')) {
      this.updateLocale(this.locale);
    }
  }

  /**
   * Check if date-related properties have changed
   */
  private hasDatePropertiesChanged(changedProperties: PropertyValues): boolean {
    return (
      (changedProperties.has('currentDay') && changedProperties.get('currentDay')) ||
      (changedProperties.has('currentMonth') && changedProperties.get('currentMonth')) ||
      (changedProperties.has('currentYear') && changedProperties.get('currentYear'))
    );
  }

  /**
   * Handle date value change
   */
  private handleDateValueChange(): void {
    const dateObj = dayjs(this.dateValue, this.fieldFormat, true);
    if (dateObj.isValid()) {
      const { years, months, date } = dateObj.toObject();
      this.currentYear = years;
      this.currentMonth = months + 1;
      this.currentDay = date;
      this.navigationDates = {
        ...this.navigationDates,
        start: { year: years, month: months + 1, day: date },
      };
    }
  }

  // DatePickerHost interface implementation
  getCurrentDate(): Date {
    return new Date(this.currentYear, this.currentMonth - 1, this.currentDay);
  }

  formatDate(date: Date): string {
    return dayjs(date).format(this.fieldFormat);
  }

  parseDate(dateString: string): Date | null {
    const parsed = dayjs(dateString, this.fieldFormat, true);
    return parsed.isValid() ? parsed.toDate() : null;
  }

  // Delegation methods - following the architecture pattern

  /**
   * Get currently selected date - DELEGATES to selection controller
   */
  getSelectedDate(): Date | null {
    return this.selectionController.getSelectedDate();
  }

  /**
   * Select a date - DELEGATES to selection controller
   */
  selectDate(date: Date): void {
    this.selectionController.selectDate(date);
  }

  /**
   * Clear selection - DELEGATES to selection controller
   */
  clearSelection(): void {
    this.selectionController.clearSelection();
  }

  /**
   * Open calendar - DELEGATES to dropdown controller for better positioning
   */
  openCalendar(): void {
    console.log('openCalendar called');
    this.openedCalendar = true;
    this.requestUpdate();
    
    // Wait for DOM update, then setup positioning
    this.updateComplete.then(() => {
      console.log('DOM updated, checking elements:', {
        calendarContainer: !!this.calendarContainer,
        dateInput: !!this.dateInput
      });
      
      if (this.calendarContainer && this.dateInput) {
        console.log('Setting up dropdown controller');
        this.dropdownController.setElements(this.calendarContainer, this.dateInput);
        this.dropdownController.open();
      } else {
        console.error('Elements not found:', {
          calendarContainer: this.calendarContainer,
          dateInput: this.dateInput
        });
      }
    });
  }

  /**
   * Close calendar - DELEGATES to dropdown controller
   */
  closeCalendar(): void {
    this.openedCalendar = false;
    this.dropdownController.close();
  }

  /**
   * Toggle calendar - DELEGATES to dropdown controller
   */
  toggleCalendar(): void {
    if (this.openedCalendar) {
      this.closeCalendar();
    } else {
      this.openCalendar();
    }
  }

  /**
   * Handle keyboard events - DELEGATES to keyboard controller
   */
  handleKeyDown(event: KeyboardEvent): void {
    this.keyboardController.handleKeyDown(event);
  }

  // Utility methods
  private updateInputField(): void {
    if (this.range) {
      this.inputFieldValue = this.selectionController.formatSelectedRange();
    } else {
      this.inputFieldValue = this.selectionController.formatSelectedDate();
    }
  }

  private dispatchDateChange(): void {
    this.dispatchEvent(
      new CustomEvent(DATE_PICKER_EVENTS.DATE_CHANGE, {
        bubbles: true,
        composed: true,
        detail: { value: this.inputFieldValue },
      })
    );
  }

  private updateLocale(locale: string): void {
    dayjs.locale(locale);
    this.monthsShort = dayjs().localeData().monthsShort();
    this.months = dayjs().localeData().months();
    this.days = dayjs().localeData().weekdays();
    this.weekdaysShort = dayjs().localeData().weekdaysShort();
  }

  // Event handlers
  inputChanged(event: CustomEvent): void {
    this.inputFieldValue = event.detail.value;
    // Additional input validation logic here
  }

  onFocus(): void {
    this.dispatchEvent(
      new CustomEvent(DATE_PICKER_EVENTS.FOCUS, {
        bubbles: true,
        composed: true,
      })
    );
  }

  // Navigation methods - delegates to controllers
  handleMonthChange = (event: CustomEvent) => {
    const selectedMonth = parseInt(event.detail.value, 10);
    this.handleMonthSelection(selectedMonth);
  };

  handleYearChange = (event: CustomEvent) => {
    const selectedYear = parseInt(event.detail.value, 10);
    this.handleYearSelection(selectedYear);
  };

  prevMonth = () => this.calendarController.navigateToPreviousMonth();
  nextMonth = () => this.calendarController.navigateToNextMonth();
  prevYear = () => this.calendarController.navigateToPreviousYear();
  nextYear = () => this.calendarController.navigateToNextYear();

  selectMonth = (month: number) => {
    this.currentMonth = month;
    this.navigationDates.start.month = month;
    this.currentMode = DatePickerMode.Day;
    this.calendarController.updateCalendarDisplay();
  };

  selectYear = (year: number) => {
    this.currentYear = year;
    this.navigationDates.start.year = year;
    this.currentMode = DatePickerMode.Day;
    this.calendarController.updateCalendarDisplay();
  };

  selectDay = (dayPresentation: IDayPresentation) => {
    const date = new Date(dayPresentation.year, dayPresentation.month, dayPresentation.date);
    this.selectDate(date);
  };

  // Dropdown event handlers
  private handleMonthSelected(event: Event) {
    const customEvent = event as CustomEvent;
    const monthIndex = customEvent.detail.monthIndex;
    this.selectMonth(monthIndex + 1); // selectMonth expects 1-based month
  }

  private handleYearSelected(event: Event) {
    const customEvent = event as CustomEvent;
    const year = customEvent.detail.year; 
    this.selectYear(year);
  }

  // Direct selection handlers for dropdown templates
  private handleMonthSelection(monthIndex: number) {
    this.selectMonth(monthIndex); // monthIndex is already 1-based from renderMonthDropdown
  }

  private handleYearSelection(year: number) {
    this.selectYear(year);
  }

  // Render methods following the multiple render pattern
  protected override render(): TemplateResult {
    return html`${choose(this.type, [
      [DatePickerType.Single, () => this.renderSingle()],
      [DatePickerType.Range, () => this.renderRange()],
      [DatePickerType.Multiple, () => this.renderMultiple()],
    ])}`;
  }

  private renderSingle(): TemplateResult {
    return html`
      <div
        class="${classMap({
          'datepicker-container': true,
          'datepicker-disabled': this.disabled,
          [`datepicker-size-${this.size}`]: true,
          [`datepicker-variant-${this.variant}`]: true,
        })}"
        data-theme="${this.currentTheme}"
      >
        <nr-input
          id="${INPUT_FIELD_ID}"
          .type="${this.INPUT_TYPE}"
          .value="${this.inputFieldValue}"
          .placeholder="${this.placeholder}"
          .size="${this.size}"
          .state="${this.state}"
          .disabled="${this.disabled}"
          .required="${this.required}"
          @input="${this.inputChanged}"
          @focus="${this.onFocus}"
          @click="${this.toggleCalendar}"
          @keydown="${this.handleKeyDown}"
          role="combobox"
          aria-expanded="${this.openedCalendar}"
          aria-haspopup="dialog"
          aria-label="${this.label || 'Select date'}"
        >
          ${this.label ? html`<span slot="label">${this.label}</span>` : nothing}
          ${this.helper ? html`<span slot="helper-text">${this.helper}</span>` : nothing}
        </nr-input>
        ${this.openedCalendar ? this.renderCalendar() : nothing}
      </div>
    `;
  }

  private renderRange(): TemplateResult {
    // Range-specific rendering logic
    return this.renderSingle(); // For now, use single rendering
  }

  private renderMultiple(): TemplateResult {
    // Multiple selection rendering logic
    return this.renderSingle(); // For now, use single rendering
  }

  private renderCalendar(): TemplateResult {
    return html`
      <div
        class="${classMap({
          [CALENDAR_CONTAINER_CLASS]: true,
          'calendar-range': this.range && this.currentMode === DatePickerMode.Day,
          [`placement-${this.placement}`]: true,
        })}"
        role="dialog"
        aria-label="Calendar"
        part="calendar"
      >
        <div class="calendar-header" part="header">
          <nr-button
            type="text"
            class="header-prev-button prev-month"
            .icon="${['angle-left']}"
            @click="${this.prevMonth}"
            aria-label="Previous month"
          ></nr-button>
          ${this.renderCalendarHeader()}
          <nr-button
            type="text"
            class="header-next-button next-month"
            .icon="${['angle-right']}"
            @click="${this.nextMonth}"
            aria-label="Next month"
          ></nr-button>
        </div>
        <div class="calendar-content">
          ${this.renderCalendarBody()}
        </div>
      </div>
    `;
  }

  private get monthOptions() {
    return this.months.map((month, index) => ({
      value: (index + 1).toString(),
      label: capitalizeFirstLetter(month)
    }));
  }

  private get yearOptions() {
    const currentYear = this.navigationDates.start.year;
    const years = [];
    for (let year = currentYear - 10; year <= currentYear + 10; year++) {
      years.push({
        value: year.toString(),
        label: year.toString()
      });
    }
    return years;
  }

  private renderCalendarHeader(): TemplateResult {
    return html`
      <div class="year-month-header">
        ${this.currentMode !== DatePickerMode.Year
          ? html`
            <div class="month-selector">
              <hy-select
                .options="${this.monthOptions}"
                .value="${this.navigationDates.start.month.toString()}"
                .defaultValue="${[this.navigationDates.start.month.toString()]}"
                @nr-change="${this.handleMonthChange}"
                size="small"
                class="month-select"
                placeholder=""
                .clearable=${false}
                max-height="200px"
              ></hy-select>
            </div>
          `
          : nothing}

        <div class="current-year-container">
          <hy-select
            .options="${this.yearOptions}"
            .value="${this.navigationDates.start.year.toString()}"
            .defaultValue="${[this.navigationDates.start.year.toString()]}"
            @nr-change="${this.handleYearChange}"
            size="small"
            class="year-select"
            placeholder=""
            .clearable=${false}
            max-height="200px"
          ></hy-select>
          <div class="year-icons-toggler">
            <nr-button
              class="next-year"
              .icon="${['caret-up']}"
              @click="${this.nextYear}"
              aria-label="Next year"
            ></nr-button>
            <nr-button
              class="previous-year"
              .icon="${['caret-down']}"
              @click="${this.prevYear}"
              aria-label="Previous year"
            ></nr-button>
          </div>
        </div>
      </div>
    `;
  }

  private renderCalendarBody(): TemplateResult {
    return html`${choose(this.currentMode, [
      [DatePickerMode.Day, () => this.renderDays()],
      [DatePickerMode.Month, () => this.renderMonths()],
      [DatePickerMode.Year, () => this.renderYears()],
    ])}`;
  }

  private renderDays(): TemplateResult {
    const isRange = this.range && this.currentMode === DatePickerMode.Day;
    return renderDays(
      this.weekdaysShort,
      this.navigationDates,
      (date: IDayPresentation) => this.selectDay(date),
      {
        currentYear: this.currentYear,
        currentMonth: this.currentMonth,
        currentDay: this.currentDay,
        endYear: this.endYear || this.currentYear,
        endMonth: this.endMonth || this.currentMonth,
        endDay: this.endDay || this.currentDay,
      },
      isRange,
      this.days
    );
  }

  private renderMonths(): TemplateResult {
    return renderMonthsTemplate(this.monthsShort, this.currentMonth, this.selectMonth);
  }

  private renderYears(): TemplateResult {
    return renderYearsTemplate(this.navigationDates.start.year, this.selectYear);
  }


}
