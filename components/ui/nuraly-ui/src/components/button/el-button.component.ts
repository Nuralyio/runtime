/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import {LitElement, html, css, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {ButtonType, EMPTY_STRING} from './constats';

/**
 * An Button element.
 *
 * @fires onClick - Indicates when the count changes
 * @slot - This element has a slot
 * @csspart button - The button
 * @attr type
 * @attr autofocus
 * @attr icon
 * @attr shape
 * @attr loading
 * @attr disabled
 * @attr block
 */
@customElement('el-button')
export class ElButtonElement extends LitElement {
  @property({type: Boolean})
  disabled = false;

  @property({type: Boolean})
  loading = false;

  /**
   * Styles
   */

  @property({type: String})
  display = EMPTY_STRING;
  @property({type: Boolean})
  block = false;
  @property({type: String})
  size = EMPTY_STRING;
  @property({type: String})
  type = ButtonType.Default as String;

  @property({type: String})
  shape = EMPTY_STRING;

  @property({type: String})
  icon = EMPTY_STRING;

  /**
   * Content
   */
  @property({type: String})
  link = EMPTY_STRING;
  @property({type: String})
  target = EMPTY_STRING;
  @state()
  hasSlot = false;

  static override get properties() {
    return {
      hasSlot: {attribute: false},
    };
  }
  override firstUpdated() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const slott: any = this.shadowRoot?.querySelector('#slot');
    const slt = slott?.assignedNodes();
    if (slt.length === 0) {
      console.log(slott);
    } else {
      this.hasSlot = true;
      console.log('Content available', slt);
    }
  }
  override render() {
    const hostBlockStyle = html`<style>
      :host {
        width: 100%;
      }
    </style>`;
    return html`
      ${this.block ? hostBlockStyle : nothing}
      <button
        ?disabled="${this.disabled}"
        ?autofocus=${this.autofocus}
        data-type="${this.type}"
        data-display=${this.block ? 'block' : nothing}
        data-state="${this.loading ? 'loading' : nothing}"
        class="
        ${this.shape === 'circle' ? 'rounded' : EMPTY_STRING}
      ${!this.hasSlot ? 'icon-only' : EMPTY_STRING}
      "
      >
        ${this.icon &&
        html` <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.2/css/all.min.css"
          /><i class="fa fa-${this.icon}"></i>`}
        <slot id="slot"></slot>
      </button>
    `;
  }

  static override styles = css`
    svg {
      fill: red;
    }

    .icon-only {
      width: 32px;
      padding-left: 0.6rem;
    }

    .rounded {
      border-radius: 50%;
    }
    button[data-state='loading'] {
      opacity: 0.5;
    }

    button {
      display: inline-block;

      user-select: none;
      padding-top: var(--hybrid-button-padding-y, 0.5rem);
      padding-bottom: var(--hybrid-button-padding-y, 0.5rem);
      padding-right: var(--hybrid-button-padding-x, 0.8rem);
      padding-left: var(--hybrid-button-padding-x, 0.8rem);
      border-radius: var(--hybrid-button-border-radius, 0.25rem);
      border-width: var(--hybrid-button-border-width, 1px);
      border-color: var(--hybrid-button-border-color, #d0d0d0);
      background-color: var(--hybrid-button-background-color, #f9f9f9);
      border-style: solid;
      color: var(--hybrid-button-text-color, #393939);
      font-size: var(--hybrid-button-font-size, 0.8rem);
      font-weight: var(--hybrid-button-font-weight, normal);
      text-transform: var(--hybrid-button-text-transform, none);
    }
    button:hover:not(:disabled) {
      cursor: pointer;
      background-color: var(--hybrid-button-hover-background-color, #f9f9f9);
      color: var(--hybrid-button-hover-text-color, #303030);
      border-color: var(--hybrid-button-hover-border-color, #666666);
    }
    button:focus {
      outline: none;
      border-color: var(--hybrid-button-ring-color, #12c9e9);
    }
    :host([disabled]) button {
      cursor: auto;
      background-color: var(--hybrid-button-disabled-background-color, #ccc);
      color: var(--hybrid-button-disabled-text-color, #999);
      border-color: var(--hybrid-button-disabled-border-color, #bbb);
    }
    :host([disabled]) button:focus {
      outline: none;
      box-shadow: none;
    }
    :host([disabled]) button:active:not(:disabled) {
      outline: none;
      border-color: #aaa;
      box-shadow: none;
    }

    /** Danger button */
    button[data-type='danger'] {
      border-color: var(--hybrid-button-border-color, #ff1717);
      background-color: var(--hybrid-button-danger-background-color, #ff1717);
      color: var(--hybrid-button-danger-text-color, #ffffff);
    }

    button[data-type='danger']:hover:not(:disabled) {
      cursor: pointer;
      background-color: var(
        --hybrid-button-danger-hover-background-color,
        #ed5151
      );
      border-color: var(--hybrid-button-danger-hover-border-color, #ff1717);
    }
    /** End Danger button*/

    /** Primary button */
    button[data-type='primary'] {
      border-color: var(--hybrid-button-primary-border-color, #123eff);
      background-color: var(--hybrid-button-primary-background-color, #123eff);
      color: var(--hybrid-button-primary-text-color, #ffffff);
    }

    button[data-type='primary']:hover:not(:disabled) {
      cursor: pointer;
      background-color: var(
        --hybrid-button-primary-hover-background-color,
        #0a70ff
      );
      border-color: var(--hybrid-button-primary-hover-border-color, #1677ff);
    }
    button[data-type='primary']:active:not(:disabled) {
      cursor: pointer;
      background-color: var(
        --hybrid-button-primary-hover-background-color,
        #0559cf
      );
      border-color: var(--hybrid-button-primary-hover-border-color, #1677ff);
    }
    /** End Primary button*/

    /** Dashed button */
    button[data-type='dashed'] {
      border-style: dashed;
    }

    button[data-type='dashed']:hover:not(:disabled) {
      cursor: pointer;

      border-color: var(--hybrid-button-dashed-hover-border-color, #1677ff);
      color: var(--hybrid-button-dashed-hover-border-color, #1677ff);
    }
    button[data-type='dashed']:active:not(:disabled) {
      cursor: pointer;
      border-color: var(--hybrid-button-dashed-hover-border-color, #1677ff);
    }
    /** End Dashed button*/

    /** text button */
    button[data-type='text'] {
      border: none;
    }
    button[data-type='text']:hover:not(:disabled) {
      cursor: pointer;

      background-color: var(--hybrid-button-text-hover-border-color, #e1e1e1);
      //color: var(--hybrid-button-text-hover-border-color, #1677ff);
    }
    button[data-type='text']:active:not(:disabled) {
      cursor: pointer;
      background-color: var(--hybrid-button-text-hover-border-color, #c1c1c1);
    }
    /** End Dashed button*/

    /** link button */
    button[data-type='link'] {
      border: none;
      color: var(--hybrid-button-link-hover-border-color, #1677ff);
      background-color: transparent;
    }
    button[data-type='link']:hover:not(:disabled) {
      cursor: pointer;
      color: var(--hybrid-button-link-hover-border-color, #4a96ff);
    }
    button[data-type='link']:active:not(:disabled) {
      cursor: pointer;
      color: var(--hybrid-button-link-hover-border-color, #0862df);
    }
    /** End Dashed button*/

    /** text button */
    button[data-type='text'] {
      border-style: text;
    }

    button[data-type='text']:hover:not(:disabled) {
      cursor: pointer;
    }
    button:disabled:hover {
      cursor: not-allowed;
    }

    button[data-display='block'] {
      width: 100%;
    }

    button[data-display='block'] :host {
      width: 100%;
      display: inline-block;
    }
    /** End Dashed button*/

    :host {
      user-select: none;
      -webkit-user-select: none;
      display: inline-block;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'el-button': ElButtonElement;
  }
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'el-button':
        | React.DetailedHTMLProps<
            React.HTMLAttributes<ElButtonElement>,
            ElButtonElement
          >
        | Partial<ElButtonElement>;
    }
  }
}
