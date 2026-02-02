/**
 * Dashboard Overview Component
 * Shows the main overview with applications, workflows, and KV store lists
 * Emits 'navigate' events for routing
 */

import { html, LitElement, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  fetchApplicationsWithStatus,
  fetchAllWorkflowsAcrossApps,
  fetchAllKvEntriesAcrossApps,
  fetchAllDatabaseConnections,
  type ApplicationWithStatus,
  type WorkflowWithAppName,
  type DatabaseConnection
} from '../services/dashboard.service';
import type { KvEntry } from '../../runtime/redux/store/kv';

// Import NuralyUI components
import '../../runtime/components/ui/nuraly-ui/src/components/menu';
import '../../runtime/components/ui/nuraly-ui/src/components/button';
import '../../runtime/components/ui/nuraly-ui/src/components/badge';

// Import child components
import './ApplicationsGrid/ApplicationsGrid';
import './WorkflowsList/WorkflowsList';
import './KVEntriesList/KVEntriesList';
import './DatabaseList/DatabaseList';
import './ParcourList/ParcourList';
import './ServicesStatus/ServicesStatus';

type ActiveView = 'applications' | 'workflows' | 'kv' | 'database' | 'parcour' | 'services';

interface MenuItem {
  text: string;
  icon?: string;
  selected?: boolean;
  children?: MenuItem[];
}

@customElement('dashboard-overview')
export class DashboardOverview extends LitElement {
  static styles = css`
    :host {
      display: block;
      height: 100%;
      background: var(--nuraly-color-background, #f8fafc);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }

    .overview-layout {
      display: flex;
      height: 100%;
    }

    /* Sidebar */
    .overview-sider {
      width: 220px;
      min-width: 220px;
      height: 100%;
      background: var(--nuraly-color-surface, #ffffff);
      border-right: 1px solid var(--nuraly-color-border, #e8e8f0);
      display: flex;
      flex-direction: column;
    }

    .sider-nav {
      flex: 1;
      padding: 8px;
      overflow-y: auto;
    }

    .sider-nav nr-menu {
      --nuraly-menu-font-size: 13px;
      --nuraly-menu-link-padding: 8px 12px;
      --nuraly-menu-border-radius: 6px;
      --nuraly-menu-link-color: var(--nuraly-color-text-secondary, #5c5c7a);
      --nuraly-menu-link-background-color: transparent;
      --nuraly-menu-hover-link-background-color: var(--nuraly-color-background-hover, #f1f5f9);
      --nuraly-menu-hover-link-color: var(--nuraly-color-text, #0f0f3c);
      --nuraly-menu-selected-link-background-color: var(--nuraly-color-primary-bg, #f0f0f8);
      --nuraly-menu-selected-color: var(--nuraly-color-primary, #14144b);
    }

    .sider-footer {
      padding: 12px 16px;
      border-top: 1px solid var(--nuraly-color-border-subtle, #f1f3f5);
    }

    .stats-container {
      display: flex;
      justify-content: space-around;
      gap: 8px;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }

    .stat-value {
      font-size: 16px;
      font-weight: 600;
      color: var(--nuraly-color-text, #0f0f3c);
    }

    .stat-label {
      font-size: 10px;
      color: var(--nuraly-color-text-tertiary, #8c8ca8);
      text-transform: uppercase;
    }

    /* Main Content */
    .overview-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .overview-header {
      height: 48px;
      background: var(--nuraly-color-surface, #ffffff);
      border-bottom: 1px solid var(--nuraly-color-border, #e8e8f0);
      padding: 0 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .header-title {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .header-title h2 {
      font-size: 15px;
      font-weight: 500;
      color: var(--nuraly-color-text, #0f0f3c);
      margin: 0;
    }

    .overview-content {
      flex: 1;
      padding: 20px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }

    .overview-content > * {
      flex: 1;
      min-height: 0;
    }

    /* Loading */
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 300px;
      gap: 12px;
    }

    .loading-spinner {
      width: 32px;
      height: 32px;
      border: 2px solid var(--nuraly-color-border, #e8e8f0);
      border-top-color: var(--nuraly-color-primary, #14144b);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .loading-text {
      font-size: 13px;
      color: var(--nuraly-color-text-tertiary, #8c8ca8);
    }

    /* Error */
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 300px;
      gap: 12px;
      text-align: center;
    }

    .error-icon {
      width: 40px;
      height: 40px;
      color: var(--nuraly-color-danger, #dc2626);
    }

    .error-title {
      font-size: 14px;
      font-weight: 500;
      color: var(--nuraly-color-text, #0f0f3c);
      margin: 0;
    }

    .error-message {
      font-size: 13px;
      color: var(--nuraly-color-text-tertiary, #8c8ca8);
    }
  `;

  @property({ type: String }) activeView: ActiveView = 'applications';

  @state() private applications: ApplicationWithStatus[] = [];
  @state() private workflows: WorkflowWithAppName[] = [];
  @state() private kvEntries: (KvEntry & { applicationName?: string })[] = [];
  @state() private databases: DatabaseConnection[] = [];
  @state() private loading = true;
  @state() private error: string | null = null;

  async connectedCallback() {
    super.connectedCallback();
    await this.loadDashboardData();
  }

  private async loadDashboardData() {
    this.loading = true;
    this.error = null;

    try {
      const headers: Record<string, string> = {};

      const [apps, workflows, kv, dbs] = await Promise.all([
        fetchApplicationsWithStatus(headers),
        fetchAllWorkflowsAcrossApps(headers),
        fetchAllKvEntriesAcrossApps(headers),
        fetchAllDatabaseConnections(headers)
      ]);

      this.applications = apps;
      this.workflows = workflows;
      this.kvEntries = kv;
      this.databases = dbs;
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      this.error = err instanceof Error ? err.message : 'Failed to load dashboard data';
    } finally {
      this.loading = false;
    }
  }

  private handleMenuChange(e: CustomEvent) {
    const { value } = e.detail;
    const routes: Record<string, string> = {
      'Applications': '/dashboard/applications',
      'Workflows': '/dashboard/workflows',
      'Database': '/dashboard/database',
      'KV Store': '/dashboard/kv',
      'Parcour': '/dashboard/parcour',
      'Services': '/dashboard/services'
    };
    const path = routes[value] || '/dashboard/applications';
    this.dispatchEvent(new CustomEvent('navigate', {
      detail: { path },
      bubbles: true,
      composed: true
    }));
  }

  private handleRetry() {
    this.loadDashboardData();
  }

  private getMenuItems(): MenuItem[] {
    return [
      {
        text: 'Applications',
        icon: 'LayoutGrid',
        selected: this.activeView === 'applications'
      },
      {
        text: 'Workflows',
        icon: 'GitBranch',
        selected: this.activeView === 'workflows'
      },
      {
        text: 'Database',
        icon: 'Database',
        selected: this.activeView === 'database'
      },
      {
        text: 'KV Store',
        icon: 'Key',
        selected: this.activeView === 'kv'
      },
      {
        text: 'Parcour',
        icon: 'Route',
        selected: this.activeView === 'parcour'
      },
      {
        text: 'Services',
        icon: 'Activity',
        selected: this.activeView === 'services'
      }
    ];
  }

  private handleAppClick(app: ApplicationWithStatus) {
    this.dispatchEvent(new CustomEvent('navigate', {
      detail: { path: `/dashboard/app/${app.uuid}` },
      bubbles: true,
      composed: true
    }));
  }

  private handleWorkflowClick(workflow: WorkflowWithAppName) {
    this.dispatchEvent(new CustomEvent('navigate', {
      detail: { path: `/dashboard/workflow/${workflow.id}` },
      bubbles: true,
      composed: true
    }));
  }

  private handleKvClick() {
    this.dispatchEvent(new CustomEvent('navigate', {
      detail: { path: '/dashboard/kv' },
      bubbles: true,
      composed: true
    }));
  }

  private handleDatabaseSelect(db: DatabaseConnection) {
    // Navigate to database view with the connection info
    this.dispatchEvent(new CustomEvent('navigate', {
      detail: { path: `/dashboard/database/${db.applicationId}`, database: db },
      bubbles: true,
      composed: true
    }));
  }

  private renderLoading() {
    return html`
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">Loading dashboard...</p>
      </div>
    `;
  }

  private renderError() {
    return html`
      <div class="error-container">
        <svg class="error-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 class="error-title">Unable to load dashboard</h3>
        <p class="error-message">${this.error}</p>
        <nr-button type="primary" @click=${this.handleRetry}>Try Again</nr-button>
      </div>
    `;
  }

  private renderContent() {
    if (this.loading) return this.renderLoading();
    if (this.error) return this.renderError();

    switch (this.activeView) {
      case 'applications':
        return html`
          <applications-grid
            .applications=${this.applications}
            @app-click=${(e: CustomEvent) => this.handleAppClick(e.detail.app)}
            @refresh=${() => this.loadDashboardData()}
          ></applications-grid>
        `;
      case 'workflows':
        return html`
          <workflows-list
            .workflows=${this.workflows}
            .applications=${this.applications}
            @workflow-click=${(e: CustomEvent) => this.handleWorkflowClick(e.detail.workflow)}
            @refresh=${() => this.loadDashboardData()}
          ></workflows-list>
        `;
      case 'kv':
        return html`
          <kv-entries-list
            .entries=${this.kvEntries}
            @open-kv-tab=${() => this.handleKvClick()}
            @refresh=${() => this.loadDashboardData()}
          ></kv-entries-list>
        `;
      case 'database':
        return html`
          <dashboard-database-list
            .databases=${this.databases}
            @database-select=${(e: CustomEvent) => this.handleDatabaseSelect(e.detail.database)}
            @refresh=${() => this.loadDashboardData()}
          ></dashboard-database-list>
        `;
      case 'parcour':
        return html`
          <dashboard-parcour-list
            @refresh=${() => this.loadDashboardData()}
          ></dashboard-parcour-list>
        `;
      case 'services':
        return html`
          <dashboard-services-status
            @refresh=${() => this.loadDashboardData()}
          ></dashboard-services-status>
        `;
      default:
        return nothing;
    }
  }

  private getViewTitle(): string {
    switch (this.activeView) {
      case 'applications': return 'Applications';
      case 'workflows': return 'Workflows';
      case 'database': return 'Database';
      case 'kv': return 'KV Store';
      case 'parcour': return 'Parcour';
      case 'services': return 'Services Status';
      default: return 'Overview';
    }
  }

  private getViewCount(): number | null {
    switch (this.activeView) {
      case 'applications': return this.applications.length;
      case 'workflows': return this.workflows.length;
      case 'kv': return this.kvEntries.length;
      case 'database': return this.databases.length;
      default: return null;
    }
  }

  render() {
    return html`
      <div class="overview-layout">
        <aside class="overview-sider">
          <nav class="sider-nav">
            <nr-menu
              .items=${this.getMenuItems()}
              @change=${this.handleMenuChange}
            ></nr-menu>
          </nav>
          <div class="sider-footer">
            <div class="stats-container">
              <div class="stat-item">
                <span class="stat-value">${this.applications.length}</span>
                <span class="stat-label">Apps</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">${this.workflows.length}</span>
                <span class="stat-label">Workflows</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">${this.kvEntries.length}</span>
                <span class="stat-label">KV</span>
              </div>
            </div>
          </div>
        </aside>

        <div class="overview-main">
          <header class="overview-header">
            <div class="header-title">
              <h2>${this.getViewTitle()}</h2>
              ${!this.loading && this.getViewCount() !== null ? html`
                <nr-badge status="default" text="${this.getViewCount()} items"></nr-badge>
              ` : nothing}
            </div>
            <nr-button type="default" size="small" iconLeft="RefreshCw" @click=${this.handleRetry}>
              Refresh
            </nr-button>
          </header>
          <main class="overview-content">
            ${this.renderContent()}
          </main>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dashboard-overview': DashboardOverview;
  }
}
