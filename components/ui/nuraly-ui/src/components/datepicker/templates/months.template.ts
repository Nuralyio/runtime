import {html} from 'lit';
import {EMPTY_STRING} from '../constants';

export const renderMonthsTemplate = (months: string[], currentMonth: number, clickHandler: Function) => {
  return html`
    <div class="months-container">
      ${months.map((month, index) => {
        return html`
          <div
            class="month-container ${currentMonth - 1 == index ? 'month-active' : EMPTY_STRING}"
            @click=${() => clickHandler(index)}
          >
            ${month}
          </div>
        `;
      })}
    </div>
  `;
};
