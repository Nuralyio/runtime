import { html } from "lit";
import { customElement } from "lit/decorators.js";
import { BasePropertyPanel } from "./base-panel.ts";

@customElement("component-handler-panel")
export class ComponentHandlerPanel extends BasePropertyPanel {
  override render() {
    if (!this.resolvedComponents.length) {
      return html`<div class="empty-state">No handlers available</div>`;
    }
    return html`<micro-component .components=${this.resolvedComponents} .isViewMode=${false}></micro-component>`;
  }
}
