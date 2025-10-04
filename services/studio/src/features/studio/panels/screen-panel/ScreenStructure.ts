import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

import "@nuralyui/icon";
import "@runtime/micro-app.ts";
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
