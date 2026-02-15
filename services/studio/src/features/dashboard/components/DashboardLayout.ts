/**
 * Dashboard Layout Component
 * Simple router that renders views based on URL
 */

import { html, LitElement, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { parseRoute, type ParsedRoute, type OverviewView } from '../utils/route-sync';
import type { AppSubTab } from '../stores/dashboard-tabs.store';
import { getCurrentUser, type CurrentUserInfo } from '../../runtime/handlers/runtime-api/user';

// Import view components
import './DashboardOverview';
import './DashboardAppView';
import './DashboardWorkflowView';
import './DashboardExecutionPreview';
import './DashboardWhiteboardView';
import './DashboardDatabaseView';
import './DashboardKVView';
import './DashboardProfileView';
import './DashboardAdminView';
import '../../standalone/StandaloneWhiteboardPage';

// Import NuralyUI components
import '../../runtime/components/ui/nuraly-ui/src/components/button';
import '../../runtime/components/ui/nuraly-ui/src/components/dropdown';

@customElement('dashboard-layout')
export class DashboardLayout extends LitElement {
  static readonly styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
      background: var(--nuraly-color-background, #f8fafc);
    }

    .dashboard-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 49px;
      padding: 0px 24px;
      background: var(--nuraly-color-surface, #ffffff);
      border-bottom: 1px solid var(--nuraly-color-border, #e8e8f0);
      flex-shrink: 0;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .hamburger-btn {
      display: none;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: none;
      background: transparent;
      border-radius: 6px;
      cursor: pointer;
      color: var(--nuraly-color-text, #0f0f3c);
      transition: background 150ms ease;
      padding: 0;
      flex-shrink: 0;
    }

    .hamburger-btn:hover {
      background: var(--nuraly-color-background-hover, #f1f5f9);
    }

    .hamburger-btn svg {
      width: 20px;
      height: 20px;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: var(--nuraly-color-text, #0f0f3c);
    }

    .logo-icon {
      width: 24px;
      height: 24px;
      border-radius: 4px;
    }

    .logo-text {
      font-size: 18px;
      font-weight: 600;
      letter-spacing: -0.02em;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    /* User profile styles */
    .user-profile {
      position: relative;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      background: var(--nuraly-color-background, #f8fafc);
      border-radius: 6px;
      cursor: pointer;
      transition: all 150ms ease;
    }

    .user-profile:hover {
      background: var(--nuraly-color-background-hover, #f1f5f9);
      border-color: var(--nuraly-color-primary, #14144b);
    }

    .user-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--nuraly-color-primary, #14144b);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .user-name {
      font-size: 13px;
      font-weight: 500;
      color: var(--nuraly-color-text, #0f0f3c);
      line-height: 1.2;
    }

    .user-email {
      font-size: 11px;
      color: var(--nuraly-color-text-secondary, #5c5c7a);
      line-height: 1.2;
    }

    .dropdown-chevron {
      width: 14px;
      height: 14px;
      color: var(--nuraly-color-text-secondary, #5c5c7a);
      margin-left: 4px;
    }

    /* Dropdown menu styles */
    .user-dropdown-menu {
      min-width: 180px;
      padding: 4px 0;
    }

    .dropdown-header {
      padding: 8px 12px;
      border-bottom: 1px solid var(--nuraly-color-border, #e8e8f0);
      margin-bottom: 4px;
    }

    .dropdown-header-name {
      font-size: 14px;
      font-weight: 600;
      color: var(--nuraly-color-text, #0f0f3c);
    }

    .dropdown-header-email {
      font-size: 12px;
      color: var(--nuraly-color-text-secondary, #5c5c7a);
      margin-top: 2px;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      font-size: 13px;
      color: var(--nuraly-color-text, #0f0f3c);
      cursor: pointer;
      transition: background 150ms ease;
    }

    .dropdown-item:hover {
      background: var(--nuraly-color-background, #f8fafc);
    }

    .dropdown-item svg {
      width: 16px;
      height: 16px;
      color: var(--nuraly-color-text-secondary, #5c5c7a);
    }

    .dropdown-divider {
      height: 1px;
      background: var(--nuraly-color-border, #e8e8f0);
      margin: 4px 0;
    }

    .dropdown-item.danger {
      color: var(--nuraly-color-danger, #dc2626);
    }

    .dropdown-item.danger svg {
      color: var(--nuraly-color-danger, #dc2626);
    }

    .dashboard-content {
      flex: 1;
      min-height: 0;
      overflow: hidden;
      display: flex;
    }

    .dashboard-content > * {
      flex: 1;
      min-height: 0;
    }

    /* Responsive: show hamburger on tablet and below */
    @media (max-width: 1024px) {
      .hamburger-btn {
        display: flex;
      }
    }

    /* Responsive: mobile adjustments */
    @media (max-width: 768px) {
      .dashboard-header {
        padding: 0 16px;
      }

      .user-info {
        display: none;
      }

      .dropdown-chevron {
        display: none;
      }

      .user-profile {
        padding: 6px;
      }

      .logo-text {
        font-size: 16px;
      }

      .header-left {
        gap: 10px;
      }
    }
  `;

  @property({ type: String, attribute: 'data-initial-route' })
  initialRouteJson: string = '';

  @state() private currentRoute: ParsedRoute = { type: 'overview', overviewView: 'applications' };
  @state() private currentUser: CurrentUserInfo | null = null;
  @state() private sidebarOpen = false;

  private readonly tabletQuery = globalThis.matchMedia('(max-width: 1024px)');

  connectedCallback() {
    super.connectedCallback();
    this.initializeFromRoute();
    this.currentUser = getCurrentUser();

    globalThis.addEventListener('popstate', this.handlePopState);
    this.tabletQuery.addEventListener('change', this.handleMediaChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    globalThis.removeEventListener('popstate', this.handlePopState);
    this.tabletQuery.removeEventListener('change', this.handleMediaChange);
  }

  private readonly handleMediaChange = (e: MediaQueryListEvent) => {
    if (!e.matches) this.sidebarOpen = false;
  };

  private readonly handlePopState = () => {
    this.currentRoute = parseRoute(globalThis.location.pathname, globalThis.location.search);
  };

  private initializeFromRoute() {
    if (this.initialRouteJson) {
      try {
        const initial = JSON.parse(this.initialRouteJson);
        this.currentRoute = {
          type: initial.type,
          resourceId: initial.resourceId,
          subTab: initial.subTab as AppSubTab,
          filters: initial.filters,
          overviewView: initial.overviewView as OverviewView
        };
      } catch (e) {
        console.error('[DashboardLayout] Failed to parse initial route:', e);
        this.currentRoute = { type: 'overview', overviewView: 'applications' };
      }
    } else {
      this.currentRoute = parseRoute(globalThis.location.pathname, globalThis.location.search);
    }
  }

  private navigate(path: string) {
    globalThis.history.pushState({}, '', path);
    this.currentRoute = parseRoute(path, '');
    this.sidebarOpen = false;
  }

  private handleNavigate(e: CustomEvent) {
    const { path } = e.detail;
    this.navigate(path);
  }

  private handleSubTabChange(e: CustomEvent) {
    const { subTab } = e.detail;
    const newPath = `/dashboard/app/${this.currentRoute.resourceId}/${subTab}`;
    globalThis.history.pushState({}, '', newPath);
    this.currentRoute = { ...this.currentRoute, subTab };
  }

  private toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  private handleCloseSidebar() {
    this.sidebarOpen = false;
  }

  private renderContent() {
    switch (this.currentRoute.type) {
      case 'overview':
        return html`
          <dashboard-overview
            .activeView=${this.currentRoute.overviewView || 'applications'}
            ?sidebarOpen=${this.sidebarOpen}
            @navigate=${this.handleNavigate}
            @close-sidebar=${this.handleCloseSidebar}
          ></dashboard-overview>
        `;

      case 'app':
        return html`
          <dashboard-app-view
            .appId=${this.currentRoute.resourceId || ''}
            .subTab=${this.currentRoute.subTab || 'pages'}
            @navigate=${this.handleNavigate}
            @subtab-change=${this.handleSubTabChange}
          ></dashboard-app-view>
        `;

      case 'workflow':
        return html`
          <dashboard-workflow-view
            .workflowId=${this.currentRoute.resourceId || ''}
            @navigate=${this.handleNavigate}
          ></dashboard-workflow-view>
        `;

      case 'workflow-execution':
        return html`
          <dashboard-execution-preview
            .workflowId=${this.currentRoute.resourceId || ''}
            .executionId=${this.currentRoute.executionId || ''}
            @navigate=${this.handleNavigate}
          ></dashboard-execution-preview>
        `;

      case 'whiteboard':
        return html`
          <dashboard-whiteboard-view
            .whiteboardId=${this.currentRoute.resourceId || ''}
            @navigate=${this.handleNavigate}
          ></dashboard-whiteboard-view>
        `;

      case 'whiteboard-edit':
        return html`
          <standalone-whiteboard-page
            .whiteboardId=${this.currentRoute.resourceId || ''}
            @navigate=${this.handleNavigate}
          ></standalone-whiteboard-page>
        `;

      case 'database':
        return html`
          <dashboard-database-view
            .databaseId=${this.currentRoute.resourceId || ''}
            @navigate=${this.handleNavigate}
          ></dashboard-database-view>
        `;

      case 'kv':
        return html`
          <dashboard-kv-view
            .filters=${this.currentRoute.filters || {}}
            @navigate=${this.handleNavigate}
          ></dashboard-kv-view>
        `;

      case 'profile':
        return html`
          <dashboard-profile-view
            @navigate=${this.handleNavigate}
          ></dashboard-profile-view>
        `;

      case 'admin':
        return html`
          <dashboard-admin-view
            @navigate=${this.handleNavigate}
          ></dashboard-admin-view>
        `;

      default:
        return html`<p>Unknown route</p>`;
    }
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

  private handleLogout() {
    // Redirect to logout
    globalThis.location.href = '/logout';
  }

  private handleProfile() {
    // Navigate to profile page
    globalThis.location.href = '/dashboard/profile';
  }

  private renderUserProfile() {
    if (!this.currentUser || this.currentUser.anonymous) {
      return html`
        <nr-button type="primary" size="small" @click=${() => globalThis.location.href = '/auth/login'}>
          Sign In
        </nr-button>
      `;
    }

    return html`
      <nr-dropdown
        trigger="click"
        placement="bottom-end"
        close-on-outside-click
        close-on-escape
      >
        <div slot="trigger" class="user-profile">
          <div class="user-avatar">${this.getUserInitials()}</div>
          <div class="user-info">
            <span class="user-name">${this.getUserDisplayName()}</span>
            <span class="user-email">${this.currentUser.email || ''}</span>
          </div>
          <svg class="dropdown-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>
        <div slot="content" class="user-dropdown-menu">
          <div class="dropdown-header">
            <div class="dropdown-header-name">${this.getUserDisplayName()}</div>
            <div class="dropdown-header-email">${this.currentUser.email || ''}</div>
          </div>
          <div class="dropdown-item" @click=${this.handleProfile}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Profile
          </div>
          <div class="dropdown-divider"></div>
          <div class="dropdown-item danger" @click=${this.handleLogout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign Out
          </div>
        </div>
      </nr-dropdown>
    `;
  }

  render() {
    return html`
      <header class="dashboard-header">
        <div class="header-left">
          <button class="hamburger-btn" @click=${this.toggleSidebar} aria-label="Toggle sidebar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <a href="/dashboard" class="logo">
            <img class="logo-icon" src="/favicon-32x32.png" alt="Nuraly" />
            <span class="logo-text">Nuraly</span>
          </a>
        </div>
        <div class="header-right">
          ${this.renderUserProfile()}
        </div>
      </header>

      <div class="dashboard-content">
        ${this.renderContent()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dashboard-layout': DashboardLayout;
  }
}
