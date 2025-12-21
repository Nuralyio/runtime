import type { ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { BaseElementBlock } from '../../base/BaseElement';
import { css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

/**
 * ResourcePermission interface matching backend model
 */
interface ResourcePermission {
  id?: number;
  resource_id: string;
  resource_type: 'page' | 'component' | 'application';
  grantee_type: 'user' | 'role' | 'public' | 'anonymous';
  grantee_id: string | null;
  permission: 'read' | 'write' | 'delete' | 'share';
}

/**
 * ApplicationRole interface matching backend model
 */
interface ApplicationRole {
  id: number;
  application_id: string | null;
  name: string;
  display_name: string;
  description?: string;
  permissions: string[];
  is_system: boolean;
  hierarchy: number;
}

/**
 * System roles (from backend)
 */
const SYSTEM_ROLES: Omit<ApplicationRole, 'id' | 'application_id'>[] = [
  {
    name: 'owner',
    display_name: 'Owner',
    description: 'Full control, delete app, transfer ownership',
    permissions: ['*'],
    is_system: true,
    hierarchy: 100
  },
  {
    name: 'admin',
    display_name: 'Administrator',
    description: 'Manage members, edit app settings',
    permissions: ['application:read', 'application:write', 'page:*', 'component:*', 'member:*'],
    is_system: true,
    hierarchy: 80
  },
  {
    name: 'editor',
    display_name: 'Editor',
    description: 'Create/edit pages & components',
    permissions: ['application:read', 'page:*', 'component:*', 'member:read'],
    is_system: true,
    hierarchy: 60
  },
  {
    name: 'viewer',
    display_name: 'Viewer',
    description: 'Read-only access',
    permissions: ['application:read', 'page:read', 'component:read', 'member:read'],
    is_system: true,
    hierarchy: 40
  }
];

const PERMISSION_OPTIONS = [
  { value: 'read', label: 'View', description: 'Can view the page' },
  { value: 'write', label: 'Edit', description: 'Can modify the page' },
  { value: 'delete', label: 'Delete', description: 'Can delete the page' },
  { value: 'share', label: 'Share', description: 'Can share access with others' }
];

/**
 * AccessRoles Component
 *
 * A UI component for managing page access control.
 * Displays public/anonymous access toggles and role-based permissions.
 * Emits events for all actions - parent handles API calls.
 */
@customElement("access-roles-display")
export class AccessRolesDisplay extends BaseElementBlock {
  static override styles = [
    css`
      :host {
        display: block;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 12px;
      }

      .access-container {
        padding: 8px;
        width: 100%;
        box-sizing: border-box;
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

      .toggle-content { flex: 1; }

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

      nr-select.permission-select {
        width: 90px;
        --nuraly-select-height: 26px;
        --nuraly-font-size-select: 10px;
      }

      .preset-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }

      .preset-buttons nr-button {
        --nuraly-button-height: 24px;
        --nuraly-button-font-size: 10px;
        --nuraly-button-padding-horizontal: 8px;
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

      .role-info { display: flex; flex-direction: column; flex: 1; }

      .role-header { display: flex; align-items: center; gap: 8px; }

      .role-name-badge {
        font-size: 11px;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 4px;
        display: inline-block;
      }

      .role-name-badge.system { color: #6b7280; background: #f3f4f6; }
      .role-name-badge.custom { color: #059669; background: #d1fae5; }

      .role-type-tag {
        font-size: 9px;
        color: #9ca3af;
        text-transform: uppercase;
      }

      .role-description {
        font-size: 10px;
        color: var(--nuraly-text-tertiary, #888);
        margin-top: 4px;
      }

      .role-actions { display: flex; align-items: center; gap: 8px; }

      .empty-state {
        text-align: center;
        padding: 16px;
        color: var(--nuraly-text-tertiary, #888);
        font-size: 11px;
        background: var(--nuraly-bg-secondary, #f5f5f5);
        border-radius: 4px;
        margin-bottom: 12px;
      }

      .divider {
        height: 1px;
        background: var(--nuraly-border, #e0e0e0);
        margin: 16px 0;
      }

      .custom-role-input {
        display: flex;
        gap: 8px;
        margin-top: 8px;
      }

      .custom-role-input nr-input {
        flex: 1;
        --nuraly-spacing-input-height: 28px;
        --nuraly-font-size-input: 11px;
      }

      nr-checkbox { --nuraly-checkbox-size: 16px; }

      .info-text {
        font-size: 10px;
        color: var(--nuraly-text-tertiary, #888);
        margin-top: 4px;
        line-height: 1.4;
      }

      .info-box {
        padding: 10px 12px;
        background: #fffbeb;
        border: 1px solid #fcd34d;
        border-radius: 6px;
        margin-bottom: 12px;
      }

      .info-box-title { font-size: 11px; font-weight: 600; color: #92400e; margin-bottom: 4px; }
      .info-box-text { font-size: 10px; color: #a16207; line-height: 1.4; }

      .access-summary {
        padding: 10px 12px;
        background: #f0fdf4;
        border: 1px solid #86efac;
        border-radius: 6px;
        margin-bottom: 12px;
      }

      .access-summary-title { font-size: 11px; font-weight: 600; color: #166534; margin-bottom: 4px; }
      .access-summary-text { font-size: 10px; color: #15803d; line-height: 1.4; }

      .select-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
      }

      .select-label {
        font-size: 11px;
        color: var(--nuraly-text-secondary, #666);
        min-width: 70px;
      }

      nr-select {
        flex: 1;
        --nuraly-select-height: 28px;
        --nuraly-font-size-select: 11px;
      }
    `,
  ];

  @property({ type: Object })
  component: ComponentElement;

  @state()
  private customRoleName: string = '';

  @state()
  private selectedPermission: string = 'read';

  private emitChange(action: string, data: any) {
    this.executeEvent("onChange", new CustomEvent('change'), { action, ...data });
  }

  private getConfig() {
    const h = this.inputHandlersValue || {};
    return {
      is_public: h.is_public || false,
      is_anonymous: h.is_anonymous || false,
      role_permissions: h.role_permissions || [],
      available_roles: h.available_roles || SYSTEM_ROLES.map((r, i) => ({ ...r, id: i + 1, application_id: null }))
    };
  }

  private handlePublicToggle(checked: boolean) {
    this.emitChange('toggle_public', { is_public: checked, grantee_type: 'public', permission: 'read' });
  }

  private handleAnonymousToggle(checked: boolean) {
    this.emitChange('toggle_anonymous', { is_anonymous: checked, grantee_type: 'anonymous', permission: 'read' });
  }

  private addRolePermission(role: any) {
    const config = this.getConfig();
    if (config.role_permissions.some((rp: any) => rp.role_name === role.name)) return;
    this.emitChange('add_role_permission', {
      grantee_type: 'role',
      role_name: role.name,
      role_id: role.id,
      permission: this.selectedPermission,
      is_system: role.is_system
    });
  }

  private addCustomRolePermission() {
    if (!this.customRoleName.trim()) return;
    const roleName = this.customRoleName.trim().toLowerCase();
    const config = this.getConfig();
    if (config.role_permissions.some((rp: any) => rp.role_name === roleName)) {
      this.customRoleName = '';
      return;
    }
    this.emitChange('add_role_permission', {
      grantee_type: 'role',
      role_name: roleName,
      permission: this.selectedPermission,
      is_system: false
    });
    this.customRoleName = '';
  }

  private updateRolePermission(roleName: string, permission: string) {
    this.emitChange('update_role_permission', { role_name: roleName, permission });
  }

  private removeRolePermission(roleName: string) {
    this.emitChange('remove_role_permission', { role_name: roleName });
  }

  private renderAccessSummary() {
    const config = this.getConfig();
    if (config.is_anonymous) {
      return html`<div class="access-summary"><div class="access-summary-title">Anyone can access</div><div class="access-summary-text">This page is accessible to everyone, including users who are not logged in.</div></div>`;
    }
    if (config.is_public) {
      return html`<div class="access-summary"><div class="access-summary-title">Public with link</div><div class="access-summary-text">Anyone with the link can view this page.</div></div>`;
    }
    if (config.role_permissions.length > 0) {
      const roleNames = config.role_permissions.map((rp: any) => rp.role_name).join(', ');
      return html`<div class="access-summary"><div class="access-summary-title">Role-based access</div><div class="access-summary-text">Only users with these roles can access: ${roleNames}</div></div>`;
    }
    return html`<div class="info-box"><div class="info-box-title">Restricted</div><div class="info-box-text">This page is only accessible to application members.</div></div>`;
  }

  private renderRoleItem(rp: any) {
    const systemRole = SYSTEM_ROLES.find(r => r.name === rp.role_name);
    return html`
      <div class="role-item">
        <div class="role-info">
          <div class="role-header">
            <span class="role-name-badge ${rp.is_system ? 'system' : 'custom'}">${systemRole?.display_name || rp.role_name}</span>
            <span class="role-type-tag">${rp.is_system ? 'system' : 'custom'}</span>
          </div>
          ${systemRole?.description ? html`<div class="role-description">${systemRole.description}</div>` : nothing}
        </div>
        <div class="role-actions">
          <nr-select class="permission-select" size="small" .value=${rp.permission} @nr-change=${(e: CustomEvent) => this.updateRolePermission(rp.role_name, e.detail?.value || 'read')}>
            ${PERMISSION_OPTIONS.map(opt => html`<nr-option value="${opt.value}">${opt.label}</nr-option>`)}
          </nr-select>
          <nr-button type="text" size="small" @click=${() => this.removeRolePermission(rp.role_name)}>×</nr-button>
        </div>
      </div>
    `;
  }

  override renderComponent() {
    const config = this.getConfig();
    const addedRoleNames = new Set(config.role_permissions.map((rp: any) => rp.role_name));

    return html`
      <div class="access-container">
        ${this.renderAccessSummary()}

        <div class="section">
          <div class="section-title">Public Access</div>
          <div class="access-toggle-row ${config.is_anonymous ? 'active' : ''}">
            <div class="toggle-content">
              <div class="toggle-label">Anonymous Access</div>
              <div class="toggle-description">Allow unauthenticated users (no login required)</div>
            </div>
            <nr-checkbox size="small" .checked=${config.is_anonymous} @nr-change=${(e: CustomEvent) => this.handleAnonymousToggle(e.detail?.checked || false)}></nr-checkbox>
          </div>
          <div class="access-toggle-row ${config.is_public && !config.is_anonymous ? 'active' : ''}">
            <div class="toggle-content">
              <div class="toggle-label">Public with Link</div>
              <div class="toggle-description">Anyone with the page link can view</div>
            </div>
            <nr-checkbox size="small" .checked=${config.is_public} .disabled=${config.is_anonymous} @nr-change=${(e: CustomEvent) => this.handlePublicToggle(e.detail?.checked || false)}></nr-checkbox>
          </div>
        </div>

        <div class="divider"></div>

        <div class="section">
          <div class="section-title">Role-Based Access</div>
          <p class="info-text" style="margin-bottom: 12px;">Grant access to users based on their application role.</p>
          ${config.role_permissions.length > 0 ? html`<div class="roles-list">${config.role_permissions.map((rp: any) => this.renderRoleItem(rp))}</div>` : html`<div class="empty-state">No role-based permissions configured</div>`}
        </div>

        <div class="divider"></div>

        <div class="section">
          <div class="section-title">Add Role Permission</div>
          <div class="select-row">
            <span class="select-label">Permission:</span>
            <nr-select size="small" .value=${this.selectedPermission} @nr-change=${(e: CustomEvent) => this.selectedPermission = e.detail?.value || 'read'}>
              ${PERMISSION_OPTIONS.map(opt => html`<nr-option value="${opt.value}">${opt.label} - ${opt.description}</nr-option>`)}
            </nr-select>
          </div>
          <div class="section-title" style="margin-top: 12px;">System Roles</div>
          <div class="preset-buttons">
            ${SYSTEM_ROLES.filter(role => !addedRoleNames.has(role.name)).map(role => html`<nr-button dashed size="small" @click=${() => this.addRolePermission({ ...role, id: 0, application_id: null })}>+ ${role.display_name}</nr-button>`)}
            ${SYSTEM_ROLES.every(role => addedRoleNames.has(role.name)) ? html`<span class="info-text">All system roles added</span>` : nothing}
          </div>
          <div class="section-title" style="margin-top: 12px;">Custom Role</div>
          <div class="custom-role-input">
            <nr-input size="small" .value=${this.customRoleName} placeholder="Enter custom role name..." @nr-input=${(e: CustomEvent) => this.customRoleName = e.detail?.value || ''} @keydown=${(e: KeyboardEvent) => e.key === 'Enter' && this.addCustomRolePermission()}></nr-input>
            <nr-button size="small" @click=${() => this.addCustomRolePermission()}>Add</nr-button>
          </div>
          <p class="info-text">Custom roles must match roles defined in your application.</p>
        </div>
      </div>
    `;
  }
}
