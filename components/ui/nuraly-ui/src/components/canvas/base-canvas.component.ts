/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html, nothing } from 'lit';
import { property, state, query } from 'lit/decorators.js';
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
  type UndoProvider,
} from './workflow-canvas.types.js';
import { NuralyUIBaseMixin } from '@nuralyui/common/mixins';
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

// Templates
import {
  renderToolbarTemplate,
  renderZoomControlsTemplate,
  renderContextMenuTemplate,
  renderEmptyStateTemplate,
  renderConfigPanelTemplate,
  renderEdgesTemplate,
  renderRemoteCursorsTemplate,
  renderPresenceBarTemplate,
  renderChatbotPanelTemplate,
} from './templates/index.js';
import { renderExpandedFrameTemplate } from './templates/frame.template.js';

// Interfaces
import type { ConnectionState, DragState, CanvasHost, ContextMenuState, CanvasViewport } from './interfaces/index.js';

// Constants
import {
  FRAME_DEFAULT_WIDTH,
  FRAME_DEFAULT_HEIGHT,
  FRAME_DEFAULT_LABEL,
  NOTE_MIN_WIDTH,
  NOTE_MIN_HEIGHT,
  VIEWPORT_ADD_NODE_OFFSET_X,
  VIEWPORT_ADD_NODE_OFFSET_Y,
} from './canvas.constants.js';

/**
 * Abstract base class for canvas components (workflow & whiteboard).
 *
 * Shared infrastructure: controllers, lifecycle, event handlers,
 * dispatch helpers, frame handling, note editing, and render helpers.
 *
 * Subclasses implement abstract hooks for differences in node
 * normalization, containment dimensions, note config keys, etc.
 */
export abstract class BaseCanvasElement extends NuralyUIBaseMixin(LitElement) implements CanvasHost {

  // ==================== Workflow Property ====================

  protected _workflow: Workflow = {
    id: '',
    name: '',
    nodes: [],
    edges: [],
  };

  @property({ type: Object })
  get workflow(): Workflow {
    return this._workflow;
  }

  set workflow(value: Workflow) {
    this.setWorkflow(value);
  }

  // ==================== Public Properties ====================

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

  @property({ attribute: false })
  get undoProvider(): UndoProvider | null {
    return this.undoController?.undoProvider ?? null;
  }

  set undoProvider(provider: UndoProvider | null) {
    if (this.undoController) {
      this.undoController.undoProvider = provider;
    }
  }

  // ==================== State ====================

  @state()
  viewport: CanvasViewport = { zoom: 1, panX: 0, panY: 0 };

  @state()
  mode: CanvasMode = CanvasMode.SELECT;

  @state()
  selectedNodeIds: Set<string> = new Set();

  @state()
  selectedEdgeIds: Set<string> = new Set();

  @state()
  connectionState: ConnectionState | null = null;

  @state()
  dragState: DragState | null = null;

  @state()
  contextMenu: ContextMenuState | null = null;

  @state()
  isPanning = false;

  @state()
  panStart: Position = { x: 0, y: 0 };

  @state()
  hoveredEdgeId: string | null = null;

  @state()
  marqueeState: MarqueeState | null = null;

  @state()
  lastMousePosition: Position | null = null;

  @state()
  protected editingFrameLabelId: string | null = null;

  @state()
  protected editingNoteId: string | null = null;

  @state()
  configuredNode: WorkflowNode | null = null;

  @state()
  insertPanelNode: WorkflowNode | null = null;

  @state()
  expandedCategories: Set<string> = new Set();

  // Canvas chatbot panel (AI Assistant)
  @state()
  protected showChatbotPanel = false;

  @state()
  protected chatbotUnreadCount = 0;

  protected canvasChatbotController: ChatbotCoreController | null = null;

  // ==================== Note Resize State ====================

  protected noteResizeState: {
    nodeId: string;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  } | null = null;

  // ==================== DOM Queries ====================

  @query('.canvas-wrapper')
  canvasWrapper!: HTMLElement;

  @query('.canvas-viewport')
  canvasViewport!: HTMLElement;

  @query('.config-panel')
  configPanel!: HTMLElement;

  @query('.insert-panel')
  insertPanel!: HTMLElement;

  @property({ attribute: false }) insertPanelColumns: any[] = [];
  @property({ type: String }) insertPanelSchemaName = '';

  // ==================== Controllers ====================

  protected viewportController!: ViewportController;
  protected selectionController!: SelectionController;
  protected connectionController!: ConnectionController;
  protected dragController!: DragController;
  protected configController!: ConfigController;
  protected marqueeController!: MarqueeController;
  protected clipboardController!: ClipboardController;
  protected keyboardController!: KeyboardController;
  protected undoController!: UndoController;
  protected frameController!: FrameController;
  protected collaborationController!: CollaborationController;

  // ==================== Constructor ====================

  constructor() {
    super();

    const host = this as unknown as CanvasHost & LitElement;

    this.viewportController = new ViewportController(host);
    this.selectionController = new SelectionController(host);
    this.connectionController = new ConnectionController(host);
    this.configController = new ConfigController(host);
    this.marqueeController = new MarqueeController(this as unknown as any);
    this.clipboardController = new ClipboardController(this as unknown as any);
    this.undoController = new UndoController(host);
    this.frameController = new FrameController(host);

    this.keyboardController = new KeyboardController(host, this.selectionController);
    this.keyboardController.setClipboardController(this.clipboardController);
    this.keyboardController.setUndoController(this.undoController);

    this.dragController = new DragController(host, this.viewportController);

    new TouchController( // NOSONAR — side-effect: self-registers as reactive controller via addController
      host,
      this.viewportController,
      this.dragController,
      this.selectionController,
    );

    this.selectionController.setUndoController(this.undoController);
    this.dragController.setUndoController(this.undoController);
    this.connectionController.setUndoController(this.undoController);
    this.configController.setUndoController(this.undoController);
    this.clipboardController.setUndoController(this.undoController);

    this.dragController.setFrameController(this.frameController);

    this.collaborationController = new CollaborationController(host);
  }

  // ==================== Abstract Methods ====================

  /** Normalize nodes during workflow setter (e.g. uppercase status, clear flags). */
  protected abstract normalizeNodes(nodes: WorkflowNode[]): WorkflowNode[];

  /** Node dimensions used for frame containment centre-point check. */
  protected abstract getNodeDimensionsForContainment(node: WorkflowNode): { width: number; height: number };

  /** Whether a non-frame node should be excluded from containment (e.g. NOTE in workflow). */
  protected abstract shouldExcludeFromContainment(node: WorkflowNode): boolean;

  /** Called after _workflow is set and viewport restored. */
  protected abstract onWorkflowLoaded(value: Workflow, oldValue: Workflow): void;

  /** Config key that stores a note's text content (e.g. 'noteContent' vs 'textContent'). */
  protected abstract getNoteContentKey(node: WorkflowNode): string;

  /** Config keys for note width/height (e.g. noteWidth/noteHeight vs width/height). */
  protected abstract getNoteSizeKeys(): { widthKey: string; heightKey: string };

  /** Default note size used when config has no width/height. */
  protected abstract getDefaultNoteSize(): { width: number; height: number };

  /** Canvas type for the toolbar template. */
  protected abstract getCanvasType(): CanvasType;

  // ==================== Overridable Hooks ====================

  /** Extra logic at the start of handleCanvasMouseDown (e.g. close colour picker). */
  protected onCanvasMouseDownExtra(_e: MouseEvent): void {}

  /** Extra logic in handleGlobalMouseMove; return true to short-circuit remaining handlers. */
  protected onGlobalMouseMoveExtra(_e: MouseEvent): boolean { return false; }

  /** Extra logic after standard handleNodeMouseDown (e.g. auto-open chat preview). */
  protected onNodeMouseDownExtra(_node: WorkflowNode): void {}

  /** Called at end of connectedCallback. */
  protected onConnected(): void {}

  /** Called at end of disconnectedCallback. */
  protected onDisconnected(): void {}

  /** Called when note resize starts (e.g. add touch listeners). */
  protected onNoteResizeStarted(_node: WorkflowNode, _event: MouseEvent): void {}

  /** Called when note resize stops (e.g. remove touch listeners, broadcast). */
  protected onNoteResizeStopped(_nodeId: string): void {}

  /** Return nodes for edge/frame/visible-node rendering. Workflow overrides to apply statuses. */
  protected getNodesForRendering(): WorkflowNode[] {
    return this.workflow.nodes;
  }

  // ==================== Frame Containment ====================

  private isNodeInsideFrame(
    node: WorkflowNode,
    frameLeft: number, frameTop: number, frameRight: number, frameBottom: number,
  ): boolean {
    const dims = this.getNodeDimensionsForContainment(node);
    const nodeCenterX = node.position.x + dims.width / 2;
    const nodeCenterY = node.position.y + dims.height / 2;
    return (
      nodeCenterX >= frameLeft && nodeCenterX <= frameRight &&
      nodeCenterY >= frameTop && nodeCenterY <= frameBottom
    );
  }

  private computeFrameContainment(nodes: WorkflowNode[]): WorkflowNode[] {
    const frames = nodes.filter(n => isFrameNode(n.type));
    for (const frame of frames) {
      const config = frame.configuration || {};
      const frameWidth = (config.frameWidth as number) || FRAME_DEFAULT_WIDTH;
      const frameHeight = (config.frameHeight as number) || FRAME_DEFAULT_HEIGHT;
      const frameLeft = frame.position.x;
      const frameTop = frame.position.y;
      const frameRight = frameLeft + frameWidth;
      const frameBottom = frameTop + frameHeight;
      const isCollapsed = config.frameCollapsed as boolean;

      const containedIds: string[] = [];

      for (const node of nodes) {
        if (node.id === frame.id || isFrameNode(node.type) || this.shouldExcludeFromContainment(node)) continue;

        if (this.isNodeInsideFrame(node, frameLeft, frameTop, frameRight, frameBottom)) {
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
    return nodes;
  }

  // ==================== Lifecycle ====================

  override async connectedCallback() {
    super.connectedCallback();
    globalThis.addEventListener('mouseup', this.handleGlobalMouseUp);
    globalThis.addEventListener('mousemove', this.handleGlobalMouseMove);
    await this.updateComplete;
    this.viewportController.updateTransform();

    if (this.collaborative && this.canvasId) {
      this.collaborationController.connect(this.canvasId, this.getCanvasType() as 'WORKFLOW' | 'WHITEBOARD');
    }

    this.onConnected();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    globalThis.removeEventListener('mouseup', this.handleGlobalMouseUp);
    globalThis.removeEventListener('mousemove', this.handleGlobalMouseMove);
    this.onDisconnected();
  }

  override willUpdate(changedProperties: Map<string | number | symbol, unknown>) {
    super.willUpdate(changedProperties);

    if (this.collaborative && changedProperties.has('selectedNodeIds')) {
      this.collaborationController.broadcastSelectionChange(Array.from(this.selectedNodeIds));
    }
  }

  // ==================== CanvasHost Interface ====================

  setWorkflow(workflow: Workflow): void {
    const oldValue = this._workflow;

    // Subclass-specific node normalization
    let nodes = this.normalizeNodes([...workflow.nodes]);

    // Shared frame containment computation
    nodes = this.computeFrameContainment(nodes);

    this._workflow = { ...workflow, nodes };
    this.requestUpdate('workflow', oldValue);

    // Restore viewport from workflow ONLY when loading a different workflow
    if (workflow.viewport && oldValue?.id !== workflow.id) {
      this.viewport = workflow.viewport;
      this.updateComplete.then(() => {
        this.viewportController?.updateTransform();
      });
    }

    // Subclass-specific post-load hook
    this.onWorkflowLoaded(workflow, oldValue);
  }

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

  // ==================== Event Handlers ====================

  protected handleGlobalMouseUp = (e: MouseEvent) => {
    if (this.disabled) return;

    const wasDragging = this.dragState;
    const draggedNodeIds = wasDragging ? new Set(this.selectedNodeIds) : null;

    this.dragController.stopDrag();
    this.viewportController.stopPan();
    this.connectionController.cancelConnection();

    if (this.marqueeState) {
      this.marqueeController.endSelection(e.shiftKey);
    }

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

  protected handleGlobalMouseMove = (e: MouseEvent) => {
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

    // Subclass hook — whiteboard uses this for note resize short-circuit
    if (this.onGlobalMouseMoveExtra(e)) return;

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

  protected handleCanvasMouseDown = (e: MouseEvent) => {
    if (this.disabled) return;

    // Subclass hook (e.g. close colour picker)
    this.onCanvasMouseDownExtra(e);

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

  protected handleCanvasContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    if (this.disabled) return;

    const menuType = this.selectedNodeIds.size > 0 ? 'node' : 'canvas';
    this.contextMenu = {
      x: e.clientX,
      y: e.clientY,
      type: menuType,
    };
  };

  protected handleNodeMouseDown(e: CustomEvent) {
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

    // Subclass hook
    this.onNodeMouseDownExtra(node);
  }

  protected handleEdgeClick(e: MouseEvent, edge: WorkflowEdge) {
    if (this.disabled) return;
    e.stopPropagation();
    this.selectionController.selectEdge(edge.id, e.shiftKey);
  }

  protected handlePortMouseDown(e: CustomEvent) {
    if (this.disabled || this.readonly) return;
    const { node, port, isInput, event } = e.detail;
    this.connectionController.startConnection(node, port, isInput, event);
  }

  protected handlePortMouseUp(e: CustomEvent) {
    if (this.disabled) return;
    const { node, port, isInput } = e.detail;
    const edgesBefore = this.workflow.edges.length;
    this.connectionController.completeConnection(node, port, isInput);

    if (this.collaborative && this.workflow.edges.length > edgesBefore) {
      const newEdge = this.workflow.edges[this.workflow.edges.length - 1];
      if (newEdge) {
        this.collaborationController.broadcastOperation('ADD_CONNECTOR', newEdge.id, { edge: newEdge });
      }
    }
  }

  // ==================== Node Operations ====================

  protected addNode(type: NodeType, position?: Position) {
    if (this.readonly) return;

    const pos = position || {
      x: (-this.viewport.panX + VIEWPORT_ADD_NODE_OFFSET_X) / this.viewport.zoom,
      y: (-this.viewport.panY + VIEWPORT_ADD_NODE_OFFSET_Y) / this.viewport.zoom,
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

  protected handleCanvasDrop = (e: DragEvent) => {
    e.preventDefault();
    if (this.disabled) return;
    const type = e.dataTransfer?.getData('application/workflow-node-type') as NodeType;
    if (!type) return;

    const rect = this.canvasWrapper.getBoundingClientRect();
    const x = (e.clientX - rect.left - this.viewport.panX) / this.viewport.zoom;
    const y = (e.clientY - rect.top - this.viewport.panY) / this.viewport.zoom;

    this.addNode(type, { x: Math.round(x / 20) * 20, y: Math.round(y / 20) * 20 });
  };

  protected handleCanvasDragOver = (e: DragEvent) => {
    if (this.disabled) return;
    e.preventDefault();
    e.dataTransfer!.dropEffect = 'copy';
  };

  protected getPortPosition(node: WorkflowNode, portId: string, isInput: boolean): Position {
    return this.connectionController.getPortPosition(node, portId, isInput);
  }

  // ==================== Frame Handling ====================

  protected getFrameNodes(): WorkflowNode[] {
    return this.getNodesForRendering().filter(node => isFrameNode(node.type));
  }

  protected getVisibleNonFrameNodes(): WorkflowNode[] {
    return this.getNodesForRendering().filter(node => {
      if (isFrameNode(node.type)) return false;
      if ((node.metadata as Record<string, unknown>)?._hiddenByFrame) return false;
      return true;
    });
  }

  protected renderExpandedFrame(frame: WorkflowNode) {
    return renderExpandedFrameTemplate({
      frame,
      isSelected: this.selectedNodeIds.has(frame.id),
      editingFrameLabelId: this.editingFrameLabelId,
      readonly: this.readonly,
      callbacks: {
        onFrameMouseDown: (e, f) => this.handleFrameMouseDown(e, f),
        onFrameDblClick: (e, f) => this.handleFrameDblClick(e, f),
        onFrameResize: (e, f, h) => this.handleFrameResize(e, f, h),
        onStartEditingLabel: (e, f) => this.startEditingFrameLabel(e, f),
        onLabelBlur: (e, f) => this.handleFrameLabelBlur(e, f),
        onLabelKeydown: (e, f) => this.handleFrameLabelKeydown(e, f),
      },
    });
  }

  protected handleFrameMouseDown(e: MouseEvent, frame: WorkflowNode) {
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

  protected handleFrameDblClick(e: MouseEvent, frame: WorkflowNode) {
    e.stopPropagation();
    this.frameController.toggleCollapsed(frame);
  }

  protected handleFrameResize(e: MouseEvent, frame: WorkflowNode, handle: string) {
    e.stopPropagation();
    this.frameController.startResize(e, frame, handle as any);
  }

  protected startEditingFrameLabel(e: MouseEvent, frame: WorkflowNode) {
    e.stopPropagation();
    e.preventDefault();
    if (this.readonly) return;

    this.editingFrameLabelId = frame.id;

    this.updateComplete.then(() => {
      const input = this.shadowRoot?.querySelector('.frame-label-input, .collapsed-frame-title-input') as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
    });
  }

  protected handleFrameLabelBlur(e: FocusEvent, frame: WorkflowNode) {
    const input = e.target as HTMLInputElement;
    const newLabel = input.value.trim() || FRAME_DEFAULT_LABEL;
    this.saveFrameLabel(frame, newLabel);
    this.editingFrameLabelId = null;
  }

  protected handleFrameLabelKeydown(e: KeyboardEvent, frame: WorkflowNode) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const input = e.target as HTMLInputElement;
      const newLabel = input.value.trim() || FRAME_DEFAULT_LABEL;
      this.saveFrameLabel(frame, newLabel);
      this.editingFrameLabelId = null;
    } else if (e.key === 'Escape') {
      e.preventDefault();
      this.editingFrameLabelId = null;
    }
  }

  protected saveFrameLabel(frame: WorkflowNode, newLabel: string) {
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

  // ==================== Note Content Editing ====================

  protected handleNoteContentChange(e: CustomEvent) {
    const { node, content } = e.detail;
    const configKey = this.getNoteContentKey(node);
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
      this.collaborationController.broadcastOperation('UPDATE_TEXT', node.id, { [configKey]: content });
    }
  }

  protected handleNoteEditEnd(_e: CustomEvent) {
    if (this.collaborative && this.editingNoteId) {
      this.collaborationController.broadcastTypingStop(this.editingNoteId);
    }
    this.editingNoteId = null;
  }

  // ==================== Note Resize ====================

  protected handleNoteResizeStart(e: CustomEvent) {
    const { node, event } = e.detail;
    this.startNoteResize(node, event);
  }

  protected startNoteResize(node: WorkflowNode, event: MouseEvent) {
    const config = node.configuration || {};
    const keys = this.getNoteSizeKeys();
    const defaults = this.getDefaultNoteSize();

    this.noteResizeState = {
      nodeId: node.id,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: (config[keys.widthKey] as number) || defaults.width,
      startHeight: (config[keys.heightKey] as number) || defaults.height,
    };

    document.addEventListener('mousemove', this.handleNoteResizeDrag);
    document.addEventListener('mouseup', this.stopNoteResize);

    this.onNoteResizeStarted(node, event);
  }

  protected handleNoteResizeWithCoords(clientX: number, clientY: number): void {
    if (!this.noteResizeState) return;

    const { nodeId, startX, startY, startWidth, startHeight } = this.noteResizeState;
    const node = this.workflow.nodes.find(n => n.id === nodeId);
    if (!node) return;

    const deltaX = (clientX - startX) / this.viewport.zoom;
    const deltaY = (clientY - startY) / this.viewport.zoom;

    const newWidth = Math.max(NOTE_MIN_WIDTH, startWidth + deltaX);
    const newHeight = Math.max(NOTE_MIN_HEIGHT, startHeight + deltaY);

    const keys = this.getNoteSizeKeys();
    node.configuration = {
      ...node.configuration,
      [keys.widthKey]: newWidth,
      [keys.heightKey]: newHeight,
    };

    this.requestUpdate();
  }

  protected handleNoteResizeDrag = (event: MouseEvent) => {
    this.handleNoteResizeWithCoords(event.clientX, event.clientY);
  };

  protected stopNoteResize = () => {
    if (!this.noteResizeState) return;

    const resizedNodeId = this.noteResizeState.nodeId;
    this.noteResizeState = null;
    document.removeEventListener('mousemove', this.handleNoteResizeDrag);
    document.removeEventListener('mouseup', this.stopNoteResize);

    this.onNoteResizeStopped(resizedNodeId);

    this.dispatchWorkflowChanged();
  };

  // ==================== Chatbot Panel ====================

  protected initCanvasChatbotController(): void {
    this.canvasChatbotController ??= new ChatbotCoreController();
  }

  toggleChatbotPanel(): void {
    this.showChatbotPanel = !this.showChatbotPanel;
    if (this.showChatbotPanel) {
      this.initCanvasChatbotController();
      this.chatbotUnreadCount = 0;
    }
  }

  // ==================== Render Helpers ====================

  protected renderEdges() {
    return renderEdgesTemplate({
      edges: this.workflow.edges,
      nodes: this.getNodesForRendering(),
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

  protected renderToolbar() {
    return renderToolbarTemplate({
      showToolbar: this.showToolbar,
      mode: this.mode,
      showPalette: this.showPalette,
      canvasType: this.getCanvasType(),
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

  protected renderZoomControls() {
    return renderZoomControlsTemplate({
      zoomPercentage: this.viewportController.getZoomPercentage(),
      onZoomIn: () => this.viewportController.zoomIn(),
      onZoomOut: () => this.viewportController.zoomOut(),
    });
  }

  protected renderContextMenu() {
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
      onCopy: () => { void this.clipboardController.copySelected(); },
      onCut: () => { void this.clipboardController.cutSelected(); },
      onPaste: () => { void this.clipboardController.pasteFromClipboard(); },
    });
  }

  protected renderEmptyState() {
    return renderEmptyStateTemplate({
      hasNodes: this.workflow.nodes.length > 0,
    });
  }

  protected renderMarqueeBox() {
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

  protected renderRemoteCursors() {
    if (!this.collaborative) return nothing;
    return renderRemoteCursorsTemplate({
      cursors: this.collaborationController.getCursors(),
      viewport: this.viewport,
    });
  }

  protected handlePanToUser(userId: string): void {
    const cursors = this.collaborationController.getCursors();
    const cursor = cursors.find(c => c.userId === userId);
    if (cursor) {
      this.viewportController.panToPosition(cursor.x, cursor.y);
    }
  }

  protected renderPresenceBar() {
    if (!this.collaborative) return nothing;
    return renderPresenceBarTemplate({
      users: this.collaborationController.getUsers(),
      connected: this.collaborationController.isConnected(),
      onUserClick: (userId: string) => this.handlePanToUser(userId),
    });
  }

  protected renderConfigPanel() {
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

  protected renderChatbotPanel() {
    return renderChatbotPanelTemplate(
      {
        isOpen: this.showChatbotPanel,
        controller: this.canvasChatbotController,
        unreadCount: this.chatbotUnreadCount,
        currentTheme: this.currentTheme,
      },
      {
        onClose: () => this.toggleChatbotPanel(),
      },
    );
  }
}
