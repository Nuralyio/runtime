/**
 * Dashboard Workflow View Component
 * Simplified view of a workflow with execution history
 */

import { html, LitElement, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { getWorkflowService } from '../../../services/lazy-loader';
import type { ExecutionResult } from '../../../services/workflow.service';
import type { Workflow } from '../../runtime/components/ui/nuraly-ui/src/components/canvas/workflow-canvas.types';
import { focusAndSelectAll, handlePlainTextPaste, getInputText, handleNameFieldBlur, handleNameFieldKeydown } from '../utils/inline-edit.utils';

// Import NuralyUI components
import '../../runtime/components/ui/nuraly-ui/src/components/button';
import '../../runtime/components/ui/nuraly-ui/src/components/badge';
import '../../runtime/components/ui/nuraly-ui/src/components/icon';
import '../../runtime/components/ui/nuraly-ui/src/components/input';
import '../../runtime/components/ui/nuraly-ui/src/components/select';
import '../../runtime/components/ui/nuraly-ui/src/components/table';
import type { IHeader } from '../../runtime/components/ui/nuraly-ui/src/components/table/table.types';

@customElement('dashboard-workflow-view')
export class DashboardWorkflowView extends LitElement {
  static readonly styles = css`
    :host {
      display: block;
      height: 100%;
      overflow: hidden;
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
      padding: 11px 24px;
      background: var(--nuraly-color-surface, #ffffff);
      border-bottom: 1px solid var(--nuraly-color-border, #e8e8f0);
      min-width: 0;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
      min-width: 0;
    }

    .workflow-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .workflow-name-container {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .workflow-name {
      font-size: 18px;
      font-weight: 600;
      color: var(--nuraly-color-text, #0f0f3c);
      margin: 0;
      outline: none;
      border-radius: 4px;
      padding: 2px 6px;
      margin: -2px -6px;
      transition: background 150ms ease;
      min-width: 50px;
      display: inline-block;
    }

    .workflow-name.editing {
      background: var(--nuraly-color-background-hover, #f1f5f9);
      box-shadow: 0 0 0 2px var(--nuraly-color-primary, #14144b);
    }

    h2.workflow-name:hover {
      background: var(--nuraly-color-background-hover, #f1f5f9);
      cursor: text;
    }

    .workflow-name-container:hover .edit-icon {
      opacity: 1;
    }

    .edit-icon {
      opacity: 0;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: all 150ms ease;
      --nuraly-icon-size: 14px;
      --nuraly-icon-color: var(--nuraly-color-text-tertiary, #8c8ca8);
    }

    .edit-icon:hover {
      background: var(--nuraly-color-background-hover, #f1f5f9);
      --nuraly-icon-color: var(--nuraly-color-text, #0f0f3c);
    }

    .edit-actions {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-left: 8px;
    }

    .action-icon {
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: all 150ms ease;
      --nuraly-icon-size: 16px;
    }

    .action-icon.save {
      --nuraly-icon-color: var(--nuraly-color-success, #22c55e);
    }

    .action-icon.save:hover {
      background: var(--nuraly-color-success-light, #dcfce7);
    }

    .action-icon.cancel {
      --nuraly-icon-color: var(--nuraly-color-text-tertiary, #8c8ca8);
    }

    .action-icon.cancel:hover {
      background: var(--nuraly-color-background-hover, #f1f5f9);
      --nuraly-icon-color: var(--nuraly-color-text, #0f0f3c);
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
      padding: 24px;
      overflow: auto;
    }

    .content-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-width: 960px;
      margin: 0 auto;
      width: 100%;
      min-width: 0;
    }

    /* Card styles */
    .card {
      background: var(--nuraly-color-surface, #ffffff);
      border-radius: 8px;
      border: 1px solid var(--nuraly-color-border, #e8e8f0);
      overflow-x: hidden;
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

    /* Filter bar */
    .filter-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      border-bottom: 1px solid var(--nuraly-color-border, #e8e8f0);
    }

    .filter-bar label {
      font-size: 13px;
      color: var(--nuraly-color-text-secondary, #5c5c7a);
    }

    @media (max-width: 768px) {
      .workflow-header {
        padding: 11px 16px;
      }

      .workflow-content {
        padding: 16px;
      }

      .header-actions {
        gap: 4px;
      }
    }

  `;

  @property({ type: String }) workflowId: string = '';
  @property({ type: String }) appId: string | null = null;
  @property({ type: String }) appName: string | null = null;

  @state() private workflow: Workflow | null = null;
  @state() private executions: ExecutionResult[] = [];
  @state() private loading = true;
  @state() private isEditingName = false;
  @state() private editedName = '';
  @state() private isSavingName = false;
  @state() private statusFilter = 'all';

  async updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('workflowId') && this.workflowId) {
      this.loadWorkflowData();
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
      } catch (execError) {
        console.warn('[DashboardWorkflowView] Executions not available:', execError);
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
    globalThis.location.href = `/dashboard/workflow/edit/${this.workflowId}`;
  }

  private openInStudio() {
    // Opens in studio (only available for app-attached workflows)
    if (this.appId) {
      globalThis.location.href = `/app/studio/${this.appId}/workflows?workflow=${this.workflowId}`;
    }
  }

  private goBack() {
    const path = this.appId ? `/dashboard/app/${this.appId}` : '/dashboard';
    this.dispatchEvent(new CustomEvent('navigate', {
      detail: { path },
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

  private get filteredExecutions(): ExecutionResult[] {
    if (this.statusFilter === 'all') return this.executions;
    return this.executions.filter(e => {
      const s = e.status.toLowerCase();
      switch (this.statusFilter) {
        case 'completed': return s === 'completed' || s === 'success';
        case 'failed': return s === 'failed' || s === 'error';
        case 'running': return s === 'running' || s === 'in_progress';
        case 'cancelled': return s === 'cancelled';
        default: return true;
      }
    });
  }

  private handleStatusFilterChange(e: CustomEvent) {
    this.statusFilter = e.detail.value;
  }

  private navigateToExecution(execId: string) {
    this.dispatchEvent(new CustomEvent('navigate', {
      detail: { path: `/dashboard/workflow/${this.workflowId}/execution/${execId}` },
      bubbles: true,
      composed: true
    }));
  }

  private formatDuration(ms?: number): string {
    if (ms == null) return '-';
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
  }

  private formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  }

  private getExecutionHeaders(): IHeader[] {
    return [
      {
        name: 'ID',
        key: 'id',
        width: 100,
        fixed: 'left',
        render: (value: string) => html`<span style="font-family:var(--nuraly-font-mono,monospace);font-weight:500">${value.slice(0, 8)}</span>`,
      },
      {
        name: 'Started',
        key: 'startedAt',
        render: (value: string) => html`${this.formatDate(value)}`,
      },
      {
        name: 'Duration',
        key: 'durationMs',
        width: 100,
        render: (value: number) => html`${this.formatDuration(value)}`,
      },
      {
        name: 'Status',
        key: 'status',
        width: 120,
        render: (value: string) => this.getStatusBadge(value),
      },
      {
        name: 'Trigger',
        key: 'triggerType',
        width: 100,
        render: (value: string) => html`<span style="text-transform:capitalize">${value || 'manual'}</span>`,
      },
      {
        name: '',
        key: '_view',
        width: 50,
        fixed: 'right',
        render: () => html`<nr-icon name="eye" style="--nuraly-icon-size:16px;--nuraly-icon-color:var(--nuraly-color-text-tertiary,#8c8ca8)"></nr-icon>`,
      },
    ];
  }

  private startEditingName() {
    this.editedName = this.workflow?.name || '';
    this.isEditingName = true;
    this.updateComplete.then(() => {
      const element = this.shadowRoot?.querySelector('.workflow-name.editing') as HTMLElement;
      if (element) focusAndSelectAll(element, this.editedName);
    });
  }

  private cancelEditingName() {
    this.isEditingName = false;
    this.editedName = '';
  }

  private handleNameInput(e: Event) {
    this.editedName = getInputText(e);
  }

  private handleNameBlur(e: FocusEvent) {
    handleNameFieldBlur(e, this.isEditingName, () => this.saveWorkflowName());
  }

  private handleNameKeydown(e: KeyboardEvent) {
    handleNameFieldKeydown(e, this.isEditingName, () => this.saveWorkflowName(), () => this.cancelEditingName());
  }

  private handlePaste(e: ClipboardEvent) {
    handlePlainTextPaste(e);
  }

  private async saveWorkflowName() {
    if (!this.workflow || !this.editedName.trim() || this.editedName === this.workflow.name) {
      this.cancelEditingName();
      return;
    }

    this.isSavingName = true;
    try {
      const workflowService = await getWorkflowService();
      await workflowService.patchWorkflow(this.workflowId, { name: this.editedName.trim() });

      // Update local state
      this.workflow = { ...this.workflow, name: this.editedName.trim() };
      this.isEditingName = false;
    } catch (e) {
      console.error('[DashboardWorkflowView] Failed to save workflow name:', e);
    } finally {
      this.isSavingName = false;
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
            <nr-button size="small" variant="secondary" @click=${this.goBack}>
              <nr-icon slot="prefix" name="arrow-left" size="small"></nr-icon>
              Back
            </nr-button>
            <div class="workflow-info">
              <div class="workflow-name-container">
                ${this.isEditingName ? html`
                  <span
                    class="workflow-name editing"
                    contenteditable="true"
                    @blur=${this.handleNameBlur}
                    @keydown=${this.handleNameKeydown}
                    @input=${this.handleNameInput}
                    @paste=${this.handlePaste}
                  ></span>
                  <nr-icon
                    name="check"
                    class="action-icon save"
                    title="Save"
                    @click=${this.saveWorkflowName}
                  ></nr-icon>
                  <nr-icon
                    name="x"
                    class="action-icon cancel"
                    title="Cancel"
                    @click=${this.cancelEditingName}
                  ></nr-icon>
                ` : html`
                  <h2 class="workflow-name" @click=${this.startEditingName}>${this.workflow?.name || 'Workflow'}</h2>
                  <nr-icon
                    name="pencil"
                    class="edit-icon"
                    title="Edit name"
                    @click=${this.startEditingName}
                  ></nr-icon>
                `}
              </div>
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

            <div class="card">
              <div class="card-header">
                <span class="card-title">Execution History</span>
              </div>
              <div class="filter-bar">
                <label>Status:</label>
                <nr-select
                  size="small"
                  .value=${this.statusFilter}
                  .options=${[
                    { label: 'All', value: 'all' },
                    { label: 'Completed', value: 'completed' },
                    { label: 'Failed', value: 'failed' },
                    { label: 'Running', value: 'running' },
                    { label: 'Cancelled', value: 'cancelled' },
                  ]}
                  @nr-change=${this.handleStatusFilterChange}
                ></nr-select>
              </div>
              ${this.executions.length === 0 ? html`
                <div class="empty-state">
                  No executions yet. Run the workflow to see results here.
                </div>
              ` : html`
                <nr-table
                  .headers=${this.getExecutionHeaders()}
                  .rows=${this.filteredExecutions}
                  size="small"
                  clickable
                  pageSize=${10}
                  .scrollConfig=${{ x: 600 }}
                  emptyText="No executions match the selected filter."
                  @nr-row-click=${(e: CustomEvent) => this.navigateToExecution(e.detail.row.id)}
                ></nr-table>
              `}
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
