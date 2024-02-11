import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("attribute-color-value-label")
export class AttributeBackgroundColorValueLabel extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }
    `,
  ];

  render() {
    return html`Color`;
  }
}
