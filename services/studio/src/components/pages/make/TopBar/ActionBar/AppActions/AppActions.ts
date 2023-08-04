import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import styles from "./AppActions.style";

@customElement("topbar-app-actions")
export class TopbarAppActions extends LitElement {
  static styles = styles;

  render() {
    return html`<div class="app-action-wrapper">
      <hy-button icon="comment"></hy-button>
      <hy-button icon="play"></hy-button>
      <hy-button icon="save"></hy-button>
    </div>`;
  }
}
