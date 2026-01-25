/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../../workflow-canvas.types.js';

/**
 * Render Tool node fields
 */
export function renderToolFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  // Parse parameters from JSON string or use empty array
  let toolParameters: Array<{name: string; type: string; description: string; required: boolean}> = [];
  try {
    if (config.parameters && typeof config.parameters === 'string') {
      toolParameters = JSON.parse(config.parameters as string);
    } else if (Array.isArray(config.parameters)) {
      toolParameters = config.parameters as Array<{name: string; type: string; description: string; required: boolean}>;
    }
  } catch {
    toolParameters = [];
  }

  const updateToolParameters = (params: Array<{name: string; type: string; description: string; required: boolean}>) => {
    onUpdate('parameters', params);
  };

  return html`
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Tool Definition</span>
        <span class="config-section-desc">Define the tool for the LLM to use</span>
      </div>
      <div class="config-field">
        <label>Tool Name</label>
        <nr-input
          value=${config.toolName || ''}
          placeholder="e.g., get_weather, search_database"
          @nr-input=${(e: CustomEvent) => onUpdate('toolName', e.detail.value)}
        ></nr-input>
        <span class="field-description">Unique identifier for the tool (snake_case)</span>
      </div>
      <div class="config-field">
        <label>Description</label>
        <nr-input
          value=${config.description || ''}
          placeholder="Describe what this tool does..."
          @nr-input=${(e: CustomEvent) => onUpdate('description', e.detail.value)}
        ></nr-input>
        <span class="field-description">The LLM uses this to decide when to call the tool</span>
      </div>
    </div>

    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Parameters</span>
        <span class="config-section-desc">Define the parameters the tool accepts</span>
      </div>
      <div class="config-columns-list">
        ${toolParameters.map((param, index) => html`
          <div class="config-column-item tool-param-item">
            <div class="config-field tool-param-fields">
              <nr-input
                .value=${param.name || ''}
                placeholder="Parameter name"
                class="tool-param-name"
                @nr-input=${(e: CustomEvent) => {
                  const newParams = [...toolParameters];
                  newParams[index] = { ...param, name: e.detail.value };
                  updateToolParameters(newParams);
                }}
              ></nr-input>
              <select
                class="tool-param-type"
                .value=${param.type || 'string'}
                @change=${(e: Event) => {
                  const newParams = [...toolParameters];
                  newParams[index] = { ...param, type: (e.target as HTMLSelectElement).value };
                  updateToolParameters(newParams);
                }}
              >
                <option value="string" ?selected=${param.type === 'string'}>String</option>
                <option value="number" ?selected=${param.type === 'number'}>Number</option>
                <option value="boolean" ?selected=${param.type === 'boolean'}>Boolean</option>
                <option value="array" ?selected=${param.type === 'array'}>Array</option>
                <option value="object" ?selected=${param.type === 'object'}>Object</option>
              </select>
              <label class="tool-param-required">
                <input
                  type="checkbox"
                  .checked=${param.required || false}
                  @change=${(e: Event) => {
                    const newParams = [...toolParameters];
                    newParams[index] = { ...param, required: (e.target as HTMLInputElement).checked };
                    updateToolParameters(newParams);
                  }}
                />
                Required
              </label>
            </div>
            <div class="config-field">
              <nr-input
                .value=${param.description || ''}
                placeholder="Parameter description"
                class="tool-param-desc"
                @nr-input=${(e: CustomEvent) => {
                  const newParams = [...toolParameters];
                  newParams[index] = { ...param, description: e.detail.value };
                  updateToolParameters(newParams);
                }}
              ></nr-input>
            </div>
            <button
              class="remove-column-btn"
              @click=${() => {
                const newParams = toolParameters.filter((_, i) => i !== index);
                updateToolParameters(newParams);
              }}
            >
              <nr-icon name="trash-2" size="small"></nr-icon>
            </button>
          </div>
        `)}
        <button
          class="add-column-btn"
          @click=${() => {
            const newParams = [...toolParameters, { name: '', type: 'string', description: '', required: false }];
            updateToolParameters(newParams);
          }}
        >
          <nr-icon name="plus" size="small"></nr-icon>
          Add Parameter
        </button>
      </div>
    </div>

    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Execution</span>
        <span class="config-section-desc">Connect a Function node to execute when called</span>
      </div>
      <div class="config-info-box">
        <nr-icon name="code" size="small"></nr-icon>
        <span><strong>Function</strong> - Connect a Function node to the 'function' port</span>
      </div>
    </div>
  `;
}
