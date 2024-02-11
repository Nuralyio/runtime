import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("attributes-text-value-label")
export class AttributesTextValueLabel extends LitElement {
  static styles = [];

  render() {
    return html`<span>Value</span>`;
  }
}
