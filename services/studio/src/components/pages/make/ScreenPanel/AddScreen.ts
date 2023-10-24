import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { v4 as uuidv4 } from "uuid";

import "@hybridui/menu";
import "@hybridui/button";
import "@hybridui/icon";
import { $pages } from "$store/page/store";
import { type PageElement } from "$store/page/interface";
import { addPageAction } from "$store/page/action";

@customElement("add-screen-editor")
export class AddScreen extends LitElement {
  @state()
  pageLength = 0;
  constructor() {
    super();
    $pages.subscribe(
      (pages: PageElement[] = []) => (this.pageLength = pages.length)
    );
  }
  addPage() {
    addPageAction({
      id: uuidv4(),
      name: "Page_" + (this.pageLength + 1),
      componentIds: [],
    });
  }
  render() {
    return html` <hy-button @click=${this.addPage}>New Screen</hy-button> `;
  }
}
