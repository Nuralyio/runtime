/**
 * Dashboard Tab Content Component
 * Renders the content for the active tab
 */

import { html, LitElement, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { DashboardTab, AppSubTab } from '../stores/dashboard-tabs.store';

// Import view components
import './DashboardOverview';
import './DashboardAppView';
import './DashboardWorkflowView';
import './DashboardDatabaseView';
import './DashboardKVView';

@customElement('dashboard-tab-content')
export class DashboardTabContent extends LitElement {
  static styles = css`
    :host {
      display: block;
      flex: 1;
      min-height: 0;
      overflow: auto;
    }

    .content-wrapper {
      height: 100%;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 24px;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--nuraly-color-border, #e8e8f0);
      border-top-color: var(--nuraly-color-primary, #14144b);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .loading-text {
      margin-top: 16px;
      color: var(--nuraly-color-text-secondary, #5c5c7a);
      font-size: 14px;
    }
  `;

  @property({ type: Object }) tab: DashboardTab | null = null;

  private handleOpenTab(e: CustomEvent) {
    // Re-dispatch the event to be handled by DashboardLayout
    this.dispatchEvent(new CustomEvent('open-tab', {
      detail: e.detail,
      bubbles: true,
      composed: true
    }));
  }

  private handleSubTabChange(e: CustomEvent) {
    // Re-dispatch the event to be handled by DashboardLayout
    this.dispatchEvent(new CustomEvent('subtab-change', {
      detail: e.detail,
      bubbles: true,
      composed: true
    }));
  }

  render() {
    if (!this.tab) {
      return html`
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p class="loading-text">Loading...</p>
        </div>
      `;
    }

    return html`
      <div class="content-wrapper">
        ${this.renderContent()}
      </div>
    `;
  }

  private renderContent() {
    if (!this.tab) return nothing;

    switch (this.tab.type) {
      case 'overview':
        return html`
          <dashboard-overview
            @open-tab=${this.handleOpenTab}
          ></dashboard-overview>
        `;

      case 'app':
        return html`
          <dashboard-app-view
            .appId=${this.tab.resourceId || ''}
            .subTab=${this.tab.subTab || 'pages'}
            @open-tab=${this.handleOpenTab}
            @subtab-change=${this.handleSubTabChange}
          ></dashboard-app-view>
        `;

      case 'workflow':
        return html`
          <dashboard-workflow-view
            .workflowId=${this.tab.resourceId || ''}
            .appId=${this.tab.appId}
            .appName=${this.tab.appName}
            @open-tab=${this.handleOpenTab}
          ></dashboard-workflow-view>
        `;

      case 'database':
        return html`
          <dashboard-database-view
            .databaseId=${this.tab.resourceId || ''}
            .appId=${this.tab.appId}
            .appName=${this.tab.appName}
            @open-tab=${this.handleOpenTab}
          ></dashboard-database-view>
        `;

      case 'kv':
        return html`
          <dashboard-kv-view
            .filters=${this.tab.filters || {}}
            @open-tab=${this.handleOpenTab}
          ></dashboard-kv-view>
        `;

      default:
        return html`<p>Unknown tab type</p>`;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dashboard-tab-content': DashboardTabContent;
  }
}
