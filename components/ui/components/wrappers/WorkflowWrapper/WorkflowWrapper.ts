import { html, LitElement, nothing, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import styles from "./WorkflowWrapper.style.ts";
import {
  $workflows,
  $currentWorkflow,
  $workflowExecution,
  executeWorkflow,
  getWorkflows,
  type WorkflowExecutionState
} from "../../../../../redux/store/workflow.ts";
import type { Workflow, CanvasViewport } from "@nuralyui/canvas";
import { workflowService } from "../../../../../../../services/workflow.service.ts";
import { updateComponentAttributes } from "../../../../../redux/actions/component/updateComponentAttributes.ts";
import { createSocketFunctions } from "../../../../../handlers/runtime-api/socket.ts";
import "@nuralyui/canvas";

export type WorkflowStatus = 'idle' | 'running' | 'completed' | 'failed';
export type TriggerType = 'manual' | 'on_event' | 'on_load' | 'on_submit';

@customElement("workflow-wrapper")
export class WorkflowWrapper extends LitElement {
  static styles = styles;

  @property({ type: String })
  workflowId: string = "";

  @property({ type: String })
  triggerType: TriggerType = "manual";

  @property({ type: Boolean })
  autoExecute: boolean = false;

  @property({ type: String })
  inputMapping: string = "{}";

  @property({ type: String })
  outputVariable: string = "";

  @property({ type: Boolean })
  showStatus: boolean = true;

  @property({ type: Number })
  timeout: number = 30000;

  @property({ type: Object })
  viewport: CanvasViewport = { panX: 0, panY: 0, zoom: 1 };

  @property({ type: String })
  componentId: string = "";

  @property({ type: String })
  applicationId: string = "";

  @property({ type: Boolean })
  readonly: boolean = false;

  @property({ type: String })
  executionId: string = "";

  @state()
  private status: WorkflowStatus = 'idle';

  @state()
  private workflows: Workflow[] = [];

  @state()
  private currentWorkflow: Workflow | null = null;

  @state()
  private selectedWorkflowData: Workflow | null = null;

  @state()
  private loadingWorkflow: boolean = false;

  @state()
  private executionResult: any = null;

  @state()
  private error: string | null = null;

  @state()
  private canvasDisabled: boolean = true;

  @state()
  private nodeStatuses: Record<string, 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'> = {};

  private unsubscribeWorkflows: (() => void) | null = null;
  private unsubscribeCurrentWorkflow: (() => void) | null = null;
  private unsubscribeExecution: (() => void) | null = null;
  private executionTimeout: ReturnType<typeof setTimeout> | null = null;
  private viewportSaveTimeout: ReturnType<typeof setTimeout> | null = null;
  private hasExecutedOnLoad: boolean = false;
  private initialViewportApplied: boolean = false;
  private workflowSocket: any = null;
  private subscribedWorkflowId: string | null = null;
  private subscribedExecutionId: string | null = null;

  connectedCallback() {
    super.connectedCallback();
    this.subscribeToStores();
    this.loadWorkflows();
    // Load selected workflow data if workflowId is already set
    if (this.workflowId) {
      this.loadSelectedWorkflow();
    }
    // Only initialize socket and subscribe if we have an executionId
    // Don't subscribe to all workflow executions - only specific ones
    if (this.executionId) {
      this.initializeSocket();
      this.subscribeToExecutionEvents(this.executionId);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribeFromStores();
    this.clearTimeout();
    this.cleanupSocket();
    if (this.viewportSaveTimeout) {
      clearTimeout(this.viewportSaveTimeout);
      this.viewportSaveTimeout = null;
    }
  }

  private initializeSocket(): void {
    if (this.workflowSocket) return;

    const { $socket } = createSocketFunctions();
    this.workflowSocket = $socket.create();

    this.workflowSocket
      .on('execution:started', (data: any) => {
        const eventExecutionId = data.executionId || data.data?.executionId;
        // Filter by executionId if one is set
        if (this.executionId && eventExecutionId !== this.executionId) return;

        this.nodeStatuses = {};
        if (this.selectedWorkflowData?.nodes) {
          this.selectedWorkflowData.nodes.forEach((node: any) => {
            this.nodeStatuses[node.id] = 'PENDING';
          });
          this.nodeStatuses = { ...this.nodeStatuses };
        }
      })
      .on('execution:node-started', (data: any) => {
        const eventExecutionId = data.executionId || data.data?.executionId;
        // Filter by executionId if one is set
        if (this.executionId && eventExecutionId !== this.executionId) return;

        const nodeId = data.data?.nodeId || data.nodeId;
        if (nodeId) {
          this.nodeStatuses = { ...this.nodeStatuses, [nodeId]: 'RUNNING' };
        }
      })
      .on('execution:node-completed', (data: any) => {
        const eventExecutionId = data.executionId || data.data?.executionId;
        // Filter by executionId if one is set
        if (this.executionId && eventExecutionId !== this.executionId) return;

        const nodeId = data.data?.nodeId || data.nodeId;
        const status = data.data?.status || data.status || 'COMPLETED';
        if (nodeId) {
          this.nodeStatuses = {
            ...this.nodeStatuses,
            [nodeId]: status === 'FAILED' ? 'FAILED' : 'COMPLETED'
          };
        }
      })
      .on('execution:node-failed', (data: any) => {
        const eventExecutionId = data.executionId || data.data?.executionId;
        // Filter by executionId if one is set
        if (this.executionId && eventExecutionId !== this.executionId) return;

        const nodeId = data.data?.nodeId || data.nodeId;
        if (nodeId) {
          this.nodeStatuses = { ...this.nodeStatuses, [nodeId]: 'FAILED' };
        }
      })
      .on('execution:completed', (data: any) => {
        const eventExecutionId = data.executionId || data.data?.executionId;
        // Filter by executionId if one is set
        if (this.executionId && eventExecutionId !== this.executionId) return;
        // Execution finished
      })
      .on('execution:failed', (data: any) => {
        const eventExecutionId = data.executionId || data.data?.executionId;
        // Filter by executionId if one is set
        if (this.executionId && eventExecutionId !== this.executionId) return;
        // Execution failed
      });

    const url = window.location.origin;
    const path = '/socket.io/workflow';
    this.workflowSocket.connect(url, path);
  }

  private subscribeToWorkflowEvents(workflowId: string): void {
    if (!this.workflowSocket || this.subscribedWorkflowId === workflowId) return;

    this.workflowSocket.subscribeWorkflow(workflowId);
    this.subscribedWorkflowId = workflowId;
    console.log('[WorkflowWrapper] Subscribed to workflow:', workflowId);
  }

  private unsubscribeFromWorkflow(): void {
    if (!this.workflowSocket || !this.subscribedWorkflowId) return;

    this.workflowSocket.unsubscribeWorkflow();
    console.log('[WorkflowWrapper] Unsubscribed from workflow:', this.subscribedWorkflowId);
    this.subscribedWorkflowId = null;
  }

  private subscribeToExecutionEvents(executionId: string): void {
    if (!this.workflowSocket || this.subscribedExecutionId === executionId) return;

    // Use the socket helper's subscribe method for execution-specific events
    this.workflowSocket.subscribe(executionId);
    this.subscribedExecutionId = executionId;
    console.log('[WorkflowWrapper] Subscribed to execution:', executionId);

    // Reset node statuses for new execution
    this.nodeStatuses = {};
    if (this.selectedWorkflowData?.nodes) {
      this.selectedWorkflowData.nodes.forEach((node: any) => {
        this.nodeStatuses[node.id] = 'PENDING';
      });
      this.nodeStatuses = { ...this.nodeStatuses };
    }
  }

  private cleanupSocket(): void {
    if (this.workflowSocket) {
      this.workflowSocket.cleanup();
      this.workflowSocket = null;
      this.subscribedWorkflowId = null;
      this.subscribedExecutionId = null;
    }
  }

  private subscribeToStores() {
    this.unsubscribeWorkflows = $workflows.subscribe((workflows) => {
      this.workflows = workflows;
    });

    this.unsubscribeCurrentWorkflow = $currentWorkflow.subscribe((workflow) => {
      this.currentWorkflow = workflow;
    });

    this.unsubscribeExecution = $workflowExecution.subscribe((state: WorkflowExecutionState) => {
      if (state.isExecuting) {
        this.status = 'running';
      } else if (state.currentExecution) {
        this.status = state.currentExecution.status === 'completed' ? 'completed' : 'failed';
        this.executionResult = state.currentExecution.output;
        this.storeOutputVariable(state.currentExecution.output);
        this.dispatchWorkflowEvent('complete', state.currentExecution);
      }
    });
  }

  private unsubscribeFromStores() {
    this.unsubscribeWorkflows?.();
    this.unsubscribeCurrentWorkflow?.();
    this.unsubscribeExecution?.();
  }

  private clearTimeout() {
    if (this.executionTimeout) {
      clearTimeout(this.executionTimeout);
      this.executionTimeout = null;
    }
  }

  private async loadWorkflows() {
    try {
      const instance = (globalThis as any).__NURALY_EXECUTE_INSTANCE__;
      const appId = instance?.appId || instance?.VarsProxy?.app_id;
      if (appId) {
        await getWorkflows(appId);
      }
    } catch (error) {
      console.error('Failed to load workflows:', error);
    }
  }

  protected updated(_changedProperties: PropertyValues): void {
    super.updated(_changedProperties);

    // Handle on_load trigger
    if (_changedProperties.has('triggerType') || _changedProperties.has('autoExecute')) {
      if (this.triggerType === 'on_load' && this.autoExecute && !this.hasExecutedOnLoad) {
        this.hasExecutedOnLoad = true;
        this.execute();
      }
    }

    // Load workflow data when workflowId changes
    if (_changedProperties.has('workflowId') && this.workflowId) {
      // Reset viewport flag when workflow changes so new workflow gets its initial viewport
      this.initialViewportApplied = false;
      // Reset disabled state so user needs to double-click to enter preview mode
      this.canvasDisabled = true;
      // Reset node statuses for new workflow
      this.nodeStatuses = {};
      this.loadSelectedWorkflow();
    }

    // Subscribe to specific execution when executionId changes
    // Only connect when we have an executionId - don't subscribe to all executions
    if (_changedProperties.has('executionId') && this.executionId) {
      this.initializeSocket();
      this.subscribeToExecutionEvents(this.executionId);
    }
  }

  private async loadSelectedWorkflow() {
    if (!this.workflowId) {
      this.selectedWorkflowData = null;
      return;
    }

    console.log('[WorkflowWrapper] Loading workflow:', this.workflowId);
    this.loadingWorkflow = true;
    try {
      const workflow = await workflowService.getWorkflow(this.workflowId);
      console.log('[WorkflowWrapper] Workflow loaded:', workflow);
      this.selectedWorkflowData = workflow;
    } catch (error) {
      console.error('[WorkflowWrapper] Failed to load workflow:', error);
      this.selectedWorkflowData = null;
    } finally {
      this.loadingWorkflow = false;
    }
  }

  private parseInputMapping(): Record<string, unknown> {
    try {
      return JSON.parse(this.inputMapping);
    } catch {
      return {};
    }
  }

  private storeOutputVariable(output: any) {
    if (this.outputVariable && output !== undefined) {
      const instance = (globalThis as any).__NURALY_EXECUTE_INSTANCE__;
      if (instance?.VarsProxy) {
        instance.VarsProxy[this.outputVariable] = output;
      }
    }
  }

  private dispatchWorkflowEvent(type: 'start' | 'complete' | 'error' | 'progress', detail?: any) {
    const eventMap = {
      start: 'onWorkflowStart',
      complete: 'onWorkflowComplete',
      error: 'onWorkflowError',
      progress: 'onWorkflowProgress'
    };

    const customEvent = new CustomEvent(eventMap[type], {
      bubbles: true,
      composed: true,
      detail: {
        workflowId: this.workflowId,
        status: this.status,
        result: this.executionResult,
        error: this.error,
        ...detail
      }
    });
    this.dispatchEvent(customEvent);
  }

  async execute() {
    if (!this.workflowId) {
      this.error = 'No workflow selected';
      this.dispatchWorkflowEvent('error');
      return;
    }

    this.status = 'running';
    this.error = null;
    this.executionResult = null;
    this.dispatchWorkflowEvent('start');

    // Set up timeout
    this.clearTimeout();
    this.executionTimeout = setTimeout(() => {
      if (this.status === 'running') {
        this.status = 'failed';
        this.error = 'Workflow execution timed out';
        this.dispatchWorkflowEvent('error');
      }
    }, this.timeout);

    try {
      const input = this.parseInputMapping();
      const result = await executeWorkflow(input, this.workflowId);

      this.clearTimeout();

      if (result) {
        this.executionResult = result.output;
        this.status = result.status === 'completed' ? 'completed' : 'failed';
        this.storeOutputVariable(result.output);
        this.dispatchWorkflowEvent('complete', result);
      } else {
        this.status = 'failed';
        this.error = 'Workflow execution failed';
        this.dispatchWorkflowEvent('error');
      }
    } catch (err) {
      this.clearTimeout();
      this.status = 'failed';
      this.error = err instanceof Error ? err.message : 'Unknown error';
      this.dispatchWorkflowEvent('error');
    }
  }

  // Public method for manual trigger from parent
  public triggerExecution() {
    if (this.triggerType === 'manual') {
      this.execute();
    }
  }

  // Public method for event trigger
  public triggerOnEvent(eventData?: any) {
    if (this.triggerType === 'on_event') {
      // Merge event data with input mapping
      const input = { ...this.parseInputMapping(), eventData };
      this.inputMapping = JSON.stringify(input);
      this.execute();
    }
  }

  // Public method for submit trigger
  public triggerOnSubmit(formData?: any) {
    if (this.triggerType === 'on_submit') {
      const input = { ...this.parseInputMapping(), formData };
      this.inputMapping = JSON.stringify(input);
      this.execute();
    }
  }

  private getStatusIcon() {
    switch (this.status) {
      case 'idle':
        return html`<span class="status-icon idle"></span>`;
      case 'running':
        return html`<span class="status-icon running"></span>`;
      case 'completed':
        return html`<span class="status-icon success"></span>`;
      case 'failed':
        return html`<span class="status-icon error"></span>`;
    }
  }

  private getStatusText() {
    switch (this.status) {
      case 'idle':
        return 'Ready';
      case 'running':
        return 'Running...';
      case 'completed':
        return 'Completed';
      case 'failed':
        return this.error || 'Failed';
    }
  }

  private getSelectedWorkflow(): Workflow | undefined {
    return this.workflows.find(w => w.id === this.workflowId);
  }

  private handleViewportChanged = (event: CustomEvent<{ viewport: CanvasViewport }>) => {
    const { viewport } = event.detail;

    // Only save if we have component and application IDs
    if (!this.componentId || !this.applicationId) {
      return;
    }

    // Debounce to avoid excessive saves
    if (this.viewportSaveTimeout) {
      clearTimeout(this.viewportSaveTimeout);
    }

    this.viewportSaveTimeout = setTimeout(() => {
      updateComponentAttributes(
        this.applicationId,
        this.componentId,
        'input',
        { viewport: { type: 'static', value: viewport } },  // Use standard input format
        true // save to DB
      );
    }, 500);
  };

  private handleCanvasEnabled = () => {
    this.canvasDisabled = false;
  };

  render() {
    console.log('[WorkflowWrapper] Render - workflowId:', this.workflowId, 'loading:', this.loadingWorkflow, 'data:', !!this.selectedWorkflowData);

    // Show placeholder when no workflow is selected
    if (!this.workflowId) {
      return html`
        <div class="workflow-wrapper placeholder">
          <div class="placeholder-content">
            <span class="placeholder-icon">⚡</span>
            <span class="placeholder-text">Select a workflow</span>
          </div>
        </div>
      `;
    }

    // Show loading state
    if (this.loadingWorkflow) {
      return html`
        <div class="workflow-wrapper loading">
          <div class="canvas-loading">
            <span class="loading-spinner"></span>
          </div>
        </div>
      `;
    }

    // Show error if workflow failed to load
    if (!this.selectedWorkflowData) {
      return html`
        <div class="workflow-wrapper error">
          <div class="canvas-error">
            <span>Failed to load workflow</span>
          </div>
        </div>
      `;
    }

    // Show the workflow canvas
    // Only pass viewport on initial load to prevent race conditions when saving
    const workflowWithViewport = this.initialViewportApplied
      ? this.selectedWorkflowData
      : { ...this.selectedWorkflowData, viewport: this.viewport };

    // Mark initial viewport as applied after first render with data
    if (!this.initialViewportApplied) {
      this.initialViewportApplied = true;
    }

    return html`
      <div class="workflow-wrapper">
        <workflow-canvas
          .workflow=${workflowWithViewport}
          .nodeStatuses=${this.nodeStatuses}
          ?readonly=${this.readonly}
          ?disabled=${this.canvasDisabled}
          ?showToolbar=${false}
          ?showPalette=${false}
          ?showMinimap=${false}
          @viewport-changed=${this.handleViewportChanged}
          @canvas-enabled=${this.handleCanvasEnabled}
        ></workflow-canvas>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "workflow-wrapper": WorkflowWrapper;
  }
}
