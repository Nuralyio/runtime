import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./studio/TopBar/TopbarWrapper/TopbarWrapper";
import "./studio/ScreenPanel/ScreenStructure";
@customElement("make-page")
export class MakePage extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }
    `,
  ];
  

  render() {
    return html`
      <topbar-panel-wrapper></topbar-panel-wrapper>
      <div slot="left">
        <screen-structure-editor></screen-structure-editor>
      </div>
      <div slot="main">
        <editor-interactive-panel>
          <page-content></page-content>
        </editor-interactive-panel>
      </div>
      <div slot="right">
        <parameter-panel></parameter-panel>
      </div>
    `;
  }
}
