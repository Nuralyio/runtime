/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import {LitElement, css, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';

import '../hy-dropdown.component';
import {IOption} from '../dropdown.types';

@customElement('hy-dropdwon-demo')
export class ElButtonDemoElement extends LitElement {
  static override styles = [
    css`
      #centered {
        display: flex;
        align-items: center;
        flex-direction: column;
        gap: 30px;
      }
      #left {
        display: flex;
        align-items: start;
        flex-direction: column;
        gap: 10px;
        margin-left: 50px;
      }
      #right {
        display: flex;
        align-items: end;
        flex-direction: column;
        gap: 10px;
        margin-right: 50px;
      }
    `,
  ];
  @state()
  options: IOption[] = [
    {label: 'option1', value: 'value1', icon: 'bomb'},
    {
      label: 'option2',
      value: 'value2',
      children: [
        {label: 'option3', value: 'value3', icon: 'car'},
        {label: 'option13', value: 'value13', icon: 'car'},
      ],
    },
    {label: 'option4', value: 'value4', icon: 'bomb', disabled: true},
    {
      label: 'option5',
      value: 'value5',
      children: [
        {
          label: 'option6',
          value: 'value6',
          icon: 'car',
          disabled: true,
          children: [{label: 'option7', value: 'value7', icon: 'cog'}],
        },
      ],
    },
    {
      label: 'option8',
      value: 'value8',
      icon: 'book',
      children: [
        {
          label: 'option9',
          value: 'value9',
          icon: 'bolt',
          children: [
            {label: 'option10', value: 'value10', icon: 'bell', disabled: true},
            {label: 'option11', value: 'value11', icon: 'bell'},
          ],
        },
      ],
    },
    {label: 'option12', value: 'value12', disabled: true},
  ];
  override render() {
    return html` 
    <h3>With template</h3>
    <hy-dropdown .template=${html`<div style='color:red;'>hello</div>`}>
    <span>click me</span>
    </hy-dropdown>
      <div id="centered">
        <h3>Centered trigger</h3>

        <hy-dropdown .options=${this.options} @click-item=${(e: CustomEvent) => console.log('value clicked', e.detail)}>
          <span> hover me</span>
        </hy-dropdown>

        <br /><br />

        <hy-dropdown
          trigger="click"
          .options=${this.options}
          @click-item=${(e: CustomEvent) => console.log('value clicked', e.detail)}
        >
          <span> click me</span>
        </hy-dropdown>
        <br /><br />
        <hy-dropdown .options=${this.options} @click-item=${(e: CustomEvent) => console.log('value clicked', e.detail)}>
          <span> hover me</span>
        </hy-dropdown>

        <br /><br />

        <hy-dropdown
          trigger="click"
          .options=${this.options}
          @click-item=${(e: CustomEvent) => console.log('value clicked', e.detail)}
        >
          <span> click me</span>
        </hy-dropdown>
        <br /><br />
        <hy-dropdown .options=${this.options} @click-item=${(e: CustomEvent) => console.log('value clicked', e.detail)}>
          <span> hover me</span>
        </hy-dropdown>
      </div>
      <div id="left">
        <h3>Left trigger</h3>

        <hy-dropdown .options=${this.options} @click-item=${(e: CustomEvent) => console.log('value clicked', e.detail)}>
          <span> hover me</span>
        </hy-dropdown>

        <br /><br />

        <hy-dropdown
          trigger="click"
          .options=${this.options}
          @click-item=${(e: CustomEvent) => console.log('value clicked', e.detail)}
        >
          <span> click me</span>
        </hy-dropdown>
        <br /><br />
        <hy-dropdown .options=${this.options} @click-item=${(e: CustomEvent) => console.log('value clicked', e.detail)}>
          <span> hover me</span>
        </hy-dropdown>

        <br /><br />

        <hy-dropdown
          trigger="click"
          .options=${this.options}
          @click-item=${(e: CustomEvent) => console.log('value clicked', e.detail)}
        >
          <span> click me</span>
        </hy-dropdown>
        <br /><br />
        <hy-dropdown .options=${this.options} @click-item=${(e: CustomEvent) => console.log('value clicked', e.detail)}>
          <span> hover me</span>
        </hy-dropdown>
      </div>
      <div id="right">
        <h3>Right trigger</h3>
        <hy-dropdown .options=${this.options} @click-item=${(e: CustomEvent) => console.log('value clicked', e.detail)}>
          <span> hover me</span>
        </hy-dropdown>

        <br /><br />

        <hy-dropdown
          trigger="click"
          .options=${this.options}
          @click-item=${(e: CustomEvent) => console.log('value clicked', e.detail)}
        >
          <span> click me</span>
        </hy-dropdown>
        <br /><br />
        <hy-dropdown .options=${this.options} @click-item=${(e: CustomEvent) => console.log('value clicked', e.detail)}>
          <span> hover me</span>
        </hy-dropdown>

        <br /><br />

        <hy-dropdown
          trigger="click"
          .options=${this.options}
          @click-item=${(e: CustomEvent) => console.log('value clicked', e.detail)}
        >
          <span> click me</span>
        </hy-dropdown>
        <br /><br />
        <hy-dropdown .options=${this.options} @click-item=${(e: CustomEvent) => console.log('value clicked', e.detail)}>
          <span> hover me</span>
        </hy-dropdown>
      </div>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'hy-dropdwon-demo': ElButtonDemoElement;
  }
}
