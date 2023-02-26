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
      <el-button>Default Button</el-button>
      <el-button autofocus @click="${this._onClick}" type="danger"
        >Danger Button</el-button
      >
      <el-button @click="${this._onClick}" type="dashed"
        >Dashed Button</el-button
      >
      <el-button type="primary"><span>Primary Button</span></el-button>
      <el-button type="primary" ?disabled="${true}"
        ><span>Primary Button Disabled</span></el-button
      >
      <el-button icon="bars" type="text">Text Button</el-button>
      <el-button icon="user" type="link">Link Button</el-button>
      <el-button icon="user" type="primary"></el-button>
      <el-button icon="list" shape="circle" type="danger"></el-button>
      <el-button icon="user" shape="circle"></el-button>
      <el-button type="text">😅</el-button>
      <el-button type="primary" ?loading="${true}" icon="spinner"
        ><span>loading</span></el-button
      >
      <div style="width : 450px ; margin-top : 15px">
        <el-button type="primary" ?block="${true}"
          ><span>Primary Button block</span></el-button
        >
        <el-button ?block="${true}"
          ><span>Default Button block</span></el-button
        >
        <el-button ?block="${true}" icon="list"
          ><span>Default Button block width icon</span></el-button
        >

        <el-button ?block="${true}" ?loading="${true}" icon="spinner"
          ><span>Default Button block loaing</span></el-button
        >
      </div>
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
