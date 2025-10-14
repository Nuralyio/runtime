/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { EventBus } from '../event-bus.js';
import { StateHandler } from './state-handler.js';
import type { ChatbotCoreConfig, ChatbotUICallbacks } from '../types.js';
import type { ChatbotThread } from '../../chatbot.types.js';

/**
 * ThreadHandler - Handles thread/conversation management
 * Creates, switches, deletes, and manages threads
 */
export class ThreadHandler {
  constructor(
    private stateHandler: StateHandler,
    private eventBus: EventBus,
    private ui: ChatbotUICallbacks,
    private config: ChatbotCoreConfig
  ) {}

  createThread(title?: string): ChatbotThread {
    if (!this.config.enableThreads) {
      throw new Error('Threads are not enabled');
    }

    const state = this.stateHandler.getState();
    const thread: ChatbotThread = {
      id: this.generateId('thread'),
      title: title || `Chat ${state.threads.length + 1}`,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.stateHandler.updateState({
      threads: [thread, ...state.threads],
      currentThreadId: thread.id,
      messages: []
    });

    this.eventBus.emit('thread:created', thread);
    this.eventBus.emit('thread:selected', thread);

    if (this.ui.focusInput) {
      setTimeout(() => {
        this.ui.focusInput!();
      }, 0);
    }

    return thread;
  }

  switchThread(threadId: string): void {
    const state = this.stateHandler.getState();
    const thread = state.threads.find(t => t.id === threadId);
    if (!thread) {
      throw new Error(`Thread "${threadId}" not found`);
    }

    if (state.currentThreadId) {
      this.saveCurrentThread();
    }

    this.stateHandler.updateState({
      currentThreadId: threadId,
      messages: [...thread.messages]
    });

    this.eventBus.emit('thread:selected', thread);
  }

  deleteThread(threadId: string): void {
    const state = this.stateHandler.getState();
    const newThreads = state.threads.filter(t => t.id !== threadId);

    if (state.currentThreadId === threadId) {
      if (newThreads.length > 0) {
        this.stateHandler.updateState({ threads: newThreads });
        this.switchThread(newThreads[0].id);
      } else {
        this.stateHandler.updateState({
          threads: newThreads,
          currentThreadId: undefined,
          messages: []
        });
      }
    } else {
      this.stateHandler.updateState({ threads: newThreads });
    }

    this.eventBus.emit('thread:deleted', threadId);
  }

  getCurrentThread(): ChatbotThread | undefined {
    const state = this.stateHandler.getState();
    return state.threads.find(t => t.id === state.currentThreadId);
  }

  getThreads(): ChatbotThread[] {
    const state = this.stateHandler.getState();
    return [...state.threads];
  }

  saveCurrentThread(): void {
    const state = this.stateHandler.getState();
    if (!state.currentThreadId) return;

    this.updateThreadMessages(state.currentThreadId);
  }

  updateThreadMessages(threadId: string): void {
    const state = this.stateHandler.getState();
    const newThreads = state.threads.map(t =>
      t.id === threadId
        ? { ...t, messages: [...state.messages], updatedAt: new Date().toISOString() }
        : t
    );
    
    this.stateHandler.updateState({ threads: newThreads });
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
