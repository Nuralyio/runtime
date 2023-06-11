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
import {styleMap} from 'lit/directives/style-map.js';

@customElement('hy-dropdwon-demo')
export class ElButtonDemoElement extends LitElement {
  @state()
  dropdwon2Selected!: any;
  @state()
  dropdwon4Selected!: any;

  @state()
  search = '';

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
          },
          {type: 'divider'},
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

      <hy-dropdown
        placeholder="Select an option"
        .options=${[
          {
            label: 'Option 1',
            type: 'group',
            children: [{label: 'Sub-option 1'}, {label: 'Sub-option 2'}],
          },
          {type: 'divider'},
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

      <hy-dropdown
        placeholder="Select an option"
        .options=${[
          {
            label: 'Option 1',
            type: 'group',
            children: [
              {label: 'Sub-option 1'},
              {label: 'Sub-option 2', type: 'group', children: [{label: 'Sub-sub-option 10'}]},
            ],
          },
          {type: 'divider'},
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
        .search=${this.search}
        trigger="click"
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
          {
            label: 'Close project',
            template: function (item: any) {
              return html`<div style="display: flex"><hy-input  style="width: 80%; text: red !important" value="${item.label} "> </hy-input><hy-button  style="width: 19%" > ok</hy-button></span> </div>`;
            },
          },
        ]}
        ><hy-input
          slot="label"
          .value=${this.dropdwon4Selected?.label || ''}
          icon="ellipsis-v"
          @valueChange=${(e: any) => {
            ``;
            this.search = e.detail.value;

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
      <br />
      <br />
      <hy-dropdown
        style="float : right;"
        placeholder="Menu"
        trigger="hover"
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
        trigger="context-menu"
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
      >
        <!-- <div
          slot="label"
          style=${styleMap({
          color: 'white',
          background: 'gray',
          height: '200px',
          width: '400px',
          textAlign: 'center',
          lineHeight: '200px',
        })}
        >
          Right Click on here
        </div> -->

        <img
          slot="label"
          src="https://fastly.picsum.photos/id/588/200/300.jpg?hmac=Bb5mvfvSw-sKhocAA4Mfdb78ysl5ktbClTt-Lc0IyWk"
        />
      </hy-dropdown>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hy-dropdwon-demo': ElButtonDemoElement;
  }
}
