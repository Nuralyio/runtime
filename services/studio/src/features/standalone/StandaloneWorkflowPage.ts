/**
 * Standalone Workflow Page
 * A minimal workflow editor that can be accessed directly via URL without the full studio.
 * Route: /workflow/{workflowId}
 */

import { customElement, property, state } from 'lit/decorators.js';
import { html, LitElement, css } from 'lit';
import '../runtime/components/ui/nuraly-ui/src/components/canvas/workflow-canvas.component';
import '../runtime/components/ui/nuraly-ui/src/components/icon';
import { renderEditableName, editableNameStyles, type NameEditableHost } from '../../utils/header-name-editing';
import type {
  Workflow,
  CanvasViewport,
} from '../runtime/components/ui/nuraly-ui/src/components/canvas/workflow-canvas.types';
import {
  createViewportDebouncer,
  getDefaultViewport,
  type ViewportDebouncer,
} from '../../utils/workflow-utils';
import { workflowService } from '../../services/workflow.service';
import { createSocketFunctions } from '../runtime/handlers/runtime-api/socket';
import { setKvEntry, getKvEntry, getKvEntries, type KvEntry } from '../runtime/redux/store/kv';

type SaveStatus = 'saved' | 'saving' | 'dirty' | 'error';
type NodeStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

@customElement('standalone-workflow-page')
export class StandaloneWorkflowPage extends LitElement {
  static override styles = [editableNameStyles, css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      position: relative;
    }

    .standalone-container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: var(--n-color-surface-secondary, #f9fafb);
    }

    .standalone-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 20px;
      background: var(--n-color-surface, #fff);
      border-bottom: 1px solid var(--n-color-border, #e5e7eb);
      gap: 16px;
      flex-shrink: 0;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .back-link {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      font-size: 13px;
      color: var(--n-color-text-secondary, #6b7280);
      background: transparent;
      border: 1px solid var(--n-color-border, #e5e7eb);
      border-radius: 6px;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.15s ease;
    }

    .back-link:hover {
      color: var(--n-color-text, #111827);
      background: var(--n-color-surface-hover, #f9fafb);
    }

    .back-link svg {
      width: 14px;
      height: 14px;
    }

    .workflow-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .workflow-name {
      font-weight: 600;
      font-size: 16px;
      color: var(--n-color-text, #111827);
      margin: 0;
    }

    .save-status {
      font-size: 12px;
      padding: 4px 10px;
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

    .readonly-badge {
      font-size: 11px;
      padding: 3px 8px;
      border-radius: 4px;
      background: var(--n-color-warning-bg, #fffbeb);
      color: var(--n-color-warning, #f59e0b);
      font-weight: 500;
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

    .toolbar-button.template-active {
      background: var(--n-color-primary, #3b82f6);
      color: white;
      border: 1px solid var(--n-color-primary, #3b82f6);
    }

    .toolbar-button.template-active:hover {
      background: var(--n-color-primary-dark, #2563eb);
    }

    .toolbar-button svg {
      flex-shrink: 0;
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
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.9);
      z-index: 100;
      gap: 12px;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--n-color-border, #e5e7eb);
      border-top-color: var(--n-color-primary, #3b82f6);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .loading-text {
      font-size: 14px;
      color: var(--n-color-text-secondary, #6b7280);
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      text-align: center;
    }

    .error-icon {
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      color: var(--n-color-error, #ef4444);
    }

    .error-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--n-color-text, #111827);
      margin-bottom: 8px;
    }

    .error-message {
      font-size: 14px;
      color: var(--n-color-text-secondary, #6b7280);
      max-width: 400px;
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
  `];

  /** The workflow ID to load */
  @property({ type: String, attribute: 'workflow-id' })
  workflowId: string = '';

  /** Whether the page is in read-only mode */
  @property({ type: Boolean, attribute: 'readonly' })
  readonly: boolean = false;

  @state()
  private workflow: Workflow | null = null;

  @state()
  private loading = true;

  @state()
  private loadError: string | null = null;

  @state()
  private saveStatus: SaveStatus = 'saved';

  @state()
  private isExecuting = false;

  @state()
  private isTemplate = false;

  @state()
  private togglingTemplate = false;

  @state()
  private nodeStatuses: Record<string, NodeStatus> = {};

  @state()
  private agentActivity: Record<string, { type: 'llm' | 'tool'; name?: string; active: boolean }> = {};

  @state()
  private currentExecutionId: string | null = null;

  @state()
  private executionError: string | null = null;

  @state()
  private kvEntries: KvEntry[] = [];

  @state()
  private isEditingName = false;

  @state()
  private editedName = '';

  private flowSocket: any = null;
  private viewportDebouncer: ViewportDebouncer | null = null;
  private currentViewport: CanvasViewport = getDefaultViewport();
  private saveDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private lastSavedWorkflow: Workflow | null = null;

  // Store these separately so they don't get lost when canvas emits events
  private loadedWorkflowId: string | null = null;
  private loadedApplicationId: string | null = null;

  override connectedCallback() {
    super.connectedCallback();
    console.log('[StandaloneWorkflow] connectedCallback, workflowId:', this.workflowId);
    this.loadWorkflow();
    this.initSocket();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.cleanup();
  }

  private cleanup(): void {
    if (this.flowSocket) {
      this.flowSocket.cleanup();
      this.flowSocket = null;
    }
    if (this.viewportDebouncer) {
      this.viewportDebouncer.cancel();
    }
    if (this.saveDebounceTimer) {
      clearTimeout(this.saveDebounceTimer);
    }
  }

  private initSocket(): void {
    const { $socket } = createSocketFunctions();
    this.flowSocket = $socket.create();

    this.flowSocket
      .on('connect', () => {
        console.log('[StandaloneWorkflow] Socket connected');
      })
      .on('disconnect', (reason: string) => {
        console.log('[StandaloneWorkflow] Socket disconnected:', reason);
      })
      .on('execution:started', (data: any) => {
        this.executionError = null;
        this.resetNodeStatuses();
        this.isExecuting = true;
        this.currentExecutionId = data.executionId;
      })
      .on('execution:node-started', (data: any) => {
        this.updateNodeStatus(data.nodeId, 'RUNNING');
      })
      .on('execution:node-completed', (data: any) => {
        const status = data.data?.status || data.status || 'COMPLETED';
        const outputData = data.data?.outputData ? JSON.parse(data.data.outputData) : null;
        const hasError = outputData?.error || data.data?.errorMessage;

        if (status === 'FAILED' || hasError) {
          this.updateNodeStatus(data.nodeId, 'FAILED');
          const errorMsg = outputData?.error || data.data?.errorMessage;
          if (errorMsg) {
            this.executionError = `Node '${data.data?.nodeName || data.nodeId}': ${errorMsg}`;
          }
        } else {
          this.updateNodeStatus(data.nodeId, 'COMPLETED');
        }
      })
      .on('execution:node-failed', (data: any) => {
        this.updateNodeStatus(data.nodeId, 'FAILED');
      })
      .on('execution:completed', () => {
        this.isExecuting = false;
        this.currentExecutionId = null;
      })
      .on('execution:failed', (data: any) => {
        this.executionError = data.data?.errorMessage || data.data?.error || 'Execution failed';
        this.isExecuting = false;
        this.currentExecutionId = null;
      })
      .on('execution:cancelled', () => {
        this.isExecuting = false;
        this.currentExecutionId = null;
      })
      .on('execution:llm-call-started', (data: any) => {
        const nodeId = data.data?.nodeId || data.nodeId;
        if (nodeId) {
          this.setAgentActivity(nodeId, { type: 'llm', name: data.data?.model, active: true });
        }
      })
      .on('execution:llm-call-completed', (data: any) => {
        const nodeId = data.data?.nodeId || data.nodeId;
        if (nodeId) {
          this.setAgentActivity(nodeId, { type: 'llm', name: data.data?.model, active: false });
        }
      })
      .on('execution:tool-call-started', (data: any) => {
        const nodeId = data.data?.nodeId || data.nodeId;
        if (nodeId) {
          this.setAgentActivity(nodeId, { type: 'tool', name: data.data?.toolName, active: true });
        }
        if (data.data?.toolNodeId) {
          this.updateNodeStatus(data.data.toolNodeId, 'RUNNING');
        }
      })
      .on('execution:tool-call-completed', (data: any) => {
        const nodeId = data.data?.nodeId || data.nodeId;
        if (nodeId) {
          this.setAgentActivity(nodeId, { type: 'tool', name: data.data?.toolName, active: false });
        }
        if (data.data?.toolNodeId) {
          this.updateNodeStatus(data.data.toolNodeId, data.data?.success ? 'COMPLETED' : 'FAILED');
        }
      });

    // Pre-connect socket
    const url = window.location.origin;
    const path = '/socket.io/workflow';
    this.flowSocket.connect(url, path);
  }

  /**
   * Load KV entries for the current application
   */
  private async loadKvEntries(appId: string): Promise<void> {
    try {
      const entries = await getKvEntries(appId, {});
      this.kvEntries = entries || [];
    } catch (error) {
      console.error('[StandaloneWorkflow] Failed to load KV entries:', error);
      this.kvEntries = [];
    }
  }

  /**
   * Handle creation of new KV entry from config panel
   */
  private async handleCreateKvEntry(detail: { keyPath: string; value: any; scope: string; isSecret: boolean }): Promise<void> {
    const appId = this.loadedApplicationId;
    if (!appId) {
      console.error('[StandaloneWorkflow] Cannot create KV entry: no application ID');
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
        console.log('[StandaloneWorkflow] Created KV entry:', detail.keyPath);
        // Refresh KV entries to include the new one
        await this.loadKvEntries(appId);
      }
    } catch (error) {
      console.error('[StandaloneWorkflow] Failed to create KV entry:', error);
    }
  }

  private async loadWorkflow(): Promise<void> {
    if (!this.workflowId) {
      this.loadError = 'No workflow ID provided';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.loadError = null;

    try {
      // workflowService.getWorkflow already returns a properly formatted Workflow
      const workflow = await workflowService.getWorkflow(this.workflowId);

      if (!workflow) {
        this.loadError = 'Workflow not found';
        this.loading = false;
        return;
      }

      console.log('[StandaloneWorkflow] Loaded workflow:', workflow.id, workflow.name, 'appId:', workflow.applicationId);

      // Store IDs separately so they survive canvas events
      this.loadedWorkflowId = workflow.id;
      this.loadedApplicationId = workflow.applicationId || null;
      this.isTemplate = !!(workflow as any).isTemplate;

      // Load KV entries for this application (needed for API key selects etc.)
      if (this.loadedApplicationId) {
        await this.loadKvEntries(this.loadedApplicationId);
      } else {
        console.warn('[StandaloneWorkflow] No applicationId - KV entries will not be loaded');
      }

      // Load viewport from KV (pass applicationId since this.workflow isn't set yet)
      const viewport = await this.loadViewport(workflow.applicationId);
      this.currentViewport = viewport || getDefaultViewport();

      // Set workflow with loaded viewport - ensure id is preserved
      this.workflow = {
        ...workflow,
        id: workflow.id,
        applicationId: workflow.applicationId,
        viewport: this.currentViewport,
      };

      // Track for diffing on save
      this.lastSavedWorkflow = JSON.parse(JSON.stringify(this.workflow));

      // Setup viewport debouncer
      this.viewportDebouncer = createViewportDebouncer((v) => this.saveViewport(v));

      // Subscribe to workflow events for real-time updates
      if (this.flowSocket) {
        this.flowSocket.subscribeWorkflow(this.workflowId);
      }

      this.loading = false;
    } catch (error: any) {
      console.error('[StandaloneWorkflow] Failed to load workflow:', error);
      this.loadError = error.message || 'Failed to load workflow';
      this.loading = false;
    }
  }

  private buildViewportKeyPath(): string {
    return `_user_prefs/workflow_viewport/${this.workflowId}`;
  }

  private async loadViewport(applicationId?: string): Promise<CanvasViewport | null> {
    try {
      // Use provided appId, fall back to workflow's appId, then to _standalone
      const appId = applicationId || this.workflow?.applicationId || '_standalone';
      const keyPath = this.buildViewportKeyPath();
      const entry = await getKvEntry(appId, keyPath);
      return entry?.value as CanvasViewport || null;
    } catch {
      return null;
    }
  }

  private async saveViewport(viewport: CanvasViewport): Promise<void> {
    try {
      const appId = this.workflow?.applicationId || '_standalone';
      const keyPath = this.buildViewportKeyPath();
      await setKvEntry(keyPath, {
        applicationId: appId,
        scope: 'user',
        value: viewport,
        isSecret: false,
      });
    } catch (error) {
      console.error('[StandaloneWorkflow] Failed to save viewport:', error);
    }
  }

  private updateNodeStatus(nodeId: string, status: NodeStatus): void {
    this.nodeStatuses = {
      ...this.nodeStatuses,
      [nodeId]: status,
    };
  }

  private setAgentActivity(
    nodeId: string,
    activity: { type: 'llm' | 'tool'; name?: string; active: boolean }
  ): void {
    this.agentActivity = {
      ...this.agentActivity,
      [nodeId]: activity,
    };
  }

  private resetNodeStatuses(): void {
    if (!this.workflow?.nodes || !this.workflow?.edges) {
      this.nodeStatuses = {};
      return;
    }

    // Find start nodes
    const startTypes = ['START', 'HTTP_START', 'CHAT_START', 'SCHEDULE_START', 'WEBHOOK_START'];
    const startNodeIds = this.workflow.nodes
      .filter((n) => startTypes.includes(n.type?.toUpperCase() || ''))
      .map((n) => n.id);

    // Build adjacency list
    const adjacency = new Map<string, string[]>();
    for (const edge of this.workflow.edges) {
      const targets = adjacency.get(edge.sourceNodeId) || [];
      targets.push(edge.targetNodeId);
      adjacency.set(edge.sourceNodeId, targets);
    }

    // BFS to find reachable nodes
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

    // Set PENDING for reachable nodes
    const statuses: Record<string, 'PENDING'> = {};
    for (const nodeId of reachable) {
      statuses[nodeId] = 'PENDING';
    }
    this.nodeStatuses = statuses;
  }

  private handleCanvasWorkflowChanged(event: CustomEvent<{ workflow: Workflow }>): void {
    // Use URL param (this.workflowId) as primary source - always available if page loaded
    if (this.readonly || !this.workflowId) {
      if (!this.workflowId) {
        console.error('[StandaloneWorkflow] No workflow ID in URL');
      }
      return;
    }

    const { workflow } = event.detail;
    this.workflow = {
      ...workflow,
      id: this.workflowId, // URL param - always valid
      applicationId: this.loadedApplicationId || workflow.applicationId,
      viewport: this.currentViewport,
    };
    this.saveStatus = 'dirty';

    // Debounced save
    this.saveWorkflowDebounced();
  }

  async saveNameToServer(name: string): Promise<void> {
    if (this.workflow) {
      this.workflow = { ...this.workflow, name };
    }
    try {
      await workflowService.patchWorkflow(this.workflowId, { name });
    } catch (error) {
      console.error('[StandaloneWorkflow] Failed to save workflow name:', error);
    }
  }

  private handleViewportChanged(event: CustomEvent<{ viewport: CanvasViewport }>): void {
    const { viewport } = event.detail;
    this.currentViewport = viewport;

    if (this.viewportDebouncer) {
      this.viewportDebouncer.update(viewport);
    }
  }

  private handleWorkflowTrigger(event: CustomEvent<{ node: any; startFromNode?: boolean; testData?: any }>): void {
    const { node, startFromNode, testData } = event.detail;

    if (startFromNode && node?.id) {
      this.executeFromNode(node.id, testData);
    } else {
      this.executeWorkflow();
    }
  }

  private async executeWorkflow(): Promise<void> {
    if (!this.workflow) return;

    this.isExecuting = true;
    this.executionError = null;
    this.nodeStatuses = {};

    try {
      const result = await workflowService.executeWorkflow(this.workflow.id);

      if (result?.id) {
        this.currentExecutionId = result.id;
        if (this.flowSocket) {
          this.flowSocket.subscribe(result.id);
        }

        if (result.status === 'COMPLETED' || result.status === 'FAILED') {
          this.isExecuting = false;
        }
      } else {
        this.isExecuting = false;
      }
    } catch (error) {
      console.error('[StandaloneWorkflow] Execution error:', error);
      this.isExecuting = false;
    }
  }

  private async executeFromNode(startNodeId: string, testData?: any): Promise<void> {
    if (!this.workflow) return;

    this.isExecuting = true;
    this.executionError = null;
    this.resetNodeStatusesFromNode(startNodeId);

    try {
      let input: Record<string, unknown> | undefined;
      if (testData) {
        input = {
          content: testData.base64 || testData.content,
          filename: testData.filename,
          contentType: testData.contentType,
          _isTestData: true,
          _sourceType: 'base64',
          testData,
        };
      }

      const result = await workflowService.executeWorkflow(this.workflow.id, input, { startNodeId });

      if (result?.id) {
        this.currentExecutionId = result.id;
        if (this.flowSocket) {
          this.flowSocket.subscribe(result.id);
        }

        if (result.status === 'COMPLETED' || result.status === 'FAILED') {
          this.isExecuting = false;
        }
      } else {
        this.isExecuting = false;
      }
    } catch (error) {
      console.error('[StandaloneWorkflow] Execution from node error:', error);
      this.isExecuting = false;
    }
  }

  private resetNodeStatusesFromNode(startNodeId: string): void {
    if (!this.workflow?.nodes || !this.workflow?.edges) {
      this.nodeStatuses = {};
      return;
    }

    // Build adjacency list
    const adjacency = new Map<string, string[]>();
    for (const edge of this.workflow.edges) {
      const targets = adjacency.get(edge.sourceNodeId) || [];
      targets.push(edge.targetNodeId);
      adjacency.set(edge.sourceNodeId, targets);
    }

    // BFS from start node
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

    const statuses: Record<string, 'PENDING'> = {};
    for (const nodeId of reachable) {
      statuses[nodeId] = 'PENDING';
    }
    this.nodeStatuses = statuses;
  }

  private saveWorkflowDebounced(): void {
    if (this.saveDebounceTimer) {
      clearTimeout(this.saveDebounceTimer);
    }

    this.saveDebounceTimer = setTimeout(() => {
      this.saveWorkflow();
    }, 500);
  }

  private async saveWorkflow(): Promise<void> {
    if (!this.workflow || this.readonly || !this.workflowId) return;

    // Ensure ID is set from URL param before saving
    this.workflow.id = this.workflowId;

    console.log('[StandaloneWorkflow] Saving workflow:', this.workflow.id, this.workflow.name);

    this.saveStatus = 'saving';

    try {
      await workflowService.updateWorkflow(this.workflow, this.workflow.applicationId || '');

      // Sync nodes/edges as needed
      await this.syncWorkflowChanges();

      this.lastSavedWorkflow = JSON.parse(JSON.stringify(this.workflow));
      this.saveStatus = 'saved';
    } catch (error) {
      console.error('[StandaloneWorkflow] Save error:', error);
      this.saveStatus = 'error';
    }
  }

  private isValidUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  private async syncNodes(
    workflowId: string,
    oldNodes: any[],
    newNodes: any[],
    nodeIdMap: Map<string, string>,
  ): Promise<void> {
    const oldNodeIds = new Set(oldNodes.map((n) => n.id));
    const newNodeIds = new Set(newNodes.map((n) => n.id));

    for (const node of newNodes) {
      if (!oldNodeIds.has(node.id) || !this.isValidUUID(node.id)) {
        const savedNode = await workflowService.addNode(workflowId, node);
        nodeIdMap.set(node.id, savedNode.id);
      }
    }

    for (const node of newNodes) {
      if (!oldNodeIds.has(node.id) || !this.isValidUUID(node.id)) continue;
      const oldNode = oldNodes.find((n) => n.id === node.id);
      if (!oldNode || JSON.stringify(oldNode) === JSON.stringify(node)) continue;
      try {
        await workflowService.updateNode(node, workflowId);
      } catch (error: any) {
        if (error.message?.includes('404') || error.message?.includes('not found')) {
          const savedNode = await workflowService.addNode(workflowId, node);
          nodeIdMap.set(node.id, savedNode.id);
        } else {
          throw error;
        }
      }
    }

    for (const oldNode of oldNodes) {
      if (!newNodeIds.has(oldNode.id) && this.isValidUUID(oldNode.id)) {
        await workflowService.deleteNode(oldNode.id, workflowId);
      }
    }
  }

  private async syncEdges(
    workflowId: string,
    oldEdges: any[],
    newEdges: any[],
    nodeIdMap: Map<string, string>,
  ): Promise<void> {
    const oldEdgeIds = new Set(oldEdges.map((e) => e.id));

    for (const edge of newEdges) {
      if (!oldEdgeIds.has(edge.id) || !this.isValidUUID(edge.id)) {
        const mappedEdge = {
          ...edge,
          sourceNodeId: nodeIdMap.get(edge.sourceNodeId) || edge.sourceNodeId,
          targetNodeId: nodeIdMap.get(edge.targetNodeId) || edge.targetNodeId,
        };
        await workflowService.addEdge(workflowId, mappedEdge);
      }
    }

    for (const oldEdge of oldEdges) {
      const stillExists = newEdges.some((e) => e.id === oldEdge.id);
      if (!stillExists && this.isValidUUID(oldEdge.id)) {
        await workflowService.deleteEdge(oldEdge.id, workflowId);
      }
    }
  }

  private remapNodeIds(nodeIdMap: Map<string, string>): void {
    if (!this.workflow || nodeIdMap.size === 0) return;
    const updatedNodes = this.workflow.nodes.map((node) => ({
      ...node,
      id: nodeIdMap.get(node.id) || node.id,
    }));
    const updatedEdges = this.workflow.edges.map((edge) => ({
      ...edge,
      sourceNodeId: nodeIdMap.get(edge.sourceNodeId) || edge.sourceNodeId,
      targetNodeId: nodeIdMap.get(edge.targetNodeId) || edge.targetNodeId,
    }));
    this.workflow = { ...this.workflow, nodes: updatedNodes, edges: updatedEdges };
  }

  private async syncWorkflowChanges(): Promise<void> {
    if (!this.workflow || !this.lastSavedWorkflow) return;

    const nodeIdMap = new Map<string, string>();
    const oldNodes = this.lastSavedWorkflow.nodes || [];
    const newNodes = this.workflow.nodes || [];

    await this.syncNodes(this.workflow.id, oldNodes, newNodes, nodeIdMap);
    await this.syncEdges(
      this.workflow.id,
      this.lastSavedWorkflow.edges || [],
      this.workflow.edges || [],
      nodeIdMap,
    );
    this.remapNodeIds(nodeIdMap);
  }

  private async handleManualSave(): Promise<void> {
    await this.saveWorkflow();
  }

  private async handleToggleTemplate(): Promise<void> {
    if (!this.workflowId || this.togglingTemplate) return;
    this.togglingTemplate = true;
    try {
      const newValue = !this.isTemplate;
      await workflowService.setTemplate(this.workflowId, newValue);
      this.isTemplate = newValue;
    } catch (error) {
      console.error('[StandaloneWorkflow] Failed to toggle template:', error);
    } finally {
      this.togglingTemplate = false;
    }
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
        <div class="standalone-container">
          <div class="loading-overlay">
            <div class="loading-spinner"></div>
            <span class="loading-text">Loading workflow...</span>
          </div>
        </div>
      `;
    }

    if (this.loadError) {
      return html`
        <div class="standalone-container">
          <div class="standalone-header">
            <div class="header-left">
              <a href="/dashboard" class="back-link">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Dashboard
              </a>
            </div>
          </div>
          <div class="error-container">
            <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <h2 class="error-title">Unable to Load Workflow</h2>
            <p class="error-message">${this.loadError}</p>
          </div>
        </div>
      `;
    }

    return html`
      <div class="standalone-container">
        <div class="standalone-header">
          <div class="header-left">
            <a href="/dashboard" class="back-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Dashboard
            </a>
            <div class="workflow-info">
              ${this.readonly
                ? html`<h1 class="workflow-name">${this.workflow?.name || 'Workflow'}</h1>`
                : renderEditableName(this as unknown as NameEditableHost, 'Workflow')
              }
              ${this.readonly
                ? html`<span class="readonly-badge">Read Only</span>`
                : html`<span class="save-status ${this.saveStatus}">${this.getSaveStatusLabel()}</span>`
              }
            </div>
          </div>
          <div class="header-right">
            ${!this.readonly
              ? html`
                  <button
                    class="toolbar-button ${this.isTemplate ? 'template-active' : 'secondary'}"
                    @click=${this.handleToggleTemplate}
                    ?disabled=${this.togglingTemplate}
                    title=${this.isTemplate ? 'Remove from templates' : 'Save as template'}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="3" width="7" height="7"></rect>
                      <rect x="14" y="3" width="7" height="7"></rect>
                      <rect x="14" y="14" width="7" height="7"></rect>
                      <rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                    ${this.isTemplate ? 'Template' : 'Save as Template'}
                  </button>
                  <button
                    class="toolbar-button secondary"
                    @click=${this.handleManualSave}
                    ?disabled=${this.saveStatus === 'saving'}
                  >
                    Save
                  </button>
                `
              : null
            }
            <button
              class="toolbar-button primary"
              @click=${() => this.executeWorkflow()}
              ?disabled=${this.isExecuting || this.readonly}
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
                <button class="error-dismiss" @click=${() => (this.executionError = null)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            `
          : null
        }

        <div class="canvas-container">
          <workflow-canvas
            .workflow=${this.workflow}
            .nodeStatuses=${this.nodeStatuses}
            .agentActivity=${this.agentActivity}
            .readonly=${this.readonly}
            .applicationId=${this.loadedApplicationId || ''}
            .kvEntries=${this.kvEntries.map(e => ({ keyPath: e.keyPath, value: e.value, isSecret: e.isSecret }))}
            .onCreateKvEntry=${(detail: any) => this.handleCreateKvEntry(detail)}
            canvas-id=${this.workflowId}
            ?collaborative=${true}
            @workflow-changed=${this.handleCanvasWorkflowChanged}
            @workflow-trigger=${this.handleWorkflowTrigger}
            @viewport-changed=${this.handleViewportChanged}
          ></workflow-canvas>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'standalone-workflow-page': StandaloneWorkflowPage;
  }
}
