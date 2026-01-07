import { LitElement, html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { shareModalStyles } from './ShareModal.style';
import { getVarValue } from '../../../../../redux/store/context';

// Types
interface Role {
  id: number;
  name: string;
  displayName: string;
  description: string | null;
  permissions: string[];
  hierarchy: number;
  isSystem: boolean;
}

interface Member {
  id: number;
  userId: string;
  applicationId: string;
  role: {
    id: number;
    name: string;
    displayName: string;
    hierarchy: number;
  };
  createdAt: string;
}

interface PendingInvite {
  id: number;
  email: string;
  applicationId: string;
  role: {
    id: number;
    name: string;
    displayName: string;
    hierarchy: number;
  };
  expiresAt: string;
  createdAt: string;
}

/**
 * ShareModal Component
 *
 * A modal for managing application sharing:
 * - Members tab: View/edit/remove current members
 * - Invite tab: Invite new users with role selection
 * - Roles tab: Manage custom roles
 */
@customElement('share-modal')
export class ShareModal extends LitElement {
  static override styles = [shareModalStyles];

  @state() private activeTab: 'members' | 'invite' | 'roles' = 'members';
  @state() private loading = false;
  @state() private members: Member[] = [];
  @state() private pendingInvites: PendingInvite[] = [];
  @state() private roles: Role[] = [];

  // Invite form state
  @state() private inviteEmail = '';
  @state() private selectedRoleId: number | null = null;
  @state() private inviteLoading = false;
  @state() private inviteMessage: { type: 'success' | 'error'; text: string } | null = null;

  // Create role form state
  @state() private showCreateRoleForm = false;
  @state() private newRoleName = '';
  @state() private newRoleDisplayName = '';
  @state() private newRoleHierarchy = 50;
  @state() private newRolePermissions: string[] = [];

  private hasLoaded = false;

  override connectedCallback(): void {
    super.connectedCallback();
    // Load data when component is connected (modal is opened)
    if (!this.hasLoaded) {
      this.loadData();
      this.hasLoaded = true;
    }
  }

  private getAppId(): string | null {
    const app = getVarValue('global', 'currentEditingApplication') as any;
    return app?.uuid || null;
  }

  private async loadData(): Promise<void> {
    const appId = this.getAppId();
    if (!appId) {
      return;
    }

    this.loading = true;
    try {
      // Fetch members, pending invites, and roles in parallel
      const [membersRes, pendingRes, rolesRes] = await Promise.all([
        fetch(`/api/applications/${appId}/members`, { credentials: 'include' }),
        fetch(`/api/applications/${appId}/pending-invites`, { credentials: 'include' }),
        fetch(`/api/applications/${appId}/roles`, { credentials: 'include' }),
      ]);

      if (membersRes.ok) {
        this.members = await membersRes.json();
      }
      if (pendingRes.ok) {
        this.pendingInvites = await pendingRes.json();
      }
      if (rolesRes.ok) {
        this.roles = await rolesRes.json();
        // Set default role for invite (first non-owner role)
        const defaultRole = this.roles.find(r => r.name !== 'owner');
        if (defaultRole && !this.selectedRoleId) {
          this.selectedRoleId = defaultRole.id;
        }
      }
    } catch (error) {
      console.error('Failed to load share data:', error);
    } finally {
      this.loading = false;
    }
  }

  private resetForm(): void {
    this.inviteMessage = null;
    this.inviteEmail = '';
  }

  private async handleInvite(): Promise<void> {
    const appId = this.getAppId();
    if (!appId || !this.inviteEmail || !this.selectedRoleId) return;

    this.inviteLoading = true;
    this.inviteMessage = null;

    try {
      const response = await fetch(`/api/applications/${appId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: this.inviteEmail,
          roleId: this.selectedRoleId,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to invite member');
      }

      const result = await response.json();

      if (result.status === 'pending') {
        this.inviteMessage = {
          type: 'success',
          text: `Invite sent to ${this.inviteEmail}. They will be added when they sign up.`,
        };
        this.pendingInvites = [...this.pendingInvites, result.invite];
      } else {
        this.inviteMessage = {
          type: 'success',
          text: `${this.inviteEmail} has been added to the application.`,
        };
        this.members = [...this.members, result.member];
      }

      this.inviteEmail = '';
    } catch (error: any) {
      this.inviteMessage = {
        type: 'error',
        text: error.message || 'Failed to send invite',
      };
    } finally {
      this.inviteLoading = false;
    }
  }

  private async handleUpdateMemberRole(userId: string, roleId: number): Promise<void> {
    const appId = this.getAppId();
    if (!appId) return;

    try {
      const response = await fetch(`/api/applications/${appId}/members/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ roleId }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to update member');
      }

      const updatedMember = await response.json();
      this.members = this.members.map(m =>
        m.userId === userId ? updatedMember : m
      );
    } catch (error: any) {
      console.error('Failed to update member:', error);
      alert(error.message || 'Failed to update member role');
    }
  }

  private async handleRemoveMember(userId: string): Promise<void> {
    const appId = this.getAppId();
    if (!appId) return;

    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      const response = await fetch(`/api/applications/${appId}/members/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to remove member');
      }

      this.members = this.members.filter(m => m.userId !== userId);
    } catch (error: any) {
      console.error('Failed to remove member:', error);
      alert(error.message || 'Failed to remove member');
    }
  }

  private async handleCancelInvite(inviteId: number): Promise<void> {
    const appId = this.getAppId();
    if (!appId) return;

    try {
      const response = await fetch(`/api/applications/${appId}/pending-invites/${inviteId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel invite');
      }

      this.pendingInvites = this.pendingInvites.filter(i => i.id !== inviteId);
    } catch (error) {
      console.error('Failed to cancel invite:', error);
    }
  }

  private async handleCreateRole(): Promise<void> {
    const appId = this.getAppId();
    if (!appId || !this.newRoleName || !this.newRoleDisplayName) return;

    try {
      const response = await fetch(`/api/applications/${appId}/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: this.newRoleName.toLowerCase().replace(/\s+/g, '_'),
          displayName: this.newRoleDisplayName,
          permissions: this.newRolePermissions,
          hierarchy: this.newRoleHierarchy,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to create role');
      }

      const newRole = await response.json();
      this.roles = [...this.roles, newRole];
      this.showCreateRoleForm = false;
      this.newRoleName = '';
      this.newRoleDisplayName = '';
      this.newRoleHierarchy = 50;
      this.newRolePermissions = [];
    } catch (error: any) {
      alert(error.message || 'Failed to create role');
    }
  }

  private async handleDeleteRole(roleId: number): Promise<void> {
    const appId = this.getAppId();
    if (!appId) return;

    if (!confirm('Are you sure you want to delete this role?')) return;

    try {
      const response = await fetch(`/api/applications/${appId}/roles/${roleId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to delete role');
      }

      this.roles = this.roles.filter(r => r.id !== roleId);
    } catch (error: any) {
      alert(error.message || 'Failed to delete role');
    }
  }

  private getRoleBadgeClass(roleName: string): string {
    const systemRoles = ['owner', 'admin', 'editor', 'viewer'];
    return systemRoles.includes(roleName) ? roleName : 'custom';
  }

  private getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  private formatExpiresAt(dateStr: string): string {
    const expires = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `Expires in ${diffDays} day${diffDays > 1 ? 's' : ''}` : 'Expired';
  }

  private renderMembersTab() {
    return html`
      <div class="tab-content">
        ${this.loading
          ? html`<div class="loading">Loading members...</div>`
          : html`
              <div class="members-section">
                <div class="section-title">
                  Members <span class="count">${this.members.length}</span>
                </div>
                <div class="member-list">
                  ${this.members.length === 0
                    ? html`<div class="empty-state">No members yet</div>`
                    : this.members.map(member => this.renderMemberItem(member))}
                </div>
              </div>

              ${this.pendingInvites.length > 0
                ? html`
                    <div class="members-section">
                      <div class="section-title">
                        Pending Invites <span class="count">${this.pendingInvites.length}</span>
                      </div>
                      <div class="member-list">
                        ${this.pendingInvites.map(invite => this.renderPendingItem(invite))}
                      </div>
                    </div>
                  `
                : nothing}
            `}
      </div>
    `;
  }

  private renderMemberItem(member: Member) {
    const isOwner = member.role.name === 'owner';
    const assignableRoles = this.roles.filter(r => r.name !== 'owner');

    return html`
      <div class="member-item">
        <div class="member-info">
          <div class="member-avatar">${this.getInitials(member.userId.slice(0, 8))}</div>
          <div class="member-details">
            <div class="member-name">${member.userId}</div>
            <div class="member-email">Added ${new Date(member.createdAt).toLocaleDateString()}</div>
          </div>
        </div>
        <div class="member-actions">
          ${isOwner
            ? html`<span class="role-badge owner">${member.role.displayName}</span>`
            : html`
                <nr-select
                  size="small"
                  .value=${String(member.role.id)}
                  .options=${assignableRoles.map(role => ({
                    label: role.displayName,
                    value: String(role.id)
                  }))}
                  @nr-change=${(e: CustomEvent) =>
                    this.handleUpdateMemberRole(member.userId, Number(e.detail?.value))}
                ></nr-select>
                <nr-button
                  type="text"
                  size="small"
                  danger
                  @click=${() => this.handleRemoveMember(member.userId)}
                >
                  Remove
                </nr-button>
              `}
        </div>
      </div>
    `;
  }

  private renderPendingItem(invite: PendingInvite) {
    return html`
      <div class="pending-item">
        <div class="member-info">
          <div class="pending-avatar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
          </div>
          <div class="member-details">
            <div class="member-name">${invite.email}</div>
            <div class="pending-expires">${this.formatExpiresAt(invite.expiresAt)}</div>
          </div>
        </div>
        <div class="member-actions">
          <span class="role-badge ${this.getRoleBadgeClass(invite.role.name)}">${invite.role.displayName}</span>
          <nr-button type="text" size="small" @click=${() => this.handleCancelInvite(invite.id)}>Cancel</nr-button>
        </div>
      </div>
    `;
  }

  private renderInviteTab() {
    const assignableRoles = this.roles.filter(r => r.name !== 'owner');

    return html`
      <div class="tab-content">
        <div class="invite-form">
          ${this.inviteMessage
            ? html`
                <div class="${this.inviteMessage.type}-message">${this.inviteMessage.text}</div>
              `
            : nothing}

          <div class="form-group">
            <label class="form-label">Email address</label>
            <nr-input
              .value=${this.inviteEmail}
              placeholder="user@example.com"
              type="email"
              @nr-input=${(e: CustomEvent) => (this.inviteEmail = e.detail?.value || '')}
            ></nr-input>
            <div class="form-description">
              Enter the email of the person you want to invite. They will receive access
              immediately if they have an account, or when they sign up.
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Role</label>
            <nr-select
              .value=${String(this.selectedRoleId || '')}
              .options=${assignableRoles.map(role => ({
                label: role.displayName + (role.description ? ` - ${role.description}` : ''),
                value: String(role.id)
              }))}
              placeholder="Select a role..."
              @nr-change=${(e: CustomEvent) => (this.selectedRoleId = Number(e.detail?.value))}
            ></nr-select>
          </div>

          <nr-button
            type="primary"
            ?loading=${this.inviteLoading}
            ?disabled=${!this.inviteEmail || !this.selectedRoleId}
            @click=${this.handleInvite}
          >
            Send Invitation
          </nr-button>
        </div>
      </div>
    `;
  }

  private renderRolesTab() {
    const systemRoles = this.roles.filter(r => r.isSystem);
    const customRoles = this.roles.filter(r => !r.isSystem);

    return html`
      <div class="tab-content">
        <div class="roles-section">
          <div class="section-title">System Roles</div>
          <div class="role-list">
            ${systemRoles.map(role => this.renderRoleItem(role, true))}
          </div>
        </div>

        <div class="roles-section">
          <div class="section-title">Custom Roles</div>
          <div class="role-list">
            ${customRoles.length === 0
              ? html`<div class="empty-state">No custom roles created yet</div>`
              : customRoles.map(role => this.renderRoleItem(role, false))}
          </div>

          ${this.showCreateRoleForm
            ? this.renderCreateRoleForm()
            : html`
                <nr-button
                  type="dashed"
                  style="margin-top: 12px; width: 100%;"
                  @click=${() => (this.showCreateRoleForm = true)}
                >
                  + Create Custom Role
                </nr-button>
              `}
        </div>
      </div>
    `;
  }

  private renderRoleItem(role: Role, isSystem: boolean) {
    return html`
      <div class="role-item ${isSystem ? 'system' : ''}">
        <div class="role-info">
          <div class="role-header">
            <span class="role-name">${role.displayName}</span>
            <span class="role-hierarchy">${role.hierarchy}</span>
            ${isSystem ? html`<span class="system-tag">System</span>` : nothing}
          </div>
          ${role.description ? html`<div class="role-description">${role.description}</div>` : nothing}
          <div class="role-permissions">${role.permissions.join(', ')}</div>
        </div>
        ${!isSystem
          ? html`
              <div class="role-actions">
                <nr-button type="text" size="small" danger @click=${() => this.handleDeleteRole(role.id)}>
                  Delete
                </nr-button>
              </div>
            `
          : nothing}
      </div>
    `;
  }

  private renderCreateRoleForm() {
    const permissionOptions = [
      'application:read',
      'application:write',
      'page:read',
      'page:write',
      'page:delete',
      'component:read',
      'component:write',
      'member:read',
    ];

    return html`
      <div class="create-role-form">
        <div class="form-group">
          <label class="form-label">Role Name</label>
          <nr-input
            .value=${this.newRoleDisplayName}
            placeholder="e.g., Moderator"
            @nr-input=${(e: CustomEvent) => {
              this.newRoleDisplayName = e.detail?.value || '';
              this.newRoleName = (e.detail?.value || '').toLowerCase().replace(/\s+/g, '_');
            }}
          ></nr-input>
        </div>

        <div class="form-group">
          <label class="form-label">Hierarchy (1-99)</label>
          <nr-input
            type="number"
            .value=${String(this.newRoleHierarchy)}
            min="1"
            max="99"
            @nr-input=${(e: CustomEvent) => (this.newRoleHierarchy = Number(e.detail?.value) || 50)}
          ></nr-input>
          <div class="form-description">
            Higher numbers = more privileges. Must be less than your own hierarchy.
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Permissions</label>
          <div class="permissions-grid">
            ${permissionOptions.map(
              perm => html`
                <label class="permission-item">
                  <input
                    type="checkbox"
                    .checked=${this.newRolePermissions.includes(perm)}
                    @change=${(e: Event) => {
                      const checked = (e.target as HTMLInputElement).checked;
                      if (checked) {
                        this.newRolePermissions = [...this.newRolePermissions, perm];
                      } else {
                        this.newRolePermissions = this.newRolePermissions.filter(p => p !== perm);
                      }
                    }}
                  />
                  ${perm}
                </label>
              `
            )}
          </div>
        </div>

        <div style="display: flex; gap: 8px; margin-top: 16px;">
          <nr-button type="primary" @click=${this.handleCreateRole}>Create Role</nr-button>
          <nr-button @click=${() => (this.showCreateRoleForm = false)}>Cancel</nr-button>
        </div>
      </div>
    `;
  }

  override render() {
    return html`
      <div class="share-container">
        <div class="tabs-header">
          <button
            class="tab-btn ${this.activeTab === 'members' ? 'active' : ''}"
            @click=${() => this.activeTab = 'members'}
          >Members</button>
          <button
            class="tab-btn ${this.activeTab === 'invite' ? 'active' : ''}"
            @click=${() => this.activeTab = 'invite'}
          >Invite</button>
          <button
            class="tab-btn ${this.activeTab === 'roles' ? 'active' : ''}"
            @click=${() => this.activeTab = 'roles'}
          >Roles</button>
        </div>
        <div class="tab-content">
          ${this.activeTab === 'members' ? this.renderMembersTab() : nothing}
          ${this.activeTab === 'invite' ? this.renderInviteTab() : nothing}
          ${this.activeTab === 'roles' ? this.renderRolesTab() : nothing}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'share-modal': ShareModal;
  }
}
