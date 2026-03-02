/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { nothing, html, TemplateResult } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { msg } from '@lit/localize';
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
import {
  renderArtifactPanel,
  ArtifactPanelTemplateData,
  ArtifactPanelTemplateHandlers
} from './artifact-panel.template.js';
import { ChatbotMessage, ChatbotSuggestion, ChatbotLoadingType } from '../chatbot.types.js';

export interface ChatbotMainTemplateData {
  // Display mode
  boxed?: boolean;

  /** Show messages area (set to false for input-only mode) */
  showMessages?: boolean;

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

  // Artifact panel
  enableArtifacts?: boolean;
  artifactPanel?: ArtifactPanelTemplateData;
}

export interface ChatbotMainTemplateHandlers {
  message: MessageTemplateHandlers;
  suggestion: SuggestionTemplateHandlers;
  inputBox: InputBoxTemplateHandlers;
  threadSidebar?: ThreadSidebarTemplateHandlers;
  fileUploadArea: FileUploadAreaTemplateHandlers;
  urlModal?: UrlModalTemplateHandlers;
  artifactPanel?: ArtifactPanelTemplateHandlers;
  onToggleThreadSidebar?: () => void;
}

/**
 * Renders the thread header bar with toggle and new-conversation buttons.
 */
function renderThreadHeader(
  data: ChatbotMainTemplateData,
  handlers: ChatbotMainTemplateHandlers
): TemplateResult | typeof nothing {
  if (!data.enableThreads) return nothing;

  return html`
    <div class="chatbot-header" part="chatbot-header">
      <nr-button
        type="text"
        size="small"
        .icon=${['panel-left']}
        @click=${handlers.onToggleThreadSidebar}
        title="${msg(data.isThreadSidebarOpen ? 'Hide threads' : 'Show threads')}"
        aria-label="${msg(data.isThreadSidebarOpen ? 'Hide threads' : 'Show threads')}"
      ></nr-button>
      ${data.enableThreadCreation && data.messages.length > 0 ? html`
        <nr-button
          type="text"
          size="small"
          .icon=${['square-pen']}
          @click=${handlers.threadSidebar?.onCreateNew}
          title="${msg('New conversation')}"
          aria-label="${msg('New conversation')}"
        ></nr-button>
      ` : ''}
    </div>
  `;
}

/**
 * Renders the messages area or, in input-only mode, the inline suggestions.
 */
function renderContentArea(
  data: ChatbotMainTemplateData,
  handlers: ChatbotMainTemplateHandlers
): TemplateResult | typeof nothing {
  if (data.showMessages !== false) {
    return html`
      <div class="chatbot-content" part="content">
        ${renderMessages(
          data.messages,
          renderSuggestions(data.chatStarted, data.suggestions, handlers.suggestion),
          data.isTyping
            ? renderBotTypingIndicator(
                data.isTyping,
                data.loadingIndicator || ChatbotLoadingType.Spinner
              )
            : nothing,
          handlers.message
        )}
        <slot name="messages"></slot>
      </div>
    `;
  }

  // Input-only mode: render suggestions above input
  if (data.suggestions && data.suggestions.length > 0) {
    return html`
      <div class="input-only-suggestions" part="input-only-suggestions">
        ${renderSuggestions(false, data.suggestions, handlers.suggestion)}
      </div>
    `;
  }

  return nothing;
}

/**
 * Main chatbot template that orchestrates all sub-templates
 */
export function renderChatbotMain(
  data: ChatbotMainTemplateData,
  handlers: ChatbotMainTemplateHandlers
): TemplateResult {
  const isArtifactPanelOpen = data.enableArtifacts && data.artifactPanel?.isOpen;

  return html`
    <div class="chatbot-container ${classMap({
      'chatbot-container--with-sidebar': data.enableThreads && data.isThreadSidebarOpen,
      'chatbot-container--with-artifact-panel': !!isArtifactPanelOpen
    })}" part="container">

      ${data.enableThreads && data.isThreadSidebarOpen && data.threadSidebar && handlers.threadSidebar
        ? renderThreadSidebar(data.threadSidebar, handlers.threadSidebar)
        : ''}

      <div class="chatbot-main" part="main">
        ${renderThreadHeader(data, handlers)}

        <slot name="header"></slot>

        ${renderContentArea(data, handlers)}

        ${renderInputBox(data.inputBox, handlers.inputBox)}

        <slot name="footer"></slot>
      </div>

      ${isArtifactPanelOpen && data.artifactPanel && handlers.artifactPanel
        ? renderArtifactPanel(data.artifactPanel, handlers.artifactPanel)
        : ''}

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
