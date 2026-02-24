/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import {
  Workflow,
  WorkflowNode,
  CanvasType,
  isWhiteboardNode,
  WhiteboardNodeType,
} from './workflow-canvas.types.js';
import { styles } from './whiteboard-canvas.style.js';
import './whiteboard-node.component.js';

// Templates
import {
  renderWbSidebarTemplate,
} from './templates/index.js';
import { renderWbFloatingToolbarTemplate } from './templates/wb-floating-toolbar.template.js';

// Base class
import { BaseCanvasElement } from './base-canvas.component.js';

// Constants
import { WHITEBOARD_NODE_DEFAULT_SIZE } from './canvas.constants.js';

/**
 * Whiteboard canvas component for visual whiteboard editing (Miro-style)
 *
 * @element whiteboard-canvas
 * @fires workflow-changed - When whiteboard content is modified
 * @fires node-selected - When a node is selected
 * @fires viewport-changed - When viewport (pan/zoom) changes
 */
@customElement('whiteboard-canvas')
export class WhiteboardCanvasElement extends BaseCanvasElement {
  static override styles = styles;

  // ==================== Whiteboard-specific State ====================

  @state()
  private _wbActiveColorPicker: 'fill' | 'text' | 'border' | null = null;

  @state()
  private wbShapesFlyoutOpen = false;

  // ==================== Abstract Method Implementations ====================

  protected override normalizeNodes(nodes: WorkflowNode[]): WorkflowNode[] {
    // Clear stale _hiddenByFrame flags before recomputing containment.
    for (const node of nodes) {
      if (node.metadata) {
        delete (node.metadata as Record<string, unknown>)._hiddenByFrame;
      }
    }
    return nodes;
  }

  protected override getNodeDimensionsForContainment(node: WorkflowNode): { width: number; height: number } {
    const config = node.configuration || {};
    return {
      width: (config.width as number) || WHITEBOARD_NODE_DEFAULT_SIZE,
      height: (config.height as number) || WHITEBOARD_NODE_DEFAULT_SIZE,
    };
  }

  protected override shouldExcludeFromContainment(_node: WorkflowNode): boolean {
    return false;
  }

  protected override onWorkflowLoaded(_value: Workflow, _oldValue: Workflow): void {
    // No whiteboard-specific post-load actions
  }

  protected override getNoteContentKey(node: WorkflowNode): string {
    return node.type === WhiteboardNodeType.ANCHOR ? 'anchorLabel' : 'textContent';
  }

  protected override getNoteSizeKeys(): { widthKey: string; heightKey: string } {
    return { widthKey: 'width', heightKey: 'height' };
  }

  protected override getDefaultNoteSize(): { width: number; height: number } {
    return { width: WHITEBOARD_NODE_DEFAULT_SIZE, height: WHITEBOARD_NODE_DEFAULT_SIZE };
  }

  protected override getCanvasType(): CanvasType {
    return CanvasType.WHITEBOARD;
  }

  // ==================== Hook Overrides ====================

  protected override onCanvasMouseDownExtra(_e: MouseEvent): void {
    if (this._wbActiveColorPicker) this._wbActiveColorPicker = null;
    if (this.wbShapesFlyoutOpen) this.wbShapesFlyoutOpen = false;
  }

  protected override onGlobalMouseMoveExtra(e: MouseEvent): boolean {
    if (this.noteResizeState) {
      this.handleNoteResizeDrag(e);
      return true;
    }
    return false;
  }

  protected override onNoteResizeStarted(_node: WorkflowNode, _event: MouseEvent): void {
    document.addEventListener('touchmove', this.handleNoteResizeTouchDrag, { passive: false });
    document.addEventListener('touchend', this.stopNoteResizeTouch);
  }

  protected override onNoteResizeStopped(nodeId: string): void {
    document.removeEventListener('touchmove', this.handleNoteResizeTouchDrag);
    document.removeEventListener('touchend', this.stopNoteResizeTouch);

    if (this.collaborative && nodeId) {
      const node = this.workflow.nodes.find(n => n.id === nodeId);
      if (node) {
        const config = node.configuration || {};
        this.collaborationController.broadcastOperation('RESIZE', nodeId, {
          width: (config.width as number) || WHITEBOARD_NODE_DEFAULT_SIZE,
          height: (config.height as number) || WHITEBOARD_NODE_DEFAULT_SIZE,
        });
      }
    }
  }

  // Touch resize handlers
  private readonly handleNoteResizeTouchDrag = (event: TouchEvent) => {
    event.preventDefault();
    if (event.touches.length > 0) {
      this.handleNoteResizeWithCoords(event.touches[0].clientX, event.touches[0].clientY);
    }
  };

  private readonly stopNoteResizeTouch = () => {
    this.stopNoteResize();
  };

  // ==================== Whiteboard Event Handlers ====================

  private handleNodeDblClick(e: CustomEvent) {
    if (this.disabled) return;
    const { node } = e.detail;

    // For whiteboard text nodes and anchors, enter inline edit mode
    if (node.type === WhiteboardNodeType.STICKY_NOTE || node.type === WhiteboardNodeType.TEXT_BLOCK || node.type === WhiteboardNodeType.ANCHOR) {
      if (this.readonly) return;
      this.editingNoteId = node.id;
      if (this.collaborative) {
        this.collaborationController.broadcastTypingStart(node.id);
      }
      this.updateComplete.then(() => {
        const nodeEl = this.shadowRoot?.querySelector(`whiteboard-node[data-node-id="${node.id}"]`);
        const editableEl = (nodeEl?.shadowRoot?.querySelector('.wb-textarea') ||
                            nodeEl?.shadowRoot?.querySelector('.wb-anchor-input')) as HTMLInputElement | HTMLTextAreaElement;
        if (editableEl) {
          editableEl.focus();
          editableEl.select();
        }
      });
      return;
    }

    // For other whiteboard nodes, open config panel
    if (isWhiteboardNode(node.type)) {
      this.configuredNode = node;
      return;
    }
  }

  private executeNodeAction(node: WorkflowNode): void {
    const action = node.configuration?.onClickAction;
    if (action === 'pan-to-anchor') {
      const targetId = node.configuration?.onClickTargetAnchorId;
      if (!targetId) return;
      const targetNode = this.workflow?.nodes.find((n: WorkflowNode) => n.id === targetId);
      if (targetNode) {
        this.viewportController.panToPosition(targetNode.position.x, targetNode.position.y);
      }
    }
  }

  private handleNodeClickAction(e: CustomEvent) {
    if (this.disabled) return;
    this.executeNodeAction(e.detail.node);
  }

  private getActionTargetLabel(node: WorkflowNode): string {
    const targetId = node.configuration?.onClickTargetAnchorId as string;
    if (!targetId) return '';
    const target = this.workflow?.nodes.find((n: WorkflowNode) => n.id === targetId);
    return (target?.configuration?.anchorLabel as string) || 'Anchor';
  }

  private handleNodeActionTrigger(e: CustomEvent) {
    if (this.disabled) return;
    this.executeNodeAction(e.detail.node);
  }

  // ==================== Whiteboard Sidebar ====================

  private renderWbSidebar() {
    return renderWbSidebarTemplate({
      mode: this.mode,
      readonly: this.readonly,
      shapesFlyoutOpen: this.wbShapesFlyoutOpen,
      onModeChange: (mode) => { this.mode = mode; },
      onAddNode: (type) => {
        this.addNode(type);
        this.wbShapesFlyoutOpen = false;
      },
      onToggleShapesFlyout: () => {
        this.wbShapesFlyoutOpen = !this.wbShapesFlyoutOpen;
      },
    });
  }

  // ==================== Whiteboard Floating Toolbar ====================

  private getSelectedWhiteboardNode(): WorkflowNode | null {
    if (this.selectedNodeIds.size !== 1) return null;
    const nodeId = Array.from(this.selectedNodeIds)[0];
    const node = this.workflow?.nodes.find(n => n.id === nodeId);
    if (!node || !isWhiteboardNode(node.type)) return null;
    return node;
  }

  private getNodeScreenPosition(node: WorkflowNode): { x: number; y: number } {
    const config = node.configuration || {};
    const width = (config.width as number) || WHITEBOARD_NODE_DEFAULT_SIZE;
    const x = (node.position.x + width / 2) * this.viewport.zoom + this.viewport.panX;
    const y = node.position.y * this.viewport.zoom + this.viewport.panY;
    return { x, y };
  }

  private handleWbToolbarAction(nodeId: string, key: string, value: unknown) {
    const updatedNodes = this.workflow.nodes.map(n => {
      if (n.id === nodeId) {
        return {
          ...n,
          configuration: { ...n.configuration, [key]: value },
        };
      }
      return n;
    });
    this.setWorkflow({ ...this.workflow, nodes: updatedNodes });
    this.dispatchWorkflowChanged();
    if (this.collaborative) {
      this.collaborationController.broadcastOperation('UPDATE', nodeId, { [key]: value });
    }
  }

  private handleWbDeleteNode(_nodeId: string) {
    if (this.collaborative) {
      const deletedNodeIds = Array.from(this.selectedNodeIds);
      const deletedEdgeIds = Array.from(this.selectedEdgeIds);
      this.selectionController.deleteSelected();
      for (const nodeId of deletedNodeIds) {
        this.collaborationController.broadcastOperation('DELETE', nodeId, {});
      }
      for (const edgeId of deletedEdgeIds) {
        this.collaborationController.broadcastOperation('DELETE_CONNECTOR', edgeId, {});
      }
    } else {
      this.selectionController.deleteSelected();
    }
  }

  private _handleWbColorHolderClick(type: 'fill' | 'text' | 'border', e: MouseEvent) {
    e.stopPropagation();
    this._wbActiveColorPicker = this._wbActiveColorPicker === type ? null : type;
  }

  private renderWbFloatingToolbar() {
    const node = this.getSelectedWhiteboardNode();
    if (!node || this.readonly || this.editingNoteId) {
      if (this._wbActiveColorPicker) this._wbActiveColorPicker = null;
      return nothing;
    }

    return renderWbFloatingToolbarTemplate({
      node,
      nodeScreenPosition: this.getNodeScreenPosition(node),
      viewportZoom: this.viewport.zoom,
      activeColorPicker: this._wbActiveColorPicker,
      shadowRoot: this.shadowRoot,
      hostBoundingRect: this.getBoundingClientRect(),
      callbacks: {
        onToolbarAction: (nodeId, key, value) => this.handleWbToolbarAction(nodeId, key, value),
        onDeleteNode: (nodeId) => this.handleWbDeleteNode(nodeId),
        onColorHolderClick: (type, e) => this._handleWbColorHolderClick(type, e),
      },
    });
  }

  // ==================== Main Render ====================

  override render() {
    return html`
      <div
        class="canvas-wrapper"
        data-theme=${this.currentTheme}
        data-mode=${this.mode}
        @mousedown=${this.handleCanvasMouseDown}
        @contextmenu=${this.handleCanvasContextMenu}
        @drop=${this.handleCanvasDrop}
        @dragover=${this.handleCanvasDragOver}
      >
        <div class="canvas-grid"></div>

        <div class="canvas-viewport">
          <!-- Edges SVG layer -->
          <svg class="edges-svg">
            ${this.renderEdges()}
          </svg>

          <!-- Frame nodes layer (rendered behind regular nodes) -->
          <div class="frames-layer">
            ${this.getFrameNodes().map(frame => {
              const config = frame.configuration || {};
              return config.frameCollapsed
                ? null
                : this.renderExpandedFrame(frame);
            })}
          </div>

          <!-- Nodes layer -->
          <div class="nodes-layer">
            ${this.getVisibleNonFrameNodes().map(node => html`
              <whiteboard-node
                data-node-id=${node.id}
                .node=${node}
                ?selected=${this.selectedNodeIds.has(node.id)}
                ?dragging=${this.dragState?.nodeId === node.id}
                ?editing=${this.editingNoteId === node.id}
                .connectingPortId=${this.connectionState?.sourcePortId || null}
                .remoteSelection=${this.collaborative
                  ? this.collaborationController.isElementSelectedByRemote(node.id)
                  : null}
                .remoteTyping=${this.collaborative
                  ? this.collaborationController.isElementBeingTypedByRemote(node.id)
                  : null}
                .actionTargetLabel=${this.getActionTargetLabel(node)}
                @node-mousedown=${this.handleNodeMouseDown}
                @node-dblclick=${this.handleNodeDblClick}
                @node-click=${this.handleNodeClickAction}
                @node-action-trigger=${this.handleNodeActionTrigger}
                @port-mousedown=${this.handlePortMouseDown}
                @port-mouseup=${this.handlePortMouseUp}
                @note-content-change=${this.handleNoteContentChange}
                @note-edit-end=${this.handleNoteEditEnd}
                @note-resize-start=${this.handleNoteResizeStart}
              ></whiteboard-node>
            `)}
          </div>
        </div>

        ${this.renderRemoteCursors()}
        ${this.renderMarqueeBox()}
        ${this.renderEmptyState()}
        ${this.renderWbFloatingToolbar()}
        ${this.renderPresenceBar()}
        ${this.renderWbSidebar()}
        ${this.renderToolbar()}
        ${this.renderConfigPanel()}
        ${this.renderZoomControls()}
        ${this.renderContextMenu()}
      </div>
      ${this.renderChatbotPanel()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'whiteboard-canvas': WhiteboardCanvasElement;
  }
}
