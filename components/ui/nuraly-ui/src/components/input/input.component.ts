/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import {LitElement, PropertyValueMap, html, nothing} from 'lit';
import {customElement, property, queryAssignedElements, state} from 'lit/decorators.js';
import {styles} from './input.style.js';
import {classMap} from 'lit/directives/class-map.js';

export enum INPUT_TYPE {
  EMAIL = 'email',
  PASSWORD = 'password',
  TEL = 'tel',
  TEXT = 'text',
  URL = 'url',
}
/**
 * An Input element.
 * @attr autofocus
 * @attr disabled
 * @attr autocomplete
 * @attr placeholder
 * @attr size
 *
 */

console.log('hy-input', styles);
@customElement('hy-input')
export class HyInputElement extends LitElement {
  // W3C standards

  @property({type: Boolean})
  disabled = false;

  @property({type: String})
  palceholder!: string;

  @property({type: String})
  alt!: string;

  @property({type: String})
  value = '';

  @property({type: String})
  size!: string;

  @property({type: String})
  autocomplete!: string; // on off

  @property({reflect: true})
  type = INPUT_TYPE.TEXT;

  @property({type: String})
  placeholder!: string; // on off

  @queryAssignedElements({slot: 'prefix', flatten: true})
  _prefixItems!: Array<HTMLElement>;

  @queryAssignedElements({
    slot: 'post',
    selector: 'hy-button',
  })
  _postItems!: Array<HTMLElement>;

  @queryAssignedElements({
    slot: 'pre',
    selector: 'hy-button',
  })
  _preItems!: Array<HTMLElement>;

  override firstUpdated() {
    for (const node of this._postItems) {
      node.setAttribute('usedas', 'post');
    }
    for (const node of this._preItems) {
      node.setAttribute('usedas', 'pre');
    }

    this.slottedClasses = {
      ...this.slottedClasses,
      prefixed: !!this._prefixItems.length,
      post: !!this._postItems.length,
      pre: !!this._preItems.length,
    };
    this.performUpdate();
  }

  @state()
  protected spanClasses: {
    inputfocuced?: boolean;
  } = {
    inputfocuced: false,
  };

  @state()
  protected slottedClasses: {
    prefixed?: boolean;
    pre?: boolean;
    post?: boolean;
    suffixed?: boolean;
  } = {
    prefixed: false,
    suffixed: false,
  };

  focusHandler(_event: FocusEvent) {
    this.spanClasses = {...this.spanClasses, inputfocuced: true};
  }

  blurHandler(_event: FocusEvent) {
    this.spanClasses = {...this.spanClasses, inputfocuced: false};
  }
  override updated(changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>) {
    super.updated(changedProperties);

    if (changedProperties.has('value')) {
      this.requestUpdate();
    }
  }

  override render() {
    return html`
      <slot name="pre"></slot>
      <span
        class="${classMap({...this.spanClasses, ...this.slottedClasses})}"
        data-size=${this.size ? this.size : nothing}
      >
        <slot name="prefix"></slot>
        <input
          .placeholder="${this.palceholder ?? nothing}"
          .value="${this.value}"
          type="${this.type}"
          @input=${(e: Event) => {
            this.dispatchEvent(
              new CustomEvent('valueChange', {
                detail: e.target,
              })
            );
          }}
          @focus=${(_event: FocusEvent) => this.focusHandler(_event)}
          @blur=${this.blurHandler}
          ?autofocus=${this.autofocus}
          placeholder=${this.placeholder ?? nothing}
        />
        <slot name="suffix"></slot>
      </span>
      <slot name="post"></slot>
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
