import { customElement, property, state } from "lit/decorators.js";
import { html, LitElement, css } from "lit";
import "../../../runtime/components/ui/nuraly-ui/src/components/canvas/workflow-canvas.component";
import type { Workflow } from "../../../runtime/components/ui/nuraly-ui/src/components/canvas/workflow-canvas.types";
import { $currentApplication } from "../../../runtime/redux/store/apps";
import {
  $currentWorkflow,
  $workflowSaveStatus,
  $workflows,
  getOrCreateWorkflow,
  getWorkflows, setLastSavedWorkflow,
  getWorkflowViewport,
  saveWorkflowViewport,
  migrateWorkflowViewportToKv,
  getDefaultWorkflowViewport
} from "../../../runtime/redux/store/workflow";
import {
  getKvEntries,
  setKvEntry,
  type KvEntry
} from "../../../runtime/redux/store/kv";
import type { CanvasViewport } from "../../../runtime/components/ui/nuraly-ui/src/components/canvas/workflow-canvas.types";
import { $context } from "../../../runtime/redux/store/context";
import {
  handleWorkflowChanged,
  handleExecuteWorkflow,
  handleSaveWorkflow,
} from "../../../runtime/redux/handlers/workflows";
import { createSocketFunctions } from "../../../runtime/handlers/runtime-api/socket";
import {
  convertDtoToWorkflow,
  createViewportDebouncer,
  type ViewportDebouncer,
} from "../../../../utils/workflow-utils";

// Mock workflow to showcase UI when no workflow is selected
const MOCK_WORKFLOW: Workflow = {
  id: 'mock-workflow',
  name: 'Example Workflow',
  description: 'This is a demo workflow showing available node types',
  applicationId: '',
  nodes: [
    {
      id: 'node-trigger',
      type: 'trigger',
      label: 'On Button Click',
      position: { x: 100, y: 100 },
      config: { event: 'click', source: 'button_1' }
    },
    {
      id: 'node-condition',
      type: 'condition',
      label: 'Check User Role',
      position: { x: 100, y: 250 },
      config: { expression: 'user.role === "admin"' }
    },
    {
      id: 'node-action',
      type: 'action',
      label: 'Update Database',
      position: { x: 100, y: 400 },
      config: { action: 'update', table: 'users' }
    },
    {
      id: 'node-api',
      type: 'api',
      label: 'Send Notification',
      position: { x: 350, y: 250 },
      config: { endpoint: '/api/notify' }
    }
  ],
  edges: [
    { id: 'edge-1', sourceNodeId: 'node-trigger', targetNodeId: 'node-condition', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'edge-2', sourceNodeId: 'node-condition', targetNodeId: 'node-action', sourceHandle: 'bottom', targetHandle: 'top', label: 'Yes' },
    { id: 'edge-3', sourceNodeId: 'node-condition', targetNodeId: 'node-api', sourceHandle: 'right', targetHandle: 'left', label: 'No' }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

@customElement("flow-page")
export class FlowPage extends LitElement {
  static override styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      position: relative;
    }

    .flow-container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .flow-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 16px;
      background: var(--n-color-surface, #fff);
      border-bottom: 1px solid var(--n-color-border, #e5e7eb);
      gap: 12px;
    }

    .flow-toolbar-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .flow-toolbar-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .workflow-name {
      font-weight: 600;
      font-size: 14px;
      color: var(--n-color-text, #111827);
    }

    .save-status {
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .save-status.saved {
      color: var(--n-color-success, #22c55e);
      background: var(--n-color-success-bg, #f0fdf4);
    }

    .save-status.saving {
      color: var(--n-color-warning, #f59e0b);
      background: var(--n-color-warning-bg, #fffbeb);
    }

    .save-status.dirty {
      color: var(--n-color-info, #3b82f6);
      background: var(--n-color-info-bg, #eff6ff);
    }

    .save-status.error {
      color: var(--n-color-error, #ef4444);
      background: var(--n-color-error-bg, #fef2f2);
    }

    .toolbar-button {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition: all 0.15s ease;
    }

    .toolbar-button.primary {
      background: var(--n-color-primary, #3b82f6);
      color: white;
    }

    .toolbar-button.primary:hover {
      background: var(--n-color-primary-dark, #2563eb);
    }

    .toolbar-button.primary:disabled {
      background: var(--n-color-disabled, #9ca3af);
      cursor: not-allowed;
    }

    .toolbar-button.secondary {
      background: var(--n-color-surface, #fff);
      color: var(--n-color-text, #111827);
      border: 1px solid var(--n-color-border, #e5e7eb);
    }

    .toolbar-button.secondary:hover {
      background: var(--n-color-surface-hover, #f9fafb);
    }

    .canvas-container {
      flex: 1;
      overflow: hidden;
      position: relative;
    }

    workflow-canvas {
      width: 100%;
      height: 100%;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.8);
      z-index: 100;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--n-color-border, #e5e7eb);
      border-top-color: var(--n-color-primary, #3b82f6);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .demo-banner {
      position: absolute;
      top: 12px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 50;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border: 1px solid #f59e0b;
      border-radius: 8px;
      font-size: 13px;
      color: #92400e;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .demo-banner svg {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
    }

    .error-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
      border-bottom: 1px solid #ef4444;
      font-size: 13px;
      color: #991b1b;
    }

    .error-banner svg {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
      color: #ef4444;
    }

    .error-banner span {
      flex: 1;
    }

    .error-dismiss {
      background: none;
      border: none;
      padding: 4px;
      cursor: pointer;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #991b1b;
      opacity: 0.7;
    }

    .error-dismiss:hover {
      opacity: 1;
      background: rgba(239, 68, 68, 0.1);
    }

    .error-dismiss svg {
      width: 16px;
      height: 16px;
    }

    .demo-canvas-overlay {
      position: relative;
    }

    .demo-canvas-overlay::before {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 10;
    }
  `;

  @state()
  private workflow: Workflow | null = null;

  @state()
  private loading = true;

  @state()
  private saveStatus: string = 'saved';

  @state()
  private isExecuting = false;

  @state()
  private nodeStatuses: Record<string, 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'> = {};

  @state()
  private agentActivity: Record<string, { type: 'llm' | 'tool'; name?: string; active: boolean }> = {};

  @state()
  private currentExecutionId: string | null = null;

  @state()
  private executionError: string | null = null;

  @state()
  private kvEntries: KvEntry[] = [];

  /** Detail passed from tab containing workflowId and/or appId */
  @property({ type: Object })
  detail: { workflowId?: string; appId?: string } | null = null;

  // Track partial execution start node (for selective node status reset)
  private partialExecutionStartNodeId: string | null = null;

  // Socket instance managed by handlers (typed as any since created via handler code)
  public flowSocket: any = null;

  private unsubscribeWorkflow: (() => void) | null = null;
  private unsubscribeSaveStatus: (() => void) | null = null;
  private viewportDebouncer: ViewportDebouncer | null = null;
  private currentViewport: CanvasViewport = getDefaultWorkflowViewport();
  private unsubscribeContext: (() => void) | null = null;

  // Store IDs separately so they survive canvas events that don't include them
  private loadedWorkflowId: string | null = null;
  private loadedApplicationId: string | null = null;

  override connectedCallback() {
    super.connectedCallback();
    this.loadWorkflow();
    this.runInitHandler();

    // Subscribe to workflow store
    this.unsubscribeWorkflow = $currentWorkflow.subscribe((workflow) => {
      // If workflow changed, subscribe to the new one for external HTTP triggers
      if (workflow && workflow.id !== this.workflow?.id) {
        this.subscribeToWorkflow(workflow.id);
      }
      // Preserve current viewport when updating workflow from store
      // This prevents viewport reset during execution events
      if (workflow) {
        // Update stored IDs when workflow changes from store
        if (workflow.id) {
          this.loadedWorkflowId = workflow.id;
        }
        if (workflow.applicationId) {
          this.loadedApplicationId = workflow.applicationId;
        }
        this.workflow = { ...workflow, viewport: this.currentViewport };
      } else {
        this.workflow = workflow;
      }
    });

    // Subscribe to save status
    this.unsubscribeSaveStatus = $workflowSaveStatus.subscribe((status) => {
      this.saveStatus = status;
    });

    // Subscribe to context var changes (from low-code SetVar)
    this.unsubscribeContext = $context.subscribe((ctx) => {
      const rawWf = ctx?.global?.currentWorkflow?.value;
      if (rawWf && rawWf.id !== this.workflow?.id) {
        // Convert DTO format to canvas format
        const wf = convertDtoToWorkflow(rawWf);
        if (wf) {
          // Update stored IDs when workflow changes from context
          if (wf.id) {
            this.loadedWorkflowId = wf.id;
          }
          if (wf.applicationId) {
            this.loadedApplicationId = wf.applicationId;
          }
          // Preserve current viewport when switching workflows via context
          this.workflow = { ...wf, viewport: this.currentViewport };
          // Also update the global store so execute uses the right workflow
          $currentWorkflow.set(wf);
          // Track loaded state for diffing on save
          setLastSavedWorkflow(wf);
          // Subscribe to new workflow events (for external HTTP triggers)
          this.subscribeToWorkflow(wf.id);
        }
      }
    });
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.runDestroyHandler();
    if (this.unsubscribeWorkflow) {
      this.unsubscribeWorkflow();
    }
    if (this.unsubscribeSaveStatus) {
      this.unsubscribeSaveStatus();
    }
    if (this.unsubscribeContext) {
      this.unsubscribeContext();
    }
    if (this.viewportDebouncer) {
      this.viewportDebouncer.cancel();
    }
  }

  override updated(changedProperties: Map<string, unknown>) {
    super.updated(changedProperties);
    // If detail changed and we have a new workflowId or appId, reload the workflow
    if (changedProperties.has('detail') && this.detail) {
      const oldDetail = changedProperties.get('detail') as { workflowId?: string; appId?: string } | null;
      const newWorkflowId = this.detail.workflowId;
      const newAppId = this.detail.appId;
      const oldWorkflowId = oldDetail?.workflowId;
      const oldAppId = oldDetail?.appId;

      // Reload if workflowId or appId changed
      if ((newWorkflowId && newWorkflowId !== oldWorkflowId) ||
          (newAppId && newAppId !== oldAppId && !this.loadedApplicationId)) {
        console.log('[Flow] Detail changed, reloading workflow:', this.detail);
        this.loadWorkflow();
      }
    }
  }

  /**
   * Initialize socket instance and setup event listeners
   */
  private runInitHandler(): void {
    const { $socket } = createSocketFunctions();
    this.flowSocket = $socket.create();
    console.log('[Flow] Socket instance created:', this.flowSocket.getId());

    // Setup event listeners
    this.flowSocket
      .on('connect', () => {
        console.log('[Flow] Socket connected');
      })
      .on('disconnect', (reason: string) => {
        console.log('[Flow] Socket disconnected:', reason);
      })
      .on('connect_error', (error: any) => {
        console.error('[Flow] Socket connection error:', error);
      })
      .on('execution:started', (data: any) => {
        console.log('[Flow] Execution started:', data);
        this.executionError = null;
        // Use selective reset for partial execution, full reset otherwise
        if (this.partialExecutionStartNodeId) {
          this.resetNodeStatusesFromNode(this.partialExecutionStartNodeId);
        } else {
          this.resetNodeStatuses();
        }
        this.setExecutionState(true, data.executionId);
      })
      .on('execution:node-started', (data: any) => {
        console.log('[Flow] Node started:', data.nodeId);
        this.updateNodeStatus(data.nodeId, 'RUNNING');
      })
      .on('execution:node-completed', (data: any) => {
        // NODE_EXECUTED event - check actual status and output for errors
        const status = data.data?.status || data.status || 'COMPLETED';
        const outputData = data.data?.outputData ? JSON.parse(data.data.outputData) : null;
        const hasError = outputData?.error || data.data?.errorMessage;
        const nodeType = data.data?.nodeType;

        console.log('[Flow] Node executed:', data.nodeId, 'type:', nodeType, 'status:', status, 'hasError:', !!hasError);

        // If this is a DEBUG node, store the output data for display in config panel
        if (nodeType === 'DEBUG' && outputData) {
          this.updateDebugNodeOutput(data.nodeId, outputData);
        }

        if (status === 'FAILED' || hasError) {
          this.updateNodeStatus(data.nodeId, 'FAILED');
          // Show error message if available
          const errorMsg = outputData?.error || data.data?.errorMessage;
          if (errorMsg) {
            this.executionError = `Node '${data.data?.nodeName || data.nodeId}': ${errorMsg}`;
          }
        } else {
          this.updateNodeStatus(data.nodeId, 'COMPLETED');
        }
      })
      .on('execution:node-failed', (data: any) => {
        console.log('[Flow] Node failed:', data.nodeId, data);
        this.updateNodeStatus(data.nodeId, 'FAILED');
      })
      .on('execution:completed', (data: any) => {
        console.log('[Flow] Execution completed:', data);
        this.partialExecutionStartNodeId = null; // Clear partial execution tracking
        this.setExecutionState(false, null);
      })
      .on('execution:failed', (data: any) => {
        console.log('[Flow] Execution failed:', data);
        this.executionError = data.data?.errorMessage || data.data?.error || 'Execution failed';
        this.partialExecutionStartNodeId = null; // Clear partial execution tracking
        this.setExecutionState(false, null);
      })
      .on('execution:cancelled', (data: any) => {
        console.log('[Flow] Execution cancelled:', data);
        this.partialExecutionStartNodeId = null; // Clear partial execution tracking
        this.setExecutionState(false, null);
      })
      .on('execution:llm-call-started', (data: any) => {
        const nodeId = data.data?.nodeId || data.nodeId;
        console.log('[Flow] LLM call started:', nodeId, data.data?.provider, data.data?.model);
        if (nodeId) {
          this.setAgentActivity(nodeId, { type: 'llm', name: data.data?.model, active: true });
        }
      })
      .on('execution:llm-call-completed', (data: any) => {
        const nodeId = data.data?.nodeId || data.nodeId;
        console.log('[Flow] LLM call completed:', nodeId, 'iteration:', data.data?.iteration);
        if (nodeId) {
          this.setAgentActivity(nodeId, { type: 'llm', name: data.data?.model, active: false });
        }
      })
      .on('execution:tool-call-started', (data: any) => {
        const nodeId = data.data?.nodeId || data.nodeId;
        console.log('[Flow] Tool call started:', nodeId, data.data?.toolName, 'toolNodeId:', data.data?.toolNodeId);
        if (nodeId) {
          this.setAgentActivity(nodeId, { type: 'tool', name: data.data?.toolName, active: true });
        }
        // Also flash the tool node if it exists
        if (data.data?.toolNodeId) {
          this.updateNodeStatus(data.data.toolNodeId, 'RUNNING');
        }
      })
      .on('execution:tool-call-completed', (data: any) => {
        const nodeId = data.data?.nodeId || data.nodeId;
        console.log('[Flow] Tool call completed:', nodeId, data.data?.toolName, 'success:', data.data?.success);
        if (nodeId) {
          this.setAgentActivity(nodeId, { type: 'tool', name: data.data?.toolName, active: false });
        }
        // Mark tool node as completed/failed
        if (data.data?.toolNodeId) {
          this.updateNodeStatus(data.data.toolNodeId, data.data?.success ? 'COMPLETED' : 'FAILED');
        }
      });

    // Pre-connect socket so it's ready when we need to subscribe
    const url = window.location.origin;
    const path = '/socket.io/workflow';
    console.log('[Flow] Pre-connecting socket:', { url, path });
    this.flowSocket.connect(url, path);
  }

  /**
   * Cleanup socket instance
   */
  private runDestroyHandler(): void {
    if (this.flowSocket) {
      console.log('[Flow] Cleaning up socket:', this.flowSocket.getId());
      this.flowSocket.cleanup();
      this.flowSocket = null;
    }
  }

  /**
   * Subscribe to execution for real-time updates
   */
  private subscribeToExecution(executionId: string): void {
    if (this.flowSocket) {
      console.log('[Flow] Subscribing to execution:', executionId);
      console.log('[Flow] Socket connected status:', this.flowSocket.isConnected());

      // Socket should already be connected from init, just subscribe
      this.flowSocket.subscribe(executionId);
    } else {
      console.warn('[Flow] Cannot subscribe - socket not initialized');
    }
  }

  /**
   * Subscribe to workflow for real-time updates (including external HTTP triggers)
   */
  private subscribeToWorkflow(workflowId: string): void {
    if (this.flowSocket) {
      console.log('[Flow] Subscribing to workflow:', workflowId);
      this.flowSocket.subscribeWorkflow(workflowId);
    } else {
      console.warn('[Flow] Cannot subscribe to workflow - socket not initialized');
    }
  }

  /**
   * Update status of a specific node (called from handlers)
   */
  public updateNodeStatus(nodeId: string, status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'): void {
    this.nodeStatuses = {
      ...this.nodeStatuses,
      [nodeId]: status,
    };
  }

  /**
   * Set agent activity state for a node (LLM calls, tool calls)
   */
  public setAgentActivity(nodeId: string, activity: { type: 'llm' | 'tool'; name?: string; active: boolean }): void {
    this.agentActivity = {
      ...this.agentActivity,
      [nodeId]: activity,
    };
  }

  /**
   * Set execution state (called from handlers)
   */
  public setExecutionState(isExecuting: boolean, executionId: string | null = null): void {
    this.isExecuting = isExecuting;
    this.currentExecutionId = executionId;
  }

  /**
   * Reset node statuses to pending only for nodes reachable from start nodes
   */
  public resetNodeStatuses(): void {
    if (!this.workflow?.nodes || !this.workflow?.edges) {
      this.nodeStatuses = {};
      return;
    }

    // Find start nodes
    const startTypes = ['START', 'HTTP_START', 'CHAT_START', 'SCHEDULE_START', 'WEBHOOK_START'];
    const startNodeIds = this.workflow.nodes
      .filter(n => startTypes.includes(n.type?.toUpperCase() || ''))
      .map(n => n.id);

    // Build adjacency list from edges
    const adjacency = new Map<string, string[]>();
    for (const edge of this.workflow.edges) {
      const targets = adjacency.get(edge.sourceNodeId) || [];
      targets.push(edge.targetNodeId);
      adjacency.set(edge.sourceNodeId, targets);
    }

    // BFS to find all reachable nodes from start nodes
    const reachable = new Set<string>(startNodeIds);
    const queue = [...startNodeIds];
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      const targets = adjacency.get(nodeId) || [];
      for (const targetId of targets) {
        if (!reachable.has(targetId)) {
          reachable.add(targetId);
          queue.push(targetId);
        }
      }
    }

    // Set PENDING only for reachable nodes
    const statuses: Record<string, 'PENDING'> = {};
    for (const nodeId of reachable) {
      statuses[nodeId] = 'PENDING';
    }
    this.nodeStatuses = statuses;
  }

  /**
   * Update DEBUG node configuration with execution output data
   */
  public updateDebugNodeOutput(nodeId: string, outputData: Record<string, unknown>): void {
    if (!this.workflow?.nodes) return;

    const nodeIndex = this.workflow.nodes.findIndex((n) => n.id === nodeId);
    if (nodeIndex === -1) return;

    const node = this.workflow.nodes[nodeIndex];
    const updatedNode = {
      ...node,
      configuration: {
        ...node.configuration,
        lastDebugOutput: outputData,
      },
    };

    // Update the workflow with the modified node
    const updatedNodes = [...this.workflow.nodes];
    updatedNodes[nodeIndex] = updatedNode;

    this.workflow = {
      ...this.workflow,
      nodes: updatedNodes,
    };

    console.log('[Flow] Updated DEBUG node output:', nodeId, outputData);
  }

  /**
   * Load KV entries for the current application
   */
  private async loadKvEntries(appId: string): Promise<void> {
    try {
      const entries = await getKvEntries(appId, {});
      this.kvEntries = entries || [];
    } catch (error) {
      console.error('[Flow] Failed to load KV entries:', error);
      this.kvEntries = [];
    }
  }

  /**
   * Handle creation of new KV entry from config panel
   */
  private async handleCreateKvEntry(detail: { keyPath: string; value: any; scope: string; isSecret: boolean }): Promise<void> {
    const appId = this.loadedApplicationId || this.detail?.appId || $currentApplication.get()?.uuid;
    if (!appId) {
      console.error('[Flow] Cannot create KV entry: no application ID');
      return;
    }

    try {
      const result = await setKvEntry(detail.keyPath, {
        applicationId: appId,
        value: detail.value,
        isSecret: detail.isSecret,
        scope: detail.scope,
      });

      if (result) {
        console.log('[Flow] Created KV entry:', detail.keyPath);
        // Refresh KV entries to include the new one
        await this.loadKvEntries(appId);
      }
    } catch (error) {
      console.error('[Flow] Failed to create KV entry:', error);
    }
  }

  private async loadWorkflow() {
    this.loading = true;
    // Use detail.appId as primary source, fall back to store
    const appId = this.detail?.appId || $currentApplication.get()?.uuid;

    console.log('[Flow] loadWorkflow called, detail:', this.detail, 'appId:', appId);

    if (appId) {
      // Store appId immediately so it survives canvas events
      this.loadedApplicationId = appId;

      // Load KV entries for this application
      await this.loadKvEntries(appId);

      // Load all workflows for this app
      const workflows = await getWorkflows(appId);
      if (workflows) {
        $workflows.set(workflows);
      }

      // Get or create the current workflow (use detail.workflowId if provided)
      const workflow = await getOrCreateWorkflow(appId, this.detail?.workflowId);
      if (workflow) {
        // Store IDs separately so they survive canvas events
        this.loadedWorkflowId = workflow.id;

        console.log('[Flow] Loaded workflow:', workflow.id, workflow.name, 'appId:', appId);

        // Load viewport from KV (or migrate from workflow if exists)
        let viewport = await getWorkflowViewport(workflow.id, appId);

        if (!viewport && workflow.viewport) {
          // Migrate existing viewport from workflow to KV
          await migrateWorkflowViewportToKv(workflow.id, appId, workflow.viewport);
          viewport = workflow.viewport;
        }

        this.currentViewport = viewport || getDefaultWorkflowViewport();

        // Set workflow with viewport from KV (not from workflow data)
        this.workflow = {
          ...workflow,
          viewport: this.currentViewport,
        };

        // Initialize viewport debouncer for this workflow
        this.viewportDebouncer = createViewportDebouncer((v) => {
          const currentAppId = this.loadedApplicationId || $currentApplication.get()?.uuid;
          if (currentAppId && this.workflow) {
            saveWorkflowViewport(this.workflow.id, currentAppId, v);
          }
        });

        // Subscribe to workflow events (for external HTTP triggers)
        this.subscribeToWorkflow(workflow.id);
      }
    } else {
      console.warn('[Flow] No appId available from detail or store');
    }

    this.loading = false;
  }

  private handleCanvasWorkflowChanged(event: CustomEvent<{ workflow: Workflow }>) {
    const { workflow } = event.detail;

    // Use stored IDs first, then detail prop, then workflow object, then event data
    const workflowId = this.loadedWorkflowId || this.detail?.workflowId || this.workflow?.id || workflow.id;
    const applicationId = this.loadedApplicationId || this.detail?.appId || this.workflow?.applicationId || workflow.applicationId;

    if (!workflowId) {
      console.error('[Flow] Cannot update: no workflow ID available');
      return;
    }

    // Preserve essential fields that canvas might not include in the event
    const preservedWorkflow: Workflow = {
      ...workflow,
      id: workflowId,
      applicationId: applicationId,
    };

    handleWorkflowChanged(preservedWorkflow);
  }

  /**
   * Handle viewport changes (pan/zoom) and save to KV
   */
  private handleViewportChanged(event: CustomEvent<{ viewport: CanvasViewport }>) {
    const { viewport } = event.detail;
    if (!this.workflow) return;

    this.currentViewport = viewport;

    // Use debouncer to save viewport
    if (this.viewportDebouncer) {
      this.viewportDebouncer.update(viewport);
    }
  }

  /**
   * Handle workflow trigger from START node click or Test Workflow button
   */
  private handleWorkflowTrigger(event: CustomEvent<{ node: any; startFromNode?: boolean; testData?: any }>) {
    const { node, startFromNode, testData } = event.detail;
    console.log('[Flow] Workflow triggered from node:', node.name, node.type, node.id);
    console.log('[Flow] Start from node:', startFromNode, 'Test data:', testData ? 'present' : 'none');
    console.log('[Flow] Current workflow:', this.workflow?.id, this.workflow?.name);

    if (startFromNode && node?.id) {
      // Execute starting from the specific node (partial execution)
      this.handleExecuteFromNode(node.id, testData);
    } else {
      // Execute the entire workflow
      this.handleExecute();
    }
  }

  /**
   * Execute workflow starting from a specific node
   */
  private async handleExecuteFromNode(startNodeId: string, testData?: any) {
    this.isExecuting = true;
    this.executionError = null;
    // Track partial execution for selective node status reset when socket events arrive
    this.partialExecutionStartNodeId = startNodeId;
    // Reset node statuses before execution (only nodes connected to this start node)
    this.resetNodeStatusesFromNode(startNodeId);

    try {
      // Build input data from test data if provided
      // Format it to match what the node expects (e.g., Document Loader expects 'content' and 'filename' fields)
      let input: Record<string, unknown> | undefined;
      if (testData) {
        input = {
          // For Document Loader: provide content as base64 and filename
          content: testData.base64 || testData.content,
          filename: testData.filename,
          contentType: testData.contentType,
          // Signal that this is test data with base64 content (overrides sourceType)
          _isTestData: true,
          _sourceType: 'base64',
          // Also include the raw testData for other node types that might need it
          testData,
        };
      }

      // Pass the startNodeId to execute only the subgraph from that node
      const result = await handleExecuteWorkflow(input, this.workflow?.id, { startNodeId });

      if (result?.id) {
        this.currentExecutionId = result.id;
        // Subscribe to real-time execution updates
        this.subscribeToExecution(result.id);

        // If execution completed synchronously, update UI
        if (result.status === 'COMPLETED' || result.status === 'FAILED') {
          this.isExecuting = false;
        }
      } else {
        this.isExecuting = false;
      }
    } catch (error) {
      console.error('[Flow] Execution from node error:', error);
      this.isExecuting = false;
      this.partialExecutionStartNodeId = null; // Clear on error
    }
  }

  /**
   * Reset node statuses for nodes reachable from a specific start node
   */
  private resetNodeStatusesFromNode(startNodeId: string): void {
    if (!this.workflow?.nodes || !this.workflow?.edges) {
      this.nodeStatuses = {};
      return;
    }

    // Build adjacency list from edges
    const adjacency = new Map<string, string[]>();
    for (const edge of this.workflow.edges) {
      const targets = adjacency.get(edge.sourceNodeId) || [];
      targets.push(edge.targetNodeId);
      adjacency.set(edge.sourceNodeId, targets);
    }

    // BFS to find all reachable nodes from the start node
    const reachable = new Set<string>([startNodeId]);
    const queue = [startNodeId];
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      const targets = adjacency.get(nodeId) || [];
      for (const targetId of targets) {
        if (!reachable.has(targetId)) {
          reachable.add(targetId);
          queue.push(targetId);
        }
      }
    }

    // Set PENDING only for reachable nodes
    const statuses: Record<string, 'PENDING'> = {};
    for (const nodeId of reachable) {
      statuses[nodeId] = 'PENDING';
    }
    this.nodeStatuses = statuses;
  }

  private async handleExecute() {
    this.isExecuting = true;
    // Reset node statuses before execution
    this.nodeStatuses = {};

    try {
      // Pass the currently displayed workflow ID to ensure we execute the right one
      const result = await handleExecuteWorkflow(undefined, this.workflow?.id);

      if (result?.id) {
        this.currentExecutionId = result.id;
        // Subscribe to real-time execution updates via handler
        this.subscribeToExecution(result.id);

        // If execution completed synchronously (fast workflow), update UI
        if (result.status === 'COMPLETED' || result.status === 'FAILED') {
          this.isExecuting = false;
        }
      } else {
        this.isExecuting = false;
      }
    } catch (error) {
      console.error('[Flow] Execution error:', error);
      this.isExecuting = false;
    }
  }

  private async handleSave() {
    await handleSaveWorkflow();
  }

  private getSaveStatusLabel(): string {
    switch (this.saveStatus) {
      case 'saved':
        return 'Saved';
      case 'saving':
        return 'Saving...';
      case 'dirty':
        return 'Unsaved changes';
      case 'error':
        return 'Save failed';
      default:
        return '';
    }
  }

  override render() {
    if (this.loading) {
      return html`
        <div class="flow-container">
          <div class="loading-overlay">
            <div class="loading-spinner"></div>
          </div>
        </div>
      `;
    }

    return html`
      <div class="flow-container">
        <div class="flow-toolbar">
          <div class="flow-toolbar-left">
            <span class="workflow-name">${this.workflow?.name || 'Demo Workflow'}</span>
            ${this.workflow
              ? html`
                  <span class="save-status ${this.saveStatus}">
                    ${this.getSaveStatusLabel()}
                  </span>
                `
              : html`
                  <span class="save-status" style="color: #6b7280; background: #f3f4f6;">
                    Preview Mode
                  </span>
                `
            }
          </div>
          <div class="flow-toolbar-right">
            <button
              class="toolbar-button secondary"
              @click=${this.handleSave}
              ?disabled=${this.saveStatus === 'saving' || !this.workflow}
            >
              Save
            </button>
            <button
              class="toolbar-button primary"
              @click=${this.handleExecute}
              ?disabled=${this.isExecuting || !this.workflow}
            >
              ${this.isExecuting ? 'Executing...' : 'Execute'}
            </button>
          </div>
        </div>
        ${this.executionError
          ? html`
              <div class="error-banner">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>${this.executionError}</span>
                <button class="error-dismiss" @click=${() => this.executionError = null}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            `
          : null
        }
        <div class="canvas-container ${!this.workflow ? 'demo-canvas-overlay' : ''}">
          ${!this.workflow
            ? html`
                <div class="demo-banner">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Demo Preview - Select or create a workflow to get started</span>
                </div>
              `
            : null
          }
          <workflow-canvas
            .workflow=${this.workflow || MOCK_WORKFLOW}
            .nodeStatuses=${this.nodeStatuses}
            .agentActivity=${this.agentActivity}
            .applicationId=${this.loadedApplicationId || ''}
            .kvEntries=${this.kvEntries.map(e => ({ keyPath: e.keyPath, value: e.value, isSecret: e.isSecret }))}
            .onCreateKvEntry=${(detail: any) => this.handleCreateKvEntry(detail)}
            @workflow-changed=${this.handleCanvasWorkflowChanged}
            @workflow-trigger=${this.handleWorkflowTrigger}
            @viewport-changed=${this.handleViewportChanged}
          ></workflow-canvas>
        </div>
      </div>
    `;
  }
}
