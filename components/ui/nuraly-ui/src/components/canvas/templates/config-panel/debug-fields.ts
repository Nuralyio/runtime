/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../workflow-canvas.types.js';

/**
 * Render Debug Node specific configuration fields
 * Shows execution context data (input, variables, node outputs)
 */
export function renderDebugNodeFields(
  config: NodeConfiguration,
  _onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  // Debug output comes from execution - show last execution data if available
  const debugData = config.lastDebugOutput as {
    input?: unknown;
    variables?: unknown;
    nodeOutputs?: unknown;
    execution?: unknown;
  } | null;

  const formatJson = (data: unknown): string => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  return html`
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Debug Info</span>
        <span class="config-section-desc">Displays execution context when workflow runs</span>
      </div>

      ${!debugData ? html`
        <div class="debug-placeholder">
          <nr-icon name="info" size="small"></nr-icon>
          <span>Run the workflow to see debug information here</span>
        </div>
      ` : html`
        <!-- Input Data -->
        <div class="debug-section">
          <div class="debug-section-title">
            <nr-icon name="log-in" size="small"></nr-icon>
            <span>Input</span>
          </div>
          <pre class="debug-output">${formatJson(debugData.input)}</pre>
        </div>

        <!-- Variables -->
        <div class="debug-section">
          <div class="debug-section-title">
            <nr-icon name="box" size="small"></nr-icon>
            <span>Variables</span>
          </div>
          <pre class="debug-output">${formatJson(debugData.variables)}</pre>
        </div>

        <!-- Node Outputs -->
        <div class="debug-section">
          <div class="debug-section-title">
            <nr-icon name="layers" size="small"></nr-icon>
            <span>Node Outputs</span>
          </div>
          <pre class="debug-output">${formatJson(debugData.nodeOutputs)}</pre>
        </div>

        <!-- Execution Info -->
        <div class="debug-section">
          <div class="debug-section-title">
            <nr-icon name="activity" size="small"></nr-icon>
            <span>Execution</span>
          </div>
          <pre class="debug-output">${formatJson(debugData.execution)}</pre>
        </div>
      `}
    </div>
  `;
}
