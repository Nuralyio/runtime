/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('el-buttons-demo')
export class ElButtonDemoElement extends LitElement {

    override render() {
        return html`
        <el-button>Primary Button</el-button>
        <el-button @count-changed="${this._onClick}"  type="danger">Danger Button</el-button>
        <el-button type="primary" >Primary Button</el-button>
        `;
    }
    private _onClick() {
       alert('clicked')
      }
}

declare global {
  interface HTMLElementTagNameMap {
    'el-buttons-demo': ElButtonDemoElement;
  }
}