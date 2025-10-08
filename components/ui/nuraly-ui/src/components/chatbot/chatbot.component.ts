/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { repeat } from 'lit/directives/repeat.js';
import { localized, msg } from '@lit/localize';

import styles from './chatbot.style.js';
import { NuralyUIBaseMixin } from '../../shared/base-mixin.js';

// Import required components
import '../input/input.component.js';
import '../button/button.component.js';
import '../icon/icon.component.js';
import '../dropdown/dropdown.component.js';
import '../select/select.component.js';

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
  ChatbotFileType,
  ChatbotThread,
  ChatbotModule,
  EMPTY_STRING
} from './chatbot.types.js';

// Import dropdown types
import { DropdownItem } from '../dropdown/dropdown.types.js';

// Import select types
import { SelectOption } from '../select/select.types.js';

// Import controllers
import {
  ChatbotMessageController,
  ChatbotKeyboardController,
  ChatbotSuggestionController,
  ChatbotMessageControllerHost,
  ChatbotKeyboardControllerHost,
  ChatbotSuggestionControllerHost
} from './controllers/index.js';
import {
  ChatbotFileUploadController,
  ChatbotFileUploadControllerHost
} from './controllers/chatbot-file-upload.controller.js';

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
 * @fires chatbot-message-sent - Message sent by user
 * @fires chatbot-suggestion-clicked - Suggestion selected
 * @fires chatbot-retry-requested - Retry requested for failed message
 * @fires chatbot-input-changed - Input value changed
 * @fires chatbot-file-uploaded - File uploaded successfully
 * @fires chatbot-file-error - File upload error
 * @fires chatbot-thread-created - New conversation thread created
 * @fires chatbot-thread-selected - Thread selected
 * @fires chatbot-modules-selected - Module selection changed
 * @fires chatbot-query-stopped - Query stopped by user
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
             ChatbotSuggestionControllerHost, ChatbotFileUploadControllerHost {
  static override styles = styles;
    override requiredComponents = ['nr-input', 'nr-button', 'nr-icon', 'nr-dropdown', 'nr-select'];

  // Controllers
  private messageController = new ChatbotMessageController(this);
  private keyboardController = new ChatbotKeyboardController(this);
  private suggestionController = new ChatbotSuggestionController(this);
  private fileUploadController = new ChatbotFileUploadController(this);

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
  @property({type: Boolean})
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
        
        ${this.showThreads ? this.renderThreadSidebar() : nothing}
        
        <div class="chat-box" part="chat-box">
          <slot name="header"></slot>
          ${this.renderMessages()}
          ${this.enableFileUpload ? this.renderFileUploadArea() : nothing}
          ${this.renderInputBox()}
          <slot name="footer"></slot>
        </div>
      </div>
    `;
  }

  private renderMessages() {
    return html`
      <div class="messages" part="messages">
        ${this.messages.length === 0 ? this.renderEmptyState() : nothing}
        ${this.messages.map((message) => this.renderMessage(message))}
        ${this.renderSuggestions()}
        ${this.renderBotTypingIndicator()}
      </div>
    `;
  }

  private renderEmptyState() {
    return html`
      <div class="empty-state" part="empty-state">
        <slot name="empty-state">
          <div class="empty-state__content">
            ${msg('Start a conversation')}
          </div>
        </slot>
      </div>
    `;
  }

  private renderMessage(message: ChatbotMessage) {
    const messageClasses = {
      error: !!message.error,
      introduction: !!message.introduction,
      [message.sender]: true,
    };

    return html`
      <div
        class="message ${classMap(messageClasses)}"
        part="message"
        data-sender="${message.sender}"
        data-id="${message.id}"
      >
        <div class="message__content" part="message-content">
          ${message.text}
        </div>
        <div class="message__timestamp" part="message-timestamp">
          ${message.timestamp}
        </div>
        ${message.error
          ? html`
            <nr-button 
              type="secondary"
              size="small"
              class="message__retry" 
              part="retry-button"
              @click=${() => this.handleRetry(message)}
              @keydown=${this.handleRetryKeydown}
              aria-label="${msg('Retry message')}"
            >
              ${msg('Retry')}
            </nr-button>`
          : nothing}
      </div>
    `;
  }

  private renderSuggestions() {
    return !this.chatStarted && this.suggestions.length
      ? html`
          <div class="suggestion-container" part="suggestions">
            ${this.suggestions.map((suggestion) =>
              this.renderSuggestion(suggestion)
            )}
          </div>
        `
      : nothing;
  }

  private renderSuggestion(suggestion: ChatbotSuggestion) {
    return html`
      <div 
        class="suggestion ${classMap({ 'suggestion--disabled': !suggestion.enabled })}" 
        part="suggestion"
        role="button"
        tabindex="0"
        @click=${() => this.handleSuggestionClick(suggestion)}
        @keydown=${this.handleSuggestionKeydown}
        data-id="${suggestion.id}"
        aria-label="${msg('Select suggestion: ')}${suggestion.text}"
      >
        ${suggestion.text}
      </div>
    `;
  }

  private renderBotTypingIndicator() {
    if (!this.isBotTyping) return nothing;

    const indicatorContent = this.loadingIndicator === ChatbotLoadingType.Dots
      ? html`
          <div class="dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        `
      : html`<div class="spinner"></div>`;

    return html`
      <div class="message bot loading" part="typing-indicator">
        <div class="message__content">
          ${indicatorContent}
          <span class="loading-text">${this.loadingText}</span>
        </div>
      </div>
    `;
  }

  private renderInputBox() {
    const uploadedFiles = this.fileUploadController.getUploadedFiles();
    
    return html`
      <div class="input-box" part="input-box">
        ${uploadedFiles.length > 0 ? this.renderUploadedFiles(uploadedFiles) : nothing}
        
        <!-- ChatGPT-style input container with buttons in second row -->
        <div class="input-container">
          <!-- First row: Text input area -->
          <div class="input-row">
            <div
              class="input-box__input"
              part="input"
              contenteditable="true"
              role="textbox"
              aria-multiline="true"
              aria-label="${msg('Chat input')}"
              data-placeholder="${this.placeholder}"
              @input=${this.handleContentEditableInput}
              @keydown=${this.handleKeyDown}
              @focus=${this.handleInputFocus}
              @blur=${this.handleInputBlur}
            ></div>
          </div>
          
          <!-- Second row: Action buttons with left and right sections -->
          <div class="action-buttons-row">
            <!-- Left side buttons -->
            <div class="action-buttons-left">
              ${this.enableFileUpload ? html`
                <nr-dropdown 
                  .items=${this.fileUploadItems}
                  trigger="click"
                  placement="top-start"
                  size="medium"
                  ?disabled=${this.disabled}
                  @nr-dropdown-item-click=${this.handleFileUploadDropdownClick}
                >
                  <nr-button 
                    slot="trigger"
                    part="file-button"
                    type="default"
                    .icon=${["upload"]}
                    ?disabled=${this.disabled}
                    aria-label="${msg('Attach files')}"
                    title="${msg('Attach files')}"
                  >
                  Attach
                  </nr-button>
                </nr-dropdown>
              ` : nothing}
              
              ${this.enableModuleSelection && this.modules.length > 0 ? html`
                <nr-select
                  .options=${this.moduleSelectOptions}
                  .value=${this.selectedModules}
                  multiple
                  placeholder="${this.moduleSelectionLabel}"
                  size="medium"
                  ?disabled=${this.disabled}
                  searchable
                  search-placeholder="${msg('Search modules...')}"
                  use-custom-selected-display
                  part="module-select"
                  class="module-select"
                  @nr-change=${this.handleModuleSelectionChange}
                  aria-label="${msg('Select modules')}"
                >
                  <span slot="selected-display">
                    ${this.renderModuleSelectedDisplay()}
                  </span>
                </nr-select>
              ` : nothing}
            </div>
            
            <!-- Right side buttons -->
            <div class="action-buttons-right">
              ${this.showSendButton && !this.disabled && (this.currentInput.trim() || uploadedFiles.length > 0 || this.isQueryRunning) ? html`
                <nr-button 
                  class="input-box__send-button" 
                  part="send-button"
                  type="default"
                  .iconRight=${this.isQueryRunning ? 'stop' : 'arrow-up'}
                  @click=${this.isQueryRunning ? this.handleStopQuery : this.handleSendMessage}
                  @keydown=${this.handleSendKeydown}
                  aria-label="${this.isQueryRunning ? msg('Stop query') : msg('Send message')}"
                  title="${this.isQueryRunning ? msg('Stop query') : msg('Send message')}"
                >
                Send
                </nr-button>
              ` : nothing}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private renderThreadSidebar() {
    return html`
      <div class="thread-sidebar" part="thread-sidebar">
        <div class="thread-sidebar__header">
          <h3>${msg('Conversations')}</h3>
          <nr-button 
            type="default"
            size="small"
            @click=${this.createNewThread}
            aria-label="${msg('New conversation')}"
          >
            <nr-icon name="add" size="16"></nr-icon>
          </nr-button>
        </div>
        
        <div class="thread-list">
          ${repeat(this.threads, thread => thread.id, thread => html`
            <div 
              class="thread-item ${classMap({ 
                'thread-item--active': thread.id === this.activeThreadId 
              })}"
              @click=${() => this.selectThread(thread.id)}
              part="thread-item"
            >
              <div class="thread-item__title">${thread.title || msg('New Chat')}</div>
              <div class="thread-item__preview">
                ${thread.messages.length > 0 ? thread.messages[thread.messages.length - 1].text : ''}
              </div>
              <div class="thread-item__timestamp">${thread.updatedAt}</div>
            </div>
          `)}
        </div>
        
        <slot name="thread-sidebar"></slot>
      </div>
    `;
  }

  private renderFileUploadArea() {
    return html`
      <div class="file-upload-area ${classMap({
        'file-upload-area--visible': this.showFileUploadArea,
        'file-upload-area--drag-over': this.dragOver
      })}" part="file-upload-area">
        <div class="file-upload-area__content">
          <nr-icon name="cloud-upload" size="48"></nr-icon>
          <p>${msg('Drop files here or click to upload')}</p>
          <p class="file-upload-area__help">
            ${msg('Supported files:')} ${this.allowedFileTypes.join(', ')}
          </p>
          <p class="file-upload-area__help">
            ${msg('Max file size:')} ${this.fileUploadController.formatFileSize(this.maxFileSize)}
          </p>
        </div>
      </div>
    `;
  }

  private renderUploadedFiles(files: ChatbotFile[]) {
    return html`
      <div class="uploaded-files" part="uploaded-files">
        ${repeat(files, file => file.id, file => this.renderUploadedFile(file))}
      </div>
    `;
  }

  private renderUploadedFile(file: ChatbotFile) {
    const progress = this.fileUploadController.getUploadProgress(file.id);
    
    return html`
      <div class="uploaded-file" part="uploaded-file" data-file-type="${file.type}">
        ${file.type === ChatbotFileType.Image && file.previewUrl ? html`
          <img 
            src="${file.previewUrl}" 
            alt="${file.name}"
            class="uploaded-file__preview"
          />
        ` : html`
          <nr-icon 
            name="${this.getFileIcon(file.type)}" 
            size="20"
            class="uploaded-file__icon"
          ></nr-icon>
        `}
        
        <div class="uploaded-file__info">
          <div class="uploaded-file__name">${file.name}</div>
          <div class="uploaded-file__size">
            ${this.fileUploadController.formatFileSize(file.size)}
          </div>
          
          ${progress && progress.status === 'uploading' ? html`
            <div class="uploaded-file__progress">
              <div 
                class="uploaded-file__progress-bar"
                style="width: ${progress.progress}%"
              ></div>
            </div>
          ` : nothing}
          
          ${file.error ? html`
            <div class="uploaded-file__error">${file.error}</div>
          ` : nothing}
        </div>
        
        <nr-button 
          type="ghost"
          size="small"
          class="uploaded-file__remove"
          @click=${() => this.removeFile(file.id)}
          aria-label="${msg('Remove file')}"
        >
          <nr-icon name="close" size="16"></nr-icon>
        </nr-button>
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
    this.dispatchEventWithMetadata('chatbot-input-changed', { metadata: { value: input } });
  }

  private handleInputFocus(e: FocusEvent) {
    this.focused = true;
    this.dispatchEventWithMetadata('chatbot-input-focused', { metadata: { event: e } });
  }

  private handleInputBlur(e: FocusEvent) {
    this.focused = false;
    this.dispatchEventWithMetadata('chatbot-input-blurred', { metadata: { event: e } });
  }

  private clearInput() {
    this.currentInput = EMPTY_STRING;
    // Also clear the contenteditable DOM element
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

    // Use controller to add message
    const message = this.messageController.addMessage(messageData);
    
    // Clear input and files
    this.clearInput();
    this.fileUploadController.clearFiles();
    
    // Update chat started state
    this.chatStarted = this.messageController.hasChatStarted();

    // Start query running state
    this.isQueryRunning = true;

    const messageDetail: ChatbotEventDetail = { message };
    this.dispatchEventWithMetadata('chatbot-message-sent', messageDetail);
  }

  private handleStopQuery() {
    // Stop the running query
    this.isQueryRunning = false;
    this.isBotTyping = false;
    
    this.dispatchEventWithMetadata('chatbot-query-stopped', { 
      metadata: { action: 'stop' }
    });
  }

  // Drag and drop handlers
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
    
    // Only hide if we're actually leaving the component
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

  // File upload handlers
  private handleFileUploadDropdownClick(event: CustomEvent) {
    const detail = event.detail;
    if (detail.item) {
      switch (detail.item.value) {
        case 'computer':
          this.fileUploadController.openFileDialog();
          break;
        case 'url':
          this.handleUrlUpload();
          break;
      }
    }
  }

  private handleUrlUpload() {
    // TODO: Implement URL upload functionality
    // This could open a modal or prompt for URL input
    const url = prompt('Enter file URL:');
    if (url) {
      console.log('Upload from URL:', url);
      // Here you would implement the actual URL upload logic
    }
  }

  // Module selection handlers
  private handleModuleSelectionChange(event: CustomEvent) {
    const detail = event.detail;
    
    // nr-select returns value as string[] for multiple selection
    const selectedValues = Array.isArray(detail.value) ? detail.value : [detail.value];
    this.selectedModules = selectedValues.filter(Boolean);
    
    // Get full module objects for selected modules
    const selectedModuleObjects = this.selectedModules
      .map(id => this.modules.find(m => m.id === id))
      .filter(Boolean) as ChatbotModule[];
    
    // Dispatch event with selected modules
    this.dispatchEventWithMetadata('chatbot-modules-selected', {
      metadata: {
        selectedModules: selectedModuleObjects,
        selectedModuleIds: this.selectedModules,
        event: detail
      }
    });
  }

  private removeFile(fileId: string) {
    this.fileUploadController.removeFile(fileId);
  }

  private getFileIcon(fileType: ChatbotFileType): string {
    switch (fileType) {
      case ChatbotFileType.Image:
        return 'image';
      case ChatbotFileType.Document:
        return 'document';
      case ChatbotFileType.Code:
        return 'code';
      case ChatbotFileType.Archive:
        return 'archive';
      case ChatbotFileType.Audio:
        return 'volume-up';
      case ChatbotFileType.Video:
        return 'video';
      default:
        return 'document-unknown';
    }
  }

  // Thread management
  private createNewThread() {
    const newThread: ChatbotThread = {
      id: `thread_${Date.now()}`,
      title: msg('New Chat'),
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.threads = [...this.threads, newThread];
    this.selectThread(newThread.id);
    
    this.dispatchEventWithMetadata('chatbot-thread-created', { 
      metadata: { thread: newThread }
    });
  }

  private selectThread(threadId: string) {
    this.activeThreadId = threadId;
    const thread = this.threads.find(t => t.id === threadId);
    
    if (thread) {
      this.messages = [...thread.messages];
      this.chatStarted = thread.messages.length > 0;
      
      this.dispatchEventWithMetadata('chatbot-thread-selected', { 
        metadata: { thread, threadId }
      });
    }
  }

  private handleRetry(message: ChatbotMessage) {
    const eventDetail: ChatbotEventDetail = {
      message,
      metadata: { action: 'retry' }
    };
    
    this.dispatchEventWithMetadata('chatbot-retry-requested', eventDetail);
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
    
    // When bot starts typing, we're still running a query
    // When bot stops typing, the query is complete
    if (!isTyping) {
      this.isQueryRunning = false;
    }
  }

  /**
   * Set query running state
   */
  public setQueryRunning(isRunning: boolean): void {
    this.isQueryRunning = isRunning;
    
    // If we stop the query, also stop typing
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
   * Add suggestion category
   */
  public addSuggestionCategory(categoryId: string, suggestions: ChatbotSuggestion[]): void {
    this.suggestionController.addSuggestionCategory(categoryId, suggestions);
  }

  /**
   * Set active suggestion category
   */
  public setActiveSuggestionCategory(categoryId: string): void {
    this.suggestionController.setActiveCategory(categoryId);
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
    const newThread: ChatbotThread = {
      id: `thread_${Date.now()}`,
      title: title || msg('New Chat'),
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.threads = [...this.threads, newThread];
    return newThread;
  }

  /**
   * Switch to a specific thread
   */
  public switchToThread(threadId: string): void {
    this.selectThread(threadId);
  }

  /**
   * Delete a thread
   */
  public deleteThread(threadId: string): void {
    const index = this.threads.findIndex(t => t.id === threadId);
    if (index !== -1) {
      this.threads.splice(index, 1);
      this.threads = [...this.threads]; // Trigger update
      
      // If this was the active thread, clear or switch to another
      if (this.activeThreadId === threadId) {
        if (this.threads.length > 0) {
          this.selectThread(this.threads[0].id);
        } else {
          this.activeThreadId = undefined;
          this.messages = [];
          this.chatStarted = false;
        }
      }
    }
  }

  /**
   * Get current thread
   */
  public getCurrentThread(): ChatbotThread | undefined {
    return this.threads.find(t => t.id === this.activeThreadId);
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
    this.modules = modules;
  }

  /**
   * Get selected modules
   */
  public getSelectedModules(): ChatbotModule[] {
    return this.selectedModules
      .map(id => this.modules.find(m => m.id === id))
      .filter(Boolean) as ChatbotModule[];
  }

  /**
   * Set selected modules
   */
  public setSelectedModules(moduleIds: string[]): void {
    // Filter to only include valid module IDs
    this.selectedModules = moduleIds.filter(id => 
      this.modules.some(m => m.id === id)
    );
  }

  /**
   * Clear module selection
   */
  public clearModuleSelection(): void {
    this.selectedModules = [];
  }

  /**
   * Toggle module selection
   */
  public toggleModule(moduleId: string): void {
    const index = this.selectedModules.indexOf(moduleId);
    if (index > -1) {
      this.selectedModules = this.selectedModules.filter(id => id !== moduleId);
    } else {
      if (this.modules.some(m => m.id === moduleId)) {
        this.selectedModules = [...this.selectedModules, moduleId];
      }
    }
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