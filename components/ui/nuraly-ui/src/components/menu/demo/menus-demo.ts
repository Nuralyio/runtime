/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import {LitElement, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';

import '../menu.component';
import '../../dropdown/hy-dropdown.component';
import '../../button/hy-button.component';
import '../../input/input.component';

@customElement('hy-menu-demo')
export class ElMeenuElement extends LitElement {
  @state()
  float = 'left';
  moreTemplate = (option: any) => {
    return html`<hy-dropdown
      placeholder="Menu"
      .options=${[
        {
          label: 'Move up',
          //children: [{label: 'Folder'}, {label: 'File', children: [{label: 'From disk'}, {label: 'From Onedrine'}]}],
        },
        {label: 'Duplicate screen'},
        {label: 'Delete'},
        {label: 'Rename'},

        // {label: 'Open'},
        {
          label: 'Open',
          children: [
            {
              label: 'Recent',
              children: [
                ...[1, 2, 3, 4, 5, 6, 7].map((i) => {
                  return {
                    label: 'Option' + i,
                  };
                }),
              ],
            },
          ],
        },
        {label: 'Close project'},
      ]}
    >
      <hy-button slot="label" icon="ellipsis-h"  type="link" style="--hybrid-button-link-text-color: #373737" type="dashed"></hy-button slot="label">
    </hy-dropdown> `;
  };
  protected override render() {
    return html`
      <div style="height : 50px">
        <hy-button
          @click=${() => {
            if (this.float === 'right') {
              this.float = 'left';
            } else {
              this.float = 'right';
            }
          }}
          >Toggle Float</hy-button
        >
      </div>

      <hy-menu
        style="float:${this.float}"
        placeholder="Select an option"
        .options=${[
          {
            label: 'Option 1',
            moreTemplate: this.moreTemplate,
          },
          {type: 'divider'},

          {label: 'Option 2', moreTemplate: this.moreTemplate},
          {
            label: 'Option 3',
            children: [
              {
                label: 'Sub-option 3',
                children: [
                  ...[1, 2, 3, 4, 5, 6, 7].map((i) => {
                    if (i % 2) {
                      return {
                        moreTemplate: this.moreTemplate,
                        label: 'Option' + i,
                      };
                    }
                    return {
                      label: 'Sub Option' + i,
                    };
                  }),
                ],
              },
            ],
          },
          {label: 'Option 4', moreTemplate: this.moreTemplate},
        ]}
        @change="${(e: any) => console.log(e.detail.value)}"
      ></hy-menu>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hy-menu-demo': ElMeenuElement;
  }
}
