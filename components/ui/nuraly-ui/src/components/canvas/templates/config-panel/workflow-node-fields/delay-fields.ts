/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../../workflow-canvas.types.js';

/**
 * Render Delay node fields
 */
export function renderDelayFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  return html`
    <div class="config-field">
      <label>Duration</label>
      <nr-input
        type="number"
        value=${String(config.duration || 1000)}
        @nr-input=${(e: CustomEvent) => onUpdate('duration', parseInt(e.detail.value))}
      ></nr-input>
    </div>
    <div class="config-field">
      <label>Unit</label>
      <nr-input
        value=${config.unit || 'milliseconds'}
        placeholder="milliseconds, seconds, minutes"
        @nr-input=${(e: CustomEvent) => onUpdate('unit', e.detail.value)}
      ></nr-input>
    </div>
  `;
}
