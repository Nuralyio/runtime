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
        @nr-input=${(e: CustomEvent) => onUpdate('duration', Number.parseInt(e.detail.value))}
      ></nr-input>
    </div>
    <div class="config-field">
      <label>Unit</label>
      <nr-select
        .value=${config.unit || 'milliseconds'}
        .options=${[
          { label: 'Milliseconds', value: 'milliseconds' },
          { label: 'Seconds', value: 'seconds' },
          { label: 'Minutes', value: 'minutes' },
          { label: 'Hours', value: 'hours' }
        ]}
        @nr-change=${(e: CustomEvent) => onUpdate('unit', e.detail.value)}
      ></nr-select>
    </div>
  `;
}
