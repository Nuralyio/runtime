/**
 * Dashboard Profile View Component
 * Displays user profile information and account details
 */

import { html, LitElement, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { getCurrentUser, type CurrentUserInfo } from '../../runtime/handlers/runtime-api/user';

// Import NuralyUI components
import '../../runtime/components/ui/nuraly-ui/src/components/button';
import '../../runtime/components/ui/nuraly-ui/src/components/badge';
import '../../runtime/components/ui/nuraly-ui/src/components/icon';

@customElement('dashboard-profile-view')
export class DashboardProfileView extends LitElement {
  static styles = css`
    :host {
      display: block;
      height: 100%;
      overflow: auto;
      background: var(--nuraly-color-background, #f8fafc);
    }

    .profile-view {
      max-width: 800px;
      margin: 0 auto;
      padding: 32px 24px;
    }

    .profile-header {
      margin-bottom: 32px;
    }

    .profile-header h1 {
      font-size: 24px;
      font-weight: 600;
      color: var(--nuraly-color-text, #0f0f3c);
      margin: 0 0 8px 0;
    }

    .profile-header p {
      font-size: 14px;
      color: var(--nuraly-color-text-secondary, #5c5c7a);
      margin: 0;
    }

    .profile-card {
      background: var(--nuraly-color-surface, #ffffff);
      border: 1px solid var(--nuraly-color-border, #e8e8f0);
      border-radius: 12px;
      margin-bottom: 24px;
      overflow: hidden;
    }

    .card-header {
      padding: 16px 20px;
      border-bottom: 1px solid var(--nuraly-color-border, #e8e8f0);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--nuraly-color-text, #0f0f3c);
      margin: 0;
    }

    .card-content {
      padding: 20px;
    }

    /* User avatar section */
    .user-avatar-section {
      display: flex;
      align-items: center;
      gap: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--nuraly-color-border-subtle, #f1f3f5);
      margin-bottom: 20px;
    }

    .avatar-large {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: var(--nuraly-color-primary, #14144b);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      font-weight: 600;
      flex-shrink: 0;
    }

    .avatar-info {
      flex: 1;
    }

    .avatar-info h2 {
      font-size: 20px;
      font-weight: 600;
      color: var(--nuraly-color-text, #0f0f3c);
      margin: 0 0 4px 0;
    }

    .avatar-info p {
      font-size: 14px;
      color: var(--nuraly-color-text-secondary, #5c5c7a);
      margin: 0;
    }

    /* Info rows */
    .info-row {
      display: flex;
      padding: 12px 0;
      border-bottom: 1px solid var(--nuraly-color-border-subtle, #f1f3f5);
    }

    .info-row:last-child {
      border-bottom: none;
    }

    .info-label {
      width: 140px;
      font-size: 13px;
      font-weight: 500;
      color: var(--nuraly-color-text-secondary, #5c5c7a);
      flex-shrink: 0;
    }

    .info-value {
      flex: 1;
      font-size: 14px;
      color: var(--nuraly-color-text, #0f0f3c);
    }

    .info-value.muted {
      color: var(--nuraly-color-text-tertiary, #8c8ca8);
      font-style: italic;
    }

    /* Plan section */
    .plan-section {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px;
      background: linear-gradient(135deg, var(--nuraly-color-primary-bg, #f0f0f8) 0%, #e8e8f8 100%);
      border-radius: 8px;
    }

    .plan-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .plan-name {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .plan-name h3 {
      font-size: 18px;
      font-weight: 600;
      color: var(--nuraly-color-primary, #14144b);
      margin: 0;
    }

    .plan-description {
      font-size: 13px;
      color: var(--nuraly-color-text-secondary, #5c5c7a);
    }

    /* Usage stats */
    .usage-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }

    .usage-item {
      text-align: center;
      padding: 16px;
      background: var(--nuraly-color-background, #f8fafc);
      border-radius: 8px;
    }

    .usage-value {
      font-size: 24px;
      font-weight: 600;
      color: var(--nuraly-color-text, #0f0f3c);
    }

    .usage-label {
      font-size: 12px;
      color: var(--nuraly-color-text-secondary, #5c5c7a);
      margin-top: 4px;
    }

    .usage-limit {
      font-size: 11px;
      color: var(--nuraly-color-text-tertiary, #8c8ca8);
      margin-top: 2px;
    }

    /* Danger zone */
    .danger-zone {
      border-color: var(--nuraly-color-danger, #dc2626);
    }

    .danger-zone .card-header {
      background: #fef2f2;
    }

    .danger-zone .card-title {
      color: var(--nuraly-color-danger, #dc2626);
    }

    .danger-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 0;
      border-bottom: 1px solid var(--nuraly-color-border-subtle, #f1f3f5);
    }

    .danger-item:last-child {
      border-bottom: none;
    }

    .danger-info h4 {
      font-size: 14px;
      font-weight: 500;
      color: var(--nuraly-color-text, #0f0f3c);
      margin: 0 0 4px 0;
    }

    .danger-info p {
      font-size: 13px;
      color: var(--nuraly-color-text-secondary, #5c5c7a);
      margin: 0;
    }

    /* Back button wrapper for margin */
    .profile-view > nr-button {
      margin-bottom: 24px;
    }
  `;

  @state() private currentUser: CurrentUserInfo | null = null;

  connectedCallback() {
    super.connectedCallback();
    this.currentUser = getCurrentUser();
  }

  private getUserInitials(): string {
    if (!this.currentUser) return '?';
    const firstName = this.currentUser.username?.split(' ')[0] || '';
    const lastName = this.currentUser.last_name || '';
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return (firstName[0] || this.currentUser.email?.[0] || '?').toUpperCase();
  }

  private getUserDisplayName(): string {
    if (!this.currentUser) return 'Guest';
    const firstName = this.currentUser.username?.split(' ')[0] || this.currentUser.username || '';
    const lastName = this.currentUser.last_name || '';
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    return firstName || this.currentUser.email || 'User';
  }

  private formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  }

  private goBack() {
    this.dispatchEvent(new CustomEvent('navigate', {
      detail: { path: '/dashboard' },
      bubbles: true,
      composed: true
    }));
  }

  private handleLogout() {
    window.location.href = '/logout';
  }

  render() {
    const user = this.currentUser;

    return html`
      <div class="profile-view">
        <nr-button size="small" variant="secondary" @click=${this.goBack}>
          <nr-icon slot="prefix" name="arrow-left" size="small"></nr-icon>
          Back to Dashboard
        </nr-button>

        <div class="profile-header">
          <h1>Profile</h1>
          <p>Manage your account settings and preferences</p>
        </div>

        <!-- User Info Card -->
        <div class="profile-card">
          <div class="card-header">
            <h3 class="card-title">Account Information</h3>
          </div>
          <div class="card-content">
            <div class="user-avatar-section">
              <div class="avatar-large">${this.getUserInitials()}</div>
              <div class="avatar-info">
                <h2>${this.getUserDisplayName()}</h2>
                <p>${user?.email || 'No email'}</p>
              </div>
            </div>

            <div class="info-row">
              <span class="info-label">Username</span>
              <span class="info-value">${user?.username || 'Not set'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email</span>
              <span class="info-value">${user?.email || 'Not set'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">First Name</span>
              <span class="info-value ${!user?.username ? 'muted' : ''}">${user?.username?.split(' ')[0] || 'Not set'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Last Name</span>
              <span class="info-value ${!user?.last_name ? 'muted' : ''}">${user?.last_name || 'Not set'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">User ID</span>
              <span class="info-value" style="font-family: var(--nuraly-font-mono); font-size: 12px;">${user?.id || 'N/A'}</span>
            </div>
          </div>
        </div>

        <!-- Plan Card -->
        <div class="profile-card">
          <div class="card-header">
            <h3 class="card-title">Current Plan</h3>
          </div>
          <div class="card-content">
            <div class="plan-section">
              <div class="plan-info">
                <div class="plan-name">
                  <h3>Free Plan</h3>
                  <nr-badge status="info" text="Demo"></nr-badge>
                </div>
                <span class="plan-description">Perfect for trying out Nuraly and small projects</span>
              </div>
              <nr-button type="primary" size="small" disabled>Upgrade</nr-button>
            </div>
          </div>
        </div>

        <!-- Usage Card -->
        <div class="profile-card">
          <div class="card-header">
            <h3 class="card-title">Usage</h3>
          </div>
          <div class="card-content">
            <div class="usage-grid">
              <div class="usage-item">
                <div class="usage-value">-</div>
                <div class="usage-label">Applications</div>
                <div class="usage-limit">Unlimited</div>
              </div>
              <div class="usage-item">
                <div class="usage-value">-</div>
                <div class="usage-label">Workflows</div>
                <div class="usage-limit">Unlimited</div>
              </div>
              <div class="usage-item">
                <div class="usage-value">-</div>
                <div class="usage-label">Executions</div>
                <div class="usage-limit">This month</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Danger Zone -->
        <div class="profile-card danger-zone">
          <div class="card-header">
            <h3 class="card-title">Danger Zone</h3>
          </div>
          <div class="card-content">
            <div class="danger-item">
              <div class="danger-info">
                <h4>Sign out of your account</h4>
                <p>You will be redirected to the login page</p>
              </div>
              <nr-button type="danger" size="small" @click=${this.handleLogout}>Sign Out</nr-button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dashboard-profile-view': DashboardProfileView;
  }
}
