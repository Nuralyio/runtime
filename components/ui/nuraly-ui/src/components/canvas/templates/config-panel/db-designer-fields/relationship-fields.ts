/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../../workflow-canvas.types.js';

/**
 * Render Relationship node specific configuration fields
 */
export function renderRelationshipNodeFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  return html`
    <!-- Relationship Type Section -->
    <div class="config-section">
      <div class="config-field">
        <label>Relationship Type</label>
        <nr-input
          .value=${(config.relationshipType as string) || 'ONE_TO_MANY'}
          placeholder="ONE_TO_ONE, ONE_TO_MANY, MANY_TO_MANY"
          @nr-input=${(e: CustomEvent) => onUpdate('relationshipType', e.detail.value)}
        ></nr-input>
        <span class="field-description">Type of relationship between tables</span>
      </div>
    </div>

    <!-- Column Mapping Section -->
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Column Mapping</span>
      </div>
      <div class="config-field">
        <label>Source Column</label>
        <nr-input
          .value=${(config.sourceColumn as string) || ''}
          placeholder="e.g., id"
          @nr-input=${(e: CustomEvent) => onUpdate('sourceColumn', e.detail.value)}
        ></nr-input>
        <span class="field-description">Column in the source table</span>
      </div>
      <div class="config-field">
        <label>Target Column</label>
        <nr-input
          .value=${(config.targetColumn as string) || ''}
          placeholder="e.g., user_id"
          @nr-input=${(e: CustomEvent) => onUpdate('targetColumn', e.detail.value)}
        ></nr-input>
        <span class="field-description">Column in the target table (foreign key)</span>
      </div>
    </div>

    <!-- Referential Actions Section -->
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Referential Actions</span>
      </div>
      <div class="config-field">
        <label>On Delete</label>
        <nr-input
          .value=${(config.onDelete as string) || 'CASCADE'}
          placeholder="CASCADE, SET_NULL, RESTRICT, NO_ACTION"
          @nr-input=${(e: CustomEvent) => onUpdate('onDelete', e.detail.value)}
        ></nr-input>
        <span class="field-description">Action when parent record is deleted</span>
      </div>
      <div class="config-field">
        <label>On Update</label>
        <nr-input
          .value=${(config.onUpdate as string) || 'CASCADE'}
          placeholder="CASCADE, SET_NULL, RESTRICT, NO_ACTION"
          @nr-input=${(e: CustomEvent) => onUpdate('onUpdate', e.detail.value)}
        ></nr-input>
        <span class="field-description">Action when parent record is updated</span>
      </div>
    </div>
  `;
}
