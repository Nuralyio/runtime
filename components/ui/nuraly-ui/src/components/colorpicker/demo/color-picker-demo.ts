/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import '../color-picker.component'
@customElement('hy-colorpicker-demo')
export class ColorDemoElement extends LitElement {
  override render() {
    return html`
    <hy-color-picker
    .color="${'#67d640'}"
    @color-changed="${(e: CustomEvent) => {
    		console.log(e.detail.value)	
    } }"
    ></hy-color-picker>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hy-colorpicker-demo': ColorDemoElement;
  }
}
