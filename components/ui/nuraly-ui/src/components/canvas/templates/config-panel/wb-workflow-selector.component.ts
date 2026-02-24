/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

interface WorkflowListItem {
  id: string;
  name: string;
  description?: string;
  nodeCount: number;
}

/**
 * Workflow selector component for the whiteboard workflow preview node.
 * Fetches available workflows from the API and lets the user pick one.
 *
 * @element wb-workflow-selector
 * @fires workflow-select - When a workflow is selected or cleared
 */
@customElement('wb-workflow-selector')
export class WbWorkflowSelectorElement extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-family: var(--nuraly-font-family, system-ui, sans-serif);
    }

    .workflow-select {
      width: 100%;
      padding: 6px 8px;
      border: 1px solid var(--nuraly-color-border-subtle, #3a3a3a);
      border-radius: 4px;
      background: var(--nuraly-color-layer-01, rgba(255, 255, 255, 0.05));
      color: var(--nuraly-color-text, #e5e5e5);
      font-size: 13px;
      font-family: inherit;
      cursor: pointer;
    }

    .workflow-select:focus {
      outline: none;
      border-color: var(--nuraly-color-interactive, #3b82f6);
    }

    .workflow-select option {
      background: var(--nuraly-color-layer-01, #1a1a1a);
      color: var(--nuraly-color-text, #e5e5e5);
    }

    .loading {
      font-size: 12px;
      color: var(--nuraly-color-text-secondary, #888);
      padding: 6px 0;
    }

    .error-container {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .error {
      font-size: 12px;
      color: var(--nuraly-color-danger, #ef4444);
    }

    .retry-btn {
      background: none;
      border: 1px solid var(--nuraly-color-border-subtle, #3a3a3a);
      border-radius: 4px;
      color: var(--nuraly-color-text-secondary, #888);
      font-size: 11px;
      padding: 4px 8px;
      cursor: pointer;
      font-family: inherit;
      align-self: flex-start;
    }

    .retry-btn:hover {
      color: var(--nuraly-color-text, #e5e5e5);
      border-color: var(--nuraly-color-interactive, #3b82f6);
    }
  `;

  @property({ type: String })
  selectedWorkflowId = '';

  @state()
  private _workflows: WorkflowListItem[] = [];

  @state()
  private _loading = false;

  @state()
  private _error = '';

  override connectedCallback() {
    super.connectedCallback();
    this._fetchWorkflows();
  }

  private async _fetchWorkflows() {
    this._loading = true;
    this._error = '';
    try {
      const response = await fetch('/api/v1/workflows');
      if (!response.ok) throw new Error(`Failed to load workflows (${response.status})`);
      const data: Array<{ id: string; name: string; description?: string; nodes?: unknown[] }> =
        await response.json();
      this._workflows = data
        .filter(w => !((w as any).isTemplate))
        .map(w => ({
          id: w.id,
          name: w.name,
          description: w.description,
          nodeCount: w.nodes?.length || 0,
        }));
    } catch (e) {
      this._error = (e as Error).message;
    } finally {
      this._loading = false;
    }
  }

  private async _handleSelect(e: Event) {
    const select = e.target as HTMLSelectElement;
    const workflowId = select.value;

    if (!workflowId) {
      this.dispatchEvent(new CustomEvent('workflow-select', {
        detail: { workflowId: '', workflowName: '', workflowSteps: [] },
        bubbles: true,
        composed: true,
      }));
      return;
    }

    // Fetch the full workflow to get its nodes
    try {
      const response = await fetch(`/api/v1/workflows/${workflowId}`);
      if (!response.ok) throw new Error('Failed to load workflow details');
      const dto: { id: string; name: string; nodes?: Array<{ name: string; type: string }> } =
        await response.json();

      const steps = (dto.nodes || []).map(n => ({
        name: n.name,
        type: n.type,
      }));

      this.dispatchEvent(new CustomEvent('workflow-select', {
        detail: {
          workflowId: dto.id,
          workflowName: dto.name,
          workflowSteps: steps,
        },
        bubbles: true,
        composed: true,
      }));
    } catch (e) {
      this._error = (e as Error).message;
    }
  }

  override render() {
    if (this._loading) {
      return html`<div class="loading">Loading workflows...</div>`;
    }

    if (this._error) {
      return html`
        <div class="error-container">
          <span class="error">${this._error}</span>
          <button class="retry-btn" @click=${() => this._fetchWorkflows()}>Retry</button>
        </div>
      `;
    }

    if (this._workflows.length === 0) {
      return html`<div class="loading">No workflows found.</div>`;
    }

    return html`
      <select class="workflow-select" @change=${this._handleSelect}>
        <option value="">Select a workflow...</option>
        ${this._workflows.map(w => html`
          <option value=${w.id} ?selected=${w.id === this.selectedWorkflowId}>
            ${w.name}${w.nodeCount > 0 ? ` (${w.nodeCount} nodes)` : ''}
          </option>
        `)}
      </select>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wb-workflow-selector': WbWorkflowSelectorElement;
  }
}
