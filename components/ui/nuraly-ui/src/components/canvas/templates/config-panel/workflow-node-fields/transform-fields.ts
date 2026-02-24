/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../../workflow-canvas.types.js';

/**
 * Render Transform node fields
 */
export function renderTransformFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  return html`
    <div class="config-field">
      <label>Transform Expression</label>
      <nr-input
        value=${config.transformExpression || ''}
        placeholder="JSONata expression"
        @nr-input=${(e: CustomEvent) => onUpdate('transformExpression', e.detail.value)}
      ></nr-input>
    </div>
  `;
}
