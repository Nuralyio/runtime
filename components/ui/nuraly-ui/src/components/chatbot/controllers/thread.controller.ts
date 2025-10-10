/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveController, ReactiveControllerHost } from 'lit';
import { ChatbotEventDetail, ChatbotMessage, ChatbotThread } from '../chatbot.types.js';
import { msg } from '@lit/localize';

export interface ChatbotThreadControllerHost extends ReactiveControllerHost {
  threads: ChatbotThread[];
  activeThreadId?: string;
  messages: ChatbotMessage[];
  chatStarted: boolean;
  dispatchEventWithMetadata(type: string, detail?: ChatbotEventDetail): void;
}

export class ChatbotThreadController implements ReactiveController {
  constructor(private host: ChatbotThreadControllerHost) {
    host.addController(this);
  }

  hostConnected(): void {}
  hostDisconnected(): void {}

  createThread(title?: string): ChatbotThread {
    const newThread: ChatbotThread = {
      id: `thread_${Date.now()}`,
      title: title || msg('New Chat'),
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    // Add new thread at the beginning of the array (top)
    this.host.threads = [newThread, ...this.host.threads];
    this.host.requestUpdate();
    return newThread;
  }

  selectThread(threadId: string): void {
    // Save current thread messages before switching
    this.saveCurrentThreadMessages();
    
    this.host.activeThreadId = threadId;
    const thread = this.host.threads.find(t => t.id === threadId);
    if (thread) {
      this.host.messages = [...thread.messages];
      this.host.chatStarted = thread.messages.length > 0;
      this.host.dispatchEventWithMetadata('nr-chatbot-thread-selected', {
        metadata: { thread, threadId },
      });
      this.host.requestUpdate();
    }
  }

  /**
   * Save current messages to the active thread
   */
  saveCurrentThreadMessages(): void {
    if (!this.host.activeThreadId) return;
    
    const currentThread = this.getCurrentThread();
    if (currentThread) {
      currentThread.messages = [...this.host.messages];
      currentThread.updatedAt = new Date().toISOString();
    }
  }

  createNewThreadAndSelect(): ChatbotThread {
    // Save current thread messages before creating a new one
    this.saveCurrentThreadMessages();
    
    // Check if we're already in an empty new thread
    const currentThread = this.getCurrentThread();
    if (currentThread && currentThread.messages.length === 0) {
      // Already in an empty thread, don't create a new one
      return currentThread;
    }
    
    const thread = this.createThread();
    
    this.host.activeThreadId = thread.id;
    this.host.messages = [];
    this.host.chatStarted = false;
    
    this.host.dispatchEventWithMetadata('nr-chatbot-thread-created', {
      metadata: { thread },
    });
    this.host.dispatchEventWithMetadata('nr-chatbot-thread-selected', {
      metadata: { thread, threadId: thread.id },
    });
    
    this.host.requestUpdate();
    return thread;
  }

  deleteThread(threadId: string): void {
    const index = this.host.threads.findIndex(t => t.id === threadId);
    if (index === -1) return;

    this.host.threads.splice(index, 1);
    this.host.threads = [...this.host.threads];

    if (this.host.activeThreadId === threadId) {
      if (this.host.threads.length > 0) {
        this.selectThread(this.host.threads[0].id);
      } else {
        this.host.activeThreadId = undefined;
        this.host.messages = [];
        this.host.chatStarted = false;
      }
    }
    this.host.requestUpdate();
  }

  getCurrentThread(): ChatbotThread | undefined {
    return this.host.threads.find(t => t.id === this.host.activeThreadId);
  }

  /**
   * Update messages in the current active thread
   * Call this whenever messages change
   */
  updateCurrentThreadMessages(): void {
    this.saveCurrentThreadMessages();
  }
}
