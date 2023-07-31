import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import styles from "./AppInfo.style";

@customElement("topbar-app-info")
export class TopbarAppInfo extends LitElement {
  static styles = styles;

  render() {
    return html`<div class="application-title">VeeApp - App1</div>`;
  }
}
