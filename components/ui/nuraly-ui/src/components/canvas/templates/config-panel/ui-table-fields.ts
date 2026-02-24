/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult, nothing } from 'lit';
import { NodeConfiguration } from '../../workflow-canvas.types.js';
import type { NodeExecutionData } from './types.js';

interface TableColumn {
  name: string;
  key: string;
  width?: number | string;
  filterable?: boolean;
}

/**
 * Render UI Table Node specific configuration fields
 * Columns editor, data source, table options, and live table preview
 */
export function renderUiTableFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void,
  nodeExecution?: NodeExecutionData
): TemplateResult {
  const columns = (config.tableColumns || []) as TableColumn[];

  const addColumn = () => {
    onUpdate('tableColumns', [...columns, { name: '', key: '' }]);
  };

  const updateColumn = (index: number, field: string, value: unknown) => {
    const updated = [...columns];
    updated[index] = { ...updated[index], [field]: value };
    onUpdate('tableColumns', updated);
  };

  const removeColumn = (index: number) => {
    const updated = columns.filter((_, i) => i !== index);
    onUpdate('tableColumns', updated);
  };

  // Parse execution output for live preview
  const executionOutput = nodeExecution?.outputData as {
    headers?: Array<{ name: string; key: string }>;
    rows?: unknown[];
    totalCount?: number;
  } | null;

  return html`
    <!-- Columns Section -->
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Columns</span>
        <span class="config-section-desc">Define table columns and their data keys</span>
      </div>

      ${columns.length === 0 ? html`
        <div class="debug-placeholder">
          <nr-icon name="info" size="small"></nr-icon>
          <span>No columns defined. Add columns to display data.</span>
        </div>
      ` : columns.map((col, index) => html`
        <div class="config-field" style="display:flex;gap:8px;align-items:flex-end;margin-bottom:8px;">
          <div style="flex:1">
            ${index === 0 ? html`<label>Header Name</label>` : nothing}
            <nr-input
              value=${col.name || ''}
              placeholder="Column header"
              @nr-input=${(e: CustomEvent) => updateColumn(index, 'name', e.detail.value)}
            ></nr-input>
          </div>
          <div style="flex:1">
            ${index === 0 ? html`<label>Data Key</label>` : nothing}
            <nr-input
              value=${col.key || ''}
              placeholder="field.path"
              @nr-input=${(e: CustomEvent) => updateColumn(index, 'key', e.detail.value)}
            ></nr-input>
          </div>
          <div style="flex:0 0 auto;">
            ${index === 0 ? html`<label>&nbsp;</label>` : nothing}
            <nr-button size="small" variant="ghost" @click=${() => removeColumn(index)}>
              <nr-icon name="trash-2" size="small"></nr-icon>
            </nr-button>
          </div>
        </div>
      `)}

      <nr-button size="small" variant="outlined" @click=${addColumn}>
        <nr-icon name="plus" size="small"></nr-icon>
        Add Column
      </nr-button>
    </div>

    <!-- Data Source Section -->
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Data Source</span>
        <span class="config-section-desc">Expression to extract data from input</span>
      </div>
      <div class="config-field">
        <label>Data Expression</label>
        <nr-input
          value=${config.dataExpression || ''}
          placeholder="\${NodeName.results}"
          @nr-input=${(e: CustomEvent) => onUpdate('dataExpression', e.detail.value)}
        ></nr-input>
        <small class="field-hint">Use \${nodeName.field} syntax to reference upstream output. Leave empty to use raw input.</small>
      </div>
    </div>

    <!-- Table Options Section -->
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Table Options</span>
      </div>

      <div class="config-field">
        <label>Page Size</label>
        <nr-input
          type="number"
          value=${String(config.tablePageSize ?? 10)}
          @nr-input=${(e: CustomEvent) => onUpdate('tablePageSize', parseInt(e.detail.value) || 10)}
        ></nr-input>
      </div>

      <div class="config-field">
        <label>Size</label>
        <nr-select
          .value=${config.tableSize || 'normal'}
          .options=${[
            { label: 'Small', value: 'small' },
            { label: 'Normal', value: 'normal' },
            { label: 'Large', value: 'large' },
          ]}
          @nr-change=${(e: CustomEvent) => onUpdate('tableSize', e.detail.value)}
        ></nr-select>
      </div>

      <div class="config-field" style="display:flex;align-items:center;gap:8px;">
        <input
          type="checkbox"
          .checked=${config.tableEnableSort !== false}
          @change=${(e: Event) => onUpdate('tableEnableSort', (e.target as HTMLInputElement).checked)}
        />
        <label style="margin:0;">Enable Sorting</label>
      </div>

      <div class="config-field" style="display:flex;align-items:center;gap:8px;">
        <input
          type="checkbox"
          .checked=${config.tableEnableFilter === true}
          @change=${(e: Event) => onUpdate('tableEnableFilter', (e.target as HTMLInputElement).checked)}
        />
        <label style="margin:0;">Enable Filter</label>
      </div>

      <div class="config-field" style="display:flex;align-items:center;gap:8px;">
        <input
          type="checkbox"
          .checked=${config.tableFixedHeader === true}
          @change=${(e: Event) => onUpdate('tableFixedHeader', (e.target as HTMLInputElement).checked)}
        />
        <label style="margin:0;">Fixed Header</label>
      </div>

      <div class="config-field">
        <label>Empty Text</label>
        <nr-input
          value=${config.tableEmptyText || 'No data available'}
          placeholder="No data available"
          @nr-input=${(e: CustomEvent) => onUpdate('tableEmptyText', e.detail.value)}
        ></nr-input>
      </div>
    </div>

    <!-- Live Table Preview (post-execution) -->
    ${executionOutput?.headers && executionOutput?.rows ? html`
      <div class="config-section">
        <div class="config-section-header">
          <span class="config-section-title">Table Preview</span>
          <span class="config-section-desc">${executionOutput.totalCount ?? executionOutput.rows.length} row(s)</span>
        </div>
        <nr-table
          .headers=${executionOutput.headers}
          .rows=${executionOutput.rows}
          size=${config.tableSize || 'normal'}
          ?fixedHeader=${config.tableFixedHeader === true}
          ?withFilter=${config.tableEnableFilter === true}
          emptyText=${config.tableEmptyText || 'No data available'}
        ></nr-table>
      </div>
    ` : nothing}
  `;
}
