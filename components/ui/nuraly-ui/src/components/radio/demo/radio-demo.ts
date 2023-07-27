/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import {LitElement, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import '../radio.component';
import {RadioOption} from '../radio.type';
@customElement('hy-radios-demo')
export class RadioComponentDemo extends LitElement {
  @state()
  options: RadioOption[] = [
    {
      label: 'Option 1',
      value: 'option1',
    },
    {
      label: 'Option 2',
      value: 'option2',
    },
    {
      label: 'Option 3',
      value: 'option3',
    },
  ];

  optionsExample2: RadioOption[] = [
    {
      label: 'Option 1',
      value: 'option1',
    },
    {
      label: 'Option 2',
      value: 'option2',
    },
    {
      label: 'Option 3',
      value: 'option3',
    },
    {
      label: 'Option 4',
      value: 'option 4',
    },
  ];
  override render() {
    return html`
      <hy-radio-input .options=${this.options}></hy-radio-input>
      <br />
      <br />
      <br />
      <hy-radio-input display="button" .options=${this.options}></hy-radio-input>
      <br />
      <br />
      <hy-radio-input display="button" .options=${this.optionsExample2}></hy-radio-input>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hy-radios-demo': RadioComponentDemo;
  }
}
