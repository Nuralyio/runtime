import type { ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { BaseElementBlock } from '../../base/BaseElement';
import { html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { accessRolesStyles } from './AccessRoles.style';

/**
 * ResourcePermission interface matching backend model
 */
interface _ResourcePermission {
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
  static override styles = [accessRolesStyles];

  @property({ type: Object })
  component!: ComponentElement;

  @state()
  private customRoleName: string = '';

  @state()
  private selectedPermission: string = 'read';

  @state()
  private initialized: boolean = false;

  @state()
  private loadedPermissions: {
    is_public: boolean;
    is_anonymous: boolean;
    role_permissions: any[];
  } | null = null;

  /** Track the last resource_id we loaded permissions for */
  private lastLoadedResourceId: string | null = null;

  override connectedCallback(): void {
    super.connectedCallback();

    // Register callback to watch for value input changes (contains resource_id)
    this.registerCallback('value', (val: any) => {
      console.log('[AccessRoles] value callback triggered:', val);
      if (val?.resource_id && val.resource_id !== this.lastLoadedResourceId) {
        console.log('[AccessRoles] Resource ID changed via callback, loading permissions:', val.resource_id);
        this.lastLoadedResourceId = val.resource_id;
        this.loadPermissions();
      }
    });
  }

  override disconnectedCallback(): void {
    this.unregisterCallback('value');
    super.disconnectedCallback();
  }

  /** Get the value input which contains resource config */
  private getValueInput() {
    return this.inputHandlersValue?.value || this.inputHandlersValue || {};
  }

  override async firstUpdated() {
    // Try to load permissions immediately if resource_id is already available
    const h = this.getValueInput();
    if (h.resource_id && h.resource_id !== this.lastLoadedResourceId) {
      console.log('[AccessRoles] firstUpdated: loading permissions for:', h.resource_id);
      this.lastLoadedResourceId = h.resource_id;
      await this.loadPermissions();
    }

    // Mark as initialized after first render to prevent initial change events
    requestAnimationFrame(() => {
      this.initialized = true;
    });
  }

  private async loadPermissions() {
    const h = this.getValueInput();
    const resourceId = h.resource_id;
    const resourceType = h.resource_type || 'page';

    console.log('[AccessRoles] loadPermissions called:', { resourceId, resourceType });

    if (!resourceId) {
      console.log('[AccessRoles] No resourceId, skipping');
      return;
    }

    try {
      const response = await fetch(`/api/resources/${resourceType}/${resourceId}/permissions`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        console.error('Failed to load permissions:', response.status);
        return;
      }

      const permissions = await response.json();
      console.log('[AccessRoles] Permissions loaded from API:', permissions);

      if (permissions && Array.isArray(permissions)) {
        const is_public = permissions.some((p: any) => p.granteeType === 'public');
        const is_anonymous = permissions.some((p: any) => p.granteeType === 'anonymous');
        const role_permissions = permissions
          .filter((p: any) => p.granteeType === 'role')
          .map((p: any) => ({
            role_name: p.granteeId,
            permission: p.permission,
            is_system: ['owner', 'admin', 'editor', 'viewer'].includes(p.granteeId)
          }));

        console.log('[AccessRoles] Setting loadedPermissions:', { is_public, is_anonymous, role_permissions });

        // Set state - this triggers a re-render
        this.loadedPermissions = { is_public, is_anonymous, role_permissions };
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
    }
  }

  /** Public method to refresh permissions - called after changes */
  public async refreshPermissions() {
    await this.loadPermissions();
  }

  private emitChange(action: string, data: any) {
    // Skip events during initialization to prevent API calls on first render
    if (!this.initialized) {
      return;
    }
    this.executeEvent("onChange", new CustomEvent('change'), { action, ...data });
  }

  private getConfig() {
    const h = this.getValueInput();
    const loaded = this.loadedPermissions;
    const config = {
      resource_type: h.resource_type || 'page',
      resource_id: h.resource_id,
      is_public: loaded?.is_public ?? h.is_public ?? false,
      is_anonymous: loaded?.is_anonymous ?? h.is_anonymous ?? false,
      role_permissions: loaded?.role_permissions ?? h.role_permissions ?? [],
      available_roles: h.available_roles || SYSTEM_ROLES.map((r, i) => ({ ...r, id: i + 1, application_id: null }))
    };
    return config;
  }

  private async handlePublicToggle(checked: boolean) {
    const h = this.getValueInput();
    const resourceId = h.resource_id;
    const resourceType = h.resource_type || 'page';

    if (!resourceId) return;

    const baseUrl = `/api/resources/${resourceType}/${resourceId}`;

    try {
      if (checked) {
        await fetch(`${baseUrl}/make-public`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ permission: 'read' })
        });
      } else {
        await fetch(`${baseUrl}/make-public`, { method: 'DELETE' });
      }
      await this.loadPermissions();
    } catch (error) {
      console.error('Failed to update public access:', error);
    }

    this.emitChange('toggle_public', { is_public: checked, grantee_type: 'public', permission: 'read' });
  }

  private async handleAnonymousToggle(checked: boolean) {
    const h = this.getValueInput();
    const resourceId = h.resource_id;
    const resourceType = h.resource_type || 'page';

    if (!resourceId) return;

    const baseUrl = `/api/resources/${resourceType}/${resourceId}`;

    try {
      if (checked) {
        await fetch(`${baseUrl}/make-anonymous`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ permission: 'read' })
        });
      } else {
        await fetch(`${baseUrl}/make-anonymous`, { method: 'DELETE' });
      }
      await this.loadPermissions();
    } catch (error) {
      console.error('Failed to update anonymous access:', error);
    }

    this.emitChange('toggle_anonymous', { is_anonymous: checked, grantee_type: 'anonymous', permission: 'read' });
  }

  private async addRolePermission(role: any) {
    const config = this.getConfig();
    if (config.role_permissions.some((rp: any) => rp.role_name === role.name)) return;

    const h = this.getValueInput();
    const resourceId = h.resource_id;
    const resourceType = h.resource_type || 'page';

    if (!resourceId) return;

    try {
      await fetch(`/api/resources/${resourceType}/${resourceId}/role-permission`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleName: role.name, permission: this.selectedPermission })
      });
      await this.loadPermissions();
    } catch (error) {
      console.error('Failed to add role permission:', error);
    }

    this.emitChange('add_role_permission', {
      grantee_type: 'role',
      role_name: role.name,
      role_id: role.id,
      permission: this.selectedPermission,
      is_system: role.is_system
    });
  }

  private async addCustomRolePermission() {
    if (!this.customRoleName.trim()) return;
    const roleName = this.customRoleName.trim().toLowerCase();
    const config = this.getConfig();
    if (config.role_permissions.some((rp: any) => rp.role_name === roleName)) {
      this.customRoleName = '';
      return;
    }

    const h = this.getValueInput();
    const resourceId = h.resource_id;
    const resourceType = h.resource_type || 'page';

    if (!resourceId) return;

    try {
      await fetch(`/api/resources/${resourceType}/${resourceId}/role-permission`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleName, permission: this.selectedPermission })
      });
      await this.loadPermissions();
    } catch (error) {
      console.error('Failed to add custom role permission:', error);
    }

    this.emitChange('add_role_permission', {
      grantee_type: 'role',
      role_name: roleName,
      permission: this.selectedPermission,
      is_system: false
    });
    this.customRoleName = '';
  }

  private async updateRolePermission(roleName: string, permission: string) {
    const h = this.getValueInput();
    const resourceId = h.resource_id;
    const resourceType = h.resource_type || 'page';

    if (!resourceId) return;

    try {
      // Delete existing then add new
      await fetch(`/api/resources/${resourceType}/${resourceId}/role-permission/${encodeURIComponent(roleName)}`, {
        method: 'DELETE'
      });
      await fetch(`/api/resources/${resourceType}/${resourceId}/role-permission`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleName, permission })
      });
      await this.loadPermissions();
    } catch (error) {
      console.error('Failed to update role permission:', error);
    }

    this.emitChange('update_role_permission', { role_name: roleName, permission });
  }

  private async removeRolePermission(roleName: string) {
    const h = this.getValueInput();
    const resourceId = h.resource_id;
    const resourceType = h.resource_type || 'page';

    if (!resourceId) return;

    try {
      await fetch(`/api/resources/${resourceType}/${resourceId}/role-permission/${encodeURIComponent(roleName)}`, {
        method: 'DELETE'
      });
      await this.loadPermissions();
    } catch (error) {
      console.error('Failed to remove role permission:', error);
    }

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
