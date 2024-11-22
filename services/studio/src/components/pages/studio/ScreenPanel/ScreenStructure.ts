import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";

import "@nuralyui/menu";
import "@nuralyui/icon";
import "../../../micro-app";
import "@nuralyui/button";


@customElement("screen-structure-editor")
export class ScreenStructureEditor extends LitElement {

  constructor() {
    super();
  }

  render() {
    return html`
        <micro-app uuid="1" componentToRenderUUID="331"></micro-app>
    `;
  }
}
