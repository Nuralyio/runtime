/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, nothing, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../../workflow-canvas.types.js';

/**
 * Render Constraint node specific configuration fields
 */
export function renderConstraintNodeFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  const constraintColumns = (config.constraintColumns as string[]) || [];
  const constraintType = (config.constraintType as string) || 'UNIQUE';

  return html`
    <!-- Constraint Name Section -->
    <div class="config-section">
      <div class="config-field">
        <label>Constraint Name</label>
        <nr-input
          .value=${(config.constraintName as string) || ''}
          placeholder="e.g., uq_users_email"
          @nr-input=${(e: CustomEvent) => onUpdate('constraintName', e.detail.value)}
        ></nr-input>
        <span class="field-description">Name of the constraint</span>
      </div>
    </div>

    <!-- Constraint Type Section -->
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Constraint Type</span>
      </div>
      <div class="config-field">
        <label>Type</label>
        <nr-input
          .value=${constraintType}
          placeholder="UNIQUE, CHECK, FOREIGN_KEY"
          @nr-input=${(e: CustomEvent) => onUpdate('constraintType', e.detail.value)}
        ></nr-input>
        <span class="field-description">Type of constraint to apply</span>
      </div>
    </div>

    <!-- Columns Section (for UNIQUE and FOREIGN_KEY) -->
    ${constraintType !== 'CHECK' ? html`
      <div class="config-section">
        <div class="config-section-header">
          <span class="config-section-title">Constraint Columns</span>
        </div>
        <div class="config-columns-list">
          ${constraintColumns.map((col, index) => html`
            <div class="config-column-item">
              <nr-input
                .value=${col}
                placeholder="Column name"
                @nr-input=${(e: CustomEvent) => {
                  const newColumns = [...constraintColumns];
                  newColumns[index] = e.detail.value;
                  onUpdate('constraintColumns', newColumns);
                }}
              ></nr-input>
              <button
                class="remove-column-btn"
                @click=${() => {
                  const newColumns = constraintColumns.filter((_, i) => i !== index);
                  onUpdate('constraintColumns', newColumns);
                }}
              >
                <nr-icon name="trash-2" size="small"></nr-icon>
              </button>
            </div>
          `)}
          <button
            class="add-column-btn"
            @click=${() => {
              onUpdate('constraintColumns', [...constraintColumns, '']);
            }}
          >
            <nr-icon name="plus" size="small"></nr-icon>
            Add Column
          </button>
        </div>
      </div>
    ` : nothing}

    <!-- Check Expression Section (for CHECK constraint) -->
    ${constraintType === 'CHECK' ? html`
      <div class="config-section">
        <div class="config-section-header">
          <span class="config-section-title">Check Expression</span>
        </div>
        <div class="config-field">
          <label>Expression</label>
          <nr-input
            .value=${(config.checkExpression as string) || ''}
            placeholder="e.g., age >= 18"
            @nr-input=${(e: CustomEvent) => onUpdate('checkExpression', e.detail.value)}
          ></nr-input>
          <span class="field-description">SQL expression that must evaluate to true</span>
        </div>
      </div>
    ` : nothing}
  `;
}
