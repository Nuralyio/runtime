/**
 * Main Dashboard Component
 * Modern dashboard with left sidebar navigation
 */

import { html, LitElement, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import styles from './Dashboard.style';
import {
  fetchApplicationsWithStatus,
  fetchAllWorkflowsAcrossApps,
  fetchAllKvEntriesAcrossApps,
  type ApplicationWithStatus,
  type WorkflowWithAppName
} from '../services/dashboard.service';
import type { KvEntry } from '../../runtime/redux/store/kv';

// Import NuralyUI components
import '../../runtime/components/ui/nuraly-ui/src/components/menu';
import '../../runtime/components/ui/nuraly-ui/src/components/button';
import '../../runtime/components/ui/nuraly-ui/src/components/badge';

type ActiveView = 'applications' | 'workflows' | 'kv';

interface MenuItem {
  text: string;
  icon?: string;
  selected?: boolean;
  children?: MenuItem[];
}

@customElement('nuraly-dashboard')
export class Dashboard extends LitElement {
  static styles = styles;

  @state() private applications: ApplicationWithStatus[] = [];
  @state() private workflows: WorkflowWithAppName[] = [];
  @state() private kvEntries: (KvEntry & { applicationName?: string })[] = [];
  @state() private loading = true;
  @state() private error: string | null = null;
  @state() private activeView: ActiveView = 'applications';

  async connectedCallback() {
    super.connectedCallback();
    this.initializeViewFromUrl();
    window.addEventListener('popstate', this.handlePopState);
    await this.loadDashboardData();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('popstate', this.handlePopState);
  }

  private handlePopState = () => {
    this.initializeViewFromUrl();
  };

  private initializeViewFromUrl() {
    const path = window.location.pathname;
    if (path.includes('/dashboard/workflows')) {
      this.activeView = 'workflows';
    } else if (path.includes('/dashboard/kv')) {
      this.activeView = 'kv';
    } else {
      this.activeView = 'applications';
    }
  }

  private updateUrl(view: ActiveView) {
    const urlMap: Record<ActiveView, string> = {
      applications: '/dashboard',
      workflows: '/dashboard/workflows',
      kv: '/dashboard/kv'
    };
    const newUrl = urlMap[view];
    if (window.location.pathname !== newUrl) {
      window.history.pushState({}, '', newUrl);
    }
  }

  private async loadDashboardData() {
    this.loading = true;
    this.error = null;

    try {
      const headers: Record<string, string> = {};

      const [apps, workflows, kv] = await Promise.all([
        fetchApplicationsWithStatus(headers),
        fetchAllWorkflowsAcrossApps(headers),
        fetchAllKvEntriesAcrossApps(headers)
      ]);

      this.applications = apps;
      this.workflows = workflows;
      this.kvEntries = kv;
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      this.error = err instanceof Error ? err.message : 'Failed to load dashboard data';
    } finally {
      this.loading = false;
    }
  }

  private handleMenuChange(e: CustomEvent) {
    const { value } = e.detail;
    // The menu emits the text as the value
    let newView: ActiveView = 'applications';
    if (value === 'Applications') {
      newView = 'applications';
    } else if (value === 'Workflows') {
      newView = 'workflows';
    } else if (value === 'KV Store') {
      newView = 'kv';
    }
    this.activeView = newView;
    this.updateUrl(newView);
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
        text: 'KV Store',
        icon: 'Database',
        selected: this.activeView === 'kv'
      }
    ];
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
            @refresh=${() => this.loadDashboardData()}
          ></applications-grid>
        `;
      case 'workflows':
        return html`
          <workflows-list
            .workflows=${this.workflows}
            @refresh=${() => this.loadDashboardData()}
          ></workflows-list>
        `;
      case 'kv':
        return html`
          <kv-entries-list
            .entries=${this.kvEntries}
            @refresh=${() => this.loadDashboardData()}
          ></kv-entries-list>
        `;
      default:
        return nothing;
    }
  }

  private getViewTitle(): string {
    switch (this.activeView) {
      case 'applications':
        return 'Applications';
      case 'workflows':
        return 'Workflows';
      case 'kv':
        return 'KV Store';
      default:
        return 'Dashboard';
    }
  }

  private getViewCount(): number {
    switch (this.activeView) {
      case 'applications':
        return this.applications.length;
      case 'workflows':
        return this.workflows.length;
      case 'kv':
        return this.kvEntries.length;
      default:
        return 0;
    }
  }

  render() {
    return html`
      <div class="dashboard-layout">
        <aside class="dashboard-sider">
          <div class="sider-header">
            <div class="logo">
              <svg class="logo-icon" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="8" fill="currentColor"/>
                <path d="M8 12L16 8L24 12V20L16 24L8 20V12Z" stroke="white" stroke-width="2" fill="none"/>
                <circle cx="16" cy="16" r="3" fill="white"/>
              </svg>
              <span class="logo-text">Nuraly</span>
            </div>
          </div>
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
                <span class="stat-label">KV Entries</span>
              </div>
            </div>
          </div>
        </aside>
        <div class="dashboard-main">
          <header class="dashboard-header">
            <div class="header-content">
              <div class="header-title">
                <h1>${this.getViewTitle()}</h1>
                ${!this.loading ? html`
                  <nr-badge status="default" text="${this.getViewCount()} items"></nr-badge>
                ` : nothing}
              </div>
              <div class="header-actions">
                <nr-button type="default" size="small" iconLeft="RefreshCw" @click=${this.handleRetry}>
                  Refresh
                </nr-button>
              </div>
            </div>
          </header>
          <main class="dashboard-content">
            ${this.renderContent()}
          </main>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'nuraly-dashboard': Dashboard;
  }
}
