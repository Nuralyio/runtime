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
      <hy-button autofocus danger>Danger Button</hy-button>
      <hy-button type="primary" autofocus danger>Danger Button</hy-button>
      <hy-button type="dashed" danger>Danger Button</hy-button>
      <hy-button type="link">Link Button</hy-button>
      <hy-button type="link" disabled> disabled Link Button</hy-button>
      <hy-button type="link" danger>Link Danger Button</hy-button>
      <hy-button type="text" danger> Text Danger Button</hy-button>
      <hy-button type="text" disabled> Text disabled Danger Button</hy-button>
      <hy-button type="dashed">Dashed Button</hy-button>
      <hy-button type="dashed" danger>Dashed Button</hy-button>
      <hy-button type="dashed" disabled danger
        >danger disabled Dashed Button</hy-button
      >
      <hy-button type="primary"><span>Primary Button</span></hy-button>
      <hy-button type="primary" disabled
        ><span>Primary Button Disabled</span></hy-button
      >
      <hy-button icon="bars" type="text">Text Button</hy-button>
      <hy-button icon="user" type="link">Link Button</hy-button>
      <hy-button icon="user" type="primary"></hy-button>
      <hy-button icon="list" shape="circle" danger></hy-button>
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

      <hy-button size="small">Small Default Button</hy-button>
      <hy-button size="large">Large Default Button</hy-button>
      <hy-button icon="search" type="dashed" size="large"></hy-button>
      <hy-button icon="search" type="dashed" size="small"></hy-button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hy-buttons-demo': ElButtonDemoElement;
  }
}
