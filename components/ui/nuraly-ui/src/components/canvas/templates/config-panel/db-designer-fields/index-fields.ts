/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../../workflow-canvas.types.js';

/**
 * Render Index node specific configuration fields
 */
export function renderIndexNodeFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  const indexColumns = (config.indexColumns as string[]) || [];

  return html`
    <!-- Index Name Section -->
    <div class="config-section">
      <div class="config-field">
        <label>Index Name</label>
        <nr-input
          .value=${(config.indexName as string) || ''}
          placeholder="e.g., idx_users_email"
          @nr-input=${(e: CustomEvent) => onUpdate('indexName', e.detail.value)}
        ></nr-input>
        <span class="field-description">Name of the index</span>
      </div>
    </div>

    <!-- Index Columns Section -->
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Indexed Columns</span>
        <span class="config-section-desc">Columns included in this index</span>
      </div>
      <div class="config-columns-list">
        ${indexColumns.map((col, index) => html`
          <div class="config-column-item">
            <nr-input
              .value=${col}
              placeholder="Column name"
              @nr-input=${(e: CustomEvent) => {
                const newColumns = [...indexColumns];
                newColumns[index] = e.detail.value;
                onUpdate('indexColumns', newColumns);
              }}
            ></nr-input>
            <button
              class="remove-column-btn"
              @click=${() => {
                const newColumns = indexColumns.filter((_, i) => i !== index);
                onUpdate('indexColumns', newColumns);
              }}
            >
              <nr-icon name="trash-2" size="small"></nr-icon>
            </button>
          </div>
        `)}
        <button
          class="add-column-btn"
          @click=${() => {
            onUpdate('indexColumns', [...indexColumns, '']);
          }}
        >
          <nr-icon name="plus" size="small"></nr-icon>
          Add Column
        </button>
      </div>
    </div>

    <!-- Index Options Section -->
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Index Options</span>
      </div>
      <nr-feature-toggle
        label="Unique Index"
        description="Enforce uniqueness on indexed columns"
        .checked=${config.unique === true}
        @toggle-change=${(e: CustomEvent) => onUpdate('unique', e.detail.checked)}
      ></nr-feature-toggle>

      <div class="config-field">
        <label>Index Type</label>
        <nr-input
          .value=${(config.indexType as string) || 'BTREE'}
          placeholder="BTREE, HASH, GIN, GIST"
          @nr-input=${(e: CustomEvent) => onUpdate('indexType', e.detail.value)}
        ></nr-input>
        <span class="field-description">Type of index algorithm</span>
      </div>
    </div>
  `;
}
