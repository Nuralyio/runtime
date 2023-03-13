/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import '../date-picker.component';

@customElement('hy-date-picker-demo')
export class HyDatePickerDemoElement extends LitElement {
  override render() {
    return html`
      <hy-datepicker></hy-datepicker>
      <div style="top : 130px; margin-top : 1050px">
        <hy-datepicker></hy-datepicker>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hy-date-picker-demo': HyDatePickerDemoElement;
  }
}
