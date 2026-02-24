/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../../workflow-canvas.types.js';

/**
 * Render Table node specific configuration fields
 */
export function renderTableNodeFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  const columns = (config.columns as Array<{name: string; type: string; nullable?: boolean; defaultValue?: unknown}>) || [];

  return html`
    <!-- Table Name Section -->
    <div class="config-section">
      <div class="config-field">
        <label>Table Name</label>
        <nr-input
          .value=${(config.tableName as string) || ''}
          placeholder="e.g., users, orders"
          @nr-input=${(e: CustomEvent) => onUpdate('tableName', e.detail.value)}
        ></nr-input>
        <span class="field-description">Name of the database table</span>
      </div>
    </div>

    <!-- Primary Key Section -->
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Primary Key</span>
      </div>
      <div class="config-field">
        <label>Primary Key Column</label>
        <nr-input
          .value=${(config.primaryKey as string) || ''}
          placeholder="e.g., id"
          @nr-input=${(e: CustomEvent) => onUpdate('primaryKey', e.detail.value)}
        ></nr-input>
        <span class="field-description">Column that uniquely identifies each row</span>
      </div>
    </div>

    <!-- Columns Section -->
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Columns</span>
        <span class="config-section-desc">Define table columns</span>
      </div>
      <div class="config-columns-list">
        ${columns.map((col, index) => html`
          <div class="config-column-item">
            <div class="config-field">
              <label>Column ${index + 1}</label>
              <div class="column-inputs">
                <nr-input
                  .value=${col.name || ''}
                  placeholder="Column name"
                  @nr-input=${(e: CustomEvent) => {
                    const newColumns = [...columns];
                    newColumns[index] = { ...newColumns[index], name: e.detail.value };
                    onUpdate('columns', newColumns);
                  }}
                ></nr-input>
                <nr-input
                  .value=${col.type || ''}
                  placeholder="Type (VARCHAR, INT, etc.)"
                  @nr-input=${(e: CustomEvent) => {
                    const newColumns = [...columns];
                    newColumns[index] = { ...newColumns[index], type: e.detail.value };
                    onUpdate('columns', newColumns);
                  }}
                ></nr-input>
              </div>
            </div>
            <button
              class="remove-column-btn"
              @click=${() => {
                const newColumns = columns.filter((_, i) => i !== index);
                onUpdate('columns', newColumns);
              }}
            >
              <nr-icon name="trash-2" size="small"></nr-icon>
            </button>
          </div>
        `)}
        <button
          class="add-column-btn"
          @click=${() => {
            const newColumns = [...columns, { name: '', type: 'VARCHAR(255)', nullable: true }];
            onUpdate('columns', newColumns);
          }}
        >
          <nr-icon name="plus" size="small"></nr-icon>
          Add Column
        </button>
      </div>
    </div>
  `;
}
