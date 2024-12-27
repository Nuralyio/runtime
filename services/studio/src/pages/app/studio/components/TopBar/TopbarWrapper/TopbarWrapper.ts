import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import styles from "./TopbarWrapper.style.ts";


@customElement("topbar-panel-wrapper")
export class TopbarPanelWrapper extends LitElement {
  static override styles = styles;

  render() {
    return html`
    <div class="topbar-wrapper">
     <micro-app uuid="1" componentToRenderUUID="top-bar"></micro-app>
    </div>`;
  }
}
