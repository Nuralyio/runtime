/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { EventBus } from '../event-bus.js';
import type { ChatbotState, ChatbotUICallbacks, ChatbotCoreConfig, ChatbotPlugin } from '../types.js';
import type { ChatbotMessage } from '../../chatbot.types.js';

/**
 * StateHandler - Manages chatbot state
 * Handles all state updates, notifications, and synchronization
 */
export class StateHandler {
  private state: ChatbotState;

  constructor(
    initialState: ChatbotState,
    private eventBus: EventBus,
    private ui: ChatbotUICallbacks,
    private plugins: Map<string, ChatbotPlugin>,
    private config: ChatbotCoreConfig
  ) {
    this.state = initialState;
  }

  getState(): Readonly<ChatbotState> {
    return Object.freeze({ ...this.state });
  }

  /**
   * Update state and notify all observers
   */
  updateState(updates: Partial<ChatbotState>): void {
    this.state = { ...this.state, ...updates };

    if (this.ui.onStateChange) {
      try {
        this.ui.onStateChange(this.getState());
      } catch (error) {
        this.logError('Error in UI state change callback:', error);
      }
    }

    this.eventBus.emit('state:changed', this.state);

    this.plugins.forEach(plugin => {
      if (plugin.onStateChange) {
        try {
          plugin.onStateChange(this.getState());
        } catch (error) {
          this.logError('Error in plugin state change handler:', error);
        }
      }
    });
  }

  addMessageToState(message: ChatbotMessage): void {
    this.state.messages = [...this.state.messages, message];

    if (message.suggestions && message.suggestions.length > 0) {
      this.state.suggestions = [...message.suggestions];
    } else {
      this.state.suggestions = [];
    }

    if (this.config.maxMessages && this.state.messages.length > this.config.maxMessages) {
      this.state.messages = this.state.messages.slice(-this.config.maxMessages);
    }

    if (this.ui.onStateChange) {
      this.ui.onStateChange(this.getState());
    }

    this.eventBus.emit('state:changed', this.state);

    if (this.ui.scrollToBottom) {
      this.ui.scrollToBottom();
    }

    this.eventBus.emit('message:added', message);
  }

  updateMessageInState(id: string, updates: Partial<ChatbotMessage>): void {
    this.state.messages = this.state.messages.map(msg =>
      msg.id === id ? { ...msg, ...updates } : msg
    );

    if (this.ui.onStateChange) {
      this.ui.onStateChange(this.getState());
    }

    this.eventBus.emit('state:changed', this.state);

    const updatedMessage = this.state.messages.find(m => m.id === id);
    if (updatedMessage) {
      this.eventBus.emit('message:updated', updatedMessage);
    }
  }

  removeMessageFromState(id: string): void {
    this.state.messages = this.state.messages.filter(msg => msg.id !== id);

    if (this.ui.onStateChange) {
      this.ui.onStateChange(this.getState());
    }

    this.eventBus.emit('state:changed', this.state);

    this.eventBus.emit('message:deleted', id);
  }

  resetState(initialState: ChatbotState): void {
    this.state = { ...initialState };
    this.updateState(this.state);
  }

  getMessages(): ChatbotMessage[] {
    return [...this.state.messages];
  }

  getMessageById(id: string): ChatbotMessage | undefined {
    return this.state.messages.find(msg => msg.id === id);
  }

  isTyping(): boolean {
    return this.state.isTyping;
  }

  isProcessing(): boolean {
    return this.state.isProcessing;
  }

  setTyping(isTyping: boolean): void {
    this.updateState({ isTyping });

    if (isTyping && this.ui.onTypingStart) {
      this.ui.onTypingStart();
    } else if (!isTyping && this.ui.onTypingEnd) {
      this.ui.onTypingEnd();
    }
  }

  setProcessing(isProcessing: boolean): void {
    this.updateState({ isProcessing });
  }

  private logError(message: string, error: any): void {
    console.error(`[StateHandler] ${message}`, error);
  }
}
