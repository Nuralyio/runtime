/**
 * @license
 * Copyright 2023 HybridUI, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import {html, LitElement, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ButtonType, EMPTY_STRING, IconPosition} from './hy-button.constants.js';
import {styles} from './hy-button.style.js';

@customElement('hy-button')
export class HyButtonElement extends LitElement {
  @property({type: Boolean})
  disabled = false;

  @property({type: Boolean})
  loading = false;

  @property({type: String})
  size = EMPTY_STRING;

  @property({type: String})
  type = ButtonType.Default as String;

  @property({type: Boolean})
  dashed = false;

  @property({type: String})
  icon!: string[];

  @property({reflect: true})
  iconPosition = IconPosition.Left;

  override render() {
    return html`
      <button
        ?disabled="${this.disabled}"
        data-type="${this.type}"
        data-size=${this.size ? this.size : nothing}
        data-state="${this.loading ? 'loading' : nothing}"
        class="${this.dashed ? 'button-dashed' : nothing}"
      >
        <span id="container">
          ${this.icon?.length ? html` <hy-icon name=${this.icon[0]}></hy-icon>` : nothing}
          <slot id="slot"></slot>
          ${this.icon?.length == 2 ? html` <hy-icon name=${this.icon[1]}></hy-icon>` : nothing}
        </span>
      </button>
    `;
  }
  static override styles = styles;
}
