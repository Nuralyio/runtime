/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

/**
 * An Icon element.
 *
 * @attr name
 */
@customElement('hy-icon')
export class HyIconElement extends LitElement {
  @property({type: String})
  name!: string;

  override render() {
    return html`
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.2/css/all.min.css"
      />

      <i class="fa fa-${this.name}"></i>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hy-icon': HyIconElement;
  }
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'hy-icon':
        | React.DetailedHTMLProps<
            React.HTMLAttributes<HyIconElement>,
            HyIconElement
          >
        | Partial<HyIconElement>;
    }
  }
}
