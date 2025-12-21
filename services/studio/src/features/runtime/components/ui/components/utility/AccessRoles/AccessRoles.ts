import type { ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { BaseElementBlock } from '../../base/BaseElement';
import { css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

// Role interface for access control
interface AccessRole {
  name: string;
  description?: string;
}

// Preset roles commonly used in applications
const ROLE_PRESETS: Record<string, () => AccessRole> = {
  admin: () => ({
    name: 'admin',
    description: 'Full administrative access'
  }),
  editor: () => ({
    name: 'editor',
    description: 'Can edit content'
  }),
  viewer: () => ({
    name: 'viewer',
    description: 'Read-only access'
  }),
  moderator: () => ({
    name: 'moderator',
    description: 'Can moderate content'
  }),
  member: () => ({
    name: 'member',
    description: 'Standard member access'
  }),
  guest: () => ({
    name: 'guest',
    description: 'Limited guest access'
  }),
};

type RolePresetKey = keyof typeof ROLE_PRESETS;

@customElement("access-roles-display")
export class AccessRolesDisplay extends BaseElementBlock {
  static override styles = [
    css`
      :host {
        display: block;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 12px;
        min-height: 0;
        flex-shrink: 0;
      }

      .access-container {
        padding: 8px;
        width: 100%;
        box-sizing: border-box;
      }

      .section {
        margin-bottom: 12px;
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
        padding: 8px 10px;
        background: var(--nuraly-bg-secondary, #f5f5f5);
        border-radius: 6px;
        margin-bottom: 8px;
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

      .access-level-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
      }

      .access-level-label {
        font-size: 11px;
        color: var(--nuraly-text-secondary, #666);
        min-width: 80px;
      }

      nr-select {
        flex: 1;
        --nuraly-select-height: 28px;
        --nuraly-font-size-select: 11px;
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
        --nuraly-button-padding-small: 5px;
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

      .role-name-badge {
        font-size: 11px;
        font-weight: 600;
        color: var(--nuraly-primary, #4a9eff);
        background: var(--nuraly-primary-light, #e6f0ff);
        padding: 2px 8px;
        border-radius: 4px;
        display: inline-block;
        width: fit-content;
      }

      .role-description {
        font-size: 10px;
        color: var(--nuraly-text-tertiary, #888);
        margin-top: 4px;
      }

      .role-actions {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .delete-btn {
        font-size: 14px;
      }

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
        margin: 12px 0;
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

      nr-checkbox {
        --nuraly-checkbox-size: 16px;
      }

      .info-text {
        font-size: 10px;
        color: var(--nuraly-text-tertiary, #888);
        margin-top: 4px;
        line-height: 1.4;
      }
    `,
  ];

  @property({ type: Object })
  component: ComponentElement;

  @state()
  private customRoleName: string = '';

  private emitChange(property: string, type: string, value: any) {
    this.executeEvent("onChange", new CustomEvent('change'), {
      property,
      type,
      value,
    });

    // Optimistically update local state for immediate UI feedback
    if (this.inputHandlersValue) {
      this.inputHandlersValue = {
        ...this.inputHandlersValue,
        [property]: value
      };
    }
    this.requestUpdate();
  }

  private getIsPublic(): boolean {
    return this.inputHandlersValue?.is_public || false;
  }

  private getAccessLevel(): string {
    return this.inputHandlersValue?.access_level || 'public';
  }

  private getRoles(): AccessRole[] {
    const roles = this.inputHandlersValue?.allowed_roles;
    if (Array.isArray(roles)) {
      return roles;
    }
    return [];
  }

  private handlePublicToggle(checked: boolean) {
    this.emitChange('is_public', 'boolean', checked);
  }

  private handleAccessLevelChange(value: string) {
    this.emitChange('access_level', 'string', value);
  }

  private addRole(presetKey: RolePresetKey) {
    const currentRoles = this.getRoles();
    const presetFn = ROLE_PRESETS[presetKey];
    const newRole = presetFn();

    // Prevent duplicates
    if (currentRoles.some(r => r.name === newRole.name)) {
      return;
    }

    this.emitChange('allowed_roles', 'array', [...currentRoles, newRole]);
  }

  private addCustomRole() {
    if (!this.customRoleName.trim()) return;

    const currentRoles = this.getRoles();
    const newRole: AccessRole = {
      name: this.customRoleName.trim().toLowerCase(),
      description: ''
    };

    // Prevent duplicates
    if (currentRoles.some(r => r.name === newRole.name)) {
      this.customRoleName = '';
      return;
    }

    this.emitChange('allowed_roles', 'array', [...currentRoles, newRole]);
    this.customRoleName = '';
  }

  private removeRole(index: number) {
    const currentRoles = [...this.getRoles()];
    currentRoles.splice(index, 1);
    this.emitChange('allowed_roles', 'array', currentRoles);
  }

  private updateRoleDescription(index: number, description: string) {
    const currentRoles = [...this.getRoles()];
    currentRoles[index] = { ...currentRoles[index], description };
    this.emitChange('allowed_roles', 'array', currentRoles);
  }

  private renderRoleItem(role: AccessRole, index: number) {
    return html`
      <div class="role-item">
        <div class="role-info">
          <span class="role-name-badge">${role.name}</span>
          <nr-input
            size="small"
            .value=${role.description || ''}
            placeholder="Add description..."
            @nr-input=${(e: CustomEvent) => this.updateRoleDescription(index, e.detail?.value || '')}
            style="margin-top: 6px; --nuraly-spacing-input-height: 24px; --nuraly-font-size-input: 10px;"
          ></nr-input>
        </div>
        <div class="role-actions">
          <nr-button class="delete-btn" type="text" size="small" @click=${() => this.removeRole(index)}>×</nr-button>
        </div>
      </div>
    `;
  }

  override renderComponent() {
    const isPublic = this.getIsPublic();
    const accessLevel = this.getAccessLevel();
    const roles = this.getRoles();
    const showRolesSection = accessLevel === 'role-based';

    return html`
      <div class="access-container">
        <!-- Public Access Toggle -->
        <div class="section">
          <div class="section-title">Public Access</div>
          <div class="access-toggle-row">
            <div>
              <div class="toggle-label">Allow public access</div>
              <div class="toggle-description">Anyone can view this page without authentication</div>
            </div>
            <nr-checkbox
              size="small"
              .checked=${isPublic}
              @nr-change=${(e: CustomEvent) => this.handlePublicToggle(e.detail?.checked || false)}
            ></nr-checkbox>
          </div>
        </div>

        ${!isPublic ? html`
          <div class="divider"></div>

          <!-- Access Level Selection -->
          <div class="section">
            <div class="section-title">Access Level</div>
            <div class="access-level-row">
              <span class="access-level-label">Require:</span>
              <nr-select
                size="small"
                .value=${accessLevel}
                @nr-change=${(e: CustomEvent) => this.handleAccessLevelChange(e.detail?.value || 'authenticated')}
              >
                <nr-option value="authenticated">Authentication</nr-option>
                <nr-option value="role-based">Specific Roles</nr-option>
              </nr-select>
            </div>
            <p class="info-text">
              ${accessLevel === 'authenticated'
                ? 'Any authenticated user can access this page.'
                : 'Only users with the specified roles can access this page.'}
            </p>
          </div>

          ${showRolesSection ? html`
            <div class="divider"></div>

            <!-- Allowed Roles -->
            <div class="section">
              <div class="section-title">Allowed Roles</div>
              ${roles.length > 0 ? html`
                <div class="roles-list">
                  ${roles.map((role, index) => this.renderRoleItem(role, index))}
                </div>
              ` : html`
                <div class="empty-state">No roles configured. Add roles to restrict access.</div>
              `}
            </div>

            <div class="divider"></div>

            <!-- Add Roles -->
            <div class="section">
              <div class="section-title">Add Role</div>
              <div class="preset-buttons">
                <nr-button dashed size="small" @click=${() => this.addRole('admin')}>+ admin</nr-button>
                <nr-button dashed size="small" @click=${() => this.addRole('editor')}>+ editor</nr-button>
                <nr-button dashed size="small" @click=${() => this.addRole('viewer')}>+ viewer</nr-button>
                <nr-button dashed size="small" @click=${() => this.addRole('moderator')}>+ moderator</nr-button>
                <nr-button dashed size="small" @click=${() => this.addRole('member')}>+ member</nr-button>
                <nr-button dashed size="small" @click=${() => this.addRole('guest')}>+ guest</nr-button>
              </div>
              <div class="custom-role-input">
                <nr-input
                  size="small"
                  .value=${this.customRoleName}
                  placeholder="Custom role name..."
                  @nr-input=${(e: CustomEvent) => this.customRoleName = e.detail?.value || ''}
                  @keydown=${(e: KeyboardEvent) => e.key === 'Enter' && this.addCustomRole()}
                ></nr-input>
                <nr-button size="small" @click=${() => this.addCustomRole()}>Add</nr-button>
              </div>
            </div>
          ` : nothing}
        ` : nothing}
      </div>
    `;
  }
}
