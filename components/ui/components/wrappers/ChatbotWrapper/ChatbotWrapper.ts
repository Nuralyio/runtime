import { html, LitElement, nothing, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import styles from "./ChatbotWrapper.style.ts";
import type { ChatbotCoreController } from "@nuralyui/chatbot";
import type {
  ChatbotMessage,
  ChatbotSuggestion,
  ChatbotThread,
  ChatbotModule,
  ChatbotFile,
  ChatbotSize,
  ChatbotVariant,
  ChatbotLoadingType
} from "@nuralyui/chatbot";
import "@nuralyui/chatbot";

export type ChatbotPosition = 'center-bottom' | 'bottom-right' | 'bottom-left';
export type MessagesDisplay = 'always' | 'never' | 'auto';

@customElement("chatbot-wrapper")
export class ChatbotWrapper extends LitElement {
  static styles = styles;

  // Wrapper-specific props
  /** Enable floating mode (fixed position) */
  @property({ type: Boolean, reflect: true })
  floating = false;

  /** Enable draggable functionality */
  @property({ type: Boolean, reflect: true })
  draggable = false;

  /** Floating position anchor */
  @property({ type: String, reflect: true })
  position: ChatbotPosition = 'center-bottom';

  /** Title shown in drag handle */
  @property({ type: String })
  title = 'Chat';

  /** Show close button in drag handle */
  @property({ type: Boolean })
  showCloseButton = false;

  /** Minimized state (only shows drag handle) */
  @property({ type: Boolean, reflect: true })
  minimized = false;

  // Pass-through props to nr-chatbot
  /** ChatbotCoreController instance */
  @property({ type: Object })
  controller?: ChatbotCoreController;

  /** Array of chat messages */
  @property({ type: Array })
  messages: ChatbotMessage[] = [];

  /** Current input value */
  @property({ type: String })
  currentInput = '';

  /** Bot typing indicator state */
  @property({ type: Boolean })
  isBotTyping = false;

  /** Query running state */
  @property({ type: Boolean })
  isQueryRunning = false;

  /** Array of suggestion objects */
  @property({ type: Array })
  suggestions: ChatbotSuggestion[] = [];

  /** Whether chat has started */
  @property({ type: Boolean })
  chatStarted = false;

  /** Right-to-left text direction */
  @property({ type: Boolean })
  isRTL = false;

  /** Chatbot size variant */
  @property({ type: String })
  size: ChatbotSize = 'medium' as ChatbotSize;

  /** Chatbot visual variant */
  @property({ type: String })
  variant: ChatbotVariant = 'default' as ChatbotVariant;

  /** Loading indicator type */
  @property({ type: String })
  loadingIndicator: ChatbotLoadingType = 'dots' as ChatbotLoadingType;

  /** Loading text message */
  @property({ type: String })
  loadingText = 'Bot is typing...';

  /** Disable input and interactions */
  @property({ type: Boolean })
  disabled = false;

  /** Custom placeholder text */
  @property({ type: String })
  placeholder = 'Type your message...';

  /** Show send button */
  @property({ type: Boolean })
  showSendButton = true;

  /** Auto-scroll to new messages */
  @property({ type: Boolean })
  autoScroll = true;

  /** Show thread sidebar */
  @property({ type: Boolean })
  showThreads = false;

  /** Enable creation of new threads */
  @property({ type: Boolean })
  enableThreadCreation = false;

  /** Array of conversation threads */
  @property({ type: Array })
  threads: ChatbotThread[] = [];

  /** Currently active thread ID */
  @property({ type: String })
  activeThreadId?: string;

  /** Chatbot mode */
  @property({ type: String })
  mode = 'chat';

  /** Enable boxed layout */
  @property({ type: Boolean })
  boxed = false;

  /** Messages display mode: 'always', 'never', 'auto' (show when messages exist) */
  @property({ type: String })
  messagesDisplay: MessagesDisplay = 'always';

  /** Whether there are messages (used for auto mode reactivity) */
  @property({ type: Boolean })
  hasMessages = false;

  /** Enable file upload */
  @property({ type: Boolean })
  enableFileUpload = false;

  /** Uploaded files */
  @property({ type: Array })
  uploadedFiles: ChatbotFile[] = [];

  /** Enable module selection */
  @property({ type: Boolean })
  enableModuleSelection = false;

  /** Available modules */
  @property({ type: Array })
  modules: ChatbotModule[] = [];

  /** Selected module IDs */
  @property({ type: Array })
  selectedModules: string[] = [];

  // Internal drag state
  @state() private isDragging = false;
  @state() private hasDragged = false;
  @state() private dragPosition = { x: 0, y: 0 };

  private dragStartPos = { x: 0, y: 0 };
  private dragStartMousePos = { x: 0, y: 0 };

  connectedCallback(): void {
    super.connectedCallback();
    // Initialize position based on anchor
    this.initializePosition();
    // Set initial input-only state
    this.updateInputOnlyAttribute();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeDragListeners();
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    // Reset position if floating mode or position changes
    if (changedProperties.has('floating') || changedProperties.has('position')) {
      if (!this.hasDragged) {
        this.initializePosition();
      }
    }

    // Update input-only attribute when relevant properties change
    if (changedProperties.has('messagesDisplay') ||
        changedProperties.has('hasMessages') ||
        changedProperties.has('isBotTyping') ||
        changedProperties.has('isQueryRunning')) {
      this.updateInputOnlyAttribute();
    }
  }

  private updateInputOnlyAttribute(): void {
    if (!this.shouldShowMessages) {
      this.setAttribute('input-only', '');
    } else {
      this.removeAttribute('input-only');
    }
  }

  private initializePosition(): void {
    if (!this.floating) return;

    // Position will be handled by CSS when not dragged
    this.hasDragged = false;
    this.classList.remove('dragged');
  }

  private handleDragStart = (e: PointerEvent): void => {
    if (!this.draggable) return;

    e.preventDefault();

    this.isDragging = true;
    this.classList.add('dragging');

    // Get current computed position
    const rect = this.getBoundingClientRect();

    if (!this.hasDragged) {
      // First drag - initialize from current CSS position
      this.dragPosition = { x: rect.left, y: rect.top };
      this.hasDragged = true;
      this.classList.add('dragged');
    }

    this.dragStartPos = { ...this.dragPosition };
    this.dragStartMousePos = { x: e.clientX, y: e.clientY };

    // Capture pointer for smooth dragging
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    document.addEventListener('pointermove', this.handleDrag);
    document.addEventListener('pointerup', this.handleDragEnd);
  };

  private handleDrag = (e: PointerEvent): void => {
    if (!this.isDragging) return;

    const deltaX = e.clientX - this.dragStartMousePos.x;
    const deltaY = e.clientY - this.dragStartMousePos.y;

    let newX = this.dragStartPos.x + deltaX;
    let newY = this.dragStartPos.y + deltaY;

    // Constrain to viewport
    const rect = this.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width;
    const maxY = window.innerHeight - rect.height;

    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));

    this.dragPosition = { x: newX, y: newY };
    this.requestUpdate();
  };

  private handleDragEnd = (e: PointerEvent): void => {
    this.isDragging = false;
    this.classList.remove('dragging');

    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    this.removeDragListeners();

    // Dispatch position changed event
    this.dispatchEvent(new CustomEvent('position-changed', {
      bubbles: true,
      composed: true,
      detail: { position: this.dragPosition }
    }));
  };

  private removeDragListeners(): void {
    document.removeEventListener('pointermove', this.handleDrag);
    document.removeEventListener('pointerup', this.handleDragEnd);
  }

  private handleClose = (): void => {
    this.dispatchEvent(new CustomEvent('chatbot-close', {
      bubbles: true,
      composed: true
    }));
  };

  private handleMinimize = (): void => {
    this.minimized = !this.minimized;
    this.dispatchEvent(new CustomEvent('chatbot-minimize', {
      bubbles: true,
      composed: true,
      detail: { minimized: this.minimized }
    }));
  };

  private getPositionStyles(): Record<string, string> {
    if (!this.floating || !this.hasDragged) {
      return {};
    }

    return {
      left: `${this.dragPosition.x}px`,
      top: `${this.dragPosition.y}px`,
      bottom: 'auto',
      right: 'auto'
    };
  }

  /** Compute whether to show messages based on messagesDisplay mode */
  private get shouldShowMessages(): boolean {
    switch (this.messagesDisplay) {
      case 'never':
        return false;
      case 'auto':
        // Show messages when there are messages or bot is typing
        return this.hasMessages || this.isBotTyping || this.isQueryRunning;
      case 'always':
      default:
        return true;
    }
  }

  /** Reset position to default anchor */
  public resetPosition(): void {
    this.hasDragged = false;
    this.classList.remove('dragged');
    this.dragPosition = { x: 0, y: 0 };
    this.requestUpdate();
  }

  /** Set position programmatically */
  public setPosition(x: number, y: number): void {
    this.dragPosition = { x, y };
    this.hasDragged = true;
    this.classList.add('dragged');
    this.requestUpdate();
  }

  render() {
    return html`
      <div
        class="chatbot-wrapper ${classMap({
          'chatbot-wrapper--floating': this.floating,
          'chatbot-wrapper--dragging': this.isDragging,
          'chatbot-wrapper--minimized': this.minimized
        })}"
        style=${styleMap(this.getPositionStyles())}
        part="wrapper"
      >
        ${this.draggable ? html`
          <div
            class="drag-handle"
            part="drag-handle"
            @pointerdown=${this.handleDragStart}
          >
            <span class="drag-handle__icon">⋮⋮</span>
            <span class="drag-handle__title">${this.title}</span>
            <div class="drag-handle__actions">
              <button
                class="drag-handle__close"
                @click=${this.handleMinimize}
                title="${this.minimized ? 'Expand' : 'Minimize'}"
                aria-label="${this.minimized ? 'Expand' : 'Minimize'}"
              >
                ${this.minimized ? '▢' : '—'}
              </button>
              ${this.showCloseButton ? html`
                <button
                  class="drag-handle__close"
                  @click=${this.handleClose}
                  title="Close"
                  aria-label="Close"
                >
                  ✕
                </button>
              ` : nothing}
            </div>
          </div>
        ` : nothing}

        <div class="chatbot-container" part="chatbot-container">
          <nr-chatbot
            .controller=${this.controller}
            .messages=${this.messages}
            .currentInput=${this.currentInput}
            .isBotTyping=${this.isBotTyping}
            .isQueryRunning=${this.isQueryRunning}
            .suggestions=${this.suggestions}
            .chatStarted=${this.chatStarted}
            .isRTL=${this.isRTL}
            .size=${this.size}
            .variant=${this.variant}
            .loadingIndicator=${this.loadingIndicator}
            .loadingText=${this.loadingText}
            .disabled=${this.disabled}
            .placeholder=${this.placeholder}
            .showSendButton=${this.showSendButton}
            .autoScroll=${this.autoScroll}
            .showThreads=${this.showThreads}
            .enableThreadCreation=${this.enableThreadCreation}
            .threads=${this.threads}
            .activeThreadId=${this.activeThreadId}
            .mode=${this.mode}
            .boxed=${this.boxed}
            .showMessages=${this.shouldShowMessages}
            .enableFileUpload=${this.enableFileUpload}
            .uploadedFiles=${this.uploadedFiles}
            .enableModuleSelection=${this.enableModuleSelection}
            .modules=${this.modules}
            .selectedModules=${this.selectedModules}
          ></nr-chatbot>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "chatbot-wrapper": ChatbotWrapper;
  }
}
