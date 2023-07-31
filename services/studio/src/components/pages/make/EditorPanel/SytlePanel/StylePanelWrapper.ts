import { LitElement, html } from "lit";
import { state, property, customElement } from "lit/decorators.js";
import "@hybridui/button";
import "@hybridui/tabs";
import "@hybridui/input";
import "@hybridui/dropdown";
import "./BoxStylePanel";
@customElement("style-panel-wrapper-editor")
export class StyleWrapperPanel extends LitElement {
  render() {
    return html`
      <div>
        <box-style-panel-editor></box-style-panel-editor>
        <slot></slot>
      </div>
    `;
  }
}
