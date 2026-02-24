/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../../workflow-canvas.types.js';

/**
 * Render View node specific configuration fields
 */
export function renderViewNodeFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  return html`
    <!-- View Name Section -->
    <div class="config-section">
      <div class="config-field">
        <label>View Name</label>
        <nr-input
          .value=${(config.viewName as string) || ''}
          placeholder="e.g., active_users_view"
          @nr-input=${(e: CustomEvent) => onUpdate('viewName', e.detail.value)}
        ></nr-input>
        <span class="field-description">Name of the database view</span>
      </div>
    </div>

    <!-- Query Section -->
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Query Definition</span>
      </div>
      <div class="config-field">
        <label>SQL Query</label>
        <nr-input
          .value=${(config.query as string) || ''}
          placeholder="SELECT * FROM users WHERE status = 'active'"
          @nr-input=${(e: CustomEvent) => onUpdate('query', e.detail.value)}
        ></nr-input>
        <span class="field-description">The SELECT statement that defines this view</span>
      </div>
    </div>

    <!-- Options Section -->
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Options</span>
      </div>
      <nr-feature-toggle
        label="Materialized View"
        description="Store the view results physically for faster queries"
        .checked=${config.materialized === true}
        @toggle-change=${(e: CustomEvent) => onUpdate('materialized', e.detail.checked)}
      ></nr-feature-toggle>
    </div>
  `;
}
