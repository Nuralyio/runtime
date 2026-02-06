/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, nothing, TemplateResult } from 'lit';
import {
  NODE_TEMPLATES,
  NodeType,
  CanvasType,
  getCategoriesForCanvasType,
} from '../workflow-canvas.types.js';

/**
 * Data required for rendering the node palette
 */
export interface PaletteTemplateData {
  showPalette: boolean;
  expandedCategories: Set<string>;
  canvasType: CanvasType;
  searchTerm: string;
  onClose: () => void;
  onToggleCategory: (categoryId: string) => void;
  onNodeDragStart: (e: DragEvent, type: NodeType) => void;
  onNodeDoubleClick: (type: NodeType) => void;
  onSearchChange: (term: string) => void;
}

/**
 * Render the node palette
 */
export function renderPaletteTemplate(data: PaletteTemplateData): TemplateResult | typeof nothing {
  if (!data.showPalette) return nothing;

  const categories = getCategoriesForCanvasType(data.canvasType);
  const paletteTitle = data.canvasType === CanvasType.DATABASE
    ? 'Add DB Element'
    : data.canvasType === CanvasType.WHITEBOARD
      ? 'Add Element'
      : 'Add Node';
  const searchTerm = data.searchTerm.toLowerCase().trim();

  // Filter categories and nodes based on search term
  const filteredCategories = searchTerm
    ? categories.map(category => {
        const filteredNodeTypes = category.nodeTypes.filter(nodeType => {
          const template = NODE_TEMPLATES.find(t => t.type === nodeType);
          if (!template) return false;
          return (
            template.name.toLowerCase().includes(searchTerm) ||
            template.description.toLowerCase().includes(searchTerm) ||
            nodeType.toLowerCase().includes(searchTerm)
          );
        });
        return { ...category, nodeTypes: filteredNodeTypes };
      }).filter(category => category.nodeTypes.length > 0)
    : categories;

  const handleSearchInput = (e: Event) => {
    const input = e.target as HTMLInputElement;
    data.onSearchChange(input.value);
  };

  return html`
    <div class="node-palette">
      <div class="palette-header">
        <span class="palette-title">${paletteTitle}</span>
        <button class="palette-close" @click=${data.onClose}>
          <nr-icon name="x" size="small"></nr-icon>
        </button>
      </div>
      <div class="palette-search">
        <nr-input
          size="small"
          placeholder="Search nodes..."
          .value=${data.searchTerm}
          @nr-input=${handleSearchInput}
          allowClear
        >
          <nr-icon slot="addon-before" name="search" size="small"></nr-icon>
        </nr-input>
      </div>
      <div class="palette-content">
        ${filteredCategories.length === 0 ? html`
          <div class="palette-empty">
            <nr-icon name="search-x" size="medium"></nr-icon>
            <span>No nodes found</span>
          </div>
        ` : filteredCategories.map(category => html`
          <div class="palette-category">
            <div
              class="category-header"
              @click=${() => data.onToggleCategory(category.id)}
            >
              <nr-icon name=${category.icon || 'folder'} size="small"></nr-icon>
              <span>${category.name}</span>
              <nr-icon
                name=${data.expandedCategories.has(category.id) || searchTerm ? 'chevron-down' : 'chevron-right'}
                size="small"
              ></nr-icon>
            </div>
            ${data.expandedCategories.has(category.id) || searchTerm ? html`
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
