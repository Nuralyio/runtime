/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html } from 'lit';
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
  ExecutionStatus,
  createNodeFromTemplate,
} from './workflow-canvas.types.js';
import { styles } from './workflow-canvas.style.js';
import { NuralyUIBaseMixin } from '@nuralyui/common/mixins';
import './workflow-node.component.js';
import '../icon/icon.component.js';
import '../input/input.component.js';
import '../chatbot/chatbot.component.js';

// Controllers
import {
  ViewportController,
  SelectionController,
  ConnectionController,
  KeyboardController,
  DragController,
  ConfigController,
} from './controllers/index.js';

// Templates
import {
  renderToolbarTemplate,
  renderZoomControlsTemplate,
  renderPaletteTemplate,
  renderContextMenuTemplate,
  renderEmptyStateTemplate,
  renderConfigPanelTemplate,
  renderEdgesTemplate,
} from './templates/index.js';

// Interfaces
import type { ConnectionState, DragState, CanvasHost, CanvasViewport } from './interfaces/index.js';

/**
 * Workflow canvas component for visual workflow editing
 *
 * @element workflow-canvas
 * @fires workflow-changed - When workflow is modified
 * @fires node-selected - When a node is selected
 * @fires node-configured - When a node configuration is requested
 */
@customElement('workflow-canvas')
export class WorkflowCanvasElement extends NuralyUIBaseMixin(LitElement) {
  static override styles = styles;

  private _workflow: Workflow = {
    id: '',
    name: 'New Workflow',
    nodes: [],
    edges: [],
  };

  @property({ type: Object })
  get workflow(): Workflow {
    return this._workflow;
  }

  set workflow(value: Workflow) {
    const oldValue = this._workflow;
    // Normalize node status values to uppercase
    this._workflow = {
      ...value,
      nodes: value.nodes.map(node => ({
        ...node,
        status: node.status
          ? (node.status.toUpperCase() as ExecutionStatus)
          : undefined,
      })),
    };
    this.requestUpdate('workflow', oldValue);

    // Restore viewport from workflow if available and this is a new workflow
    if (value.viewport && (!oldValue || oldValue.id !== value.id)) {
      this.viewport = value.viewport;
      // Update the CSS transform after the component renders
      this.updateComplete.then(() => {
        this.viewportController?.updateTransform();
      });
    }
  }

  @property({ type: Boolean })
  readonly = false;

  @property({ type: Boolean })
  showMinimap = true;

  @property({ type: Boolean })
  showToolbar = true;

  @property({ type: Boolean })
  showPalette = false;

  @property({ type: String })
  canvasType: CanvasType = CanvasType.WORKFLOW;

  /**
   * Map of node IDs to their current execution status
   * Used to show real-time execution progress on nodes
   */
  @property({ type: Object })
  nodeStatuses: Record<string, 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'> = {};

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
  private expandedCategories: Set<string> = new Set([
    'trigger', 'control', 'action', 'data', 'agent',
    'db-tables-views', 'db-relations-constraints', 'db-indexes-queries'
  ]);

  @state()
  private configuredNode: WorkflowNode | null = null;

  @state()
  private hoveredEdgeId: string | null = null;

  @state()
  private previewNodeId: string | null = null;

  @query('.canvas-wrapper')
  canvasWrapper!: HTMLElement;

  @query('.canvas-viewport')
  canvasViewport!: HTMLElement;

  @query('.config-panel')
  configPanel!: HTMLElement;

  // Controllers - initialized in constructor
  private viewportController!: ViewportController;
  private selectionController!: SelectionController;
  private connectionController!: ConnectionController;
  private dragController!: DragController;
  private configController!: ConfigController;

  constructor() {
    super();
    // Initialize controllers - they will add themselves via addController
    this.viewportController = new ViewportController(this as unknown as CanvasHost & LitElement);
    this.selectionController = new SelectionController(this as unknown as CanvasHost & LitElement);
    this.connectionController = new ConnectionController(this as unknown as CanvasHost & LitElement);
    this.configController = new ConfigController(this as unknown as CanvasHost & LitElement);
    // KeyboardController adds itself via addController, no need to store reference
    new KeyboardController(
      this as unknown as CanvasHost & LitElement,
      this.selectionController
    );
    this.dragController = new DragController(
      this as unknown as CanvasHost & LitElement,
      this.viewportController
    );
  }

  // CanvasHost interface methods for controllers
  setWorkflow(workflow: Workflow): void {
    this.workflow = workflow;
  }

  override async connectedCallback() {
    super.connectedCallback();
    // Note: Keyboard and wheel events are now handled by controllers
    window.addEventListener('mouseup', this.handleGlobalMouseUp);
    window.addEventListener('mousemove', this.handleGlobalMouseMove);
    await this.updateComplete;
    this.viewportController.updateTransform();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('mouseup', this.handleGlobalMouseUp);
    window.removeEventListener('mousemove', this.handleGlobalMouseMove);
  }

  // Note: Keyboard handling is now in KeyboardController

  private handleGlobalMouseUp = () => {
    this.dragController.stopDrag();
    this.viewportController.stopPan();
    this.connectionController.cancelConnection();
  };

  private handleGlobalMouseMove = (e: MouseEvent) => {
    if (this.dragState) {
      this.dragController.handleDrag(e);
    }
    if (this.isPanning) {
      this.viewportController.handlePanDrag(e);
    }
    if (this.connectionState) {
      this.connectionController.updateConnectionPosition(e);
    }
  };

  private handleCanvasMouseDown = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const isCanvasBackground = target.classList.contains('canvas-grid') || target.classList.contains('canvas-wrapper');

    if (e.button === 1) {
      // Middle click for panning
      e.preventDefault();
      this.viewportController.startPan(e);
    } else if (e.button === 0 && isCanvasBackground) {
      // Left click on empty canvas - start panning (like n8n)
      e.preventDefault();
      this.viewportController.startPan(e);
      this.selectionController.clearSelection();
    }
  };

  private handleCanvasContextMenu = (e: MouseEvent) => {
    e.preventDefault();

    // Check if a node is selected - if so, show node context menu
    const menuType = this.selectedNodeIds.size > 0 ? 'node' : 'canvas';

    this.contextMenu = {
      x: e.clientX,
      y: e.clientY,
      type: menuType,
    };
  };

  // Note: Wheel/pan/zoom handling is now in ViewportController

  private handleNodeMouseDown(e: CustomEvent) {
    const { node, event } = e.detail;

    if (!event.shiftKey) {
      if (!this.selectedNodeIds.has(node.id)) {
        this.selectionController.clearSelection();
      }
    }

    this.selectionController.selectNode(node.id, event.shiftKey);

    // Update config panel if it's open
    if (this.configuredNode) {
      this.configuredNode = node;
    }

    // Start dragging
    this.dragController.startDrag(node, event);

    this.dispatchNodeSelected(node);
  }

  // Note: Node drag handling is now in DragController

  private handleNodeDblClick(e: CustomEvent) {
    const { node } = e.detail;
    // Open configuration panel
    this.configuredNode = node;
    this.dispatchEvent(new CustomEvent('node-configured', {
      detail: { node },
      bubbles: true,
      composed: true,
    }));
  }

  private handleNodePreview(e: CustomEvent) {
    const { node } = e.detail;
    // Toggle preview panel - close if same node, open if different
    if (this.previewNodeId === node.id) {
      this.previewNodeId = null;
    } else {
      this.previewNodeId = node.id;
    }
  }

  private handleNodeTrigger(e: CustomEvent) {
    const { node } = e.detail;
    console.log('[Canvas] Node trigger clicked:', node.name, node.type);
    // Bubble up the trigger event for workflow execution
    this.dispatchEvent(new CustomEvent('workflow-trigger', {
      detail: { node },
      bubbles: true,
      composed: true,
    }));
  }

  private closePreviewPanel() {
    this.previewNodeId = null;
  }

  /**
   * Get the current preview node from workflow (live position)
   */
  private getPreviewNode(): WorkflowNode | null {
    if (!this.previewNodeId) return null;
    return this.workflow.nodes.find(n => n.id === this.previewNodeId) || null;
  }

  /**
   * Calculate preview panel position to the LEFT of the preview node
   */
  private getPreviewPanelPosition(): { x: number; y: number } | null {
    const previewNode = this.getPreviewNode();
    if (!previewNode) return null;

    const previewPanelWidth = 420;
    const panelOffset = 20;

    return {
      x: (previewNode.position.x - previewPanelWidth - panelOffset) * this.viewport.zoom + this.viewport.panX,
      y: previewNode.position.y * this.viewport.zoom + this.viewport.panY,
    };
  }

  private handlePortMouseDown(e: CustomEvent) {
    const { node, port, isInput, event } = e.detail;
    this.connectionController.startConnection(node, port, isInput, event);
  }

  private handlePortMouseUp(e: CustomEvent) {
    const { node, port, isInput } = e.detail;
    this.connectionController.completeConnection(node, port, isInput);
  }

  // Note: Connection line update is now in ConnectionController

  private handleEdgeClick(e: MouseEvent, edge: WorkflowEdge) {
    e.stopPropagation();
    this.selectionController.selectEdge(edge.id, e.shiftKey);
  }

  // Note: Selection methods are now in SelectionController

  private addNode(type: NodeType, position?: Position) {
    if (this.readonly) return;

    const pos = position || {
      x: (-this.viewport.panX + 400) / this.viewport.zoom,
      y: (-this.viewport.panY + 200) / this.viewport.zoom,
    };

    const newNode = createNodeFromTemplate(type, pos);
    if (newNode) {
      this.workflow = {
        ...this.workflow,
        nodes: [...this.workflow.nodes, newNode],
      };
      this.dispatchWorkflowChanged();
    }
  }

  private handlePaletteItemDrag(e: DragEvent, type: NodeType) {
    e.dataTransfer?.setData('application/workflow-node-type', type);
  }

  private handleCanvasDrop = (e: DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer?.getData('application/workflow-node-type') as NodeType;
    if (!type) return;

    const rect = this.canvasWrapper.getBoundingClientRect();
    const x = (e.clientX - rect.left - this.viewport.panX) / this.viewport.zoom;
    const y = (e.clientY - rect.top - this.viewport.panY) / this.viewport.zoom;

    this.addNode(type, { x: Math.round(x / 20) * 20, y: Math.round(y / 20) * 20 });
  };

  private handleCanvasDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer!.dropEffect = 'copy';
  };

  // Note: Zoom methods are now in ViewportController

  private togglePalette() {
    this.showPalette = !this.showPalette;
  }

  private toggleCategory(categoryId: string) {
    if (this.expandedCategories.has(categoryId)) {
      this.expandedCategories.delete(categoryId);
    } else {
      this.expandedCategories.add(categoryId);
    }
    this.expandedCategories = new Set(this.expandedCategories);
  }

  private dispatchWorkflowChanged() {
    this.dispatchEvent(new CustomEvent('workflow-changed', {
      detail: { workflow: this.workflow },
      bubbles: true,
      composed: true,
    }));
  }

  // Required by CanvasHost interface - called by ViewportController
  dispatchViewportChanged() {
    this.dispatchEvent(new CustomEvent('viewport-changed', {
      detail: { viewport: this.viewport },
      bubbles: true,
      composed: true,
    }));
  }

  private dispatchNodeSelected(node: WorkflowNode) {
    this.dispatchEvent(new CustomEvent('node-selected', {
      detail: { node },
      bubbles: true,
      composed: true,
    }));
  }

  // Note: Port position calculation is now in ConnectionController
  private getPortPosition(node: WorkflowNode, portId: string, isInput: boolean): Position {
    return this.connectionController.getPortPosition(node, portId, isInput);
  }

  /**
   * Get nodes with execution statuses applied from nodeStatuses map
   * This ensures edges can derive their status from connected nodes
   */
  private getNodesWithStatuses(): WorkflowNode[] {
    return this.workflow.nodes.map(node =>
      this.nodeStatuses[node.id]
        ? { ...node, status: this.nodeStatuses[node.id].toUpperCase() as ExecutionStatus }
        : node
    );
  }

  // Note: Edge rendering is now in edges.template.ts
  private renderEdges() {
    return renderEdgesTemplate({
      edges: this.workflow.edges,
      nodes: this.getNodesWithStatuses(),
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

  private renderToolbar() {
    return renderToolbarTemplate({
      showToolbar: this.showToolbar,
      mode: this.mode,
      showPalette: this.showPalette,
      hasSelection: this.selectedNodeIds.size > 0 || this.selectedEdgeIds.size > 0,
      hasSingleSelection: this.selectedNodeIds.size === 1,
      onModeChange: (mode) => { this.mode = mode; },
      onTogglePalette: () => this.togglePalette(),
      onZoomIn: () => this.viewportController.zoomIn(),
      onZoomOut: () => this.viewportController.zoomOut(),
      onResetView: () => this.viewportController.resetView(),
      onOpenConfig: () => this.selectionController.openConfigForSelected(),
      onDelete: () => this.selectionController.deleteSelected(),
    });
  }

  private renderZoomControls() {
    return renderZoomControlsTemplate({
      zoomPercentage: this.viewportController.getZoomPercentage(),
      onZoomIn: () => this.viewportController.zoomIn(),
      onZoomOut: () => this.viewportController.zoomOut(),
    });
  }

  private renderPalette() {
    return renderPaletteTemplate({
      showPalette: this.showPalette,
      expandedCategories: this.expandedCategories,
      canvasType: this.canvasType,
      onClose: () => { this.showPalette = false; },
      onToggleCategory: (categoryId) => this.toggleCategory(categoryId),
      onNodeDragStart: (e, type) => this.handlePaletteItemDrag(e, type),
      onNodeDoubleClick: (type) => this.addNode(type),
    });
  }

  private renderContextMenu() {
    return renderContextMenuTemplate({
      contextMenu: this.contextMenu,
      onClose: () => { this.contextMenu = null; },
      onAddNode: () => this.togglePalette(),
      onSelectAll: () => this.selectionController.selectAll(),
      onResetView: () => this.viewportController.resetView(),
      onConfigure: () => this.selectionController.openConfigForSelected(),
      onDuplicate: () => this.selectionController.duplicateSelected(),
      onDelete: () => this.selectionController.deleteSelected(),
    });
  }

  private renderEmptyState() {
    return renderEmptyStateTemplate({
      hasNodes: this.workflow.nodes.length > 0,
    });
  }

  // Note: Config panel methods are now in ConfigController and config-panel.template.ts
  private renderConfigPanel() {
    return renderConfigPanelTemplate({
      node: this.configuredNode,
      position: this.configController.getPanelPosition(),
      callbacks: {
        onClose: () => this.configController.closeConfig(),
        onUpdateName: (name) => this.configController.updateName(name),
        onUpdateDescription: (desc) => this.configController.updateDescription(desc),
        onUpdateConfig: (key, value) => this.configController.updateConfig(key, value),
      },
    });
  }

  private renderChatbotPreview() {
    const previewNode = this.getPreviewNode();
    const position = this.getPreviewPanelPosition();
    if (!previewNode || !position) return html``;

    const config = previewNode.configuration || {};
    const rawSuggestions = (config.suggestions as Array<{id?: string; text?: string}>) || [];
    const suggestions = rawSuggestions.map((s, i) => ({
      id: s.id || String(i),
      text: s.text || '',
    }));

    const panelStyle = {
      left: `${position.x}px`,
      top: `${position.y}px`,
    };

    return html`
      <div class="chatbot-preview-panel" style=${styleMap(panelStyle)} data-theme=${this.currentTheme}>
        <div class="chatbot-preview-header">
          <div class="chatbot-preview-title">
            <nr-icon name="message-circle" size="small"></nr-icon>
            <span>Chat Preview</span>
          </div>
          <button class="chatbot-preview-close" @click=${this.closePreviewPanel}>
            <nr-icon name="x" size="small"></nr-icon>
          </button>
        </div>
        <div class="chatbot-preview-content">
          <nr-chatbot
            size=${(config.chatbotSize as string) || 'medium'}
            variant=${(config.chatbotVariant as string) || 'default'}
            .suggestions=${suggestions}
            placeholder=${(config.placeholder as string) || 'Type a message...'}
            botName=${(config.title as string) || 'Chat Assistant'}
            ?showHeader=${true}
            ?showSuggestions=${config.enableSuggestions !== false}
            loadingType=${(config.loadingType as string) || 'dots'}
          ></nr-chatbot>
        </div>
      </div>
    `;
  }

  override render() {
    return html`
      <div
        class="canvas-wrapper"
        data-theme=${this.currentTheme}
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

          <!-- Nodes layer -->
          <div class="nodes-layer">
            ${this.getNodesWithStatuses().map(node => html`
              <workflow-node
                .node=${node}
                ?selected=${this.selectedNodeIds.has(node.id)}
                ?dragging=${this.dragState?.nodeId === node.id}
                .connectingPortId=${this.connectionState?.sourcePortId || null}
                @node-mousedown=${this.handleNodeMouseDown}
                @node-dblclick=${this.handleNodeDblClick}
                @node-preview=${this.handleNodePreview}
                @node-trigger=${this.handleNodeTrigger}
                @port-mousedown=${this.handlePortMouseDown}
                @port-mouseup=${this.handlePortMouseUp}
              ></workflow-node>
            `)}
          </div>
        </div>

        ${this.renderEmptyState()}
        ${this.renderToolbar()}
        ${this.renderPalette()}
        ${this.renderConfigPanel()}
        ${this.renderChatbotPreview()}
        ${this.renderZoomControls()}
        ${this.renderContextMenu()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'workflow-canvas': WorkflowCanvasElement;
  }
}
