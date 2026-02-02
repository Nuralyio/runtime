/**
 * Dashboard Layout Component
 * Simple router that renders views based on URL
 */

import { html, LitElement, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { parseRoute, type ParsedRoute } from '../utils/route-sync';
import type { AppSubTab } from '../stores/dashboard-tabs.store';

// Import view components
import './DashboardOverview';
import './DashboardAppView';
import './DashboardWorkflowView';
import './DashboardDatabaseView';
import './DashboardKVView';

// Import NuralyUI components
import '../../runtime/components/ui/nuraly-ui/src/components/button';

@customElement('dashboard-layout')
export class DashboardLayout extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: var(--nuraly-color-background, #f8fafc);
    }

    .dashboard-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 24px;
      background: var(--nuraly-color-surface, #ffffff);
      border-bottom: 1px solid var(--nuraly-color-border, #e8e8f0);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: var(--nuraly-color-text, #0f0f3c);
    }

    .logo-icon {
      width: 32px;
      height: 32px;
      color: var(--nuraly-color-primary, #14144b);
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

    .dashboard-body {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
    }

    .dashboard-content {
      flex: 1;
      min-height: 0;
      overflow: auto;
    }
  `;

  @property({ type: String, attribute: 'data-initial-route' })
  initialRouteJson: string = '';

  @state() private currentRoute: ParsedRoute = { type: 'overview' };

  connectedCallback() {
    super.connectedCallback();
    this.initializeFromRoute();

    // Listen for browser back/forward
    window.addEventListener('popstate', this.handlePopState);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('popstate', this.handlePopState);
  }

  private handlePopState = () => {
    this.currentRoute = parseRoute(window.location.pathname, window.location.search);
  };

  private initializeFromRoute() {
    if (this.initialRouteJson) {
      try {
        const initial = JSON.parse(this.initialRouteJson);
        this.currentRoute = {
          type: initial.type,
          resourceId: initial.resourceId,
          subTab: initial.subTab as AppSubTab,
          filters: initial.filters
        };
      } catch (e) {
        console.error('[DashboardLayout] Failed to parse initial route:', e);
        this.currentRoute = { type: 'overview' };
      }
    } else {
      this.currentRoute = parseRoute(window.location.pathname, window.location.search);
    }
  }

  private navigate(path: string) {
    window.history.pushState({}, '', path);
    this.currentRoute = parseRoute(path, '');
  }

  private handleNavigate(e: CustomEvent) {
    const { path } = e.detail;
    this.navigate(path);
  }

  private handleSubTabChange(e: CustomEvent) {
    const { subTab } = e.detail;
    const newPath = `/dashboard/app/${this.currentRoute.resourceId}/${subTab}`;
    window.history.pushState({}, '', newPath);
    this.currentRoute = { ...this.currentRoute, subTab };
  }

  private renderContent() {
    switch (this.currentRoute.type) {
      case 'overview':
        return html`
          <dashboard-overview
            @navigate=${this.handleNavigate}
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

      default:
        return html`<p>Unknown route</p>`;
    }
  }

  render() {
    return html`
      <header class="dashboard-header">
        <div class="header-left">
          <a href="/" class="logo">
            <svg class="logo-icon" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="8" fill="currentColor"/>
              <path d="M8 12L16 8L24 12V20L16 24L8 20V12Z" stroke="white" stroke-width="2" fill="none"/>
              <circle cx="16" cy="16" r="3" fill="white"/>
            </svg>
            <span class="logo-text">Nuraly</span>
          </a>
        </div>
        <div class="header-right">
          <nr-button type="default" size="small" iconLeft="RefreshCw" @click=${() => window.location.reload()}>
            Refresh
          </nr-button>
        </div>
      </header>

      <div class="dashboard-body">
        <div class="dashboard-content">
          ${this.renderContent()}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dashboard-layout': DashboardLayout;
  }
}
