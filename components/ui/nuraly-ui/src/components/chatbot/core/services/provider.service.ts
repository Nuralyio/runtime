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
  private cancelRequested = false;

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

  setProvider(provider: ChatbotProvider): void {
    this.provider = provider;
  }

  /**
   * Stop current processing/stream consumption
   */
  stopCurrentProcessing(): void {
    this.cancelRequested = true;
    this.eventBus.emit('processing:stopped');
  }

  hasProvider(): boolean {
    return !!this.provider && this.provider.isConnected();
  }

  async processMessage(message: ChatbotMessage): Promise<void> {
    if (!this.provider) {
      this.log('No provider configured');
      return;
    }

    if (!this.provider.isConnected()) {
      this.log('Provider not connected, attempting to connect...');
      try {
        await this.provider.connect({});
      } catch (err) {
        this.logError('Failed to auto-connect provider:', err);
      }
      if (!this.provider.isConnected()) {
        this.log('Provider is still not connected after attempt; aborting processing');
        return;
      }
    }

    try {
      this.cancelRequested = false;

      if (this.ui.onProcessingStart) {
        this.ui.onProcessingStart();
      }
      if (this.ui.onTypingStart) {
        this.ui.onTypingStart();
      }
      
      this.stateHandler.setTyping(true);
      this.stateHandler.setProcessing(true);
      this.eventBus.emit('processing:start');

      const context = this.buildContext();
      const stream = this.provider.sendMessage(message.text, context);

      await this.processStream(stream);

    } catch (error) {
      this.logError('Provider error:', error);
      this.eventBus.emit('error', error);
      throw error;
    } finally {
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
    const tagAwarePlugins = Array.from(this.plugins.values()).filter(p => Array.isArray((p as any).htmlTags)) as any[];
    const openTags: Array<{ plugin: any; name: string; open: string; close: string; buffer: string }> = [];
    let lastRaw = '';

    try {
      let done = false;
      while (!done) {
        if (this.cancelRequested) {
          break;
        }
        const result = await stream.next();
        done = result.done || false;
        if (done || !result.value) break;

        const currentRaw = String(result.value);
        let incoming = currentRaw.startsWith(lastRaw) ? currentRaw.slice(lastRaw.length) : currentRaw;
        lastRaw = currentRaw;

        let remaining = incoming;
        let processedChunk = '';
        let chunkHasHtml = false;

        while (remaining.length) {
          const current = openTags[openTags.length - 1];
          if (current) {
            const closeIdx = remaining.indexOf(current.close);
            if (closeIdx === -1) {
              current.buffer += remaining;
              remaining = '';
              break;
            }
            current.buffer += remaining.slice(0, closeIdx);
            const html = typeof current.plugin.renderHtmlBlock === 'function'
              ? current.plugin.renderHtmlBlock(current.name, current.buffer)
              : '';
            if (html) {
              processedChunk += html;
              chunkHasHtml = true;
            }
            openTags.pop();
            remaining = remaining.slice(closeIdx + current.close.length);
            continue;
          }

          let nextOpen: { idx: number; plugin: any; name: string; open: string; close: string } | null = null;
          for (const plugin of tagAwarePlugins) {
            for (const tag of (plugin.htmlTags as any[])) {
              const idx = remaining.indexOf(tag.open);
              if (idx !== -1 && (!nextOpen || idx < nextOpen.idx)) {
                nextOpen = { idx, plugin, name: tag.name, open: tag.open, close: tag.close };
              }
            }
          }

          if (!nextOpen) {
            processedChunk += remaining;
            remaining = '';
          } else {
            processedChunk += remaining.slice(0, nextOpen.idx);
            openTags.push({ plugin: nextOpen.plugin, name: nextOpen.name, open: nextOpen.open, close: nextOpen.close, buffer: '' });
            remaining = remaining.slice(nextOpen.idx + nextOpen.open.length);
          }
        }

        if (processedChunk) {
          for (const plugin of this.plugins.values()) {
            const isTagAware = Array.isArray((plugin as any).htmlTags) && (plugin as any).htmlTags.length > 0;
            if (!isTagAware && plugin.afterReceive) {
              processedChunk = await plugin.afterReceive(processedChunk);
            }
          }
        }

        const isHtml = chunkHasHtml || /<\w+[^>]*>/.test(processedChunk);
        if (!botMessage) {
          botMessage = this.messageHandler.createBotMessage(processedChunk, isHtml ? { renderAsHtml: true } : undefined);
          this.stateHandler.addMessageToState(botMessage);
          if (this.ui.onTypingEnd) {
            this.ui.onTypingEnd();
          }
          this.stateHandler.setTyping(false);
        } else if (processedChunk) {
          this.messageHandler.appendToBotMessage(botMessage.id, processedChunk);
          botMessage.text += processedChunk;
          if (isHtml && !botMessage.metadata?.renderAsHtml) {
            this.messageHandler.updateMessage(botMessage.id, { metadata: { ...(botMessage.metadata || {}), renderAsHtml: true } });
          }
        }
      }

      if (!this.cancelRequested && botMessage && openTags.length > 0) {
        const leftover = openTags.map(t => t.open + t.buffer).join('');
        if (leftover) this.messageHandler.appendToBotMessage(botMessage.id, leftover);
      }
    } catch (error) {
      this.logError('Error processing stream:', error);
      throw error;
    }
  }

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

  getCapabilities() {
    return this.provider?.capabilities || {
      streaming: false,
      fileUpload: false,
      contextWindow: 0
    };
  }

  private log(message: string, ...args: any[]): void {
    console.log(`[ProviderService] ${message}`, ...args);
  }

  private logError(message: string, error: any): void {
    console.error(`[ProviderService] ${message}`, error);
  }
}
