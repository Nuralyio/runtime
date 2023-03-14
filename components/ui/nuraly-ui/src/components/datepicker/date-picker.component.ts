/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html, nothing } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import '../input/input.component';
import '../icon/icon.component';
import '../button/hy-button.component';
import { getMonthDetails, months } from './core/month.helper';
import { styles } from './date-picker.style';
import { styleMap } from 'lit/directives/style-map.js';
import { EMPTY_STRING, INVALID_DAY_CLASS_NAME, Mode } from './constants';
import { renderMonthsTemplate } from './templates/months.template';
import { renderDayHeaderTemplate } from './templates/headers.template';
import { renderYearsTemplate } from './templates/years.template';

/**
 * An Icon element.
 *
 * @attr name
 */
@customElement('hy-datepicker')
export class HyDatePickerElement extends LitElement {
  @property({ type: String })
  name!: string;

  @property({ reflect: true })
  mode = Mode.Day;

  @state()
  prevMode!: Mode;

  @state()
  showCalendar = true;

  @state()
  showCalendarContainer = true;

  @state()
  showMonths = false;

  @state()
  curentYear = 2023;

  @state()
  curentMonth = 3;

  @query('#date-input')
  dateInput!: HTMLElement;

  @query('.calendar-container')
  calendarContainer!: HTMLElement;

  clendarContainerStyle = styleMap({});

  @state()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  daysPresentation!: any[];

  static override styles = styles;

  private _onClickOutside(e: MouseEvent) {
    if (!this.contains(e.target as Node)) {
      // Do something when the click is outside the element
      console.log('Clicked outside');
    }
  }

  override connectedCallback() {
    super.connectedCallback();
    document.addEventListener('click', this._onClickOutside);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this._onClickOutside);
  }

  toggleCaldendar() {
    this.showCalendarContainer = !this.showCalendarContainer;
    if (this.showCalendarContainer) {
      this.positionCalnder();
    }
  }
  positionCalnder() {
    requestAnimationFrame(() => {
      const { bottom } = this.dateInput.getBoundingClientRect();
      const distanceFromBottom = window.innerHeight - bottom;
      if (distanceFromBottom < this.calendarContainer.offsetHeight + 10) {
        this.clendarContainerStyle = styleMap({
          top: bottom - this.calendarContainer.offsetHeight - this.dateInput.offsetHeight + 'px',
          opacity: '1',
        });
      } else {
        this.clendarContainerStyle = styleMap({
          top: bottom + 'px',
          opacity: '1',
        });
      }
      this.requestUpdate();
    });
  }

  override firstUpdated() {
    if (this.showCalendarContainer) {
      requestAnimationFrame(() => {
        this.daysPresentation = getMonthDetails(this.curentYear, this.curentMonth - 1, []);
      });

      this.positionCalnder();
    }
  }

  nextYear(): void {
    this.curentYear++;
  }

  prevYear(): void {
    this.curentYear--;
  }

  nextMonth(): void {
    if (this.curentMonth == 12) {
      this.curentMonth = 1;
      this.curentYear++;
    } else {
      this.curentMonth++;
    }
  }
  prevMonth(): void {
    if (this.curentMonth == 1) {
      this.curentMonth = 12;
      this.curentYear--;
    } else {
      this.curentMonth--;
    }
  }

  renderDays() {
    this.daysPresentation = getMonthDetails(this.curentYear, this.curentMonth - 1, []);

    return html` <div class="days-container">
      ${renderDayHeaderTemplate()}
      ${this.daysPresentation?.map((day) => {
      return html`<div class="day-container ${day.valid ? EMPTY_STRING : INVALID_DAY_CLASS_NAME}">${day.date}</div>`;
    })}
    </div>`;
  }

  selectMonth = (number: number) => {
    this.curentMonth = number + 1;

    //TODO: handle mainMode
    this.mode = Mode.Day;
  };

  selectYear = (selectedYear: number) => {
    this.curentYear = selectedYear;

    //TODO: handle mainMode
    this.mode = Mode.Month;
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
        return renderMonthsTemplate(months, this.curentMonth, this.selectMonth);
      case Mode.Year:
        return renderYearsTemplate(this.curentYear, this.selectYear);
      default:
        return nothing;
    }
  }
  override render() {
    return html`
      ${this.curentYear} - ${this.curentMonth}
      <hy-input id="date-input" @focus=${() => (this.showCalendarContainer = !this.showCalendarContainer)}>
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
                <hy-button type="text" @click=${this.toggleMonthView}>${months[this.curentMonth - 1]}</hy-button>
                <hy-icon name="minus" class="header-month-year-sepration"></hy-icon>
                <hy-button type="text" @click=${this.toggleYearView}>${this.curentYear}</hy-button>
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
