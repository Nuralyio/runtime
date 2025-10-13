/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { nothing, html, TemplateResult } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { msg } from '@lit/localize';
import '../../button/button.component.js';
import {
  renderMessages,
  renderBotTypingIndicator,
  MessageTemplateHandlers
} from './message.template.js';
import {
  renderSuggestions,
  SuggestionTemplateHandlers
} from './suggestion.template.js';
import {
  renderInputBox,
  InputBoxTemplateData,
  InputBoxTemplateHandlers
} from './input-box.template.js';
import {
  renderThreadSidebar,
  ThreadSidebarTemplateData,
  ThreadSidebarTemplateHandlers
} from './thread-sidebar.template.js';
import {
  renderFileUploadArea,
  FileUploadAreaTemplateHandlers
} from './file-upload-area.template.js';
import {
  renderUrlModal,
  UrlModalTemplateData,
  UrlModalTemplateHandlers
} from './url-modal.template.js';
import { ChatbotMessage, ChatbotSuggestion, ChatbotLoadingType } from '../chatbot.types.js';

export interface ChatbotMainTemplateData {
  // Display mode
  boxed?: boolean;
  
  // Messages
  messages: ChatbotMessage[];
  isTyping: boolean;
  loadingIndicator?: ChatbotLoadingType;
  loadingText?: string;
  
  // Suggestions
  chatStarted: boolean;
  suggestions: ChatbotSuggestion[];
  
  // Input box
  inputBox: InputBoxTemplateData;
  
  // Thread sidebar
  enableThreads: boolean;
  enableThreadCreation: boolean;
  isThreadSidebarOpen: boolean;
  threadSidebar?: ThreadSidebarTemplateData;
  
  // File upload area
  isDragging: boolean;
  
  // URL modal
  urlModal?: UrlModalTemplateData;
}

export interface ChatbotMainTemplateHandlers {
  message: MessageTemplateHandlers;
  suggestion: SuggestionTemplateHandlers;
  inputBox: InputBoxTemplateHandlers;
  threadSidebar?: ThreadSidebarTemplateHandlers;
  fileUploadArea: FileUploadAreaTemplateHandlers;
  urlModal?: UrlModalTemplateHandlers;
  onToggleThreadSidebar?: () => void;
}

/**
 * Main chatbot template that orchestrates all sub-templates
 */
export function renderChatbotMain(
  data: ChatbotMainTemplateData,
  handlers: ChatbotMainTemplateHandlers
): TemplateResult {
  return html`
    <div class="chatbot-container ${classMap({
      'chatbot-container--with-sidebar': data.enableThreads && data.isThreadSidebarOpen
    })}" part="container">
      
      ${data.enableThreads && data.isThreadSidebarOpen && data.threadSidebar && handlers.threadSidebar
        ? renderThreadSidebar(data.threadSidebar, handlers.threadSidebar)
        : ''}
      
      <div class="chatbot-main" part="main">
        ${data.enableThreads ? html`
          <div class="chatbot-header" part="chatbot-header">
            <nr-button
              type="text"
              size="small"
              .icon=${['bars']}
              @click=${handlers.onToggleThreadSidebar}
              title="${msg(data.isThreadSidebarOpen ? 'Hide threads' : 'Show threads')}"
              aria-label="${msg(data.isThreadSidebarOpen ? 'Hide threads' : 'Show threads')}"
            ></nr-button>
            ${data.enableThreadCreation && data.messages.length > 0 ? html`
              <nr-button
                type="text"
                size="small"
                .icon=${['pencil-alt']}
                @click=${handlers.threadSidebar?.onCreateNew}
                title="${msg('New conversation')}"
                aria-label="${msg('New conversation')}"
              ></nr-button>
            ` : ''}
          </div>
        ` : ''}
        
        <slot name="header"></slot>
        
        <div class="chatbot-content" part="content">
          ${renderMessages(
            data.messages,
            renderSuggestions(data.chatStarted, data.suggestions, handlers.suggestion),
            data.isTyping 
              ? renderBotTypingIndicator(
                  data.isTyping, 
                  data.loadingIndicator || ChatbotLoadingType.Dots, 
                  data.loadingText || ''
                )
              : nothing,
            handlers.message
          )}
          
          <slot name="messages"></slot>
        </div>
        
        ${renderInputBox(data.inputBox, handlers.inputBox)}
        
        <slot name="footer"></slot>
      </div>
      
      ${data.isDragging 
        ? renderFileUploadArea(
            { isDragging: data.isDragging },
            handlers.fileUploadArea
          )
        : ''}
      
      ${data.urlModal && handlers.urlModal
        ? renderUrlModal(data.urlModal, handlers.urlModal)
        : ''}
      
      <slot></slot>
    </div>
  `;
}
