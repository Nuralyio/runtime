/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import {LitElement, html, nothing, PropertyValues} from 'lit';
import {customElement, property, query, state} from 'lit/decorators.js';
import '../input/input.component';
import '../icon/icon.component';
import '../button/hy-button.component';
import {getMonthDetails} from './core/month.helper';
import {styles} from './date-picker.style';
import {styleMap} from 'lit/directives/style-map.js';
import {EMPTY_STRING, INVALID_DAY_CLASS_NAME, Mode} from './constants';
import {renderMonthsTemplate} from './templates/months.template';
import {renderYearsTemplate} from './templates/years.template';
import dayjs from 'dayjs/esm';
import customParseFormat from 'dayjs/esm/plugin/customParseFormat';
import {oneToTwoDigit} from './core/formatter';
import localeData from 'dayjs/esm/plugin/localeData';
import './core/locale.helper';
import {capitalizeFirstLetter} from './core/string.helper';
dayjs.extend(localeData);
dayjs.extend(customParseFormat);

/**
 * An Icon element.
 *
 * @attr name
 * @attr fieldFormat
 * @attr dateValue
 * @attr dateplaceholder
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

  @state()
  prevMode!: Mode;

  @state()
  monthsShort = dayjs.monthsShort();

  @state()
  months = dayjs.months();

  @state()
  weekdaysShort = dayjs.weekdaysShort();

  @state()
  showCalendar = false;

  @state()
  showCalendarContainer = true;

  @state()
  showMonths = false;

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
    if (changedProperties.has('dateValue')) {
      if (this.dateValue && this.fieldFormat) {
        const dateObj = dayjs(this.dateValue, this.fieldFormat, true);
        if (dateObj.isValid()) {
          this.curentYear = dateObj.year();
          this.currentMonth = dateObj.month() + 1;
          this.currentDay = dateObj.date();
          this.navigationDates = {
            start: {
              year: this.curentYear,
              month: this.currentMonth,
              day: this.currentDay,
            },
          };
          this.onDateChanged();
        }
      }
    }

    if (changedProperties.has('locale')) {
      this.updateLocale(this.locale);
    }
  }

  private _onClickOutside(e: MouseEvent) {
    if (!e.composedPath().includes(this)) {
      this.showCalendarContainer = false;
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
    this.showCalendarContainer = !this.showCalendarContainer;
    if (this.showCalendarContainer) {
      requestAnimationFrame(() => {
        this.positionCalnder();
      });
    }
  }

  onDateChanged() {
    this.inputFieldValue = dayjs(
      `${this.curentYear}-${this.currentMonth}-${this.currentDay}`
    ).format(this.fieldFormat);
  }
  getDistanceFromBottom(element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    const distanceToBottom = Math.max(0, window.innerHeight - rect.bottom);
    return distanceToBottom;
  }
  positionCalnder() {
    const distanceFromBottom = this.getDistanceFromBottom(this.dateInput);
    if (distanceFromBottom < this.calendarContainer.offsetHeight + 10) {
      this.clendarContainerStyle = styleMap({
        marginTop: -this.calendarContainer.offsetHeight - this.dateInput.offsetHeight + 'px',
        opacity: '1',
      });
    } else {
      this.clendarContainerStyle = styleMap({
        opacity: '1',
      });
    }
  }

  updateLocale(locale: string) {
    dayjs.locale(locale);

    this.monthsShort = dayjs.monthsShort();
    this.months = dayjs.months();
    this.weekdaysShort = dayjs.weekdaysShort();
  }
  override firstUpdated() {
    this.updateLocale(this.locale);
    if (this.showCalendarContainer) {
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

  prevYear(): void {
    this.navigationDates = {
      ...this.navigationDates,
      ...{
        start: {
          ...this.navigationDates.start,
          year: --this.navigationDates.start.year,
        },
      },
    };
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
    let currentMonth = this.navigationDates.start.month;
    if (currentMonth == 1) {
      currentMonth = 12;
      this.prevYear();
    } else {
      currentMonth--;
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  todayIsTheDay(navigationDates: any, day: number) {
    const isTheDate =
      navigationDates.start.year === this.curentYear &&
      navigationDates.start.month === this.currentMonth &&
      day === this.currentDay;
    return isTheDate;
  }
  renderDays() {
    this.daysPresentation = getMonthDetails(
      this.navigationDates.start.year,
      this.navigationDates.start.month - 1,
      []
    );
    return html` <div class="days-container">
      ${this.weekdaysShort.map(
        (shortDay: string) =>
          html`<div class="day-header-item">${capitalizeFirstLetter(shortDay)}</div>`
      )}
      ${this.daysPresentation?.map((day) => {
        return html`<div
          class="day-container ${this.todayIsTheDay(this.navigationDates, day.date)
            ? 'day-active'
            : EMPTY_STRING} ${day.valid ? EMPTY_STRING : INVALID_DAY_CLASS_NAME}"
          @click=${() => this.selectDay(day.date)}
        >
          ${day.date}
        </div>`;
      })}
    </div>`;
  }

  selectMonth = (number: number) => {
    this.currentMonth = number + 1;

    //TODO: handle mainMode
    this.mode = Mode.Day;
    this.onDateChanged();
  };

  selectYear = (selectedYear: number) => {
    this.curentYear = selectedYear;

    //TODO: handle mainMode
    this.mode = Mode.Month;
    this.onDateChanged();
  };

  selectDay = (selectedDay: number) => {
    this.currentDay = Number(oneToTwoDigit(selectedDay));
    //TODO: handle mainMode
    this.mode = Mode.Day;
    this.onDateChanged();
    // const datePreformatted = `${this.curentYear}${oneToTwoDigit(this.currentMonth)}${this.currentDay}`
    // console.log(datePreformatted)
    // const parsedDate = parseDate(datePreformatted, 'YYYYMMDD', 'en-US')
    // console.log(parsedDate)
  };

  toggleMonthView() {
    if (this.mode != Mode.Month) {
      this.prevMode = this.mode;
      this.mode = Mode.Month;
    } else {
      this.mode = this.prevMode;
    }
  }

  toggleYearView() {
    if (this.mode != Mode.Year) {
      this.prevMode = this.mode;
      this.mode = Mode.Year;
    } else {
      this.mode = this.prevMode;
    }
  }

  renderContainer() {
    switch (this.mode) {
      case Mode.Day:
        return this.renderDays();
      case Mode.Month:
        return renderMonthsTemplate(this.monthsShort, this.currentMonth, this.selectMonth);
      case Mode.Year:
        return renderYearsTemplate(this.navigationDates.start.year, this.selectYear);
      default:
        return nothing;
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inputChanged(_e: any) {
    this.dateValue = _e.detail.value;
  }
  override render() {
    return html`
      <hy-input
        id="date-input"
        .value=${this.inputFieldValue}
        @inputed=${this.inputChanged}
        @focus=${() => {
          this.showCalendarContainer = true;
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
      ${this.showCalendarContainer
        ? html` <div class="calendar-container" style=${this.clendarContainerStyle}>
            <div class="calendar-header">
              <hy-button
                type="text"
                class="header-prev-button"
                icon="angle-double-left"
                @click=${() => {
                  this.prevYear();
                  this.firstUpdated();
                }}
              ></hy-button>
              <hy-button
                type="text"
                class="header-prev-button"
                icon="angle-left"
                @click=${() => {
                  this.prevMonth();
                  this.firstUpdated();
                }}
              ></hy-button>

              <div class="year-month-header">
                <hy-button type="text" @click=${this.toggleMonthView}
                  >${capitalizeFirstLetter(
                    this.months[this.navigationDates.start.month - 1]
                  )}</hy-button
                >
                <hy-icon name="minus" class="header-month-year-sepration"></hy-icon>
                <hy-button type="text" @click=${this.toggleYearView}
                  >${this.navigationDates.start.year}</hy-button
                >
              </div>
              <hy-button
                type="text"
                class="header-next-button"
                @click=${() => {
                  this.nextYear();
                  this.firstUpdated();
                }}
                icon="angle-double-right"
              ></hy-button>
              <hy-button
                type="text"
                class="header-next-button"
                icon="angle-right"
                @click=${() => {
                  this.nextMonth();
                  this.firstUpdated();
                }}
              ></hy-button>
            </div>
            ${this.renderContainer()}
          </div>`
        : nothing}
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
