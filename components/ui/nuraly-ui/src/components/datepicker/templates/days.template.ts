import { html, TemplateResult } from 'lit';
import { DateRawObject, IDayPresentation, INavigationDate } from '../datepicker.types.js';
import { todayIsTheDay } from '../utils/day.helper.js';
import { capitalizeFirstLetter } from '../utils/string.helper.js';
import { getMonthDetails } from '../utils/month.helper.js';
import dayjs from 'dayjs';
import { classMap } from 'lit/directives/class-map.js';
const today = dayjs();
const currentYear = today.year();
const currentDay = today.date();
const currentMonth = today.month() + 1;

export const renderDays = (
  weekdaysShort: string[],
  navigationDates: INavigationDate,
  selectDay: (date: IDayPresentation) => void,
  dateRawObject: DateRawObject,
  isRange: boolean,
  days: string[]
): TemplateResult => {
  const daysPresentation: IDayPresentation[] = getMonthDetails(
    navigationDates.start.year,
    isRange ? navigationDates.start.month : navigationDates.start.month - 1,
    days
  );

  const dayContainer = (day: IDayPresentation) => {
    const active = todayIsTheDay(day, dateRawObject, isRange) && day.valid;
    const isToday = currentYear == day.year && currentMonth == day.month + 1 && currentDay == day.date;

    return html`<div
      class="day-cell ${classMap({
        'selected': active, 
        'disabled': !day.valid, 
        'today': isToday,
        'in-range': isRange && active
      })}"
      @click=${() => selectDay(day)}
      role="gridcell"
      tabindex="-1"
      aria-label="${day.date}"
    >
      ${day.date}
    </div>`;
  };

  return html`<div class="days-grid" role="grid" aria-label="Calendar days">
    <div class="weekdays-header" role="row">
      ${weekdaysShort.map((shortDay) => 
        html`<div class="weekday-header" role="columnheader">${capitalizeFirstLetter(shortDay)}</div>`
      )}
    </div>
    <div class="days-body" role="rowgroup">
      ${daysPresentation?.map(dayContainer)}
    </div>
  </div>`;
};
