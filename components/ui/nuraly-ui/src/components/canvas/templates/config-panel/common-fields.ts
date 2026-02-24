/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import { WorkflowNode } from '../../workflow-canvas.types.js';
import { ConfigPanelCallbacks } from './types.js';

// Import label component
import '../../../label/label.component.js';

/**
 * Render common fields (name and description)
 */
export function renderCommonFields(
  node: WorkflowNode,
  callbacks: ConfigPanelCallbacks
): TemplateResult {
  return html`
    <div class="config-field">
      <nr-label size="small">Name</nr-label>
      <nr-input
        value=${node.name}
        placeholder="Node name"
        @nr-input=${(e: CustomEvent) => callbacks.onUpdateName(e.detail.value)}
      ></nr-input>
    </div>
    <div class="config-field">
      <nr-label size="small">Description</nr-label>
      <nr-input
        value=${node.metadata?.description || ''}
        placeholder="Description"
        @nr-input=${(e: CustomEvent) => callbacks.onUpdateDescription(e.detail.value)}
      ></nr-input>
    </div>
  `;
}
