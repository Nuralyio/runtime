/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import type {
  ChatbotProvider,
  ProviderCapabilities,
  ProviderConfig,
  ChatbotContext
} from '../core/types.js';

/**
 * Message type mapping for the native WebSocket JSON protocol.
 * Each key maps a logical type to the wire string used in the `type` field.
 */
export interface NativeWebSocketMessageTypes {
  /** Type value for outgoing messages (default: 'message:send') */
  send: string;
  /** Type value for complete response (default: 'message:response') */
  response: string;
  /** Type value for streaming chunks (default: 'message:stream') */
  stream?: string;
  /** Type value for error messages (default: 'message:error') */
  error?: string;
  /** Type value for typing indicator start (default: 'typing:start') */
  typingStart?: string;
  /** Type value for typing indicator end (default: 'typing:end') */
  typingEnd?: string;
  /** Type value for outgoing heartbeat (default: 'ping') */
  ping?: string;
  /** Type value for incoming heartbeat response (default: 'pong') */
  pong?: string;
}

/**
 * Native WebSocket provider configuration
 */
export interface NativeWebSocketProviderConfig extends ProviderConfig {
  /** WebSocket URL (ws:// or wss://) */
  url: string;
  /** Sub-protocols for the WebSocket constructor */
  protocols?: string | string[];
  /** Message type mapping */
  messageTypes: NativeWebSocketMessageTypes;
  /** JSON field name used for message routing (default: 'type') */
  typeField?: string;
  /** Query parameters appended to the URL (useful for auth tokens) */
  queryParams?: Record<string, string>;
  /** Auto-reconnect on disconnect (default: true) */
  autoReconnect?: boolean;
  /** Maximum reconnection attempts (default: 5) */
  maxReconnectAttempts?: number;
  /** Base delay for reconnection in ms (default: 1000) */
  reconnectBaseDelay?: number;
  /** Maximum delay for reconnection in ms (default: 30000) */
  reconnectMaxDelay?: number;
  /** Connection timeout in ms (default: 10000) */
  connectionTimeout?: number;
  /** Response timeout in ms (default: 30000) */
  responseTimeout?: number;
  /** Enable heartbeat ping/pong (default: true) */
  enableHeartbeat?: boolean;
  /** Heartbeat interval in ms (default: 30000) */
  heartbeatInterval?: number;
  /** Heartbeat pong timeout in ms (default: 10000) */
  heartbeatTimeout?: number;
  /** Build custom payload from message and context */
  buildPayload?: (text: string, context: ChatbotContext) => any;
  /** Extract message string from response data */
  extractMessage?: (data: any) => string;
  /** Called when connection state changes */
  onConnectionChange?: (connected: boolean) => void;
  /** Called on each reconnect attempt */
  onReconnectAttempt?: (attempt: number, maxAttempts: number) => void;
}

const DEFAULT_MESSAGE_TYPES: Required<NativeWebSocketMessageTypes> = {
  send: 'message:send',
  response: 'message:response',
  stream: 'message:stream',
  error: 'message:error',
  typingStart: 'typing:start',
  typingEnd: 'typing:end',
  ping: 'ping',
  pong: 'pong'
};

/**
 * Native WebSocket provider for real-time chatbot communication.
 *
 * Uses the browser's built-in WebSocket API with a JSON envelope protocol.
 * Zero additional dependencies — works with any backend that speaks plain
 * WebSocket with JSON messages (Go, Rust, Python/FastAPI, Java/Quarkus, etc.).
 *
 * @example Basic usage
 * ```typescript
 * const provider = new NativeWebSocketProvider();
 * await provider.connect({
 *   url: 'wss://api.example.com/chat',
 *   messageTypes: {
 *     send: 'chat:message',
 *     response: 'chat:response',
 *     stream: 'chat:stream'
 *   }
 * });
 * ```
 *
 * @example With auth via query params
 * ```typescript
 * const provider = new NativeWebSocketProvider();
 * await provider.connect({
 *   url: 'wss://api.example.com/chat',
 *   queryParams: { token: 'my-jwt-token' },
 *   messageTypes: {
 *     send: 'ask',
 *     response: 'answer'
 *   }
 * });
 * ```
 *
 * @example Custom type field
 * ```typescript
 * const provider = new NativeWebSocketProvider();
 * await provider.connect({
 *   url: 'wss://api.example.com/ws',
 *   typeField: 'event',
 *   messageTypes: {
 *     send: 'user_message',
 *     response: 'bot_response',
 *     stream: 'bot_chunk'
 *   }
 * });
 * ```
 */
export class NativeWebSocketProvider implements ChatbotProvider {
  readonly id = 'native-websocket';
  readonly name = 'Native WebSocket Provider';
  readonly capabilities: ProviderCapabilities = {
    streaming: true,
    fileUpload: false,
    modules: false,
    functions: false
  };

  protected ws: WebSocket | null = null;
  protected config: NativeWebSocketProviderConfig | null = null;
  protected connected: boolean = false;
  protected responseResolvers: Map<string, {
    resolve: (value: string) => void;
    reject: (error: Error) => void;
    chunks: string[];
    isStreaming: boolean;
  }> = new Map();

  protected reconnectAttempt: number = 0;
  protected reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  protected heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  protected pongTimer: ReturnType<typeof setTimeout> | null = null;
  protected intentionalClose: boolean = false;
  protected messageListeners: Map<string, Set<(data: any) => void>> = new Map();

  async connect(config: NativeWebSocketProviderConfig): Promise<void> {
    if (!config.url) {
      throw new Error('WebSocket URL is required');
    }

    this.config = {
      ...config,
      messageTypes: { ...DEFAULT_MESSAGE_TYPES, ...config.messageTypes },
      typeField: config.typeField ?? 'type',
      autoReconnect: config.autoReconnect ?? true,
      maxReconnectAttempts: config.maxReconnectAttempts ?? 5,
      reconnectBaseDelay: config.reconnectBaseDelay ?? 1000,
      reconnectMaxDelay: config.reconnectMaxDelay ?? 30000,
      connectionTimeout: config.connectionTimeout ?? 10000,
      responseTimeout: config.responseTimeout ?? 30000,
      enableHeartbeat: config.enableHeartbeat ?? true,
      heartbeatInterval: config.heartbeatInterval ?? 30000,
      heartbeatTimeout: config.heartbeatTimeout ?? 10000
    };

    this.intentionalClose = false;
    this.reconnectAttempt = 0;

    return this.createConnection();
  }

  protected createConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = this.buildUrl();

      try {
        this.ws = this.config!.protocols
          ? new WebSocket(url, this.config!.protocols)
          : new WebSocket(url);
      } catch (error) {
        reject(new Error(`Failed to create WebSocket: ${error instanceof Error ? error.message : String(error)}`));
        return;
      }

      const timeout = setTimeout(() => {
        if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
          this.ws.close();
          reject(new Error('WebSocket connection timeout'));
        }
      }, this.config!.connectionTimeout);

      this.ws.onopen = () => {
        clearTimeout(timeout);
        this.connected = true;
        this.reconnectAttempt = 0;
        console.log('[NativeWebSocketProvider] Connected');
        this.config?.onConnectionChange?.(true);
        this.startHeartbeat();
        resolve();
      };

      this.ws.onclose = (event) => {
        clearTimeout(timeout);
        const wasConnected = this.connected;
        this.connected = false;
        this.stopHeartbeat();
        console.log('[NativeWebSocketProvider] Disconnected:', event.code, event.reason);

        if (wasConnected) {
          this.config?.onConnectionChange?.(false);
        }

        // Reject pending resolvers
        for (const [id, resolver] of this.responseResolvers) {
          if (resolver.chunks.length > 0) {
            resolver.resolve(resolver.chunks.join(''));
          } else {
            resolver.reject(new Error('WebSocket connection closed'));
          }
          this.responseResolvers.delete(id);
        }

        if (!this.intentionalClose && wasConnected) {
          this.attemptReconnect();
        } else if (!wasConnected) {
          // Connection never established
          reject(new Error(`WebSocket connection failed (code: ${event.code})`));
        }
      };

      this.ws.onerror = (event) => {
        console.error('[NativeWebSocketProvider] Error:', event);
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event);
      };
    });
  }

  protected buildUrl(): string {
    let url = this.config!.url;
    const params = this.config!.queryParams;
    if (params && Object.keys(params).length > 0) {
      const separator = url.includes('?') ? '&' : '?';
      const query = Object.entries(params)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&');
      url = `${url}${separator}${query}`;
    }
    return url;
  }

  protected handleMessage(event: MessageEvent): void {
    if (!this.config) return;

    let data: any;
    try {
      data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
    } catch {
      console.warn('[NativeWebSocketProvider] Non-JSON message received:', event.data);
      return;
    }

    const typeField = this.config.typeField!;
    const messageType = data[typeField];
    const types = this.config.messageTypes as Required<NativeWebSocketMessageTypes>;

    // Handle heartbeat pong
    if (messageType === types.pong) {
      this.handlePong();
      return;
    }

    // Handle heartbeat ping from server (respond with pong)
    if (messageType === types.ping) {
      this.send(types.pong, { timestamp: Date.now() });
      return;
    }

    // Dispatch to registered listeners
    if (messageType) {
      const listeners = this.messageListeners.get(messageType);
      if (listeners) {
        for (const cb of listeners) {
          try { cb(data); } catch (e) { console.error('[NativeWebSocketProvider] Listener error:', e); }
        }
      }
    }

    // Handle response (complete message)
    if (messageType === types.response) {
      const messageId = this.extractMessageId(data);
      const resolver = this.responseResolvers.get(messageId) || this.getLatestResolver();

      if (resolver) {
        const message = this.extractMessageContent(data);
        resolver.resolve(message);
        this.responseResolvers.delete(messageId);
      }
      return;
    }

    // Handle stream chunk
    if (messageType === types.stream) {
      const messageId = this.extractMessageId(data);
      const resolver = this.responseResolvers.get(messageId) || this.getLatestResolver();

      if (resolver) {
        resolver.isStreaming = true;
        const chunk = this.extractMessageContent(data);
        resolver.chunks.push(chunk);
      }
      return;
    }

    // Handle error
    if (messageType === types.error) {
      const messageId = this.extractMessageId(data);
      const resolver = this.responseResolvers.get(messageId) || this.getLatestResolver();

      if (resolver) {
        const errorMsg = data.error || data.message || 'Unknown error';
        resolver.reject(new Error(errorMsg));
        this.responseResolvers.delete(messageId);
      }
      return;
    }
  }

  protected getLatestResolver() {
    const keys = Array.from(this.responseResolvers.keys());
    if (keys.length > 0) {
      return this.responseResolvers.get(keys[keys.length - 1]);
    }
    return null;
  }

  protected extractMessageId(data: any): string {
    return data.messageId || data.id || data.executionId || 'default';
  }

  protected extractMessageContent(data: any): string {
    if (this.config?.extractMessage) {
      return this.config.extractMessage(data);
    }

    if (typeof data === 'string') return data;
    if (data.message) return data.message;
    if (data.text) return data.text;
    if (data.response) return data.response;
    if (data.content) return data.content;
    if (data.data?.message) return data.data.message;
    if (data.data?.output) return JSON.stringify(data.data.output);

    return JSON.stringify(data);
  }

  // --- Heartbeat ---

  protected startHeartbeat(): void {
    if (!this.config?.enableHeartbeat) return;

    this.stopHeartbeat();
    const types = this.config.messageTypes as Required<NativeWebSocketMessageTypes>;

    this.heartbeatTimer = setInterval(() => {
      if (this.connected && this.ws?.readyState === WebSocket.OPEN) {
        this.send(types.ping, { timestamp: Date.now() });

        // Start pong timeout
        this.pongTimer = setTimeout(() => {
          console.warn('[NativeWebSocketProvider] Heartbeat timeout — closing connection');
          this.ws?.close(4000, 'Heartbeat timeout');
        }, this.config!.heartbeatTimeout);
      }
    }, this.config.heartbeatInterval);
  }

  protected handlePong(): void {
    if (this.pongTimer) {
      clearTimeout(this.pongTimer);
      this.pongTimer = null;
    }
  }

  protected stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.pongTimer) {
      clearTimeout(this.pongTimer);
      this.pongTimer = null;
    }
  }

  // --- Reconnection ---

  protected attemptReconnect(): void {
    if (!this.config?.autoReconnect) return;
    if (this.reconnectAttempt >= this.config.maxReconnectAttempts!) {
      console.error('[NativeWebSocketProvider] Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempt++;
    const base = this.config.reconnectBaseDelay!;
    const max = this.config.reconnectMaxDelay!;
    const delay = Math.min(base * Math.pow(2, this.reconnectAttempt - 1) + Math.random() * base, max);

    console.log(`[NativeWebSocketProvider] Reconnecting in ${Math.round(delay)}ms (attempt ${this.reconnectAttempt}/${this.config.maxReconnectAttempts})`);
    this.config.onReconnectAttempt?.(this.reconnectAttempt, this.config.maxReconnectAttempts!);

    this.reconnectTimer = setTimeout(async () => {
      try {
        await this.createConnection();
        console.log('[NativeWebSocketProvider] Reconnected successfully');
      } catch {
        // onclose handler will trigger next attempt
      }
    }, delay);
  }

  // --- Provider interface ---

  async disconnect(): Promise<void> {
    this.intentionalClose = true;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.stopHeartbeat();

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.connected = false;
    this.responseResolvers.clear();
    this.messageListeners.clear();
    console.log('[NativeWebSocketProvider] Disconnected');
  }

  isConnected(): boolean {
    return this.connected && this.ws?.readyState === WebSocket.OPEN;
  }

  async *sendMessage(text: string, context: ChatbotContext): AsyncIterator<string> {
    if (!this.connected || !this.ws || !this.config) {
      yield this.formatError('Not Connected', 'WebSocket is not connected. Please check your connection.');
      return;
    }

    const messageId = `msg_${Date.now()}_${crypto.randomUUID().slice(0, 9)}`;
    const payload = this.buildPayload(text, context, messageId);

    try {
      const responsePromise = new Promise<string>((resolve, reject) => {
        this.responseResolvers.set(messageId, {
          resolve,
          reject,
          chunks: [],
          isStreaming: false
        });

        setTimeout(() => {
          const resolver = this.responseResolvers.get(messageId);
          if (resolver) {
            if (resolver.chunks.length > 0) {
              resolve(resolver.chunks.join(''));
            } else {
              reject(new Error('Response timeout'));
            }
            this.responseResolvers.delete(messageId);
          }
        }, this.config!.responseTimeout);
      });

      // Send the message
      const types = this.config.messageTypes as Required<NativeWebSocketMessageTypes>;
      this.send(types.send, { ...payload, messageId });

      // If streaming is enabled, yield chunks as they arrive
      if (this.config.messageTypes.stream) {
        const resolver = this.responseResolvers.get(messageId);
        let lastYieldedLength = 0;

        const checkInterval = setInterval(() => {
          if (resolver && resolver.chunks.length > lastYieldedLength) {
            lastYieldedLength = resolver.chunks.length;
          }
        }, 50);

        try {
          const response = await responsePromise;
          clearInterval(checkInterval);
          yield response;
        } catch (error) {
          clearInterval(checkInterval);
          throw error;
        }
      } else {
        const response = await responsePromise;
        yield response;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      yield this.formatError('WebSocket Error', errorMessage);
      this.onError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  // --- Public convenience methods ---

  /**
   * Send a typed JSON message over the WebSocket.
   */
  send(type: string, payload?: Record<string, any>): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN && this.config) {
      const typeField = this.config.typeField!;
      const message = { [typeField]: type, ...payload };
      this.ws.send(JSON.stringify(message));
    }
  }

  /**
   * Subscribe to messages of a specific type. Returns an unsubscribe function.
   */
  onMessage(type: string, callback: (data: any) => void): () => void {
    if (!this.messageListeners.has(type)) {
      this.messageListeners.set(type, new Set());
    }
    this.messageListeners.get(type)!.add(callback);

    return () => {
      const listeners = this.messageListeners.get(type);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.messageListeners.delete(type);
        }
      }
    };
  }

  /**
   * Get the underlying WebSocket instance for advanced usage.
   */
  getWebSocket(): WebSocket | null {
    return this.ws;
  }

  // --- Protected helpers ---

  protected buildPayload(text: string, context: ChatbotContext, messageId: string): any {
    if (this.config?.buildPayload) {
      const customPayload = this.config.buildPayload(text, context);
      return { ...customPayload, messageId };
    }

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

  protected formatError(title: string, description: string): string {
    return `[ERROR_START][ERROR_TITLE_START]${title}[ERROR_TITLE_END]${description}[ERROR_END]`;
  }

  onError(error: Error): void {
    console.error('[NativeWebSocketProvider] Error:', error);
  }
}
