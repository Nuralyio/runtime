/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import type { ChatbotProvider, ChatbotContext, ProviderCapabilities } from '../core/types.js';
import type { ChatbotFile } from '../chatbot.types.js';
import { ChatbotFileType } from '../chatbot.types.js';

/**
 * Mock responses for demo purposes
 */
const MOCK_RESPONSES = [
  "That's an interesting question! Let me think about that...",
  "I understand what you're asking. Here's what I think:",
  "Great point! Based on what you've told me, I would suggest:",
  "I'd be happy to help with that. Let me explain:",
  "That's a common question. The answer is:",
  "I see where you're coming from. Let me clarify:",
  "Excellent question! Here's my perspective:",
  "I can definitely help you with that. Consider this:",
];

const CONTEXTUAL_RESPONSES: Record<string, string[]> = {
  hello: [
    "Hello! 👋 How can I help you today?",
    "Hi there! What can I do for you?",
    "Hey! Great to see you. What's on your mind?",
  ],
  help: [
    "I'm here to help! You can ask me anything. Try asking about features, getting started, or technical questions.",
    "I can assist with various topics. What do you need help with?",
    "Sure! I'm ready to help. What would you like to know?",
  ],
  bye: [
    "Goodbye! Feel free to come back anytime! 👋",
    "See you later! Have a great day!",
    "Bye! It was nice chatting with you!",
  ],
  thanks: [
    "You're welcome! Happy to help! 😊",
    "Glad I could help!",
    "Anytime! That's what I'm here for!",
  ],
  how: [
    "Great question! Here's how it works: First, you need to understand the basics. Then, you can dive deeper into the specifics.",
    "Let me explain the process step by step...",
    "That's actually quite straightforward. Let me break it down for you:",
  ],
  what: [
    "Good question! Let me explain what that means...",
    "That refers to a concept that's important to understand. Here's the breakdown:",
    "Interesting topic! Here's what you need to know:",
  ],
  why: [
    "That's because of several factors. Let me explain the reasoning:",
    "Great question! The main reason is that it provides better functionality and user experience.",
    "There are multiple reasons for this. The primary one is:",
  ],
};

export interface MockProviderConfig {
  /**
   * Response delay in milliseconds (simulates API latency)
   */
  delay?: number;

  /**
   * Enable streaming responses (character by character)
   */
  streaming?: boolean;

  /**
   * Streaming speed (characters per iteration)
   */
  streamingSpeed?: number;

  /**
   * Streaming interval in milliseconds
   */
  streamingInterval?: number;

  /**
   * Enable contextual responses (smarter responses based on keywords)
   */
  contextualResponses?: boolean;

  /**
   * Enable echo mode (echo back user's message)
   */
  echoMode?: boolean;

  /**
   * Custom responses to use instead of built-in ones
   */
  customResponses?: string[];

  /**
   * Error simulation rate (0-1, 0 = no errors, 1 = always error)
   */
  errorRate?: number;

  /**
   * Enable message history awareness
   */
  useHistory?: boolean;
}

/**
 * Mock Provider for demo and testing purposes.
 * Simulates AI responses without requiring a real API.
 * 
 * Features:
 * - Configurable response delay
 * - Streaming support (character-by-character)
 * - Contextual responses based on keywords
 * - Echo mode
 * - Custom responses
 * - Error simulation
 * - Message history awareness
 * 
 * @example
 * ```typescript
 * const provider = new MockProvider({
 *   delay: 1000,
 *   streaming: true,
 *   contextualResponses: true
 * });
 * 
 * const controller = new ChatbotCoreController({
 *   provider,
 *   ui: callbacks
 * });
 * ```
 */
export class MockProvider implements ChatbotProvider {
  public readonly id = 'mock-provider';
  public readonly name = 'Mock Provider';
  public readonly capabilities: ProviderCapabilities = {
    streaming: true,
    fileUpload: true,
    modules: false,
    functions: false,
  };

  private config: Required<MockProviderConfig>;
  private messageCount = 0;
  private connected = false;

  constructor(config: MockProviderConfig = {}) {
    this.config = {
      delay: config.delay ?? 800,
      streaming: config.streaming ?? false,
      streamingSpeed: config.streamingSpeed ?? 3,
      streamingInterval: config.streamingInterval ?? 50,
      contextualResponses: config.contextualResponses ?? true,
      echoMode: config.echoMode ?? false,
      customResponses: config.customResponses ?? [],
      errorRate: config.errorRate ?? 0,
      useHistory: config.useHistory ?? true,
    };
  }

  async connect(_config?: any): Promise<void> {
    // Simulate connection delay
    await this.delay(100);
    this.connected = true;
    console.log('🤖 Mock Provider connected');
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    console.log('🤖 Mock Provider disconnected');
  }

  isConnected(): boolean {
    return this.connected;
  }

  async *sendMessage(text: string, context?: ChatbotContext): AsyncIterator<string> {
    this.messageCount++;

    // Simulate error
    if (Math.random() < this.config.errorRate) {
      await this.delay(this.config.delay / 2);
      throw new Error('Simulated API error for testing');
    }

    // Simulate API delay
    await this.delay(this.config.delay);

    // Generate response
    const response = this.generateResponse(text, context);

    // Stream response or return all at once
    if (this.config.streaming) {
      for await (const chunk of this.streamResponse(response)) {
        yield chunk;
      }
    } else {
      yield response;
    }
  }

  async uploadFile(file: File): Promise<ChatbotFile> {
    // Simulate upload delay
    await this.delay(this.config.delay);

    // Simulate error
    if (Math.random() < this.config.errorRate) {
      throw new Error('Simulated file upload error for testing');
    }

    // Determine file type
    const mimeType = file.type || 'application/octet-stream';
    const fileType = this.determineFileType(mimeType);

    // Generate mock file ID
    const fileId = `mock-file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`📎 Mock Provider: File uploaded - ${file.name} (${file.size} bytes) - ID: ${fileId}`);

    // Return ChatbotFile
    const chatbotFile: ChatbotFile = {
      id: fileId,
      name: file.name,
      size: file.size,
      type: fileType,
      mimeType: mimeType,
      url: URL.createObjectURL(file), // Create temporary URL for preview
      previewUrl: fileType === 'image' ? URL.createObjectURL(file) : undefined,
      uploadProgress: 100,
      metadata: {
        provider: 'mock',
        uploadedAt: new Date().toISOString(),
      },
    };

    return chatbotFile;
  }

  private determineFileType(mimeType: string): ChatbotFileType {
    if (mimeType.startsWith('image/')) return ChatbotFileType.Image;
    if (mimeType.startsWith('video/')) return ChatbotFileType.Video;
    if (mimeType.startsWith('audio/')) return ChatbotFileType.Audio;
    if (mimeType.startsWith('application/pdf') || 
        mimeType.includes('document') || 
        mimeType.includes('text')) return ChatbotFileType.Document;
    if (mimeType.includes('zip') || 
        mimeType.includes('rar') || 
        mimeType.includes('tar')) return ChatbotFileType.Archive;
    if (mimeType.includes('javascript') || 
        mimeType.includes('json') || 
        mimeType.includes('xml')) return ChatbotFileType.Code;
    return ChatbotFileType.Unknown;
  }

  private generateResponse(text: string, context?: ChatbotContext): string {
    const allMessages = context?.messages || [];
    const lastUserIndex = [...allMessages].map((m, i) => ({ m, i }))
      .reverse()
      .find(({ m }) => m.sender === 'user' && !!m.text)?.i;
    const effectiveText = (typeof lastUserIndex === 'number' && allMessages[lastUserIndex]?.text)
      ? (allMessages[lastUserIndex].text as string)
      : text;

    // Echo mode
    if (this.config.echoMode) {
      return `You said: "${effectiveText}"`;
    }

    // Custom responses (highest priority after echo mode)
    if (this.config.customResponses.length > 0) {
      // Use messageCount - 1 because messageCount was already incremented in sendMessage
      const index = (this.messageCount - 1) % this.config.customResponses.length;
      return this.config.customResponses[index];
    }

    // Contextual responses
    if (this.config.contextualResponses) {
      const contextualResponse = this.getContextualResponse(effectiveText);
      if (contextualResponse) {
        return contextualResponse;
      }
    }

    // History-aware responses: always anchor to the latest message, optionally weave prior context
    if (this.config.useHistory && allMessages.length > 0 && typeof lastUserIndex === 'number') {
      const prevUser = [...allMessages]
        .slice(0, lastUserIndex)
        .reverse()
        .find(m => m.sender === 'user' && !!m.text);

      if (prevUser && prevUser.text) {
        return `Great point about "${String(effectiveText).substring(0, 60)}". Considering your earlier message about "${String(prevUser.text).substring(0, 30)}...", ${this.getRandomResponse()}`;
      }

      return `Regarding "${String(effectiveText).substring(0, 60)}", ${this.getRandomResponse()}`;
    }

    // Default random response anchored to latest
    return `Regarding "${String(effectiveText).substring(0, 60)}", ${this.getRandomResponse()}`;
  }

  private getContextualResponse(text: string): string | null {
    const lowerText = text.toLowerCase();

    // Check for keywords
    for (const [keyword, responses] of Object.entries(CONTEXTUAL_RESPONSES)) {
      if (lowerText.includes(keyword)) {
        const randomIndex = Math.floor(Math.random() * responses.length);
        return responses[randomIndex];
      }
    }

    return null;
  }

  private getRandomResponse(): string {
    const randomIndex = Math.floor(Math.random() * MOCK_RESPONSES.length);
    return MOCK_RESPONSES[randomIndex];
  }

  private async *streamResponse(text: string): AsyncGenerator<string> {
    let currentText = '';
    const words = text.split(' ');

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      currentText += (i > 0 ? ' ' : '') + word;
      
      yield currentText;
      
      // Wait between words
      if (i < words.length - 1) {
        await this.delay(this.config.streamingInterval);
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Reset message count (useful for testing)
   */
  reset(): void {
    this.messageCount = 0;
  }

  /**
   * Update configuration on the fly
   */
  updateConfig(config: Partial<MockProviderConfig>): void {
    Object.assign(this.config, config);
  }

  /**
   * Get current configuration
   */
  getConfig(): Readonly<Required<MockProviderConfig>> {
    return { ...this.config };
  }
}

/**
 * Pre-configured mock providers for common scenarios
 */
export const MockProviders = {
  /**
   * Fast responses, no streaming
   */
  fast: () => new MockProvider({
    delay: 300,
    streaming: false,
    contextualResponses: true,
  }),

  /**
   * Realistic API simulation with streaming
   */
  realistic: () => new MockProvider({
    delay: 1200,
    streaming: true,
    streamingInterval: 50,
    contextualResponses: true,
    useHistory: true,
  }),

  /**
   * Slow responses for testing loading states
   */
  slow: () => new MockProvider({
    delay: 3000,
    streaming: false,
  }),

  /**
   * Echo mode for debugging
   */
  echo: () => new MockProvider({
    delay: 500,
    echoMode: true,
  }),

  /**
   * Streaming mode for demo
   */
  streaming: () => new MockProvider({
    delay: 800,
    streaming: true,
    streamingSpeed: 2,
    streamingInterval: 30,
  }),

  /**
   * Error simulation for testing error handling
   */
  unreliable: () => new MockProvider({
    delay: 1000,
    errorRate: 0.3, // 30% error rate
  }),

  /**
   * Custom responses
   */
  custom: (responses: string[]) => new MockProvider({
    delay: 800,
    customResponses: responses,
  }),
};
