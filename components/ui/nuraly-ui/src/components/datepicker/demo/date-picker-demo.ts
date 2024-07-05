/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import {LitElement, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import '../date-picker.component';

@customElement('hy-date-picker-demo')
export class HyDatePickerDemoElement extends LitElement {
  @state()
  selectedLanguage = 'en';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _onLanguageSelected(event: any) {
    this.selectedLanguage = event.target.value;
    // Émettre un événement "language-selected" avec la langue sélectionnée
  }
  override render() {
    return html`
      <!-- <hy-datepicker></hy-datepicker> -->
      <select @change=${this._onLanguageSelected}>
        <option value="en" ?selected=${this.selectedLanguage === 'en'}>English</option>
        <option value="fr" ?selected=${this.selectedLanguage === 'fr'}>Français</option>
        <option value="es" ?selected=${this.selectedLanguage === 'es'}>Español</option>
        <option value="zh" ?selected=${this.selectedLanguage === 'zh'}>中文</option>
        <option value="ar" ?selected=${this.selectedLanguage === 'ar'}>العربية</option>
      </select>
      <h3>datepicker Default</h3>

      <hy-datepicker
        locale=${this.selectedLanguage}
        fieldFormat="DD/MM/YYYY"
        @date-change=${(e: CustomEvent) => {
          console.log('event ', e);
        }}
      ></hy-datepicker>
      <br />
      <h3>datepicker with init date</h3>

      <hy-datepicker locale=${this.selectedLanguage} fieldFormat="DD/MM/YYYY" dateValue="20/11/2024"></hy-datepicker>
      <br />
      <h3>datepicker mm/dd/yy</h3>

      <hy-datepicker locale=${this.selectedLanguage} fieldFormat="MM/DD/YYYY"></hy-datepicker>
      <br />
      <h3>datepicker small</h3>

      <hy-datepicker locale=${this.selectedLanguage} fieldFormat="DD/MM/YYYY" size="small"></hy-datepicker>
      <br />
      <h3>datepicker large</h3>

      <hy-datepicker locale=${this.selectedLanguage} fieldFormat="DD/MM/YYYY" size="large"></hy-datepicker>
      <br />
      <h3>datepicker with error</h3>

      <hy-datepicker
        locale=${this.selectedLanguage}
        fieldFormat="DD/MM/YYYY"
        state="error"
        label="date label"
        helper="date error"
      ></hy-datepicker>
      <br />
      <h3>datepicker with warning</h3>

      <hy-datepicker
        locale=${this.selectedLanguage}
        fieldFormat="DD/MM/YYYY"
        state="warning"
        label="labeled date"
        helper="date helper"
      ></hy-datepicker>
      <br />
      <h3>datepicker disabled</h3>

      <hy-datepicker locale=${this.selectedLanguage} fieldFormat="DD/MM/YYYY" disabled=${true}></hy-datepicker>
      <br />
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hy-date-picker-demo': HyDatePickerDemoElement;
  }
}
