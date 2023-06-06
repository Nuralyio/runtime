/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import {LitElement, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';

import '../hy-dropdown.component';
import '../../button/hy-button.component';
import '../../input/input.component';

@customElement('hy-dropdwon-demo')
export class ElButtonDemoElement extends LitElement {
  @state()
  dropdwon2Selected!: any;
  @state()
  dropdwon4Selected!: any;

  @state()
  dropdwon4isOpen!: boolean;

  placeholderDropdown2 = 'file';

  override render() {
    return html`
      <hy-dropdown
        placeholder="Select an option"
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
      <br />
      <br />
      <br />
      <br />
      <hy-dropdown
        placeholder="Menu"
        .selected=${this.dropdwon2Selected}
        @change=${(e: any) => {
          this.dropdwon2Selected = e.detail.value;
          console.log(e.detail.value.label);
        }}
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
                  ...[1, 2, 3, 4, 5, 6, 7].map((i) => {
                    return {
                      label: 'Ladoc app ' + i,
                    };
                  }),
                ],
              },
            ],
          },
          {label: 'Close project'},
        ]}
        ><span slot="label">${this.placeholderDropdown2}</span></hy-dropdown
      >
      <br />
      <br />
      <hy-dropdown
        placeholder="Menu"
        .selected=${this.dropdwon2Selected}
        @change=${(e: any) => {
          this.dropdwon2Selected = e.detail.value;
          console.log(e.detail.value.label);
        }}
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
                  ...[1, 2, 3, 4, 5, 6, 7].map((i) => {
                    return {
                      label: 'Ladoc app ' + i,
                    };
                  }),
                ],
              },
            ],
          },
          {label: 'Close project'},
        ]}
        ><hy-button slot="label">${this.dropdwon2Selected?.label || this.placeholderDropdown2}</hy-button></hy-dropdown
      >

      <br />
      <br />
      <hy-dropdown
        placeholder="Menu"
        .selected=${this.dropdwon2Selected}
        @change=${(e: any) => {
          this.dropdwon2Selected = e.detail.value;
          console.log(e.detail.value.label);
        }}
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
                  ...[1, 2, 3, 4, 5, 6, 7].map((i) => {
                    return {
                      label: 'Ladoc app ' + i,
                    };
                  }),
                ],
              },
            ],
          },
          {label: 'Close project'},
        ]}
        ><hy-button slot="label" icon="ellipsis-v"></hy-button
      ></hy-dropdown>
      <br />
      <br />
      <hy-dropdown
        handler="click"
        placeholder="Menu"
        .open=${this.dropdwon4isOpen}
        .selected=${this.dropdwon4Selected}
        @change=${(e: any) => {
          this.dropdwon4Selected = e.detail.value;
          console.log(e.detail.value.label);
        }}
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
                  ...[1, 2, 3, 4, 5, 6, 7].map((i) => {
                    return {
                      label: 'Ladoc app ' + i,
                    };
                  }),
                ],
              },
            ],
          },
          {label: 'Close project'},
        ]}
        ><hy-input
          slot="label"
          .value=${this.dropdwon4Selected?.label || ''}
          icon="ellipsis-v"
          @valueChange=${(e: any) => {
            this.dropdwon4Selected = {label: e.detail.value};
          }}
          ><span slot="suffix">
            <hy-icon
              style="cursor:pointer"
              name="times-circle"
              @click=${() => {
                this.dropdwon4Selected = undefined;
                this.dropdwon4isOpen = false;
              }}
            ></hy-icon> </span></hy-input
      ></hy-dropdown>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hy-dropdwon-demo': ElButtonDemoElement;
  }
}
