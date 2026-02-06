/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, nothing, TemplateResult } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import { NODE_TEMPLATES, Workflow, WorkflowNode } from '../../workflow-canvas.types.js';
import { getAllAvailableVariablePaths } from '../../utils/variable-resolver.js';

// Import label component
import '../../../label/label.component.js';

// Re-export types
export * from './types.js';

// Import internal modules
import { ConfigPanelTemplateData, DynamicVariable, NodeExecutionData, ConfigPanelCallbacks } from './types.js';
import { renderCommonFields } from './common-fields.js';
import { renderTypeFields } from './type-fields.js';

/**
 * Render node execution data section (input/output)
 */
function renderNodeExecutionData(
  nodeExecution: NodeExecutionData | undefined,
  executionId: string | undefined,
  nodeId: string,
  callbacks: ConfigPanelCallbacks
): TemplateResult | typeof nothing {
  if (!nodeExecution) return nothing;

  const statusColors: Record<string, string> = {
    pending: '#f59e0b',
    running: '#3b82f6',
    completed: '#10b981',
    failed: '#ef4444'
  };

  const formatJson = (data: unknown): string => {
    if (!data) return '—';
    try {
      if (typeof data === 'string') {
        const parsed = JSON.parse(data);
        return JSON.stringify(parsed, null, 2);
      }
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  const canRetry = nodeExecution.status === 'failed' || nodeExecution.status === 'completed';

  return html`
    <div class="config-section execution-section">
      <div class="config-section-header">
        <span class="config-section-title">
          <nr-icon name="activity" size="small"></nr-icon>
          Execution Data
        </span>
        <span class="execution-status" style="color: ${statusColors[nodeExecution.status] || '#666'}">
          ${nodeExecution.status}
        </span>
      </div>

      ${nodeExecution.errorMessage ? html`
        <div class="execution-error">
          <nr-icon name="alert-circle" size="small"></nr-icon>
          ${nodeExecution.errorMessage}
        </div>
      ` : nothing}

      ${nodeExecution.inputData ? html`
        <div class="execution-data-block">
          <div class="execution-data-label">Input</div>
          <pre class="execution-data-content">${formatJson(nodeExecution.inputData)}</pre>
        </div>
      ` : nothing}

      ${nodeExecution.outputData ? html`
        <div class="execution-data-block">
          <div class="execution-data-label">Output</div>
          <pre class="execution-data-content">${formatJson(nodeExecution.outputData)}</pre>
        </div>
      ` : nothing}

      ${nodeExecution.durationMs ? html`
        <div class="execution-duration">
          Duration: ${nodeExecution.durationMs}ms
        </div>
      ` : nothing}

      ${canRetry && callbacks.onRetryNode && executionId ? html`
        <button
          class="retry-node-btn"
          @click=${() => callbacks.onRetryNode?.(nodeId)}
        >
          <nr-icon name="refresh-cw" size="small"></nr-icon>
          Retry Node
        </button>
      ` : nothing}
    </div>
  `;
}

/**
 * Render available variables section
 */
function renderAvailableVariables(
  workflow: Workflow | undefined,
  node: WorkflowNode,
  dynamicVariables?: DynamicVariable[],
  loadingVariables?: boolean
): TemplateResult | typeof nothing {
  if (!workflow) return nothing;

  // Use dynamic variables if available, otherwise fall back to static schema
  let variables: { nodeName: string; path: string; description: string; type: string; isDynamic?: boolean }[];

  if (dynamicVariables && dynamicVariables.length > 0) {
    variables = dynamicVariables;
  } else {
    const staticVars = getAllAvailableVariablePaths(workflow, node.id);
    variables = staticVars.map(v => ({ ...v, isDynamic: false }));
  }

  if (variables.length === 0 && !loadingVariables) return nothing;

  // Group variables by source node
  const groupedVars = variables.reduce((acc, v) => {
    if (!acc[v.nodeName]) acc[v.nodeName] = [];
    acc[v.nodeName].push(v);
    return acc;
  }, {} as Record<string, typeof variables>);

  return html`
    <div class="config-section variables-section">
      <div class="config-section-header">
        <span class="config-section-title">
          <nr-icon name="code" size="small"></nr-icon>
          Available Variables
        </span>
        <span class="config-section-desc">
          ${variables.some(v => v.isDynamic)
            ? 'From last execution • Click to copy'
            : 'Click to copy variable path'}
        </span>
      </div>
      ${loadingVariables
        ? html`<div class="variables-loading">Loading variables from last execution...</div>`
        : html`
          <div class="variables-list">
            ${Object.entries(groupedVars).map(([nodeName, vars]) => html`
              <div class="variables-group">
                <div class="variables-group-header">${nodeName}</div>
                ${vars.map(v => html`
                  <div
                    class="variable-item ${v.isDynamic ? 'dynamic' : ''}"
                    title="${v.description}"
                    @click=${() => {
                      navigator.clipboard.writeText(v.path);
                    }}
                  >
                    <code class="variable-path">${v.path}</code>
                    <span class="variable-type">${v.type}</span>
                    ${v.isDynamic ? html`<span class="variable-dynamic-badge">live</span>` : nothing}
                  </div>
                `)}
              </div>
            `)}
          </div>
        `}
    </div>
  `;
}

/**
 * Render the config panel
 */
export function renderConfigPanelTemplate(
  data: ConfigPanelTemplateData
): TemplateResult | typeof nothing {
  const { node, position, callbacks, workflowId, workflow, dynamicVariables, loadingVariables, nodeExecution, executionId, kvEntries, onCreateKvEntry, applicationId, databaseProvider } = data;

  if (!node || !position) return nothing;

  const template = NODE_TEMPLATES.find(t => t.type === node.type);

  const panelStyle = {
    left: `${position.x}px`,
    top: `${position.y}px`,
  };

  return html`
    <div class="config-panel" style=${styleMap(panelStyle)}>
      <div class="config-panel-header">
        <div class="config-panel-title">
          <div
            class="config-panel-icon"
            style="background: ${template?.color || '#3b82f6'}"
          >
            <nr-icon name=${template?.icon || 'box'} size="small"></nr-icon>
          </div>
          <nr-label size="medium">${node.name}</nr-label>
        </div>
        <button class="config-panel-close" @click=${callbacks.onClose}>
          <nr-icon name="x" size="small"></nr-icon>
        </button>
      </div>
      <div class="config-panel-content">
        ${renderCommonFields(node, callbacks)}
        ${renderTypeFields(node.type, node.configuration, callbacks.onUpdateConfig, workflowId, kvEntries, onCreateKvEntry, applicationId, databaseProvider)}
        ${renderNodeExecutionData(nodeExecution, executionId, node.id, callbacks)}
        ${renderAvailableVariables(workflow, node, dynamicVariables, loadingVariables)}
      </div>
    </div>
  `;
}
