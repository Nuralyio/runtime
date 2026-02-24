/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../../workflow-canvas.types.js';

/**
 * Render Query node specific configuration fields
 */
export function renderQueryNodeFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  const parameters = (config.parameters as Array<{name: string; type: string; defaultValue?: unknown}>) || [];

  return html`
    <!-- Query Name Section -->
    <div class="config-section">
      <div class="config-field">
        <label>Query Name</label>
        <nr-input
          .value=${(config.queryName as string) || ''}
          placeholder="e.g., get_active_users"
          @nr-input=${(e: CustomEvent) => onUpdate('queryName', e.detail.value)}
        ></nr-input>
        <span class="field-description">Name of the saved query or stored procedure</span>
      </div>
    </div>

    <!-- Query Text Section -->
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Query Definition</span>
      </div>
      <div class="config-field">
        <label>SQL Query</label>
        <nr-input
          .value=${(config.queryText as string) || ''}
          placeholder="SELECT * FROM users WHERE status = :status"
          @nr-input=${(e: CustomEvent) => onUpdate('queryText', e.detail.value)}
        ></nr-input>
        <span class="field-description">SQL query with optional parameter placeholders (:param)</span>
      </div>
    </div>

    <!-- Parameters Section -->
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Parameters</span>
        <span class="config-section-desc">Define query parameters</span>
      </div>
      <div class="config-columns-list">
        ${parameters.map((param, index) => html`
          <div class="config-column-item">
            <div class="config-field">
              <label>Parameter ${index + 1}</label>
              <div class="column-inputs">
                <nr-input
                  .value=${param.name || ''}
                  placeholder="Parameter name"
                  @nr-input=${(e: CustomEvent) => {
                    const newParams = [...parameters];
                    newParams[index] = { ...newParams[index], name: e.detail.value };
                    onUpdate('parameters', newParams);
                  }}
                ></nr-input>
                <nr-input
                  .value=${param.type || ''}
                  placeholder="Type (VARCHAR, INT, etc.)"
                  @nr-input=${(e: CustomEvent) => {
                    const newParams = [...parameters];
                    newParams[index] = { ...newParams[index], type: e.detail.value };
                    onUpdate('parameters', newParams);
                  }}
                ></nr-input>
              </div>
            </div>
            <button
              class="remove-column-btn"
              @click=${() => {
                const newParams = parameters.filter((_, i) => i !== index);
                onUpdate('parameters', newParams);
              }}
            >
              <nr-icon name="trash-2" size="small"></nr-icon>
            </button>
          </div>
        `)}
        <button
          class="add-column-btn"
          @click=${() => {
            const newParams = [...parameters, { name: '', type: 'VARCHAR' }];
            onUpdate('parameters', newParams);
          }}
        >
          <nr-icon name="plus" size="small"></nr-icon>
          Add Parameter
        </button>
      </div>
    </div>
  `;
}
