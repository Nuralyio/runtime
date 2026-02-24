import { css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { ref } from "lit/directives/ref.js";
import { type ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { $components } from '../../../../../redux/store/component/store.ts';
import { renderComponent } from '../../../../../utils/render-util';
import { setCurrentComponentIdAction } from '../../../../../redux/actions/component/setCurrentComponentIdAction.ts';
import { ChatbotCoreController, WorkflowSocketProvider } from "@nuralyui/chatbot";

// Import the chatbot wrapper component
import "../../wrappers/ChatbotWrapper/ChatbotWrapper.ts";

@customElement("chatbot-wrapper-block")
export class ChatbotWrapperBlock extends BaseElementBlock {
  static styles = [css`
    :host {
      display: block;
    }

    .chatbot-block-container {
      min-height: 60px;
      position: relative;
    }

    .chatbot-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 24px;
      min-height: 120px;
      border: 2px dashed #cbd5e1;
      border-radius: 12px;
      background: #f8fafc;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .chatbot-placeholder:hover {
      border-color: #94a3b8;
      background: #f1f5f9;
    }

    .chatbot-placeholder.selected {
      border-color: #3b82f6;
      background: #eff6ff;
    }

    .placeholder-icon {
      font-size: 32px;
    }

    .placeholder-text {
      font-size: 14px;
      font-weight: 500;
      color: #64748b;
    }

    .placeholder-hint {
      font-size: 12px;
      color: #94a3b8;
    }

    /* Children container for nested components */
    .children-container {
      min-height: 40px;
    }

    .children-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px;
      min-height: 40px;
      border: 1px dashed #d1d5db;
      border-radius: 6px;
      background: #fafafa;
      margin-top: 8px;
    }

    .children-placeholder span {
      font-size: 11px;
      color: #9ca3af;
    }

    /* Floating indicator card (for editor mode when floating is enabled) */
    .chatbot-editor-card {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
      max-width: 280px;
    }

    .chatbot-editor-card:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .chatbot-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      color: white;
    }

    .chatbot-info {
      flex: 1;
      min-width: 0;
    }

    .chatbot-title {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: white;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .chatbot-subtitle {
      display: block;
      font-size: 11px;
      color: rgba(255, 255, 255, 0.7);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .edit-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border: none;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.2);
      color: white;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .edit-btn:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .edit-btn.editing {
      background: white;
      color: #667eea;
    }

    /* Position badge */
    .position-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      padding: 4px 6px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      color: rgba(255, 255, 255, 0.9);
    }

    /* Floating edit mode layout */
    .chatbot-block-container--floating-edit {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .chatbot-block-container--floating-edit .chatbot-editor-card {
      flex-shrink: 0;
    }

    .chatbot-block-container--floating-edit chatbot-wrapper {
      flex: 1;
      min-height: 200px;
    }

    /* Floating preview in editor - break out of containment */
    .chatbot-floating-preview {
      position: fixed !important;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 9999;
      width: 420px;
      max-width: 95vw;
      height: 500px;
      max-height: 70vh;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      border-radius: 12px;
      overflow: hidden;
    }

    .chatbot-floating-preview.position-bottom-right {
      left: auto;
      right: 24px;
      transform: none;
    }

    .chatbot-floating-preview.position-bottom-left {
      left: 24px;
      transform: none;
    }

    .chatbot-floating-preview chatbot-wrapper {
      width: 100%;
      height: 100%;
    }

    /* Backdrop for floating preview */
    .floating-preview-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.3);
      z-index: 9998;
    }
  `];

  @property({ type: Object })
  component: ComponentElement;

  @property({ type: Object })
  item: any;

  @property({ type: Boolean })
  isViewMode = false;

  @state()
  childrenComponents: ComponentElement[] = [];

  @state()
  private controller?: ChatbotCoreController;

  @state()
  private provider?: WorkflowSocketProvider;

  // Track current workflow ID for change detection
  private _currentWorkflowId?: string;

  // Track if messages have been received (for auto display mode)
  @state()
  private _hasMessages = false;

  // Editor state for floating chatbot
  @state()
  private _editorOpen = false;

  // Public methods to control editor mode
  public openEditor() {
    this._editorOpen = true;
  }

  public closeEditor() {
    this._editorOpen = false;
  }

  public toggleEditor() {
    this._editorOpen = !this._editorOpen;
  }

  override connectedCallback() {
    super.connectedCallback();
    this.updateChildrenComponents();
    // Controller initialization is handled in updated() to ensure isViewMode is set
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.cleanupChatbotController();
  }

  override updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);
    if (changedProperties.has("component")) {
      this.updateChildrenComponents();
    }

    // Initialize controller when entering view mode or when workflowId changes
    const workflowId = this.resolvedInputs?.workflowId;
    const isViewModeChanged = changedProperties.has("isViewMode");
    const workflowIdChanged = workflowId !== this._currentWorkflowId;

    if (this.isViewMode && (isViewModeChanged || workflowIdChanged)) {
      // Cleanup existing controller if any
      if (this.controller) {
        this.cleanupChatbotController();
      }

      this._currentWorkflowId = workflowId;

      if (workflowId) {
        this.initializeChatbotController();
      }
    } else if (!this.isViewMode && isViewModeChanged) {
      // Switched to editor mode, cleanup controller
      this.cleanupChatbotController();
    }
  }

  private updateChildrenComponents(): void {
    const appComponents = $components.get()[this.component?.application_id] ?? [];
    this.childrenComponents = this.component?.children_ids?.map((id) => {
      return appComponents.find((component) => component.uuid === id);
    }).filter(Boolean) ?? [];
  }

  private async initializeChatbotController(): Promise<void> {
    // Only initialize in view mode when we have a workflowId
    if (!this.isViewMode) {
      return;
    }

    const workflowId = this.resolvedInputs?.workflowId;
    const socketUrl = this.resolvedInputs?.socketUrl;
    const debug = this.resolvedInputs?.debug || false;

    if (!workflowId) {
      console.warn('ChatbotWrapperBlock: No workflowId configured');
      return;
    }

    if (debug) {
      console.log('ChatbotWrapperBlock: Initializing controller with workflowId:', workflowId);
    }

    // Track current workflow ID
    this._currentWorkflowId = workflowId;

    try {
      this.provider = new WorkflowSocketProvider();
      await this.provider.connect({
        workflowId,
        socketUrl: socketUrl || window.location.origin,
        onExecutionStart: (executionId: string, workflowId: string) => {
          if (debug) {
            console.log(`ChatbotWrapperBlock: Execution started - ${executionId} for workflow ${workflowId}`);
          }

          // Dispatch global event for workflow-wrapper to listen to
          window.dispatchEvent(new CustomEvent('nuraly:execution-start', {
            detail: { executionId, workflowId }
          }));

          // Fire component event for handlers
          this.executeEvent('onExecutionStart', undefined, { executionId, workflowId });
        }
      });

      this.controller = new ChatbotCoreController({
        provider: this.provider,
        ui: {
          onStateChange: () => {
            this.requestUpdate();
          }
        },
        initialMessages: this.resolvedInputs?.initialMessages || [],
        initialSuggestions: this.resolvedInputs?.suggestions || [],
        debug: debug
      });

      if (debug) {
        console.log('ChatbotWrapperBlock: Controller created successfully');
      }

      // Subscribe to controller events and forward them as component events
      this.controller.on('message:sent', (message: any) => {
        this._hasMessages = true;
        this.executeEvent('onMessageSent', undefined, { message });
      });

      this.controller.on('message:received', (message: any) => {
        this._hasMessages = true;
        this.executeEvent('onMessageReceived', undefined, { message });
      });

      this.controller.on('provider:connected', () => {
        this.executeEvent('onProviderConnected', undefined, { workflowId });
      });

      this.controller.on('provider:error', (error: any) => {
        this.executeEvent('onProviderError', undefined, { error });
      });

      this.controller.on('typing:start', () => {
        this.executeEvent('onTypingStart', undefined, {});
      });

      this.controller.on('typing:end', () => {
        this.executeEvent('onTypingEnd', undefined, {});
      });

      // Trigger re-render now that controller is ready
      this.requestUpdate();

    } catch (error) {
      console.error('ChatbotWrapperBlock: Failed to initialize controller', error);
      this.executeEvent('onProviderError', undefined, { error });
    }
  }

  private cleanupChatbotController(): void {
    if (this.provider) {
      this.provider.disconnect();
      this.provider = undefined;
    }
    if (this.controller) {
      this.controller.destroy();
      this.controller = undefined;
    }
    this._currentWorkflowId = undefined;
    this._hasMessages = false;
  }

  private renderChildren() {
    if (this.childrenComponents.length) {
      return renderComponent(
        this.childrenComponents.map((c) => ({ ...c, item: this.item })),
        this.item,
        this.isViewMode,
        { ...this.component, uniqueUUID: this.uniqueUUID }
      );
    }

    if (!this.isViewMode) {
      return html`
        <div class="children-placeholder">
          <span>Drop components here</span>
          <drag-wrapper
            .where=${"inside"}
            .message=${"Drop inside chatbot"}
            .component=${{ ...this.component }}
            .inputRef=${this.inputRef}
            .isDragInitiator=${this.isDragInitiator}
          ></drag-wrapper>
        </div>
      `;
    }

    return nothing;
  }

  private renderChatbot(floating: boolean) {
    const draggable = this.resolvedInputs?.draggable ?? false;
    const position = this.resolvedInputs?.position || 'center-bottom';
    const title = this.resolvedInputs?.title || 'Chat';
    const showCloseButton = this.resolvedInputs?.showCloseButton ?? false;
    const minimized = this.resolvedInputs?.minimized ?? false;

    // Chatbot props
    const messagesDisplay = this.resolvedInputs?.messagesDisplay || 'always';
    const placeholder = this.resolvedInputs?.placeholder || 'Type your message...';
    const size = this.resolvedInputs?.size || 'medium';
    const variant = this.resolvedInputs?.variant || 'default';
    const loadingIndicator = this.resolvedInputs?.loadingIndicator || 'dots';
    const loadingText = this.resolvedInputs?.loadingText || 'Bot is typing...';
    const disabled = this.resolvedInputs?.disabled ?? false;
    const showSendButton = this.resolvedInputs?.showSendButton ?? true;
    const autoScroll = this.resolvedInputs?.autoScroll ?? true;
    const boxed = this.resolvedInputs?.boxed ?? false;
    const isRTL = this.resolvedInputs?.isRTL ?? false;
    const mode = this.resolvedInputs?.mode || 'chat';

    // Thread props
    const showThreads = this.resolvedInputs?.showThreads ?? false;
    const enableThreadCreation = this.resolvedInputs?.enableThreadCreation ?? false;

    // File upload props
    const enableFileUpload = this.resolvedInputs?.enableFileUpload ?? false;

    // Module selection props
    const enableModuleSelection = this.resolvedInputs?.enableModuleSelection ?? false;
    const modules = this.resolvedInputs?.modules || [];
    const selectedModules = this.resolvedInputs?.selectedModules || [];

    // Data props from inputs (only used when no controller)
    const messages = this.resolvedInputs?.messages || [];
    const suggestions = this.resolvedInputs?.suggestions || [];
    const threads = this.resolvedInputs?.threads || [];

    // Use tracked _hasMessages state for auto mode reactivity
    const hasMessages = this._hasMessages || messages.length > 0;

    return html`
      <chatbot-wrapper
        .controller=${this.controller}
        .floating=${floating}
        .draggable=${draggable}
        .position=${position}
        .title=${title}
        .showCloseButton=${showCloseButton}
        .minimized=${minimized}
        .messagesDisplay=${messagesDisplay}
        .hasMessages=${hasMessages}
        .placeholder=${placeholder}
        .size=${size}
        .variant=${variant}
        .loadingIndicator=${loadingIndicator}
        .loadingText=${loadingText}
        .disabled=${disabled}
        .showSendButton=${showSendButton}
        .autoScroll=${autoScroll}
        .boxed=${boxed}
        .isRTL=${isRTL}
        .mode=${mode}
        .showThreads=${showThreads}
        .enableThreadCreation=${enableThreadCreation}
        .enableFileUpload=${enableFileUpload}
        .enableModuleSelection=${enableModuleSelection}
        .modules=${modules}
        .selectedModules=${selectedModules}
        .messages=${messages}
        .suggestions=${suggestions}
        .threads=${threads}
        @chatbot-close=${(e: CustomEvent) => this.executeEvent('onChatbotClose', e)}
        @chatbot-minimize=${(e: CustomEvent) => this.executeEvent('onChatbotMinimize', e)}
        @position-changed=${(e: CustomEvent) => this.executeEvent('onPositionChanged', e)}
        @nr-chatbot-message-sent=${(e: CustomEvent) => this.executeEvent('onMessageSent', e)}
        @nr-chatbot-suggestion-clicked=${(e: CustomEvent) => this.executeEvent('onSuggestionClicked', e)}
        @nr-chatbot-input-changed=${(e: CustomEvent) => this.executeEvent('onInputChanged', e)}
      >
        ${this.renderChildren()}
      </chatbot-wrapper>
    `;
  }

  renderComponent() {
    const baseStyles = this.component?.style || {};
    const floating = this.resolvedInputs?.floating ?? false;
    const title = this.resolvedInputs?.title || 'Chat';
    const position = this.resolvedInputs?.position || 'center-bottom';
    const showMessages = this.resolvedInputs?.showMessages ?? true;

    // In input-only mode, remove height constraints
    const styles = showMessages ? baseStyles : {
      ...baseStyles,
      height: 'auto',
      minHeight: 'auto'
    };

    // In view mode, always render the actual chatbot
    if (this.isViewMode) {
      return html`
        <div
          class="chatbot-block-container"
          style=${styleMap(styles)}
          ${ref(this.inputRef)}
        >
          ${this.renderChatbot(floating)}
        </div>
      `;
    }

    // In editor mode with floating enabled, show indicator card + chatbot for editing
    if (floating) {
      const positionClass = position === 'bottom-right' ? 'position-bottom-right'
        : position === 'bottom-left' ? 'position-bottom-left' : '';

      return html`
        <div
          class="chatbot-block-container chatbot-block-container--floating-edit"
          style=${styleMap(styles)}
          ${ref(this.inputRef)}
          @click=${(e: Event) => {
            e.stopPropagation();
            setCurrentComponentIdAction(this.component?.uuid);
          }}
        >
          <!-- Indicator card showing floating info -->
          <div class="chatbot-editor-card">
            <div class="chatbot-icon">
              <nr-icon name="message-circle" size="16"></nr-icon>
            </div>
            <div class="chatbot-info">
              <span class="chatbot-title">${title}</span>
              <span class="chatbot-subtitle">Floating · ${position}</span>
            </div>
            <button
              class="edit-btn ${this._editorOpen ? 'editing' : ''}"
              @click=${(e: Event) => {
                e.stopPropagation();
                this._editorOpen = !this._editorOpen;
              }}
              title="${this._editorOpen ? 'Close preview' : 'Preview floating'}"
            >
              <nr-icon name="${this._editorOpen ? 'x' : 'eye'}" size="14"></nr-icon>
            </button>
          </div>

          <!-- Inline chatbot for editing (with floating enabled so styles apply) -->
          ${this.renderChatbot(true)}

          <!-- Floating preview overlay when toggled -->
          ${this._editorOpen ? html`
            <div
              class="floating-preview-backdrop"
              @click=${() => this._editorOpen = false}
            ></div>
            <div class="chatbot-floating-preview ${positionClass}">
              ${this.renderChatbot(false)}
            </div>
          ` : nothing}
        </div>
      `;
    }

    // Non-floating mode in editor - render normally
    return html`
      <div
        class="chatbot-block-container"
        style=${styleMap(styles)}
        ${ref(this.inputRef)}
        @click=${(e: Event) => {
          e.stopPropagation();
          setCurrentComponentIdAction(this.component?.uuid);
        }}
      >
        ${this.renderChatbot(false)}
      </div>
    `;
  }
}
