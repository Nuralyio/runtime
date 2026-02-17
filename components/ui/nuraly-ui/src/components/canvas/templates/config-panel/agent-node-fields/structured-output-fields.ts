/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../../workflow-canvas.types.js';

/**
 * Render Structured Output node fields
 */
export function renderStructuredOutputFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  const schemaStr = config.schema ? JSON.stringify(config.schema, null, 2) : '{\n  "type": "object",\n  "properties": {},\n  "required": [],\n  "additionalProperties": false\n}';

  return html`
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Structured Output</span>
        <span class="config-section-desc">Define a JSON schema to enforce structured LLM responses</span>
      </div>
      <div class="config-field">
        <label>Schema Name</label>
        <nr-input
          value=${config.schemaName || 'structured_output'}
          placeholder="e.g. extract_info"
          @nr-input=${(e: CustomEvent) => onUpdate('schemaName', e.detail.value)}
        ></nr-input>
        <span class="field-description">Identifier for this output schema</span>
      </div>
      <div class="config-field">
        <label>JSON Schema</label>
        <nr-textarea
          value=${schemaStr}
          rows="12"
          placeholder='{"type": "object", "properties": {...}}'
          @nr-input=${(e: CustomEvent) => {
            try {
              const parsed = JSON.parse(e.detail.value);
              onUpdate('schema', parsed);
            } catch {
              // Don't update on invalid JSON
            }
          }}
        ></nr-textarea>
        <span class="field-description">JSON Schema defining the expected output structure</span>
      </div>
      <div class="config-field">
        <label>Strict Mode</label>
        <nr-checkbox
          ?checked=${config.strict !== false}
          @nr-change=${(e: CustomEvent) => onUpdate('strict', e.detail.checked)}
        ></nr-checkbox>
        <span class="field-description">Enforce strict schema adherence (recommended)</span>
      </div>
    </div>
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Usage</span>
      </div>
      <div class="config-info-box">
        <nr-icon name="braces" size="small"></nr-icon>
        <span>Connect this node to an Agent's <strong>Structured Output</strong> port to constrain the LLM response to your schema</span>
      </div>
    </div>
  `;
}
