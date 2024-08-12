import {html, TemplateResult} from 'lit';
import {DateRawObject, IDayPresentation, INavigationDate} from '../datepicker.types.js';
import {todayIsTheDay} from '../core/day.helper.js';
import {capitalizeFirstLetter} from '../core/string.helper.js';
import {getMonthDetails} from '../core/month.helper.js';
import dayjs from 'dayjs';
import {classMap} from 'lit/directives/class-map.js';
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

  const dayHeaderItem = (shortDay: string) =>
    html`<div class="day-header-item">${capitalizeFirstLetter(shortDay)}</div>`;

  const dayContainer = (day: IDayPresentation) => {
    const active = todayIsTheDay(day, dateRawObject, isRange) && day.valid;
    const isToday = currentYear == day.year && currentMonth == day.month + 1 && currentDay == day.date;

    return html`<div
      class="day-container ${classMap({'day-active': active, 'day-invalid': !day.valid, today: isToday})}"
      @click=${() => selectDay(day)}
    >
      ${day.date}
    </div>`;
  };

  return html`<div class="days-container">
    ${weekdaysShort.map(dayHeaderItem)} ${daysPresentation?.map(dayContainer)}
  </div>`;
};
