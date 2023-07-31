import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { v4 as uuidv4 } from "uuid";

import "@hybridui/menu";
import "@hybridui/button";
import "@hybridui/icon";
import { addPageAction } from "../../../../../store/pages";

@customElement("add-screen-editor")
export class AddScreen extends LitElement {
  addPage() {
    addPageAction({
      id: uuidv4(),
      name: "Page_" + Math.random(),
    });
  }
  render() {
    return html` <hy-button @click=${this.addPage}>New Screen</hy-button> `;
  }
}
