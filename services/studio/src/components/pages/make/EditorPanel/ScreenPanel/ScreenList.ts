import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { StoreController, useStores } from "@nanostores/lit";
import { $pages, PageElement } from "../../../../../store/pages";
import "@hybridui/menu";
import "@hybridui/icon";
@customElement("screen-list-editor")
@useStores($pages)
export class ScreenListEditor extends LitElement {
  private componentController = new StoreController(this, $pages);
  options: any[];
  constructor() {
    super();
    $pages.subscribe((pages: PageElement[] = []) => {
      this.options = pages.map((page) => ({ label: page.name }));
      console.log(this.options);
    });
  }
  render() {
    return html`
      <hy-menu
        placeholder="Select an option"
        .options=${this.options}
        @change="${(e: any) => console.log(e.detail.value)}"
      ></hy-menu>
    `;
  }
}
