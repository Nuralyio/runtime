import {html} from 'lit';
import {EMPTY_STRING} from '../constants';

export const renderYearsTemplate = (currentYear: number, clickHandler: Function) => {
  return html`
    <div class="years-container">
      ${Array.from({length: 12}, (_v, i) => i + (currentYear - 6)).map((year, _index) => {
        return html`
          <div
            class="year-container ${currentYear == year ? 'year-active' : EMPTY_STRING}"
            @click=${() => clickHandler(year)}
          >
            ${year}
          </div>
        `;
      })}
    </div>
  `;
};
