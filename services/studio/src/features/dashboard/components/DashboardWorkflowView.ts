/**
 * Dashboard Workflow View Component
 * Simplified view of a workflow with execution history
 */

import { html, LitElement, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { getStudioUrl } from '../utils/route-sync';
import { getWorkflowService } from '../../../services/lazy-loader';
import type { ExecutionResult } from '../../../services/workflow.service';
import type { Workflow } from '../../runtime/components/ui/nuraly-ui/src/components/canvas/workflow-canvas.types';

// Import NuralyUI components
import '../../runtime/components/ui/nuraly-ui/src/components/button';
import '../../runtime/components/ui/nuraly-ui/src/components/badge';

@customElement('dashboard-workflow-view')
export class DashboardWorkflowView extends LitElement {
  static styles = css`
    :host {
      display: block;
      height: 100%;
      background: var(--nuraly-color-background, #f8fafc);
    }

    .workflow-view {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .workflow-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 24px;
      background: var(--nuraly-color-surface, #ffffff);
      border-bottom: 1px solid var(--nuraly-color-border, #e8e8f0);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .back-button {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      font-size: 13px;
      color: var(--nuraly-color-text-secondary, #5c5c7a);
      background: transparent;
      border: 1px solid var(--nuraly-color-border, #e8e8f0);
      border-radius: 6px;
      cursor: pointer;
      transition: all 150ms ease;
    }

    .back-button:hover {
      color: var(--nuraly-color-text, #0f0f3c);
      background: var(--nuraly-color-background-hover, #f1f5f9);
    }

    .back-button svg {
      width: 14px;
      height: 14px;
    }

    .workflow-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .workflow-name {
      font-size: 18px;
      font-weight: 600;
      color: var(--nuraly-color-text, #0f0f3c);
      margin: 0;
    }

    .workflow-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 13px;
      color: var(--nuraly-color-text-secondary, #5c5c7a);
    }

    .app-link {
      color: var(--nuraly-color-primary, #14144b);
      cursor: pointer;
      text-decoration: none;
    }

    .app-link:hover {
      text-decoration: underline;
    }

    .standalone-badge {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      background: var(--nuraly-color-primary-bg, #f0f0f8);
      color: var(--nuraly-color-primary, #14144b);
      font-size: 11px;
      font-weight: 500;
      border-radius: 4px;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }

    .workflow-content {
      flex: 1;
      display: flex;
      gap: 24px;
      padding: 24px;
      overflow: auto;
    }

    .content-main {
      flex: 2;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .content-sidebar {
      flex: 1;
      min-width: 280px;
      max-width: 360px;
    }

    /* Card styles */
    .card {
      background: var(--nuraly-color-surface, #ffffff);
      border-radius: 8px;
      border: 1px solid var(--nuraly-color-border, #e8e8f0);
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid var(--nuraly-color-border, #e8e8f0);
    }

    .card-title {
      font-size: 14px;
      font-weight: 500;
      color: var(--nuraly-color-text, #0f0f3c);
    }

    .card-content {
      padding: 16px;
    }

    /* Stats */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }

    .stat-item {
      text-align: center;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 600;
      color: var(--nuraly-color-text, #0f0f3c);
    }

    .stat-label {
      font-size: 12px;
      color: var(--nuraly-color-text-tertiary, #8c8ca8);
      margin-top: 4px;
    }

    /* Executions list */
    .execution-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid var(--nuraly-color-border-subtle, #f1f3f5);
    }

    .execution-item:last-child {
      border-bottom: none;
    }

    .execution-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .execution-id {
      font-size: 13px;
      font-weight: 500;
      color: var(--nuraly-color-text, #0f0f3c);
      font-family: var(--nuraly-font-mono, monospace);
    }

    .execution-time {
      font-size: 12px;
      color: var(--nuraly-color-text-tertiary, #8c8ca8);
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

    .empty-state {
      text-align: center;
      padding: 24px;
      color: var(--nuraly-color-text-secondary, #5c5c7a);
      font-size: 13px;
    }
  `;

  @property({ type: String }) workflowId: string = '';
  @property({ type: String }) appId: string | null = null;
  @property({ type: String }) appName: string | null = null;

  @state() private workflow: Workflow | null = null;
  @state() private executions: ExecutionResult[] = [];
  @state() private loading = true;

  async connectedCallback() {
    super.connectedCallback();
    await this.loadWorkflowData();
  }

  async updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('workflowId') && this.workflowId) {
      await this.loadWorkflowData();
    }
  }

  private async loadWorkflowData() {
    if (!this.workflowId) return;

    this.loading = true;
    try {
      // Lazy load workflow service
      const workflowService = await getWorkflowService();

      // Fetch workflow
      this.workflow = await workflowService.getWorkflow(this.workflowId);

      // Try to get executions
      try {
        this.executions = await workflowService.getExecutions(this.workflowId);
      } catch (e) {
        // Executions may not be available
        this.executions = [];
      }
    } catch (e) {
      console.error('[DashboardWorkflowView] Failed to load workflow:', e);
    } finally {
      this.loading = false;
    }
  }

  private openWorkflow() {
    // Opens in standalone editor (dashboard-based)
    window.location.href = `/dashboard/workflow/edit/${this.workflowId}`;
  }

  private openInStudio() {
    // Opens in studio (only available for app-attached workflows)
    if (this.appId) {
      window.location.href = `/app/studio/${this.appId}/workflows?workflow=${this.workflowId}`;
    }
  }

  private goBack() {
    this.dispatchEvent(new CustomEvent('navigate', {
      detail: { path: '/dashboard' },
      bubbles: true,
      composed: true
    }));
  }

  private navigateToApp() {
    if (!this.appId) return;

    this.dispatchEvent(new CustomEvent('navigate', {
      detail: { path: `/dashboard/app/${this.appId}` },
      bubbles: true,
      composed: true
    }));
  }

  private async runWorkflow() {
    if (!this.workflowId) return;

    try {
      // Lazy load workflow service
      const workflowService = await getWorkflowService();

      await workflowService.executeWorkflow(this.workflowId);
      // Refresh executions
      this.executions = await workflowService.getExecutions(this.workflowId);
    } catch (e) {
      console.error('[DashboardWorkflowView] Failed to run workflow:', e);
    }
  }

  private getStatusBadge(status: string) {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return html`<nr-badge status="success" text="Completed"></nr-badge>`;
      case 'failed':
      case 'error':
        return html`<nr-badge status="error" text="Failed"></nr-badge>`;
      case 'running':
      case 'in_progress':
        return html`<nr-badge status="processing" text="Running"></nr-badge>`;
      default:
        return html`<nr-badge status="default" text="${status}"></nr-badge>`;
    }
  }

  private formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  }

  render() {
    if (this.loading) {
      return html`
        <div class="workflow-view">
          <div class="loading-container">
            <div class="loading-spinner"></div>
          </div>
        </div>
      `;
    }

    return html`
      <div class="workflow-view">
        <div class="workflow-header">
          <div class="header-left">
            <button class="back-button" @click=${this.goBack}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back
            </button>
            <div class="workflow-info">
              <h2 class="workflow-name">${this.workflow?.name || 'Workflow'}</h2>
              <div class="workflow-meta">
                ${this.appId ? html`
                  <span class="app-link" @click=${this.navigateToApp}>
                    App: ${this.appName || 'Unknown'}
                  </span>
                ` : html`
                  <span class="standalone-badge">Standalone</span>
                `}
                <span>${this.workflow?.nodes?.length || 0} nodes</span>
              </div>
            </div>
          </div>
          <div class="header-actions">
            <nr-button type="default" size="small" iconLeft="Play" @click=${this.runWorkflow}>
              Run
            </nr-button>
            <nr-button type="primary" size="small" @click=${this.openWorkflow}>
              Open
            </nr-button>
            ${this.appId ? html`
              <nr-button type="default" size="small" @click=${this.openInStudio}>
                Open in Studio
              </nr-button>
            ` : nothing}
          </div>
        </div>

        <div class="workflow-content">
          <div class="content-main">
            <div class="card">
              <div class="card-header">
                <span class="card-title">Overview</span>
              </div>
              <div class="card-content">
                <div class="stats-grid">
                  <div class="stat-item">
                    <div class="stat-value">${this.workflow?.nodes?.length || 0}</div>
                    <div class="stat-label">Nodes</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">${this.workflow?.edges?.length || 0}</div>
                    <div class="stat-label">Connections</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">${this.executions.length}</div>
                    <div class="stat-label">Executions</div>
                  </div>
                </div>
              </div>
            </div>

            ${this.workflow?.description ? html`
              <div class="card">
                <div class="card-header">
                  <span class="card-title">Description</span>
                </div>
                <div class="card-content">
                  <p>${this.workflow.description}</p>
                </div>
              </div>
            ` : nothing}
          </div>

          <div class="content-sidebar">
            <div class="card">
              <div class="card-header">
                <span class="card-title">Recent Executions</span>
              </div>
              <div class="card-content">
                ${this.executions.length === 0 ? html`
                  <div class="empty-state">No executions yet</div>
                ` : this.executions.slice(0, 10).map(exec => html`
                  <div class="execution-item">
                    <div class="execution-info">
                      <span class="execution-id">${exec.id.slice(0, 8)}...</span>
                      <span class="execution-time">${this.formatDate(exec.startedAt)}</span>
                    </div>
                    ${this.getStatusBadge(exec.status)}
                  </div>
                `)}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dashboard-workflow-view': DashboardWorkflowView;
  }
}
