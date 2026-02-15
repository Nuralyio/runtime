/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import {
  Workflow,
  WorkflowNode,
  NodeType,
  CanvasType,
  ExecutionStatus,
  WorkflowNodeType,
  NodeConfiguration,
  TriggerConnectionState,
  isPersistentTriggerNode,
  NODE_TEMPLATES,
} from './workflow-canvas.types.js';
import type { DatabaseProvider } from './data-node/data-node.types.js';
import { styles } from './workflow-canvas.style.js';
import './workflow-node.component.js';
import { ChatbotCoreController } from '../chatbot/core/chatbot-core.controller.js';
import { ChatbotSender } from '../chatbot/chatbot.types.js';
import { WorkflowSocketProvider } from '../chatbot/providers/workflow-socket-provider.js';

// Templates
import {
  renderPaletteTemplate,
  renderConfigPanelTemplate,
} from './templates/index.js';

// Base class
import { BaseCanvasElement } from './base-canvas.component.js';

// Utils
import { getAllAvailableVariablesWithDynamic } from './utils/variable-resolver.js';

// Constants
import {
  WORKFLOW_NODE_WIDTH,
  WORKFLOW_NODE_HEIGHT,
  WORKFLOW_NOTE_DEFAULT_WIDTH,
  WORKFLOW_NOTE_DEFAULT_HEIGHT,
  TABLE_DEFAULT_WIDTH,
  TABLE_DEFAULT_HEIGHT,
  TABLE_MIN_WIDTH,
  TABLE_MIN_HEIGHT,
  TRIGGER_POLL_INTERVAL_MS,
  FRAME_DEFAULT_LABEL,
} from './canvas.constants.js';

/**
 * Workflow canvas component for visual workflow editing
 *
 * @element workflow-canvas
 * @fires workflow-changed - When workflow is modified
 * @fires node-selected - When a node is selected
 * @fires node-configured - When a node configuration is requested
 */
@customElement('workflow-canvas')
export class WorkflowCanvasElement extends BaseCanvasElement {
  static override styles = styles;

  // ==================== Workflow-specific Properties ====================

  @property({ type: String })
  canvasType: CanvasType = CanvasType.WORKFLOW;

  @property({ type: Object })
  nodeStatuses: Record<string, 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'> = {};

  @property({ type: Object })
  agentActivity: Record<string, { type: 'llm' | 'tool'; name?: string; active: boolean }> = {};

  @property({ type: Boolean })
  listenToExecutionEvents = false;

  @property({ type: String })
  get executionId(): string | null {
    return this.currentExecutionId;
  }

  set executionId(value: string | null) {
    const oldValue = this.currentExecutionId;
    this.currentExecutionId = value;
    this.requestUpdate('executionId', oldValue);

    if (value && value !== oldValue) {
      this.fetchExecutionData(value);
    } else if (!value) {
      this.nodeExecutionData.clear();
    }
  }

  @property({ attribute: false })
  databaseProvider?: DatabaseProvider;

  @property({ type: String })
  applicationId: string = '';

  @property({ attribute: false })
  kvEntries: { keyPath: string; value?: any; isSecret: boolean }[] = [];

  @property({ attribute: false })
  onCreateKvEntry?: (detail: { keyPath: string; value: any; scope: string; isSecret: boolean }) => void;

  // ==================== Workflow-specific State ====================

  @state()
  private paletteSearchTerm: string = '';

  @state()
  private previewNodeId: string | null = null;

  @state()
  private isHoveringDisabledOverlay = false;

  @state()
  private httpPreviewBody: string = '{\n  \n}';

  @state()
  private httpPreviewResponse: string = '';

  @state()
  private httpPreviewLoading: boolean = false;

  @state()
  private httpPreviewError: string = '';

  @state()
  private dynamicVariables: import('./templates/config-panel/types.js').DynamicVariable[] = [];

  @state()
  private loadingVariables: boolean = false;

  @state()
  private nodeExecutionData: Map<string, import('./templates/config-panel/types.js').NodeExecutionData> = new Map();

  @state()
  private currentExecutionId: string | null = null;

  // Chatbot preview
  private chatPreviewController: ChatbotCoreController | null = null;
  private chatPreviewProvider: WorkflowSocketProvider | null = null;

  // Trigger status polling
  private triggerStatuses: Map<string, {
    triggerId: string;
    connectionState: TriggerConnectionState;
    health?: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' | 'UNKNOWN';
    messagesReceived?: number;
    lastMessageAt?: string;
    stateReason?: string;
    webhookUrl?: string;
    inDevMode?: boolean;
  }> = new Map();

  private triggerPollingInterval: ReturnType<typeof setInterval> | null = null;

  // ==================== Abstract Method Implementations ====================

  protected override normalizeNodes(nodes: WorkflowNode[]): WorkflowNode[] {
    return nodes.map(node => ({
      ...node,
      status: node.status
        ? (node.status.toUpperCase() as ExecutionStatus)
        : undefined,
    }));
  }

  protected override getNodeDimensionsForContainment(_node: WorkflowNode): { width: number; height: number } {
    return { width: WORKFLOW_NODE_WIDTH, height: WORKFLOW_NODE_HEIGHT };
  }

  protected override shouldExcludeFromContainment(node: WorkflowNode): boolean {
    return node.type === WorkflowNodeType.NOTE;
  }

  protected override onWorkflowLoaded(value: Workflow, oldValue: Workflow): void {
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

  protected override getNoteContentKey(_node: WorkflowNode): string {
    return 'noteContent';
  }

  protected override getNoteSizeKeys(): { widthKey: string; heightKey: string } {
    return { widthKey: 'noteWidth', heightKey: 'noteHeight' };
  }

  protected override getDefaultNoteSize(): { width: number; height: number } {
    return { width: WORKFLOW_NOTE_DEFAULT_WIDTH, height: WORKFLOW_NOTE_DEFAULT_HEIGHT };
  }

  protected override getCanvasType(): CanvasType {
    return this.canvasType;
  }

  // ==================== Hook Overrides ====================

  protected override onNodeMouseDownExtra(node: WorkflowNode): void {
    if (
      node.type === WorkflowNodeType.CHAT_START &&
      node.configuration?.alwaysOpenPlan === true &&
      this.previewNodeId !== node.id
    ) {
      this.handleNodePreview({ detail: { node } } as CustomEvent);
    }
  }

  protected override onConnected(): void {
    this.addEventListener('test-workflow-request', this.handleTestWorkflowRequest);
    this.startTriggerPollingIfNeeded();
  }

  protected override onDisconnected(): void {
    this.removeEventListener('test-workflow-request', this.handleTestWorkflowRequest);
    this.cleanupChatPreview();
    this.stopTriggerPolling();
    this._cleanupPaletteTouchDrag();
  }

  override willUpdate(changedProperties: Map<string | number | symbol, unknown>) {
    super.willUpdate(changedProperties);

    if (changedProperties.has('workflow')) {
      this.startTriggerPollingIfNeeded();
    }
  }

  // ==================== Nodes with Statuses ====================

  protected override getNodesForRendering(): WorkflowNode[] {
    return this.getNodesWithStatuses();
  }

  private getNodesWithStatuses(): WorkflowNode[] {
    const hasActiveExecution = Object.keys(this.nodeStatuses).length > 0;

    return this.workflow.nodes.map(node => {
      const activity = this.agentActivity[node.id];
      const baseNode = {
        ...node,
        agentActivity: activity?.active ? activity : undefined,
      };

      if (this.nodeStatuses[node.id]) {
        return { ...baseNode, status: this.nodeStatuses[node.id].toUpperCase() as ExecutionStatus };
      } else if (hasActiveExecution) {
        return { ...baseNode, status: undefined };
      } else {
        return baseNode;
      }
    });
  }

  // ==================== Trigger Status Polling ====================

  private hasPersistentTriggerNodes(): boolean {
    return this.workflow.nodes.some(n => isPersistentTriggerNode(n.type));
  }

  private startTriggerPollingIfNeeded() {
    if (this.hasPersistentTriggerNodes() && !this.triggerPollingInterval) {
      this.fetchTriggerStatuses();
      this.triggerPollingInterval = setInterval(() => this.fetchTriggerStatuses(), TRIGGER_POLL_INTERVAL_MS);
    } else if (!this.hasPersistentTriggerNodes() && this.triggerPollingInterval) {
      this.stopTriggerPolling();
    }
  }

  private stopTriggerPolling() {
    if (this.triggerPollingInterval) {
      clearInterval(this.triggerPollingInterval);
      this.triggerPollingInterval = null;
    }
  }

  private async fetchTriggerStatuses() {
    if (!this.workflow.id) return;

    try {
      const triggersRes = await fetch(`/api/v1/workflows/${this.workflow.id}/trigger-defs`);
      if (!triggersRes.ok) return;
      const triggers: Array<{ id: string; type: string; name: string; webhookUrl?: string }> = await triggersRes.json();

      const persistentTypes = new Set([
        'TELEGRAM_BOT', 'SLACK_SOCKET', 'DISCORD_BOT', 'WHATSAPP_WEBHOOK', 'CUSTOM_WEBSOCKET',
      ]);
      const persistentTriggers = triggers.filter(t => persistentTypes.has(t.type));

      const statusPromises = persistentTriggers.map(async (trigger) => {
        try {
          const statusRes = await fetch(`/api/v1/triggers/${trigger.id}/status`);
          if (!statusRes.ok) return { trigger, status: null };
          const status = await statusRes.json();
          return { trigger, status };
        } catch {
          return { trigger, status: null };
        }
      });

      const results = await Promise.all(statusPromises);

      const newStatuses = new Map<string, typeof this.triggerStatuses extends Map<string, infer V> ? V : never>();

      for (const result of results) {
        const { trigger, status } = result;
        const matchingNode = this.workflow.nodes.find(n => n.type === trigger.type);
        if (matchingNode) {
          newStatuses.set(matchingNode.id, {
            triggerId: trigger.id,
            connectionState: (status?.connectionState || 'DISCONNECTED') as TriggerConnectionState,
            health: status?.health,
            messagesReceived: status?.messagesReceived,
            lastMessageAt: status?.lastMessageAt,
            stateReason: status?.stateReason,
            webhookUrl: trigger.webhookUrl,
            inDevMode: status?.inDevMode,
          });
        }
      }

      this.triggerStatuses = newStatuses;
      this.requestUpdate();
    } catch {
      // Silently fail - trigger status is non-critical
    }
  }

  async activateTrigger(triggerId: string) {
    try {
      await fetch(`/api/v1/triggers/${triggerId}/activate`, { method: 'POST' });
    } catch {
      // Silently fail
    }
    await this.fetchTriggerStatuses();
  }

  async deactivateTrigger(triggerId: string) {
    try {
      await fetch(`/api/v1/triggers/${triggerId}/deactivate`, { method: 'POST' });
    } catch {
      // Silently fail
    }
    await this.fetchTriggerStatuses();
  }

  async createAndActivateTrigger(nodeType: string, config: NodeConfiguration): Promise<string | undefined> {
    if (!this.workflow?.id) return undefined;
    try {
      const createRes = await fetch(`/api/v1/workflows/${this.workflow.id}/trigger-defs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${nodeType} trigger`,
          type: nodeType,
          configuration: JSON.stringify(config),
        }),
      });
      if (!createRes.ok) return undefined;
      const trigger = await createRes.json();

      // Activate the trigger
      try {
        await fetch(`/api/v1/triggers/${trigger.id}/activate`, { method: 'POST' });
      } catch {
        // Activation may fail but trigger is created
      }

      // Always refresh statuses so UI updates
      await this.fetchTriggerStatuses();
      return trigger.id;
    } catch {
      await this.fetchTriggerStatuses();
      return undefined;
    }
  }

  async toggleDevMode(triggerId: string, enable: boolean) {
    try {
      await fetch(`/api/v1/triggers/${triggerId}/dev-mode`, {
        method: enable ? 'POST' : 'DELETE',
      });
    } catch {
      // Silently fail
    }
    await this.fetchTriggerStatuses();
  }

  // ==================== Chat Preview ====================

  private async handleNodePreview(e: CustomEvent) {
    const { node } = e.detail;
    if (this.previewNodeId === node.id) {
      this.closePreviewPanel();
    } else {
      await this.cleanupChatPreview();
      this.previewNodeId = node.id;

      if (node.type === WorkflowNodeType.CHAT_START && this.workflow?.id) {
        await this.initializeChatPreview(this.workflow.id, node.configuration);
      }
    }
  }

  private async initializeChatPreview(workflowId: string, nodeConfig?: NodeConfiguration): Promise<void> {
    try {
      this.chatPreviewProvider = new WorkflowSocketProvider();
      await this.connectChatPreviewSocket(workflowId);
      this.setupExecutionSocketListeners();
      this.createChatPreviewController(nodeConfig);
      console.log('[Canvas] Chat preview initialized for workflow:', workflowId);
    } catch (error) {
      console.error('[Canvas] Failed to initialize chat preview:', error);
      this.chatPreviewController = null;
      this.chatPreviewProvider = null;
    }
  }

  private async connectChatPreviewSocket(workflowId: string): Promise<void> {
    const socketUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8000';

    await this.chatPreviewProvider!.connect({
      workflowId,
      socketUrl,
      socketPath: '/socket.io/workflow',
      triggerEndpoint: '/api/v1/workflows/{workflowId}/trigger/chat',
      responseTimeout: 60000,
      onMessage: (message: string) => {
        if (this.chatPreviewController) {
          this.chatPreviewController.addMessage({
            id: `bot-${Date.now()}`,
            sender: ChatbotSender.Bot,
            text: message,
            timestamp: new Date().toISOString(),
          });
        }
      },
    });
  }

  private setupExecutionSocketListeners(): void {
    const socket = this.chatPreviewProvider!.getSocket();
    if (!socket) return;

    socket.on('execution:started', (event: any) => {
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

  private createChatPreviewController(nodeConfig?: NodeConfiguration): void {
    const enableFileUpload = nodeConfig?.enableFileUpload === true;
    console.log('[Canvas] Creating chat controller with config:', { enableFileUpload, nodeConfig });

    this.chatPreviewController = new ChatbotCoreController({
      provider: this.chatPreviewProvider!,
      enableFileUpload,
      ui: {
        onStateChange: () => {
          this.requestUpdate();
        },
      },
    });
  }

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

  // ==================== HTTP Preview ====================

  private async sendHttpPreviewRequest(): Promise<void> {
    const previewNode = this.getPreviewNode();
    if (!previewNode || !this.workflow?.id) return;

    this.httpPreviewLoading = true;
    this.httpPreviewError = '';
    this.httpPreviewResponse = '';
    this.nodeStatuses = {};

    try {
      let body: any;
      try {
        body = JSON.parse(this.httpPreviewBody);
      } catch {
        throw new Error('Invalid JSON in request body');
      }

      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8000';
      const triggerUrl = `${baseUrl}/api/v1/workflows/${this.workflow.id}/trigger/http`;

      console.log('[Canvas] Sending HTTP preview request:', triggerUrl, body);

      const response = await fetch(triggerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const executionIdHeader = response.headers.get('X-Execution-Id');
      let responseData: any;
      try {
        responseData = await response.json();
      } catch {
        responseData = await response.text();
      }

      if (!response.ok) {
        throw new Error(responseData.message || responseData || `HTTP ${response.status}`);
      }

      this.httpPreviewResponse = JSON.stringify({
        status: response.status,
        executionId: executionIdHeader,
        data: responseData,
      }, null, 2);

      if (executionIdHeader) {
        this.currentExecutionId = executionIdHeader;
        this.fetchExecutionData(executionIdHeader);
      }
    } catch (error) {
      console.error('[Canvas] HTTP preview error:', error);
      this.httpPreviewError = error instanceof Error ? error.message : String(error);
    } finally {
      this.httpPreviewLoading = false;
    }
  }

  private resetHttpPreview(): void {
    this.httpPreviewBody = '{\n  \n}';
    this.httpPreviewResponse = '';
    this.httpPreviewError = '';
    this.httpPreviewLoading = false;
  }

  private closePreviewPanel() {
    this.previewNodeId = null;
    this.cleanupChatPreview();
    this.resetHttpPreview();
  }

  // ==================== Workflow Event Handlers ====================

  private handleTestWorkflowRequest = () => {
    if (this.configuredNode) {
      const config = this.configuredNode.configuration || {};
      const testData = config.testFile || config.testDocument || null;

      this.dispatchEvent(new CustomEvent('workflow-trigger', {
        detail: {
          node: this.configuredNode,
          startFromNode: true,
          testData: testData,
          workflow: this.workflow,
        },
        bubbles: true,
        composed: true,
      }));
    }
  };

  private handleNodeTrigger(e: CustomEvent) {
    const { node } = e.detail as { node: WorkflowNode };

    if (isPersistentTriggerNode(node.type)) {
      const status = this.triggerStatuses.get(node.id);
      if (status) {
        const isActive = status.connectionState === TriggerConnectionState.CONNECTED
          || status.connectionState === TriggerConnectionState.CONNECTING;
        if (isActive) {
          this.deactivateTrigger(status.triggerId);
        } else {
          this.activateTrigger(status.triggerId);
        }
      }
      this.dispatchEvent(new CustomEvent('trigger-toggle', {
        detail: { node, triggerStatus: status },
        bubbles: true,
        composed: true,
      }));
      return;
    }

    console.log('[Canvas] Node trigger clicked:', node.name, node.type);
    this.dispatchEvent(new CustomEvent('workflow-trigger', {
      detail: { node },
      bubbles: true,
      composed: true,
    }));
  }

  private async handleNodeDblClick(e: CustomEvent) {
    if (this.disabled) return;
    const { node } = e.detail;

    // For NOTE nodes, enter inline edit mode
    if (node.type === WorkflowNodeType.NOTE) {
      if (this.readonly) return;
      this.editingNoteId = node.id;
      if (this.collaborative) {
        this.collaborationController.broadcastTypingStart(node.id);
      }
      this.updateComplete.then(() => {
        const nodeEl = this.shadowRoot?.querySelector(`workflow-node[data-node-id="${node.id}"]`);
        const textarea = nodeEl?.shadowRoot?.querySelector('.note-textarea') as HTMLTextAreaElement;
        if (textarea) {
          textarea.focus();
          textarea.select();
        }
      });
      return;
    }

    // Open configuration panel
    this.configuredNode = node;

    // Fetch dynamic variables
    this.loadingVariables = true;
    this.dynamicVariables = [];

    if (this.workflow?.id) {
      try {
        const vars = await getAllAvailableVariablesWithDynamic(
          this.workflow,
          node.id,
          '',
        );
        this.dynamicVariables = vars;
      } catch (error) {
        console.warn('[WorkflowCanvas] Failed to fetch dynamic variables:', error);
      }

      const hasNodeStatus = Object.keys(this.nodeStatuses).length > 0;
      const hasExecutionData = this.nodeExecutionData.size > 0;
      if (hasNodeStatus && !hasExecutionData && !this.currentExecutionId) {
        try {
          const response = await fetch(`/api/v1/workflows/${this.workflow.id}/latest-execution`);
          if (response.ok) {
            const execution = await response.json();
            if (execution?.id) {
              this.currentExecutionId = execution.id;
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

  private handleNoteSettings(e: CustomEvent) {
    const { node } = e.detail;
    this.configuredNode = node;
  }

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

  // ==================== Execution Data ====================

  setExecutionId(executionId: string | null): void {
    this.currentExecutionId = executionId;
    if (!executionId) {
      this.nodeExecutionData.clear();
      this.requestUpdate();
    }
  }

  updateNodeExecution(nodeExecution: import('./templates/config-panel/types.js').NodeExecutionData): void {
    this.nodeExecutionData.set(nodeExecution.nodeId, nodeExecution);
    this.requestUpdate();
  }

  clearExecutionData(): void {
    this.currentExecutionId = null;
    this.nodeExecutionData.clear();
    this.requestUpdate();
  }

  private async fetchExecutionData(executionId: string): Promise<void> {
    if (!executionId) return;

    try {
      const response = await fetch(`/api/v1/workflows/${this.workflow?.id}/executions/${executionId}/nodes`);
      if (!response.ok) {
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

  private async handleRetryNode(nodeId: string): Promise<void> {
    if (!this.currentExecutionId || !this.workflow?.id) return;

    try {
      const response = await fetch(`/api/v1/workflows/${this.workflow.id}/executions/${this.currentExecutionId}/nodes/${nodeId}/retry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Retry failed: ${response.statusText}`);
      }

      this.dispatchEvent(new CustomEvent('node-retry', {
        detail: { executionId: this.currentExecutionId, nodeId },
        bubbles: true,
        composed: true,
      }));
    } catch (error) {
      console.error('[WorkflowCanvas] Failed to retry node:', error);
    }
  }

  // ==================== Table Resize ====================

  private tableResizeState: {
    nodeId: string;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  } | null = null;

  private handleTableResizeStart(e: CustomEvent) {
    const { node, event } = e.detail;
    this.startTableResize(node, event);
  }

  private startTableResize(node: WorkflowNode, event: MouseEvent) {
    const config = node.configuration || {};
    this.tableResizeState = {
      nodeId: node.id,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: (config.tableWidth as number) || TABLE_DEFAULT_WIDTH,
      startHeight: (config.tableHeight as number) || TABLE_DEFAULT_HEIGHT,
    };

    document.addEventListener('mousemove', this.handleTableResizeDrag);
    document.addEventListener('mouseup', this.stopTableResize);
  }

  private handleTableResizeDrag = (event: MouseEvent) => {
    if (!this.tableResizeState) return;

    const { nodeId, startX, startY, startWidth, startHeight } = this.tableResizeState;
    const node = this.workflow.nodes.find(n => n.id === nodeId);
    if (!node) return;

    const deltaX = (event.clientX - startX) / this.viewport.zoom;
    const deltaY = (event.clientY - startY) / this.viewport.zoom;

    const newWidth = Math.max(TABLE_MIN_WIDTH, startWidth + deltaX);
    const newHeight = Math.max(TABLE_MIN_HEIGHT, startHeight + deltaY);

    node.configuration = {
      ...node.configuration,
      tableWidth: newWidth,
      tableHeight: newHeight,
    };

    this.requestUpdate();
  };

  private stopTableResize = () => {
    if (!this.tableResizeState) return;

    this.tableResizeState = null;
    document.removeEventListener('mousemove', this.handleTableResizeDrag);
    document.removeEventListener('mouseup', this.stopTableResize);

    this.dispatchWorkflowChanged();
  };

  // ==================== Palette ====================

  private handlePaletteItemDrag(e: DragEvent, type: NodeType) {
    e.dataTransfer?.setData('application/workflow-node-type', type);
  }

  // ===== Touch drag from palette (mobile) =====

  private _touchDragType: NodeType | null = null;
  private _touchDragGhost: HTMLElement | null = null;

  private _cleanupPaletteTouchDrag() {
    document.removeEventListener('touchmove', this._handlePaletteTouchMove);
    document.removeEventListener('touchend', this._handlePaletteTouchEnd);
    document.removeEventListener('touchcancel', this._handlePaletteTouchEnd);
    if (this._touchDragGhost) {
      this._touchDragGhost.remove();
      this._touchDragGhost = null;
    }
    this._touchDragType = null;
  }

  private handlePaletteItemTouchStart(e: TouchEvent, type: NodeType) {
    if (e.touches.length !== 1) return;
    e.preventDefault();

    this._touchDragType = type;

    // Create ghost element
    const touch = e.touches[0];
    const ghost = document.createElement('div');
    const template = NODE_TEMPLATES.find(t => t.type === type);
    ghost.textContent = template?.name || type;
    Object.assign(ghost.style, {
      position: 'fixed',
      left: `${touch.clientX - 40}px`,
      top: `${touch.clientY - 20}px`,
      padding: '8px 16px',
      background: template?.color || '#6366f1',
      color: 'white',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: '500',
      pointerEvents: 'none',
      zIndex: '10000',
      opacity: '0.9',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      whiteSpace: 'nowrap',
    });
    document.body.appendChild(ghost);
    this._touchDragGhost = ghost;

    // Bind move/end on document to track across the whole screen
    document.addEventListener('touchmove', this._handlePaletteTouchMove, { passive: false });
    document.addEventListener('touchend', this._handlePaletteTouchEnd);
    document.addEventListener('touchcancel', this._handlePaletteTouchEnd);
  }

  private _handlePaletteTouchMove = (e: TouchEvent) => {
    if (!this._touchDragGhost) return;
    e.preventDefault();
    const touch = e.touches[0];
    this._touchDragGhost.style.left = `${touch.clientX - 40}px`;
    this._touchDragGhost.style.top = `${touch.clientY - 20}px`;
  };

  private _handlePaletteTouchEnd = (e: TouchEvent) => {
    document.removeEventListener('touchmove', this._handlePaletteTouchMove);
    document.removeEventListener('touchend', this._handlePaletteTouchEnd);
    document.removeEventListener('touchcancel', this._handlePaletteTouchEnd);

    // Clean up ghost
    if (this._touchDragGhost) {
      this._touchDragGhost.remove();
      this._touchDragGhost = null;
    }

    const type = this._touchDragType;
    this._touchDragType = null;
    if (!type || this.disabled) return;

    // Check if touch ended over the canvas
    const touch = e.changedTouches[0];
    if (!touch || !this.canvasWrapper) return;

    const rect = this.canvasWrapper.getBoundingClientRect();
    if (
      touch.clientX >= rect.left && touch.clientX <= rect.right &&
      touch.clientY >= rect.top && touch.clientY <= rect.bottom
    ) {
      const x = (touch.clientX - rect.left - this.viewport.panX) / this.viewport.zoom;
      const y = (touch.clientY - rect.top - this.viewport.panY) / this.viewport.zoom;
      this.addNode(type, { x: Math.round(x / 20) * 20, y: Math.round(y / 20) * 20 });
    }
  };

  private toggleCategory(categoryId: string) {
    if (this.expandedCategories.has(categoryId)) {
      this.expandedCategories.delete(categoryId);
    } else {
      this.expandedCategories.add(categoryId);
    }
    this.expandedCategories = new Set(this.expandedCategories);
  }

  // ==================== Render Helpers ====================

  private getPreviewNode(): WorkflowNode | null {
    if (!this.previewNodeId) return null;
    return this.workflow.nodes.find(n => n.id === this.previewNodeId) || null;
  }

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

  private getAggregatedFrameStatus(containedNodes: WorkflowNode[]): ExecutionStatus {
    if (containedNodes.length === 0) return ExecutionStatus.IDLE;

    let hasRunning = false;
    let hasFailed = false;
    let hasPending = false;
    let hasCompleted = false;

    for (const node of containedNodes) {
      const status = node.status || ExecutionStatus.IDLE;
      switch (status) {
        case ExecutionStatus.RUNNING:
          hasRunning = true;
          break;
        case ExecutionStatus.FAILED:
          hasFailed = true;
          break;
        case ExecutionStatus.PENDING:
        case ExecutionStatus.WAITING:
          hasPending = true;
          break;
        case ExecutionStatus.COMPLETED:
          hasCompleted = true;
          break;
      }
    }

    if (hasRunning) return ExecutionStatus.RUNNING;
    if (hasFailed) return ExecutionStatus.FAILED;
    if (hasPending) return ExecutionStatus.PENDING;
    if (hasCompleted) return ExecutionStatus.COMPLETED;
    return ExecutionStatus.IDLE;
  }

  private renderCollapsedFrame(frame: WorkflowNode) {
    const config = frame.configuration || {};
    const collapsed = config.frameCollapsed as boolean;
    if (!collapsed) return null;

    const label = (config.frameLabel as string) || FRAME_DEFAULT_LABEL;
    const borderColor = (config.frameBorderColor as string) || 'rgba(99, 102, 241, 0.3)';
    const isSelected = this.selectedNodeIds.has(frame.id);
    const containedNodes = this.frameController.getContainedNodes(frame);
    const previews = this.frameController.getContainedNodePreviews(frame, 5);
    const overflowCount = containedNodes.length - 5;
    const aggregatedPorts = this.frameController.getAggregatedPorts(frame);
    const aggregatedStatus = this.getAggregatedFrameStatus(containedNodes);

    const nodeStyles = {
      left: `${frame.position.x}px`,
      top: `${frame.position.y}px`,
      '--node-color': borderColor.replace('0.3)', '1)').replace('rgba', 'rgb').split(',').slice(0, 3).join(',') + ')',
    };

    const tooltipContent = containedNodes.length === 0
      ? 'Empty group'
      : `Contains:\n${containedNodes.map(n => `• ${n.name}`).join('\n')}\n\nDouble-click to expand`;

    const statusClass = aggregatedStatus !== ExecutionStatus.IDLE
      ? `status-${aggregatedStatus.toLowerCase()}`
      : '';

    return html`
      <div
        class="collapsed-frame-node ${isSelected ? 'selected' : ''} ${statusClass}"
        style=${styleMap(nodeStyles)}
        data-frame-id=${frame.id}
        data-status=${aggregatedStatus}
        title=${tooltipContent}
        @mousedown=${(e: MouseEvent) => this.handleFrameMouseDown(e, frame)}
        @dblclick=${(e: MouseEvent) => this.handleFrameDblClick(e, frame)}
      >
        ${this.renderFrameStatusIndicator(aggregatedStatus)}
        ${this.renderCollapsedFramePorts(aggregatedPorts.inputs, 'left')}
        ${this.renderCollapsedFrameBody(frame, label, previews, overflowCount)}
        ${this.renderCollapsedFramePorts(aggregatedPorts.outputs, 'right')}
      </div>
    `;
  }

  private renderFrameStatusIndicator(status: ExecutionStatus) {
    if (status === ExecutionStatus.IDLE) return null;

    const iconMap: Record<string, string> = {
      [ExecutionStatus.RUNNING]: 'loader',
      [ExecutionStatus.FAILED]: 'alert-circle',
      [ExecutionStatus.COMPLETED]: 'check-circle',
      [ExecutionStatus.PENDING]: 'clock',
    };

    const iconName = iconMap[status];
    if (!iconName) return null;

    return html`
      <div class="frame-status-indicator status-${status.toLowerCase()}">
        <nr-icon name=${iconName} size="small" class=${status === ExecutionStatus.RUNNING ? 'spinning' : ''}></nr-icon>
      </div>
    `;
  }

  private renderCollapsedFramePorts(ports: Array<{ id: string; label?: string }>, side: string) {
    if (ports.length === 0) return null;

    return html`
      <div class="ports ports-${side}">
        ${ports.map(port => html`
          <div
            class="port port-${side === 'left' ? 'input' : 'output'}"
            data-port-id=${port.id}
            title=${port.label || (side === 'left' ? 'Input' : 'Output')}
          ></div>
        `)}
      </div>
    `;
  }

  private renderCollapsedFrameBody(frame: WorkflowNode, label: string, previews: Array<{ name: string; icon: string; color: string }>, overflowCount: number) {
    return html`
      <div class="collapsed-frame-body">
        <div class="collapsed-frame-header">
          <nr-icon name="layers" size="small"></nr-icon>
          ${this.editingFrameLabelId === frame.id ? html`
            <input
              type="text"
              class="collapsed-frame-title-input"
              .value=${label}
              @blur=${(e: FocusEvent) => this.handleFrameLabelBlur(e, frame)}
              @keydown=${(e: KeyboardEvent) => this.handleFrameLabelKeydown(e, frame)}
              @click=${(e: MouseEvent) => e.stopPropagation()}
              @mousedown=${(e: MouseEvent) => e.stopPropagation()}
              @dblclick=${(e: MouseEvent) => e.stopPropagation()}
            />
          ` : html`
            <span class="collapsed-frame-title">
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

        ${previews.length > 0 ? html`
          <div class="node-icons-preview">
            ${previews.map(preview => html`
              <div
                class="preview-icon"
                style="background-color: ${preview.color}20"
                title=${preview.name}
              >
                <nr-icon
                  name=${preview.icon}
                  size="small"
                  style="color: ${preview.color}"
                ></nr-icon>
              </div>
            `)}
            ${overflowCount > 0 ? html`
              <span class="overflow-count">+${overflowCount}</span>
            ` : null}
          </div>
        ` : html`
          <div class="node-icons-preview empty">
            <span class="empty-text">Empty</span>
          </div>
        `}
      </div>
    `;
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
      onNodeTouchStart: (e, type) => this.handlePaletteItemTouchStart(e, type),
      onNodeDoubleClick: (type) => this.addNode(type),
      onSearchChange: (term) => { this.paletteSearchTerm = term; },
    });
  }

  protected override renderConfigPanel() {
    const nodeId = this.configuredNode?.id;
    const nodeExecution = nodeId ? this.nodeExecutionData.get(nodeId) : undefined;

    // Build trigger info/actions for persistent trigger nodes
    let triggerInfo: import('./templates/config-panel/types.js').TriggerInfo | undefined;
    let triggerActions: import('./templates/config-panel/types.js').TriggerActions | undefined;

    if (nodeId && this.configuredNode && isPersistentTriggerNode(this.configuredNode.type)) {
      const ts = this.triggerStatuses.get(nodeId);
      triggerInfo = {
        triggerId: ts?.triggerId,
        status: ts?.connectionState,
        health: ts?.health,
        messagesReceived: ts?.messagesReceived,
        lastMessageAt: ts?.lastMessageAt,
        stateReason: ts?.stateReason,
        webhookUrl: ts?.webhookUrl,
        inDevMode: ts?.inDevMode,
      };
      triggerActions = {
        onActivate: (triggerId) => this.activateTrigger(triggerId),
        onDeactivate: (triggerId) => this.deactivateTrigger(triggerId),
        onCreateAndActivate: (nodeType, config) => this.createAndActivateTrigger(nodeType, config),
        onToggleDevMode: (triggerId, enable) => this.toggleDevMode(triggerId, enable),
      };
    }

    return renderConfigPanelTemplate({
      node: this.configuredNode,
      position: this.configController.getPanelPosition(),
      callbacks: {
        onClose: () => this.configController.closeConfig(),
        onUpdateName: (name) => this.configController.updateName(name),
        onUpdateDescription: (desc) => this.configController.updateDescription(desc),
        onUpdateConfig: (key, value) => {
          this.configController.updateConfig(key, value);
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
      kvEntries: this.kvEntries,
      onCreateKvEntry: this.onCreateKvEntry,
      applicationId: this.applicationId,
      databaseProvider: this.databaseProvider,
      triggerInfo,
      triggerActions,
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

  private renderHttpPreviewPanel(previewNode: WorkflowNode, panelStyle: Record<string, string>) {
    const config = previewNode.configuration || {};
    const httpPath = (config.httpPath as string) || '/webhook';

    return html`
      <div class="chatbot-preview-panel http-preview-panel" style=${styleMap(panelStyle)} data-theme=${this.currentTheme}>
        <div class="chatbot-preview-header">
          <div class="chatbot-preview-title">
            <nr-icon name="globe" size="small"></nr-icon>
            <span>HTTP Test</span>
          </div>
          <button class="chatbot-preview-close" @click=${() => this.closePreviewPanel()}>
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
              @click=${() => this.sendHttpPreviewRequest()}
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

  private renderChatPreviewPanel(previewNode: WorkflowNode, panelStyle: Record<string, string>) {
    const config = previewNode.configuration || {};
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
          <button class="chatbot-preview-close" @click=${() => this.closePreviewPanel()}>
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

  private renderPreviewPanel() {
    const previewNode = this.getPreviewNode();
    const position = this.getPreviewPanelPosition();
    if (!previewNode || !position) return html``;

    const panelStyle = {
      left: `${position.x}px`,
      top: `${position.y}px`,
    };

    if (previewNode.type === WorkflowNodeType.HTTP_START) {
      return this.renderHttpPreviewPanel(previewNode, panelStyle);
    }

    return this.renderChatPreviewPanel(previewNode, panelStyle);
  }

  // ==================== Constructor Override ====================

  constructor() {
    super();
    this.expandedCategories = new Set([
      'trigger', 'control', 'action', 'data', 'agent',
      'db-tables-views', 'db-relations-constraints', 'db-indexes-queries',
    ]);
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
                ? this.renderCollapsedFrame(frame)
                : this.renderExpandedFrame(frame);
            })}
          </div>

          <!-- Nodes layer -->
          <div class="nodes-layer">
            ${this.getVisibleNonFrameNodes().map(node => {
              const enrichedNode = this.triggerStatuses.has(node.id)
                ? { ...node, triggerStatus: this.triggerStatuses.get(node.id) }
                : node;
              return html`
              <workflow-node
                data-node-id=${node.id}
                .node=${enrichedNode}
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
                @node-mousedown=${this.handleNodeMouseDown}
                @node-dblclick=${this.handleNodeDblClick}
                @node-preview=${this.handleNodePreview}
                @node-trigger=${this.handleNodeTrigger}
                @port-mousedown=${this.handlePortMouseDown}
                @port-mouseup=${this.handlePortMouseUp}
                @note-content-change=${this.handleNoteContentChange}
                @note-edit-end=${this.handleNoteEditEnd}
                @note-resize-start=${this.handleNoteResizeStart}
                @table-resize-start=${this.handleTableResizeStart}
                @note-settings=${this.handleNoteSettings}
              ></workflow-node>
            `; })}
          </div>
        </div>

        ${this.renderRemoteCursors()}
        ${this.renderMarqueeBox()}
        ${this.renderEmptyState()}
        ${this.renderDisabledOverlay()}
        ${this.renderPresenceBar()}
        ${this.renderToolbar()}
        ${this.renderPalette()}
        ${this.renderConfigPanel()}
        ${this.renderPreviewPanel()}
        ${this.renderZoomControls()}
        ${this.renderContextMenu()}
      </div>
      ${this.renderChatbotPanel()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'workflow-canvas': WorkflowCanvasElement;
  }
}
