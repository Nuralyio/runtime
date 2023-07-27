/* eslint-disable @typescript-eslint/no-explicit-any */
import {html} from 'lit';

export const addTabTemplate = (handlers: any) => {
  return html` <div
    class="tab-label add-tab-label"
    @click=${() => {
      handlers.clickHandler();
    }}
  >
    <hy-icon name="plus"></hy-icon>
  </div>`;
};
