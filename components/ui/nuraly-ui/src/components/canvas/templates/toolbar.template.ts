/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, nothing, TemplateResult } from 'lit';
import { CanvasMode, CanvasType } from '../workflow-canvas.types.js';

/**
 * Data required for rendering the toolbar
 */
export interface ToolbarTemplateData {
  showToolbar: boolean;
  mode: CanvasMode;
  showPalette: boolean;
  hasSelection: boolean;
  hasSingleSelection: boolean;
  readonly?: boolean;
  canUndo?: boolean;
  canRedo?: boolean;
  undoTooltip?: string;
  redoTooltip?: string;
  canvasType?: CanvasType;
  showChatbot?: boolean;
  onToggleChatbot?: () => void;
  chatbotUnreadCount?: number;
  // Name editing
  name?: string;
  isEditingName?: boolean;
  onStartEditName?: () => void;
  onNameInput?: (e: Event) => void;
  onNameBlur?: (e: FocusEvent) => void;
  onNameKeydown?: (e: KeyboardEvent) => void;
  onNamePaste?: (e: ClipboardEvent) => void;
  onSaveName?: () => void;
  onCancelEditName?: () => void;
  onModeChange: (mode: CanvasMode) => void;
  onTogglePalette: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onOpenConfig: () => void;
  onDelete: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
}

/**
 * Render the unread badge for the chatbot toggle button
 */
function renderChatbotBadge(count: number): TemplateResult | typeof nothing {
  if (count <= 0) return nothing;
  return html`<span class="toolbar-badge">${count}</span>`;
}

/**
 * Render the chatbot toggle button (only when callback is provided)
 */
function renderChatbotToggle(data: ToolbarTemplateData): TemplateResult | typeof nothing {
  if (!data.onToggleChatbot) return nothing;
  const activeClass = data.showChatbot ? 'active' : '';
  return html`
    <div class="toolbar-divider"></div>
    <button
      class="toolbar-btn ${activeClass}"
      @click=${data.onToggleChatbot}
      title="AI Assistant (Ctrl+/)"
    >
      <nr-icon name="message-circle" size="small"></nr-icon>
      ${renderChatbotBadge(data.chatbotUnreadCount ?? 0)}
    </button>
  `;
}

/**
 * Render the editable name section in the toolbar
 */
function renderToolbarName(data: ToolbarTemplateData): TemplateResult | typeof nothing {
  if (data.name == null || !data.onStartEditName) return nothing;

  if (data.isEditingName) {
    return html`
      <div class="toolbar-divider"></div>
      <div class="toolbar-name-container">
        <span
          class="toolbar-name editing"
          contenteditable="true"
          @input=${data.onNameInput}
          @blur=${data.onNameBlur}
          @keydown=${data.onNameKeydown}
          @paste=${data.onNamePaste}
        ></span>
        <button class="toolbar-name-action save" @click=${data.onSaveName} title="Save">
          <nr-icon name="check" size="small"></nr-icon>
        </button>
        <button class="toolbar-name-action cancel" @click=${data.onCancelEditName} title="Cancel">
          <nr-icon name="x" size="small"></nr-icon>
        </button>
      </div>
    `;
  }

  return html`
    <div class="toolbar-divider"></div>
    <button
      class="toolbar-name-btn"
      @click=${data.onStartEditName}
      ?disabled=${data.readonly}
      title="Click to rename"
    >
      <span class="toolbar-name-text">${data.name}</span>
      <nr-icon name="pencil" size="small" class="toolbar-name-edit-icon"></nr-icon>
    </button>
  `;
}

/**
 * Render the canvas toolbar
 */
export function renderToolbarTemplate(data: ToolbarTemplateData): TemplateResult | typeof nothing {
  if (!data.showToolbar) return nothing;

  return html`
    <div class="canvas-toolbar">
      <button
        class="toolbar-btn ${data.mode === CanvasMode.SELECT ? 'active' : ''}"
        @click=${() => data.onModeChange(CanvasMode.SELECT)}
        title="Select (V)"
      >
        <nr-icon name="mouse-pointer" size="small"></nr-icon>
      </button>
      <button
        class="toolbar-btn ${data.mode === CanvasMode.PAN ? 'active' : ''}"
        @click=${() => data.onModeChange(CanvasMode.PAN)}
        title="Pan (H)"
      >
        <nr-icon name="hand" size="small"></nr-icon>
      </button>
      ${data.canvasType !== CanvasType.WHITEBOARD ? html`
        <button
          class="toolbar-btn ${data.showPalette ? 'active' : ''}"
          @click=${data.onTogglePalette}
          ?disabled=${data.readonly}
          title="Add Node (N)"
        >
          <nr-icon name="plus" size="small"></nr-icon>
        </button>
      ` : nothing}
      ${renderToolbarName(data)}
      <div class="toolbar-divider"></div>
      <button
        class="toolbar-btn"
        @click=${data.onZoomIn}
        title="Zoom In"
      >
        <nr-icon name="zoom-in" size="small"></nr-icon>
      </button>
      <button
        class="toolbar-btn"
        @click=${data.onZoomOut}
        title="Zoom Out"
      >
        <nr-icon name="zoom-out" size="small"></nr-icon>
      </button>
      <button
        class="toolbar-btn"
        @click=${data.onResetView}
        title="Reset View"
      >
        <nr-icon name="maximize" size="small"></nr-icon>
      </button>
      <div class="toolbar-divider"></div>
      <button
        class="toolbar-btn"
        @click=${data.onUndo}
        ?disabled=${data.readonly || !data.canUndo}
        title=${data.undoTooltip || 'Undo (Ctrl+Z)'}
      >
        <nr-icon name="undo-2" size="small"></nr-icon>
      </button>
      <button
        class="toolbar-btn"
        @click=${data.onRedo}
        ?disabled=${data.readonly || !data.canRedo}
        title=${data.redoTooltip || 'Redo (Ctrl+Shift+Z)'}
      >
        <nr-icon name="redo-2" size="small"></nr-icon>
      </button>
      <div class="toolbar-divider"></div>
      <button
        class="toolbar-btn"
        @click=${data.onOpenConfig}
        ?disabled=${!data.hasSingleSelection}
        title="Edit Node (Enter)"
      >
        <nr-icon name="settings" size="small"></nr-icon>
      </button>
      <button
        class="toolbar-btn"
        @click=${data.onDelete}
        ?disabled=${data.readonly || !data.hasSelection}
        title="Delete Selected (Del)"
      >
        <nr-icon name="trash-2" size="small"></nr-icon>
      </button>
      ${renderChatbotToggle(data)}
    </div>
  `;
}

/**
 * Data required for rendering zoom controls
 */
export interface ZoomControlsTemplateData {
  zoomPercentage: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

/**
 * Render the zoom controls
 */
export function renderZoomControlsTemplate(data: ZoomControlsTemplateData): TemplateResult {
  return html`
    <div class="zoom-controls">
      <button class="toolbar-btn" @click=${data.onZoomOut}>
        <nr-icon name="minus" size="small"></nr-icon>
      </button>
      <span class="zoom-value">${data.zoomPercentage}%</span>
      <button class="toolbar-btn" @click=${data.onZoomIn}>
        <nr-icon name="plus" size="small"></nr-icon>
      </button>
    </div>
  `;
}
