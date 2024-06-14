/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import {LitElement, html, nothing} from 'lit';
import {customElement, property, query, state} from 'lit/decorators.js';
import {styles} from './input.style.js';
import {INPUT_TYPE, INPUT_STATE, INPUT_SIZE, EMPTY_STRING} from './input.constant.js';
import {choose} from 'lit/directives/choose.js';

@customElement('hy-input')
export class HyInputElement extends LitElement {
  // W3C standards

  @property({type: Boolean, reflect: true})
  disabled = false;

  @property({type: String, reflect: true})
  state = INPUT_STATE.Default;

  @property({type: String})
  value = EMPTY_STRING;

  @property({type: String})
  size = INPUT_SIZE.Medium;

  @property({reflect: true})
  type = INPUT_TYPE.TEXT;

  @property({type: String})
  step!: string;

  @property({type: String})
  min!: string;

  @property({type: String})
  max!: string;

  @property({type: String})
  placeholder = EMPTY_STRING;

  @state()
  inputType = EMPTY_STRING;

  @query('#input')
  input!: HTMLInputElement;

  override connectedCallback(): void {
    super.connectedCallback();
    this.inputType = this.type;
    if (this.inputType == INPUT_TYPE.NUMBER) if (this.min && !this.value) this.value = this.min;
  }

  private _increment() {
    this.input.stepUp();
  }
  private _decrement() {
    this.input.stepDown();
  }

  private _valueChange(e: Event) {
    this.dispatchEvent(
      new CustomEvent('valueChange', {
        detail: e.target,
      })
    );
  }

  private _focusEvent(e: Event) {
    this.dispatchEvent(
      new CustomEvent('focused', {
        detail: e.target,
      })
    );
  }

  _togglePasswordIcon() {
    if (this.inputType == INPUT_TYPE.PASSWORD) this.inputType = INPUT_TYPE.TEXT;
    else if (this.inputType == INPUT_TYPE.TEXT) this.inputType = INPUT_TYPE.PASSWORD;
  }

  override render() {
    return html`
      <slot name="label"></slot>
      <div data-size=${this.size} id="input-container">
        <input
          id="input"
          .disabled=${this.disabled}
          .value=${this.value}
          .placeholder=${this.placeholder}
          .step=${this.step ? this.step : nothing}
          .min=${this.min ? this.min : nothing}
          .max=${this.max ? this.max : nothing}
          .type="${this.inputType}"
          @input=${this._valueChange}
          @focus=${this._focusEvent}
        />
        ${choose(this.state, [
          [INPUT_STATE.Default, () => undefined],
          [INPUT_STATE.Warning, () => html`<hy-icon name="warning" id="warning-icon"></hy-icon>`],
          [INPUT_STATE.Error, () => html`<hy-icon name="exclamation-circle" id="error-icon"></hy-icon>`],
        ])}
        ${this.type == INPUT_TYPE.PASSWORD
          ? choose(this.inputType, [
              [
                INPUT_TYPE.TEXT,
                () =>
                  html`<hy-icon
                    name="eye-slash"
                    type="regular"
                    id="password-icon"
                    @click=${!this.disabled ? this._togglePasswordIcon : nothing}
                  ></hy-icon>`,
              ],
              [
                INPUT_TYPE.PASSWORD,
                () =>
                  html`<hy-icon
                    name="eye"
                    type="regular"
                    id="password-icon"
                    @click=${!this.disabled ? this._togglePasswordIcon : nothing}
                  ></hy-icon>`,
              ],
            ])
          : this.type == INPUT_TYPE.NUMBER
          ? html`
              <div id="number-icons">
                ${this.state != INPUT_STATE.Default ? html`<span id="icons-separator">|</span>` : nothing}
                <hy-icon name="minus" @click=${!this.disabled ? this._decrement : nothing}></hy-icon>
                <span id="icons-separator">|</span>
                <hy-icon name="plus" @click=${!this.disabled ? this._increment : nothing}></hy-icon>
              </div>
            `
          : nothing}
      </div>
      <slot name="helper-text"></slot>
    `;
  }

  static override styles = styles;
}

declare global {
  interface HTMLElementTagNameMap {
    'hy-input': HyInputElement;
  }
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'hy-input':
        | React.DetailedHTMLProps<React.HTMLAttributes<HyInputElement>, HyInputElement>
        | Partial<HyInputElement>;
    }
  }
}
