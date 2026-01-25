/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../../workflow-canvas.types.js';

/**
 * Render Email node fields
 */
export function renderEmailFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  return html`
    <div class="config-field">
      <label>To</label>
      <nr-input
        value=${(config as any).to || ''}
        placeholder="recipient@example.com"
        @nr-input=${(e: CustomEvent) => onUpdate('to', e.detail.value)}
      ></nr-input>
    </div>
    <div class="config-field">
      <label>Subject</label>
      <nr-input
        value=${(config as any).subject || ''}
        placeholder="Email subject"
        @nr-input=${(e: CustomEvent) => onUpdate('subject', e.detail.value)}
      ></nr-input>
    </div>
  `;
}
