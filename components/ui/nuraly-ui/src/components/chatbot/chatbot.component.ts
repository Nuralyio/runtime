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
import { NuralyUIBaseMixin } from '../../shared/base-mixin.js';

import {
  ChatbotMessage,
  ChatbotSuggestion,
  ChatbotSender,
  ChatbotSize,
  ChatbotVariant,
  ChatbotLoadingType,
  ChatbotConfig,
  ChatbotEventDetail,
  ChatbotFile,
  ChatbotThread,
  ChatbotModule,
  EMPTY_STRING
} from './chatbot.types.js';

import { DropdownItem } from '../dropdown/dropdown.types.js';

import { SelectOption } from '../select/select.types.js';

import {
  renderChatbotMain,
  ChatbotMainTemplateData,
  ChatbotMainTemplateHandlers
} from './templates/index.js';

import {
  ChatbotMessageController,
  ChatbotKeyboardController,
  ChatbotSuggestionController,
  ChatbotMessageControllerHost,
  ChatbotKeyboardControllerHost,
  ChatbotSuggestionControllerHost,
  ChatbotThreadController,
  ChatbotThreadControllerHost,
  ChatbotModuleController,
  ChatbotModuleControllerHost,
  ChatbotFileUploadController,
  ChatbotFileUploadControllerHost
} from './controllers/index.js';

/**
 * Enhanced chatbot component with ChatGPT-like features including file upload, 
 * conversation threads, module selection, and modern AI assistant capabilities.
 * 
 * @example
 * ```html
 * <nr-chatbot 
 *   .messages=${messages}
 *   .suggestions=${suggestions}
 *   .threads=${threads}
 *   .modules=${modules}
 *   .selectedModules=${selectedModuleIds}
 *   enableFileUpload
 *   enableModuleSelection
 *   mode="assistant"
 *   isRTL
 *   size="medium"
 *   variant="rounded">
 * </nr-chatbot>
 * ```
 * 
 * @example Bot message with suggestions
 * ```javascript
 * chatbot.addMessage({
 *   sender: 'bot',
 *   text: 'How can I help you today?',
 *   timestamp: new Date().toLocaleTimeString(),
 *   suggestions: [
 *     { id: '1', text: 'Check status', icon: 'search' },
 *     { id: '2', text: 'Get help', icon: 'help' },
 *     { id: '3', text: 'Contact support', icon: 'email' }
 *   ]
 * });
 * ```
 * 
 * @fires nr-chatbot-message-sent - Message sent by user
 * @fires nr-chatbot-suggestion-clicked - Suggestion selected
 * @fires nr-chatbot-retry-requested - Retry requested for failed message
 * @fires nr-chatbot-input-changed - Input value changed
 * @fires nr-chatbot-file-uploaded - File uploaded successfully
 * @fires nr-chatbot-file-error - File upload error
 * @fires nr-chatbot-thread-created - New conversation thread created
 * @fires nr-chatbot-thread-selected - Thread selected
 * @fires nr-chatbot-modules-selected - Module selection changed
 * @fires nr-chatbot-query-stopped - Query stopped by user
 * 
 * @slot header - Custom header content
 * @slot footer - Custom footer content
 * @slot empty-state - Content shown when no messages
 * @slot thread-sidebar - Custom thread sidebar content
 * @slot module-selected-display - Custom display for selected modules (when enableModuleSelection is true)
 */
@localized()
@customElement('nr-chatbot')
export class NrChatbotElement extends NuralyUIBaseMixin(LitElement) 
  implements ChatbotMessageControllerHost, ChatbotKeyboardControllerHost, 
             ChatbotSuggestionControllerHost, ChatbotFileUploadControllerHost, ChatbotThreadControllerHost, ChatbotModuleControllerHost {
  static override styles = styles;
    override requiredComponents = ['nr-input', 'nr-button', 'nr-icon', 'nr-dropdown', 'nr-select', 'nr-modal'];

  // Controllers
  private messageController = new ChatbotMessageController(this);
  private keyboardController = new ChatbotKeyboardController(this);
  private suggestionController = new ChatbotSuggestionController(this);
  private fileUploadController = new ChatbotFileUploadController(this);
  private threadController = new ChatbotThreadController(this);
  private moduleController = new ChatbotModuleController(this);

  /** Array of chat messages */
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

  /** Chatbot configuration */
  @property({type: Object})
  config: ChatbotConfig = {};

  /** Custom placeholder text */
  @property({type: String})
  placeholder = msg('Type your message...');

  /** Show send button */
  @property({type: Boolean})
  showSendButton = true;

  /** Auto-scroll to new messages */
  @property({type: Boolean})
  autoScroll = true;

  /** Enable file upload functionality */
  @property({type: Boolean})
  enableFileUpload = false;

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

  /** Maximum number of files that can be uploaded */
  @property({type: Number})
  maxFiles = 5;

  /** Maximum file size in bytes */
  @property({type: Number})
  maxFileSize = 10 * 1024 * 1024; // 10MB

  /** Allowed file types */
  @property({type: Array})
  allowedFileTypes: string[] = [
    'image/*', 
    'text/*', 
    'application/pdf',
    'application/json',
    'application/javascript'
  ];

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

  @state() private focused = false;
  @state() private showFileUploadArea = false;
  @state() private dragOver = false;
  @state() private showUrlModal = false;
  @state() private urlInputValue: string = '';
  @state() private urlInputValid: boolean = false;
  @state() private urlModalLoading: boolean = false;
  @state() private urlModalError: string = '';
  @state() private urlModalSelectedFile: File | null = null;
  @state() private urlModalSelectedFileName: string = '';
  @state() private isThreadSidebarOpen: boolean = true; // Control sidebar visibility
  
  /** File upload dropdown options */
  private get fileUploadItems(): DropdownItem[] {
    return [
      {
        id: 'from-computer',
        label: 'From computer',
        icon: 'folder-open',
        value: 'computer'
      },
      {
        id: 'from-url',
        label: 'From URL',
        icon: 'link',
        value: 'url'
      }
    ];
  }

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
        uploadedFiles: this.fileUploadController.getUploadedFiles(),
        isQueryRunning: this.isQueryRunning,
        showSendButton: this.showSendButton,
        enableFileUpload: this.enableFileUpload,
        fileUploadItems: this.fileUploadItems,
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
      isDragging: this.dragOver,
      urlModal: this.showUrlModal ? {
        isOpen: this.showUrlModal,
        urlInput: this.urlInputValue,
        isLoading: this.urlModalLoading,
        error: this.urlModalError,
        selectedFileName: this.urlModalSelectedFileName
      } : undefined
    };

    const templateHandlers: ChatbotMainTemplateHandlers = {
      message: {
        onRetry: this.handleRetry.bind(this),
        onRetryKeydown: this.handleRetryKeydown.bind(this)
      },
      suggestion: {
        onClick: this.handleSuggestionClick.bind(this),
        onKeydown: this.handleSuggestionKeydown.bind(this)
      },
      inputBox: {
        onInput: this.handleContentEditableInput.bind(this),
        onKeydown: this.handleKeyDown.bind(this),
        onFocus: this.handleInputFocus.bind(this),
        onBlur: this.handleInputBlur.bind(this),
        onSend: this.handleSendMessage.bind(this),
        onStop: this.handleStopQuery.bind(this),
        onSendKeydown: this.handleSendKeydown.bind(this),
        onFileDropdownClick: this.handleFileUploadDropdownClick.bind(this),
        onModuleChange: this.handleModuleSelectionChange.bind(this),
        onFileRemove: (fileId: string) => this.fileUploadController.removeFile(fileId)
      },
      threadSidebar: this.showThreads ? {
        onCreateNew: () => this.threadController.createNewThreadAndSelect(),
        onSelectThread: (threadId: string) => this.threadController.selectThread(threadId)
      } : undefined,
      fileUploadArea: {
        onDrop: this.handleDrop.bind(this),
        onDragOver: this.handleDragOver.bind(this),
        onDragLeave: () => { this.dragOver = false; }
      },
      urlModal: this.showUrlModal ? {
        onClose: this.closeUrlModal.bind(this),
        onUrlInputChange: (e: Event) => this.onUrlInputChange(e as CustomEvent),
        onUrlInputKeydown: (e: KeyboardEvent) => {
          if (e.key === 'Enter') {
            this.onUrlInputEnter();
          }
        },
        onConfirm: this.confirmUrlModal.bind(this),
        onAttachFile: this.handleAttachFileClick.bind(this)
      } : undefined,
      onToggleThreadSidebar: this.showThreads ? this.toggleThreadSidebar : undefined
    };

    return html`
      <div 
        class="chat-container ${classMap({
          'chat-container--with-threads': this.showThreads,
          'chat-container--disabled': this.disabled,
          'chat-container--focused': this.focused,
          'chat-container--drag-over': this.dragOver,
          'chat-container--boxed': this.boxed
        })}" 
        dir=${this.isRTL ? 'rtl' : 'ltr'}
        data-size="${this.size}"
        data-variant="${this.variant}"
        data-theme="${this.currentTheme}"
        data-mode="${this.mode}"
        part="chat-container"
        @dragover=${this.handleDragOver}
        @dragleave=${this.handleDragLeave}
        @drop=${this.handleDrop}>
        
        ${renderChatbotMain(templateData, templateHandlers)}
      </div>
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

  override updated(changedProperties: Map<string | number | symbol, unknown>): void {
    super.updated(changedProperties);
    if (changedProperties.has('messages') && this.autoScroll) {
      this.scrollToBottom();
    }
  }

  private scrollToBottom() {
    const messagesContainer = this.shadowRoot?.querySelector('.messages');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
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

  private handleKeyDown(e: KeyboardEvent) {
    this.keyboardController.handleInputKeydown(e);
  }

  private handleSendKeydown(e: KeyboardEvent) {
    this.keyboardController.handleElementKeydown(e, () => this.handleSendMessage());
  }

  private handleRetryKeydown(e: KeyboardEvent) {
    this.keyboardController.handleElementKeydown(e, () => {
      const target = e.target as HTMLElement;
      target.click();
    });
  }

  private handleSuggestionKeydown(e: KeyboardEvent) {
    this.keyboardController.handleElementKeydown(e, () => {
      const target = e.target as HTMLElement;
      target.click();
    });
  }

  private handleSendMessage() {
    if ((!this.currentInput.trim() && this.fileUploadController.getUploadedFiles().length === 0) || this.disabled) return;

    const uploadedFiles = this.fileUploadController.getUploadedFiles();
    const messageData = {
      sender: ChatbotSender.User,
      text: this.currentInput.trim(),
      timestamp: new Date().toLocaleTimeString(),
      files: uploadedFiles.length > 0 ? uploadedFiles : undefined
    };

    const message = this.messageController.addMessage(messageData);
    
    this.clearInput();
    this.fileUploadController.clearFiles();
    
    this.chatStarted = this.messageController.hasChatStarted();
    this.isQueryRunning = true;

    const messageDetail: ChatbotEventDetail = { message };
  this.dispatchEventWithMetadata('nr-chatbot-message-sent', messageDetail);
  }

  private handleStopQuery() {
    this.isQueryRunning = false;
    this.isBotTyping = false;
    
    this.dispatchEventWithMetadata('nr-chatbot-query-stopped', { 
      metadata: { action: 'stop' }
    });
  }

  private handleDragOver(e: DragEvent) {
    if (!this.enableFileUpload) return;
    
    e.preventDefault();
    e.stopPropagation();
    this.dragOver = true;
    this.showFileUploadArea = true;
  }

  private handleDragLeave(e: DragEvent) {
    if (!this.enableFileUpload) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const { clientX, clientY } = e;
    
    if (clientX < rect.left || clientX > rect.right || 
        clientY < rect.top || clientY > rect.bottom) {
      this.dragOver = false;
      this.showFileUploadArea = false;
    }
  }

  private handleDrop(e: DragEvent) {
    if (!this.enableFileUpload) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    this.dragOver = false;
    this.showFileUploadArea = false;
    
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      this.fileUploadController.handleFileSelection(files);
    }
  }

  private handleFileUploadDropdownClick(event: CustomEvent) {
    const detail = event.detail;
    if (detail.item) {
      switch (detail.item.value) {
        case 'computer':
          this.fileUploadController.openFileDialog();
          break;
        case 'url':
          this.openUrlModal();
          break;
      }
    }
  }

  private openUrlModal() {
    this.urlInputValue = '';
    this.urlInputValid = false;
    this.urlModalLoading = false;
    this.urlModalError = '';
    this.urlModalSelectedFile = null;
    this.urlModalSelectedFileName = '';
    this.showUrlModal = true;
  }

  private closeUrlModal = () => {
    if (this.urlModalLoading) return; // Don't close while loading
    this.showUrlModal = false;
    this.urlModalError = '';
    this.urlModalSelectedFile = null;
    this.urlModalSelectedFileName = '';
  };

  private onUrlInputChange = (e: CustomEvent) => {
    const value = (e.detail && e.detail.value) ?? '';
    this.urlInputValue = value;
    this.urlInputValid = this.isValidHttpUrl(value);
    this.urlModalError = ''; // Clear error on input change
  };

  private onUrlInputEnter = () => {
    if ((this.urlInputValid || this.urlModalSelectedFile) && !this.urlModalLoading) {
      this.confirmUrlModal();
    }
  };

  private handleAttachFileClick = async () => {
    // Attach button should load file from URL and create File object
    if (this.urlModalLoading) return;
    
    // Validate URL first
    if (!this.urlInputValid) {
      this.urlModalError = 'Please enter a valid URL.';
      return;
    }
    
    const url = this.urlInputValue.trim();
    this.urlModalLoading = true;
    this.urlModalError = '';
    
    try {
      // Fetch the file from URL and create File object
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }

      // Get the blob and create File object
      const blob = await response.blob();
      const filename = decodeURIComponent(new URL(url).pathname.split('/').pop() || 'file');
      const contentType = response.headers.get('content-type') || 'application/octet-stream';
      const file = new File([blob], filename, { type: contentType });

      // Store the file object
      this.urlModalSelectedFile = file;
      this.urlModalSelectedFileName = file.name;
      this.urlModalLoading = false;
      
      // Show success message via the selectedFileName state
    } catch (error) {
      this.urlModalLoading = false;
      this.urlModalError = error instanceof Error ? error.message : 'Failed to load file from URL.';
    }
  };

  private confirmUrlModal = async () => {
    if (this.urlModalLoading) return;
    
    // Check if we have a loaded file
    if (!this.urlModalSelectedFile) return;
    
    this.urlModalLoading = true;
    this.urlModalError = '';
    
    try {
      // Add the already-loaded file to the chatbot
      const result = await this.fileUploadController.handleFileSelection([this.urlModalSelectedFile]);
      
      if (result && result.length > 0) {
        // Success - close modal
        this.urlModalLoading = false;
        this.closeUrlModal();
      } else {
        // Failed but no exception thrown
        this.urlModalLoading = false;
        this.urlModalError = 'Failed to add file. Please try again.';
      }
    } catch (error) {
      this.urlModalLoading = false;
      this.urlModalError = error instanceof Error ? error.message : 'An error occurred while adding the file.';
    }
  };

  private isValidHttpUrl(value: string): boolean {
    try {
      const u = new URL(value);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private handleModuleSelectionChange(event: CustomEvent) {
    const detail = event.detail;
    const selectedValues = Array.isArray(detail.value) ? detail.value : [detail.value];
    
    this.moduleController.handleModuleSelectionChange(selectedValues);
  }

  private toggleThreadSidebar = () => {
    this.isThreadSidebarOpen = !this.isThreadSidebarOpen;
  };

  private handleRetry(message: ChatbotMessage) {
    const eventDetail: ChatbotEventDetail = {
      message,
      metadata: { action: 'retry' }
    };
    
  this.dispatchEventWithMetadata('nr-chatbot-retry-requested', eventDetail);
  }

  private handleSuggestionClick(suggestion: ChatbotSuggestion) {
    this.suggestionController.handleSuggestionClick(suggestion);
  }

  /**
   * Programmatically send a message
   */
  public sendMessage(text: string): void {
    this.currentInput = text;
    this.handleSendMessage();
    this.clearInput();
  }

  /**
   * Clear all messages
   */
  public clearMessages(): void {
    this.messageController.clearMessages();
    this.chatStarted = false;
  }

  /**
   * Add a message programmatically
   */
  public addMessage(message: Omit<ChatbotMessage, 'id'>): ChatbotMessage {
    const newMessage = this.messageController.addMessage(message);
    
    if (message.sender === ChatbotSender.User) {
      this.chatStarted = true;
    }
    
    return newMessage;
  }

  /**
   * Set typing indicator
   */
  public setTyping(isTyping: boolean): void {
    this.isBotTyping = isTyping;
    if (!isTyping) {
      this.isQueryRunning = false;
    }
  }

  /**
   * Set query running state
   */
  public setQueryRunning(isRunning: boolean): void {
    this.isQueryRunning = isRunning;
    if (!isRunning) {
      this.isBotTyping = false;
    }
  }

  /**
   * Focus the input
   */
  public focusInput(): void {
    const input = this.shadowRoot?.querySelector('nr-input') as any;
    if (input && input.focusInput) {
      input.focusInput();
    }
  }

  /**
   * Add validation rule
   */
  public addValidationRule(rule: any): void {
    this.messageController.addValidationRule(rule);
  }

  /**
   * Remove validation rule
   */
  public removeValidationRule(ruleId: string): void {
    this.messageController.removeValidationRule(ruleId);
  }

  /**
   * Validate message
   */
  public async validateMessage(text: string): Promise<any> {
    return this.messageController.validateMessage(text);
  }

  /**
   * Add keyboard shortcut
   */
  public addKeyboardShortcut(key: string, handler: () => void): void {
    this.keyboardController.addShortcut(key, handler);
  }

  /**
   * Get message history
   */
  public getMessageHistory(): ChatbotMessage[] {
    return this.messageController.getMessageHistory();
  }

  /**
   * Upload files programmatically
   */
  public uploadFiles(files: FileList | File[]): Promise<ChatbotFile[]> {
    return this.fileUploadController.handleFileSelection(files);
  }

  /**
   * Get uploaded files
   */
  public getUploadedFiles(): ChatbotFile[] {
    return this.fileUploadController.getUploadedFiles();
  }

  /**
   * Clear uploaded files
   */
  public clearUploadedFiles(): void {
    this.fileUploadController.clearFiles();
  }

  /**
   * Create new conversation thread
   */
  public createThread(title?: string): ChatbotThread {
    return this.threadController.createThread(title);
  }

  /**
   * Switch to a specific thread
   */
  public switchToThread(threadId: string): void {
    this.threadController.selectThread(threadId);
  }

  /**
   * Delete a thread
   */
  public deleteThread(threadId: string): void {
    this.threadController.deleteThread(threadId);
  }

  /**
   * Get current thread
   */
  public getCurrentThread(): ChatbotThread | undefined {
    return this.threadController.getCurrentThread();
  }

  /**
   * Set file upload configuration
   */
  public setFileUploadConfig(config: {
    maxFiles?: number;
    maxFileSize?: number;
    allowedFileTypes?: string[];
    enableFileUpload?: boolean;
  }): void {
    if (config.maxFiles !== undefined) this.maxFiles = config.maxFiles;
    if (config.maxFileSize !== undefined) this.maxFileSize = config.maxFileSize;
    if (config.allowedFileTypes !== undefined) this.allowedFileTypes = config.allowedFileTypes;
    if (config.enableFileUpload !== undefined) this.enableFileUpload = config.enableFileUpload;
  }

  /**
   * Toggle file upload area visibility
   */
  public toggleFileUploadArea(visible?: boolean): void {
    this.showFileUploadArea = visible !== undefined ? visible : !this.showFileUploadArea;
  }

  /**
   * Set available modules
   */
  public setModules(modules: ChatbotModule[]): void {
    this.moduleController.setModules(modules);
  }

  /**
   * Get selected modules
   */
  public getSelectedModules(): ChatbotModule[] {
    return this.moduleController.getSelectedModules();
  }

  /**
   * Set selected modules
   */
  public setSelectedModules(moduleIds: string[]): void {
    this.moduleController.setSelectedModules(moduleIds);
  }

  /**
   * Clear module selection
   */
  public clearModuleSelection(): void {
    this.moduleController.clearModuleSelection();
  }

  /**
   * Toggle module selection
   */
  public toggleModule(moduleId: string): void {
    this.moduleController.toggleModule(moduleId);
  }

  /**
   * Dispatch event with metadata support
   */
  public override dispatchEventWithMetadata(type: string, detail?: ChatbotEventDetail): void {
    this.dispatchEvent(new CustomEvent(type, {
      detail,
      bubbles: true,
      composed: true
    }));
  }
}