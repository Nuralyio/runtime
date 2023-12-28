/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import {LitElement, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';

import '../select.component';
import '../../dropdown/hy-dropdown.component';
import '../../button/hy-button.component';
import '../../tabs/tabs.component';
import '../../input/input.component';

@customElement('hy-select-demo')
export class SlectDemoElement extends LitElement {
  @state()
  dropdwon2Selected!: any;
  @state()
  dropdwon4Selected!: any;

  @state()
  search = '';

  @state()
  dropdwon4isOpen!: boolean;

  placeholderDropdown2 = 'file';

  @state()
  options = [
    {
      label: 'name option 1',
    },
    {
      label: 'latname option 1',
    },
    {label: 'clear 2'},
    {
      label: 'hey 3',
    },
  ];

  @state()
  selectedOptions = [];
  override render() {
    return html`


    <hy-select .options=${this.options}  @changed=${(e: any) => {
      this.selectedOptions = e.detail.value;
      console.log(this.selectedOptions);
    }}> <hy-button icon="filter"
   
    >${this.selectedOptions.length ? this.selectedOptions.length : ' '}</hy-button></hy-select>

    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hy-select-demo': SlectDemoElement;
  }
}
