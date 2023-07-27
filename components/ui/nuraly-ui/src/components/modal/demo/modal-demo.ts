/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import {LitElement, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';

import '../modal.component';

@customElement('hy-modals-demo')
export class ElMeenuElement extends LitElement {
  @state()
  isOpen = true;
  @state()
  modal1 = false;
  @state()
  modal2 = false;

  @state()
  modal1_1 = false;

  protected override render() {
    return html`
      <div id="overlay-container"></div>
      <button
        @click=${() => {
          this.modal1 = !this.modal1;
        }}
      >
        Toggle Modale</button
      >qsd
      <modal-component label="Modal Title" ?isOpen=${this.modal1}>
        <p>This is the content of the modal.</p>
        <div slot="footer">
          <button
            @click=${() => {
              this.modal2 = !this.modal2;
            }}
          >
            Custom Action
          </button>
        </div>

        <modal-component ?isOpen=${this.modal2} label="Modal Title 2">
          <div slot="footer">
            <h2>Modal Title</h2>
            <p>This is the content of the modal.</p>
            <button
              @click=${() => {
                this.modal2 = !this.modal2;
              }}
            >
              Close this modal
            </button>
          </div>
        </modal-component>
      </modal-component>

      <button
        @click=${() => {
          this.modal1_1 = !this.modal1_1;
        }}
      >
        Toggle Modale</button
      >qsd
      <modal-component ?isOpen=${this.modal1_1}>
        <h2>Modal Title</h2>
        <p>This is the content of the modal.lmjqsdmlqjsdlmjqsdmljqsdlmqjsdqs</p>
        <button
          @click=${() => {
            this.modal2 = !this.modal2;
          }}
        >
          Custom Action
        </button>
        <modal-component ?isOpen=${this.modal2}>
          <h2>Modal Title</h2>
          <p>This is the content of the modal.</p>
          <button>Custom Action</button>
        </modal-component>
      </modal-component>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hy-modals-demo': ElMeenuElement;
  }
}
