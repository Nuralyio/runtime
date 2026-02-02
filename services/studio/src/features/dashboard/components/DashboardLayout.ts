/**
 * Dashboard Layout Component
 * Main container that manages tabs and routing
 */

import { html, LitElement, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  $dashboardTabs,
  $activeTab,
  openTab,
  closeTab,
  switchTab,
  updateTabSubTab,
  updateTab,
  type DashboardTab,
  type DashboardTabType,
  type AppSubTab
} from '../stores/dashboard-tabs.store';
import {
  parseRoute,
  tabToRoute,
  navigateToTab,
  initRouteListener,
  syncFromURL,
  createTabFromRoute,
  type ParsedRoute
} from '../utils/route-sync';
import { workflowService } from '../../../services/workflow.service';
import {
  fetchApplicationsWithStatus,
  type ApplicationWithStatus
} from '../services/dashboard.service';

// Import child components
import './DashboardTabBar';
import './DashboardTabContent';

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

    dashboard-tab-bar {
      flex-shrink: 0;
    }

    dashboard-tab-content {
      flex: 1;
      min-height: 0;
    }
  `;

  @property({ type: String, attribute: 'data-initial-route' })
  initialRouteJson: string = '';

  @state() private tabs: DashboardTab[] = [];
  @state() private activeTabId: string = 'overview';

  private unsubscribeTabs?: () => void;
  private unsubscribeRoute?: () => void;

  connectedCallback() {
    super.connectedCallback();

    // Subscribe to tab store
    this.unsubscribeTabs = $dashboardTabs.subscribe((state) => {
      this.tabs = state.tabs;
      this.activeTabId = state.activeTabId;
    });

    // Initialize from route
    this.initializeFromRoute();

    // Listen for browser back/forward
    this.unsubscribeRoute = initRouteListener((parsed) => {
      this.handleRouteChange(parsed);
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribeTabs?.();
    this.unsubscribeRoute?.();
  }

  private async initializeFromRoute() {
    let parsed: ParsedRoute;

    if (this.initialRouteJson) {
      try {
        const initial = JSON.parse(this.initialRouteJson);
        parsed = {
          type: initial.type as DashboardTabType,
          resourceId: initial.resourceId,
          subTab: initial.subTab as AppSubTab,
          filters: initial.filters
        };
      } catch (e) {
        console.error('[DashboardLayout] Failed to parse initial route:', e);
        parsed = { type: 'overview' };
      }
    } else {
      // Parse from current URL
      parsed = parseRoute(window.location.pathname, window.location.search);
    }

    await this.handleRouteChange(parsed);
  }

  private async handleRouteChange(parsed: ParsedRoute) {
    // Check if we need to fetch data for this tab
    const state = $dashboardTabs.get();
    const existingTab = state.tabs.find(t => {
      if (parsed.type === 'overview') return t.type === 'overview';
      if (parsed.type === 'kv') return t.type === 'kv';
      return t.type === parsed.type && t.resourceId === parsed.resourceId;
    });

    if (existingTab) {
      // Tab exists, just switch to it
      switchTab(existingTab.id);
      if (parsed.type === 'app' && parsed.subTab) {
        updateTabSubTab(existingTab.id, parsed.subTab);
      }
      return;
    }

    // Need to create new tab - may need to fetch data first
    switch (parsed.type) {
      case 'overview':
        openTab({ type: 'overview', label: 'Overview' });
        break;

      case 'kv':
        openTab({ type: 'kv', label: 'KV Store', filters: parsed.filters });
        break;

      case 'app':
        await this.openAppTab(parsed.resourceId!, parsed.subTab);
        break;

      case 'workflow':
        await this.openWorkflowTab(parsed.resourceId!);
        break;

      case 'database':
        await this.openDatabaseTab(parsed.resourceId!);
        break;
    }
  }

  private async openAppTab(appId: string, subTab?: AppSubTab) {
    // Fetch app info to get the name
    try {
      const apps = await fetchApplicationsWithStatus({});
      const app = apps.find(a => a.uuid === appId);
      const label = app?.name || 'App';

      openTab({
        type: 'app',
        resourceId: appId,
        label,
        subTab: subTab || 'pages'
      });
    } catch (e) {
      console.error('[DashboardLayout] Failed to fetch app:', e);
      openTab({
        type: 'app',
        resourceId: appId,
        label: 'App',
        subTab: subTab || 'pages'
      });
    }
  }

  private async openWorkflowTab(workflowId: string) {
    try {
      const workflow = await workflowService.getWorkflow(workflowId);

      // Try to get app name if workflow has an applicationId
      let appName: string | null = null;
      const appId = (workflow as any).applicationId;

      if (appId) {
        try {
          const apps = await fetchApplicationsWithStatus({});
          const app = apps.find(a => a.uuid === appId);
          appName = app?.name || null;
        } catch (e) {
          // Ignore - appName stays null
        }
      }

      openTab({
        type: 'workflow',
        resourceId: workflowId,
        label: workflow.name,
        appId: appId || null,
        appName
      });
    } catch (e) {
      console.error('[DashboardLayout] Failed to fetch workflow:', e);
      openTab({
        type: 'workflow',
        resourceId: workflowId,
        label: 'Workflow',
        appId: null,
        appName: null
      });
    }
  }

  private async openDatabaseTab(databaseId: string) {
    // For now, just create the tab - database service would be called here
    openTab({
      type: 'database',
      resourceId: databaseId,
      label: 'Database',
      appId: null,
      appName: null
    });
  }

  private handleTabClick(e: CustomEvent) {
    const { tabId } = e.detail;
    const tab = this.tabs.find(t => t.id === tabId);
    if (tab) {
      switchTab(tabId);
      navigateToTab(tab);
    }
  }

  private handleTabClose(e: CustomEvent) {
    const { tabId } = e.detail;
    closeTab(tabId);

    // Navigate to the new active tab
    const state = $dashboardTabs.get();
    const activeTab = state.tabs.find(t => t.id === state.activeTabId);
    if (activeTab) {
      navigateToTab(activeTab);
    }
  }

  private handleOpenTab(e: CustomEvent) {
    const detail = e.detail;
    const newTab = openTab({
      type: detail.type,
      resourceId: detail.resourceId,
      label: detail.label,
      appId: detail.appId,
      appName: detail.appName,
      subTab: detail.subTab,
      filters: detail.filters
    });
    navigateToTab(newTab);
  }

  private handleSubTabChange(e: CustomEvent) {
    const { tabId, subTab } = e.detail;
    updateTabSubTab(tabId, subTab);

    // Update URL
    const tab = this.tabs.find(t => t.id === tabId);
    if (tab) {
      const updatedTab = { ...tab, subTab };
      navigateToTab(updatedTab);
    }
  }

  private get activeTab(): DashboardTab | null {
    return this.tabs.find(t => t.id === this.activeTabId) || null;
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
        <dashboard-tab-bar
          .tabs=${this.tabs}
          .activeTabId=${this.activeTabId}
          @tab-click=${this.handleTabClick}
          @tab-close=${this.handleTabClose}
        ></dashboard-tab-bar>

        <dashboard-tab-content
          .tab=${this.activeTab}
          @open-tab=${this.handleOpenTab}
          @subtab-change=${this.handleSubTabChange}
        ></dashboard-tab-content>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dashboard-layout': DashboardLayout;
  }
}
