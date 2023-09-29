import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("attribute-font-style-value-label")
export class FOntSTyleLAbel extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }
    `,
  ];

  render() {
    return html`Font Style`;
  }
}
