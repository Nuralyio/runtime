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

  /**
   * Create a new message
   */
  createMessage(data: Partial<ChatbotMessage>): ChatbotMessage {
    return {
      id: this.generateId('msg'),
      sender: data.sender || 'user',
      text: data.text || '',
      timestamp: data.timestamp || new Date().toISOString(),
      ...data
    } as ChatbotMessage;
  }

  /**
   * Create a user message
   */
  createUserMessage(text: string, metadata?: Record<string, any>): ChatbotMessage {
    return this.createMessage({
      sender: 'user' as ChatbotSender,
      text,
      metadata
    });
  }

  /**
   * Create a bot message
   */
  createBotMessage(text: string, metadata?: Record<string, any>): ChatbotMessage {
    return this.createMessage({
      sender: 'bot' as ChatbotSender,
      text,
      metadata
    });
  }

  /**
   * Add a message to the chat
   */
  addMessage(data: Partial<ChatbotMessage>): ChatbotMessage {
    const message = this.createMessage(data);
    this.stateHandler.addMessageToState(message);

    // Emit events based on sender
    if (message.sender === 'bot') {
      this.eventBus.emit('message:received', message);
      
      // Notify plugins
      this.plugins.forEach(plugin => {
        if (plugin.onMessageReceived) {
          plugin.onMessageReceived(message);
        }
      });
    } else {
      this.eventBus.emit('message:sent', message);
      
      // Notify plugins
      this.plugins.forEach(plugin => {
        if (plugin.onMessageSent) {
          plugin.onMessageSent(message);
        }
      });
    }

    return message;
  }

  /**
   * Update an existing message
   */
  updateMessage(id: string, updates: Partial<ChatbotMessage>): void {
    this.stateHandler.updateMessageInState(id, updates);
  }

  /**
   * Delete a message
   */
  deleteMessage(id: string): void {
    this.stateHandler.removeMessageFromState(id);
  }

  /**
   * Clear all messages
   */
  clearMessages(): void {
    this.stateHandler.updateState({ messages: [] });
  }

  /**
   * Get all messages
   */
  getMessages(): ChatbotMessage[] {
    return this.stateHandler.getMessages();
  }

  /**
   * Get message by ID
   */
  getMessageById(id: string): ChatbotMessage | undefined {
    return this.stateHandler.getMessageById(id);
  }

  /**
   * Update bot message incrementally (for streaming)
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

  /**
   * Generate unique ID
   */
  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
