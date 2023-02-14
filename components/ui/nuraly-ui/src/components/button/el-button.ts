/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
/**
 * An Button element.
 *
 * @fires count-changed - Indicates when the count changes
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('el-button')
export class ElButtonElement extends LitElement {
  static override styles = css`
    :host {
      }
      button {
        user-select: none;
        padding-top: var(--dile-button-padding-y, 0.5rem);
        padding-bottom: var(--dile-button-padding-y, 0.5rem);
        padding-right: var(--dile-button-padding-x, 0.8rem);
        padding-left: var(--dile-button-padding-x, 0.8rem);
        border-radius: var(--dile-button-border-radius, 0.25rem);
        border-width:  var(--dile-button-border-width, 1px);
        border-color:  var(--dile-button-border-color, #d0d0d0);
        background-color: var(--dile-button-background-color, #f9f9f9);
        transition-property: background-color, color;
        transition-duration: 0.3s;
        transition-timing-function: ease-in-out;
        border-style: solid;
        color: var(--dile-button-text-color, #393939); 
        font-size: var(--dile-button-font-size, 0.8rem);
        font-weight: var(--dile-button-font-weight, normal);
        text-transform: var(--dile-button-text-transform, none);
      }
      button:hover {
        cursor: pointer;
        background-color: var(--dile-button-hover-background-color, #f9f9f9);
        color: var(--dile-button-hover-text-color, #303030);
        border-color:  var(--dile-button-hover-border-color, #666666);
      }
      button:focus {
        outline: none;
        border-color: var(--dile-button-ring-color, #12c9e9);
      }
      :host([disabled]) button {
        cursor: auto;
        background-color: var(--dile-button-disabled-background-color, #ccc);
        color: var(--dile-button-disabled-text-color, #999);
        border-color: var(--dile-button-disabled-border-color, #bbb);
      }
      :host([disabled]) button:focus {
        outline: none;
        box-shadow: none;
      }
      :host([disabled]) button:active {
        outline: none;
        border-color: #aaa;
        box-shadow: none;
      }

      /** Danger button */
      button[data-type="danger"]{
        border-color:  var(--dile-button-border-color, #ff1717);
        background-color: var(--dile-button-danger-background-color, #ff1717);
        color: var(--dile-button-danger-text-color, #ffffff);
      }
      
      button[data-type="danger"]:hover {
        cursor: pointer;
        background-color: var(--dile-button-danger-hover-background-color, #ed5151);
        border-color:  var(--dile-button-danger-hover-border-color, #ff1717);
      }
      /** End Danger button*/

      /** Primary button */
      button[data-type="primary"]{
        border-color:  var(--dile-button-primary-border-color,  #123eff);
        background-color: var(--dile-button-primary-background-color,  #123eff);
        color: var(--dile-button-primary-text-color, #ffffff);
      }
      
       button[data-type="primary"]:hover {
        cursor: pointer;
        background-color: var(--dile-button-primary-hover-background-color, #0a70ff);
        border-color:  var(--dile-button-primary-hover-border-color, #1677ff);
      }
       button[data-type="primary"]:active {
        cursor: pointer;
        background-color: var(--dile-button-primary-hover-background-color, #0559cf);
        border-color:  var(--dile-button-primary-hover-border-color, #1677ff);
      }
      /** End Primary button*/

      button {
        user-select: none;
      }
  `;


  /**
   * The name of the button.
   */
  @property()
  name = 'World';

  /**
   * The type of the button.
   * @types 'default' 'zzz'
   */
  @property()
  type   = 'default';
  

  /**
   * The number of times the button has been clicked.
   */
  @property({type: Number})
  count = 0;

  override render() {
    console.log(this.type)
    return html`
     <button data-type="${this.type}" @click="${this._onClick}"><slot></slot></button>
     `;
    // return html`
    //   <h1>${this.sayHello(this.name)}!</h1>
    //   <button @click=${this._onClick} part="button">
    //     Click Count: ${this.count}
    //   </button>
    //   <slot></slot>
    // `;
  }

  private _onClick() {
    this.dispatchEvent(new CustomEvent('count-changed'));
  }

  /**
   * Formats a greeting
   * @param name The name to say "Hello" to
   */
  // sayHello(name: string): string {
  //   return `Hello, ${name}`;
  // }
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
