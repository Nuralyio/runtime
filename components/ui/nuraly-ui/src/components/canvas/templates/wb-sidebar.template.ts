/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, nothing, TemplateResult } from 'lit';
import { CanvasMode, WhiteboardNodeType, type NodeType } from '../workflow-canvas.types.js';

/**
 * Shape definition for the shapes flyout
 */
interface ShapeItem {
  type: WhiteboardNodeType;
  icon: string;
  label: string;
}

const SHAPES: ShapeItem[] = [
  { type: WhiteboardNodeType.SHAPE_RECTANGLE, icon: 'square', label: 'Rectangle' },
  { type: WhiteboardNodeType.SHAPE_CIRCLE, icon: 'circle', label: 'Circle' },
  { type: WhiteboardNodeType.SHAPE_DIAMOND, icon: 'diamond', label: 'Diamond' },
  { type: WhiteboardNodeType.SHAPE_TRIANGLE, icon: 'triangle', label: 'Triangle' },
  { type: WhiteboardNodeType.SHAPE_ARROW, icon: 'arrow-right', label: 'Arrow' },
  { type: WhiteboardNodeType.SHAPE_LINE, icon: 'minus', label: 'Line' },
  { type: WhiteboardNodeType.SHAPE_STAR, icon: 'star', label: 'Star' },
  { type: WhiteboardNodeType.SHAPE_HEXAGON, icon: 'hexagon', label: 'Hexagon' },
];

/**
 * Data required for rendering the whiteboard sidebar
 */
export interface WbSidebarTemplateData {
  mode: CanvasMode;
  readonly: boolean;
  shapesFlyoutOpen: boolean;
  onModeChange: (mode: CanvasMode) => void;
  onAddNode: (type: NodeType) => void;
  onToggleShapesFlyout: () => void;
}

/**
 * Render the whiteboard left sidebar (Miro-style)
 */
export function renderWbSidebarTemplate(data: WbSidebarTemplateData): TemplateResult | typeof nothing {
  if (data.readonly) return nothing;

  return html`
    <div class="wb-sidebar" @mousedown=${(e: MouseEvent) => e.stopPropagation()}>
      <!-- Mode tools -->
      <button
        class="wb-sidebar-btn ${data.mode === CanvasMode.SELECT ? 'active' : ''}"
        @click=${() => data.onModeChange(CanvasMode.SELECT)}
        title="Select (V)"
      >
        <nr-icon name="mouse-pointer" size="small"></nr-icon>
      </button>
      <button
        class="wb-sidebar-btn ${data.mode === CanvasMode.PAN ? 'active' : ''}"
        @click=${() => data.onModeChange(CanvasMode.PAN)}
        title="Pan (H)"
      >
        <nr-icon name="hand" size="small"></nr-icon>
      </button>

      <div class="wb-sidebar-divider"></div>

      <!-- Element tools -->
      <button
        class="wb-sidebar-btn"
        @click=${() => data.onAddNode(WhiteboardNodeType.STICKY_NOTE)}
        title="Sticky Note"
      >
        <nr-icon name="sticky-note" size="small"></nr-icon>
      </button>
      <button
        class="wb-sidebar-btn"
        @click=${() => data.onAddNode(WhiteboardNodeType.TEXT_BLOCK)}
        title="Text Block"
      >
        <nr-icon name="type" size="small"></nr-icon>
      </button>

      <!-- Shapes with flyout -->
      <div class="wb-sidebar-shapes-wrapper">
        <button
          class="wb-sidebar-btn ${data.shapesFlyoutOpen ? 'active' : ''}"
          @click=${data.onToggleShapesFlyout}
          title="Shapes"
        >
          <nr-icon name="square" size="small"></nr-icon>
        </button>
        ${data.shapesFlyoutOpen ? html`
          <div class="wb-shapes-flyout">
            ${SHAPES.map(shape => html`
              <button
                class="wb-shapes-flyout-btn"
                @click=${() => data.onAddNode(shape.type)}
                title=${shape.label}
              >
                <nr-icon name=${shape.icon} size="small"></nr-icon>
              </button>
            `)}
          </div>
        ` : nothing}
      </div>

      <div class="wb-sidebar-divider"></div>

      <!-- Media & tools -->
      <button
        class="wb-sidebar-btn"
        @click=${() => data.onAddNode(WhiteboardNodeType.IMAGE)}
        title="Image"
      >
        <nr-icon name="image" size="small"></nr-icon>
      </button>
      <button
        class="wb-sidebar-btn"
        @click=${() => data.onAddNode(WhiteboardNodeType.DRAWING)}
        title="Drawing"
      >
        <nr-icon name="pen-tool" size="small"></nr-icon>
      </button>
      <button
        class="wb-sidebar-btn"
        @click=${() => data.onAddNode(WhiteboardNodeType.MERMAID)}
        title="Mermaid Diagram"
      >
        <nr-icon name="git-branch" size="small"></nr-icon>
      </button>
      <button
        class="wb-sidebar-btn"
        @click=${() => data.onAddNode(WhiteboardNodeType.VOTING)}
        title="Voting"
      >
        <nr-icon name="thumbs-up" size="small"></nr-icon>
      </button>
      <button
        class="wb-sidebar-btn"
        @click=${() => data.onAddNode(WhiteboardNodeType.WORKFLOW)}
        title="Workflow"
      >
        <nr-icon name="layers" size="small"></nr-icon>
      </button>

      <div class="wb-sidebar-divider"></div>

      <!-- Frame -->
      <button
        class="wb-sidebar-btn"
        @click=${() => data.onAddNode(WhiteboardNodeType.FRAME)}
        title="Frame"
      >
        <nr-icon name="frame" size="small"></nr-icon>
      </button>

      <!-- Anchor -->
      <button
        class="wb-sidebar-btn"
        @click=${() => data.onAddNode(WhiteboardNodeType.ANCHOR)}
        title="Anchor"
      >
        <nr-icon name="anchor" size="small"></nr-icon>
      </button>
    </div>
  `;
}
