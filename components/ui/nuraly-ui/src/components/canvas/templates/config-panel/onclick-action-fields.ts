/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, nothing, TemplateResult } from 'lit';
import { NodeConfiguration, WorkflowNode, WhiteboardNodeType } from '../../workflow-canvas.types.js';

/**
 * Render onClick action config fields for whiteboard nodes (excluding anchors)
 */
export function renderOnClickActionFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void,
  nodes: WorkflowNode[]
): TemplateResult | typeof nothing {
  const action = (config.onClickAction as string) || 'none';
  const targetId = (config.onClickTargetAnchorId as string) || '';

  // Collect all anchor nodes for the dropdown
  const anchors = nodes.filter(n => n.type === WhiteboardNodeType.ANCHOR);

  return html`
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">On Click Action</span>
      </div>
      <div class="config-field">
        <label>Action</label>
        <select
          class="config-select"
          .value=${action}
          @change=${(e: Event) => {
            const value = (e.target as HTMLSelectElement).value;
            onUpdate('onClickAction', value);
            if (value === 'none') {
              onUpdate('onClickTargetAnchorId', '');
            }
          }}
        >
          <option value="none">None</option>
          <option value="pan-to-anchor" ?selected=${action === 'pan-to-anchor'}>Pan to Anchor</option>
        </select>
      </div>

      ${action === 'pan-to-anchor' ? html`
        <div class="config-field">
          <label>Target Anchor</label>
          ${anchors.length > 0 ? html`
            <select
              class="config-select"
              .value=${targetId}
              @change=${(e: Event) => onUpdate('onClickTargetAnchorId', (e.target as HTMLSelectElement).value)}
            >
              <option value="">— Select anchor —</option>
              ${anchors.map(a => html`
                <option value=${a.id} ?selected=${targetId === a.id}>
                  ${(a.configuration?.anchorLabel as string) || a.name || 'Anchor'}
                </option>
              `)}
            </select>
          ` : html`
            <span class="field-description">No anchors on the canvas. Add an anchor first.</span>
          `}
        </div>
      ` : nothing}
    </div>
  `;
}
