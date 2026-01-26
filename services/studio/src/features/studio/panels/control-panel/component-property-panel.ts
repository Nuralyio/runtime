import { html } from "lit";
import { customElement } from "lit/decorators.js";
import { BasePropertyPanel } from "./base-panel.ts";

@customElement("component-property-panel")
export class ComponentPropertyPanel extends BasePropertyPanel {
  override render() {
    if (!this.resolvedComponents.length) {
      return html`<div class="empty-state">No properties available</div>`;
    }
    return html`<micro-component .components=${this.resolvedComponents} .isViewMode=${false}></micro-component>`;
  }
}
