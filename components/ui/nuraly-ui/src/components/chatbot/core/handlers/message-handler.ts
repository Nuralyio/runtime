/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { EventBus } from '../event-bus.js';
import { StateHandler } from './state-handler.js';
import type { ChatbotPlugin } from '../types.js';
import type { ChatbotMessage, ChatbotSender } from '../../chatbot.types.js';

/**
 * MessageHandler - Handles all message operations
 * Creates, updates, deletes, and manages messages
 */
export class MessageHandler {
  constructor(
    private stateHandler: StateHandler,
    private eventBus: EventBus,
    private plugins: Map<string, ChatbotPlugin>
  ) {}

  createMessage(data: Partial<ChatbotMessage>): ChatbotMessage {
    return {
      id: this.generateId('msg'),
      sender: data.sender || 'user',
      text: data.text || '',
      timestamp: data.timestamp || new Date().toISOString(),
      ...data
    } as ChatbotMessage;
  }

  createUserMessage(text: string, metadata?: Record<string, any>): ChatbotMessage {
    return this.createMessage({
      sender: 'user' as ChatbotSender,
      text,
      metadata
    });
  }

  createBotMessage(text: string, metadata?: Record<string, any>): ChatbotMessage {
    return this.createMessage({
      sender: 'bot' as ChatbotSender,
      text,
      metadata
    });
  }

  addMessage(data: Partial<ChatbotMessage>): ChatbotMessage {
    const message = this.createMessage(data);
    this.stateHandler.addMessageToState(message);

    if (message.sender === 'bot') {
      this.eventBus.emit('message:received', message);
      
      this.plugins.forEach(plugin => {
        if (plugin.onMessageReceived) {
          plugin.onMessageReceived(message);
        }
      });
    } else {
      this.eventBus.emit('message:sent', message);
      
      this.plugins.forEach(plugin => {
        if (plugin.onMessageSent) {
          plugin.onMessageSent(message);
        }
      });
    }

    return message;
  }

  updateMessage(id: string, updates: Partial<ChatbotMessage>): void {
    this.stateHandler.updateMessageInState(id, updates);
  }

  deleteMessage(id: string): void {
    this.stateHandler.removeMessageFromState(id);
  }

  clearMessages(): void {
    this.stateHandler.updateState({ messages: [] });
  }

  getMessages(): ChatbotMessage[] {
    return this.stateHandler.getMessages();
  }

  getMessageById(id: string): ChatbotMessage | undefined {
    return this.stateHandler.getMessageById(id);
  }

  /**
   * Update bot message text (for streaming)
   */
  updateBotMessageText(id: string, text: string): void {
    const message = this.getMessageById(id);
    if (message && message.sender === 'bot') {
      this.updateMessage(id, { text });
    }
  }

  /**
   * Append text to bot message (for streaming)
   */
  appendToBotMessage(id: string, chunk: string): void {
    const message = this.getMessageById(id);
    if (message && message.sender === 'bot') {
      this.updateMessage(id, { text: message.text + chunk });
    }
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
