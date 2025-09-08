/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import '../button.component';
import '../../../helpers/ThemeHandler';
@customElement('nr-buttons-demo')
export class ElButtonDemoElement extends LitElement {
  override render() {
    return html`
      <theme-handler>
        <h1>Sizes</h1>
        <br />
        <nr-button> Default Button</nr-button>
        <nr-button size="small">Small Button</nr-button>
        <nr-button size="large">Large Button</nr-button>
        <br /><br />
        <nr-button .icon="${['search']}"> Default Button</nr-button>
        <nr-button .icon="${['search']}" size="small">Small Button</nr-button>
        <nr-button .icon="${['search']}" size="large">Large Button</nr-button>

        <br /><br />
        <nr-button .icon="${['search']}"></nr-button>
        <nr-button .icon="${['search']}" size="small"></nr-button>
        <nr-button .icon="${['search']}" size="large"></nr-button>
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
                <nr-button type="primary"><span>Primary Button</span></nr-button>
              </td>
              <td>
                <nr-button type="secondary"><span>Secondary Button </span></nr-button>
              </td>
              <td>
                <nr-button type="ghost"> <span>Ghost button</span></nr-button>
              </td>
              <td>
                <nr-button type="danger"><span>Danger Button </span></nr-button>
              </td>
              <td>
                <nr-button><span>Default Button</span></nr-button>
              </td>
            </tr>
            <tr>
              <td>Dashed</td>
              <td>
                <nr-button type="primary" ?dashed=${true}><span>Primary Button text only</span></nr-button>
              </td>
              <td>
                <nr-button type="secondary" ?dashed=${true}><span>Secondary dashed</span></nr-button>
              </td>
              <td>
                <nr-button type="ghost" ?dashed=${true}><span>Ghost dashed</span></nr-button>
              </td>
              <td>
                <nr-button type="danger" ?dashed=${true}><span>Danger dashed</span></nr-button>
              </td>
              <td>
                <nr-button ?dashed=${true}><span>Default dashed</span></nr-button>
              </td>
            </tr>
            <tr>
              <td>Loading</td>
              <td>
                <nr-button type="primary" loading><span>Primary Button loading</span></nr-button>
              </td>
              <td>
                <nr-button type="secondary" loading><span>Secondary button loading </span></nr-button>
              </td>
              <td>
                <nr-button type="ghost" loading><span>Ghost button loading</span></nr-button>
              </td>
              <td>
                <nr-button type="danger" loading><span>Danger button loading</span></nr-button>
              </td>
              <td>
                <nr-button loading><span>Default button loading</span></nr-button>
              </td>
            </tr>
            <tr>
              <td>Disabled</td>
              <td>
                <nr-button type="primary" disabled><span>Primary Button disabled</span></nr-button>
              </td>
              <td>
                <nr-button type="secondary" disabled><span>Secondary Button disabled</span></nr-button>
              </td>
              <td>
                <nr-button type="ghost" disabled> <span>Ghost button disabled</span></nr-button>
              </td>
              <td>
                <nr-button type="danger" disabled><span>Danger Button disabled</span></nr-button>
              </td>
              <td>
                <nr-button disabled><span>Default Button disabled</span></nr-button>
              </td>
            </tr>
            <tr>
              <td>Icon with text default: icon left</td>
              <td>
                <nr-button type="primary" .icon="${['search']}"><span> Primary button icon+text</span></nr-button>
              </td>
              <td>
                <nr-button type="secondary" .icon="${['search']}"><span> Secondary button icon+text</span></nr-button>
              </td>
              <td>
                <nr-button type="ghost" .icon="${['search']}"><span> Ghost button icon+text</span></nr-button>
              </td>
              <td>
                <nr-button type="danger" .icon="${['search']}"><span> Danger button icon+text</span></nr-button>
              </td>
              <td>
                <nr-button .icon="${['search']}"><span> Default button icon+text</span></nr-button>
              </td>
            </tr>
            <tr>
              <td>Icon with text: icon right</td>
              <td>
                <nr-button type="primary" .icon="${['search']}" iconPosition="right"
                  ><span> Primary button icon+text</span></nr-button
                >
              </td>
              <td>
                <nr-button type="secondary" .icon="${['search']}" iconPosition="right"
                  ><span> Secondary button icon+text</span></nr-button
                >
              </td>
              <td>
                <nr-button type="ghost" .icon="${['search']}" iconPosition="right"
                  ><span> Ghost button icon+text</span></nr-button
                >
              </td>
              <td>
                <nr-button type="danger" .icon="${['search']}" iconPosition="right"
                  ><span> Danger button icon+text</span></nr-button
                >
              </td>
              <td>
                <nr-button .icon="${['search']}" iconPosition="right"><span> Default button icon+text</span></nr-button>
              </td>
            </tr>
            <tr>
              <td>Icon with text: icon both side</td>
              <td>
                <nr-button type="primary" .icon="${['search', 'bomb']}" iconPosition="right"
                  ><span> Primary button icon+text</span></nr-button
                >
              </td>
              <td>
                <nr-button type="secondary" .icon="${['search', 'bomb']}" iconPosition="right"
                  ><span> Secondary button icon+text</span></nr-button
                >
              </td>
              <td>
                <nr-button type="ghost" .icon="${['search', 'bomb']}" iconPosition="right"
                  ><span> Ghost button icon+text</span></nr-button
                >
              </td>
              <td>
                <nr-button type="danger" .icon="${['search', 'bomb']}" iconPosition="right"
                  ><span> Danger button icon+text</span></nr-button
                >
              </td>
              <td>
                <nr-button .icon="${['search', 'bomb']}" iconPosition="right"
                  ><span> Default button icon+text</span></nr-button
                >
              </td>
            </tr>
            <tr>
              <td>Icon only</td>
              <td><nr-button type="primary" .icon="${['search']}"></nr-button></td>
              <td><nr-button type="secondary" .icon="${['search']}"></nr-button></td>
              <td><nr-button type="ghost" .icon="${['search']}"></nr-button></td>
              <td><nr-button type="danger" .icon="${['search']}"></nr-button></td>
              <td><nr-button .icon="${['search']}"></nr-button></td>
            </tr>
          </tbody>
        </table>
      </theme-handler>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'nr-buttons-demo': ElButtonDemoElement;
  }
}
