/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult, nothing } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { classMap } from 'lit/directives/class-map.js';
import { msg } from '@lit/localize';
import { ChatbotThread } from '../chatbot.types.js';
import { formatTimestamp } from '../utils/format.js';


export interface ThreadSidebarTemplateHandlers {
  onCreateNew: () => void;
  onSelectThread: (threadId: string) => void;
  onDeleteThread?: (threadId: string) => void;
  onRenameThread?: (threadId: string, newTitle: string) => void;
  onBookmarkThread?: (threadId: string) => void;
}

export interface ThreadSidebarTemplateData {
  threads: ChatbotThread[];
  activeThreadId?: string;
  editingThreadId?: string;
}

function renderThreadItem(
  thread: ChatbotThread,
  data: ThreadSidebarTemplateData,
  handlers: ThreadSidebarTemplateHandlers
): TemplateResult {
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
      <div class="thread-item__header">
        ${data.editingThreadId === thread.id && handlers.onRenameThread ? html`
          <input
            class="thread-item__rename-input"
            type="text"
            .value=${thread.title || ''}
            @click=${(e: Event) => e.stopPropagation()}
            @keydown=${(e: KeyboardEvent) => {
              if (e.key === 'Enter') {
                const input = e.target as HTMLInputElement;
                const value = input.value.trim();
                if (value) handlers.onRenameThread!(thread.id, value);
              }
              if (e.key === 'Escape') {
                handlers.onRenameThread!(thread.id, thread.title || '');
              }
            }}
            @blur=${(e: FocusEvent) => {
              const input = e.target as HTMLInputElement;
              const value = input.value.trim();
              if (value && value !== thread.title) {
                handlers.onRenameThread!(thread.id, value);
              } else {
                handlers.onRenameThread!(thread.id, thread.title || '');
              }
            }}
          />
        ` : html`
          <div class="thread-item__title">${thread.title || msg('New Chat')}</div>
        `}
        <div class="thread-item__actions">
          ${handlers.onRenameThread && data.editingThreadId !== thread.id ? html`
            <button
              class="thread-item__action-btn"
              title="${msg('Rename conversation')}"
              @click=${(e: Event) => {
                e.stopPropagation();
                (e.target as HTMLElement).dispatchEvent(
                  new CustomEvent('nr-thread-edit', {
                    bubbles: true,
                    composed: true,
                    detail: { threadId: thread.id }
                  })
                );
              }}
              part="thread-rename"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
          ` : ''}
          ${handlers.onBookmarkThread ? html`
            <button
              class="thread-item__action-btn ${thread.bookmarked ? 'thread-item__bookmark--active' : ''}"
              title="${thread.bookmarked ? msg('Remove bookmark') : msg('Bookmark conversation')}"
              @click=${(e: Event) => {
                e.stopPropagation();
                handlers.onBookmarkThread!(thread.id);
              }}
              part="thread-bookmark"
            >
              ${thread.bookmarked ? html`
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
              ` : html`
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
              `}
            </button>
          ` : ''}
          ${handlers.onDeleteThread ? html`
            <nr-popconfirm
              title="${msg('Delete this conversation?')}"
              description="${msg('This action cannot be undone.')}"
              ok-text="${msg('Delete')}"
              cancel-text="${msg('Cancel')}"
              ok-type="danger"
              placement="right"
              @click=${(e: Event) => e.stopPropagation()}
              @nr-confirm=${() => handlers.onDeleteThread!(thread.id)}
            >
              <button
                slot="trigger"
                class="thread-item__action-btn thread-item__delete"
                title="${msg('Delete conversation')}"
                part="thread-delete"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              </button>
            </nr-popconfirm>
          ` : ''}
        </div>
      </div>
      <div class="thread-item__preview">
        ${previewText}
      </div>
      <div class="thread-item__timestamp">${formatTimestamp(thread.updatedAt)}</div>
    </div>
  `;
}

/**
 * Renders thread sidebar
 */
export function renderThreadSidebar(
  data: ThreadSidebarTemplateData,
  handlers: ThreadSidebarTemplateHandlers
): TemplateResult {
  const bookmarkedThreads = data.threads.filter(t => t.bookmarked);
  const regularThreads = data.threads.filter(t => !t.bookmarked);

  return html`
    <div class="thread-sidebar" part="thread-sidebar">
      <div class="thread-sidebar__header">
        <h3>${msg('Conversations')}</h3>
      </div>

      <div class="thread-list">
        ${bookmarkedThreads.length > 0 ? html`
          <div class="thread-section" part="thread-section-bookmarks">
            <div class="thread-section__label">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
              ${msg('Bookmarks')}
            </div>
            ${repeat(bookmarkedThreads, t => t.id, t => renderThreadItem(t, data, handlers))}
          </div>
        ` : nothing}
        ${regularThreads.length > 0 || bookmarkedThreads.length === 0 ? html`
          ${bookmarkedThreads.length > 0 ? html`
            <div class="thread-section__label">${msg('All Conversations')}</div>
          ` : nothing}
          ${repeat(regularThreads, t => t.id, t => renderThreadItem(t, data, handlers))}
          ${regularThreads.length === 0 && bookmarkedThreads.length === 0 ? html`
            <p class="empty-msg">${msg('No conversations yet')}</p>
          ` : nothing}
        ` : nothing}
      </div>

      <slot name="thread-sidebar"></slot>
    </div>
  `;
}
