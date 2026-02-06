/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { classMap } from 'lit/directives/class-map.js';
import { msg } from '@lit/localize';
import { ChatbotThread } from '../chatbot.types.js';
import { formatTimestamp } from '../utils/format.js';


export interface ThreadSidebarTemplateHandlers {
  onCreateNew: () => void;
  onSelectThread: (threadId: string) => void;
}

export interface ThreadSidebarTemplateData {
  threads: ChatbotThread[];
  activeThreadId?: string;
}

/**
 * Renders thread sidebar
 */
export function renderThreadSidebar(
  data: ThreadSidebarTemplateData,
  handlers: ThreadSidebarTemplateHandlers
): TemplateResult {
  return html`
    <div class="thread-sidebar" part="thread-sidebar">
      <div class="thread-sidebar__header">
        <h3>${msg('Conversations')}</h3>
      </div>
      
      <div class="thread-list">
        ${repeat(data.threads, thread => thread.id, thread => {
          const lastMessage = thread.messages.length > 0 
            ? thread.messages[thread.messages.length - 1] 
            : null;
          const previewText = lastMessage && typeof lastMessage.text === 'string' 
            ? lastMessage.text 
            : '';
          
          return html`
            <div 
              class="thread-item ${classMap({ 
                'thread-item--active': thread.id === data.activeThreadId 
              })}"
              @click=${() => handlers.onSelectThread(thread.id)}
              part="thread-item"
            >
              <div class="thread-item__title">${thread.title || msg('New Chat')}</div>
              <div class="thread-item__preview">
                ${previewText}
              </div>
              <div class="thread-item__timestamp">${formatTimestamp(thread.updatedAt)}</div>
            </div>
          `;
        })}
      </div>
      
      <slot name="thread-sidebar"></slot>
    </div>
  `;
}
