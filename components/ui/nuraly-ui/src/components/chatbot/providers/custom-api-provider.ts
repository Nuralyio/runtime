/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import type {
    ChatbotProvider,
    ProviderCapabilities,
    ProviderConfig,
    ChatbotContext
} from '../core/types.js';

/**
 * Custom API provider for any REST/HTTP backend
 * Can be extended for custom implementations
 */
export class CustomAPIProvider implements ChatbotProvider {
  readonly id = 'custom-api';
  readonly name = 'Custom API';
  readonly capabilities: ProviderCapabilities = {
    streaming: true,
    fileUpload: false,
    modules: false,
    functions: false
  };

  protected apiUrl: string = '';
  protected headers: Record<string, string> = {};
  protected connected: boolean = false;

  async connect(config: ProviderConfig): Promise<void> {
    if (!config.apiUrl) {
      throw new Error('API URL is required');
    }

    this.apiUrl = config.apiUrl;
    
    // Build headers - config.headers can override defaults
    this.headers = {
      ...config.headers
    };

    // Set Content-Type default only if not provided
    if (!this.headers['Content-Type']) {
      this.headers['Content-Type'] = 'application/json';
    }

    if (config.apiKey) {
      this.headers['Authorization'] = `Bearer ${config.apiKey}`;
    }

    this.connected = true;
    console.log('[CustomAPIProvider] Connected');
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    console.log('[CustomAPIProvider] Disconnected');
  }

  isConnected(): boolean {
    return this.connected;
  }

  async *sendMessage(text: string, context: ChatbotContext): AsyncIterator<string> {
    if (!this.connected) {
      yield this.formatError('Provider not connected', 'Please check your connection settings.');
      return;
    }

    try {
      const payload = this.buildPayload(text, context);

      // Check if Content-Type is multipart/form-data
      const isMultipart = this.headers['Content-Type']?.includes('multipart/form-data');
      
      let body: any;
      let headers: Record<string, string>;

      if (isMultipart && typeof payload === 'object' && !(payload instanceof FormData)) {
        // Convert payload object to FormData
        const formData = new FormData();
        for (const [key, value] of Object.entries(payload)) {
          if (value !== undefined && value !== null) {
            formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
          }
        }
        body = formData;
        // Don't set Content-Type header - browser will set it with boundary
        headers = { ...this.headers };
        delete headers['Content-Type'];
      } else if (payload instanceof FormData) {
        // Payload is already FormData
        body = payload;
        headers = { ...this.headers };
        delete headers['Content-Type'];
      } else {
        // Use JSON
        body = JSON.stringify(payload);
        headers = this.headers;
      }

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers,
        body
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText);
        yield this.formatError(
          `${response.status} ${response.statusText}`,
          errorText || 'The server returned an error. Please try again.'
        );
        return;
      }

      if (!response.body) {
        yield this.formatError('Response Error', 'The server response body is empty.');
        return;
      }

      // Check if response is streaming or text/plain
      const contentType = response.headers.get('content-type');
      const isStreamingResponse = contentType?.includes('text/event-stream') || 
                                  contentType?.includes('stream') ||
                                  contentType?.includes('text/plain');
      
      if (isStreamingResponse) {
        // Handle streaming response (including text/plain)
        const streamIterator = this.handleStreamResponse(response);
        let result = await streamIterator.next();
        while (!result.done) {
          yield result.value;
          result = await streamIterator.next();
        }
      } else {
        // Handle non-streaming JSON response
        try {
          const data = await response.json();
          yield this.extractMessage(data);
        } catch (jsonError) {
          yield this.formatError('Parse Error', 'Failed to parse the server response.');
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      yield this.formatError('Network Error', errorMessage);
      this.onError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  protected async *handleStreamResponse(response: Response): AsyncIterator<string> {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        yield chunk;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      yield '\n\n' + this.formatError('Streaming Error', errorMessage);
      this.onError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      reader.releaseLock();
    }
  }

  protected buildPayload(text: string, context: ChatbotContext): any {
    return {
      userMessage: text,
      variables: context.metadata || {},
      stream: true
    };
  }

  protected extractMessage(data: any): string {
    // Override this method to extract message from your API response
    return data.message || data.text || data.response || JSON.stringify(data);
  }

  /**
   * Format error messages with title and description
   * Wrapped in a special marker that can be styled by the chatbot component
   */
  protected formatError(title: string, description: string): string {
    return `[ERROR_START][ERROR_TITLE_START]${title}[ERROR_TITLE_END]${description}[ERROR_END]`;
  }

  onError(error: Error): void {
    console.error('[CustomAPIProvider] Error:', error);
  }
}
