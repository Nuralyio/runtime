import { html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";

import "@nuralyui/menu";
import "@nuralyui/button";
import "@nuralyui/icon";
import { $pages } from "@shared/redux/store/page";
import { type PageElement } from "@shared/redux/handlers/pages/page.interface";

import { addPageAction } from "@shared/redux/actions/page/addPageAction";

@customElement("add-screen-editor")
export class AddScreen extends LitElement {
  @state()
  pageLength = 0;
  pageSubject: any;

  constructor() {
    super();

  }

  override connectedCallback() {
    super.connectedCallback();
    this.pageSubject = $pages.subscribe((pages: PageElement[] = []) => {
      this.pageLength = pages.length;
    });
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    if (this.pageSubject) {
      this.pageSubject.unsubscribe();
    }
  }

  addPage() {
    addPageAction({
      name: "Page_" + (this.pageLength + 1),
      component_ids: [],
      url: ("Page_" + (this.pageLength + 1)).toLowerCase()
    });
  }

  render() {
    return html` <nr-button @click=${this.addPage}>New Screen</nr-button> `;
  }
}
