/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, nothing, TemplateResult } from 'lit';
import { NODE_CATEGORIES, NODE_TEMPLATES, NodeType } from '../workflow-canvas.types.js';

/**
 * Data required for rendering the node palette
 */
export interface PaletteTemplateData {
  showPalette: boolean;
  expandedCategories: Set<string>;
  onClose: () => void;
  onToggleCategory: (categoryId: string) => void;
  onNodeDragStart: (e: DragEvent, type: NodeType) => void;
  onNodeDoubleClick: (type: NodeType) => void;
}

/**
 * Render the node palette
 */
export function renderPaletteTemplate(data: PaletteTemplateData): TemplateResult | typeof nothing {
  if (!data.showPalette) return nothing;

  return html`
    <div class="node-palette">
      <div class="palette-header">
        <span class="palette-title">Add Node</span>
        <button class="palette-close" @click=${data.onClose}>
          <nr-icon name="x" size="small"></nr-icon>
        </button>
      </div>
      <div class="palette-content">
        ${NODE_CATEGORIES.map(category => html`
          <div class="palette-category">
            <div
              class="category-header"
              @click=${() => data.onToggleCategory(category.id)}
            >
              <nr-icon name=${category.icon || 'folder'} size="small"></nr-icon>
              <span>${category.name}</span>
              <nr-icon
                name=${data.expandedCategories.has(category.id) ? 'chevron-down' : 'chevron-right'}
                size="small"
              ></nr-icon>
            </div>
            ${data.expandedCategories.has(category.id) ? html`
              <div class="category-items">
                ${category.nodeTypes.map(nodeType => {
                  const template = NODE_TEMPLATES.find(t => t.type === nodeType);
                  if (!template) return nothing;
                  return html`
                    <div
                      class="palette-item"
                      draggable="true"
                      @dragstart=${(e: DragEvent) => data.onNodeDragStart(e, nodeType)}
                      @dblclick=${() => data.onNodeDoubleClick(nodeType)}
                      title=${template.description}
                    >
                      <div
                        class="palette-item-icon"
                        style="background: ${template.color}"
                      >
                        <nr-icon name=${template.icon} size="small"></nr-icon>
                      </div>
                      <span class="palette-item-name">${template.name}</span>
                    </div>
                  `;
                })}
              </div>
            ` : nothing}
          </div>
        `)}
      </div>
    </div>
  `;
}
