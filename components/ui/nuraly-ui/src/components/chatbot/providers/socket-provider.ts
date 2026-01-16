/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { io, Socket } from 'socket.io-client';
import type {
  ChatbotProvider,
  ProviderCapabilities,
  ProviderConfig,
  ChatbotContext
} from '../core/types.js';

/**
 * Socket.io event configuration
 */
export interface SocketEventConfig {
  /** Event name to emit when sending a message */
  send: string;
  /** Event name for complete response */
  response: string;
  /** Event name for streaming chunks (optional) */
  stream?: string;
  /** Event name for errors */
  error?: string;
  /** Event name for typing indicator start */
  typingStart?: string;
  /** Event name for typing indicator end */
  typingEnd?: string;
}

/**
 * Socket provider configuration
 */
export interface SocketProviderConfig extends ProviderConfig {
  /** Socket.io server URL */
  url: string;
  /** Socket.io path (default: /socket.io) */
  path?: string;
  /** Socket.io namespace (optional) */
  namespace?: string;
  /** Event names configuration */
  events: SocketEventConfig;
  /** Custom headers for socket handshake */
  headers?: Record<string, string>;
  /** Auto-reconnect on disconnect (default: true) */
  autoReconnect?: boolean;
  /** Reconnection attempts (default: 5) */
  reconnectionAttempts?: number;
  /** Build custom payload from message and context */
  buildPayload?: (text: string, context: ChatbotContext) => any;
  /** Extract message from response data */
  extractMessage?: (data: any) => string;
  /** Response timeout in ms (default: 30000) */
  responseTimeout?: number;
}

/**
 * Default event names
 */
const DEFAULT_EVENTS: SocketEventConfig = {
  send: 'message:send',
  response: 'message:response',
  stream: 'message:stream',
  error: 'message:error',
  typingStart: 'typing:start',
  typingEnd: 'typing:end'
};

/**
 * Generic Socket.io provider for real-time chatbot communication
 *
 * Works with any socket.io backend - workflows, custom AI servers, etc.
 *
 * @example Basic usage
 * ```typescript
 * const provider = new SocketProvider();
 * await provider.connect({
 *   url: 'http://localhost:8000',
 *   path: '/socket.io/chat',
 *   events: {
 *     send: 'chat:message',
 *     response: 'chat:response',
 *     stream: 'chat:stream'
 *   }
 * });
 * ```
 *
 * @example With custom payload builder
 * ```typescript
 * const provider = new SocketProvider();
 * await provider.connect({
 *   url: 'http://localhost:8000',
 *   events: { send: 'ask', response: 'answer' },
 *   buildPayload: (text, context) => ({
 *     question: text,
 *     threadId: context.currentThread?.id,
 *     modules: context.selectedModules
 *   })
 * });
 * ```
 *
 * @example Workflow backend
 * ```typescript
 * const provider = new SocketProvider();
 * await provider.connect({
 *   url: 'http://localhost:8000',
 *   path: '/socket.io/workflow',
 *   events: {
 *     send: 'workflow:trigger',
 *     response: 'execution:completed',
 *     stream: 'execution:node-completed',
 *     error: 'execution:failed'
 *   },
 *   buildPayload: (text, context) => ({
 *     workflowId: context.metadata.workflowId,
 *     input: { message: text }
 *   })
 * });
 * ```
 */
export class SocketProvider implements ChatbotProvider {
  readonly id = 'socket';
  readonly name = 'Socket.io Provider';
  readonly capabilities: ProviderCapabilities = {
    streaming: true,
    fileUpload: false,
    modules: false,
    functions: false
  };

  protected socket: Socket | null = null;
  protected config: SocketProviderConfig | null = null;
  protected connected: boolean = false;
  protected responseResolvers: Map<string, {
    resolve: (value: string) => void;
    reject: (error: Error) => void;
    chunks: string[];
    isStreaming: boolean;
  }> = new Map();

  async connect(config: SocketProviderConfig): Promise<void> {
    if (!config.url) {
      throw new Error('Socket URL is required');
    }

    this.config = {
      ...config,
      events: { ...DEFAULT_EVENTS, ...config.events },
      autoReconnect: config.autoReconnect ?? true,
      reconnectionAttempts: config.reconnectionAttempts ?? 5,
      responseTimeout: config.responseTimeout ?? 30000
    };

    const socketUrl = config.namespace
      ? `${config.url}${config.namespace}`
      : config.url;

    this.socket = io(socketUrl, {
      path: config.path || '/socket.io',
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: this.config.autoReconnect,
      reconnectionAttempts: this.config.reconnectionAttempts,
      extraHeaders: config.headers
    });

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Socket connection timeout'));
      }, 10000);

      this.socket!.on('connect', () => {
        clearTimeout(timeout);
        this.connected = true;
        console.log('[SocketProvider] Connected:', this.socket!.id);
        resolve();
      });

      this.socket!.on('connect_error', (error) => {
        clearTimeout(timeout);
        console.error('[SocketProvider] Connection error:', error);
        reject(error);
      });

      this.socket!.on('disconnect', (reason) => {
        this.connected = false;
        console.log('[SocketProvider] Disconnected:', reason);
      });

      // Setup event listeners
      this.setupEventListeners();
    });
  }

  protected setupEventListeners(): void {
    if (!this.socket || !this.config) return;

    const events = this.config.events;

    // Response event (complete message)
    this.socket.on(events.response, (data: any) => {
      console.log('[SocketProvider] Response received:', data);
      const messageId = this.extractMessageId(data);
      const resolver = this.responseResolvers.get(messageId) ||
                       this.getLatestResolver();

      if (resolver) {
        const message = this.extractMessage(data);
        resolver.resolve(message);
        this.responseResolvers.delete(messageId);
      }
    });

    // Stream event (chunks)
    if (events.stream) {
      this.socket.on(events.stream, (data: any) => {
        console.log('[SocketProvider] Stream chunk:', data);
        const messageId = this.extractMessageId(data);
        const resolver = this.responseResolvers.get(messageId) ||
                         this.getLatestResolver();

        if (resolver) {
          resolver.isStreaming = true;
          const chunk = this.extractMessage(data);
          resolver.chunks.push(chunk);
        }
      });
    }

    // Error event
    if (events.error) {
      this.socket.on(events.error, (data: any) => {
        console.error('[SocketProvider] Error event:', data);
        const messageId = this.extractMessageId(data);
        const resolver = this.responseResolvers.get(messageId) ||
                         this.getLatestResolver();

        if (resolver) {
          const errorMsg = data.error || data.message || 'Unknown error';
          resolver.reject(new Error(errorMsg));
          this.responseResolvers.delete(messageId);
        }
      });
    }
  }

  protected getLatestResolver() {
    // Get the most recent resolver if no messageId match
    const keys = Array.from(this.responseResolvers.keys());
    if (keys.length > 0) {
      return this.responseResolvers.get(keys[keys.length - 1]);
    }
    return null;
  }

  protected extractMessageId(data: any): string {
    return data.messageId || data.id || data.executionId || 'default';
  }

  protected extractMessage(data: any): string {
    if (this.config?.extractMessage) {
      return this.config.extractMessage(data);
    }

    // Try common response formats
    if (typeof data === 'string') return data;
    if (data.message) return data.message;
    if (data.text) return data.text;
    if (data.response) return data.response;
    if (data.content) return data.content;
    if (data.data?.message) return data.data.message;
    if (data.data?.output) return JSON.stringify(data.data.output);

    return JSON.stringify(data);
  }

  async disconnect(): Promise<void> {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.connected = false;
    this.responseResolvers.clear();
    console.log('[SocketProvider] Disconnected');
  }

  isConnected(): boolean {
    return this.connected && this.socket?.connected === true;
  }

  async *sendMessage(text: string, context: ChatbotContext): AsyncIterator<string> {
    if (!this.connected || !this.socket || !this.config) {
      yield this.formatError('Not Connected', 'Socket is not connected. Please check your connection.');
      return;
    }

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const payload = this.buildPayload(text, context, messageId);

    try {
      // Create a promise that will be resolved when we get a response
      const responsePromise = new Promise<string>((resolve, reject) => {
        this.responseResolvers.set(messageId, {
          resolve,
          reject,
          chunks: [],
          isStreaming: false
        });

        // Set timeout
        setTimeout(() => {
          const resolver = this.responseResolvers.get(messageId);
          if (resolver) {
            // If we have chunks, resolve with them
            if (resolver.chunks.length > 0) {
              resolve(resolver.chunks.join(''));
            } else {
              reject(new Error('Response timeout'));
            }
            this.responseResolvers.delete(messageId);
          }
        }, this.config!.responseTimeout);
      });

      // Emit the message
      console.log('[SocketProvider] Sending message:', this.config.events.send, payload);
      this.socket.emit(this.config.events.send, payload);

      // If streaming is enabled, yield chunks as they come
      if (this.config.events.stream) {
        const resolver = this.responseResolvers.get(messageId);
        let lastYieldedLength = 0;

        // Poll for chunks while waiting for response
        const checkInterval = setInterval(() => {
          if (resolver && resolver.chunks.length > lastYieldedLength) {
            // Don't yield here - we'll yield after the interval
            lastYieldedLength = resolver.chunks.length;
          }
        }, 50);

        // Wait for the response
        try {
          const response = await responsePromise;
          clearInterval(checkInterval);
          yield response;
        } catch (error) {
          clearInterval(checkInterval);
          throw error;
        }
      } else {
        // Non-streaming: just wait for complete response
        const response = await responsePromise;
        yield response;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      yield this.formatError('Socket Error', errorMessage);
      this.onError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  protected buildPayload(text: string, context: ChatbotContext, messageId: string): any {
    if (this.config?.buildPayload) {
      const customPayload = this.config.buildPayload(text, context);
      return { ...customPayload, messageId };
    }

    // Default payload structure
    return {
      messageId,
      message: text,
      text,
      threadId: context.currentThread?.id,
      modules: context.selectedModules,
      metadata: context.metadata,
      files: context.uploadedFiles?.map(f => ({
        id: f.id,
        name: f.name,
        type: f.type,
        url: f.url
      }))
    };
  }

  /**
   * Emit a custom event on the socket
   */
  emit(event: string, data?: any): void {
    if (this.socket && this.connected) {
      this.socket.emit(event, data);
    }
  }

  /**
   * Subscribe to a custom event
   */
  on(event: string, callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  /**
   * Unsubscribe from a custom event
   */
  off(event: string, callback?: (data: any) => void): void {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  /**
   * Get the underlying socket instance for advanced usage
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Format error messages with title and description
   */
  protected formatError(title: string, description: string): string {
    return `[ERROR_START][ERROR_TITLE_START]${title}[ERROR_TITLE_END]${description}[ERROR_END]`;
  }

  onError(error: Error): void {
    console.error('[SocketProvider] Error:', error);
  }
}
