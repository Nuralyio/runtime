/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import {LitElement, html, css} from 'lit';
import {customElement} from 'lit/decorators.js';
import '../color-picker.component';
import '../../../helpers/ThemeHandler';

@customElement('hy-colorpicker-demo')
export class ColorDemoElement extends LitElement {
  static override styles = css`
    #right-block {
        right: 0;
        position: fixed;
    }
  `;

  override render() {
    return html`
      <theme-handler>
        <div style="display: flex;">
          <!-- Left Section -->
          <div>
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
          </div>

          <!-- Right Section -->
          <div id="right">
            <h3>Right Demo Section</h3>
            <hy-color-picker
              .color="${'#3498db'}"
              @color-changed="${(e: CustomEvent) => {
      console.log('Right side color changed:', e.detail.value);
    }}"
            ></hy-color-picker>
            <br />
            <h3>Another color picker</h3>
            <hy-color-picker
              id="right-block"
              
              .color="${'#9b59b6'}"
              @color-changed="${(e: CustomEvent) => {
      console.log('Right side color changed:', e.detail.value);
    }}"
            ></hy-color-picker>
            <br />
            <h3>Custom color set on the right</h3>
            <hy-color-picker
              .color="${'#f39c12'}"
              .defaultColorSets=${[
      '#8e44ad',
      '#e74c3c',
      '#2ecc71',
      '#f1c40f',
      '#3498db',
    ]}
              @color-changed="${(e: CustomEvent) => {
      console.log('Right side color changed:', e.detail.value);
    }}"
            ></hy-color-picker>
          </div>
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