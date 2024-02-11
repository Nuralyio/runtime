import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("attributes-container-direction-label")
export class AttributesTextValueLabel extends LitElement {
  static styles = [];

  render() {
    return html`<span>Direction</span>`;
  }
}
