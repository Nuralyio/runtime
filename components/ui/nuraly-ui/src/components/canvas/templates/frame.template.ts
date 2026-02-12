/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import type { TemplateResult } from 'lit';
import type { WorkflowNode } from '../workflow-canvas.types.js';
import {
  FRAME_DEFAULT_WIDTH,
  FRAME_DEFAULT_HEIGHT,
  FRAME_DEFAULT_BG_COLOR,
  FRAME_DEFAULT_BORDER_COLOR,
  FRAME_DEFAULT_LABEL,
  FRAME_DEFAULT_LABEL_POSITION,
  FRAME_DEFAULT_LABEL_PLACEMENT,
} from '../canvas.constants.js';

export interface FrameTemplateCallbacks {
  onFrameMouseDown: (e: MouseEvent, frame: WorkflowNode) => void;
  onFrameDblClick: (e: MouseEvent, frame: WorkflowNode) => void;
  onFrameResize: (e: MouseEvent, frame: WorkflowNode, handle: string) => void;
  onStartEditingLabel: (e: MouseEvent, frame: WorkflowNode) => void;
  onLabelBlur: (e: FocusEvent, frame: WorkflowNode) => void;
  onLabelKeydown: (e: KeyboardEvent, frame: WorkflowNode) => void;
}

export interface FrameTemplateData {
  frame: WorkflowNode;
  isSelected: boolean;
  editingFrameLabelId: string | null;
  readonly: boolean;
  callbacks: FrameTemplateCallbacks;
}

function renderFrameLabel(
  frame: WorkflowNode, label: string, editingFrameLabelId: string | null,
  labelPosition: string, labelPlacement: string, callbacks: FrameTemplateCallbacks,
): TemplateResult {
  const isEditing = editingFrameLabelId === frame.id;
  const labelContent = isEditing ? html`
    <input
      type="text"
      class="frame-label-input"
      .value=${label}
      @blur=${(e: FocusEvent) => callbacks.onLabelBlur(e, frame)}
      @keydown=${(e: KeyboardEvent) => callbacks.onLabelKeydown(e, frame)}
      @click=${(e: MouseEvent) => e.stopPropagation()}
      @mousedown=${(e: MouseEvent) => e.stopPropagation()}
    />
  ` : html`
    <span class="frame-label-text">
      ${label}
      <nr-icon
        name="edit-2"
        size="small"
        class="frame-label-edit-icon"
        @click=${(e: MouseEvent) => callbacks.onStartEditingLabel(e, frame)}
      ></nr-icon>
    </span>
  `;
  return html`<div class="frame-label ${labelPosition} ${labelPlacement}">${labelContent}</div>`;
}

export function renderExpandedFrameTemplate(data: FrameTemplateData): TemplateResult | null {
  const { frame, isSelected, editingFrameLabelId, callbacks } = data;
  const config = frame.configuration || {};
  const collapsed = config.frameCollapsed as boolean;
  if (collapsed) return null;

  const width = (config.frameWidth as number) || FRAME_DEFAULT_WIDTH;
  const height = (config.frameHeight as number) || FRAME_DEFAULT_HEIGHT;
  const bgColor = (config.frameBackgroundColor as string) || FRAME_DEFAULT_BG_COLOR;
  const borderColor = (config.frameBorderColor as string) || FRAME_DEFAULT_BORDER_COLOR;
  const label = (config.frameLabel as string) || FRAME_DEFAULT_LABEL;
  const labelPosition = (config.frameLabelPosition as string) || FRAME_DEFAULT_LABEL_POSITION;
  const labelPlacement = (config.frameLabelPlacement as string) || FRAME_DEFAULT_LABEL_PLACEMENT;
  const showLabel = config.frameShowLabel !== false;

  const frameStyles = {
    left: `${frame.position.x}px`,
    top: `${frame.position.y}px`,
    width: `${width}px`,
    height: `${height}px`,
    backgroundColor: bgColor,
    borderColor: borderColor,
  };

  return html`
    <div
      class="frame-node ${isSelected ? 'selected' : ''}"
      style=${styleMap(frameStyles)}
      data-frame-id=${frame.id}
      @mousedown=${(e: MouseEvent) => callbacks.onFrameMouseDown(e, frame)}
      @dblclick=${(e: MouseEvent) => callbacks.onFrameDblClick(e, frame)}
    >
      ${showLabel ? renderFrameLabel(frame, label, editingFrameLabelId, labelPosition, labelPlacement, callbacks) : null}
      ${isSelected ? html`
        <div class="resize-handle resize-se" @mousedown=${(e: MouseEvent) => callbacks.onFrameResize(e, frame, 'se')}></div>
        <div class="resize-handle resize-sw" @mousedown=${(e: MouseEvent) => callbacks.onFrameResize(e, frame, 'sw')}></div>
        <div class="resize-handle resize-ne" @mousedown=${(e: MouseEvent) => callbacks.onFrameResize(e, frame, 'ne')}></div>
        <div class="resize-handle resize-nw" @mousedown=${(e: MouseEvent) => callbacks.onFrameResize(e, frame, 'nw')}></div>
      ` : null}
    </div>
  `;
}
