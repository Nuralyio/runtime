import {html} from 'lit';

export const renderDayHeaderTemplate = () => {
  return ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(
    (shortDay: string) => html`<div class="day-header-item">${shortDay}</div>`
  );
};
