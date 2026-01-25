/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../../workflow-canvas.types.js';

/**
 * Render Loop node fields
 */
export function renderLoopFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  return html`
    <div class="config-field">
      <label>Iterator Variable</label>
      <nr-input
        value=${config.iteratorVariable || 'item'}
        placeholder="Variable name"
        @nr-input=${(e: CustomEvent) => onUpdate('iteratorVariable', e.detail.value)}
      ></nr-input>
    </div>
    <div class="config-field">
      <label>Array Expression</label>
      <nr-input
        value=${config.arrayExpression || ''}
        placeholder="data.items"
        @nr-input=${(e: CustomEvent) => onUpdate('arrayExpression', e.detail.value)}
      ></nr-input>
    </div>
    <div class="config-field">
      <label>Max Iterations</label>
      <nr-input
        type="number"
        value=${String(config.maxIterations || 100)}
        @nr-input=${(e: CustomEvent) => onUpdate('maxIterations', parseInt(e.detail.value))}
      ></nr-input>
    </div>
  `;
}
