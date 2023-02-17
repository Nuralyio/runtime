/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import './el-button.component';
@customElement('el-buttons-demo')
export class ElButtonDemoElement extends LitElement {
  override render() {
    return html`
      <el-button>Primary Button</el-button>
      <el-button autofocus @click="${this._onClick}" type="danger"
        >Danger Button</el-button
      >
      <el-button @click="${this._onClick}" type="dashed"
        >Dashed Button</el-button
      >
      <el-button type="primary"><span>Primary Button</span></el-button>
      <el-button icon="bars" type="text">Text Button</el-button>
      <el-button icon="user" type="link">Link Button</el-button>
      <el-button icon="user" type="primary"></el-button>
      <el-button icon="user" shape="circle" type="primary"></el-button>
      <el-button type="text">😅</el-button>
    `;
  }
  private _onClick() {
    alert('clicked');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'el-buttons-demo': ElButtonDemoElement;
  }
}
