import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("attribute-background-color-label")
export class AttributeBackgroundColorValueLabel extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }
    `
  ];

  render() {
    return html`Color`;
  }
}
