/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import '../input.component';
@customElement('hy-inputs-demo')
export class ElButtonDemoElement extends LitElement {
  changeHandler(_e: unknown) {
    console.log(_e);
  }
  override render() {
    return html` <style></style>
      <div>
        <hy-input placeholder="text placeholder" @valueChange=${this.changeHandler} size="large">
          <span slot="prefix">
            <hy-icon name="user"></hy-icon>
          </span>
        </hy-input>
        <br />
        <hy-input placeholder="text placeholder" @focus=${() => {}}>
          <span slot="prefix">
            <hy-icon name="user"></hy-icon>
          </span>
        </hy-input>
        <br />
        <hy-input placeholder="text placeholder" @focus=${() => {}} size="small">
          <span slot="prefix">
            <hy-icon name="user"></hy-icon>
          </span>
        </hy-input>

        <br />
        <hy-input placeholder="text placeholder" @focus=${() => {}} size="small">
          <span slot="suffix">
            <hy-icon name="check"></hy-icon>
          </span>
        </hy-input>

        <br />
        <hy-input placeholder="text placeholder" @focus=${() => {}} size="small">
          <span slot="suffix">
            <hy-icon name="times-circle"></hy-icon>
          </span>
        </hy-input>

        <br />
        <hy-input placeholder="text placeholder" @focus=${() => {}}>
          <span slot="prefix">
            <hy-icon name="user"></hy-icon>
          </span>
          <span slot="suffix">
            <hy-icon name="times-circle"></hy-icon>
          </span>
        </hy-input>

        <br />
        <hy-input placeholder="text placeholder" @focus=${() => {}}>
          <span slot="prefix">
            <hy-icon name="user"></hy-icon>
          </span>
          <span slot="suffix">
            <hy-icon name="spinner"></hy-icon>
          </span>
        </hy-input>
        <br />
        <hy-input placeholder="text placeholder" @focus=${() => {}}>
          <span slot="suffix">
            <hy-icon name="copy"></hy-icon>
          </span>
        </hy-input>
        <br />
        <hy-input placeholder="text placeholder" @focus=${() => {}}>
          <span slot="prefix">
            <hy-icon name="user"></hy-icon>
          </span>
          <span slot="post"></span>
        </hy-input>
        <br />
        <hy-input placeholder="text placeholder" @focus=${() => {}}>
          <span slot="prefix">
            <hy-icon name="user"></hy-icon>
          </span>
          <hy-button slot="pre" icon="search"></hy-button>
          <hy-button slot="post" icon="search"></hy-button>

          <span slot="pre"></span>
        </hy-input>

        <br />
        <hy-input placeholder="text placeholder" size="large" @focus=${() => {}}>
          <span slot="prefix">
            <hy-icon name="user"></hy-icon>
          </span>
          <hy-button slot="pre" icon="search"></hy-button>
          <hy-button slot="post" icon="search"></hy-button>
          <hy-icon slot="suffix" name="copy"></hy-icon>
          <span slot="pre"></span>
        </hy-input>
      </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hy-inputs-demo': ElButtonDemoElement;
  }
}
