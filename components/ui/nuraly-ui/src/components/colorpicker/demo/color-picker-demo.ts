/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import '../color-picker.component';
import '../../../helpers/ThemeHandler';

@customElement('hy-colorpicker-demo')
export class ColorDemoElement extends LitElement {
  override render() {
    return html`
      <theme-handler>
        <h3>Default</h3>
        <hy-color-picker
          @color-changed="${(e: CustomEvent) => {
            console.log(e.detail.value);
          }}"
        ></hy-color-picker>
        <br />
        <h3>With default color value</h3>
        <hy-color-picker
          .color="${'#E92222'}"
          @color-changed="${(e: CustomEvent) => {
            console.log(e.detail.value);
          }}"
        ></hy-color-picker>
        <br />
        <h3>With default color value and color sets</h3>
        <hy-color-picker
          .color="${'#ECDA1E'}"
          .defaultColorSets=${[
            '#264653',
            '#2a9d8f',
            '#e9c46a',
            '#f4a261',
            '#e76f51',
            '#e63946',
            '#f1faee',
            '#a8dadc',
            '#457b9d',
            '#1d3557',
          ]}
          @color-changed="${(e: CustomEvent) => {
            console.log(e.detail.value);
          }}"
        ></hy-color-picker>
        <br />
        <h3>Disabled color picker</h3>
        <hy-color-picker
          .disabled=${true}
          .color="${'#67d640'}"
          @color-changed="${(e: CustomEvent) => {
            console.log(e.detail.value);
          }}"
        ></hy-color-picker>

        <br />
        <h3>small color picker</h3>
        <hy-color-picker
          .color="${'#E92222'}"
          .size="${'small'}"
          @color-changed="${(e: CustomEvent) => {
            console.log(e.detail.value);
          }}"
        ></hy-color-picker>

        <br />
        <h3>large color picker</h3>
        <hy-color-picker
          .color="${'#ECDA1E'}"
          .size="${'large'}"
          @color-changed="${(e: CustomEvent) => {
            console.log(e.detail.value);
          }}"
        ></hy-color-picker>

        <br />
        <div style="margin-top:50%;">
          <hy-color-picker
            .color="${'#67d640'}"
            @color-changed="${(e: CustomEvent) => {
              console.log(e.detail.value);
            }}"
          ></hy-color-picker>
        </div>
        <br />
        <div style="margin-top:100%;">
          <hy-color-picker
            .color="${'#000000'}"
            @color-changed="${(e: CustomEvent) => {
              console.log(e.detail.value);
            }}"
          ></hy-color-picker>
        </div>
      </theme-handler>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hy-colorpicker-demo': ColorDemoElement;
  }
}
