/**
 * Workflows List Component
 * Displays a table of workflows across all applications
 */

import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import styles from './WorkflowsList.style';
import { formatDate, type WorkflowWithAppName } from '../../services/dashboard.service';

// Import NuralyUI components
import '../../../runtime/components/ui/nuraly-ui/src/components/button';
import '../../../runtime/components/ui/nuraly-ui/src/components/badge';
import '../../../runtime/components/ui/nuraly-ui/src/components/table';

@customElement('workflows-list')
export class WorkflowsList extends LitElement {
  static styles = styles;

  @property({ type: Array }) workflows: WorkflowWithAppName[] = [];

  private handleRowClick(workflow: WorkflowWithAppName) {
    // Navigate to workflow editor
    window.location.href = `/app/studio/${workflow.applicationId}?workflow=${workflow.id}`;
  }

  private handleEdit(e: Event, workflow: WorkflowWithAppName) {
    e.stopPropagation();
    window.location.href = `/app/studio/${workflow.applicationId}?workflow=${workflow.id}`;
  }

  private handleRun(e: Event, workflow: WorkflowWithAppName) {
    e.stopPropagation();
    // Dispatch event to run workflow
    this.dispatchEvent(new CustomEvent('run-workflow', {
      detail: { workflowId: workflow.id },
      bubbles: true,
      composed: true
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
      </div>
    `;
  }

  render() {
    return html`
      ${this.workflows.length === 0
        ? this.renderEmptyState()
        : html`
            <table class="workflows-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Application</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                  <th style="text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${this.workflows.map(workflow => html`
                  <tr @click=${() => this.handleRowClick(workflow)}>
                    <td>
                      <span class="workflow-name">${workflow.name}</span>
                    </td>
                    <td>
                      <span class="workflow-app">${workflow.applicationName || 'Unknown'}</span>
                    </td>
                    <td>
                      <nr-badge
                        status=${workflow.status === 'active' ? 'success' : 'warning'}
                        text=${workflow.status === 'active' ? 'Active' : 'Inactive'}
                      ></nr-badge>
                    </td>
                    <td>${formatDate(workflow.updatedAt)}</td>
                    <td>
                      <div class="actions-cell">
                        <nr-button
                          type="default"
                          size="small"
                          iconLeft="Play"
                          title="Run workflow"
                          @click=${(e: Event) => this.handleRun(e, workflow)}
                        >Run</nr-button>
                        <nr-button
                          type="default"
                          size="small"
                          iconLeft="Pencil"
                          title="Edit workflow"
                          @click=${(e: Event) => this.handleEdit(e, workflow)}
                        >Edit</nr-button>
                      </div>
                    </td>
                  </tr>
                `)}
              </tbody>
            </table>
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
