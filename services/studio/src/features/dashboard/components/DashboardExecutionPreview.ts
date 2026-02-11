/**
 * Dashboard Execution Preview Component
 * Read-only canvas preview with per-node execution states
 */

import { html, LitElement, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { getWorkflowService } from '../../../services/lazy-loader';
import type { ExecutionResult, NodeExecutionDTO } from '../../../services/workflow.service';
import type { Workflow } from '../../runtime/components/ui/nuraly-ui/src/components/canvas/workflow-canvas.types';

// Import canvas and UI components
import '../../runtime/components/ui/nuraly-ui/src/components/canvas/workflow-canvas.component';
import '../../runtime/components/ui/nuraly-ui/src/components/button';
import '../../runtime/components/ui/nuraly-ui/src/components/badge';
import '../../runtime/components/ui/nuraly-ui/src/components/icon';

@customElement('dashboard-execution-preview')
export class DashboardExecutionPreview extends LitElement {
  static styles = css`
    :host {
      display: block;
      height: 100%;
      background: var(--nuraly-color-background, #f8fafc);
    }

    .preview-view {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .preview-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 11px 24px;
      background: var(--nuraly-color-surface, #ffffff);
      border-bottom: 1px solid var(--nuraly-color-border, #e8e8f0);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .header-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .header-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .workflow-name {
      font-size: 18px;
      font-weight: 600;
      color: var(--nuraly-color-text, #0f0f3c);
      margin: 0;
    }

    .header-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 13px;
      color: var(--nuraly-color-text-secondary, #5c5c7a);
    }

    .execution-banner {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 8px 16px;
      background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%);
      color: white;
      font-size: 13px;
      font-weight: 500;
    }

    .banner-icon {
      --nuraly-icon-size: 16px;
      --nuraly-icon-color: white;
    }

    .canvas-container {
      flex: 1;
      min-height: 0;
      position: relative;
    }

    .canvas-container workflow-canvas {
      width: 100%;
      height: 100%;
    }

    /* Loading */
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
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

    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      gap: 12px;
      color: var(--nuraly-color-text-secondary, #5c5c7a);
    }
  `;

  @property({ type: String }) workflowId: string = '';
  @property({ type: String }) executionId: string = '';

  @state() private workflow: Workflow | null = null;
  @state() private execution: ExecutionResult | null = null;
  @state() private nodeStatuses: Record<string, string> = {};
  @state() private loading = true;
  @state() private error: string | null = null;

  async connectedCallback() {
    super.connectedCallback();
    await this.loadData();
  }

  async updated(changedProperties: Map<string, any>) {
    if ((changedProperties.has('workflowId') || changedProperties.has('executionId')) && this.workflowId && this.executionId) {
      await this.loadData();
    }
  }

  private async loadData() {
    if (!this.workflowId || !this.executionId) return;

    this.loading = true;
    this.error = null;

    try {
      const workflowService = await getWorkflowService();

      const [workflow, execution, nodeExecutions] = await Promise.all([
        workflowService.getWorkflow(this.workflowId),
        workflowService.getExecution(this.workflowId, this.executionId),
        workflowService.getNodeExecutions(this.workflowId, this.executionId),
      ]);

      this.workflow = workflow;
      this.execution = execution;

      // Build nodeStatuses map: nodeId → status
      const statuses: Record<string, string> = {};
      for (const ne of nodeExecutions) {
        statuses[ne.nodeId] = ne.status;
      }
      this.nodeStatuses = statuses;
    } catch (e) {
      console.error('[DashboardExecutionPreview] Failed to load data:', e);
      this.error = 'Failed to load execution data';
    } finally {
      this.loading = false;
    }
  }

  private goBack() {
    this.dispatchEvent(new CustomEvent('navigate', {
      detail: { path: `/dashboard/workflow/${this.workflowId}` },
      bubbles: true,
      composed: true
    }));
  }

  private getStatusBadge(status: string) {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'success':
        return html`<nr-badge status="success" text="Completed"></nr-badge>`;
      case 'failed':
      case 'error':
        return html`<nr-badge status="error" text="Failed"></nr-badge>`;
      case 'running':
      case 'in_progress':
        return html`<nr-badge status="processing" text="Running"></nr-badge>`;
      case 'cancelled':
        return html`<nr-badge status="default" text="Cancelled"></nr-badge>`;
      default:
        return html`<nr-badge status="default" text="${status || 'Unknown'}"></nr-badge>`;
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

  private formatDuration(ms?: number): string {
    if (ms == null) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
  }

  render() {
    if (this.loading) {
      return html`
        <div class="preview-view">
          <div class="loading-container">
            <div class="loading-spinner"></div>
          </div>
        </div>
      `;
    }

    if (this.error) {
      return html`
        <div class="preview-view">
          <div class="error-container">
            <p>${this.error}</p>
            <nr-button size="small" @click=${this.goBack}>Back to Workflow</nr-button>
          </div>
        </div>
      `;
    }

    return html`
      <div class="preview-view">
        <div class="preview-header">
          <div class="header-left">
            <nr-button size="small" variant="secondary" @click=${this.goBack}>
              <nr-icon slot="prefix" name="arrow-left" size="small"></nr-icon>
              Back to Workflow
            </nr-button>
            <div class="header-info">
              <div class="header-title">
                <h2 class="workflow-name">${this.workflow?.name || 'Workflow'}</h2>
                ${this.execution ? this.getStatusBadge(this.execution.status) : nothing}
              </div>
              <div class="header-meta">
                <span>Execution ${this.executionId.slice(0, 8)}...</span>
                <span>${this.formatDate(this.execution?.startedAt)}</span>
                ${this.execution?.durationMs != null ? html`
                  <span>${this.formatDuration(this.execution.durationMs)}</span>
                ` : nothing}
              </div>
            </div>
          </div>
        </div>

        <div class="execution-banner">
          <nr-icon class="banner-icon" name="eye"></nr-icon>
          Execution Preview — Read Only
        </div>

        <div class="canvas-container">
          <workflow-canvas
            .workflow=${this.workflow}
            .nodeStatuses=${this.nodeStatuses}
            .readonly=${true}
            .executionId=${this.executionId}
          ></workflow-canvas>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dashboard-execution-preview': DashboardExecutionPreview;
  }
}
