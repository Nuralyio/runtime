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
  WorkflowNodeType,
  NodeConfiguration,
  createNodeFromTemplate,
} from './workflow-canvas.types.js';
import { styles } from './workflow-canvas.style.js';
import { NuralyUIBaseMixin } from '@nuralyui/common/mixins';
import './workflow-node.component.js';
import '../icon/icon.component.js';
import '../input/input.component.js';
import '../chatbot/chatbot.component.js';
import { ChatbotCoreController } from '../chatbot/core/chatbot-core.controller.js';
import { WorkflowSocketProvider } from '../chatbot/providers/workflow-socket-provider.js';

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

// Utils
import { getAllAvailableVariablesWithDynamic } from './utils/variable-resolver.js';

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

    // Restore viewport from workflow ONLY when loading a different workflow
    // Don't reset viewport on same-workflow updates (e.g., node moves)
    if (value.viewport && (!oldValue || oldValue.id !== value.id)) {
      this.viewport = value.viewport;
      this.updateComplete.then(() => {
        this.viewportController?.updateTransform();
      });
    }

    // Auto-open chat preview for CHAT_START nodes with alwaysOpenPlan enabled on load
    if (!oldValue || oldValue.id !== value.id) {
      const chatStartNode = value.nodes.find(
        node => node.type === WorkflowNodeType.CHAT_START && node.configuration?.alwaysOpenPlan === true
      );
      if (chatStartNode && this.previewNodeId !== chatStartNode.id) {
        this.updateComplete.then(() => {
          this.handleNodePreview({ detail: { node: chatStartNode } } as CustomEvent);
        });
      }
    }
  }

  @property({ type: Boolean })
  readonly = false;

  /**
   * When true, disables all mouse interactions and shows an overlay
   * prompting user to double-click to enter preview mode
   */
  @property({ type: Boolean })
  disabled = false;

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

  /**
   * Map of node IDs to their current agent activity (LLM calls, tool calls)
   * Used to show visual feedback during agent execution
   */
  @property({ type: Object })
  agentActivity: Record<string, { type: 'llm' | 'tool'; name?: string; active: boolean }> = {};

  /**
   * When true, automatically subscribes to execution events for the current workflow.
   * This allows the canvas to show real-time execution state when the workflow
   * is triggered from external sources (e.g., a chatbot component).
   */
  @property({ type: Boolean })
  listenToExecutionEvents = false;

  /**
   * Current execution ID to display in config panel.
   * Set this from the parent component when an execution is active.
   * When set, the canvas will fetch node execution data for this execution.
   */
  @property({ type: String })
  get executionId(): string | null {
    return this.currentExecutionId;
  }

  set executionId(value: string | null) {
    const oldValue = this.currentExecutionId;
    this.currentExecutionId = value;
    this.requestUpdate('executionId', oldValue);

    // Fetch execution data when execution ID is set
    if (value && value !== oldValue) {
      this.fetchExecutionData(value);
    } else if (!value) {
      this.nodeExecutionData.clear();
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
  private isHoveringDisabledOverlay = false;

  @state()
  private expandedCategories: Set<string> = new Set([
    'trigger', 'control', 'action', 'data', 'agent',
    'db-tables-views', 'db-relations-constraints', 'db-indexes-queries'
  ]);

  @state()
  private paletteSearchTerm: string = '';

  @state()
  private configuredNode: WorkflowNode | null = null;

  @state()
  private hoveredEdgeId: string | null = null;

  @state()
  private previewNodeId: string | null = null;

  // Chatbot preview controller and provider for CHAT_START nodes
  private chatPreviewController: ChatbotCoreController | null = null;
  private chatPreviewProvider: WorkflowSocketProvider | null = null;

  // HTTP preview state
  @state()
  private httpPreviewBody: string = '{\n  \n}';

  @state()
  private httpPreviewResponse: string = '';

  @state()
  private httpPreviewLoading: boolean = false;

  @state()
  private httpPreviewError: string = '';

  // Dynamic variables from last execution
  @state()
  private dynamicVariables: import('./templates/config-panel/types.js').DynamicVariable[] = [];

  @state()
  private loadingVariables: boolean = false;

  // Node execution data for display in config panel
  @state()
  private nodeExecutionData: Map<string, import('./templates/config-panel/types.js').NodeExecutionData> = new Map();

  // Current execution ID for retry functionality
  @state()
  private currentExecutionId: string | null = null;

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
    // Clean up chat preview resources
    this.cleanupChatPreview();
  }

  // Note: Keyboard handling is now in KeyboardController

  private handleGlobalMouseUp = () => {
    if (this.disabled) return;
    this.dragController.stopDrag();
    this.viewportController.stopPan();
    this.connectionController.cancelConnection();
  };

  private handleGlobalMouseMove = (e: MouseEvent) => {
    if (this.disabled) return;
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
    if (this.disabled) return;
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
    if (this.disabled) return;

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
    if (this.disabled) return;
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

    // Start dragging (only if not readonly)
    if (!this.readonly) {
      this.dragController.startDrag(node, event);
    }

    this.dispatchNodeSelected(node);

    // Auto-open chat preview if alwaysOpenPlan is enabled for CHAT_START nodes
    if (
      node.type === WorkflowNodeType.CHAT_START &&
      node.configuration?.alwaysOpenPlan === true &&
      this.previewNodeId !== node.id
    ) {
      this.handleNodePreview({ detail: { node } } as CustomEvent);
    }
  }

  // Note: Node drag handling is now in DragController

  private async handleNodeDblClick(e: CustomEvent) {
    if (this.disabled) return;
    const { node } = e.detail;
    // Open configuration panel
    this.configuredNode = node;

    // Fetch dynamic variables from last execution (for variable suggestions only)
    this.loadingVariables = true;
    this.dynamicVariables = [];

    if (this.workflow?.id) {
      try {
        const vars = await getAllAvailableVariablesWithDynamic(
          this.workflow,
          node.id,
          '' // Uses relative URL
        );
        this.dynamicVariables = vars;
      } catch (error) {
        console.warn('[WorkflowCanvas] Failed to fetch dynamic variables:', error);
      }

      // If nodes have status but we don't have execution data, fetch latest execution
      // This handles the case where execution happened before socket listeners were set up
      const hasNodeStatus = Object.keys(this.nodeStatuses).length > 0;
      const hasExecutionData = this.nodeExecutionData.size > 0;
      if (hasNodeStatus && !hasExecutionData && !this.currentExecutionId) {
        try {
          const response = await fetch(`/api/v1/workflows/${this.workflow.id}/latest-execution`);
          if (response.ok) {
            const execution = await response.json();
            if (execution?.id) {
              this.currentExecutionId = execution.id;
              // Fetch node executions
              await this.fetchExecutionData(execution.id);
            }
          }
        } catch (error) {
          console.warn('[WorkflowCanvas] Failed to fetch latest execution:', error);
        }
      }
    }
    this.loadingVariables = false;

    this.dispatchEvent(new CustomEvent('node-configured', {
      detail: { node },
      bubbles: true,
      composed: true,
    }));
  }

  private async handleNodePreview(e: CustomEvent) {
    const { node } = e.detail;
    // Toggle preview panel - close if same node, open if different
    if (this.previewNodeId === node.id) {
      this.closePreviewPanel();
    } else {
      // Clean up previous preview if any
      await this.cleanupChatPreview();

      this.previewNodeId = node.id;

      // If it's a CHAT_START node, initialize the workflow socket provider
      if (node.type === WorkflowNodeType.CHAT_START && this.workflow?.id) {
        await this.initializeChatPreview(this.workflow.id, node.configuration);
      }
    }
  }

  /**
   * Initialize chat preview with WorkflowSocketProvider
   */
  private async initializeChatPreview(workflowId: string, nodeConfig?: NodeConfiguration): Promise<void> {
    try {
      // Create provider with workflow ID
      this.chatPreviewProvider = new WorkflowSocketProvider();

      // Get socket URL from current location or use default
      const socketUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8000';

      await this.chatPreviewProvider.connect({
        workflowId,
        socketUrl,
        socketPath: '/socket.io/workflow',
        triggerEndpoint: '/api/v1/workflows/{workflowId}/trigger/chat',
        responseTimeout: 60000,
        // Handle messages from CHAT_OUTPUT nodes (including retries)
        onMessage: (message: string) => {
          if (this.chatPreviewController) {
            // Add bot message to the chat
            this.chatPreviewController.addMessage({
              id: `bot-${Date.now()}`,
              sender: 'bot',
              text: message,
              timestamp: new Date().toISOString(),
            });
          }
        },
      });

      // Listen for execution events to update node statuses on canvas
      const socket = this.chatPreviewProvider.getSocket();
      if (socket) {
        socket.on('execution:started', (event: any) => {
          // Capture execution ID and reset states
          const executionId = event.data?.executionId || event.executionId;
          if (executionId) {
            this.currentExecutionId = executionId;
            this.nodeExecutionData.clear();
          }
          this.nodeStatuses = {};
        });

        socket.on('execution:node-started', (event: any) => {
          const nodeId = event.data?.nodeId || event.nodeId;
          const data = event.data || event;
          if (nodeId) {
            this.nodeStatuses = { ...this.nodeStatuses, [nodeId]: 'RUNNING' };
            // Store node execution data
            this.nodeExecutionData.set(nodeId, {
              id: data.nodeExecutionId || nodeId,
              nodeId,
              status: 'running',
              inputData: data.inputData,
              startedAt: data.startedAt || new Date().toISOString(),
            });
            this.requestUpdate();
          }
        });

        socket.on('execution:node-completed', (event: any) => {
          const nodeId = event.data?.nodeId || event.nodeId;
          const data = event.data || event;
          if (nodeId) {
            this.nodeStatuses = { ...this.nodeStatuses, [nodeId]: 'COMPLETED' };
            // Update node execution data with output
            const existing = this.nodeExecutionData.get(nodeId) || { id: nodeId, nodeId, status: 'completed' };
            this.nodeExecutionData.set(nodeId, {
              ...existing,
              status: 'completed',
              outputData: data.outputData,
              completedAt: data.completedAt || new Date().toISOString(),
              durationMs: data.durationMs,
            });
            this.requestUpdate();
          }
        });

        socket.on('execution:node-failed', (event: any) => {
          const nodeId = event.data?.nodeId || event.nodeId;
          const data = event.data || event;
          if (nodeId) {
            this.nodeStatuses = { ...this.nodeStatuses, [nodeId]: 'FAILED' };
            // Update node execution data with error
            const existing = this.nodeExecutionData.get(nodeId) || { id: nodeId, nodeId, status: 'failed' };
            this.nodeExecutionData.set(nodeId, {
              ...existing,
              status: 'failed',
              errorMessage: data.errorMessage || data.error,
              completedAt: data.completedAt || new Date().toISOString(),
              durationMs: data.durationMs,
            });
            this.requestUpdate();
          }
        });
      }

      // Create controller with the provider
      const enableFileUpload = nodeConfig?.enableFileUpload === true;
      console.log('[Canvas] Creating chat controller with config:', { enableFileUpload, nodeConfig });

      this.chatPreviewController = new ChatbotCoreController({
        provider: this.chatPreviewProvider,
        enableFileUpload,
        ui: {
          onStateChange: () => {
            // Force re-render when state changes
            this.requestUpdate();
          },
        },
      });

      console.log('[Canvas] Chat preview initialized for workflow:', workflowId);
    } catch (error) {
      console.error('[Canvas] Failed to initialize chat preview:', error);
      this.chatPreviewController = null;
      this.chatPreviewProvider = null;
    }
  }

  /**
   * Cleanup chat preview controller and provider
   */
  private async cleanupChatPreview(): Promise<void> {
    if (this.chatPreviewProvider) {
      try {
        await this.chatPreviewProvider.disconnect();
      } catch (error) {
        console.error('[Canvas] Error disconnecting chat preview:', error);
      }
      this.chatPreviewProvider = null;
    }
    this.chatPreviewController = null;
  }

  /**
   * Send HTTP request to trigger workflow
   */
  private async sendHttpPreviewRequest(): Promise<void> {
    const previewNode = this.getPreviewNode();
    if (!previewNode || !this.workflow?.id) return;

    this.httpPreviewLoading = true;
    this.httpPreviewError = '';
    this.httpPreviewResponse = '';
    // Reset node statuses when starting a new execution
    this.nodeStatuses = {};

    try {
      // Parse the request body
      let body: any;
      try {
        body = JSON.parse(this.httpPreviewBody);
      } catch {
        throw new Error('Invalid JSON in request body');
      }

      // Build the trigger URL
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8000';
      const triggerUrl = `${baseUrl}/api/v1/workflows/${this.workflow.id}/trigger/http`;

      console.log('[Canvas] Sending HTTP preview request:', triggerUrl, body);

      const response = await fetch(triggerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const executionId = response.headers.get('X-Execution-Id');
      let responseData: any;

      try {
        responseData = await response.json();
      } catch {
        responseData = await response.text();
      }

      if (!response.ok) {
        throw new Error(responseData.message || responseData || `HTTP ${response.status}`);
      }

      // Format the response nicely
      this.httpPreviewResponse = JSON.stringify({
        status: response.status,
        executionId,
        data: responseData,
      }, null, 2);

      // Store execution ID for config panel display
      if (executionId) {
        this.currentExecutionId = executionId;
        // Fetch node execution data
        this.fetchExecutionData(executionId);
      }

    } catch (error) {
      console.error('[Canvas] HTTP preview error:', error);
      this.httpPreviewError = error instanceof Error ? error.message : String(error);
    } finally {
      this.httpPreviewLoading = false;
    }
  }

  /**
   * Reset HTTP preview state
   */
  private resetHttpPreview(): void {
    this.httpPreviewBody = '{\n  \n}';
    this.httpPreviewResponse = '';
    this.httpPreviewError = '';
    this.httpPreviewLoading = false;
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
    this.cleanupChatPreview();
    this.resetHttpPreview();
  }

  /**
   * Handle double-click on disabled overlay to enable canvas interaction
   */
  private handleDisabledOverlayDblClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    this.disabled = false;
    this.isHoveringDisabledOverlay = false;
    this.dispatchEvent(new CustomEvent('canvas-enabled', {
      bubbles: true,
      composed: true,
    }));
  };

  private handleDisabledOverlayMouseEnter = () => {
    this.isHoveringDisabledOverlay = true;
  };

  private handleDisabledOverlayMouseLeave = () => {
    this.isHoveringDisabledOverlay = false;
  };

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

    const previewPanelWidth = 340;
    const panelOffset = 20;

    return {
      x: (previewNode.position.x - previewPanelWidth - panelOffset) * this.viewport.zoom + this.viewport.panX,
      y: previewNode.position.y * this.viewport.zoom + this.viewport.panY,
    };
  }

  private handlePortMouseDown(e: CustomEvent) {
    if (this.disabled || this.readonly) return;
    const { node, port, isInput, event } = e.detail;
    this.connectionController.startConnection(node, port, isInput, event);
  }

  private handlePortMouseUp(e: CustomEvent) {
    if (this.disabled) return;
    const { node, port, isInput } = e.detail;
    this.connectionController.completeConnection(node, port, isInput);
  }

  // Note: Connection line update is now in ConnectionController

  private handleEdgeClick(e: MouseEvent, edge: WorkflowEdge) {
    if (this.disabled) return;
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

  dispatchNodeMoved(node: WorkflowNode, position: Position) {
    this.dispatchEvent(new CustomEvent('node-moved', {
      detail: { node, position },
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
   *
   * When nodeStatuses has any entries (active real-time execution), only those
   * nodes get status - this prevents edges from non-executed triggers from
   * being colored based on saved workflow statuses.
   */
  private getNodesWithStatuses(): WorkflowNode[] {
    const hasActiveExecution = Object.keys(this.nodeStatuses).length > 0;

    return this.workflow.nodes.map(node => {
      const activity = this.agentActivity[node.id];
      const baseNode = {
        ...node,
        // Add agent activity if present
        agentActivity: activity?.active ? activity : undefined,
      };

      if (this.nodeStatuses[node.id]) {
        // Node has real-time status from current execution
        return { ...baseNode, status: this.nodeStatuses[node.id].toUpperCase() as ExecutionStatus };
      } else if (hasActiveExecution) {
        // During active execution, nodes not in nodeStatuses have no status
        // This prevents edges from other triggers from being colored
        return { ...baseNode, status: undefined };
      } else {
        // No active execution - use saved workflow status (for history view)
        return baseNode;
      }
    });
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
      readonly: this.readonly,
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
      searchTerm: this.paletteSearchTerm,
      onClose: () => {
        this.showPalette = false;
        this.paletteSearchTerm = '';
      },
      onToggleCategory: (categoryId) => this.toggleCategory(categoryId),
      onNodeDragStart: (e, type) => this.handlePaletteItemDrag(e, type),
      onNodeDoubleClick: (type) => this.addNode(type),
      onSearchChange: (term) => { this.paletteSearchTerm = term; },
    });
  }

  private renderContextMenu() {
    return renderContextMenuTemplate({
      contextMenu: this.contextMenu,
      readonly: this.readonly,
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

  private renderDisabledOverlay() {
    if (!this.disabled) return html``;

    return html`
      <div
        class="disabled-overlay ${this.isHoveringDisabledOverlay ? 'hovering' : ''}"
        @dblclick=${this.handleDisabledOverlayDblClick}
        @mouseenter=${this.handleDisabledOverlayMouseEnter}
        @mouseleave=${this.handleDisabledOverlayMouseLeave}
      >
        <div class="disabled-overlay-message">
          <nr-icon name="mouse-pointer-click" size="medium"></nr-icon>
          <span>Double click to enter preview mode</span>
        </div>
      </div>
    `;
  }

  // Note: Config panel methods are now in ConfigController and config-panel.template.ts
  private renderConfigPanel() {
    const nodeId = this.configuredNode?.id;
    const nodeExecution = nodeId ? this.nodeExecutionData.get(nodeId) : undefined;

    return renderConfigPanelTemplate({
      node: this.configuredNode,
      position: this.configController.getPanelPosition(),
      callbacks: {
        onClose: () => this.configController.closeConfig(),
        onUpdateName: (name) => this.configController.updateName(name),
        onUpdateDescription: (desc) => this.configController.updateDescription(desc),
        onUpdateConfig: (key, value) => {
          this.configController.updateConfig(key, value);
          // Update chatPreviewController config if it's the same node being previewed
          if (this.chatPreviewController &&
              this.configuredNode?.id === this.previewNodeId &&
              this.configuredNode?.type === WorkflowNodeType.CHAT_START) {
            if (key === 'enableFileUpload') {
              this.chatPreviewController.updateConfig({ enableFileUpload: value === true });
            }
          }
        },
        onRetryNode: this.currentExecutionId ? (nodeId) => this.handleRetryNode(nodeId) : undefined,
      },
      workflowId: this.workflow?.id,
      workflow: this.workflow,
      dynamicVariables: this.dynamicVariables,
      loadingVariables: this.loadingVariables,
      nodeExecution,
      executionId: this.currentExecutionId ?? undefined,
    });
  }

  /**
   * Handle retry node request from config panel
   */
  private async handleRetryNode(nodeId: string): Promise<void> {
    if (!this.currentExecutionId || !this.workflow?.id) return;

    try {
      const response = await fetch(`/api/v1/workflows/${this.workflow.id}/executions/${this.currentExecutionId}/nodes/${nodeId}/retry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Retry failed: ${response.statusText}`);
      }

      // Dispatch event to notify parent
      this.dispatchEvent(new CustomEvent('node-retry', {
        detail: { executionId: this.currentExecutionId, nodeId },
        bubbles: true,
        composed: true,
      }));
    } catch (error) {
      console.error('[WorkflowCanvas] Failed to retry node:', error);
    }
  }

  /**
   * Set the current execution ID (for retry functionality)
   */
  setExecutionId(executionId: string | null): void {
    this.currentExecutionId = executionId;
    if (!executionId) {
      // Clear node execution data when execution is cleared
      this.nodeExecutionData.clear();
      this.requestUpdate();
    }
  }

  /**
   * Update node execution data (called from socket events or API responses)
   */
  updateNodeExecution(nodeExecution: import('./templates/config-panel/types.js').NodeExecutionData): void {
    this.nodeExecutionData.set(nodeExecution.nodeId, nodeExecution);
    this.requestUpdate();
  }

  /**
   * Clear all node execution data
   */
  clearExecutionData(): void {
    this.currentExecutionId = null;
    this.nodeExecutionData.clear();
    this.requestUpdate();
  }

  /**
   * Fetch execution data for a specific execution ID
   */
  private async fetchExecutionData(executionId: string): Promise<void> {
    if (!executionId) return;

    try {
      // Fetch node executions for this execution
      const response = await fetch(`/api/v1/workflows/${this.workflow?.id}/executions/${executionId}/nodes`);
      if (!response.ok) {
        // Try alternative endpoint
        const altResponse = await fetch(`/api/v1/executions/${executionId}/nodes`);
        if (!altResponse.ok) {
          console.warn('[WorkflowCanvas] Failed to fetch node executions');
          return;
        }
        const nodeExecutions = await altResponse.json();
        this.processNodeExecutions(nodeExecutions);
        return;
      }
      const nodeExecutions = await response.json();
      this.processNodeExecutions(nodeExecutions);
    } catch (error) {
      console.warn('[WorkflowCanvas] Failed to fetch execution data:', error);
    }
  }

  /**
   * Process and store node execution data
   */
  private processNodeExecutions(nodeExecutions: Array<{
    id: string;
    nodeId: string;
    status: string;
    inputData?: string;
    outputData?: string;
    errorMessage?: string;
    startedAt?: string;
    completedAt?: string;
    durationMs?: number;
  }>): void {
    this.nodeExecutionData.clear();
    for (const nodeExec of nodeExecutions) {
      // Parse JSON strings if needed
      let inputData = nodeExec.inputData;
      let outputData = nodeExec.outputData;
      try {
        if (typeof inputData === 'string') inputData = JSON.parse(inputData);
      } catch { /* keep as string */ }
      try {
        if (typeof outputData === 'string') outputData = JSON.parse(outputData);
      } catch { /* keep as string */ }

      this.nodeExecutionData.set(nodeExec.nodeId, {
        id: nodeExec.id,
        nodeId: nodeExec.nodeId,
        status: nodeExec.status?.toLowerCase() as 'pending' | 'running' | 'completed' | 'failed',
        inputData,
        outputData,
        errorMessage: nodeExec.errorMessage,
        startedAt: nodeExec.startedAt,
        completedAt: nodeExec.completedAt,
        durationMs: nodeExec.durationMs,
      });
    }
    this.requestUpdate();
  }

  private renderPreviewPanel() {
    const previewNode = this.getPreviewNode();
    const position = this.getPreviewPanelPosition();
    if (!previewNode || !position) return html``;

    const config = previewNode.configuration || {};
    const panelStyle = {
      left: `${position.x}px`,
      top: `${position.y}px`,
    };

    // HTTP_START preview
    if (previewNode.type === WorkflowNodeType.HTTP_START) {
      const httpPath = (config.httpPath as string) || '/webhook';
      return html`
        <div class="chatbot-preview-panel http-preview-panel" style=${styleMap(panelStyle)} data-theme=${this.currentTheme}>
          <div class="chatbot-preview-header">
            <div class="chatbot-preview-title">
              <nr-icon name="globe" size="small"></nr-icon>
              <span>HTTP Test</span>
            </div>
            <button class="chatbot-preview-close" @click=${this.closePreviewPanel}>
              <nr-icon name="x" size="small"></nr-icon>
            </button>
          </div>
          <div class="http-preview-content">
            <div class="http-preview-url">
              <span class="http-method">POST</span>
              <span class="http-path">${httpPath}</span>
            </div>
            <div class="http-preview-section">
              <label>Request Body (JSON)</label>
              <textarea
                class="http-request-body"
                .value=${this.httpPreviewBody}
                @input=${(e: Event) => this.httpPreviewBody = (e.target as HTMLTextAreaElement).value}
                placeholder='{ "key": "value" }'
                ?disabled=${this.httpPreviewLoading}
              ></textarea>
            </div>
            <div class="http-preview-actions">
              <button
                class="http-send-btn"
                @click=${this.sendHttpPreviewRequest}
                ?disabled=${this.httpPreviewLoading}
              >
                ${this.httpPreviewLoading ? html`
                  <nr-icon name="loader" size="small"></nr-icon>
                  <span>Sending...</span>
                ` : html`
                  <nr-icon name="send" size="small"></nr-icon>
                  <span>Send Request</span>
                `}
              </button>
            </div>
            ${this.httpPreviewError ? html`
              <div class="http-preview-error">
                <nr-icon name="alert-circle" size="small"></nr-icon>
                <span>${this.httpPreviewError}</span>
              </div>
            ` : ''}
            ${this.httpPreviewResponse ? html`
              <div class="http-preview-section">
                <label>Response</label>
                <pre class="http-response-body">${this.httpPreviewResponse}</pre>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }

    // Chat preview (CHAT_START or CHATBOT)
    const rawSuggestions = (config.suggestions as Array<{id?: string; text?: string}>) || [];
    const suggestions = rawSuggestions.map((s, i) => ({
      id: s.id || String(i),
      text: s.text || '',
    }));

    const isChatStartNode = previewNode.type === WorkflowNodeType.CHAT_START;
    const isConnected = this.chatPreviewProvider?.isConnected() ?? false;
    const headerTitle = isChatStartNode ? 'Workflow Chat' : 'Chat Preview';
    const headerIcon = isChatStartNode ? 'zap' : 'message-circle';

    return html`
      <div class="chatbot-preview-panel" style=${styleMap(panelStyle)} data-theme=${this.currentTheme}>
        <div class="chatbot-preview-header">
          <div class="chatbot-preview-title">
            <nr-icon name=${headerIcon} size="small"></nr-icon>
            <span>${headerTitle}</span>
            ${isChatStartNode ? html`
              <span class="chat-preview-status ${isConnected ? 'connected' : 'disconnected'}">
                ${isConnected ? '● Connected' : '○ Connecting...'}
              </span>
            ` : ''}
          </div>
          <button class="chatbot-preview-close" @click=${this.closePreviewPanel}>
            <nr-icon name="x" size="small"></nr-icon>
          </button>
        </div>
        <div class="chatbot-preview-content">
          ${isChatStartNode && this.chatPreviewController ? html`
            <nr-chatbot
              size="small"
              variant="default"
              .controller=${this.chatPreviewController}
              .suggestions=${suggestions}
              placeholder=${(config.placeholder as string) || 'Send a message...'}
              botName="Workflow"
              ?showHeader=${false}
              ?showSuggestions=${suggestions.length > 0}
              ?enableFileUpload=${config.enableFileUpload === true}
              loadingType="dots"
            ></nr-chatbot>
          ` : isChatStartNode ? html`
            <div class="chat-preview-loading">
              <nr-icon name="loader" size="large"></nr-icon>
              <span>Connecting to workflow...</span>
            </div>
          ` : html`
            <nr-chatbot
              size=${(config.chatbotSize as string) || 'medium'}
              variant=${(config.chatbotVariant as string) || 'default'}
              .suggestions=${suggestions}
              placeholder=${(config.placeholder as string) || 'Type a message...'}
              botName=${(config.title as string) || 'Chat Assistant'}
              ?showHeader=${true}
              ?showSuggestions=${config.enableSuggestions !== false}
              ?enableFileUpload=${config.enableFileUpload === true}
              loadingType=${(config.loadingType as string) || 'dots'}
            ></nr-chatbot>
          `}
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
        ${this.renderDisabledOverlay()}
        ${this.renderToolbar()}
        ${this.renderPalette()}
        ${this.renderConfigPanel()}
        ${this.renderPreviewPanel()}
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
