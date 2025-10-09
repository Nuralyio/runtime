/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveController, ReactiveControllerHost } from 'lit';
import { ChatbotMessage, ChatbotValidationRule, ChatbotEventDetail } from '../chatbot.types.js';

/**
 * Interface for chatbot message controller host
 */
export interface ChatbotMessageControllerHost extends ReactiveControllerHost {
  messages: ChatbotMessage[];
  dispatchEventWithMetadata(type: string, detail?: ChatbotEventDetail): void;
}

/**
 * Controller for managing chatbot messages, validation, and state
 */
export class ChatbotMessageController implements ReactiveController {
  private host: ChatbotMessageControllerHost;
  private validationRules: ChatbotValidationRule[] = [];
  private messageHistory: ChatbotMessage[] = [];
  private maxHistorySize = 100;

  constructor(host: ChatbotMessageControllerHost) {
    this.host = host;
    host.addController(this);
  }

  hostConnected(): void {
    // Initialize controller when host connects
    this.setupDefaultValidationRules();
  }

  hostDisconnected(): void {
    // Cleanup when host disconnects
    this.messageHistory = [];
    this.validationRules = [];
  }

  /**
   * Setup default validation rules
   */
  private setupDefaultValidationRules(): void {
    // Add default validation rule for message length
    this.addValidationRule({
      id: 'min-length',
      validator: (text: string) => text.trim().length > 0,
      errorMessage: 'Message cannot be empty'
    });

    // Add default validation rule for max length
    this.addValidationRule({
      id: 'max-length', 
      validator: (text: string) => text.length <= 1000,
      errorMessage: 'Message is too long (max 1000 characters)',
      warningMessage: 'Message is getting long'
    });
  }

  /**
   * Add a validation rule
   */
  addValidationRule(rule: ChatbotValidationRule): void {
    this.validationRules.push(rule);
  }

  /**
   * Remove a validation rule by id
   */
  removeValidationRule(ruleId: string): void {
    this.validationRules = this.validationRules.filter(rule => rule.id !== ruleId);
  }

  /**
   * Clear all validation rules
   */
  clearValidationRules(): void {
    this.validationRules = [];
  }

  /**
   * Validate a message against all rules
   */
  async validateMessage(text: string): Promise<{isValid: boolean, errors: string[], warnings: string[]}> {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const rule of this.validationRules) {
      try {
        const isValid = await rule.validator(text);
        if (!isValid) {
          errors.push(rule.errorMessage);
          if (rule.warningMessage) {
            warnings.push(rule.warningMessage);
          }
        }
      } catch (error) {
        console.error(`Validation rule ${rule.id} failed:`, error);
        errors.push('Validation error occurred');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Add message to host and history
   */
  addMessage(message: Omit<ChatbotMessage, 'id'>): ChatbotMessage {
    const newMessage: ChatbotMessage = {
      ...message,
      id: this.generateMessageId()
    };
    
    this.host.messages = [...this.host.messages, newMessage];
    this.addMessageToHistory(newMessage);
    this.host.requestUpdate();
    
    return newMessage;
  }

  /**
   * Remove message by ID
   */
  removeMessage(messageId: string): void {
    this.host.messages = this.host.messages.filter(msg => msg.id !== messageId);
    this.messageHistory = this.messageHistory.filter(msg => msg.id !== messageId);
    this.host.requestUpdate();
  }

  /**
   * Clear all messages
   */
  clearMessages(): void {
    this.host.messages = [];
    this.messageHistory = [];
    this.host.requestUpdate();
  }

  /**
   * Update message by ID
   */
  updateMessage(messageId: string, updates: Partial<ChatbotMessage>): void {
    this.host.messages = this.host.messages.map(msg => 
      msg.id === messageId ? { ...msg, ...updates } : msg
    );
    
    // Update history as well
    this.messageHistory = this.messageHistory.map(msg =>
      msg.id === messageId ? { ...msg, ...updates } : msg
    );
    
    this.host.requestUpdate();
  }

  /**
   * Get message by ID
   */
  getMessageById(messageId: string): ChatbotMessage | undefined {
    return this.host.messages.find(msg => msg.id === messageId);
  }

  /**
   * Add message to history
   */
  addMessageToHistory(message: ChatbotMessage): void {
    this.messageHistory.push(message);
    
    // Maintain history size limit
    if (this.messageHistory.length > this.maxHistorySize) {
      this.messageHistory = this.messageHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * Get message history
   */
  getMessageHistory(): ChatbotMessage[] {
    return [...this.messageHistory];
  }

  /**
   * Clear message history
   */
  clearHistory(): void {
    this.messageHistory = [];
  }

  /**
   * Find messages by criteria
   */
  findMessages(predicate: (message: ChatbotMessage) => boolean): ChatbotMessage[] {
    return this.messageHistory.filter(predicate);
  }

  /**
   * Get last message of specific sender
   */
  getLastMessageBySender(sender: string): ChatbotMessage | undefined {
    return this.messageHistory
      .slice()
      .reverse()
      .find(msg => msg.sender === sender);
  }

  /**
   * Set maximum history size
   */
  setMaxHistorySize(size: number): void {
    this.maxHistorySize = Math.max(1, size);
    
    // Trim existing history if needed
    if (this.messageHistory.length > this.maxHistorySize) {
      this.messageHistory = this.messageHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get validation status
   */
  getValidationRules(): ChatbotValidationRule[] {
    return [...this.validationRules];
  }

  /**
   * Check if chat has started (has user messages)
   */
  hasChatStarted(): boolean {
    return this.host.messages.some(msg => msg.sender === 'user');
  }

  /**
   * Get message count by sender
   */
  getMessageCountBySender(sender: string): number {
    return this.host.messages.filter(msg => msg.sender === sender).length;
  }

  /**
   * Get total message count
   */
  getTotalMessageCount(): number {
    return this.host.messages.length;
  }
}