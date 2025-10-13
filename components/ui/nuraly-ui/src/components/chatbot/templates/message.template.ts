/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult, nothing } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { classMap } from 'lit/directives/class-map.js';
import { msg } from '@lit/localize';
import { ChatbotMessage, ChatbotLoadingType } from '../chatbot.types.js';

// Import required components for template
import '../../button/button.component.js';
import '../../icon/icon.component.js';

export interface MessageTemplateHandlers {
  onRetry: (message: ChatbotMessage) => void;
  onRetryKeydown: (e: KeyboardEvent) => void;
  onCopy: (message: ChatbotMessage) => void;
  onCopyKeydown: (e: KeyboardEvent, message: ChatbotMessage) => void;
}

/**
 * Renders a single message
 */
export function renderMessage(
  message: ChatbotMessage, 
  handlers: MessageTemplateHandlers
): TemplateResult {
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
        ${message?.metadata?.renderAsHtml ? unsafeHTML(message.text) : message.text}
      </div>
      <div class="message__footer" part="message-footer">
        <div class="message__timestamp" part="message-timestamp">
          ${message.timestamp}
        </div>
        <nr-icon
          name="copy"
          size="small"
          color="var(--nuraly-color-chatbot-timestamp)"
          class="message__copy"
          @click=${() => handlers.onCopy(message)}
          @keydown=${(e: KeyboardEvent) => handlers.onCopyKeydown(e, message)}
          title="${msg('Copy message')}"
          aria-label="${msg('Copy message')}"
          role="button"
          tabindex="0"
        ></nr-icon>
      </div>
      ${message.error
        ? html`
          <nr-button 
            type="secondary"
            size="small"
            class="message__retry" 
            part="retry-button"
            @click=${() => handlers.onRetry(message)}
            @keydown=${handlers.onRetryKeydown}
            aria-label="${msg('Retry message')}"
          >
            ${msg('Retry')}
          </nr-button>`
        : nothing}
    </div>
  `;
}

/**
 * Renders bot typing indicator
 */
export function renderBotTypingIndicator(
  isTyping: boolean,
  loadingIndicator: ChatbotLoadingType,
  loadingText: string
): TemplateResult | typeof nothing {
  if (!isTyping) return nothing;

  const indicatorContent = loadingIndicator === ChatbotLoadingType.Dots
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
        <span class="loading-text">${loadingText}</span>
      </div>
    </div>
  `;
}

/**
 * Renders empty state
 */
export function renderEmptyState(): TemplateResult {
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

/**
 * Renders messages container with all messages
 */
export function renderMessages(
  messages: ChatbotMessage[],
  suggestions: TemplateResult | typeof nothing,
  typingIndicator: TemplateResult | typeof nothing,
  messageHandlers: MessageTemplateHandlers
): TemplateResult {
  return html`
    <div class="messages" part="messages">
      ${messages.length === 0 ? renderEmptyState() : nothing}
      ${messages.map((message) => renderMessage(message, messageHandlers))}
      ${suggestions}
      ${typingIndicator}
    </div>
  `;
}
