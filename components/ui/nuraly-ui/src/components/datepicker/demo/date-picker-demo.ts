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
      <hy-datepicker
        locale=${this.selectedLanguage}
        fieldFormat="DD/MM/YYYY"
        dateValue="20/11/2024"
        dateplaceholder="20.11.2024"
      ></hy-datepicker>
      <!-- <div style="top : 130px; margin-top : 350px; margin-bottom : 44px">
        <hy-datepicker></hy-datepicker>
      </div> -->
      <div style="top : 130px; margin-top : 1050px; margin-bottom : 44px">
        <hy-datepicker></hy-datepicker>
      </div>
      <div style="top : 130px; margin-top : 450px; margin-bottom : 44px">
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
