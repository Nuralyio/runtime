/**
 * Native Common Properties Panel
 *
 * Displays common properties shared by all components:
 * - Name, ID, Hash (read-only)
 * - Display toggle
 * - Access control
 *
 * Uses direct nr-* components without low-code mechanism.
 */

import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { updateComponentAttributes } from "../../../../runtime/redux/actions/component/updateComponentAttributes";
import type { ComponentElement } from "../../../../runtime/redux/store/component/component.interface";

@customElement("common-properties-panel")
export class CommonPropertiesPanel extends LitElement {
  static override styles = css`
    :host {
      display: block;
      padding: 8px 12px;
    }

    nr-row {
      margin-bottom: 8px;
    }
  `;

  @property({ attribute: false })
  component: ComponentElement | null = null;

  private handleNameChange(e: CustomEvent) {
    if (!this.component) return;
    updateComponentAttributes(
      this.component.application_id,
      this.component.uuid,
      "name" as any,
      e.detail.value,
      true
    );
  }

  private handleDisplayChange(e: CustomEvent) {
    if (!this.component) return;
    const value = e.detail.value;
    updateComponentAttributes(
      this.component.application_id,
      this.component.uuid,
      "input",
      { display: { type: "boolean", value: value === "show" } },
      true
    );
  }

  override render() {
    if (!this.component) {
      return html`<nr-label size="small" variant="secondary">No component selected</nr-label>`;
    }

    const displayValue = this.component.input?.display?.value !== false ? "show" : "hide";

    return html`
      <nr-row  gutter="8">
        <nr-col span="8"><nr-label size="small">Name</nr-label></nr-col>
        <nr-col flex="auto">
          <nr-input
            size="small"
            .value=${this.component.name || ""}
            @nr-input=${this.handleNameChange}
          ></nr-input>
        </nr-col>
      </nr-row>

      <nr-row  gutter="8">
        <nr-col span="8"><nr-label size="small">ID</nr-label></nr-col>
        <nr-col flex="auto">
          <nr-input
            size="small"
            .value=${this.component.uuid || ""}
            readonly
          ></nr-input>
        </nr-col>
      </nr-row>

      <nr-row  gutter="8">
        <nr-col span="8"><nr-label size="small">Hash</nr-label></nr-col>
        <nr-col flex="auto">
          <nr-tag size="small">${this.component.uuid?.slice(0, 12)}...</nr-tag>
        </nr-col>
      </nr-row>

      <nr-row  gutter="8">
        <nr-col span="8"><nr-label size="small">Display</nr-label></nr-col>
        <nr-col flex="auto">
          <nr-select
            size="small"
            .value=${displayValue}
            .options=${[
              { label: "Show", value: "show" },
              { label: "Hide", value: "hide" }
            ]}
            @nr-change=${this.handleDisplayChange}
          ></nr-select>
        </nr-col>
      </nr-row>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "common-properties-panel": CommonPropertiesPanel;
  }
}
