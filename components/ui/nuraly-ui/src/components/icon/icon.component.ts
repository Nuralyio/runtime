/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @license
 * Copyright 2023 HybridUI Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {library, dom} from '@fortawesome/fontawesome-svg-core';
import {far} from '@fortawesome/free-regular-svg-icons';
import {fas} from '@fortawesome/free-solid-svg-icons';
library.add(fas, far);
dom.watch();

import {styles} from './icon.style';
import {IconTypes, regularIconPack, solidIconPack} from './icon.types';

@customElement('hy-icon')
export class HyIconElement extends LitElement {
  @property({type: String})
  name!: string;
  @property()
  type = IconTypes.Solid;

  static override readonly styles = styles;
  override render() {
    return html`
      <svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 550 550">
        <path d="${this.getIconPath()}" />
      </svg>
    `;
  }
  getIconPath() {
    const iconPack = this.type == IconTypes.Solid ? solidIconPack : regularIconPack;
    const iconDefinition = (library as any).definitions[iconPack][this.name];
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
