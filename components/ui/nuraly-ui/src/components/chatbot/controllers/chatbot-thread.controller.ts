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
    this.host.threads = [...this.host.threads, newThread];
    this.host.requestUpdate();
    return newThread;
  }

  selectThread(threadId: string): void {
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

  createNewThreadAndSelect(): ChatbotThread {
    const thread = this.createThread();
    this.selectThread(thread.id);
    this.host.dispatchEventWithMetadata('nr-chatbot-thread-created', {
      metadata: { thread },
    });
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
}
