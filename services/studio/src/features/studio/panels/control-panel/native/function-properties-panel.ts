/**
 * Function Properties Panel
 *
 * Displayed in the right panel when editing a function.
 * Shows payload editor, output, and settings.
 */

import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  $functionEditorState,
  setPayloadString,
  setAutoDeploy,
  type FunctionEditorState,
  type ActionStatus,
} from '../../../../runtime/redux/store/function-editor';
import { invokeFunctionHandler } from '../../../../runtime/redux/handlers/functions/invoke-function-handler';
import { setInvokeStatus, setLastResult, setLastError } from '../../../../runtime/redux/store/function-editor';
import "@nuralyui/code-editor";

@customElement("function-properties-panel")
export class FunctionPropertiesPanel extends LitElement {
  static override styles = css`
    :host {
      display: block;
      height: 100%;
      overflow: hidden;
    }

    .panel-container {
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    /* Tabs */
    .panel-tabs {
      display: flex;
      border-bottom: 1px solid var(--n-color-border, #e5e7eb);
      background: var(--n-color-surface-secondary, #f9fafb);
      flex-shrink: 0;
    }

    .panel-tab {
      padding: 10px 16px;
      font-size: 13px;
      font-weight: 500;
      color: var(--n-color-text-muted, #6b7280);
      cursor: pointer;
      border: none;
      background: none;
      border-bottom: 2px solid transparent;
      transition: all 0.15s ease;
    }

    .panel-tab:hover {
      color: var(--n-color-text, #111827);
      background: var(--n-color-surface-hover, #f3f4f6);
    }

    .panel-tab.active {
      color: var(--n-color-primary, #3b82f6);
      border-bottom-color: var(--n-color-primary, #3b82f6);
      background: var(--n-color-surface, #fff);
    }

    .tab-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .tab-content.hidden {
      display: none;
    }

    /* Payload Panel */
    .payload-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 12px;
      gap: 12px;
      overflow: hidden;
    }

    .section-label {
      font-size: 11px;
      font-weight: 600;
      color: var(--n-color-text-muted, #6b7280);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .payload-editor {
      flex: 1;
      min-height: 150px;
      border: 1px solid var(--n-color-border, #e5e7eb);
      border-radius: 6px;
      overflow: hidden;
    }

    .payload-editor nr-code-editor {
      height: 100%;
    }

    .invoke-button {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 16px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      background: var(--n-color-primary, #3b82f6);
      color: #fff;
      transition: all 0.15s ease;
      flex-shrink: 0;
    }

    .invoke-button:hover:not(:disabled) {
      background: var(--n-color-primary-hover, #2563eb);
    }

    .invoke-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .invoke-button svg {
      width: 16px;
      height: 16px;
    }

    /* Output Panel */
    .output-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .output-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px;
      border-bottom: 1px solid var(--n-color-border, #e5e7eb);
      flex-shrink: 0;
    }

    .output-status {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--n-color-text-muted, #6b7280);
    }

    .output-status.success {
      color: var(--n-color-success, #10b981);
    }

    .output-status.error {
      color: var(--n-color-error, #ef4444);
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

    .output-content {
      flex: 1;
      overflow: auto;
      padding: 12px;
      font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
      font-size: 12px;
      line-height: 1.5;
      white-space: pre-wrap;
      word-break: break-word;
      background: var(--n-color-surface-secondary, #f9fafb);
      color: var(--n-color-text, #111827);
    }

    .output-empty {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      color: var(--n-color-text-muted, #6b7280);
      text-align: center;
    }

    .output-empty svg {
      width: 40px;
      height: 40px;
      margin-bottom: 12px;
      opacity: 0.4;
    }

    .output-empty-text {
      font-size: 12px;
    }

    /* Settings Panel */
    .settings-panel {
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .setting-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .setting-label {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .setting-title {
      font-size: 13px;
      font-weight: 500;
      color: var(--n-color-text, #111827);
    }

    .setting-description {
      font-size: 11px;
      color: var(--n-color-text-muted, #6b7280);
    }

    /* Toggle Switch */
    .toggle-switch {
      position: relative;
      width: 40px;
      height: 22px;
      flex-shrink: 0;
    }

    .toggle-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .toggle-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: var(--n-color-border, #d1d5db);
      transition: 0.2s;
      border-radius: 22px;
    }

    .toggle-slider:before {
      position: absolute;
      content: "";
      height: 16px;
      width: 16px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: 0.2s;
      border-radius: 50%;
    }

    .toggle-switch input:checked + .toggle-slider {
      background-color: var(--n-color-primary, #3b82f6);
    }

    .toggle-switch input:checked + .toggle-slider:before {
      transform: translateX(18px);
    }

    .function-name {
      padding: 8px 12px;
      background: var(--n-color-surface-secondary, #f9fafb);
      border-bottom: 1px solid var(--n-color-border, #e5e7eb);
      font-size: 12px;
      font-weight: 500;
      color: var(--n-color-text, #111827);
      flex-shrink: 0;
    }
  `;

  @property({ type: String })
  functionId: string | null = null;

  @state()
  private editorState: FunctionEditorState = $functionEditorState.get();

  @state()
  private activeTab: 'payload' | 'output' | 'settings' = 'payload';

  private unsubscribe?: () => void;

  override connectedCallback() {
    super.connectedCallback();
    this.unsubscribe = $functionEditorState.subscribe((state) => {
      this.editorState = state;
    });
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribe?.();
  }

  private handlePayloadChange(event: CustomEvent) {
    const { detail: { value } } = event;
    setPayloadString(value);
  }

  private handleInvoke() {
    const functionId = this.editorState.functionId;
    if (!functionId) return;

    setInvokeStatus('running');
    setLastResult('');
    this.activeTab = 'output';

    invokeFunctionHandler(functionId, this.editorState.payload)
      .then(async (result) => {
        const text = await result.text();
        setLastResult(text);
        setInvokeStatus('success');
        setTimeout(() => setInvokeStatus('idle'), 3000);
      })
      .catch((err) => {
        setLastResult(`Error: ${err.message || err}`);
        setLastError(err.message || err);
        setInvokeStatus('error');
        setTimeout(() => setInvokeStatus('idle'), 3000);
      });
  }

  private handleAutoDeployChange(e: Event) {
    const checked = (e.target as HTMLInputElement).checked;
    setAutoDeploy(checked);
  }

  private renderStatusIndicator(status: ActionStatus) {
    if (status === 'idle') return null;
    return html`<span class="status-indicator ${status}"></span>`;
  }

  override render() {
    const { payloadString, lastResult, invokeStatus, autoDeploy, functionName } = this.editorState;

    return html`
      <div class="panel-container">
        ${functionName ? html`
          <div class="function-name">${functionName}</div>
        ` : ''}

        <div class="panel-tabs">
          <button
            class="panel-tab ${this.activeTab === 'payload' ? 'active' : ''}"
            @click=${() => this.activeTab = 'payload'}
          >
            Payload
          </button>
          <button
            class="panel-tab ${this.activeTab === 'output' ? 'active' : ''}"
            @click=${() => this.activeTab = 'output'}
          >
            Output
          </button>
          <button
            class="panel-tab ${this.activeTab === 'settings' ? 'active' : ''}"
            @click=${() => this.activeTab = 'settings'}
          >
            Settings
          </button>
        </div>

        <!-- Payload Tab -->
        <div class="tab-content ${this.activeTab !== 'payload' ? 'hidden' : ''}">
          <div class="payload-panel">
            <span class="section-label">Request Body (JSON)</span>
            <div class="payload-editor">
              <nr-code-editor
                theme="vs-dark"
                @nr-change=${this.handlePayloadChange}
                .code=${payloadString}
                language="json"
              ></nr-code-editor>
            </div>
            <button
              class="invoke-button"
              @click=${this.handleInvoke}
              ?disabled=${invokeStatus === 'running' || !this.editorState.functionId}
            >
              ${invokeStatus === 'running'
                ? html`<span class="status-indicator running"></span> Running...`
                : html`
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Invoke Function
                  `
              }
            </button>
          </div>
        </div>

        <!-- Output Tab -->
        <div class="tab-content ${this.activeTab !== 'output' ? 'hidden' : ''}">
          <div class="output-panel">
            <div class="output-header">
              <span class="section-label">Response</span>
              ${invokeStatus !== 'idle' ? html`
                <span class="output-status ${invokeStatus}">
                  ${this.renderStatusIndicator(invokeStatus)}
                  ${invokeStatus === 'running' ? 'Running...' :
                    invokeStatus === 'success' ? 'Success' : 'Error'}
                </span>
              ` : ''}
            </div>
            ${lastResult
              ? html`<div class="output-content">${lastResult}</div>`
              : html`
                  <div class="output-empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span class="output-empty-text">
                      Click "Invoke Function" to see the response
                    </span>
                  </div>
                `
            }
          </div>
        </div>

        <!-- Settings Tab -->
        <div class="tab-content ${this.activeTab !== 'settings' ? 'hidden' : ''}">
          <div class="settings-panel">
            <div class="setting-item">
              <div class="setting-label">
                <span class="setting-title">Auto Deploy</span>
                <span class="setting-description">Automatically build and deploy when code changes</span>
              </div>
              <label class="toggle-switch">
                <input
                  type="checkbox"
                  .checked=${autoDeploy}
                  @change=${this.handleAutoDeployChange}
                />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "function-properties-panel": FunctionPropertiesPanel;
  }
}
