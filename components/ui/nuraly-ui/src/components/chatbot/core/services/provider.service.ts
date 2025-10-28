/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { EventBus } from '../event-bus.js';
import { StateHandler } from '../handlers/state-handler.js';
import { MessageHandler } from '../handlers/message-handler.js';
import { FileHandler } from '../handlers/file-handler.js';
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
    private fileHandler: FileHandler,
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
      
      // Clear uploaded files after message is processed
      this.fileHandler.clearFiles();
    }
  }

  /**
   * Process streaming response from provider
   */
  async processStream(stream: AsyncIterator<string>): Promise<void> {
    let botMessage: ChatbotMessage | null = null;
    const tagAwarePlugins = Array.from(this.plugins.values()).filter(p => Array.isArray((p as any).htmlTags)) as any[];
    const openTags: Array<{ plugin: any; name: string; open: string; close: string; buffer: string }> = [];
    let textBuffer = ''; // Buffer for accumulating text to search for tags
    let lastCumulative = ''; // Track last cumulative value to detect incremental changes

    console.log('[ProviderService] Starting stream processing, tagAwarePlugins:', tagAwarePlugins.map(p => p.id));

    try {
      let done = false;
      while (!done) {
        if (this.cancelRequested) {
          break;
        }
        const result = await stream.next();
        done = result.done || false;
        if (done || !result.value) break;

        // Handle cumulative streaming - extract only new characters
        const currentCumulative = String(result.value);
        const newChunk = currentCumulative.startsWith(lastCumulative) 
          ? currentCumulative.slice(lastCumulative.length) 
          : currentCumulative;
        lastCumulative = currentCumulative;
        
        // Add only the NEW chunk to buffer
        textBuffer += newChunk;
        
        console.log('[ProviderService] New chunk:', JSON.stringify(newChunk), 'buffer length:', textBuffer.length, 'openTags:', openTags.length);

        let processedChunk = '';
        let chunkHasHtml = false;

        // Process the entire buffer to find tags
        while (textBuffer.length) {
          const current = openTags[openTags.length - 1];
          
          if (current) {
            // We're inside a tag, look for closing tag in the combined buffer
            // We need to check both the accumulated buffer AND new text
            const combined = current.buffer + textBuffer;
            const closeIdx = combined.indexOf(current.close);
            
            if (closeIdx === -1) {
              // Closing tag not found yet, keep buffering
              current.buffer = combined;
              textBuffer = '';
              break;
            }
            
            // Found closing tag in combined buffer
            const content = combined.slice(0, closeIdx);
            const html = typeof current.plugin.renderHtmlBlock === 'function'
              ? current.plugin.renderHtmlBlock(current.name, content)
              : '';
            console.log('[ProviderService] Closing tag:', current.name, 'content length:', content.length, 'html:', html ? 'rendered' : 'empty');
            if (html) {
              processedChunk += html;
              chunkHasHtml = true;
            }
            openTags.pop();
            
            // Put remaining text back in textBuffer
            const afterClose = combined.slice(closeIdx + current.close.length);
            textBuffer = afterClose;
            continue;
          }

          // Not inside a tag, look for opening tags
          let nextOpen: { idx: number; plugin: any; name: string; open: string; close: string } | null = null;
          for (const plugin of tagAwarePlugins) {
            for (const tag of (plugin.htmlTags as any[])) {
              const idx = textBuffer.indexOf(tag.open);
              if (idx !== -1 && (!nextOpen || idx < nextOpen.idx)) {
                nextOpen = { idx, plugin, name: tag.name, open: tag.open, close: tag.close };
              }
            }
          }

          if (!nextOpen) {
            // No opening tag found - check if buffer might contain partial tag
            let maxTagLength = 0;
            for (const plugin of tagAwarePlugins) {
              for (const tag of (plugin.htmlTags as any[])) {
                maxTagLength = Math.max(maxTagLength, tag.open.length);
              }
            }
            
            // Keep last N characters in buffer (where N = max tag length - 1) in case tag is split
            if (textBuffer.length > maxTagLength - 1) {
              const safeLength = textBuffer.length - (maxTagLength - 1);
              processedChunk += textBuffer.slice(0, safeLength);
              textBuffer = textBuffer.slice(safeLength);
            }
            break;
          } else {
            console.log('[ProviderService] Found opening tag at idx:', nextOpen.idx, 'tag:', nextOpen.open);
            processedChunk += textBuffer.slice(0, nextOpen.idx);
            openTags.push({ plugin: nextOpen.plugin, name: nextOpen.name, open: nextOpen.open, close: nextOpen.close, buffer: '' });
            textBuffer = textBuffer.slice(nextOpen.idx + nextOpen.open.length);
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

        console.log('[ProviderService] Processed chunk:', JSON.stringify(processedChunk), 'chunkHasHtml:', chunkHasHtml);

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

      if (!this.cancelRequested && botMessage) {
        console.log('[ProviderService] Stream ended. textBuffer:', JSON.stringify(textBuffer), 'openTags:', openTags.length);
        
        // Flush any remaining text buffer at the end
        if (textBuffer) {
          console.log('[ProviderService] Flushing textBuffer:', JSON.stringify(textBuffer));
          this.messageHandler.appendToBotMessage(botMessage.id, textBuffer);
        }
        
        // Handle any unclosed tags
        if (openTags.length > 0) {
          for (const tag of openTags) {
            console.log('[ProviderService] Unclosed tag:', tag.name, 'buffer:', JSON.stringify(tag.buffer.substring(0, 100)));
          }
          
          const leftover = openTags.map(t => t.open + t.buffer).join('');
          if (leftover) this.messageHandler.appendToBotMessage(botMessage.id, leftover);
        }
      }
    } catch (error) {
      this.logError('Error processing stream:', error);
      throw error;
    }
  }  buildContext(): ChatbotContext {
    const state = this.stateHandler.getState();
    const currentThread = state.currentThreadId 
      ? state.threads.find(t => t.id === state.currentThreadId)
      : undefined;
    
    return {
      messages: state.messages,
      metadata: state.metadata,
      selectedModules: state.selectedModules,
      currentThread: currentThread,
      uploadedFiles: state.uploadedFiles
    };
  }

  /**
   * Upload file to provider (if supported)
   */
  async uploadFileToProvider(file: File): Promise<any> {
    if (!this.provider?.capabilities?.fileUpload || !this.provider.uploadFile) {
      throw new Error('Provider does not support file upload');
    }

    const context = this.buildContext();
    return await this.provider.uploadFile(file, context);
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
