/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, nothing } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import type { TemplateResult } from 'lit';
import type { WorkflowNode } from '../workflow-canvas.types.js';
import { WhiteboardNodeType } from '../workflow-canvas.types.js';
import {
  FILL_COLOR_PRESETS,
  BORDER_COLOR_PRESETS,
  TEXT_COLOR_PRESETS,
  FONT_FAMILY_OPTIONS,
  MERMAID_THEME_OPTIONS,
} from '../canvas.constants.js';

// ==================== Utility Functions ====================

interface ColorPickerConfig {
  currentColor: string;
  presets: readonly string[];
  configKey: string;
}

function getColorPickerConfig(
  activeColorPicker: 'fill' | 'text' | 'border' | null,
  config: Record<string, unknown>,
): ColorPickerConfig {
  if (activeColorPicker === 'fill') {
    return {
      currentColor: (config.backgroundColor || config.fillColor || '#fef08a') as string,
      presets: FILL_COLOR_PRESETS,
      configKey: 'backgroundColor',
    };
  }
  if (activeColorPicker === 'border') {
    return {
      currentColor: (config.borderColor || '#8b5cf6') as string,
      presets: BORDER_COLOR_PRESETS,
      configKey: 'borderColor',
    };
  }
  return {
    currentColor: (config.textColor || '#1a1a1a') as string,
    presets: TEXT_COLOR_PRESETS,
    configKey: 'textColor',
  };
}

export function wbHasText(node: WorkflowNode): boolean {
  return node.type === WhiteboardNodeType.STICKY_NOTE ||
         node.type === WhiteboardNodeType.TEXT_BLOCK ||
         node.type === WhiteboardNodeType.VOTING;
}

export function wbHasFill(node: WorkflowNode): boolean {
  return node.type !== WhiteboardNodeType.DRAWING &&
         node.type !== WhiteboardNodeType.SHAPE_LINE &&
         node.type !== WhiteboardNodeType.SHAPE_ARROW &&
         node.type !== WhiteboardNodeType.ANCHOR &&
         node.type !== WhiteboardNodeType.WORKFLOW &&
         node.type !== WhiteboardNodeType.DATABASE;
}

export function wbHasBorder(node: WorkflowNode): boolean {
  return node.type === WhiteboardNodeType.MERMAID ||
         node.type === WhiteboardNodeType.SHAPE_RECTANGLE ||
         node.type === WhiteboardNodeType.IMAGE ||
         node.type === WhiteboardNodeType.FRAME ||
         node.type === WhiteboardNodeType.WORKFLOW ||
         node.type === WhiteboardNodeType.DATABASE;
}

// ==================== Template Interface ====================

export interface WbFloatingToolbarCallbacks {
  onToolbarAction: (nodeId: string, key: string, value: unknown) => void;
  onDeleteNode: (nodeId: string) => void;
  onColorHolderClick: (type: 'fill' | 'text' | 'border', e: MouseEvent) => void;
}

export interface WbFloatingToolbarData {
  node: WorkflowNode;
  nodeScreenPosition: { x: number; y: number };
  viewportZoom: number;
  activeColorPicker: 'fill' | 'text' | 'border' | null;
  shadowRoot: ShadowRoot | null;
  hostBoundingRect: DOMRect;
  callbacks: WbFloatingToolbarCallbacks;
}

// ==================== Template ====================

export function renderWbFloatingToolbarTemplate(data: WbFloatingToolbarData): TemplateResult | typeof nothing {
  const { node, nodeScreenPosition, viewportZoom, activeColorPicker, shadowRoot, hostBoundingRect, callbacks } = data;

  const config = node.configuration || {};
  const hasText = wbHasText(node);
  const hasFill = wbHasFill(node);
  const hasBorder = wbHasBorder(node);

  const nodeWidth = ((config.width as number) || 200) * viewportZoom;
  const toolbarStyles = {
    left: `${nodeScreenPosition.x + nodeWidth / 2}px`,
    top: `${nodeScreenPosition.y - 52}px`,
  };

  const renderColorPicker = (): TemplateResult | typeof nothing => {
    if (!activeColorPicker) return nothing;
    const holderEl = shadowRoot?.querySelector(
      `.wb-color-trigger-${activeColorPicker}`
    ) as HTMLElement;
    if (!holderEl) return nothing;

    const rect = holderEl.getBoundingClientRect();
    const pickerStyles = {
      left: `${rect.left - hostBoundingRect.left}px`,
      top: `${rect.bottom - hostBoundingRect.top + 6}px`,
    };

    const { currentColor, presets, configKey } = getColorPickerConfig(activeColorPicker, config);

    return html`
      <div class="wb-color-picker-panel" style=${styleMap(pickerStyles)} @mousedown=${(e: MouseEvent) => e.stopPropagation()}>
        <div class="wb-picker-presets">
          ${presets.map(c => html`
            <button
              class="wb-picker-swatch ${currentColor === c ? 'active' : ''}"
              style="background: ${c};"
              @click=${() => callbacks.onToolbarAction(node.id, configKey, c)}
            ></button>
          `)}
        </div>
        <div class="wb-picker-custom">
          <input
            type="color"
            class="wb-picker-native"
            .value=${currentColor}
            @input=${(e: Event) => callbacks.onToolbarAction(node.id, configKey, (e.target as HTMLInputElement).value)}
          />
          <nr-input
            type="text"
            size="small"
            variant="outlined"
            .value=${currentColor}
            placeholder="#hex"
            style="flex: 1;"
            @nr-input=${(e: CustomEvent) => {
              const val = (e.target as any).value;
              if (val && CSS.supports('color', val)) {
                callbacks.onToolbarAction(node.id, configKey, val);
              }
            }}
          ></nr-input>
        </div>
      </div>
    `;
  };

  return html`
    <div class="wb-floating-toolbar" style=${styleMap(toolbarStyles)} @mousedown=${(e: MouseEvent) => e.stopPropagation()}>
      ${hasFill ? html`
        <div class="wb-toolbar-group">
          <label class="wb-toolbar-label">Fill</label>
          <nr-colorholder-box
            class="wb-color-trigger-fill"
            .color=${config.backgroundColor || config.fillColor || '#fef08a'}
            size="small"
            @click=${(e: MouseEvent) => callbacks.onColorHolderClick('fill', e)}
          ></nr-colorholder-box>
        </div>
      ` : nothing}

      ${hasBorder ? html`
        <div class="wb-toolbar-divider"></div>
        <div class="wb-toolbar-group">
          <label class="wb-toolbar-label">Border</label>
          <nr-colorholder-box
            class="wb-color-trigger-border"
            .color=${config.borderColor || '#8b5cf6'}
            size="small"
            @click=${(e: MouseEvent) => callbacks.onColorHolderClick('border', e)}
          ></nr-colorholder-box>
        </div>
      ` : nothing}

      ${hasText ? html`
        <div class="wb-toolbar-divider"></div>
        <div class="wb-toolbar-group">
          <label class="wb-toolbar-label">Text</label>
          <nr-colorholder-box
            class="wb-color-trigger-text"
            .color=${config.textColor || '#1a1a1a'}
            size="small"
            @click=${(e: MouseEvent) => callbacks.onColorHolderClick('text', e)}
          ></nr-colorholder-box>
        </div>
        <div class="wb-toolbar-divider"></div>
        <div class="wb-toolbar-group">
          <label class="wb-toolbar-label">Size</label>
          <nr-input
            type="number"
            size="small"
            variant="outlined"
            .value=${String((config.fontSize as number) || 14)}
            min="8"
            max="120"
            step="1"
            style="width: 80px;"
            @nr-input=${(e: CustomEvent) => {
              const val = Number.parseInt((e.target as any).value, 10);
              if (!Number.isNaN(val) && val > 0) {
                callbacks.onToolbarAction(node.id, 'fontSize', val);
              }
            }}
          ></nr-input>
        </div>
        <div class="wb-toolbar-divider"></div>
        <div class="wb-toolbar-group">
          <label class="wb-toolbar-label">Font</label>
          <nr-select
            size="small"
            .options=${[...FONT_FAMILY_OPTIONS]}
            .value=${config.fontFamily || 'Inter, sans-serif'}
            placeholder="Font"
            style="width: 130px;"
            @nr-change=${(e: CustomEvent) => {
              const selected = (e.target as any).value;
              if (selected) {
                callbacks.onToolbarAction(node.id, 'fontFamily', selected);
              }
            }}
          ></nr-select>
        </div>
      ` : nothing}

      ${node.type === WhiteboardNodeType.MERMAID ? html`
        <div class="wb-toolbar-divider"></div>
        <div class="wb-toolbar-group">
          <label class="wb-toolbar-label">Theme</label>
          <nr-select
            size="small"
            .options=${[...MERMAID_THEME_OPTIONS]}
            .value=${config.mermaidTheme || 'default'}
            placeholder="Theme"
            style="width: 110px;"
            @nr-change=${(e: CustomEvent) => {
              const selected = (e.target as any).value;
              if (selected) {
                callbacks.onToolbarAction(node.id, 'mermaidTheme', selected);
              }
            }}
          ></nr-select>
        </div>
      ` : nothing}

      <div class="wb-toolbar-divider"></div>
      <div class="wb-toolbar-group">
        <button class="wb-toolbar-btn danger" title="Delete" @click=${() => callbacks.onDeleteNode(node.id)}>
          <nr-icon name="trash-2" size="small"></nr-icon>
        </button>
      </div>
    </div>
    ${renderColorPicker()}
  `;
}
