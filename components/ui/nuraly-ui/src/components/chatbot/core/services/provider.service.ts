/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { EventBus } from '../event-bus.js';
import { StateHandler } from '../handlers/state-handler.js';
import { MessageHandler } from '../handlers/message-handler.js';
import type { ChatbotProvider, ChatbotUICallbacks, ChatbotContext, ChatbotPlugin } from '../types.js';
import type { ChatbotMessage } from '../../chatbot.types.js';

/**
 * ProviderService - Handles AI/API provider integration
 * Processes messages with external providers and manages streaming responses
 */
export class ProviderService {
  private provider?: ChatbotProvider;

  constructor(
    provider: ChatbotProvider | undefined,
    private stateHandler: StateHandler,
    private messageHandler: MessageHandler,
    private eventBus: EventBus,
    private ui: ChatbotUICallbacks,
    private plugins: Map<string, ChatbotPlugin>
  ) {
    this.provider = provider;
  }

  /**
   * Set or update provider
   */
  setProvider(provider: ChatbotProvider): void {
    this.provider = provider;
  }

  /**
   * Check if provider is available and connected
   */
  hasProvider(): boolean {
    return !!this.provider && this.provider.isConnected();
  }

  /**
   * Process message with provider
   */
  async processMessage(message: ChatbotMessage): Promise<void> {
    if (!this.provider) {
      this.log('No provider configured');
      return;
    }

    if (!this.provider.isConnected()) {
      this.log('Provider not connected, skipping');
      return;
    }

    try {
      // Notify UI - processing started
      if (this.ui.onProcessingStart) {
        this.ui.onProcessingStart();
      }
      if (this.ui.onTypingStart) {
        this.ui.onTypingStart();
      }
      
      this.stateHandler.setTyping(true);
      this.stateHandler.setProcessing(true);
      this.eventBus.emit('processing:start');

      // Get response stream
      const context = this.buildContext();
      const stream = this.provider.sendMessage(message.text, context);

      // Process stream
      await this.processStream(stream);

    } catch (error) {
      this.logError('Provider error:', error);
      this.eventBus.emit('error', error);
      throw error;
    } finally {
      // Notify UI - processing ended
      if (this.ui.onProcessingEnd) {
        this.ui.onProcessingEnd();
      }
      if (this.ui.onTypingEnd) {
        this.ui.onTypingEnd();
      }
      
      this.stateHandler.setTyping(false);
      this.stateHandler.setProcessing(false);
      this.eventBus.emit('processing:end');
    }
  }

  /**
   * Process streaming response from provider
   */
  async processStream(stream: AsyncIterator<string>): Promise<void> {
    let botMessage: ChatbotMessage | null = null;

    try {
      let done = false;
      while (!done) {
        const result = await stream.next();
        done = result.done || false;
        
        if (done || !result.value) break;
        
        const chunk = result.value;

        // Apply plugin transformations
        let processedChunk = chunk;
        for (const plugin of this.plugins.values()) {
          if (plugin.afterReceive) {
            processedChunk = await plugin.afterReceive(processedChunk);
          }
        }

        if (!botMessage) {
          // First chunk - create new bot message
          botMessage = this.messageHandler.createBotMessage(processedChunk);
          this.stateHandler.addMessageToState(botMessage);
        } else {
          // Subsequent chunks - append to existing message
          this.messageHandler.appendToBotMessage(botMessage.id, processedChunk);
          botMessage.text += processedChunk; // Keep local reference in sync
        }
      }
    } catch (error) {
      this.logError('Error processing stream:', error);
      throw error;
    }
  }

  /**
   * Build context for provider
   */
  buildContext(): ChatbotContext {
    const state = this.stateHandler.getState();
    
    return {
      messages: state.messages,
      metadata: state.metadata,
      selectedModules: state.selectedModules
    };
  }

  /**
   * Upload file to provider (if supported)
   */
  async uploadFileToProvider(file: File): Promise<any> {
    if (!this.provider?.capabilities?.fileUpload || !this.provider.uploadFile) {
      throw new Error('Provider does not support file upload');
    }

    return await this.provider.uploadFile(file);
  }

  /**
   * Get provider capabilities
   */
  getCapabilities() {
    return this.provider?.capabilities || {
      streaming: false,
      fileUpload: false,
      contextWindow: 0
    };
  }

  /**
   * Log message
   */
  private log(message: string, ...args: any[]): void {
    console.log(`[ProviderService] ${message}`, ...args);
  }

  /**
   * Log error
   */
  private logError(message: string, error: any): void {
    console.error(`[ProviderService] ${message}`, error);
  }
}
