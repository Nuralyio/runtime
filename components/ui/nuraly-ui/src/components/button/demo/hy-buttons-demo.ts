/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import '../hy-button.component';
@customElement('hy-buttons-demo')
export class ElButtonDemoElement extends LitElement {
  override render() {
    return html`
      <hy-button>Default Button</hy-button>
      <hy-button autofocus @click="${this._onClick}" type="danger"
        >Danger Button</hy-button
      >
      <hy-button @click="${this._onClick}" type="dashed"
        >Dashed Button</hy-button
      >
      <hy-button type="primary"><span>Primary Button</span></hy-button>
      <hy-button type="primary" ?disabled="${true}"
        ><span>Primary Button Disabled</span></hy-button
      >
      <hy-button icon="bars" type="text">Text Button</hy-button>
      <hy-button icon="user" type="link">Link Button</hy-button>
      <hy-button icon="user" type="primary"></hy-button>
      <hy-button icon="list" shape="circle" type="danger"></hy-button>
      <hy-button icon="user" shape="circle"></hy-button>
      <hy-button type="text">😅</hy-button>
      <hy-button type="primary" ?loading="${true}" icon="spinner"
        ><span>loading</span></hy-button
      >
      <div style="width : 450px ; margin-top : 15px">
        <hy-button type="primary" ?block="${true}"
          ><span>Primary Button block</span></hy-button
        >
        <hy-button ?block="${true}"
          ><span>Default Button block</span></hy-button
        >
        <hy-button ?block="${true}" icon="list"
          ><span>Default Button block width icon</span></hy-button
        >

        <hy-button ?block="${true}" ?loading="${true}" icon="spinner"
          ><span>Default Button block loaing</span></hy-button
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
    'hy-buttons-demo': ElButtonDemoElement;
  }
}
