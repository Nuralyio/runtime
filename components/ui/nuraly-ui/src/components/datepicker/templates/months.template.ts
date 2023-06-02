import {html} from 'lit';
import {EMPTY_STRING} from '../constants';

interface ClickHandler {
  (index: number): void;
}

export const renderMonthsTemplate = (months: string[], currentMonth: number, clickHandler: ClickHandler) => {
  const monthContainer = (month: string, index: number) => {
    const active = currentMonth - 1 === index ? 'month-active' : EMPTY_STRING;

    return html` <div class="month-container ${active}" @click=${() => clickHandler(index)}>${month}</div> `;
  };

  return html` <div class="months-container">${months.map(monthContainer)}</div> `;
};
