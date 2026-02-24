/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveController, ReactiveControllerHost } from 'lit';
import { ChatbotMessage } from '../chatbot.types.js';

/**
 * Interface for chatbot scroll controller host
 */
export interface ChatbotScrollControllerHost extends ReactiveControllerHost {
  messages: ChatbotMessage[];
  autoScroll: boolean;
  shadowRoot: ShadowRoot | null;
}

/**
 * Controller for managing chatbot scroll behavior
 * Handles scrolling when new messages are added or updated
 */
export class ChatbotScrollController implements ReactiveController {
  private host: ChatbotScrollControllerHost;

  constructor(host: ChatbotScrollControllerHost) {
    this.host = host;
    host.addController(this);
  }

  hostConnected(): void {}

  hostDisconnected(): void {}

  /**
   * Handle messages update and scroll to bottom
   */
  handleMessagesUpdate(): void {
    if (!this.host.autoScroll) return;

    const messagesContainer = this.host.shadowRoot?.querySelector('.messages');
    if (!messagesContainer) return;

    // Simple scroll to bottom for any message update
    this.scrollToBottom();
  }

  /**
   * Scroll to bottom of messages container
   */
  public scrollToBottom(): void {
    const messagesContainer = this.host.shadowRoot?.querySelector('.messages');
    if (!messagesContainer) return;

    requestAnimationFrame(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
  }
}
