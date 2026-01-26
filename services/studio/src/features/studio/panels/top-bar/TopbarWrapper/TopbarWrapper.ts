import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import styles from "./TopbarWrapper.style.ts";

// Import native topbar component
import "../StudioTopBar.ts";

@customElement("topbar-panel-wrapper")
export class TopbarPanelWrapper extends LitElement {
  static override styles = styles;

  render() {
    return html`
    <div class="topbar-wrapper">
      <studio-topbar></studio-topbar>
    </div>`;
  }
}
