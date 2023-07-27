/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import {LitElement, html, nothing, PropertyValues, TemplateResult} from 'lit';
import {customElement, property, query, state} from 'lit/decorators.js';
import dayjs from 'dayjs/esm';
import '../input/input.component.js';
import '../icon/icon.component.js';
import '../button/hy-button.component.js';
import {getMonthDetails} from './core/month.helper.js';
import {styles} from './date-picker.style.js';
import {styleMap} from 'lit/directives/style-map.js';
import {EMPTY_STRING, Mode} from './constants.js';
import {renderMonthsTemplate} from './templates/months.template.js';
import {renderYearsTemplate} from './templates/years.template.js';
import {renderDays} from './templates/days.template.js';
import {oneToTwoDigit} from './core/formatter.js';
import {capitalizeFirstLetter} from './core/string.helper.js';
import './core/locale.helper.js';
interface NavigationDates {
  start: {
    year: number;
    month: number;
    day?: number;
  };
  end?: {
    year: number;
    month: number;
    day?: number;
  };
}
/**
 * A Datepicker element.
 *
 * @attr name
 * @attr fieldFormat
 * @attr dateValue
 * @attr dateplaceholder
 * @attr openedCalender
 * @attr range
 */
@customElement('hy-datepicker')
export class HyDatePickerElement extends LitElement {
  today = dayjs();

  @property({type: String})
  name!: string;
  @property({type: String})
  locale = 'en';

  @property({type: String})
  dateplaceholder!: string;

  @property({reflect: true})
  mode = Mode.Day;

  @property({type: String})
  range = false;

  @state()
  prevMode!: Mode;

  @property({reflect: true})
  openedCalender: boolean | undefined = false;

  @state()
  monthsShort = dayjs.monthsShort();

  @state()
  months = dayjs.months();

  @state()
  weekdaysShort = dayjs.weekdaysShort();

  @state()
  curentYear = this.today.year();

  @state()
  currentDay = this.today.date();

  @state()
  currentMonth = this.today.month() + 1;

  @state()
  inputFieldValue = '';

  @property({type: String})
  fieldFormat = 'DD/MM/YYYY';

  @property({type: String})
  fieldDisplayFormat = 'DD/MM/YYYY';

  @property({type: String})
  dateValue = '';

  @state()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  navigationDates: any = {
    start: {
      year: this.curentYear,
      month: this.currentMonth,
      day: this.currentDay,
    },
  };

  @query('#date-input')
  dateInput!: HTMLElement;

  @query('.calendar-container')
  calendarContainer!: HTMLElement;

  clendarContainerStyle = styleMap({});

  @state()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  daysPresentation!: any[];

  static override styles = styles;
  override updated(changedProperties: PropertyValues) {
    if (changedProperties.has('dateValue') && this.dateValue && this.fieldFormat) {
      const dateObj = dayjs(this.dateValue, this.fieldFormat, true);
      if (dateObj.isValid()) {
        const {years, months, date} = dateObj.toObject();
        this.curentYear = years;
        this.currentMonth = months + 1;
        this.currentDay = date;
        this.navigationDates = {start: {year: years, month: months + 1, day: date}};
        this.onDateChanged();
      }
    }

    if (changedProperties.has('locale')) {
      this.updateLocale(this.locale);
    }
  }

  _onClickOutside(e: MouseEvent) {
    if (!e.composedPath().includes(this)) {
      this.openedCalender = false;
    }
  }

  override connectedCallback() {
    super.connectedCallback();
    document.addEventListener('click', this._onClickOutside.bind(this));
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this._onClickOutside.bind(this));
  }

  toggleCaldendar() {
    this.openedCalender = !this.openedCalender;
    if (this.openedCalender) {
      requestAnimationFrame(() => {
        this.positionCalnder();
      });
    }
  }

  onDateChanged() {
    this.inputFieldValue = dayjs(`${this.curentYear}-${this.currentMonth}-${this.currentDay}`).format(
      this.fieldDisplayFormat
    );
  }
  getDistanceFromBottom(element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    const distanceToBottom = Math.max(0, window.innerHeight - rect.bottom);
    return distanceToBottom;
  }
  positionCalnder() {
    const distanceFromBottom = this.getDistanceFromBottom(this.dateInput);
    if (distanceFromBottom < this.calendarContainer?.offsetHeight + 10) {
      this.clendarContainerStyle = styleMap({
        marginTop: -this.calendarContainer?.offsetHeight - this.dateInput.offsetHeight + 'px',
      });
    }
  }

  updateLocale(locale: string): void {
    dayjs.locale(locale);
    this.monthsShort = dayjs.monthsShort();
    this.months = dayjs.months();
    this.weekdaysShort = dayjs.weekdaysShort();
  }
  override firstUpdated() {
    if (!this.prevMode) {
      this.prevMode = this.mode;
    }
    this.updateLocale(this.locale);
    if (this.openedCalender) {
      requestAnimationFrame(() => {
        this.daysPresentation = getMonthDetails(this.curentYear, this.currentMonth - 1, []);
        this.positionCalnder();
        this.requestUpdate();
      });
    }
  }

  nextYear(): void {
    this.navigationDates = {
      ...this.navigationDates,
      ...{
        start: {
          ...this.navigationDates.start,
          year: ++this.navigationDates.start.year,
        },
      },
    };
  }

  prevYear(navigationDates: NavigationDates): NavigationDates {
    const {start} = navigationDates;
    const updatedStart = {...start, year: start.year - 1};
    const updatedNavigationDates = {...navigationDates, start: updatedStart};
    return updatedNavigationDates;
  }

  nextMonth(): void {
    let currentMonth = this.navigationDates.start.month;
    if (currentMonth == 12) {
      currentMonth = 1;
      this.nextYear();
    } else {
      currentMonth++;
    }
    this.navigationDates = {
      ...this.navigationDates,
      ...{
        start: {
          ...this.navigationDates.start,
          month: currentMonth,
        },
      },
    };
  }

  prevMonth(): void {
    const {start} = this.navigationDates;
    const {year, month} = start;

    const newMonth = ((month - 2) % 12) + 1;
    const newYear = year - Math.floor((month - 2) / 12);

    this.navigationDates = {
      ...this.navigationDates,
      start: {
        ...start,
        year: newYear,
        month: newMonth,
      },
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  todayIsTheDay(navigationDates: any, day: number): boolean {
    const isTheDate =
      navigationDates.start.year === this.curentYear &&
      navigationDates.start.month === this.currentMonth &&
      day === this.currentDay;
    return isTheDate;
  }

  selectMonth = (number: number): void => {
    this.currentMonth = number + 1;
    this.navigationDates.start.month = this.currentMonth;
    this.navigationDates = {...this.navigationDates};
    //TODO: handle mainMode
    if (this.mode == Mode.Month) {
      this.currentDay = 1;
      this.openedCalender = false;
    } else {
      this.prevMode = Mode.Day;
    }

    this.onDateChanged();
  };

  selectYear = (selectedYear: number): void => {
    this.curentYear = selectedYear;

    //TODO: handle mainMode
    if (this.mode == Mode.Year) {
      this.currentDay = 1;
      this.currentMonth = 1;
      this.openedCalender = false;
    } else {
      this.prevMode = Mode.Month;
    }
    this.onDateChanged();
  };

  selectDay = (selectedDay: any): void => {
    this.currentDay = Number(oneToTwoDigit(selectedDay));
    //TODO: handle mainMode
    this.prevMode = Mode.Day;
    this.openedCalender = false;
    this.onDateChanged();
  };

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

  renderContainer(number = 0): TemplateResult | typeof nothing {
    switch (this.prevMode) {
      case Mode.Day:
        const daysPresentation: any = getMonthDetails(
          this.navigationDates.start.year,
          this.navigationDates.start.month - 1 + number,
          []
        );
        return renderDays(this.weekdaysShort, daysPresentation, this.navigationDates, this.selectDay, {
          curentYear: this.curentYear,
          currentMonth: this.currentMonth,
          currentDay: this.currentMonth,
        });
      case Mode.Month:
        return renderMonthsTemplate(this.monthsShort, this.currentMonth, this.selectMonth);
      case Mode.Year:
        return renderYearsTemplate(this.navigationDates.start.year, this.selectYear);
      default:
        return nothing;
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inputChanged(_e: any): void {
    this.dateValue = _e.detail.value;
  }

  renderCalendarHeader() {
    return html`
      <div class="year-month-header">
        ${this.mode !== Mode.Year
          ? html`<hy-button type="text" @click=${this.toggleMonthView} class="toggle-month-view">
                ${capitalizeFirstLetter(this.months[this.navigationDates.start.month - 1])}
                ${this.range && this.prevMode === Mode.Day
                  ? ' - ' + capitalizeFirstLetter(this.months[this.navigationDates.start.month])
                  : nothing}
              </hy-button>
              <hy-icon name="minus" class="header-month-year-sepration"></hy-icon> `
          : nothing}
        <hy-button type="text" class="toggle-year-view" @click=${this.toggleYearView}
          >${this.navigationDates.start.year}</hy-button
        >
      </div>
    `;
  }

  renderCalendar() {
    return html` <div
      class="calendar-container ${this.range && this.prevMode === Mode.Day ? 'calendar-container-range' : EMPTY_STRING}"
      style=${this.clendarContainerStyle}
    >
      <div class="calendar-header">
        <hy-button
          type="text"
          class="header-prev-button prev-year"
          icon="angle-double-left"
          @click=${() => {
            this.navigationDates = this.prevYear(this.navigationDates);
            this.firstUpdated();
          }}
        ></hy-button>
        <hy-button
          type="text"
          class="header-prev-button prev-month"
          icon="angle-left"
          @click=${() => {
            this.prevMonth();
            this.firstUpdated();
          }}
        ></hy-button>
        ${this.renderCalendarHeader()}
        <hy-button
          type="text"
          class="header-next-button next-year"
          @click=${() => {
            this.nextYear();
            this.firstUpdated();
          }}
          icon="angle-double-right"
        ></hy-button>
        <hy-button
          type="text"
          class="header-next-button next-month"
          icon="angle-right"
          @click=${() => {
            this.nextMonth();
            this.firstUpdated();
          }}
        ></hy-button>
      </div>
      <span class="day-containers"
        >${this.renderContainer()} ${this.range && this.prevMode === Mode.Day ? this.renderContainer(1) : nothing}</span
      >
    </div>`;
  }

  override render(): TemplateResult {
    return html`
      <hy-input
        id="date-input"
        .value=${this.inputFieldValue}
        @valueChange=${this.inputChanged}
        @focus=${() => {
          this.openedCalender = true;
          this.requestUpdate();
        }}
      >
        <hy-icon
          style="cursor: pointer"
          name="calendar"
          slot="suffix"
          @click=${() => {
            this.toggleCaldendar();
          }}
        ></hy-icon>
      </hy-input>
      ${this.openedCalender ? this.renderCalendar() : nothing}
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
