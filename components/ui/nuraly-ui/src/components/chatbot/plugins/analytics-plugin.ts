/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import type { ChatbotPlugin } from '../core/types.js';
import type { ChatbotMessage } from '../chatbot.types.js';

/**
 * Analytics plugin - tracks chatbot usage and events
 */
export class AnalyticsPlugin implements ChatbotPlugin {
  readonly id = 'analytics';
  readonly name = 'Analytics Plugin';
  readonly version = '1.0.0';

  private trackEvent: (event: string, data?: any) => void;

  constructor(trackEvent: (event: string, data?: any) => void) {
    this.trackEvent = trackEvent;
  }

  onInit(): void {
    this.trackEvent('chatbot:initialized', {
      timestamp: new Date().toISOString()
    });
    console.log('[AnalyticsPlugin] Initialized');
  }

  onDestroy(): void {
    this.trackEvent('chatbot:destroyed', {
      timestamp: new Date().toISOString()
    });
    console.log('[AnalyticsPlugin] Destroyed');
  }

  onMessageSent(message: ChatbotMessage): void {
    this.trackEvent('chatbot:message:sent', {
      messageId: message.id,
      messageLength: message.text.length,
      hasFiles: !!message.files && message.files.length > 0,
      timestamp: message.timestamp
    });
  }

  onMessageReceived(message: ChatbotMessage): void {
    this.trackEvent('chatbot:message:received', {
      messageId: message.id,
      messageLength: message.text.length,
      sender: message.sender,
      timestamp: message.timestamp
    });
  }

  onError(error: Error): void {
    this.trackEvent('chatbot:error', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
}
