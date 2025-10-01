/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '../menu.component';
import { IMenu } from '../menu.types';

@customElement('nr-menu-demo')
export class ElMeenuElement extends LitElement {
  @state()
  path!: number[];
  @state()
  value!: string;
  items: IMenu[] = [
    {
      text: 'First Menu',
      selected: true,
      children: [
        {
          text: 'Submenu 1-1', link: 'Submenu 1-1 link', icon: 'globe', menu: { icon: 'bars', actions: [{ label: 'Delete', value: 'delete' }, { label: 'Rename', value: 'rename' }] }, status: { icon: 'warning', label: 'warning' }
        },
        {
          text: 'Submenu 1-2', link: 'Submenu 1-2 link', icon: 'tree', menu: { icon: 'bars', actions: [{ label: 'Delete', value: 'delete' }, { label: 'Rename', value: 'rename' }] }, status: { icon: 'warning', label: 'warning' }
          , children: [
            {
              text: 'Submenu 1-1', link: 'Submenu 1-1 link', icon: 'globe', menu: { icon: 'bars', actions: [{ label: 'Delete', value: 'delete' }, { label: 'Rename', value: 'rename' }] }, status: { icon: 'circle-exclamation', label: 'error' }
            },
            {
              text: 'Submenu 1-2', link: 'Submenu 1-2 link', icon: 'tree', menu: { icon: 'bars', actions: [{ label: 'Delete', value: 'delete' }, { label: 'Rename', value: 'rename' }] }, status: { icon: 'warning', label: 'warning' }
              , children: [
                {
                  text: 'Submenu 1-1', link: 'Submenu 1-1 link', icon: 'globe', menu: { icon: 'bars', actions: [{ label: 'Delete', value: 'delete' }, { label: 'Rename', value: 'rename' }] }, status: { icon: 'circle-exclamation', label: 'error' }
                },
                {
                  text: 'Submenu 1-2', link: 'Submenu 1-2 link', icon: 'tree', menu: { icon: 'bars', actions: [{ label: 'Delete', value: 'delete' }, { label: 'Rename', value: 'rename' }] }, status: { icon: 'warning', label: 'warning' }
                },
              ],
            },
          ]
        },
      ],
      disabled: false,
      icon: 'bug',
      menu: { icon: 'bars', actions: [{ label: 'Delete', value: 'delete' }, { label: 'Rename', value: 'rename' }] },
      status: { icon: 'warning', label: 'warning' }
    },
    {
      text: 'Second Menu',
      children: [
        { text: 'Submenu 2-1', link: 'Submenu 2-1 link', icon: 'cloud', menu: { icon: 'bars', actions: [{ label: 'Delete', value: 'delete' }, { label: 'Rename', value: 'rename' }] } },
        { text: 'Submenu 2-2', link: 'Submenu 2-2 link', icon: 'wifi', menu: { icon: 'bars', actions: [{ label: 'Delete', value: 'delete' }, { label: 'Rename', value: 'rename' }] } },

      ],
      link: '',
      menu: { icon: 'bars', actions: [{ label: 'Delete', value: 'delete' }, { label: 'Rename', value: 'rename' }] }
    },
  ];

  items2: IMenu[] = [
    {
      text: 'First Menu',
      disabled: false,
    },
    {
      text: 'First Menu',
      children: [
        { text: 'Submenu 1-1', link: 'Submenu 1-1 link', icon: 'globe', iconPosition: 'right' },
        {
          text: 'Submenu 1-2', link: 'Submenu 1-2 link', icon: 'tree', children: [
            { text: 'Submenu 1-1', link: 'Submenu 1-1 link', icon: 'globe', iconPosition: 'right' },
            { text: 'Submenu 1-2', link: 'Submenu 1-2 link', icon: 'tree' },
          ],
        },

      ],
      disabled: false,
    },
    {
      text: 'Second Menu',
      children: [
        { text: 'Submenu 2-1', link: 'Submenu 2-1 link', icon: 'cloud' },
        { text: 'Submenu 2-2', link: 'Submenu 2-2 link', icon: 'wifi' },

      ],
      link: '',
    },
  ];

  items3: IMenu[] = [
    {
      text: 'Submenu 0-0', link: 'Submenu 1-1 link', icon: 'globe', iconPosition: 'right',

    },
    {
      text: 'Submenu 0-1', link: 'Submenu 1-1 link', icon: 'globe', iconPosition: 'right',

    }, {
      text: 'Submenu 0-2', link: 'Submenu 1-1 link', icon: 'globe', iconPosition: 'right',

    },

  ];

  protected override render() {
    return html`
      <h3>Treeview</h3>
      <nr-menu
        .items=${this.items}
        @action-click=${(e: CustomEvent) => {
        console.log('action name', e.detail.value)
        console.log('option path', e.detail.path)
      }}
        @change=${(e: CustomEvent) => {
        this.path = e.detail.path;
        this.value = e.detail.value;
      }}
      ></nr-menu>
      path: ${this.path?.join('-')} value: ${this.value}

      <h3>Treeview</h3>
      <nr-menu
        .items=${this.items}
        @change=${(e: CustomEvent) => {
        this.path = e.detail.path;
        this.value = e.detail.value;
      }}
      ></nr-menu>

      <h3>Treeview</h3>
      <nr-menu
        .items=${this.items2}
        @change=${(e: CustomEvent) => {
        this.path = e.detail.path;
        this.value = e.detail.value;
      }}
      ></nr-menu>

      <h3>Treeview</h3>
      <nr-menu
        .items=${this.items3}
        @change=${(e: CustomEvent) => {
        this.path = e.detail.path;
        this.value = e.detail.value;
      }}
      ></nr-menu>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'nr-menu-demo': ElMeenuElement;
  }
}
