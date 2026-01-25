/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../../workflow-canvas.types.js';

/**
 * Render Memory node fields
 */
export function renderMemoryFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  return html`
    <div class="config-field">
      <label>Memory Type</label>
      <nr-input
        value=${config.memoryType || 'buffer'}
        placeholder="buffer, summary, vector"
        @nr-input=${(e: CustomEvent) => onUpdate('memoryType', e.detail.value)}
      ></nr-input>
    </div>
    <div class="config-field">
      <label>Max Messages</label>
      <nr-input
        type="number"
        value=${String(config.maxMessages || 10)}
        @nr-input=${(e: CustomEvent) => onUpdate('maxMessages', parseInt(e.detail.value))}
      ></nr-input>
    </div>
  `;
}
