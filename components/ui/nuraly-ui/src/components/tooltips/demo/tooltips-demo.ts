/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import {LitElement, css, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';

import '../tooltips.component';

@customElement('hy-tooltips-demo')
export class ElMeenuElement extends LitElement {
  @state()
  float = 'left';

  protected override render() {
    return html`
      <h3>BOTTOM</h3>
      <span>click me</span>
      <hy-tooltip
        .isPopConfirm=${true}
        .popConfirmDescription=${'Are you sure to delete this task?'}
        .popConfirmTitle=${'delete the task'}
        .cancelText=${'Cancel'}
        .okText=${'Ok'}
        @onCancel=${() => {
          console.log('canceled');
        }}
        @onConfirm=${() => {
          console.log('confirm');
        }}
      >
      </hy-tooltip>

      <br /><br /><br />
      <p>hover me</p>
      <hy-tooltip alignement=${'start'}>
        <span>This is bottom and start</span>
      </hy-tooltip>

      <br /><br /><br />
      <p>hover me</p>
      <hy-tooltip alignement=${'end'}>
        <span>This is bottom and end</span>
      </hy-tooltip>

      <br /><br /><br />
      <h3>TOP</h3>

      <p>hover me</p>
      <hy-tooltip position=${'top'}>
        <span>This is a description of the p in top and center</span>
      </hy-tooltip>
      <br /><br /><br />
      <div>hover me</div>

      <hy-tooltip position=${'top'} alignement=${'start'}>
        <span>This is a description of the p in top and start </span>
      </hy-tooltip>
      <br /><br /><br />

      <p>hover me</p>

      <hy-tooltip position=${'top'} alignement=${'end'}>
        <span>This is a description of the p in top and end</span>
      </hy-tooltip>
      <br /><br /><br />
      <h3>RIGHT</h3>
      <span>hover me</span>
      <hy-tooltip position=${'right'}>
        <span>This is a description of the p to the right and center</span>
      </hy-tooltip>

      <br /><br /><br />

      <div>hover me</div>
      <hy-tooltip position=${'right'} alignement=${'start'}>
        <span>This is a description of the p to the right and start</span>
      </hy-tooltip>

      <br /><br /><br />
      <span>hover me</span>
      <hy-tooltip position=${'right'} alignement=${'end'}>
        <span>This is a description of the p to the right and end</span>
      </hy-tooltip>

      <br /><br /><br />
      <h3>LEFT</h3>
      <span>hover me</span>
      <hy-tooltip position=${'left'}>
        <span>This is a description of the p to the left and center</span>
      </hy-tooltip>
      <br /><br /><br />

      <span>hover me</span>
      <hy-tooltip position=${'left'} alignement=${'start'}>
        <span>This is a description of the p to the left and start</span>
      </hy-tooltip>

      <br /><br /><br />

      <div>hover me</div>
      <hy-tooltip position=${'left'} alignement=${'end'}>
        <span>This is a description of the p to the left and end</span>
      </hy-tooltip>
    `;
  }

  static override styles = [
    css`
      :host {
        width: 800px;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    'hy-tooltips-demo': ElMeenuElement;
  }
}
