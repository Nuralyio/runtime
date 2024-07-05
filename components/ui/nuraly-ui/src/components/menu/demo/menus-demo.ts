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
import '../templates/hy-menu-link';
import '../templates/hy-sub-menu';
import {IMenu} from '../menu.types';

@customElement('hy-menu-demo')
export class ElMeenuElement extends LitElement {
  @state()
  path!: number[];
  @state()
  value!: string;
  @state()
  items: IMenu[] = [
    {text: 'Link', link: 'link', icon: 'fish', iconPosition: 'right'},
    {text: 'Second link', link: 'link', icon: 'fish', iconPosition: 'left'},
    {text: 'Third link', link: 'link'},
    {
      text: 'First Menu',
      children: [
        {text: 'Submenu 1-1', link: 'Submenu 1-1 link', icon: 'globe', iconPosition: 'right'},
        {text: 'Submenu 1-2', link: 'Submenu 1-2 link', icon: 'tree', selected: true},
        {
          text: 'Submenu 1-3',
          link: 'Submenu 1-3 link',
          icon: 'phone',
          children: [{text: 'Child of Submenu 1-3', link: '', icon: 'info'}],
        },
      ],
      disabled: false,
    },
    {
      text: 'Second Menu',
      children: [
        {text: 'Submenu 2-1', link: 'Submenu 2-1 link', icon: 'cloud'},
        {text: 'Submenu 2-2', link: 'Submenu 2-2 link', icon: 'wifi'},
        {
          text: 'Submenu 2-3',
          link: 'Submenu 2-3 link',
          icon: 'user',
          children: [
            {
              text: 'Child of Submenu 2-3',
              link: 'Child of Submenu 2-3 link',
              icon: 'house',
              children: [
                {
                  text: 'Subchild of Submenu 2-3',
                  link: 'Subchild of Submenu 2-3 link',
                  icon: 'bell',
                  iconPosition: 'right',
                },
              ],
            },
          ],
        },
      ],
      link: '',
    },
  ];

  protected override render() {
    return html`
      <h3>Treeview</h3>
      <hy-menu
        .items=${this.items}
        @change=${(e: CustomEvent) => {
          this.path = e.detail.path;
          this.value = e.detail.value;
        }}
      ></hy-menu>
      path: ${this.path?.join('-')} value: ${this.value}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hy-menu-demo': ElMeenuElement;
  }
}
