/**
 * Native Common Properties Panel
 *
 * Displays common properties shared by all components:
 * - Name, ID, Hash (read-only)
 * - Display toggle
 * - Visible to Roles (access control)
 *
 * Uses direct nr-* components without low-code mechanism.
 */

import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { updateComponentAttributes } from "../../../../runtime/redux/actions/component/updateComponentAttributes";
import type { ComponentElement } from "../../../../runtime/redux/store/component/component.interface";
import { $currentApplication } from "@nuraly/runtime/redux/store";
import {
  getAppMembersData,
  getCachedAppMembersData,
  $appMembersCache,
  type AppRole
} from "../../../../runtime/redux/store/app-members";

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

    .roles-select {
      width: 100%;
    }
  `;

  @property({ attribute: false })
  component: ComponentElement | null = null;

  @state()
  private roles: AppRole[] = [];

  private storeUnsubscribe: (() => void) | null = null;

  override connectedCallback() {
    super.connectedCallback();

    // Subscribe to app members cache for roles
    this.storeUnsubscribe = $appMembersCache.subscribe((cache) => {
      const app = $currentApplication.get();
      if (app?.uuid && cache[app.uuid]) {
        this.roles = cache[app.uuid].roles || [];
      }
    });

    this.loadRoles();
  }

  override disconnectedCallback() {
    if (this.storeUnsubscribe) {
      this.storeUnsubscribe();
      this.storeUnsubscribe = null;
    }
    super.disconnectedCallback();
  }

  private async loadRoles() {
    const app = $currentApplication.get();
    if (!app?.uuid) return;

    // Check cache first
    const cached = getCachedAppMembersData(app.uuid);
    if (cached) {
      this.roles = cached.roles || [];
      return;
    }

    // Fetch from API
    const data = await getAppMembersData(app.uuid);
    if (data) {
      this.roles = data.roles || [];
    }
  }

  private getRoleOptions() {
    return this.roles.map(role => ({
      label: role.displayName,
      value: role.name
    }));
  }

  private getSelectedRoles(): string[] {
    const accessInput = this.component?.input?.access;
    if (accessInput?.type === 'object' && accessInput?.value?.roles) {
      return accessInput.value.roles;
    }
    if (Array.isArray(accessInput?.roles)) {
      return accessInput.roles;
    }
    return [];
  }

  private handleAccessRolesChange(e: CustomEvent) {
    if (!this.component) return;
    const selectedRoles = e.detail?.value || [];

    updateComponentAttributes(
      this.component.application_id,
      this.component.uuid,
      "input",
      {
        access: {
          type: "object",
          value: { roles: selectedRoles }
        }
      },
      true
    );
  }

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

      <nr-row gutter="8">
        <nr-col span="8"><nr-label size="small">Visible to</nr-label></nr-col>
        <nr-col flex="auto">
          <nr-select
            class="roles-select"
            size="small"
            multiple
            placeholder="All users (no restriction)"
            .value=${this.getSelectedRoles()}
            .options=${this.getRoleOptions()}
            @nr-change=${this.handleAccessRolesChange}
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
