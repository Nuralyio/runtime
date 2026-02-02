/**
 * Dashboard App View Component
 * Simplified view of an app with sub-tabs (pages, workflows, database, kv)
 */

import { html, LitElement, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { AppSubTab } from '../stores/dashboard-tabs.store';
import { getStudioUrl } from '../utils/route-sync';
import {
  fetchApplicationsWithStatus,
  type ApplicationWithStatus,
  type WorkflowWithAppName
} from '../services/dashboard.service';
import { workflowService } from '../../../services/workflow.service';
import { getKvEntries, type KvEntry } from '../../runtime/redux/store/kv';

// Import NuralyUI components
import '../../runtime/components/ui/nuraly-ui/src/components/button';
import '../../runtime/components/ui/nuraly-ui/src/components/badge';

@customElement('dashboard-app-view')
export class DashboardAppView extends LitElement {
  static styles = css`
    :host {
      display: block;
      height: 100%;
      background: var(--nuraly-color-background, #f8fafc);
    }

    .app-view {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .app-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 24px;
      background: var(--nuraly-color-surface, #ffffff);
      border-bottom: 1px solid var(--nuraly-color-border, #e8e8f0);
    }

    .app-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .app-name {
      font-size: 18px;
      font-weight: 600;
      color: var(--nuraly-color-text, #0f0f3c);
      margin: 0;
    }

    .app-description {
      font-size: 13px;
      color: var(--nuraly-color-text-secondary, #5c5c7a);
      margin: 0;
    }

    .sub-tabs {
      display: flex;
      gap: 4px;
      padding: 0 24px;
      background: var(--nuraly-color-surface, #ffffff);
      border-bottom: 1px solid var(--nuraly-color-border, #e8e8f0);
    }

    .sub-tab {
      padding: 12px 16px;
      font-size: 13px;
      font-weight: 500;
      color: var(--nuraly-color-text-secondary, #5c5c7a);
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      cursor: pointer;
      transition: all 150ms ease;
    }

    .sub-tab:hover {
      color: var(--nuraly-color-text, #0f0f3c);
    }

    .sub-tab.active {
      color: var(--nuraly-color-primary, #14144b);
      border-bottom-color: var(--nuraly-color-primary, #14144b);
    }

    .sub-content {
      flex: 1;
      padding: 24px;
      overflow-y: auto;
    }

    /* Loading */
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 200px;
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

    /* List styles */
    .list-container {
      background: var(--nuraly-color-surface, #ffffff);
      border-radius: 8px;
      border: 1px solid var(--nuraly-color-border, #e8e8f0);
    }

    .list-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid var(--nuraly-color-border, #e8e8f0);
    }

    .list-title {
      font-size: 14px;
      font-weight: 500;
      color: var(--nuraly-color-text, #0f0f3c);
    }

    .list-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid var(--nuraly-color-border-subtle, #f1f3f5);
      cursor: pointer;
      transition: background 150ms ease;
    }

    .list-item:last-child {
      border-bottom: none;
    }

    .list-item:hover {
      background: var(--nuraly-color-background-hover, #f1f5f9);
    }

    .list-item-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .list-item-name {
      font-size: 14px;
      font-weight: 500;
      color: var(--nuraly-color-text, #0f0f3c);
    }

    .list-item-meta {
      font-size: 12px;
      color: var(--nuraly-color-text-tertiary, #8c8ca8);
    }

    .empty-state {
      text-align: center;
      padding: 40px 24px;
      color: var(--nuraly-color-text-secondary, #5c5c7a);
    }

    .empty-state-title {
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 8px;
    }

    .empty-state-text {
      font-size: 13px;
    }
  `;

  @property({ type: String }) appId: string = '';
  @property({ type: String }) subTab: AppSubTab = 'pages';

  @state() private app: ApplicationWithStatus | null = null;
  @state() private workflows: WorkflowWithAppName[] = [];
  @state() private kvEntries: KvEntry[] = [];
  @state() private loading = true;

  async connectedCallback() {
    super.connectedCallback();
    await this.loadAppData();
  }

  async updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('appId') && this.appId) {
      await this.loadAppData();
    }
  }

  private async loadAppData() {
    if (!this.appId) return;

    this.loading = true;
    try {
      // Fetch app info
      const apps = await fetchApplicationsWithStatus({});
      this.app = apps.find(a => a.uuid === this.appId) || null;

      // Fetch workflows for this app
      const allWorkflows = await workflowService.getWorkflowsByApplication(this.appId);
      this.workflows = allWorkflows.map(wf => ({
        ...wf,
        id: wf.id,
        name: wf.name,
        description: wf.description,
        applicationId: this.appId,
        applicationName: this.app?.name,
        status: 'active',
        nodes: [],
        edges: []
      }));

      // Fetch KV entries for this app
      this.kvEntries = await getKvEntries(this.appId) || [];
    } catch (e) {
      console.error('[DashboardAppView] Failed to load app data:', e);
    } finally {
      this.loading = false;
    }
  }

  private switchSubTab(tab: AppSubTab) {
    this.subTab = tab;
    this.dispatchEvent(new CustomEvent('subtab-change', {
      detail: { tabId: `app-${this.appId}`, subTab: tab },
      bubbles: true,
      composed: true
    }));
  }

  private openInStudio() {
    const url = getStudioUrl('app', this.appId);
    if (url) {
      window.location.href = url;
    }
  }

  private handleWorkflowClick(workflow: WorkflowWithAppName) {
    this.dispatchEvent(new CustomEvent('open-tab', {
      detail: {
        type: 'workflow',
        resourceId: workflow.id,
        label: workflow.name,
        appId: this.appId,
        appName: this.app?.name
      },
      bubbles: true,
      composed: true
    }));
  }

  private renderLoading() {
    return html`
      <div class="loading-container">
        <div class="loading-spinner"></div>
      </div>
    `;
  }

  private renderSubContent() {
    if (this.loading) return this.renderLoading();

    switch (this.subTab) {
      case 'pages':
        return this.renderPagesTab();
      case 'workflows':
        return this.renderWorkflowsTab();
      case 'database':
        return this.renderDatabaseTab();
      case 'kv':
        return this.renderKvTab();
      default:
        return nothing;
    }
  }

  private renderPagesTab() {
    return html`
      <div class="empty-state">
        <p class="empty-state-title">Pages Overview</p>
        <p class="empty-state-text">Open in Studio to view and edit pages</p>
        <nr-button type="primary" @click=${this.openInStudio}>Open in Studio</nr-button>
      </div>
    `;
  }

  private renderWorkflowsTab() {
    if (this.workflows.length === 0) {
      return html`
        <div class="empty-state">
          <p class="empty-state-title">No workflows</p>
          <p class="empty-state-text">This app doesn't have any workflows yet</p>
        </div>
      `;
    }

    return html`
      <div class="list-container">
        <div class="list-header">
          <span class="list-title">Workflows (${this.workflows.length})</span>
        </div>
        ${this.workflows.map(wf => html`
          <div class="list-item" @click=${() => this.handleWorkflowClick(wf)}>
            <div class="list-item-info">
              <span class="list-item-name">${wf.name}</span>
              ${wf.description ? html`<span class="list-item-meta">${wf.description}</span>` : ''}
            </div>
            <nr-badge status="success" text="Active"></nr-badge>
          </div>
        `)}
      </div>
    `;
  }

  private renderDatabaseTab() {
    return html`
      <div class="empty-state">
        <p class="empty-state-title">Database Connections</p>
        <p class="empty-state-text">Open in Studio to manage database connections</p>
        <nr-button type="primary" @click=${this.openInStudio}>Open in Studio</nr-button>
      </div>
    `;
  }

  private renderKvTab() {
    if (this.kvEntries.length === 0) {
      return html`
        <div class="empty-state">
          <p class="empty-state-title">No KV entries</p>
          <p class="empty-state-text">This app doesn't have any KV store entries yet</p>
        </div>
      `;
    }

    return html`
      <div class="list-container">
        <div class="list-header">
          <span class="list-title">KV Entries (${this.kvEntries.length})</span>
        </div>
        ${this.kvEntries.slice(0, 20).map(entry => html`
          <div class="list-item">
            <div class="list-item-info">
              <span class="list-item-name">${entry.key}</span>
              <span class="list-item-meta">${entry.scope || 'global'}</span>
            </div>
          </div>
        `)}
        ${this.kvEntries.length > 20 ? html`
          <div class="list-item">
            <span class="list-item-meta">+ ${this.kvEntries.length - 20} more entries</span>
          </div>
        ` : ''}
      </div>
    `;
  }

  render() {
    return html`
      <div class="app-view">
        <div class="app-header">
          <div class="app-info">
            <h2 class="app-name">${this.app?.name || 'Loading...'}</h2>
            ${this.app?.isPublished ? html`
              <nr-badge status="success" text="Published"></nr-badge>
            ` : html`
              <nr-badge status="warning" text="Draft"></nr-badge>
            `}
          </div>
          <nr-button type="primary" size="small" @click=${this.openInStudio}>
            Open in Studio
          </nr-button>
        </div>

        <div class="sub-tabs">
          <button
            class="sub-tab ${this.subTab === 'pages' ? 'active' : ''}"
            @click=${() => this.switchSubTab('pages')}
          >Pages</button>
          <button
            class="sub-tab ${this.subTab === 'workflows' ? 'active' : ''}"
            @click=${() => this.switchSubTab('workflows')}
          >Workflows</button>
          <button
            class="sub-tab ${this.subTab === 'database' ? 'active' : ''}"
            @click=${() => this.switchSubTab('database')}
          >Database</button>
          <button
            class="sub-tab ${this.subTab === 'kv' ? 'active' : ''}"
            @click=${() => this.switchSubTab('kv')}
          >KV Store</button>
        </div>

        <div class="sub-content">
          ${this.renderSubContent()}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dashboard-app-view': DashboardAppView;
  }
}
