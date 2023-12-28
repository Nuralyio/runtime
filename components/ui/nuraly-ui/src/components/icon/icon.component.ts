/**
 * @license
 * Copyright 2023 HybridUI Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { library, dom } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons'
library.add(fas);
dom.watch(); 

import styles from './icon.style.js';

/**
 * An Icon element.
 *
 * @attr name
 */
@customElement('hy-icon')
export class HyIconElement extends LitElement {
  @property({ type: String })
  name!: string;

  static override  styles = styles;
  override render() {
    return html`
         <svg class="svg-icon" style="fill: white;width: 14px;
    height: 15px;"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 550 550"
          >
            <path d="${this.getIconPath()}"/>
          </svg>
    `;
  }
  getIconPath() {
    const iconDefinition = (library as any).definitions.fas[this.name]
    return iconDefinition ? iconDefinition[4] : '';
  }
}



declare global {
  interface HTMLElementTagNameMap {
    'hy-icon': HyIconElement;
  }
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'hy-icon': React.DetailedHTMLProps<React.HTMLAttributes<HyIconElement>, HyIconElement> | Partial<HyIconElement>;
    }
  }
}
