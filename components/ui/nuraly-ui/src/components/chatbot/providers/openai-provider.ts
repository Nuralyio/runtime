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
import type { ChatbotFile, ChatbotModule } from '../chatbot.types.js';

/**
 * OpenAI provider for ChatGPT integration
 */
export class OpenAIProvider implements ChatbotProvider {
  readonly id = 'openai';
  readonly name = 'OpenAI';
  readonly capabilities: ProviderCapabilities = {
    streaming: true,
    fileUpload: true,
    modules: true,
    functions: true,
    imageGeneration: true
  };

  private apiKey: string = '';
  private apiUrl: string = 'https://api.openai.com/v1';
  private model: string = 'gpt-4';
  private temperature: number = 0.7;
  private maxTokens?: number;
  private connected: boolean = false;

  async connect(config: ProviderConfig): Promise<void> {
    if (!config.apiKey) {
      throw new Error('OpenAI API key is required');
    }

    this.apiKey = config.apiKey;
    this.apiUrl = config.apiUrl || this.apiUrl;
    this.model = config.model || this.model;
    this.temperature = config.temperature ?? this.temperature;
    this.maxTokens = config.maxTokens;

    // Verify connection
    try {
      const response = await fetch(`${this.apiUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`OpenAI connection failed: ${response.statusText}`);
      }

      this.connected = true;
      console.log('[OpenAIProvider] Connected successfully');
    } catch (error) {
      this.connected = false;
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    console.log('[OpenAIProvider] Disconnected');
  }

  isConnected(): boolean {
    return this.connected;
  }

  async *sendMessage(text: string, context: ChatbotContext): AsyncIterator<string> {
    if (!this.connected) {
      throw new Error('Provider not connected');
    }

    const messages = this.buildMessages(text, context);

    const response = await fetch(`${this.apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: this.temperature,
        max_tokens: this.maxTokens,
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    // Process Server-Sent Events stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '') continue;
          if (line.trim() === 'data: [DONE]') continue;
          
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                yield content;
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async getAvailableModules(): Promise<ChatbotModule[]> {
    // Return example modules - in real implementation, fetch from OpenAI
    return [
      {
        id: 'web-search',
        name: 'Web Search',
        description: 'Search the web for information',
        icon: 'search',
        enabled: true
      },
      {
        id: 'code-interpreter',
        name: 'Code Interpreter',
        description: 'Execute Python code',
        icon: 'code',
        enabled: true
      },
      {
        id: 'dalle',
        name: 'DALL-E',
        description: 'Generate images',
        icon: 'image',
        enabled: true
      }
    ];
  }

  async callModule(moduleId: string, params: any): Promise<any> {
    // Implementation for function/tool calling
    console.log(`[OpenAIProvider] Calling module: ${moduleId}`, params);
    return { success: true, result: 'Module executed' };
  }

  async uploadFile(file: File): Promise<ChatbotFile> {
    // Upload file to OpenAI
    const formData = new FormData();
    formData.append('file', file);
    formData.append('purpose', 'assistants');

    const response = await fetch(`${this.apiUrl}/files`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`File upload failed: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      id: data.id,
      name: file.name,
      size: file.size,
      type: this.determineFileType(file.type),
      mimeType: file.type,
      url: data.url
    };
  }

  onError(error: Error): void {
    console.error('[OpenAIProvider] Error:', error);
  }

  private buildMessages(text: string, context: ChatbotContext): any[] {
    const messages: any[] = [];

    // Add context messages (last N messages for context)
    const contextMessages = context.messages.slice(-10); // Last 10 messages
    for (const msg of contextMessages) {
      messages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      });
    }

    // Add current message if not already included
    if (!messages.find(m => m.role === 'user' && m.content === text)) {
      messages.push({
        role: 'user',
        content: text
      });
    }

    return messages;
  }

  private determineFileType(mimeType: string): any {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
  }
}
