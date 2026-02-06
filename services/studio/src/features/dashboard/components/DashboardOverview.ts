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
import type { KvEntry } from '../../../services/kv/kv.types';

// Import NuralyUI components
import '../../runtime/components/ui/nuraly-ui/src/components/menu';
import '../../runtime/components/ui/nuraly-ui/src/components/button';
import '../../runtime/components/ui/nuraly-ui/src/components/badge';

// Import child components
import './ApplicationsGrid/ApplicationsGrid';
import './WorkflowsList/WorkflowsList';
import './KVEntriesList/KVEntriesList';
import './DatabaseList/DatabaseList';
import './JournalList/JournalList';
import './ServicesStatus/ServicesStatus';

type ActiveView = 'applications' | 'workflows' | 'kv' | 'database' | 'journal' | 'services';

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
      display: flex;
      flex: 1;
      min-height: 0;
      background: var(--nuraly-color-background, #f8fafc);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }

    .overview-layout {
      display: flex;
      flex: 1;
      min-height: 0;
    }

    /* Sidebar */
    .overview-sider {
      width: 220px;
      min-width: 220px;
      flex-shrink: 0;
      height: calc(100vh - 49px);
      background: var(--nuraly-color-surface, #ffffff);
      border-right: 1px solid var(--nuraly-color-border, #e8e8f0);
      display: flex;
      flex-direction: column;
      overflow: hidden;
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
      min-height: 0;
      overflow: hidden;
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
      height: calc(100vh - 49px - 48px);
    }

    .overview-content > * {
      flex: 1;
      min-height: 0;
      overflow: hidden;
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

  // Per-view loading states
  @state() private loadingApps = false;
  @state() private loadingWorkflows = false;
  @state() private loadingKv = false;
  @state() private loadingDatabases = false;

  // Track what's been loaded (reactive)
  @state() private appsLoaded = false;
  @state() private workflowsLoaded = false;
  @state() private kvLoaded = false;
  @state() private databasesLoaded = false;

  @state() private error: string | null = null;

  // Computed loading state for current view
  private get loading(): boolean {
    switch (this.activeView) {
      case 'applications': return this.loadingApps;
      case 'workflows': return this.loadingWorkflows;
      case 'kv': return this.loadingKv;
      case 'database': return this.loadingDatabases;
      default: return false;
    }
  }

  async connectedCallback() {
    super.connectedCallback();
    await this.loadDataForView(this.activeView);
    // Preload other views in background after current view loads
    this.preloadOtherViews();
  }

  updated(changedProperties: Map<string, unknown>) {
    super.updated(changedProperties);
    if (changedProperties.has('activeView')) {
      this.loadDataForView(this.activeView);
    }
  }

  private preloadOtherViews() {
    // Preload other views in background (non-blocking)
    const allViews: ActiveView[] = ['applications', 'workflows', 'database', 'kv'];
    const otherViews = allViews.filter(v => v !== this.activeView);

    // Load each view sequentially in background to avoid overwhelming the server
    const loadNext = async (views: ActiveView[]) => {
      if (views.length === 0) return;
      const [next, ...rest] = views;
      try {
        await this.loadDataForView(next);
      } catch (e) {
        // Ignore errors during preload - they'll be shown when user navigates
        console.debug(`[Dashboard] Preload ${next} failed:`, e);
      }
      // Small delay between requests
      setTimeout(() => loadNext(rest), 100);
    };

    // Start preloading after a short delay to not compete with current view
    setTimeout(() => loadNext(otherViews), 500);
  }

  private isViewLoaded(view: ActiveView): boolean {
    switch (view) {
      case 'applications': return this.appsLoaded;
      case 'workflows': return this.workflowsLoaded;
      case 'kv': return this.kvLoaded;
      case 'database': return this.databasesLoaded;
      default: return true;
    }
  }

  private async loadDataForView(view: ActiveView) {
    // Skip if already loaded (unless forced refresh)
    if (this.isViewLoaded(view)) return;

    const headers: Record<string, string> = {};

    switch (view) {
      case 'applications':
        if (!this.loadingApps) {
          this.loadingApps = true;
          this.error = null;
          try {
            this.applications = await fetchApplicationsWithStatus(headers);
            this.appsLoaded = true;
          } catch (err) {
            console.error('Failed to load applications:', err);
            this.error = err instanceof Error ? err.message : 'Failed to load applications';
          } finally {
            this.loadingApps = false;
          }
        }
        break;

      case 'workflows':
        if (!this.loadingWorkflows) {
          this.loadingWorkflows = true;
          this.error = null;
          try {
            // Load apps too for the workflow creation dropdown
            const [workflows, apps] = await Promise.all([
              fetchAllWorkflowsAcrossApps(headers),
              this.appsLoaded
                ? Promise.resolve(this.applications)
                : fetchApplicationsWithStatus(headers)
            ]);
            this.workflows = workflows;
            if (!this.appsLoaded) {
              this.applications = apps;
              this.appsLoaded = true;
            }
            this.workflowsLoaded = true;
          } catch (err) {
            console.error('Failed to load workflows:', err);
            this.error = err instanceof Error ? err.message : 'Failed to load workflows';
          } finally {
            this.loadingWorkflows = false;
          }
        }
        break;

      case 'kv':
        if (!this.loadingKv) {
          this.loadingKv = true;
          this.error = null;
          try {
            this.kvEntries = await fetchAllKvEntriesAcrossApps(headers);
            this.kvLoaded = true;
          } catch (err) {
            console.error('Failed to load KV entries:', err);
            this.error = err instanceof Error ? err.message : 'Failed to load KV entries';
          } finally {
            this.loadingKv = false;
          }
        }
        break;

      case 'database':
        if (!this.loadingDatabases) {
          this.loadingDatabases = true;
          this.error = null;
          try {
            this.databases = await fetchAllDatabaseConnections(headers);
            this.databasesLoaded = true;
          } catch (err) {
            console.error('Failed to load databases:', err);
            this.error = err instanceof Error ? err.message : 'Failed to load databases';
          } finally {
            this.loadingDatabases = false;
          }
        }
        break;

      // journal and services don't need pre-loaded data
      case 'journal':
      case 'services':
        break;
    }
  }

  private async refreshCurrentView() {
    // Force reload current view
    switch (this.activeView) {
      case 'applications': this.appsLoaded = false; break;
      case 'workflows': this.workflowsLoaded = false; break;
      case 'kv': this.kvLoaded = false; break;
      case 'database': this.databasesLoaded = false; break;
    }
    this.error = null;
    await this.loadDataForView(this.activeView);
  }

  private handleMenuChange(e: CustomEvent) {
    const { value } = e.detail;
    const routes: Record<string, string> = {
      'Applications': '/dashboard/applications',
      'Workflows': '/dashboard/workflows',
      'Database': '/dashboard/database',
      'KV Store': '/dashboard/kv',
      'Journal': '/dashboard/journal',
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
    this.refreshCurrentView();
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
        text: 'Journal',
        icon: 'FileText',
        selected: this.activeView === 'journal'
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
    const loadingText = `Loading ${this.getViewTitle().toLowerCase()}...`;
    return html`
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">${loadingText}</p>
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
        <nr-button type="primary" size="small" @click=${this.handleRetry}>Try Again</nr-button>
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
            @refresh=${() => this.refreshCurrentView()}
          ></applications-grid>
        `;
      case 'workflows':
        return html`
          <workflows-list
            .workflows=${this.workflows}
            .applications=${this.applications}
            @workflow-click=${(e: CustomEvent) => this.handleWorkflowClick(e.detail.workflow)}
            @refresh=${() => this.refreshCurrentView()}
          ></workflows-list>
        `;
      case 'kv':
        return html`
          <kv-entries-list
            .entries=${this.kvEntries}
            @open-kv-tab=${() => this.handleKvClick()}
            @refresh=${() => this.refreshCurrentView()}
          ></kv-entries-list>
        `;
      case 'database':
        return html`
          <dashboard-database-list
            .databases=${this.databases}
            @database-select=${(e: CustomEvent) => this.handleDatabaseSelect(e.detail.database)}
            @refresh=${() => this.refreshCurrentView()}
          ></dashboard-database-list>
        `;
      case 'journal':
        return html`
          <dashboard-journal-list
            @refresh=${() => this.refreshCurrentView()}
          ></dashboard-journal-list>
        `;
      case 'services':
        return html`
          <dashboard-services-status
            @refresh=${() => this.refreshCurrentView()}
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
      case 'journal': return 'Journal';
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
                <span class="stat-value">${this.appsLoaded ? this.applications.length : '-'}</span>
                <span class="stat-label">Apps</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">${this.workflowsLoaded ? this.workflows.length : '-'}</span>
                <span class="stat-label">Workflows</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">${this.kvLoaded ? this.kvEntries.length : '-'}</span>
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
