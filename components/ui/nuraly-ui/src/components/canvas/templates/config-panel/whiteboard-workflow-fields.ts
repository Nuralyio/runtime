/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, nothing, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../workflow-canvas.types.js';

/**
 * Render WB_WORKFLOW node specific configuration fields
 */
export function renderWhiteboardWorkflowFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  const workflowId = (config.workflowId as string) || '';
  const workflowName = (config.workflowName as string) || 'Workflow';
  const steps = (config.workflowSteps as Array<{ name: string; type: string }>) || [];

  return html`
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Workflow Settings</span>
      </div>

      <div class="config-field">
        <label>Workflow Name</label>
        <input
          type="text"
          class="config-input"
          .value=${workflowName}
          @input=${(e: InputEvent) => onUpdate('workflowName', (e.target as HTMLInputElement).value)}
        />
      </div>

      <div class="config-field">
        <label>Workflow ID</label>
        <input
          type="text"
          class="config-input"
          .value=${workflowId}
          placeholder="Enter workflow ID"
          @input=${(e: InputEvent) => onUpdate('workflowId', (e.target as HTMLInputElement).value)}
        />
        <span class="field-description">ID of the workflow to preview on the whiteboard.</span>
      </div>

      ${steps.length > 0 ? html`
        <div class="config-field">
          <label>Steps (${steps.length})</label>
          <div class="wb-workflow-steps-list">
            ${steps.map((step, i) => html`
              <div class="wb-workflow-step-item">
                <span class="wb-workflow-step-index">${i + 1}</span>
                <span class="wb-workflow-step-name">${step.name}</span>
                <span class="wb-workflow-step-type">${step.type}</span>
              </div>
            `)}
          </div>
        </div>
      ` : nothing}
    </div>

    <style>
      .wb-workflow-steps-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
        max-height: 200px;
        overflow-y: auto;
      }
      .wb-workflow-step-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 8px;
        border-radius: 4px;
        background: var(--bg-secondary, #f5f5f5);
        font-size: 12px;
      }
      .wb-workflow-step-index {
        color: var(--text-tertiary, #999);
        min-width: 16px;
        text-align: center;
      }
      .wb-workflow-step-name {
        flex: 1;
        color: var(--text-primary, #333);
      }
      .wb-workflow-step-type {
        color: var(--text-secondary, #666);
        font-size: 11px;
      }
    </style>
  `;
}
