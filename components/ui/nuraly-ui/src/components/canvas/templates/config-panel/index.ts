/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, nothing, TemplateResult } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import { NODE_TEMPLATES } from '../../workflow-canvas.types.js';

// Import label component
import '../../../label/label.component.js';

// Re-export types
export * from './types.js';

// Import internal modules
import { ConfigPanelTemplateData } from './types.js';
import { renderCommonFields } from './common-fields.js';
import { renderTypeFields } from './type-fields.js';

/**
 * Render the config panel
 */
export function renderConfigPanelTemplate(
  data: ConfigPanelTemplateData
): TemplateResult | typeof nothing {
  const { node, position, callbacks, workflowId } = data;

  if (!node || !position) return nothing;

  const template = NODE_TEMPLATES.find(t => t.type === node.type);

  const panelStyle = {
    left: `${position.x}px`,
    top: `${position.y}px`,
  };

  return html`
    <div class="config-panel" style=${styleMap(panelStyle)}>
      <div class="config-panel-header">
        <div class="config-panel-title">
          <div
            class="config-panel-icon"
            style="background: ${template?.color || '#3b82f6'}"
          >
            <nr-icon name=${template?.icon || 'box'} size="small"></nr-icon>
          </div>
          <nr-label size="medium">${node.name}</nr-label>
        </div>
        <button class="config-panel-close" @click=${callbacks.onClose}>
          <nr-icon name="x" size="small"></nr-icon>
        </button>
      </div>
      <div class="config-panel-content">
        ${renderCommonFields(node, callbacks)}
        ${renderTypeFields(node.type, node.configuration, callbacks.onUpdateConfig, workflowId)}
      </div>
    </div>
  `;
}
