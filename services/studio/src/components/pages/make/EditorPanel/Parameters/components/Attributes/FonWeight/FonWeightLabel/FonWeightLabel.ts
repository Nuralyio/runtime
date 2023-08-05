import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("attribute-font-size-weight-label")
export class AttributeFontSizeWeightLabel extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }
    `,
  ];

  render() {
    return html`Weight`;
  }
}
