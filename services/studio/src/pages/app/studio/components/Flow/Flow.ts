import { customElement } from "lit/decorators.js";
import { html, LitElement } from "lit";
import "@nuralyui/canvas";

@customElement("flow-page")
export class PageContent extends LitElement {

  override render() {
    return html`<nodes-canvas></nodes-canvas>`;
  }
}