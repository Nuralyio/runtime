/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../../workflow-canvas.types.js';

/**
 * Render Vector Write node fields
 */
export function renderVectorWriteFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  return html`
    <div class="config-field">
      <label>Collection Name <span class="required">*</span></label>
      <nr-input
        value=${config.collectionName || ''}
        placeholder="knowledge-base"
        @nr-input=${(e: CustomEvent) => onUpdate('collectionName', e.detail.value)}
      ></nr-input>
      <small class="field-hint">Name of the vector collection to store in</small>
    </div>

    <div class="config-field">
      <label>Upsert Mode</label>
      <nr-select
        .value=${config.upsertMode || 'replace'}
        .options=${[
          { label: 'Replace (delete existing by sourceId)', value: 'replace' },
          { label: 'Append (always add new)', value: 'append' },
        ]}
        @nr-change=${(e: CustomEvent) => onUpdate('upsertMode', e.detail.value)}
      ></nr-select>
      <small class="field-hint">How to handle existing documents with same sourceId</small>
    </div>

    <div class="config-field">
      <label>Isolation Key (Optional)</label>
      <nr-input
        value=${config.isolationKey || ''}
        placeholder="\${input.userId}"
        @nr-input=${(e: CustomEvent) => onUpdate('isolationKey', e.detail.value)}
      ></nr-input>
      <small class="field-hint">Partition data by user or tenant</small>
    </div>
  `;
}
