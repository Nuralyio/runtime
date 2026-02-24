/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../../workflow-canvas.types.js';

/**
 * Render Prompt node fields
 */
export function renderPromptFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  return html`
    <div class="config-field">
      <label>Template</label>
      <nr-input
        value=${(config as any).template || ''}
        placeholder="Prompt template with {variables}"
        @nr-input=${(e: CustomEvent) => onUpdate('template', e.detail.value)}
      ></nr-input>
    </div>
  `;
}
