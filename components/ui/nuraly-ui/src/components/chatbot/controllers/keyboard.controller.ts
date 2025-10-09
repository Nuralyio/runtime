/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveController, ReactiveControllerHost } from 'lit';
import { ChatbotEventDetail } from '../chatbot.types.js';

/**
 * Interface for chatbot keyboard controller host
 */
export interface ChatbotKeyboardControllerHost extends ReactiveControllerHost {
  disabled: boolean;
  currentInput: string;
  dispatchEventWithMetadata(type: string, detail?: ChatbotEventDetail): void;
  focusInput(): void;
  sendMessage(text: string): void;
}

/**
 * Controller for handling keyboard interactions and shortcuts in chatbot
 */
export class ChatbotKeyboardController implements ReactiveController {
  private host: ChatbotKeyboardControllerHost;
  private keyboardShortcuts: Map<string, () => void> = new Map();

  constructor(host: ChatbotKeyboardControllerHost) {
    this.host = host;
    host.addController(this);
  }

  hostConnected(): void {
    this.setupDefaultShortcuts();
  }

  hostDisconnected(): void {
    this.keyboardShortcuts.clear();
  }

  /**
   * Setup default keyboard shortcuts
   */
  private setupDefaultShortcuts(): void {
    // Enter to send message
    this.addShortcut('Enter', () => {
      if (this.host.currentInput.trim() && !this.host.disabled) {
        this.host.sendMessage(this.host.currentInput);
      }
    });

    // Escape to focus input
    this.addShortcut('Escape', () => {
      if (!this.host.disabled) {
        this.host.focusInput();
      }
    });

    // Ctrl/Cmd + K to focus input
    this.addShortcut('Control+k', () => {
      if (!this.host.disabled) {
        this.host.focusInput();
      }
    });

    this.addShortcut('Meta+k', () => {
      if (!this.host.disabled) {
        this.host.focusInput();
      }
    });
  }

  /**
   * Add a keyboard shortcut
   */
  addShortcut(key: string, handler: () => void): void {
    this.keyboardShortcuts.set(key.toLowerCase(), handler);
  }

  /**
   * Remove a keyboard shortcut
   */
  removeShortcut(key: string): void {
    this.keyboardShortcuts.delete(key.toLowerCase());
  }

  /**
   * Handle keydown events
   */
  handleKeydown(event: KeyboardEvent): void {
    if (this.host.disabled) return;

    const key = this.buildKeyString(event);
    const handler = this.keyboardShortcuts.get(key);

    if (handler) {
      event.preventDefault();
      handler();
      
      this.host.dispatchEventWithMetadata('nr-chatbot-keyboard-shortcut', {
        metadata: { key, originalEvent: event }
      });
    }
  }

  /**
   * Handle input keydown specifically
   */
  handleInputKeydown(event: KeyboardEvent): void {
    if (this.host.disabled) return;

    // Handle Enter key for sending messages
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (this.host.currentInput.trim()) {
        this.host.sendMessage(this.host.currentInput);
      }
      return;
    }

    // Handle Shift + Enter for new line (if textarea)
    if (event.key === 'Enter' && event.shiftKey) {
      // Allow default behavior for line break
      return;
    }

    // Dispatch input keydown event
    this.host.dispatchEventWithMetadata('nr-chatbot-input-keydown', {
      metadata: { key: event.key, originalEvent: event }
    });
  }

  /**
   * Handle button/element keydown for accessibility
   */
  handleElementKeydown(event: KeyboardEvent, action: () => void): void {
    if (this.host.disabled) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  }

  /**
   * Build key string from keyboard event
   */
  private buildKeyString(event: KeyboardEvent): string {
    const parts: string[] = [];
    
    if (event.ctrlKey) parts.push('control');
    if (event.altKey) parts.push('alt');
    if (event.shiftKey) parts.push('shift');
    if (event.metaKey) parts.push('meta');
    
    parts.push(event.key.toLowerCase());
    
    return parts.join('+');
  }

  /**
   * Get all registered shortcuts
   */
  getShortcuts(): string[] {
    return Array.from(this.keyboardShortcuts.keys());
  }

  /**
   * Clear all shortcuts
   */
  clearShortcuts(): void {
    this.keyboardShortcuts.clear();
  }

  /**
   * Check if key combination is registered
   */
  hasShortcut(key: string): boolean {
    return this.keyboardShortcuts.has(key.toLowerCase());
  }
}