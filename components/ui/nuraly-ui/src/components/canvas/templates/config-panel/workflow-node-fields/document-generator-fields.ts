/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../../workflow-canvas.types.js';

/**
 * Render Document Generator node fields
 *
 * Backend expects:
 * - templateId: UUID of the document template
 * - data: Object with key-value pairs for template variables (supports expressions)
 * - outputVariable: Variable name to store result
 *
 * Output:
 * - success: boolean
 * - fileUrl: URL path to download the generated file
 * - fileName: Name of the generated file
 * - templateId: ID of the template used
 */
export function renderDocumentGeneratorFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  // Parse existing data entries for the key-value editor
  const dataEntries: Array<{ key: string; value: string }> = [];
  if (config.data && typeof config.data === 'object') {
    for (const [key, value] of Object.entries(config.data as Record<string, unknown>)) {
      dataEntries.push({ key, value: String(value ?? '') });
    }
  }

  const updateDataEntry = (index: number, field: 'key' | 'value', newValue: string) => {
    const entries = [...dataEntries];
    entries[index] = { ...entries[index], [field]: newValue };
    const data: Record<string, string> = {};
    for (const entry of entries) {
      if (entry.key) {
        data[entry.key] = entry.value;
      }
    }
    onUpdate('data', data);
  };

  const addDataEntry = () => {
    const data: Record<string, string> = {};
    for (const entry of dataEntries) {
      if (entry.key) {
        data[entry.key] = entry.value;
      }
    }
    data[''] = '';
    onUpdate('data', data);
  };

  const removeDataEntry = (index: number) => {
    const entries = dataEntries.filter((_, i) => i !== index);
    const data: Record<string, string> = {};
    for (const entry of entries) {
      if (entry.key) {
        data[entry.key] = entry.value;
      }
    }
    onUpdate('data', data);
  };

  return html`
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Template</span>
      </div>
      <div class="config-field">
        <label>Template ID</label>
        <nr-input
          value=${(config.templateId as string) || ''}
          placeholder="Enter template UUID or \${variables.templateId}"
          @nr-input=${(e: CustomEvent) => onUpdate('templateId', e.detail.value)}
        ></nr-input>
        <small class="field-hint">UUID of the uploaded .docx template. Supports expressions.</small>
      </div>
    </div>

    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Template Data</span>
      </div>
      <small class="field-hint" style="margin-bottom: 8px; display: block;">
        Map template placeholders to values. Values support expressions like \${variables.name} or \${input.field}.
      </small>

      ${dataEntries.map(
        (entry, index) => html`
          <div class="config-field" style="display: flex; gap: 8px; align-items: center;">
            <nr-input
              value=${entry.key}
              placeholder="Field name"
              style="flex: 1;"
              @nr-input=${(e: CustomEvent) => updateDataEntry(index, 'key', e.detail.value)}
            ></nr-input>
            <nr-input
              value=${entry.value}
              placeholder="Value or \${expression}"
              style="flex: 1;"
              @nr-input=${(e: CustomEvent) => updateDataEntry(index, 'value', e.detail.value)}
            ></nr-input>
            <nr-button
              variant="ghost"
              size="small"
              @click=${() => removeDataEntry(index)}
            >
              <nr-icon name="trash-2" size="small"></nr-icon>
            </nr-button>
          </div>
        `
      )}

      <div class="config-field">
        <nr-button
          variant="outline"
          size="small"
          @click=${addDataEntry}
        >
          <nr-icon name="plus" size="small"></nr-icon>
          Add Field
        </nr-button>
      </div>
    </div>

    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Output</span>
      </div>
      <div class="config-field">
        <label>Output Variable</label>
        <nr-input
          value=${(config.outputVariable as string) || 'documentResult'}
          placeholder="documentResult"
          @nr-input=${(e: CustomEvent) => onUpdate('outputVariable', e.detail.value)}
        ></nr-input>
        <small class="field-hint">Access via \${variables.documentResult.fileUrl}</small>
      </div>
    </div>
  `;
}
