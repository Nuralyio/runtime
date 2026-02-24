/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../../workflow-canvas.types.js';

/**
 * Render Retriever node fields
 */
export function renderRetrieverFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  return html`
    <div class="config-field">
      <label>Vector Store ID</label>
      <nr-input
        value=${(config as any).vectorStoreId || ''}
        placeholder="Vector store identifier"
        @nr-input=${(e: CustomEvent) => onUpdate('vectorStoreId', e.detail.value)}
      ></nr-input>
    </div>
    <div class="config-field">
      <label>Top K</label>
      <nr-input
        type="number"
        value=${String((config as any).topK || 5)}
        @nr-input=${(e: CustomEvent) => onUpdate('topK', parseInt(e.detail.value))}
      ></nr-input>
    </div>
  `;
}
