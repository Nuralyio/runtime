/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import '../select.component';
import '../../dropdown/hy-dropdown.component';
import '../../button/nr-button.component';
import '../../tabs/tabs.component';
import '../../input/input.component';

@customElement('hy-select-demo')
export class SlectDemoElement extends LitElement {
  @state()
  options = [
    {value: 'abuja', label: 'Abuja'},
    {value: 'duplin', label: 'Duplin'},
    {value: 'nairobi', label: 'Nairobi'},
    {value: 'beirut', label: 'Beirut'},
    {value: 'prague', label: 'Prague'},
    {value: 'marrakech', label: 'Marrakech'},
    {value: 'buenos aires', label: 'Buenos Aires'},
  ];

  @state()
  selectedOptions = [];
  override render() {
    return html`
      <h3>Default: single selection without default values</h3>
      <hy-select
        .options=${this.options}
        @changed=${(e: any) => {
          this.selectedOptions = e.detail.value;
          console.log(this.selectedOptions);
        }}
      >
      </hy-select>
      <br /><br />
      <br /><br />

      <hr />
      <br /><br />
      <h3>single selection with default values</h3>

      <hy-select
        .options=${this.options}
        .defaultSelected="${['Duplin']}"
        @changed=${(e: any) => {
          this.selectedOptions = e.detail.value;
          console.log(this.selectedOptions);
        }}
      >
      </hy-select>
      <br /><br />
      <br /><br />

      <hr />
      <br /><br />
      <h3>Disabled</h3>

      <hy-select
        .options=${this.options}
        .disabled=${true}
        @changed=${(e: any) => {
          this.selectedOptions = e.detail.value;
          console.log(this.selectedOptions);
        }}
      >
        <span slot="label">disabled input</span>
        <span slot="helper-text">helper</span>
      </hy-select>

      <br /><br />
      <br /><br />
      <hr />
      <br /><br />
      <h3>Multiple selection without default values</h3>

      <hy-select
        selectionMode="multiple"
        .options=${this.options}
        @changed=${(e: any) => {
          this.selectedOptions = e.detail.value;
          console.log(this.selectedOptions);
        }}
      >
        <span slot="label">Selection mode: multiple</span>
      </hy-select>
      <br /><br />
      <br /><br />
      <hr />
      <br /><br />
      <h3>single selection with default value</h3>

      <hy-select
        .defaultSelected="${['Abuja']}"
        .options=${this.options}
        @changed=${(e: any) => {
          this.selectedOptions = e.detail.value;
          console.log(this.selectedOptions);
        }}
      >
        <span slot="label">Selection mode: single, default selected: Abuja</span>
      </hy-select>
      <br /><br />
      <br /><br />
      <hr />
      <br /><br />
      <h3>Multiple selection with default values and empty placeholder</h3>
      <hy-select
        selectionMode="multiple"
        placeholder=""
        .defaultSelected="${['Abuja', 'Nairobi']}"
        .options=${this.options}
        @changed=${(e: any) => {
          this.selectedOptions = e.detail.value;
          console.log(this.selectedOptions);
        }}
      >
        <span slot="label">Selection Mode: multiple</span>
      </hy-select>
      <br /><br />
      <br /><br />
      <hr />
      <br /><br />
      <h3>Default with warning status</h3>
      <hy-select
        status="warning"
        .options=${this.options}
        @changed=${(e: any) => {
          this.selectedOptions = e.detail.value;
          console.log(this.selectedOptions);
        }}
      >
        <span slot="label">warning status</span>
      </hy-select>
      <br /><br />
      <br /><br />
      <h3>Disabled with warning status</h3>
      <hy-select
        status="warning"
        .disabled=${true}
        .options=${this.options}
        @changed=${(e: any) => {
          this.selectedOptions = e.detail.value;
          console.log(this.selectedOptions);
        }}
      >
        <span slot="label">warning status</span>
      </hy-select>
      <br /><br />
      <br /><br />
      <hr />
      <br /><br />
      <h3>Default with error status</h3>
      <hy-select
        status="error"
        .options=${this.options}
        @changed=${(e: any) => {
          this.selectedOptions = e.detail.value;
          console.log(this.selectedOptions);
        }}
      >
        <span slot="label">label</span>
        <span slot="helper-text">error status</span>
      </hy-select>
      <br /><br />
      <br /><br />
      <hr />
      <h3>Disabledwith error status</h3>
      <hy-select
        .disabled=${true}
        status="error"
        .options=${this.options}
        @changed=${(e: any) => {
          this.selectedOptions = e.detail.value;
          console.log(this.selectedOptions);
        }}
      >
        <span slot="label">label</span>
        <span slot="helper-text">error status</span>
      </hy-select>
      <br /><br />
      <br /><br />
      <hr />
      <br /><br />
      <h3>Default and type inline</h3>

      <hy-select
        type="inline"
        .options=${this.options}
        @changed=${(e: any) => {
          this.selectedOptions = e.detail.value;
          console.log(this.selectedOptions);
        }}
      >
        <span slot="label">type inline</span>
        <span slot="helper-text">label</span>
      </hy-select>
      <br /><br />
      <br /><br />

      <hr />
      <br /><br />
      <h3>Default with small size</h3>

      <hy-select
        size="small"
        .options=${this.options}
        @changed=${(e: any) => {
          this.selectedOptions = e.detail.value;
          console.log(this.selectedOptions);
        }}
      >
        <span slot="label">small select</span>
      </hy-select>
      <br /><br />
      <br /><br />

      <hr />
      <br /><br />
      <h3>Default with large size</h3>
      <hy-select
        size="large"
        .options=${this.options}
        @changed=${(e: any) => {
          this.selectedOptions = e.detail.value;
          console.log(this.selectedOptions);
        }}
      >
        <span slot="label">large select</span>
      </hy-select>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hy-select-demo': SlectDemoElement;
  }
}
