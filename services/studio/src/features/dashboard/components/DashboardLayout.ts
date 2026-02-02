/**
 * Dashboard Layout Component
 * Simple router that renders views based on URL
 */

import { html, LitElement, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { parseRoute, type ParsedRoute, type OverviewView } from '../utils/route-sync';
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
      height: 100vh;
      overflow: hidden;
      background: var(--nuraly-color-background, #f8fafc);
    }

    .dashboard-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 24px;
      background: var(--nuraly-color-surface, #ffffff);
      border-bottom: 1px solid var(--nuraly-color-border, #e8e8f0);
      flex-shrink: 0;
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

    .dashboard-body {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
      overflow: hidden;
    }

    .dashboard-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
      overflow: hidden;
    }

    .dashboard-content > * {
      flex: 1;
      min-height: 0;
    }
  `;

  @property({ type: String, attribute: 'data-initial-route' })
  initialRouteJson: string = '';

  @state() private currentRoute: ParsedRoute = { type: 'overview', overviewView: 'applications' };

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
          filters: initial.filters,
          overviewView: initial.overviewView as OverviewView
        };
      } catch (e) {
        console.error('[DashboardLayout] Failed to parse initial route:', e);
        this.currentRoute = { type: 'overview', overviewView: 'applications' };
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
            .activeView=${this.currentRoute.overviewView || 'applications'}
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
            <img class="logo-icon" src="/favicon-32x32.png" alt="Nuraly" />
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
