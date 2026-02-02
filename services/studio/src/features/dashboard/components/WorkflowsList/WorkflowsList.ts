/**
 * Workflows List Component
 * Displays a table of workflows across all applications
 * Supports creating new workflows (standalone or attached to an app)
 */

import { html, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import styles from './WorkflowsList.style';
import { formatDate, toggleWorkflowPinned, type WorkflowWithAppName, type ApplicationWithStatus } from '../../services/dashboard.service';
import { workflowService } from '../../../../services/workflow.service';
import type { IHeader } from '../../../runtime/components/ui/nuraly-ui/src/components/table/table.types';

// Import NuralyUI components
import '../../../runtime/components/ui/nuraly-ui/src/components/button';
import '../../../runtime/components/ui/nuraly-ui/src/components/badge';
import '../../../runtime/components/ui/nuraly-ui/src/components/table';
import '../../../runtime/components/ui/nuraly-ui/src/components/dropdown';
import '../../../runtime/components/ui/nuraly-ui/src/components/input';
import '../../../runtime/components/ui/nuraly-ui/src/components/select';
import '../../../runtime/components/ui/nuraly-ui/src/components/tag';
import '../../../runtime/components/ui/nuraly-ui/src/components/card';
import '../../../runtime/components/ui/nuraly-ui/src/components/icon';

@customElement('workflows-list')
export class WorkflowsList extends LitElement {
  static styles = styles;

  @property({ type: Array }) workflows: WorkflowWithAppName[] = [];
  @property({ type: Array }) applications: ApplicationWithStatus[] = [];

  @state() private showCreateDropdown = false;
  @state() private isCreating = false;
  @state() private workflowName = '';

  private get pinnedWorkflows(): WorkflowWithAppName[] {
    return this.workflows.filter(w => w.isPinned);
  }

  private get unpinnedWorkflows(): WorkflowWithAppName[] {
    return this.workflows.filter(w => !w.isPinned);
  }

  private getTableHeaders(): IHeader[] {
    return [
      {
        name: '',
        key: 'isPinned',
        width: 40,
        render: (_value: boolean, row: WorkflowWithAppName) => html`
          <nr-icon
            name="star"
            class="pin-icon ${row.isPinned ? 'pinned' : ''}"
            title=${row.isPinned ? 'Unpin workflow' : 'Pin workflow'}
            @click=${(e: Event) => this.handlePin(e, row)}
          ></nr-icon>
        `,
      },
      {
        name: 'Name',
        key: 'name',
        render: (value: string) => html`<span class="workflow-name">${value}</span>`,
      },
      {
        name: 'Application',
        key: 'applicationName',
        render: (value: string) => html`<span class="workflow-app">${value || 'Unknown'}</span>`,
      },
      {
        name: 'Status',
        key: 'status',
        render: (value: string) => html`
          <span class="status-badge ${value === 'active' ? 'active' : 'inactive'}">
            <span class="status-dot"></span>
            ${value === 'active' ? 'Active' : 'Inactive'}
          </span>
        `,
      },
      {
        name: 'Last Updated',
        key: 'updatedAt',
        render: (value: string) => html`<span class="date-text">${formatDate(value)}</span>`,
      },
      {
        name: 'Actions',
        key: 'actions',
        width: 150,
        render: (_value: any, row: WorkflowWithAppName) => html`
          <div class="actions-cell">
            <nr-button
              type="default"
              size="small"
              iconLeft="Play"
              title="Run workflow"
              @click=${(e: Event) => this.handleRun(e, row)}
            >Run</nr-button>
            <nr-button
              type="default"
              size="small"
              iconLeft="Pencil"
              title="Edit workflow"
              @click=${(e: Event) => this.handleEdit(e, row)}
            >Edit</nr-button>
          </div>
        `,
      },
    ];
  }

  private handleRowClick(workflow: WorkflowWithAppName) {
    // Navigate to workflow dashboard view
    window.location.href = `/dashboard/workflow/${workflow.uuid}`;
  }

  private handleEdit(e: Event, workflow: WorkflowWithAppName) {
    e.stopPropagation();
    // Navigate to workflow editor in studio (requires applicationId)
    if (workflow.applicationId) {
      window.location.href = `/app/studio/${workflow.applicationId}/workflows?workflow=${workflow.uuid}`;
    } else {
      // Standalone workflow - go to dashboard view
      window.location.href = `/dashboard/workflow/${workflow.uuid}`;
    }
  }

  private handleRun(e: Event, workflow: WorkflowWithAppName) {
    e.stopPropagation();
    // Dispatch event to run workflow
    this.dispatchEvent(new CustomEvent('run-workflow', {
      detail: { workflowId: workflow.uuid },
      bubbles: true,
      composed: true
    }));
  }

  private handlePin(e: Event, workflow: WorkflowWithAppName) {
    e.stopPropagation();
    const newPinnedStatus = toggleWorkflowPinned(workflow.uuid);

    // Create new array with updated workflow (triggers Lit reactivity)
    this.workflows = this.workflows.map(w =>
      w.uuid === workflow.uuid
        ? { ...w, isPinned: newPinnedStatus }
        : w
    );
  }

  private closeCreateDropdown() {
    this.showCreateDropdown = false;
    this.workflowName = '';
  }

  private handleNameInput(e: CustomEvent) {
    this.workflowName = e.detail?.value || (e.target as HTMLInputElement)?.value || '';
  }

  private async handleCreateWorkflow() {
    const name = this.workflowName.trim();
    if (!name) return;

    // Get selected application (optional)
    const select = this.shadowRoot?.querySelector('nr-select') as any;
    const applicationId = select?.value || '';

    this.isCreating = true;
    try {
      const workflow = await workflowService.createWorkflow(
        applicationId,
        name
      );

      this.closeCreateDropdown();

      // Dispatch event to refresh the list
      this.dispatchEvent(new CustomEvent('refresh', {
        bubbles: true,
        composed: true
      }));

      // Navigate to the new workflow
      const appId = applicationId || workflow.applicationId;
      const workflowUuid = workflow.uuid || workflow.id;
      if (appId) {
        window.location.href = `/app/studio/${appId}/workflows?workflow=${workflowUuid}`;
      } else {
        window.location.href = `/dashboard/workflow/${workflowUuid}`;
      }
    } catch (error) {
      console.error('Failed to create workflow:', error);
    } finally {
      this.isCreating = false;
    }
  }

  private getAppOptions() {
    return this.applications.map(app => ({
      value: app.uuid,
      label: app.name
    }));
  }

  private renderEmptyState() {
    return html`
      <div class="empty-state">
        <svg class="empty-state-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
        <h3 class="empty-state-title">No workflows yet</h3>
        <p class="empty-state-description">
          Create workflows in your applications to automate processes and handle events.
        </p>
        <div style="margin-top: 16px;">
          ${this.renderCreateButton()}
        </div>
      </div>
    `;
  }

  private renderCreateButton() {
    return html`
      <nr-dropdown
        trigger="click"
        placement="bottom-end"
        ?open=${this.showCreateDropdown}
        @nr-dropdown-open=${() => this.showCreateDropdown = true}
        @nr-dropdown-close=${this.closeCreateDropdown}
        close-on-outside-click
        close-on-escape
        min-width="320px"
        allow-overflow
      >
        <nr-button
          slot="trigger"
          type="primary"
          size="small"
          iconLeft="Plus"
        >Create Workflow</nr-button>
        <div slot="content" class="create-workflow-form">
          <div class="dropdown-form-header">New Workflow</div>
          <div class="form-field">
            <label class="form-label">Name</label>
            <nr-input
              placeholder="Enter workflow name"
              size="small"
              .value=${this.workflowName}
              @nr-input=${this.handleNameInput}
            ></nr-input>
          </div>
          <div class="form-field">
            <label class="form-label">Application <span class="optional-label">(optional)</span></label>
            <nr-select
              placeholder="Select application"
              size="small"
              .options=${this.getAppOptions()}
            ></nr-select>
          </div>
          <div class="dropdown-form-actions">
            <nr-button type="default" size="small" @click=${this.closeCreateDropdown}>Cancel</nr-button>
            <nr-button
              type="primary"
              size="small"
              ?disabled=${!this.workflowName.trim() || this.isCreating}
              @click=${this.handleCreateWorkflow}
            >${this.isCreating ? 'Creating...' : 'Create'}</nr-button>
          </div>
        </div>
      </nr-dropdown>
    `;
  }

  private renderWorkflowCard(workflow: WorkflowWithAppName) {
    return html`
      <nr-card @click=${() => this.handleRowClick(workflow)}>
        <div slot="content">
          <div class="card-header">
            <h3 class="card-name" title=${workflow.name}>${workflow.name}</h3>
            <nr-icon
              name="star"
              class="unpin-icon"
              title="Unpin workflow"
              @click=${(e: Event) => this.handlePin(e, workflow)}
            ></nr-icon>
          </div>

          <div class="card-meta">
            <span class="workflow-app">${workflow.applicationName || 'Unknown'}</span>
            <span class="status-badge ${workflow.status === 'active' ? 'active' : 'inactive'}">
              <span class="status-dot"></span>
              ${workflow.status === 'active' ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div class="card-footer">
            <div class="meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>${formatDate(workflow.updatedAt)}</span>
            </div>

            <div class="card-actions">
              <nr-button type="default" size="small" iconLeft="Play" @click=${(e: Event) => this.handleRun(e, workflow)}>
                Run
              </nr-button>
              <nr-button type="primary" size="small" iconLeft="Pencil" @click=${(e: Event) => this.handleEdit(e, workflow)}>
                Edit
              </nr-button>
            </div>
          </div>
        </div>
      </nr-card>
    `;
  }

  private renderPinnedCards(workflows: WorkflowWithAppName[]) {
    if (workflows.length === 0) return nothing;

    return html`
      <div class="pinned-grid">
        ${workflows.map(workflow => this.renderWorkflowCard(workflow))}
      </div>
    `;
  }

  private renderWorkflowsTable(workflows: WorkflowWithAppName[]) {
    if (workflows.length === 0) return nothing;

    return html`
      <div class="table-container">
        <nr-table
          .headers=${this.getTableHeaders()}
          .rows=${workflows}
          size="small"
          emptyText="No workflows found"
          clickable
          @nr-row-click=${(e: CustomEvent) => this.handleRowClick(e.detail.row)}
        ></nr-table>
      </div>
    `;
  }

  private renderSection(title: string, workflows: WorkflowWithAppName[], status: 'success' | 'warning' | 'default', asCards = false) {
    if (workflows.length === 0) return nothing;

    return html`
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">${title}</h2>
          <nr-tag size="small" status=${status}>${workflows.length}</nr-tag>
        </div>
        ${asCards ? this.renderPinnedCards(workflows) : this.renderWorkflowsTable(workflows)}
      </div>
    `;
  }

  render() {
    const pinned = this.pinnedWorkflows;
    const unpinned = this.unpinnedWorkflows;
    const hasPinned = pinned.length > 0;

    return html`
      ${this.workflows.length === 0
        ? this.renderEmptyState()
        : html`
            <div class="list-header">
              ${this.renderCreateButton()}
            </div>
            <div class="sections-container">
              ${hasPinned ? html`
                ${this.renderSection('Pinned', pinned, 'success', true)}
                ${this.renderSection('Workflows', unpinned, 'default', false)}
              ` : html`
                ${this.renderWorkflowsTable(this.workflows)}
              `}
            </div>
          `
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'workflows-list': WorkflowsList;
  }
}
