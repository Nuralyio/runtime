import { html } from "lit";
import { customElement } from "lit/decorators.js";
import { BasePropertyPanel } from "./base-panel.ts";

@customElement("component-style-panel")
export class ComponentStylePanel extends BasePropertyPanel {
  override render() {
    if (!this.resolvedComponents.length) {
      return html`<div class="empty-state">No styles available</div>`;
    }
    return html`<micro-component .components=${this.resolvedComponents} .isViewMode=${false}></micro-component>`;
  }
}
