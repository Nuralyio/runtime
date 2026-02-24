/**
 * Native Access Panel
 *
 * For components: Simple role-based visibility selector
 * For pages: Full permissions management (anonymous access, role permissions)
 */

import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { ComponentElement } from "../../../../runtime/redux/store/component/component.interface";
import type { PageElement } from "../../../../runtime/redux/handlers/pages/page.interface";
import { $currentApplication } from "@nuraly/runtime/redux/store";
import { updateComponentAttributes } from "../../../../runtime/redux/actions/component/updateComponentAttributes";
import {
  getAppMembersData,
  getCachedAppMembersData,
  $appMembersCache,
  type AppRole
} from "../../../../runtime/redux/store/app-members";

interface RolePermission {
  role_name: string;
  permission: string;
  is_system: boolean;
}

interface ParsedPermissions {
  is_public: boolean;
  is_anonymous: boolean;
  role_permissions: RolePermission[];
}

const PERMISSION_OPTIONS = [
  { value: 'read', label: 'View' },
  { value: 'write', label: 'Edit' },
  { value: 'delete', label: 'Delete' },
  { value: 'share', label: 'Share' }
];

@customElement("native-access-panel")
export class NativeAccessPanel extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-size: 12px;
    }

    .access-container {
      padding: 12px;
    }

    .section {
      margin-bottom: 16px;
    }

    .section-title {
      font-size: 10px;
      font-weight: 600;
      color: var(--nuraly-text-secondary, #888);
      text-transform: uppercase;
      margin-bottom: 8px;
      letter-spacing: 0.5px;
    }

    .access-toggle-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      background: var(--nuraly-bg-secondary, #f5f5f5);
      border-radius: 6px;
      margin-bottom: 8px;
    }

    .access-toggle-row.active {
      background: var(--nuraly-primary-light, #e6f0ff);
      border: 1px solid var(--nuraly-primary, #4a9eff);
    }

    .toggle-content {
      flex: 1;
    }

    .toggle-label {
      font-size: 12px;
      color: var(--nuraly-text-primary, #333);
      font-weight: 500;
    }

    .toggle-description {
      font-size: 10px;
      color: var(--nuraly-text-tertiary, #888);
      margin-top: 2px;
    }

    .roles-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 12px;
    }

    .role-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 10px;
      background: var(--nuraly-bg-secondary, #f5f5f5);
      border-radius: 6px;
      border: 1px solid var(--nuraly-border, #e0e0e0);
    }

    .role-info {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .role-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .role-name-badge {
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 4px;
    }

    .role-name-badge.system {
      color: #6b7280;
      background: #f3f4f6;
    }

    .role-name-badge.custom {
      color: #059669;
      background: #d1fae5;
    }

    .role-type-tag {
      font-size: 9px;
      color: #9ca3af;
      text-transform: uppercase;
    }

    .role-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .empty-state {
      text-align: center;
      padding: 16px;
      color: var(--nuraly-text-tertiary, #888);
      font-size: 11px;
      background: var(--nuraly-bg-secondary, #f5f5f5);
      border-radius: 4px;
    }

    .divider {
      height: 1px;
      background: var(--nuraly-border, #e0e0e0);
      margin: 16px 0;
    }

    .preset-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    .add-role-section {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }

    .info-text {
      font-size: 10px;
      color: var(--nuraly-text-tertiary, #888);
      margin-top: 4px;
    }

    .access-summary {
      padding: 10px 12px;
      border-radius: 6px;
      margin-bottom: 12px;
    }

    .access-summary.public {
      background: #f0fdf4;
      border: 1px solid #86efac;
    }

    .access-summary.restricted {
      background: #fffbeb;
      border: 1px solid #fcd34d;
    }

    .access-summary-title {
      font-size: 11px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .access-summary.public .access-summary-title {
      color: #166534;
    }

    .access-summary.restricted .access-summary-title {
      color: #92400e;
    }

    .access-summary-text {
      font-size: 10px;
      line-height: 1.4;
    }

    .access-summary.public .access-summary-text {
      color: #15803d;
    }

    .access-summary.restricted .access-summary-text {
      color: #a16207;
    }

    .loading {
      text-align: center;
      padding: 20px;
      color: var(--nuraly-text-tertiary, #888);
    }

    nr-select {
      --nuraly-select-height: 26px;
      --nuraly-font-size-select: 10px;
      width: 80px;
    }

    .permission-select {
      width: 100px;
    }
  `;

  @property({ type: Object })
  component: ComponentElement | null = null;

  @property({ type: Object })
  page: PageElement | null = null;

  @state()
  private permissions: ParsedPermissions | null = null;

  @state()
  private isLoading = true;

  @state()
  private selectedPermission = 'read';

  @state()
  private customRoleName = '';

  @state()
  private roles: AppRole[] = [];

  private storeUnsubscribe: (() => void) | null = null;

  private get resourceType(): string {
    return this.component ? 'component' : 'page';
  }

  private get resourceId(): string | null {
    return this.component?.uuid || this.page?.uuid || null;
  }

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

  override updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('component') || changedProperties.has('page')) {
      this.loadPermissions();
    }
  }

  private async loadPermissions() {
    const resourceId = this.resourceId;
    if (!resourceId) {
      this.isLoading = false;
      return;
    }

    this.isLoading = true;

    try {
      const response = await fetch(`/api/resources/${this.resourceType}/${resourceId}/permissions`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        this.permissions = {
          is_public: data.is_public || false,
          is_anonymous: data.is_anonymous || false,
          role_permissions: data.role_permissions || []
        };
      } else {
        this.permissions = { is_public: false, is_anonymous: false, role_permissions: [] };
      }
    } catch (error) {
      console.error('Failed to load permissions:', error);
      this.permissions = { is_public: false, is_anonymous: false, role_permissions: [] };
    } finally {
      this.isLoading = false;
    }
  }

  private async handleAnonymousToggle(checked: boolean) {
    const resourceId = this.resourceId;
    if (!resourceId) return;

    const baseUrl = `/api/resources/${this.resourceType}/${resourceId}`;
    const permission = `${this.resourceType}:read`;

    try {
      const response = checked
        ? await fetch(`${baseUrl}/make-anonymous`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ permission })
          })
        : await fetch(`${baseUrl}/make-anonymous`, {
            method: 'DELETE',
            credentials: 'include'
          });

      if (response.ok) {
        await this.loadPermissions();
      }
    } catch (error) {
      console.error('Failed to toggle anonymous access:', error);
    }
  }

  private async addRolePermission(roleName: string, isSystem: boolean) {
    const resourceId = this.resourceId;
    if (!resourceId) return;

    // Check if already added
    if (this.permissions?.role_permissions.some(rp => rp.role_name === roleName)) {
      return;
    }

    try {
      const response = await fetch(`/api/resources/${this.resourceType}/${resourceId}/role-permission`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ roleName, permission: this.selectedPermission })
      });

      if (response.ok) {
        await this.loadPermissions();
      }
    } catch (error) {
      console.error('Failed to add role permission:', error);
    }
  }

  private async updateRolePermission(roleName: string, permission: string) {
    const resourceId = this.resourceId;
    if (!resourceId) return;

    try {
      // Delete existing then add new
      await fetch(`/api/resources/${this.resourceType}/${resourceId}/role-permission/${encodeURIComponent(roleName)}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      await fetch(`/api/resources/${this.resourceType}/${resourceId}/role-permission`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ roleName, permission })
      });

      await this.loadPermissions();
    } catch (error) {
      console.error('Failed to update role permission:', error);
    }
  }

  private async removeRolePermission(roleName: string) {
    const resourceId = this.resourceId;
    if (!resourceId) return;

    try {
      await fetch(`/api/resources/${this.resourceType}/${resourceId}/role-permission/${encodeURIComponent(roleName)}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      await this.loadPermissions();
    } catch (error) {
      console.error('Failed to remove role permission:', error);
    }
  }

  private async addCustomRole() {
    if (!this.customRoleName.trim()) return;

    await this.addRolePermission(this.customRoleName.trim().toLowerCase(), false);
    this.customRoleName = '';
  }

  private renderAccessSummary() {
    if (!this.permissions) return nothing;

    if (this.permissions.is_anonymous) {
      return html`
        <div class="access-summary public">
          <div class="access-summary-title">Anyone can access</div>
          <div class="access-summary-text">This ${this.resourceType} is accessible to everyone, including users who are not logged in.</div>
        </div>
      `;
    }

    if (this.permissions.role_permissions.length > 0) {
      const roleNames = this.permissions.role_permissions.map(rp => rp.role_name).join(', ');
      return html`
        <div class="access-summary public">
          <div class="access-summary-title">Role-based access</div>
          <div class="access-summary-text">Only users with these roles can access: ${roleNames}</div>
        </div>
      `;
    }

    return html`
      <div class="access-summary restricted">
        <div class="access-summary-title">Restricted</div>
        <div class="access-summary-text">This ${this.resourceType} is only accessible to application members.</div>
      </div>
    `;
  }

  private renderRoleItem(rp: RolePermission) {
    const role = this.roles.find(r => r.name === rp.role_name);

    return html`
      <div class="role-item">
        <div class="role-info">
          <div class="role-header">
            <span class="role-name-badge ${role?.isSystem ? 'system' : 'custom'}">
              ${role?.displayName || rp.role_name}
            </span>
            <span class="role-type-tag">${role?.isSystem ? 'system' : 'custom'}</span>
          </div>
        </div>
        <div class="role-actions">
          <nr-select
            class="permission-select"
            size="small"
            .value=${rp.permission}
            .options=${PERMISSION_OPTIONS}
            @nr-change=${(e: CustomEvent) => this.updateRolePermission(rp.role_name, e.detail?.value || 'read')}
          ></nr-select>
          <nr-button
            size="small"
            variant="text"
            .iconLeft=${"x"}
            @click=${() => this.removeRolePermission(rp.role_name)}
          ></nr-button>
        </div>
      </div>
    `;
  }

  // === Component-specific methods (simple role selector) ===

  private getComponentSelectedRoles(): string[] {
    const accessInput = this.component?.input?.access;
    if (accessInput?.type === 'object' && accessInput?.value?.roles) {
      return accessInput.value.roles;
    }
    if (Array.isArray(accessInput?.roles)) {
      return accessInput.roles;
    }
    return [];
  }

  private handleComponentRolesChange(e: CustomEvent) {
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

  private getRoleOptions() {
    return this.roles.map(role => ({
      label: role.displayName,
      value: role.name
    }));
  }

  private renderComponentAccess() {
    const selectedRoles = this.getComponentSelectedRoles();

    return html`
      <div class="access-container">
        <div class="section">
          <div class="section-title">Visible to Roles</div>
          <nr-select
            size="small"
            multiple
            placeholder="All users (no restriction)"
            .value=${selectedRoles}
            .options=${this.getRoleOptions()}
            @nr-change=${(e: CustomEvent) => this.handleComponentRolesChange(e)}
            style="width: 100%;"
          ></nr-select>
          <div class="info-text" style="margin-top: 8px;">
            ${selectedRoles.length === 0
              ? 'Component is visible to all users'
              : `Component is only visible to: ${selectedRoles.join(', ')}`
            }
          </div>
        </div>
      </div>
    `;
  }

  override render() {
    if (!this.component && !this.page) {
      return html`<div class="empty-state">Select a component or page to manage access</div>`;
    }

    // For components: show simple role selector
    if (this.component) {
      return this.renderComponentAccess();
    }

    // For pages: show full permissions panel
    if (this.isLoading) {
      return html`<div class="loading"><nr-spinner size="small"></nr-spinner></div>`;
    }

    const addedRoleNames = new Set(this.permissions?.role_permissions.map(rp => rp.role_name) || []);

    return html`
      <div class="access-container">
        ${this.renderAccessSummary()}

        <div class="section">
          <div class="section-title">Public Access</div>
          <div class="access-toggle-row ${this.permissions?.is_anonymous ? 'active' : ''}">
            <div class="toggle-content">
              <div class="toggle-label">Anonymous Access</div>
              <div class="toggle-description">Allow unauthenticated users (no login required)</div>
            </div>
            <nr-checkbox
              size="small"
              .checked=${this.permissions?.is_anonymous || false}
              @nr-change=${(e: CustomEvent) => this.handleAnonymousToggle(e.detail?.checked || false)}
            ></nr-checkbox>
          </div>
        </div>

        <div class="divider"></div>

        <div class="section">
          <div class="section-title">Role-Based Access</div>
          ${this.permissions?.role_permissions.length
            ? html`<div class="roles-list">${this.permissions.role_permissions.map(rp => this.renderRoleItem(rp))}</div>`
            : html`<div class="empty-state">No role-based permissions configured</div>`
          }
        </div>

        <div class="divider"></div>

        <div class="section">
          <div class="section-title">Add System Role</div>
          <div class="preset-buttons">
            ${this.roles.filter(role => role.isSystem && !addedRoleNames.has(role.name)).map(role => html`
              <nr-button
                size="small"
                variant="dashed"
                @click=${() => this.addRolePermission(role.name, true)}
              >+ ${role.displayName}</nr-button>
            `)}
            ${this.roles.filter(r => r.isSystem).every(role => addedRoleNames.has(role.name))
              ? html`<span class="info-text">All system roles added</span>`
              : nothing
            }
          </div>
        </div>

        <div class="section">
          <div class="section-title">Add Custom Role</div>
          <div class="preset-buttons">
            ${this.roles.filter(role => !role.isSystem && !addedRoleNames.has(role.name)).map(role => html`
              <nr-button
                size="small"
                variant="dashed"
                @click=${() => this.addRolePermission(role.name, false)}
              >+ ${role.displayName}</nr-button>
            `)}
            ${this.roles.filter(r => !r.isSystem).length === 0
              ? html`<span class="info-text">No custom roles defined</span>`
              : this.roles.filter(r => !r.isSystem).every(role => addedRoleNames.has(role.name))
                ? html`<span class="info-text">All custom roles added</span>`
                : nothing
            }
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "native-access-panel": NativeAccessPanel;
  }
}
