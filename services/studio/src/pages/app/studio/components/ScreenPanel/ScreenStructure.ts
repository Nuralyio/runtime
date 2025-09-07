import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

import "@nuralyui/icon";
import "../../../../../core/micro-app.ts";
import "@nuralyui/button";


@customElement("screen-structure-editor")
export class ScreenStructureEditor extends LitElement {
  static styles = css`
    :host {
      height: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    
    micro-app {
      height: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
  `;

  constructor() {
    super();
  }

  render() {
    return html`
        <micro-app uuid="1" componentToRenderUUID="331"></micro-app>
    `;
  }
}
