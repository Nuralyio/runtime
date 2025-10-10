/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveController, ReactiveControllerHost } from 'lit';
import { ChatbotMessage, ChatbotSender } from '../chatbot.types.js';

/**
 * Interface for chatbot scroll controller host
 */
export interface ChatbotScrollControllerHost extends ReactiveControllerHost {
  messages: ChatbotMessage[];
  autoScroll: boolean;
  boxed: boolean;
  shadowRoot: ShadowRoot | null;
}

/**
 * Controller for managing chatbot scroll behavior
 * Handles scrolling when new messages are added
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
   * Handle messages update and scroll accordingly
   * @param previousMessages Previous messages array before update
   */
  handleMessagesUpdate(previousMessages?: ChatbotMessage[]): void {
    if (!this.host.autoScroll) return;

    const messagesContainer = this.host.shadowRoot?.querySelector('.messages');
    if (!messagesContainer) return;

    if (!previousMessages || previousMessages.length === 0 || this.host.messages.length === 0) {
      this.scrollMessagesToBottom(messagesContainer);
      return;
    }

    if (this.host.messages.length > previousMessages.length) {
      const newMessage = this.host.messages[this.host.messages.length - 1];
      
      if (newMessage.sender === ChatbotSender.User) {
        this.scrollUserMessageToTop(messagesContainer);
      } else {
        this.scrollBotMessageIntoView(messagesContainer);
      }
    } else {
      this.scrollMessagesToBottom(messagesContainer);
    }
  }

  /**
   * Scroll user message to top with padding
   */
  private scrollUserMessageToTop(messagesContainer: Element): void {
    requestAnimationFrame(() => {
      const messageElements = messagesContainer.querySelectorAll('.message');
      const lastMessageElement = messageElements[messageElements.length - 1] as HTMLElement;
      
      if (lastMessageElement) {
        const topPadding = this.host.boxed ? 24 : 16;
        const messageOffsetTop = lastMessageElement.offsetTop;
        const targetScrollTop = Math.max(0, messageOffsetTop - topPadding);
        
        messagesContainer.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth'
        });
      }
    });
  }

  /**
   * Scroll bot message into view
   */
  private scrollBotMessageIntoView(messagesContainer: Element): void {
    requestAnimationFrame(() => {
      const messageElements = messagesContainer.querySelectorAll('.message');
      const lastMessageElement = messageElements[messageElements.length - 1] as HTMLElement;
      
      if (lastMessageElement) {
        lastMessageElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest',
          inline: 'nearest'
        });
      }
    });
  }

  /**
   * Scroll to bottom of messages container (internal)
   */
  private scrollMessagesToBottom(messagesContainer: Element): void {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  /**
   * Manually trigger scroll to bottom (public API)
   */
  public scrollToBottom(): void {
    const messagesContainer = this.host.shadowRoot?.querySelector('.messages');
    if (messagesContainer) {
      this.scrollMessagesToBottom(messagesContainer);
    }
  }
}
