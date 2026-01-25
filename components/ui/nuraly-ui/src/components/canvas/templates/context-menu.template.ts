/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, nothing, TemplateResult } from 'lit';
import { ContextMenuState } from '../interfaces/index.js';

/**
 * Data required for rendering the context menu
 */
export interface ContextMenuTemplateData {
  contextMenu: ContextMenuState | null;
  readonly?: boolean;
  onClose: () => void;
  onAddNode: () => void;
  onSelectAll: () => void;
  onResetView: () => void;
  onConfigure: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

/**
 * Render the context menu
 */
export function renderContextMenuTemplate(data: ContextMenuTemplateData): TemplateResult | typeof nothing {
  if (!data.contextMenu) return nothing;

  return html`
    <div
      class="context-menu"
      style="left: ${data.contextMenu.x}px; top: ${data.contextMenu.y}px;"
      @click=${data.onClose}
    >
      ${data.contextMenu.type === 'canvas' ? html`
        ${!data.readonly ? html`
          <div class="context-menu-item" @click=${data.onAddNode}>
            <nr-icon name="plus" size="small"></nr-icon>
            Add Node
          </div>
        ` : nothing}
        <div class="context-menu-item" @click=${data.onSelectAll}>
          <nr-icon name="check-square" size="small"></nr-icon>
          Select All
        </div>
        <div class="context-menu-divider"></div>
        <div class="context-menu-item" @click=${data.onResetView}>
          <nr-icon name="maximize" size="small"></nr-icon>
          Reset View
        </div>
      ` : nothing}
      ${data.contextMenu.type === 'node' ? html`
        <div class="context-menu-item" @click=${data.onConfigure}>
          <nr-icon name="settings" size="small"></nr-icon>
          Configure
        </div>
        ${!data.readonly ? html`
          <div class="context-menu-item" @click=${data.onDuplicate}>
            <nr-icon name="copy" size="small"></nr-icon>
            Duplicate
          </div>
          <div class="context-menu-divider"></div>
          <div class="context-menu-item danger" @click=${data.onDelete}>
            <nr-icon name="trash-2" size="small"></nr-icon>
            Delete
          </div>
        ` : nothing}
      ` : nothing}
    </div>
  `;
}
