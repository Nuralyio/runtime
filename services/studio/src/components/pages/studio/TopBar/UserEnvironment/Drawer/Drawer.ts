import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import styles from "./Drawer.style";

@customElement("topbar-drawer")
export class TopbarDrawer extends LitElement {
  static styles = styles;

  render() {
    return html`<hy-icon class="drawer-icon" name="th"></hy-icon>`;
  }
}
