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
              <td>Text</td>
              <td>Link</td>
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
              <td>
                <nr-button type="text"><span>Text Button</span></nr-button>
              </td>
              <td>
                <nr-button type="link" href="https://example.com"><span>Link Button</span></nr-button>
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
              <td>
                <nr-button type="text" ?dashed=${true}><span>Text dashed</span></nr-button>
              </td>
              <td>
                <nr-button type="link" href="https://example.com" ?dashed=${true}><span>Link dashed</span></nr-button>
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
              <td><nr-button type="text" .icon="${['search']}"></nr-button></td>
              <td><nr-button type="link" href="https://example.com" .icon="${['search']}"></nr-button></td>
            </tr>
          </tbody>
        </table>

        <h1>Button Shapes</h1>
        <br />
        <h3>Default Shape</h3>
        <nr-button type="primary">Default Button</nr-button>
        <nr-button type="primary" .icon="${['search']}">With Icon</nr-button>
        <nr-button type="primary" .icon="${['search']}"></nr-button>
        
        <h3>Round Shape</h3>
        <nr-button type="primary" shape="round">Round Button</nr-button>
        <nr-button type="primary" shape="round" .icon="${['search']}">Round With Icon</nr-button>
        <nr-button type="primary" shape="round" .icon="${['search']}"></nr-button>
        
        <h3>Circle Shape</h3>
        <nr-button type="primary" shape="circle" .icon="${['search']}"></nr-button>
        <nr-button type="secondary" shape="circle" .icon="${['user']}"></nr-button>
        <nr-button type="danger" shape="circle" .icon="${['trash']}"></nr-button>

        <h3>Circle Shape - Different Sizes</h3>
        <nr-button type="primary" shape="circle" size="small" .icon="${['search']}"></nr-button>
        <nr-button type="primary" shape="circle" .icon="${['search']}"></nr-button>
        <nr-button type="primary" shape="circle" size="large" .icon="${['search']}"></nr-button>

        <h1>Block Buttons</h1>
        <br />
        <nr-button type="primary" block>Primary Block Button</nr-button>
        <br />
        <nr-button type="secondary" block>Secondary Block Button</nr-button>
        <br />
        <nr-button type="text" block>Text Block Button</nr-button>
        <br />
        <nr-button type="link" href="https://example.com" block>Link Block Button</nr-button>
        <br />

        <h1>Link Buttons with Target</h1>
        <br />
        <nr-button type="link" href="https://example.com">Same Tab Link</nr-button>
        <nr-button type="link" href="https://example.com" target="_blank">New Tab Link</nr-button>
        <nr-button type="link" href="https://example.com" target="_blank" .icon="${['external-link']}">External Link</nr-button>
        <br />

        <h1>Accessibility Examples</h1>
        <br />
        <nr-button type="primary" buttonAriaLabel="Save document">Save</nr-button>
        <nr-button type="danger" buttonAriaLabel="Delete item permanently" .icon="${['trash']}">Delete</nr-button>
        <nr-button type="text" buttonAriaLabel="Close dialog" .icon="${['close']}"></nr-button>
      </theme-handler>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'nr-buttons-demo': ElButtonDemoElement;
  }
}
