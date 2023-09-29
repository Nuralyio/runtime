import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("attribute-font-size-value-label")
export class FontSizeValueLabel extends LitElement {
  static styles = [
    css`
      :host {
      }
    `,
  ];

  render() {
    return html`Font Size`;
  }
}
