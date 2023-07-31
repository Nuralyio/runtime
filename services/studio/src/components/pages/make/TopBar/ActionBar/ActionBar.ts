import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("topbar-action-bar")
export class TopbarActionBar extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
        background-color: green;
        height: 60px;
      }
    `,
  ];

  render() {
    return html``;
  }
}
