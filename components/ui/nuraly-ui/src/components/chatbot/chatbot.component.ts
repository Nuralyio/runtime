/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { localized, msg } from '@lit/localize';

import styles from './chatbot.style.js';
import { NuralyUIBaseMixin } from '@nuralyui/common/mixins';

import {
  ChatbotMessage,
  ChatbotSuggestion,
  ChatbotSender,
  ChatbotSize,
  ChatbotVariant,
  ChatbotLoadingType,
  ChatbotThread,
  ChatbotModule,
  ChatbotFile,
  ChatbotAction,
  EMPTY_STRING
} from './chatbot.types.js';

import { SelectOption } from '../select/select.types.js';

import {
  renderChatbotMain,
  ChatbotMainTemplateData,
  ChatbotMainTemplateHandlers,
  renderFilePreviewModal,
  FilePreviewModalTemplateData,
  FilePreviewModalTemplateHandlers
} from './templates/index.js';

import { ChatbotCoreController } from './core/chatbot-core.controller.js';

/**
 * Enhanced chatbot component powered by ChatbotCoreController.
 * 
 * Requires an external ChatbotCoreController to function.
 * 
 * @example With ChatbotCoreController
 * ```javascript
 * import { ChatbotCoreController, OpenAIProvider } from '@nuraly/chatbot';
 * 
 * const controller = new ChatbotCoreController({
 *   provider: new OpenAIProvider(),
 *   ui: {
 *     onStateChange: (state) => {
 *       chatbot.messages = state.messages;
 *       chatbot.threads = state.threads;
 *     },
 *     onTypingStart: () => chatbot.isBotTyping = true,
 *     onTypingEnd: () => chatbot.isBotTyping = false
 *   }
 * });
 * 
 * chatbot.controller = controller;
 * ```
 * 
 * @fires nr-chatbot-message-sent - Message sent by user
 * @fires nr-chatbot-input-changed - Input value changed
 */
@localized()
@customElement('nr-chatbot')
export class NrChatbotElement extends NuralyUIBaseMixin(LitElement) {
  static override styles = styles;
  override requiredComponents = ['nr-input', 'nr-button', 'nr-icon', 'nr-dropdown', 'nr-select', 'nr-modal'];

  /** Array of chat messages (synced from controller) */
  @property({type: Array}) 
  messages: ChatbotMessage[] = [];

  /** Current input value */
  @property({type: String}) 
  currentInput = EMPTY_STRING;

  /** Bot typing indicator state */
  @property({type: Boolean}) 
  isBotTyping = false;

  /** Query running state (for stop button) */
  @property({type: Boolean})
  isQueryRunning = false;

  /** Array of suggestion objects */
  @property({type: Array}) 
  suggestions: ChatbotSuggestion[] = [];

  /** Whether chat has started */
  @property({type: Boolean}) 
  chatStarted = false;

  /** Right-to-left text direction */
  @property({type: Boolean}) 
  isRTL = false;

  /** Chatbot size variant */
  @property({type: String})
  size: ChatbotSize = ChatbotSize.Medium;

  /** Chatbot visual variant */
  @property({type: String})
  variant: ChatbotVariant = ChatbotVariant.Default;

  /** Loading indicator type */
  @property({type: String}) 
  loadingIndicator: ChatbotLoadingType = ChatbotLoadingType.Dots;

  /** Loading text message */
  @property({type: String}) 
  loadingText: string = msg('Bot is typing...');

  /** Disable input and interactions */
  @property({type: Boolean})
  disabled = false;

  /** Custom placeholder text */
  @property({type: String})
  placeholder = msg('Type your message...');

  /** Show send button */
  @property({type: Boolean})
  showSendButton = true;

  /** Auto-scroll to new messages */
  @property({type: Boolean})
  autoScroll = true;

  /** Show thread sidebar */
  @property({type: Boolean})
  showThreads = false;

  /** Enable creation of new threads */
  @property({type: Boolean})
  enableThreadCreation = false;

  /** Array of conversation threads */
  @property({type: Array})
  threads: ChatbotThread[] = [];

  /** Currently active thread ID */
  @property({type: String})
  activeThreadId?: string;

  /** Chatbot mode (chat, assistant, etc.) */
  @property({type: String})
  mode: string = 'chat';

  /** Enable boxed layout for large widths (ChatGPT-style) */
  @property({type: Boolean, reflect: true})
  boxed = false;

  /** Enable file upload functionality */
  @property({type: Boolean})
  enableFileUpload = false;

  /** Uploaded files (synced from controller) */
  @property({type: Array})
  uploadedFiles: ChatbotFile[] = [];

  /** Action buttons configuration */
  @property({type: Array})
  actionButtons: ChatbotAction[] = [];

  /** Enable module selection dropdown */
  @property({type: Boolean})
  enableModuleSelection = false;

  /** Available modules for selection */
  @property({type: Array})
  modules: ChatbotModule[] = [];

  /** Selected module IDs (for multi-select) */
  @property({type: Array})
  selectedModules: string[] = [];

  /** Module selection label */
  @property({type: String})
  moduleSelectionLabel = msg('Select Modules');

  /** 
   * ChatbotCoreController instance (REQUIRED).
   * The component delegates all business logic to this controller.
   */
  @property({type: Object})
  controller!: ChatbotCoreController;

  @state() private focused = false;
  @state() private isThreadSidebarOpen = true;
  @state() private isUrlModalOpen = false;
  @state() private urlInput = '';
  @state() private urlModalError = '';
  @state() private isUrlLoading = false;
  @state() private selectedUrlFileName = '';
  @state() private isFilePreviewModalOpen = false;
  @state() private previewFile: ChatbotFile | null = null;
  
  // Keep track of controller event unsubscriptions
  private controllerUnsubscribes: Array<() => void> = [];

  /** Convert modules to select options */
  private get moduleSelectOptions(): SelectOption[] {
    return this.modules.map(module => ({
      value: module.id,
      label: module.name,
      icon: module.icon,
      disabled: module.enabled === false,
      description: module.description
    }));
  }

  override connectedCallback(): void {
    super.connectedCallback();
    
    // Setup controller integration
    if (this.controller) {
      this.setupControllerIntegration();
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    
    if (this.controller) {
      this.cleanupControllerIntegration();
    }
  }

  override updated(changedProperties: Map<string, any>): void {
    super.updated(changedProperties);
    
    // If controller property changed after first render, (re)wire integration
    if (changedProperties.has('controller')) {
      // Clean up listeners from previous controller instance (if any)
      this.cleanupControllerIntegration();
      
      if (this.controller) {
        this.setupControllerIntegration();
        // Sync current controller state into component immediately
        try {
          const state = this.controller.getState();
          this.handleControllerStateChange(state);
        } catch {
          // no-op if controller not fully ready yet
        }
      }
    }
    
    // Auto-scroll when messages are added or updated
    if (changedProperties.has('messages') && this.autoScroll && this.messages.length > 0) {
      this.scrollToLatestMessage();
    }
  }

  /**
   * Scroll messages container to the bottom to show the latest message
   */
  private scrollToLatestMessage(): void {
    requestAnimationFrame(() => {
      const messagesContainer = this.shadowRoot?.querySelector('.messages');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    });
  }

  private setupControllerIntegration(): void {
    if (!this.controller) return;
    
    // Subscribe to controller events and keep unsubscribe fns
    this.controllerUnsubscribes.push(
      this.controller.on('state:changed', this.handleControllerStateChange.bind(this)),
      this.controller.on('message:sent', this.handleControllerMessageSent.bind(this)),
      this.controller.on('message:received', this.handleControllerMessageReceived.bind(this)),
      this.controller.on('error', this.handleControllerError.bind(this))
    );
  }

  private cleanupControllerIntegration(): void {
    // Unsubscribe from previous controller event listeners
    if (this.controllerUnsubscribes.length) {
      try {
        this.controllerUnsubscribes.forEach(unsub => {
          try { unsub(); } catch { /* noop */ }
        });
      } finally {
        this.controllerUnsubscribes = [];
      }
    }
  }

  private handleControllerStateChange(state: any): void {
    // Sync controller state to component properties
    if (state.messages) this.messages = state.messages;
    if (state.threads) this.threads = state.threads;
    if (state.suggestions) this.suggestions = state.suggestions;
    if (state.currentThreadId) this.activeThreadId = state.currentThreadId;
    this.chatStarted = state.messages?.length > 0;
    this.isBotTyping = state.isTyping || false;
    // Keep Stop button in sync with provider processing lifecycle
    this.isQueryRunning = state.isProcessing || false;
  }

  private handleControllerMessageSent(_data: any): void {
    this.isQueryRunning = true;
    this.isBotTyping = true;
  }

  private handleControllerMessageReceived(_data: any): void {
    // Do not force-reset here; rely on state.isProcessing/isTyping updates
  }

  private handleControllerError(data: any): void {
    this.isQueryRunning = false;
    this.isBotTyping = false;
    console.error('Controller error:', data.error);
  }

  override render() {
    const templateData: ChatbotMainTemplateData = {
      boxed: this.boxed,
      messages: this.messages,
      isTyping: this.isBotTyping,
      loadingIndicator: this.loadingIndicator,
      loadingText: this.loadingText,
      chatStarted: this.chatStarted,
      suggestions: this.suggestions,
      inputBox: {
        placeholder: this.placeholder,
        disabled: this.disabled || this.isQueryRunning,
        currentInput: this.currentInput,
        uploadedFiles: this.uploadedFiles,
        isQueryRunning: this.isQueryRunning,
        showSendButton: this.showSendButton,
        enableFileUpload: this.enableFileUpload,
        fileUploadItems: [
          { id: 'upload-file', label: 'Upload File', icon: 'upload' },
          { id: 'upload-url', label: 'Upload from URL', icon: 'link' }
        ],
        enableModuleSelection: this.enableModuleSelection,
        moduleOptions: this.moduleSelectOptions,
        selectedModules: this.selectedModules,
        moduleSelectionLabel: this.moduleSelectionLabel,
        renderModuleDisplay: this.renderModuleSelectedDisplay.bind(this)
      },
      enableThreads: this.showThreads,
      enableThreadCreation: this.enableThreadCreation,
      isThreadSidebarOpen: this.showThreads && this.isThreadSidebarOpen,
      threadSidebar: this.showThreads ? {
        threads: this.threads,
        activeThreadId: this.activeThreadId
      } : undefined,
      isDragging: false,
      urlModal: this.isUrlModalOpen ? {
        isOpen: this.isUrlModalOpen,
        urlInput: this.urlInput,
        isLoading: this.isUrlLoading,
        error: this.urlModalError,
        selectedFileName: this.selectedUrlFileName
      } : undefined
    };

    const templateHandlers: ChatbotMainTemplateHandlers = {
      message: {
        onRetry: this.handleRetry.bind(this),
        onRetryKeydown: () => {},
        onCopy: this.handleCopyMessage.bind(this),
        onCopyKeydown: () => {},
        onFileClick: this.handleFilePreview.bind(this)
      },
      suggestion: {
        onClick: this.handleSuggestionClick.bind(this),
        onKeydown: () => {}
      },
      inputBox: {
        onInput: this.handleContentEditableInput.bind(this),
        onKeydown: this.handleKeyDown.bind(this),
        onFocus: this.handleInputFocus.bind(this),
        onBlur: this.handleInputBlur.bind(this),
        onSend: this.handleSendMessage.bind(this),
        onStop: this.handleStopQuery.bind(this),
        onSendKeydown: () => {},
        onFileDropdownClick: this.handleFileDropdownClick.bind(this),
        onModuleChange: this.handleModuleSelectionChange.bind(this),
        onFileRemove: this.handleFileRemove.bind(this),
        onFileClick: this.handleFilePreview.bind(this)
      },
      threadSidebar: this.showThreads ? {
        onCreateNew: () => this.controller?.createThread('New Chat'),
        onSelectThread: (threadId: string) => this.controller?.switchThread(threadId)
      } : undefined,
      fileUploadArea: {
        onDrop: () => {},
        onDragOver: () => {},
        onDragLeave: () => {}
      },
      urlModal: this.isUrlModalOpen ? {
        onClose: this.handleUrlModalClose.bind(this),
        onUrlInputChange: this.handleUrlInputChange.bind(this),
        onUrlInputKeydown: this.handleUrlInputKeydown.bind(this),
        onConfirm: this.handleUrlConfirm.bind(this),
        onAttachFile: this.handleUrlAttachFile.bind(this)
      } : undefined,
      onToggleThreadSidebar: this.showThreads ? this.toggleThreadSidebar.bind(this) : undefined
    };

    return html`
      <div 
        class="chat-container ${classMap({
          'chat-container--with-threads': this.showThreads,
          'chat-container--disabled': this.disabled,
          'chat-container--focused': this.focused,
          'chat-container--boxed': this.boxed
        })}" 
        dir=${this.isRTL ? 'rtl' : 'ltr'}
        data-size="${this.size}"
        data-variant="${this.variant}"
        data-theme="${this.currentTheme}"
        data-mode="${this.mode}"
        part="chat-container">
        
        ${renderChatbotMain(templateData, templateHandlers)}
      </div>
      
      ${renderFilePreviewModal(
        {
          isOpen: this.isFilePreviewModalOpen,
          file: this.previewFile
        },
        {
          onClose: this.handleFilePreviewModalClose.bind(this)
        }
      )}
    `;
  }

  private renderModuleSelectedDisplay() {
    const count = this.selectedModules.length;
    
    if (count === 0) {
      return html`<span class="module-display-placeholder">${this.moduleSelectionLabel}</span>`;
    }
    
    if (count === 1) {
      const module = this.modules.find(m => m.id === this.selectedModules[0]);
      return html`
        <span class="module-display-single">
          ${module?.icon ? html`<nr-icon name="${module.icon}" size="small"></nr-icon>` : nothing}
          ${module?.name || this.selectedModules[0]}
        </span>
      `;
    }
    
    return html`
      <span class="module-display-multiple">
        ${count} ${msg('modules selected')}
      </span>
    `;
  }

  private toggleThreadSidebar = () => {
    this.isThreadSidebarOpen = !this.isThreadSidebarOpen;
  }

  private handleContentEditableInput(e: Event) {
    const target = e.target as HTMLElement;
    const input = target.textContent || '';
    this.currentInput = input;
    this.dispatchEventWithMetadata('nr-chatbot-input-changed', { metadata: { value: input } });
  }

  private handleInputFocus(e: FocusEvent) {
    this.focused = true;
    this.dispatchEventWithMetadata('nr-chatbot-input-focused', { metadata: { event: e } });
  }

  private handleInputBlur(e: FocusEvent) {
    this.focused = false;
    this.dispatchEventWithMetadata('nr-chatbot-input-blurred', { metadata: { event: e } });
  }

  private clearInput() {
    this.currentInput = EMPTY_STRING;
    const inputElement = this.shadowRoot?.querySelector('.input-box__input') as HTMLElement;
    if (inputElement) {
      inputElement.textContent = '';
    }
  }

  /**
   * Focus the input element (called by controller via UI callback)
   */
  public focusInput() {
    const inputElement = this.shadowRoot?.querySelector('.input-box__input') as HTMLElement;
    if (inputElement) {
      inputElement.focus();
    }
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.handleSendMessage();
    }
  }

  private handleSendMessage() {
    if (!this.currentInput.trim() || this.disabled) return;

    if (!this.controller) {
      console.warn('nr-chatbot: No controller is attached; message will not be sent.');
      return;
    }

    // Use controller to send message
    const filesToAttach = this.uploadedFiles && this.uploadedFiles.length > 0 ? [...this.uploadedFiles] : undefined;
    this.controller.sendMessage(this.currentInput.trim(), {
      files: filesToAttach,
      metadata: {
        selectedModules: this.selectedModules
      }
    });
    // Clear uploaded files from input context after sending
    if (filesToAttach && filesToAttach.length > 0) {
      try {
        this.controller.clearFiles();
      } catch {}
    }
    
    this.clearInput();
    this.chatStarted = true;
    
    this.dispatchEventWithMetadata('nr-chatbot-message-sent', { 
      metadata: { text: this.currentInput } 
    });
  }

  private handleStopQuery() {
    try {
      this.controller?.stop();
    } catch (e) {
      console.warn('nr-chatbot: stop failed', e);
    }
    
    this.dispatchEventWithMetadata('nr-chatbot-query-stopped', { 
      metadata: { action: 'stop' }
    });
  }

  private handleRetry(message: ChatbotMessage) {
    if (message.text) {
      this.currentInput = message.text;
      this.handleSendMessage();
    }
  }

  private handleCopyMessage(message: ChatbotMessage) {
    if (navigator.clipboard && message.text) {
      navigator.clipboard.writeText(message.text).then(() => {
        this.dispatchEventWithMetadata('nr-chatbot-message-copied', {
          metadata: { messageId: message.id }
        });
      });
    }
  }

  private handleSuggestionClick(suggestion: ChatbotSuggestion) {
    this.currentInput = suggestion.text;
    this.handleSendMessage();
    
    this.dispatchEventWithMetadata('nr-chatbot-suggestion-clicked', {
      metadata: { suggestion }
    });
  }

  private handleModuleSelectionChange(e: CustomEvent) {
    const selectedValues = e.detail.value as string[];
    this.selectedModules = selectedValues;
    
    this.dispatchEventWithMetadata('nr-chatbot-modules-selected', {
      metadata: { modules: selectedValues }
    });
  }

  private handleFileDropdownClick(e: CustomEvent) {
    const item = e.detail.item;
    const itemId = item.id;
    
    if (itemId === 'upload-file') {
      this.openFileDialog();
    } else if (itemId === 'upload-url') {
      this.openUrlModal();
    }
  }

  private openFileDialog() {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    // Accept common file types
    input.accept = 'image/*,application/pdf,text/*,video/*,audio/*';
    
    input.addEventListener('change', async (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const filesArray = Array.from(target.files);
        await this.controller?.uploadFiles(filesArray);
      }
    });
    
    input.click();
  }

  private openUrlModal() {
    this.isUrlModalOpen = true;
    this.urlInput = '';
    this.urlModalError = '';
    this.selectedUrlFileName = '';
  }

  private handleUrlModalClose() {
    this.isUrlModalOpen = false;
    this.urlInput = '';
    this.urlModalError = '';
    this.isUrlLoading = false;
    this.selectedUrlFileName = '';
  }

  private handleUrlInputChange(e: Event) {
    const target = e.target as HTMLInputElement;
    this.urlInput = target.value;
    this.urlModalError = '';
  }

  private handleUrlInputKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.handleUrlAttachFile();
    }
  }

  private handleUrlConfirm() {
    this.handleUrlModalClose();
  }

  private async handleUrlAttachFile() {
    if (!this.urlInput.trim()) {
      this.urlModalError = 'Please enter a URL';
      return;
    }

    this.isUrlLoading = true;
    this.urlModalError = '';

    try {
      const response = await fetch(this.urlInput);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }

      const blob = await response.blob();
      const filename = this.urlInput.split('/').pop() || 'downloaded-file';
      const file = new File([blob], filename, { type: blob.type });

      this.selectedUrlFileName = filename;
      
      // Upload the file through the controller
      if (this.controller) {
        await this.controller.uploadFiles([file]);
      }

      this.isUrlLoading = false;
      
      // Close modal after short delay to show success
      setTimeout(() => {
        this.handleUrlModalClose();
      }, 1000);
    } catch (error) {
      this.isUrlLoading = false;
      this.urlModalError = error instanceof Error ? error.message : 'Failed to load file from URL';
    }
  }

  private handleFileRemove(fileId: string) {
    this.controller?.removeFile(fileId);
  }

  private handleFilePreview(file: ChatbotFile) {
    this.previewFile = file;
    this.isFilePreviewModalOpen = true;
  }

  private handleFilePreviewModalClose() {
    this.isFilePreviewModalOpen = false;
    this.previewFile = null;
  }

  /**
   * Public API: Add a message to the chat
   */
  addMessage(message: Partial<ChatbotMessage>): ChatbotMessage {
    const fullMessage: ChatbotMessage = {
      id: message.id || `msg-${Date.now()}`,
      sender: message.sender || ChatbotSender.User,
      text: message.text || '',
      timestamp: message.timestamp || new Date().toISOString(),
      ...message
    };
    
    this.controller?.addMessage(fullMessage);
    this.chatStarted = true;
    
    return fullMessage;
  }

  /**
   * Public API: Clear all messages
   */
  clearMessages() {
    this.messages = [];
    this.chatStarted = false;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'nr-chatbot': NrChatbotElement;
  }
}
