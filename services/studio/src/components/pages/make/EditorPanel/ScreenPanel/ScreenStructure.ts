import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";

import "@hybridui/menu";
import "@hybridui/icon";
import "./ScreenList";
import "./AddScreen";
import "@hybridui/button";

@customElement("screen-structure-editor")
export class ScreenStructureEditor extends LitElement {
  render() {
    return html`
      <add-screen-editor></add-screen-editor>
      <screen-list-editor></screen-list-editor>
    `;
  }
}
