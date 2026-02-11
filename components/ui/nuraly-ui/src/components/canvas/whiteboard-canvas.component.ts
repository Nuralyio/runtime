/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html, nothing } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import {
  Workflow,
  WorkflowNode,
  WorkflowEdge,
  NodeType,
  Position,
  CanvasMode,
  CanvasType,
  createNodeFromTemplate,
  isFrameNode,
  isWhiteboardNode,
  WhiteboardNodeType,
  type UndoProvider,
} from './workflow-canvas.types.js';
import { styles } from './whiteboard-canvas.style.js';
import { NuralyUIBaseMixin } from '@nuralyui/common/mixins';
import './whiteboard-node.component.js';
import '../icon/icon.component.js';
import '../input/input.component.js';
import '../chatbot/chatbot.component.js';
import { ChatbotCoreController } from '../chatbot/core/chatbot-core.controller.js';

// Controllers
import {
  ViewportController,
  SelectionController,
  ConnectionController,
  KeyboardController,
  DragController,
  ConfigController,
  MarqueeController,
  ClipboardController,
  UndoController,
  FrameController,
  CollaborationController,
  TouchController,
  type MarqueeState,
} from './controllers/index.js';
import { createToolbarNameCallbacks } from './utils/toolbar-name.utils.js';

// Templates
import {
  renderToolbarTemplate,
  renderZoomControlsTemplate,
  renderContextMenuTemplate,
  renderEmptyStateTemplate,
  renderConfigPanelTemplate,
  renderEdgesTemplate,
  renderWbSidebarTemplate,
  renderRemoteCursorsTemplate,
  renderPresenceBarTemplate,
  renderChatbotPanelTemplate,
} from './templates/index.js';

// Interfaces
import type { ConnectionState, DragState, CanvasHost, CanvasViewport } from './interfaces/index.js';

/**
 * Whiteboard canvas component for visual whiteboard editing (Miro-style)
 *
 * @element whiteboard-canvas
 * @fires workflow-changed - When whiteboard content is modified
 * @fires node-selected - When a node is selected
 * @fires viewport-changed - When viewport (pan/zoom) changes
 */
@customElement('whiteboard-canvas')
export class WhiteboardCanvasElement extends NuralyUIBaseMixin(LitElement) {
  static override styles = styles;

  private _workflow: Workflow = {
    id: '',
    name: 'New Whiteboard',
    nodes: [],
    edges: [],
  };

  @property({ type: Object })
  get workflow(): Workflow {
    return this._workflow;
  }

  set workflow(value: Workflow) {
    const oldValue = this._workflow;
    let nodes = [...value.nodes];

    // Clear stale _hiddenByFrame flags before recomputing containment.
    // This flag is transient runtime state and must be recalculated fresh.
    for (const node of nodes) {
      if (node.metadata) {
        delete (node.metadata as Record<string, unknown>)._hiddenByFrame;
      }
    }

    // Compute frame containment synchronously to avoid flash
    const frames = nodes.filter(n => isFrameNode(n.type));
    for (const frame of frames) {
      const config = frame.configuration || {};
      const frameWidth = (config.frameWidth as number) || 400;
      const frameHeight = (config.frameHeight as number) || 300;
      const frameLeft = frame.position.x;
      const frameTop = frame.position.y;
      const frameRight = frameLeft + frameWidth;
      const frameBottom = frameTop + frameHeight;
      const isCollapsed = config.frameCollapsed as boolean;

      const containedIds: string[] = [];
      const defaultNodeSize = 200;

      for (const node of nodes) {
        if (node.id === frame.id) continue;
        if (isFrameNode(node.type)) continue;

        const nodeWidth = (node.configuration?.width as number) || defaultNodeSize;
        const nodeHeight = (node.configuration?.height as number) || defaultNodeSize;
        const nodeCenterX = node.position.x + nodeWidth / 2;
        const nodeCenterY = node.position.y + nodeHeight / 2;

        if (nodeCenterX >= frameLeft && nodeCenterX <= frameRight &&
            nodeCenterY >= frameTop && nodeCenterY <= frameBottom) {
          containedIds.push(node.id);
          node.parentFrameId = frame.id;
          if (isCollapsed) {
            node.metadata = node.metadata || {};
            (node.metadata as Record<string, unknown>)._hiddenByFrame = true;
          }
        }
      }

      frame.containedNodeIds = containedIds;
    }

    this._workflow = {
      ...value,
      nodes,
    };
    this.requestUpdate('workflow', oldValue);

    // Restore viewport from workflow ONLY when loading a different workflow
    if (value.viewport && (!oldValue || oldValue.id !== value.id)) {
      this.viewport = value.viewport;
      this.updateComplete.then(() => {
        this.viewportController?.updateTransform();
      });
    }
  }

  @property({ type: Boolean })
  readonly = false;

  @property({ type: Boolean })
  disabled = false;

  @property({ type: Boolean })
  showMinimap = true;

  @property({ type: Boolean })
  showToolbar = true;

  @property({ type: Boolean })
  showPalette = false;

  @property({ type: String, attribute: 'canvas-id' })
  canvasId: string = '';

  @property({ type: Boolean, attribute: 'collaborative' })
  collaborative: boolean = false;

  /** Undo/redo provider injected by the host */
  @property({ attribute: false })
  get undoProvider(): UndoProvider | null {
    return this.undoController?.undoProvider ?? null;
  }

  set undoProvider(provider: UndoProvider | null) {
    if (this.undoController) {
      this.undoController.undoProvider = provider;
    }
  }

  @state()
  private viewport: CanvasViewport = { zoom: 1, panX: 0, panY: 0 };

  @state()
  private mode: CanvasMode = CanvasMode.SELECT;

  @state()
  private selectedNodeIds: Set<string> = new Set();

  @state()
  private selectedEdgeIds: Set<string> = new Set();

  @state()
  private connectionState: ConnectionState | null = null;

  @state()
  private dragState: DragState | null = null;

  @state()
  private contextMenu: { x: number; y: number; type: 'canvas' | 'node' | 'edge'; target?: string } | null = null;

  @state()
  private isPanning = false;

  @state()
  // @ts-ignore TS6133 — accessed by controllers via CanvasHost interface
  private panStart: Position = { x: 0, y: 0 };

  @state()
  private configuredNode: WorkflowNode | null = null;

  @state()
  private hoveredEdgeId: string | null = null;

  @state()
  private marqueeState: MarqueeState | null = null;

  @state()
  private _wbActiveColorPicker: 'fill' | 'text' | 'border' | null = null;

  @state()
  private wbShapesFlyoutOpen = false;

  @state()
  // @ts-ignore TS6133 — accessed by controllers via CanvasHost interface
  private lastMousePosition: Position | null = null;

  // Editing state
  @state()
  private editingNoteId: string | null = null;

  @state()
  private editingFrameLabelId: string | null = null;

  // Canvas chatbot panel (AI Assistant)
  @state()
  private showChatbotPanel = false;
  @state()
  private chatbotUnreadCount = 0;
  private canvasChatbotController: ChatbotCoreController | null = null;

  // Toolbar name editing (non-private — accessed by createToolbarNameCallbacks via CanvasNameEditable)
  @state()
  isEditingName = false;
  @state()
  editedName = '';

  @query('.canvas-wrapper')
  canvasWrapper!: HTMLElement;

  @query('.canvas-viewport')
  canvasViewport!: HTMLElement;

  @query('.config-panel')
  configPanel!: HTMLElement;

  // Controllers
  private viewportController!: ViewportController;
  private selectionController!: SelectionController;
  private connectionController!: ConnectionController;
  private dragController!: DragController;
  private configController!: ConfigController;
  private marqueeController!: MarqueeController;
  private clipboardController!: ClipboardController;
  private keyboardController!: KeyboardController;
  private undoController!: UndoController;
  private frameController!: FrameController;
  private collaborationController!: CollaborationController;


  constructor() {
    super();
    this.viewportController = new ViewportController(this as unknown as CanvasHost & LitElement);
    this.selectionController = new SelectionController(this as unknown as CanvasHost & LitElement);
    this.connectionController = new ConnectionController(this as unknown as CanvasHost & LitElement);
    this.configController = new ConfigController(this as unknown as CanvasHost & LitElement);
    this.marqueeController = new MarqueeController(this as unknown as any);
    this.clipboardController = new ClipboardController(this as unknown as any);
    this.undoController = new UndoController(this as unknown as CanvasHost & LitElement);
    this.frameController = new FrameController(this as unknown as CanvasHost & LitElement);

    this.keyboardController = new KeyboardController(
      this as unknown as CanvasHost & LitElement,
      this.selectionController
    );
    this.keyboardController.setClipboardController(this.clipboardController);
    this.keyboardController.setUndoController(this.undoController);

    this.dragController = new DragController(
      this as unknown as CanvasHost & LitElement,
      this.viewportController
    );

    new TouchController( // NOSONAR — side-effect: self-registers as reactive controller via addController
      this as unknown as CanvasHost & LitElement,
      this.viewportController,
      this.dragController,
      this.selectionController
    );

    this.selectionController.setUndoController(this.undoController);
    this.dragController.setUndoController(this.undoController);
    this.connectionController.setUndoController(this.undoController);
    this.configController.setUndoController(this.undoController);
    this.clipboardController.setUndoController(this.undoController);

    this.dragController.setFrameController(this.frameController);

    this.collaborationController = new CollaborationController(this as unknown as CanvasHost & LitElement);
  }

  // CanvasHost interface methods
  setWorkflow(workflow: Workflow): void {
    this.workflow = workflow;
  }

  override async connectedCallback() {
    super.connectedCallback();
    window.addEventListener('mouseup', this.handleGlobalMouseUp);
    window.addEventListener('mousemove', this.handleGlobalMouseMove);
    await this.updateComplete;
    this.viewportController.updateTransform();

    if (this.collaborative && this.canvasId) {
      this.collaborationController.connect(this.canvasId);
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('mouseup', this.handleGlobalMouseUp);
    window.removeEventListener('mousemove', this.handleGlobalMouseMove);
  }

  override willUpdate(changedProperties: Map<string | number | symbol, unknown>) {
    super.willUpdate(changedProperties);

    if (this.collaborative && changedProperties.has('selectedNodeIds')) {
      this.collaborationController.broadcastSelectionChange(Array.from(this.selectedNodeIds));
    }
  }

  // ==================== Event Handlers ====================

  private handleGlobalMouseUp = (e: MouseEvent) => {
    if (this.disabled) return;

    // Capture drag state before stopping to broadcast MOVE operations
    const wasDragging = this.dragState;
    const draggedNodeIds = wasDragging ? new Set(this.selectedNodeIds) : null;

    this.dragController.stopDrag();
    this.viewportController.stopPan();
    this.connectionController.cancelConnection();

    if (this.marqueeState) {
      this.marqueeController.endSelection(e.shiftKey);
    }

    // Broadcast MOVE for all dragged nodes
    if (this.collaborative && wasDragging && draggedNodeIds) {
      for (const nodeId of draggedNodeIds) {
        const node = this.workflow.nodes.find(n => n.id === nodeId);
        if (node) {
          this.collaborationController.broadcastOperation('MOVE', nodeId, {
            x: node.position.x,
            y: node.position.y,
          });
        }
      }
    }
  };

  private handleGlobalMouseMove = (e: MouseEvent) => {
    if (this.disabled) return;

    if (this.canvasWrapper) {
      const rect = this.canvasWrapper.getBoundingClientRect();
      this.lastMousePosition = {
        x: (e.clientX - rect.left - this.viewport.panX) / this.viewport.zoom,
        y: (e.clientY - rect.top - this.viewport.panY) / this.viewport.zoom,
      };
    }

    if (this.collaborative && this.lastMousePosition) {
      this.collaborationController.broadcastCursorMove(this.lastMousePosition.x, this.lastMousePosition.y);
    }

    if (this.noteResizeState) {
      this.handleNoteResizeDrag(e);
      return;
    }

    if (this.dragState) {
      this.dragController.handleDrag(e);
    }
    if (this.isPanning) {
      this.viewportController.handlePanDrag(e);
    }
    if (this.connectionState) {
      this.connectionController.updateConnectionPosition(e);
    }
    if (this.marqueeState) {
      this.marqueeController.updateSelection(e);
    }
  };

  private handleCanvasMouseDown = (e: MouseEvent) => {
    if (this.disabled) return;
    if (this._wbActiveColorPicker) this._wbActiveColorPicker = null;
    if (this.wbShapesFlyoutOpen) this.wbShapesFlyoutOpen = false;

    const target = e.target as HTMLElement;
    const isCanvasBackground = target.classList.contains('canvas-grid') || target.classList.contains('canvas-wrapper');

    if (e.button === 1) {
      e.preventDefault();
      this.viewportController.startPan(e);
    } else if (e.button === 0 && isCanvasBackground) {
      e.preventDefault();

      if (e.ctrlKey || e.metaKey || this.mode === CanvasMode.PAN) {
        this.viewportController.startPan(e);
        if (!e.shiftKey) {
          this.selectionController.clearSelection();
        }
      } else {
        this.marqueeController.startSelection(e, e.shiftKey);
      }
    }
  };

  private handleCanvasContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    if (this.disabled) return;

    const menuType = this.selectedNodeIds.size > 0 ? 'node' : 'canvas';
    this.contextMenu = {
      x: e.clientX,
      y: e.clientY,
      type: menuType,
    };
  };

  private handleNodeMouseDown(e: CustomEvent) {
    if (this.disabled) return;
    const { node, event } = e.detail;

    const isAlreadySelected = this.selectedNodeIds.has(node.id);

    if (event.shiftKey) {
      this.selectionController.selectNode(node.id, true);
    } else if (!isAlreadySelected) {
      this.selectionController.clearSelection();
      this.selectionController.selectNode(node.id, false);
    }

    if (this.configuredNode) {
      this.configuredNode = node;
    }

    if (!this.readonly) {
      this.dragController.startDrag(node, event);
    }

    this.dispatchNodeSelected(node);
  }

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

  private handlePortMouseDown(e: CustomEvent) {
    if (this.disabled || this.readonly) return;
    const { node, port, isInput, event } = e.detail;
    this.connectionController.startConnection(node, port, isInput, event);
  }

  private handlePortMouseUp(e: CustomEvent) {
    if (this.disabled) return;
    const { node, port, isInput } = e.detail;
    const edgesBefore = this.workflow.edges.length;
    this.connectionController.completeConnection(node, port, isInput);

    // Broadcast new edge if one was created
    if (this.collaborative && this.workflow.edges.length > edgesBefore) {
      const newEdge = this.workflow.edges[this.workflow.edges.length - 1];
      if (newEdge) {
        this.collaborationController.broadcastOperation('ADD_CONNECTOR', newEdge.id, { edge: newEdge });
      }
    }
  }

  private handleEdgeClick(e: MouseEvent, edge: WorkflowEdge) {
    if (this.disabled) return;
    e.stopPropagation();
    this.selectionController.selectEdge(edge.id, e.shiftKey);
  }

  // ==================== Node Operations ====================

  private addNode(type: NodeType, position?: Position) {
    if (this.readonly) return;

    const pos = position || {
      x: (-this.viewport.panX + 400) / this.viewport.zoom,
      y: (-this.viewport.panY + 200) / this.viewport.zoom,
    };

    const newNode = createNodeFromTemplate(type, pos);
    if (newNode) {
      this.undoController.recordNodeAdded(newNode);

      if (isFrameNode(type)) {
        this.workflow = {
          ...this.workflow,
          nodes: [newNode, ...this.workflow.nodes],
        };
        this.frameController.updateFrameContainment(newNode);
      } else {
        this.workflow = {
          ...this.workflow,
          nodes: [...this.workflow.nodes, newNode],
        };
        this.frameController.updateAllFrameContainments();
      }
      this.dispatchWorkflowChanged();
      if (this.collaborative) {
        this.collaborationController.broadcastOperation('ADD', newNode.id, { node: newNode });
      }
    }
  }

  private handleCanvasDrop = (e: DragEvent) => {
    e.preventDefault();
    if (this.disabled) return;
    const type = e.dataTransfer?.getData('application/workflow-node-type') as NodeType;
    if (!type) return;

    const rect = this.canvasWrapper.getBoundingClientRect();
    const x = (e.clientX - rect.left - this.viewport.panX) / this.viewport.zoom;
    const y = (e.clientY - rect.top - this.viewport.panY) / this.viewport.zoom;

    this.addNode(type, { x: Math.round(x / 20) * 20, y: Math.round(y / 20) * 20 });
  };

  private handleCanvasDragOver = (e: DragEvent) => {
    if (this.disabled) return;
    e.preventDefault();
    e.dataTransfer!.dropEffect = 'copy';
  };

  // ==================== Note Content Editing ====================

  private handleNoteContentChange(e: CustomEvent) {
    const { node, content } = e.detail;
    // Anchor nodes store their label in 'anchorLabel', others use 'textContent'
    const configKey = node.type === WhiteboardNodeType.ANCHOR ? 'anchorLabel' : 'textContent';
    const updatedNodes = this.workflow.nodes.map(n => {
      if (n.id === node.id) {
        return {
          ...n,
          configuration: {
            ...n.configuration,
            [configKey]: content,
          },
        };
      }
      return n;
    });

    this.setWorkflow({
      ...this.workflow,
      nodes: updatedNodes,
    });

    this.dispatchWorkflowChanged();
    if (this.collaborative) {
      this.collaborationController.broadcastOperation('UPDATE_TEXT', node.id, { textContent: content });
    }
  }

  private handleNoteEditEnd(_e: CustomEvent) {
    if (this.collaborative && this.editingNoteId) {
      this.collaborationController.broadcastTypingStop(this.editingNoteId);
    }
    this.editingNoteId = null;
  }

  // ==================== Note Resize ====================

  private noteResizeState: {
    nodeId: string;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  } | null = null;

  private handleNoteResizeStart(e: CustomEvent) {
    const { node, event } = e.detail;
    this.startNoteResize(node, event);
  }

  private startNoteResize(node: WorkflowNode, event: MouseEvent) {
    const config = node.configuration || {};
    // Whiteboard always uses width/height
    this.noteResizeState = {
      nodeId: node.id,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: (config.width as number) || 200,
      startHeight: (config.height as number) || 200,
    };

    document.addEventListener('mousemove', this.handleNoteResizeDrag);
    document.addEventListener('mouseup', this.stopNoteResize);
    document.addEventListener('touchmove', this.handleNoteResizeTouchDrag, { passive: false });
    document.addEventListener('touchend', this.stopNoteResizeTouch);
  }

  private handleNoteResizeWithCoords(clientX: number, clientY: number): void {
    if (!this.noteResizeState) return;

    const { nodeId, startX, startY, startWidth, startHeight } = this.noteResizeState;
    const node = this.workflow.nodes.find(n => n.id === nodeId);
    if (!node) return;

    const deltaX = (clientX - startX) / this.viewport.zoom;
    const deltaY = (clientY - startY) / this.viewport.zoom;

    const newWidth = Math.max(100, startWidth + deltaX);
    const newHeight = Math.max(50, startHeight + deltaY);

    // Whiteboard always uses width/height
    node.configuration = {
      ...node.configuration,
      width: newWidth,
      height: newHeight,
    };

    this.requestUpdate();
  }

  private handleNoteResizeDrag = (event: MouseEvent) => {
    this.handleNoteResizeWithCoords(event.clientX, event.clientY);
  };

  private readonly handleNoteResizeTouchDrag = (event: TouchEvent) => {
    event.preventDefault();
    if (event.touches.length > 0) {
      this.handleNoteResizeWithCoords(event.touches[0].clientX, event.touches[0].clientY);
    }
  };

  private stopNoteResize = () => {
    if (!this.noteResizeState) return;

    const resizedNodeId = this.noteResizeState.nodeId;
    this.noteResizeState = null;
    document.removeEventListener('mousemove', this.handleNoteResizeDrag);
    document.removeEventListener('mouseup', this.stopNoteResize);
    document.removeEventListener('touchmove', this.handleNoteResizeTouchDrag);
    document.removeEventListener('touchend', this.stopNoteResizeTouch);

    this.dispatchWorkflowChanged();
    if (this.collaborative && resizedNodeId) {
      const node = this.workflow.nodes.find(n => n.id === resizedNodeId);
      if (node) {
        const config = node.configuration || {};
        this.collaborationController.broadcastOperation('RESIZE', resizedNodeId, {
          width: (config.width as number) || 200,
          height: (config.height as number) || 200,
        });
      }
    }
  };

  private readonly stopNoteResizeTouch = () => {
    this.stopNoteResize();
  };

  // ==================== Frame Handling ====================

  private getFrameNodes(): WorkflowNode[] {
    return this.workflow.nodes.filter(node => isFrameNode(node.type));
  }

  private getVisibleNonFrameNodes(): WorkflowNode[] {
    return this.workflow.nodes.filter(node => {
      if (isFrameNode(node.type)) return false;
      if ((node.metadata as Record<string, unknown>)?._hiddenByFrame) return false;
      return true;
    });
  }

  private renderExpandedFrame(frame: WorkflowNode) {
    const config = frame.configuration || {};
    const collapsed = config.frameCollapsed as boolean;
    if (collapsed) return null;

    const width = (config.frameWidth as number) || 400;
    const height = (config.frameHeight as number) || 300;
    const bgColor = (config.frameBackgroundColor as string) || 'rgba(99, 102, 241, 0.05)';
    const borderColor = (config.frameBorderColor as string) || 'rgba(99, 102, 241, 0.3)';
    const label = (config.frameLabel as string) || 'Group';
    const labelPosition = (config.frameLabelPosition as string) || 'top-left';
    const labelPlacement = (config.frameLabelPlacement as string) || 'outside';
    const showLabel = config.frameShowLabel !== false;
    const isSelected = this.selectedNodeIds.has(frame.id);

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
        @mousedown=${(e: MouseEvent) => this.handleFrameMouseDown(e, frame)}
        @dblclick=${(e: MouseEvent) => this.handleFrameDblClick(e, frame)}
      >
        ${showLabel ? html`
          <div class="frame-label ${labelPosition} ${labelPlacement}">
            ${this.editingFrameLabelId === frame.id ? html`
              <input
                type="text"
                class="frame-label-input"
                .value=${label}
                @blur=${(e: FocusEvent) => this.handleFrameLabelBlur(e, frame)}
                @keydown=${(e: KeyboardEvent) => this.handleFrameLabelKeydown(e, frame)}
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
                  @click=${(e: MouseEvent) => this.startEditingFrameLabel(e, frame)}
                ></nr-icon>
              </span>
            `}
          </div>
        ` : null}
        ${isSelected ? html`
          <div class="resize-handle resize-se" @mousedown=${(e: MouseEvent) => this.handleFrameResize(e, frame, 'se')}></div>
          <div class="resize-handle resize-sw" @mousedown=${(e: MouseEvent) => this.handleFrameResize(e, frame, 'sw')}></div>
          <div class="resize-handle resize-ne" @mousedown=${(e: MouseEvent) => this.handleFrameResize(e, frame, 'ne')}></div>
          <div class="resize-handle resize-nw" @mousedown=${(e: MouseEvent) => this.handleFrameResize(e, frame, 'nw')}></div>
        ` : null}
      </div>
    `;
  }

  private handleFrameMouseDown(e: MouseEvent, frame: WorkflowNode) {
    e.stopPropagation();

    if (!e.shiftKey) {
      this.selectedNodeIds.clear();
      this.selectedEdgeIds.clear();
    }
    this.selectedNodeIds.add(frame.id);

    this.handleNodeMouseDown({
      detail: { node: frame, event: e },
    } as CustomEvent);

    this.requestUpdate();
  }

  private handleFrameDblClick(e: MouseEvent, frame: WorkflowNode) {
    e.stopPropagation();
    this.frameController.toggleCollapsed(frame);
  }

  private handleFrameResize(e: MouseEvent, frame: WorkflowNode, handle: string) {
    e.stopPropagation();
    this.frameController.startResize(e, frame, handle as any);
  }

  private startEditingFrameLabel(e: MouseEvent, frame: WorkflowNode) {
    e.stopPropagation();
    e.preventDefault();
    if (this.readonly) return;

    this.editingFrameLabelId = frame.id;

    this.updateComplete.then(() => {
      const input = this.shadowRoot?.querySelector('.frame-label-input') as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
    });
  }

  private handleFrameLabelBlur(e: FocusEvent, frame: WorkflowNode) {
    const input = e.target as HTMLInputElement;
    const newLabel = input.value.trim() || 'Group';
    this.saveFrameLabel(frame, newLabel);
    this.editingFrameLabelId = null;
  }

  private handleFrameLabelKeydown(e: KeyboardEvent, frame: WorkflowNode) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const input = e.target as HTMLInputElement;
      const newLabel = input.value.trim() || 'Group';
      this.saveFrameLabel(frame, newLabel);
      this.editingFrameLabelId = null;
    } else if (e.key === 'Escape') {
      e.preventDefault();
      this.editingFrameLabelId = null;
    }
  }

  private saveFrameLabel(frame: WorkflowNode, newLabel: string) {
    const updatedNodes = this.workflow.nodes.map(node => {
      if (node.id === frame.id) {
        return {
          ...node,
          name: newLabel,
          configuration: {
            ...node.configuration,
            frameLabel: newLabel,
          },
        };
      }
      return node;
    });

    this.setWorkflow({
      ...this.workflow,
      nodes: updatedNodes,
    });

    this.dispatchWorkflowChanged();
    if (this.collaborative) {
      this.collaborationController.broadcastOperation('UPDATE', frame.id, { frameLabel: newLabel });
    }
  }

  // ==================== Dispatch Methods ====================

  dispatchWorkflowChanged() {
    this.dispatchEvent(new CustomEvent('workflow-changed', {
      detail: { workflow: this.workflow },
      bubbles: true,
      composed: true,
    }));
  }

  dispatchViewportChanged() {
    this.dispatchEvent(new CustomEvent('viewport-changed', {
      detail: { viewport: this.viewport },
      bubbles: true,
      composed: true,
    }));
  }

  dispatchNodeSelected(node: WorkflowNode) {
    this.dispatchEvent(new CustomEvent('node-selected', {
      detail: { node },
      bubbles: true,
      composed: true,
    }));
  }

  dispatchNodeMoved(node: WorkflowNode, position: Position) {
    this.dispatchEvent(new CustomEvent('node-moved', {
      detail: { node, position },
      bubbles: true,
      composed: true,
    }));
  }

  // ==================== Port Position ====================

  private getPortPosition(node: WorkflowNode, portId: string, isInput: boolean): Position {
    return this.connectionController.getPortPosition(node, portId, isInput);
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
    const width = (config.width as number) || 200;
    const x = (node.position.x + width / 2) * this.viewport.zoom + this.viewport.panX;
    const y = node.position.y * this.viewport.zoom + this.viewport.panY;
    return { x, y };
  }

  private wbHasText(node: WorkflowNode): boolean {
    return node.type === WhiteboardNodeType.STICKY_NOTE ||
           node.type === WhiteboardNodeType.TEXT_BLOCK ||
           node.type === WhiteboardNodeType.VOTING;
  }

  private wbHasFill(node: WorkflowNode): boolean {
    return node.type !== WhiteboardNodeType.DRAWING &&
           node.type !== WhiteboardNodeType.SHAPE_LINE &&
           node.type !== WhiteboardNodeType.SHAPE_ARROW &&
           node.type !== WhiteboardNodeType.ANCHOR;
  }

  private wbHasBorder(node: WorkflowNode): boolean {
    return node.type === WhiteboardNodeType.MERMAID ||
           node.type === WhiteboardNodeType.SHAPE_RECTANGLE ||
           node.type === WhiteboardNodeType.IMAGE ||
           node.type === WhiteboardNodeType.FRAME;
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
      // Capture selected IDs before deletion
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

    const pos = this.getNodeScreenPosition(node);
    const hasText = this.wbHasText(node);
    const hasFill = this.wbHasFill(node);
    const hasBorder = this.wbHasBorder(node);
    const config = node.configuration || {};

    const nodeWidth = ((config.width as number) || 200) * this.viewport.zoom;
    const toolbarStyles = {
      left: `${pos.x + nodeWidth / 2}px`,
      top: `${pos.y - 52}px`,
    };

    const fontFamilyOptions = [
      { value: 'Inter, sans-serif', label: 'Inter' },
      { value: 'Arial, sans-serif', label: 'Arial' },
      { value: 'Georgia, serif', label: 'Georgia' },
      { value: 'Courier New, monospace', label: 'Courier New' },
      { value: 'Comic Sans MS, cursive', label: 'Comic Sans' },
      { value: 'Verdana, sans-serif', label: 'Verdana' },
    ];

    const renderColorPicker = () => {
      if (!this._wbActiveColorPicker) return nothing;
      const holderEl = this.shadowRoot?.querySelector(
        `.wb-color-trigger-${this._wbActiveColorPicker}`
      ) as HTMLElement;
      if (!holderEl) return nothing;

      const rect = holderEl.getBoundingClientRect();
      const canvasRect = this.getBoundingClientRect();
      const pickerStyles = {
        left: `${rect.left - canvasRect.left}px`,
        top: `${rect.bottom - canvasRect.top + 6}px`,
      };

      const pickerType = this._wbActiveColorPicker;
      const isFill = pickerType === 'fill';
      const isBorder = pickerType === 'border';
      const currentColor = isFill
        ? (config.backgroundColor || config.fillColor || '#fef08a')
        : isBorder
        ? (config.borderColor || '#8b5cf6')
        : (config.textColor || '#1a1a1a');
      const presets = isFill
        ? ['#fef08a', '#bbf7d0', '#bfdbfe', '#fecaca', '#e9d5ff', '#fed7aa', '#ffffff', '#f3f4f6']
        : isBorder
        ? ['#8b5cf6', '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#6b7280', '#1a1a1a', '#e5e7eb']
        : ['#1a1a1a', '#374151', '#713f12', '#1e3a5f', '#7f1d1d', '#4c1d95', '#ffffff'];
      const configKey = isFill ? 'backgroundColor' : isBorder ? 'borderColor' : 'textColor';

      return html`
        <div class="wb-color-picker-panel" style=${styleMap(pickerStyles)} @mousedown=${(e: MouseEvent) => e.stopPropagation()}>
          <div class="wb-picker-presets">
            ${presets.map(c => html`
              <button
                class="wb-picker-swatch ${currentColor === c ? 'active' : ''}"
                style="background: ${c};"
                @click=${() => this.handleWbToolbarAction(node.id, configKey, c)}
              ></button>
            `)}
          </div>
          <div class="wb-picker-custom">
            <input
              type="color"
              class="wb-picker-native"
              .value=${currentColor}
              @input=${(e: Event) => this.handleWbToolbarAction(node.id, configKey, (e.target as HTMLInputElement).value)}
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
                  this.handleWbToolbarAction(node.id, configKey, val);
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
              @click=${(e: MouseEvent) => this._handleWbColorHolderClick('fill', e)}
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
              @click=${(e: MouseEvent) => this._handleWbColorHolderClick('border', e)}
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
              @click=${(e: MouseEvent) => this._handleWbColorHolderClick('text', e)}
            ></nr-colorholder-box>
          </div>
          <div class="wb-toolbar-divider"></div>
          <div class="wb-toolbar-group">
            <label class="wb-toolbar-label">Size</label>
            <nr-input
              type="number"
              size="small"
              variant="outlined"
              .value=${String(config.fontSize || 14)}
              min="8"
              max="120"
              step="1"
              style="width: 80px;"
              @nr-input=${(e: CustomEvent) => {
                const val = parseInt((e.target as any).value, 10);
                if (!isNaN(val) && val > 0) {
                  this.handleWbToolbarAction(node.id, 'fontSize', val);
                }
              }}
            ></nr-input>
          </div>
          <div class="wb-toolbar-divider"></div>
          <div class="wb-toolbar-group">
            <label class="wb-toolbar-label">Font</label>
            <nr-select
              size="small"
              .options=${fontFamilyOptions}
              .value=${config.fontFamily || 'Inter, sans-serif'}
              placeholder="Font"
              style="width: 130px;"
              @nr-change=${(e: CustomEvent) => {
                const select = e.target as any;
                const selected = select.value;
                if (selected) {
                  this.handleWbToolbarAction(node.id, 'fontFamily', selected);
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
              .options=${[
                { value: 'default', label: 'Default' },
                { value: 'dark', label: 'Dark' },
                { value: 'forest', label: 'Forest' },
                { value: 'neutral', label: 'Neutral' },
                { value: 'base', label: 'Base' },
              ]}
              .value=${config.mermaidTheme || 'default'}
              placeholder="Theme"
              style="width: 110px;"
              @nr-change=${(e: CustomEvent) => {
                const selected = (e.target as any).value;
                if (selected) {
                  this.handleWbToolbarAction(node.id, 'mermaidTheme', selected);
                }
              }}
            ></nr-select>
          </div>
        ` : nothing}

        <div class="wb-toolbar-divider"></div>
        <div class="wb-toolbar-group">
          <button class="wb-toolbar-btn danger" title="Delete" @click=${() => this.handleWbDeleteNode(node.id)}>
            <nr-icon name="trash-2" size="small"></nr-icon>
          </button>
        </div>
      </div>
      ${renderColorPicker()}
    `;
  }

  // ==================== Template Renders ====================

  private renderEdges() {
    return renderEdgesTemplate({
      edges: this.workflow.edges,
      nodes: this.workflow.nodes,
      selectedEdgeIds: this.selectedEdgeIds,
      hoveredEdgeId: this.hoveredEdgeId,
      connectionState: this.connectionState,
      currentTheme: this.currentTheme,
      callbacks: {
        onEdgeClick: (e, edge) => this.handleEdgeClick(e, edge),
        onEdgeHover: (edgeId) => this.connectionController.setHoveredEdge(edgeId),
        getPortPosition: (node, portId, isInput) => this.getPortPosition(node, portId, isInput),
      },
    });
  }

  private initCanvasChatbotController(): void {
    this.canvasChatbotController ??= new ChatbotCoreController();
  }

  toggleChatbotPanel(): void {
    this.showChatbotPanel = !this.showChatbotPanel;
    if (this.showChatbotPanel) {
      this.initCanvasChatbotController();
      this.chatbotUnreadCount = 0;
    }
  }

  private renderChatbotPanel() {
    return renderChatbotPanelTemplate(
      {
        isOpen: this.showChatbotPanel,
        controller: this.canvasChatbotController,
        unreadCount: this.chatbotUnreadCount,
        currentTheme: this.currentTheme,
      },
      {
        onClose: () => this.toggleChatbotPanel(),
      }
    );
  }

  private renderToolbar() {
    return renderToolbarTemplate({
      showToolbar: this.showToolbar,
      mode: this.mode,
      showPalette: this.showPalette,
      canvasType: CanvasType.WHITEBOARD,
      hasSelection: this.selectedNodeIds.size > 0 || this.selectedEdgeIds.size > 0,
      hasSingleSelection: this.selectedNodeIds.size === 1,
      readonly: this.readonly,
      canUndo: this.undoController.canUndo(),
      canRedo: this.undoController.canRedo(),
      undoTooltip: this.undoController.getUndoTooltip(),
      redoTooltip: this.undoController.getRedoTooltip(),
      showChatbot: this.showChatbotPanel,
      onToggleChatbot: () => this.toggleChatbotPanel(),
      chatbotUnreadCount: this.chatbotUnreadCount,
      name: this.workflow.name,
      isEditingName: this.isEditingName,
      ...createToolbarNameCallbacks(this),
      onModeChange: (mode) => { this.mode = mode; },
      onTogglePalette: () => { this.showPalette = !this.showPalette; },
      onZoomIn: () => this.viewportController.zoomIn(),
      onZoomOut: () => this.viewportController.zoomOut(),
      onResetView: () => this.viewportController.resetView(),
      onOpenConfig: () => this.selectionController.openConfigForSelected(),
      onDelete: () => this.selectionController.deleteSelected(),
      onUndo: () => this.undoController.performUndo(),
      onRedo: () => this.undoController.performRedo(),
    });
  }

  private renderZoomControls() {
    return renderZoomControlsTemplate({
      zoomPercentage: this.viewportController.getZoomPercentage(),
      onZoomIn: () => this.viewportController.zoomIn(),
      onZoomOut: () => this.viewportController.zoomOut(),
    });
  }

  private renderContextMenu() {
    return renderContextMenuTemplate({
      contextMenu: this.contextMenu,
      readonly: this.readonly,
      hasSelection: this.selectedNodeIds.size > 0,
      onClose: () => { this.contextMenu = null; },
      onAddNode: () => { this.showPalette = !this.showPalette; },
      onSelectAll: () => this.selectionController.selectAll(),
      onResetView: () => this.viewportController.resetView(),
      onConfigure: () => this.selectionController.openConfigForSelected(),
      onDuplicate: () => this.selectionController.duplicateSelected(),
      onDelete: () => this.selectionController.deleteSelected(),
      onCopy: () => this.clipboardController.copySelected(),
      onCut: () => this.clipboardController.cutSelected(),
      onPaste: () => this.clipboardController.pasteFromClipboard(),
    });
  }

  private renderEmptyState() {
    return renderEmptyStateTemplate({
      hasNodes: this.workflow.nodes.length > 0,
    });
  }

  private renderMarqueeBox() {
    if (!this.marqueeState) return html``;

    const rect = this.marqueeController.getSelectionRect();

    const style = {
      left: `${rect.x * this.viewport.zoom + this.viewport.panX}px`,
      top: `${rect.y * this.viewport.zoom + this.viewport.panY}px`,
      width: `${rect.width * this.viewport.zoom}px`,
      height: `${rect.height * this.viewport.zoom}px`,
    };

    return html`
      <div class="selection-box" style=${styleMap(style)}></div>
    `;
  }

  // ==================== Collaboration Renders ====================

  private renderRemoteCursors() {
    if (!this.collaborative) return nothing;
    return renderRemoteCursorsTemplate({
      cursors: this.collaborationController.getCursors(),
      viewport: this.viewport,
    });
  }

  private handlePanToUser(userId: string): void {
    const cursors = this.collaborationController.getCursors();
    const cursor = cursors.find(c => c.userId === userId);
    if (cursor) {
      this.viewportController.panToPosition(cursor.x, cursor.y);
    }
  }

  private renderPresenceBar() {
    if (!this.collaborative) return nothing;
    return renderPresenceBarTemplate({
      users: this.collaborationController.getUsers(),
      connected: this.collaborationController.isConnected(),
      onUserClick: (userId: string) => this.handlePanToUser(userId),
    });
  }

  // ==================== Config Panel ====================

  private renderConfigPanel() {
    return renderConfigPanelTemplate({
      node: this.configuredNode,
      position: this.configController.getPanelPosition(),
      callbacks: {
        onClose: () => this.configController.closeConfig(),
        onUpdateName: (name) => this.configController.updateName(name),
        onUpdateDescription: (desc) => this.configController.updateDescription(desc),
        onUpdateConfig: (key, value) => {
          this.configController.updateConfig(key, value);
          if (this.collaborative && this.configuredNode) {
            this.collaborationController.broadcastOperation('UPDATE', this.configuredNode.id, { [key]: value });
          }
        },
      },
      workflow: this.workflow,
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
