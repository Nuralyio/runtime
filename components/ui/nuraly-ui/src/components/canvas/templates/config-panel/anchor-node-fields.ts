/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../workflow-canvas.types.js';

/**
 * Render ANCHOR node specific configuration fields
 */
export function renderAnchorFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  const label = (config.anchorLabel as string) || 'Anchor';

  return html`
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Anchor Settings</span>
      </div>
      <div class="config-field">
        <label>Anchor Label</label>
        <input
          type="text"
          class="config-input"
          .value=${label}
          @input=${(e: InputEvent) => onUpdate('anchorLabel', (e.target as HTMLInputElement).value)}
        />
      </div>
    </div>
  `;
}
