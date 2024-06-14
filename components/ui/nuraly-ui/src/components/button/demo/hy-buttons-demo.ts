/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import '../hy-button.component';
@customElement('hy-buttons-demo')
export class ElButtonDemoElement extends LitElement {
  override render() {
    return html`
      <h1>Sizes</h1>
      <br />
      <hy-button> Default Button</hy-button>
      <hy-button size="small">Small Button</hy-button>
      <hy-button size="large">Large Button</hy-button>
      <br /><br />
      <hy-button .icon="${['search']}"> Default Button</hy-button>
      <hy-button .icon="${['search']}" size="small">Small Button</hy-button>
      <hy-button .icon="${['search']}" size="large">Large Button</hy-button>

      <br /><br />
      <hy-button .icon="${['search']}"></hy-button>
      <hy-button .icon="${['search']}" size="small"></hy-button>
      <hy-button .icon="${['search']}" size="large"></hy-button>
      <br /><br />

      <h1>Types</h1>
      <br /><br />

      <table>
        <tbody>
          <tr>
            <td></td>
            <td>Primary</td>
            <td>Secondary</td>
            <td>Ghost</td>
            <td>Danger</td>
            <td>Default</td>
          </tr>
          <tr>
            <td>Default</td>
            <td>
              <hy-button type="primary"><span>Primary Button</span></hy-button>
            </td>
            <td>
              <hy-button type="secondary"><span>Secondary Button </span></hy-button>
            </td>
            <td>
              <hy-button type="ghost"> <span>Ghost button</span></hy-button>
            </td>
            <td>
              <hy-button type="danger"><span>Danger Button </span></hy-button>
            </td>
            <td>
              <hy-button><span>Default Button</span></hy-button>
            </td>
          </tr>
          <tr>
            <td>Dashed</td>
            <td>
              <hy-button type="primary" ?dashed=${true}><span>Primary Button text only</span></hy-button>
            </td>
            <td>
              <hy-button type="secondary" ?dashed=${true}><span>Secondary dashed</span></hy-button>
            </td>
            <td>
              <hy-button type="ghost" ?dashed=${true}><span>Ghost dashed</span></hy-button>
            </td>
            <td>
              <hy-button type="danger" ?dashed=${true}><span>Danger dashed</span></hy-button>
            </td>
            <td>
              <hy-button ?dashed=${true}><span>Default dashed</span></hy-button>
            </td>
          </tr>
          <tr>
            <td>Loading</td>
            <td>
              <hy-button type="primary" loading><span>Primary Button loading</span></hy-button>
            </td>
            <td>
              <hy-button type="secondary" loading><span>Secondary button loading </span></hy-button>
            </td>
            <td>
              <hy-button type="ghost" loading><span>Ghost button loading</span></hy-button>
            </td>
            <td>
              <hy-button type="danger" loading><span>Danger button loading</span></hy-button>
            </td>
            <td>
              <hy-button loading><span>Default button loading</span></hy-button>
            </td>
          </tr>
          <tr>
            <td>Disabled</td>
            <td>
              <hy-button type="primary" disabled><span>Primary Button disabled</span></hy-button>
            </td>
            <td>
              <hy-button type="secondary" disabled><span>Secondary Button disabled</span></hy-button>
            </td>
            <td>
              <hy-button type="ghost" disabled> <span>Ghost button disabled</span></hy-button>
            </td>
            <td>
              <hy-button type="danger" disabled><span>Danger Button disabled</span></hy-button>
            </td>
            <td>
              <hy-button disabled><span>Default Button disabled</span></hy-button>
            </td>
          </tr>
          <tr>
            <td>Icon with text default: icon left</td>
            <td>
              <hy-button type="primary" .icon="${['search']}"><span> Primary button icon+text</span></hy-button>
            </td>
            <td>
              <hy-button type="secondary" .icon="${['search']}"><span> Secondary button icon+text</span></hy-button>
            </td>
            <td>
              <hy-button type="ghost" .icon="${['search']}"><span> Ghost button icon+text</span></hy-button>
            </td>
            <td>
              <hy-button type="danger" .icon="${['search']}"><span> Danger button icon+text</span></hy-button>
            </td>
            <td>
              <hy-button .icon="${['search']}"><span> Default button icon+text</span></hy-button>
            </td>
          </tr>
          <tr>
            <td>Icon with text: icon right</td>
            <td>
              <hy-button type="primary" .icon="${['search']}" iconPosition="right"
                ><span> Primary button icon+text</span></hy-button
              >
            </td>
            <td>
              <hy-button type="secondary" .icon="${['search']}" iconPosition="right"
                ><span> Secondary button icon+text</span></hy-button
              >
            </td>
            <td>
              <hy-button type="ghost" .icon="${['search']}" iconPosition="right"
                ><span> Ghost button icon+text</span></hy-button
              >
            </td>
            <td>
              <hy-button type="danger" .icon="${['search']}" iconPosition="right"
                ><span> Danger button icon+text</span></hy-button
              >
            </td>
            <td>
              <hy-button .icon="${['search']}" iconPosition="right"><span> Default button icon+text</span></hy-button>
            </td>
          </tr>
          <tr>
            <td>Icon with text: icon both side</td>
            <td>
              <hy-button type="primary" .icon="${['search', 'bomb']}" iconPosition="right"
                ><span> Primary button icon+text</span></hy-button
              >
            </td>
            <td>
              <hy-button type="secondary" .icon="${['search', 'bomb']}" iconPosition="right"
                ><span> Secondary button icon+text</span></hy-button
              >
            </td>
            <td>
              <hy-button type="ghost" .icon="${['search', 'bomb']}" iconPosition="right"
                ><span> Ghost button icon+text</span></hy-button
              >
            </td>
            <td>
              <hy-button type="danger" .icon="${['search', 'bomb']}" iconPosition="right"
                ><span> Danger button icon+text</span></hy-button
              >
            </td>
            <td>
              <hy-button .icon="${['search', 'bomb']}" iconPosition="right"
                ><span> Default button icon+text</span></hy-button
              >
            </td>
          </tr>
          <tr>
            <td>Icon only</td>
            <td><hy-button type="primary" .icon="${['search']}"></hy-button></td>
            <td><hy-button type="secondary" .icon="${['search']}"></hy-button></td>
            <td><hy-button type="ghost" .icon="${['search']}"></hy-button></td>
            <td><hy-button type="danger" .icon="${['search']}"></hy-button></td>
            <td><hy-button .icon="${['search']}"></hy-button></td>
          </tr>
        </tbody>
      </table>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hy-buttons-demo': ElButtonDemoElement;
  }
}
