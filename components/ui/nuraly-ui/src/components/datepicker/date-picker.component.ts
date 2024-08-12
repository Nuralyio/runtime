/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import {LitElement, html, nothing, PropertyValues, TemplateResult} from 'lit';
import {customElement, property, query, state} from 'lit/decorators.js';
import dayjs from 'dayjs';
import '../input/input.component.js';
import '../icon/icon.component.js';
import '../button/hy-button.component.js';
import {getMonthDetails} from './core/month.helper.js';
import {styles} from './date-picker.style.js';
import {IDayPresentation, INavigationDate, Mode} from './datepicker.types.js';
import {renderMonthsTemplate} from './templates/months.template.js';
import {renderYearsTemplate} from './templates/years.template.js';
import {renderDays} from './templates/days.template.js';
import {oneToTwoDigit} from './core/formatter.js';
import {capitalizeFirstLetter} from './core/string.helper.js';
import './core/locale.helper.js';
import {INPUT_SIZE, INPUT_STATE} from '../input/input.constant.js';
import {EMPTY_STRING} from './constants.js';

@customElement('hy-datepicker')
export class HyDatePickerElement extends LitElement {
  today = dayjs();

  @property({type: String})
  name!: string;
  @property({type: String})
  locale = 'en';

  @property({reflect: true})
  mode = Mode.Day;

  @property({type: Boolean})
  range = false;

  @state()
  prevMode = this.mode;

  @property({reflect: true, type: Boolean})
  openedCalendar = false;

  @state()
  monthsShort = dayjs().localeData().monthsShort()
  
  @state()
  months = dayjs().localeData().months();

  @state()
  days = dayjs().localeData().weekdays();

  @state()
  weekdaysShort = dayjs().localeData().weekdaysShort();

  @state()
  currentYear = this.today.year();

  @state()
  currentDay = this.today.date();

  @state()
  currentMonth = this.today.month() + 1;

  @state()
  endYear!: number;

  @state()
  endDay!: number;

  @state()
  endMonth!: number;

  @state()
  inputFieldValue = '';

  @property({type: String})
  fieldFormat = 'DD/MM/YYYY';

  @property({type: String})
  dateValue = '';

  @state()
  navigationDates: INavigationDate = {
    start: {
      year: this.currentYear,
      month: this.currentMonth,
      day: this.currentDay,
    },
  };

  @query('#date-input')
  dateInput!: HTMLElement;

  @query('.calendar-container')
  calendarContainer!: HTMLElement;

  @state()
  daysPresentation!: IDayPresentation[];

  @property()
  size = INPUT_SIZE.Medium;

  @property()
  state = INPUT_STATE.Default;

  @property()
  label!: string;

  @property()
  helper!: string;

  @property({reflect: true, type: Boolean})
  disabled = false;

  INPUT_TYPE = 'calendar';

  static override styles = styles;

  override connectedCallback() {
    super.connectedCallback();
    document.addEventListener('click', this._onClickOutside.bind(this));
    document.addEventListener('scroll', this.positionCalendar);
  }
  override firstUpdated() {
    if (this.range) {
      this.endYear = this.currentYear;
      this.endMonth = this.currentMonth;
      this.endDay = this.currentDay;
    }
  }
  override willUpdate(changedProperties: PropertyValues) {
    if (changedProperties.has('openedCalendar') && this.openedCalendar) {
      this.daysPresentation = getMonthDetails(this.currentYear, this.currentMonth - 1, this.days);
      this.positionCalendar();
    }
    if (changedProperties.has('dateValue') && this.dateValue) {
      const dateObj = dayjs(this.dateValue, this.fieldFormat, true);
      if (dateObj.isValid()) {
        const {years, months, date} = dateObj.toObject();
        this.currentYear = years;
        this.currentMonth = months + 1;
        this.currentDay = date;
        this.navigationDates = {...this.navigationDates, start: {year: years, month: months + 1, day: date}};
      }
    }
    if (
      changedProperties.has('currentDay') ||
      changedProperties.has('currentMonth') ||
      changedProperties.has('currentYear')
    ) {
      this.onDateChanged();
    }
    if (changedProperties.has('locale')) {
      this.updateLocale(this.locale);
    }
  }

  _onClickOutside(e: MouseEvent) {
    if (!e.composedPath().includes(this)) {
      this.openedCalendar = false;
    }
  }

  toggleCaldendar() {
    this.openedCalendar = !this.openedCalendar;
  }

  onDateChanged() {
    this.inputFieldValue = this.range
      ? dayjs(`${this.currentYear}-${this.currentMonth}-${this.currentDay}`).format(this.fieldFormat) +
        '-' +
        dayjs(`${this.endYear}-${this.endMonth}-${this.endDay}`).format(this.fieldFormat)
      : dayjs(`${this.currentYear}-${this.currentMonth}-${this.currentDay}`).format(this.fieldFormat);
    this.dispatchEvent(
      new CustomEvent('date-change', {bubbles: true, composed: true, detail: {value: this.inputFieldValue}})
    );
  }

  positionCalendar = async () => {
    if (this.openedCalendar) {
      await this.updateComplete;
      const dateInput = this.shadowRoot!.querySelector('#date-input')!;
      const calendarHeight = this.calendarContainer.getBoundingClientRect().height;
      const dateInputRect = dateInput.getBoundingClientRect();
      const availableBottomSpace = window.visualViewport!.height - dateInputRect.bottom;
      const availableTopSpace = dateInputRect.top;
      this.calendarContainer.style.removeProperty('top');
      this.calendarContainer.style.removeProperty('position');
      if (calendarHeight > availableBottomSpace && availableTopSpace > calendarHeight) {
        const inputElement = dateInput.shadowRoot!.querySelector('#input-container')!;
        const inputBorderTop = +getComputedStyle(inputElement).borderTopWidth.split('px')[0];
        this.calendarContainer.style.top = `${availableTopSpace - calendarHeight - inputBorderTop}px`;
        this.calendarContainer.style.position = 'fixed';
      }
    }
  };

  updateLocale(locale: string): void {
    dayjs.locale(locale);
    this.monthsShort = dayjs().localeData().monthsShort();
    this.months = dayjs().localeData().months();
    this.weekdaysShort = dayjs().localeData().weekdaysShort();
    this.days = dayjs().localeData().weekdays();
  }

  nextYear() {
    let startYear = this.navigationDates.start.year;
    this.navigationDates = {
      ...this.navigationDates,
      start: {
        ...this.navigationDates.start,
        year: ++startYear,
      },
    };
  }

  prevYear() {
    let startYear = this.navigationDates.start.year;
    this.navigationDates = {
      ...this.navigationDates,
      start: {
        ...this.navigationDates.start,
        year: --startYear,
      },
    };
  }

  nextMonth() {
    const {start} = this.navigationDates;
    let startMonth = start.month;
    let startYear = start.year;
    if ((startMonth == 11 && this.range) || startMonth == 12) {
      startMonth = 1;
      startYear++;
    } else {
      startMonth++;
    }
    this.navigationDates = {
      ...this.navigationDates,
      start: {
        day: this.navigationDates.start.day,
        month: startMonth,
        year: startYear,
      },
    };
  }

  prevMonth() {
    const {start} = this.navigationDates;
    let startMonth = start.month;
    let startYear = start.year;
    if (startMonth >= 2) {
      startMonth = --startMonth;
    } else {
      if (this.range) startMonth = 11;
      else startMonth = 12;
      startYear = --startYear;
    }

    this.navigationDates = {
      ...this.navigationDates,
      start: {
        day: this.navigationDates.start.day,
        year: startYear,
        month: startMonth,
      },
    };
  }

  selectMonth = (selectedMonth: number): void => {
    const _month = selectedMonth + 1 > 11 && this.range ? 11 : selectedMonth + 1;
    this.navigationDates.start.month = _month;
    this.navigationDates = {...this.navigationDates};
    //TODO: handle mainMode
    if (this.mode == Mode.Month) {
      this.currentDay = 1;
      this.openedCalendar = false;
    } else {
      this.prevMode = Mode.Day;
    }
  };

  selectYear = (selectedYear: number): void => {
    this.navigationDates = {
      ...this.navigationDates,
      start: {...this.navigationDates.start, year: selectedYear},
    };

    //TODO: handle mainMode
    if (this.mode == Mode.Year) {
      this.currentDay = 1;
      this.currentMonth = 1;
      this.openedCalendar = false;
    } else {
      this.prevMode = Mode.Month;
    }
  };

  selectDay = (selectedDay: IDayPresentation): void => {
    if (!this.range) {
      this.currentDay = Number(oneToTwoDigit(selectedDay.date));
      this.currentMonth = selectedDay.month + 1;
      this.currentYear = selectedDay.year;
      const _month = this.currentMonth > 11 && this.range ? 11 : this.currentMonth;
      this.navigationDates = {
        ...this.navigationDates,
        start: {
          month: _month,
          day: this.currentDay,
          year: selectedDay.year,
        },
      };
    } else {
      this.selectDateRange(selectedDay);
    }

    //TODO: handle mainMode
    this.prevMode = Mode.Day;
    if (!this.range) this.openedCalendar = false;
  };
  selectDateRange(selectedDay: IDayPresentation) {
    const selectedDateDay = selectedDay.date;
    const selectedDateMonth = selectedDay.month;
    const selectedDateYear = selectedDay.year;
    const selectedDate = new Date(selectedDateYear, selectedDateMonth, selectedDateDay);

    const endDateDay = this.endDay;
    const endDateMonth = this.endMonth - 1;
    const endDateYear = this.endYear;
    const endDate = new Date(endDateYear, endDateMonth, endDateDay);

    const startDateDay = this.currentDay;
    const startDateMonth = this.currentMonth - 1;
    const startDateYear = this.currentYear;
    const startDate = new Date(startDateYear, startDateMonth, startDateDay);

    if (
      !startDate ||
      (endDate &&
        startDate &&
        (selectedDate.getTime() < startDate.getTime() || selectedDate.getTime() < endDate.getTime())) ||
      (startDate && !endDate && selectedDate.getTime() < startDate.getTime())
    ) {
      this.currentDay = Number(oneToTwoDigit(selectedDay.date));
      this.currentMonth = selectedDay.month + 1;
      this.currentYear = selectedDay.year;
      const _month = this.currentMonth > 11 && this.range ? 11 : this.currentMonth;
      this.navigationDates = {
        ...this.navigationDates,
        start: {
          month: _month,
          day: this.currentDay,
          year: selectedDay.year,
        },
      };
    } else if (
      (startDate && !endDate && selectedDate.getTime() > startDate.getTime()) ||
      (startDate && selectedDate.getTime() > startDate.getTime()) ||
      (endDate && startDate && selectedDate.getTime() > endDate.getTime())
    ) {
      const _month = selectedDay.month + 1 > 12 ? 11 : selectedDay.month + 1;
      this.endDay = Number(oneToTwoDigit(selectedDay.date));
      this.endMonth = _month;
      this.endYear = selectedDay.year;
    }
  }
  toggleMonthView(): void {
    if (this.prevMode != Mode.Month) {
      this.prevMode = Mode.Month;
    }
  }

  toggleYearView(): void {
    if (this.prevMode != Mode.Year) {
      this.prevMode = Mode.Year;
    }
  }
  inputChanged(inputChangedEvent: CustomEvent): void {
    this.dateValue = inputChangedEvent.detail.value;
  }
  onFocus() {
    this.openedCalendar = true;
  }

  renderContainer(isRange = false): TemplateResult | typeof nothing {
    switch (this.prevMode) {
      case Mode.Day:
        return renderDays(
          this.weekdaysShort,
          this.navigationDates,
          this.selectDay,
          {
            curentYear: this.currentYear,
            currentMonth: this.currentMonth,
            currentDay: this.currentDay,
            endYear: this.endYear,
            endMonth: this.endMonth,
            endDay: this.endDay,
          },
          isRange,
          this.days
        );
      case Mode.Month:
        return renderMonthsTemplate(this.monthsShort, this.currentMonth, this.selectMonth);
      case Mode.Year:
        return renderYearsTemplate(this.navigationDates.start.year, this.selectYear);
      default:
        return nothing;
    }
  }

  renderCalendarHeader() {
    return html`
      <div class="year-month-header">
        ${
          this.mode !== Mode.Year
            ? html`<hy-button @click=${this.toggleMonthView} class="toggle-month-view">
                ${capitalizeFirstLetter(this.months[this.navigationDates.start.month - 1])}
                ${this.range && this.prevMode === Mode.Day
                  ? ' - ' + capitalizeFirstLetter(this.months[this.navigationDates.start.month])
                  : nothing}
              </hy-button> `
            : nothing
        }  
        
        <div class="current-year-container">
          <hy-button class="toggle-year-view" @click=${this.toggleYearView}>${
      this.navigationDates.start.year
    }</hy-button>
          <div class="year-icons-toggler">
            <hy-button class="next-year" .icon=${['caret-up']} @click=${() => this.nextYear()}></hy-button>
            <hy-button class="previous-year" .icon=${['caret-down']}  @click=${() => this.prevYear()}></hy-button>
          </div>
          </div>
        </div>
      </div>
    `;
  }

  renderCalendar() {
    return html` <div
      class="calendar-container ${this.range && this.prevMode === Mode.Day ? 'calendar-container-range' : EMPTY_STRING}"
    >
      <div class="calendar-header">
        <hy-button
          type="text"
          class="header-prev-button prev-month"
          .icon="${['angle-left']}"
          @click=${() => this.prevMonth()}
        ></hy-button>
        ${this.renderCalendarHeader()}

        <hy-button
          type="text"
          class="header-next-button next-month"
          .icon="${['angle-right']}"
          @click=${() => this.nextMonth()}
        ></hy-button>
      </div>
      <span class="day-containers">
        ${this.renderContainer()}
        ${this.range && this.prevMode === Mode.Day ? this.renderContainer(this.range) : nothing}
      </span>
    </div>`;
  }
  override disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this._onClickOutside.bind(this));
    document.removeEventListener('scroll', this.positionCalendar);
  }

  override render(): TemplateResult {
    return html`
      <hy-input
        id="date-input"
        .type=${this.INPUT_TYPE}
        .value=${this.inputFieldValue}
        .size=${this.size}
        .state=${this.state}
        .disabled=${this.disabled}
        @valueChange=${this.inputChanged}
        @focus=${this.onFocus}
      >
        ${this.label ? html` <span slot="label">${this.label}</span> ` : nothing}
        ${this.helper ? html` <span slot="helper-text">${this.helper}</span> ` : nothing}
      </hy-input>
      ${this.openedCalendar ? this.renderCalendar() : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hy-datepicker': HyDatePickerElement;
  }
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'hy-datepicker':
        | React.DetailedHTMLProps<React.HTMLAttributes<HyDatePickerElement>, HyDatePickerElement>
        | Partial<HyDatePickerElement>;
    }
  }
}