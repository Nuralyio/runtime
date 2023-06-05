/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import '../hy-dropdown.component';
@customElement('hy-dropdwon-demo')
export class ElButtonDemoElement extends LitElement {
  override render() {
    return html`
      <hy-dropdown
        .options=${[
          {
            label: 'Option 1',
            children: [{label: 'Sub-option 1'}, {label: 'Sub-option 2', children: [{label: 'Sub-sub-option 10'}]}],
          },
          {label: 'Option 2'},
          {
            label: 'Option 3',
            children: [
              {
                label: 'Sub-option 3',
              },
            ],
          },
        ]}
        @change="${(e: any) => console.log(e.detail.value)}"
      ></hy-dropdown>

      <hy-dropdown
        .options=${[
          {
            label: 'New',
            children: [{label: 'Folder'}, {label: 'File', children: [{label: 'From disk'}, {label: 'From Onedrine'}]}],
          },
          // {label: 'Open'},
          {
            label: 'Open',
            children: [
              {
                label: 'Recent',
                children: [
                  {
                    label: 'Ladoc app 22',
                  },
                  {
                    label: 'Ladoc app today',
                  },
                ],
              },
            ],
          },
          {label: 'Close project'},
        ]}
        @change="${(e: any) => console.log(e.detail.value)}"
      ></hy-dropdown>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hy-dropdwon-demo': ElButtonDemoElement;
  }
}
