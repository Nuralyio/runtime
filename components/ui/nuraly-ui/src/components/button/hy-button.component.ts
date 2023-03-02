/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import {LitElement, html, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {ButtonType, EMPTY_STRING} from './hy-button.constats';
import {hostBlockStyle, styles} from './hy-button.style';

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
@customElement('hy-button')
export class HyButtonElement extends LitElement {
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
    const slott: HTMLSlotElement = this.shadowRoot?.querySelector(
      '#slot'
    ) as HTMLSlotElement;
    const slt = slott?.assignedNodes();
    if (slt.length === 0) {
      console.log(slott);
    } else {
      this.hasSlot = true;
      console.log('Content available', slt);
    }
  }
  override render() {
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

  static override styles = styles;
}

declare global {
  interface HTMLElementTagNameMap {
    'hy-button': HyButtonElement;
  }
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'hy-button':
        | React.DetailedHTMLProps<
            React.HTMLAttributes<HyButtonElement>,
            HyButtonElement
          >
        | Partial<HyButtonElement>;
    }
  }
}
