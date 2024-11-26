import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { v4 as uuidv4 } from "uuid";

import "@nuralyui/menu";
import "@nuralyui/button";
import "@nuralyui/icon";
import { $pages } from "$store/page";
import { type PageElement } from "$store/handlers/pages/interfaces/interface";

import { addPageAction } from "$store/actions/page/addPageAction.ts";

@customElement("add-screen-editor")
export class AddScreen extends LitElement {
  @state()
  pageLength = 0;
  constructor() {
    super();
    
  }
  pageSubject: any;
  override connectedCallback() {
    super.connectedCallback();
    this.pageSubject= $pages.subscribe((pages: PageElement[] = []) => {
      this.pageLength = pages.length;
    });
  }
  override disconnectedCallback() {
    super.disconnectedCallback();
    if(this.pageSubject){
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
    return html` <hy-button @click=${this.addPage}>New Screen</hy-button> `;
  }
}
