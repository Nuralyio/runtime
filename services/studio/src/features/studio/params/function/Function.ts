import { customElement, property, query, state } from "lit/decorators.js";
import { css, html, LitElement } from "lit";
import { LogPanel } from '../../panels/log-panel/LogPanel';
import { updateFunctionHandler } from '../../../../features/runtime/redux/handlers/functions/update-function-handler';
import { invokeFunctionHandler } from '../../../../features/runtime/redux/handlers/functions/invoke-function-handler';
import { deployFunctionHandler } from '../../../../features/runtime/redux/handlers/functions/deploy-function-handler';
import { ExecuteInstance } from '../../../runtime/state/runtime-context';
import {
  $functionEditorState,
  setCurrentFunction,
  setDeployStatus,
  setInvokeStatus,
  setLastResult,
  type ActionStatus,
} from '../../../runtime/redux/store/function-editor';

/**
 * Debounce utility function
 */
function debounce<F extends (...args: any[]) => void>(func: F, wait: number): F {
  let timeout: number | undefined;
  return function(this: any, ...args: any[]) {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => func.apply(this, args), wait);
  } as F;
}

@customElement("function-page")
export class FunctionContent extends LitElement {
  @property({ type: Object })
  detail: { handler: string; uuid?: string; name?: string } = { handler: "" };

  @query("log-panel")
  private logPanel!: LogPanel;

  @state()
  private deployStatus: ActionStatus = 'idle';

  @state()
  private invokeStatus: ActionStatus = 'idle';

  @state()
  private autoDeploy: boolean = true;

  private readonly debounceDelay = 1500;
  private debouncedHandleCodeChange = debounce(this.handleCodeChange.bind(this), this.debounceDelay);
  private unsubscribe?: () => void;

  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      position: relative;
    }

    .function-container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: var(--n-color-surface-secondary, #f9fafb);
    }

    /* Toolbar Styles */
    .function-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 16px;
      background: var(--n-color-surface, #fff);
      border-bottom: 1px solid var(--n-color-border, #e5e7eb);
      gap: 12px;
      flex-shrink: 0;
    }

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .toolbar-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .toolbar-button {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      border: 1px solid var(--n-color-border, #e5e7eb);
      background: var(--n-color-surface, #fff);
      color: var(--n-color-text, #111827);
      transition: all 0.15s ease;
    }

    .toolbar-button:hover:not(:disabled) {
      background: var(--n-color-surface-hover, #f9fafb);
    }

    .toolbar-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .toolbar-button.primary {
      background: var(--n-color-primary, #3b82f6);
      color: #fff;
      border-color: var(--n-color-primary, #3b82f6);
    }

    .toolbar-button.primary:hover:not(:disabled) {
      background: var(--n-color-primary-hover, #2563eb);
      border-color: var(--n-color-primary-hover, #2563eb);
    }

    .toolbar-button.success {
      background: var(--n-color-success, #10b981);
      color: #fff;
      border-color: var(--n-color-success, #10b981);
    }

    .toolbar-button svg {
      width: 14px;
      height: 14px;
    }

    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--n-color-text-muted, #9ca3af);
    }

    .status-indicator.running {
      background: var(--n-color-warning, #f59e0b);
      animation: pulse 1.5s infinite;
    }

    .status-indicator.success {
      background: var(--n-color-success, #10b981);
    }

    .status-indicator.error {
      background: var(--n-color-error, #ef4444);
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    /* Main Content Area */
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      min-height: 0;
    }

    /* Code Editor Panel */
    .editor-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      min-height: 0;
      background: var(--n-color-surface, #fff);
    }

    .editor-panel code-editor {
      flex: 1;
      min-height: 0;
    }

    /* Log Panel */
    .log-panel-container {
      border-top: 1px solid var(--n-color-border, #e5e7eb);
      background: var(--n-color-surface, #fff);
      flex-shrink: 0;
    }

    log-panel {
      max-height: 180px;
    }

    /* Divider */
    .toolbar-divider {
      width: 1px;
      height: 20px;
      background: var(--n-color-border, #e5e7eb);
    }

    /* Auto-deploy indicator */
    .auto-deploy-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
      background: var(--n-color-success-bg, #d1fae5);
      color: var(--n-color-success, #10b981);
    }

    .auto-deploy-badge.disabled {
      background: var(--n-color-surface-secondary, #f3f4f6);
      color: var(--n-color-text-muted, #6b7280);
    }

    .auto-deploy-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }
  `;

  override connectedCallback() {
    super.connectedCallback();

    // Subscribe to function editor state
    this.unsubscribe = $functionEditorState.subscribe((state) => {
      this.deployStatus = state.deployStatus;
      this.invokeStatus = state.invokeStatus;
      this.autoDeploy = state.autoDeploy;
    });
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribe?.();
  }

  override updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);

    // Update the function editor state when detail changes
    if (changedProperties.has('detail') && this.detail?.uuid) {
      const functionName = this.detail.name || this.getFunctionName() || '';
      setCurrentFunction(this.detail.uuid, functionName);
    }
  }

  private getFunctionName(): string {
    const uuid = this.detail?.uuid;
    if (!uuid) return '';

    const currentFunction = ExecuteInstance.Vars.studio_functions?.find(
      (item: any) => item.id === uuid
    );
    return currentFunction?.name || '';
  }

  /**
   * Handle deploy action
   */
  private async handleDeploy() {
    setDeployStatus('running');
    this.logPanel.addLogEntry(`Deploy action triggered.`);

    const uuid = this.detail?.uuid;
    if (!uuid) {
      this.logPanel.addLogEntry("Unable to deploy: function UUID is missing.");
      setDeployStatus('error');
      return;
    }

    try {
      this.logPanel.addLogEntry("Deploying function ...");
      await deployFunctionHandler(uuid);
      this.logPanel.addLogEntry("Function deployed successfully!");
      setDeployStatus('success');
      setTimeout(() => setDeployStatus('idle'), 3000);
    } catch (error: any) {
      this.logPanel.addLogEntry(`Deploy failed: ${error.message || error}`);
      setDeployStatus('error');
      setTimeout(() => setDeployStatus('idle'), 3000);
    }
  }

  /**
   * Handle code changes (debounced) with auto-deploy
   */
  private async handleCodeChange(value: string) {
    const uuid = this.detail?.uuid;
    if (!uuid) {
      this.logPanel.addLogEntry("Unable to save: function UUID is missing.");
      return;
    }

    const currentFunction = ExecuteInstance.Vars.studio_functions?.find(
      (item: any) => item.id === uuid
    );

    if (!currentFunction) {
      this.logPanel.addLogEntry("Error: Function not found.");
      return;
    }

    currentFunction.handler = value;
    this.logPanel.addLogEntry("Saving function ...");

    try {
      const result = await updateFunctionHandler(currentFunction);
      if (result.ok) {
        this.logPanel.addLogEntry("Saved successfully.");

        // Auto-deploy if enabled
        if (this.autoDeploy) {
          this.logPanel.addLogEntry("Auto-deploying ...");
          setDeployStatus('running');

          try {
            await deployFunctionHandler(uuid);
            this.logPanel.addLogEntry("Deploy complete.");
            setDeployStatus('success');
            setTimeout(() => setDeployStatus('idle'), 2000);
          } catch (deployError: any) {
            this.logPanel.addLogEntry(`Auto-deploy failed: ${deployError.message || deployError}`);
            setDeployStatus('error');
            setTimeout(() => setDeployStatus('idle'), 3000);
          }
        }
      } else {
        this.logPanel.addLogEntry("Error saving function");
      }
    } catch (error: any) {
      console.error("Error saving function:", error);
      this.logPanel.addLogEntry(`Error saving function: ${error.message || error}`);
    }
  }

  /**
   * Handle invoke from toolbar
   */
  private handleInvoke() {
    const uuid = this.detail?.uuid;
    if (!uuid) {
      this.logPanel.addLogEntry("Unable to invoke: function UUID is missing.");
      return;
    }

    const state = $functionEditorState.get();
    setInvokeStatus('running');
    setLastResult('');
    this.logPanel.addLogEntry("Invoking function ...");

    invokeFunctionHandler(uuid, state.payload)
      .then(async (result) => {
        const text = await result.text();
        setLastResult(text);
        setInvokeStatus('success');
        this.logPanel.addLogEntry(`Invocation complete.`);
        setTimeout(() => setInvokeStatus('idle'), 3000);
      })
      .catch((err) => {
        setLastResult(`Error: ${err.message || err}`);
        setInvokeStatus('error');
        this.logPanel.addLogEntry(`Error: ${err.message || err}`);
        setTimeout(() => setInvokeStatus('idle'), 3000);
      });
  }

  private renderStatusIndicator(status: ActionStatus) {
    if (status === 'idle') return null;
    return html`<span class="status-indicator ${status}"></span>`;
  }

  override render() {
    return html`
      <div class="function-container">
        <!-- Toolbar -->
        <div class="function-toolbar">
          <div class="toolbar-left">
            <button
              class="toolbar-button ${this.deployStatus === 'success' ? 'success' : ''}"
              @click=${() => this.handleDeploy()}
              ?disabled=${this.deployStatus === 'running'}
            >
              ${this.renderStatusIndicator(this.deployStatus)}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Deploy
            </button>

            <span class="toolbar-divider"></span>

            <button
              class="toolbar-button primary"
              @click=${this.handleInvoke}
              ?disabled=${this.invokeStatus === 'running'}
            >
              ${this.renderStatusIndicator(this.invokeStatus)}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Run
            </button>
          </div>

          <div class="toolbar-right">
            <span class="auto-deploy-badge ${this.autoDeploy ? '' : 'disabled'}">
              <span class="auto-deploy-dot"></span>
              Auto-deploy ${this.autoDeploy ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>

        <!-- Main Content -->
        <div class="main-content">
          <!-- Code Editor -->
          <div class="editor-panel">
            <code-editor
              theme="vs-dark"
              @change=${(event: CustomEvent) => {
                const { detail: { value } } = event;
                this.debouncedHandleCodeChange(value);
              }}
              .code=${this.detail?.handler ?? ''}
              language="typescript"
            ></code-editor>
          </div>
        </div>

        <!-- Log Panel -->
        <div class="log-panel-container">
          <log-panel></log-panel>
        </div>
      </div>
    `;
  }
}
