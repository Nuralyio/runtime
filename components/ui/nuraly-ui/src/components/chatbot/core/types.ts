/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import type {
  ChatbotMessage,
  ChatbotThread,
  ChatbotModule,
  ChatbotFile,
  ChatbotSuggestion,
  ChatbotValidationRule
} from '../chatbot.types.js';

/**
 * Core chatbot state (pure data, no UI)
 */
export interface ChatbotState {
  messages: ChatbotMessage[];
  threads: ChatbotThread[];
  modules?: ChatbotModule[];
  selectedModules: string[];
  uploadedFiles: ChatbotFile[];
  suggestions: ChatbotSuggestion[];
  isTyping: boolean;
  isProcessing: boolean;
  currentThreadId?: string;
  metadata: Record<string, any>;
}

/**
 * UI callbacks that the core controller will invoke
 * These are injected from the UI layer (Lit, React, Vue, etc.)
 */
export interface ChatbotUICallbacks {
  /**
   * Called when state changes (for UI synchronization)
   */
  onStateChange?: (state: Readonly<ChatbotState>) => void;

  /**
   * Called when typing indicator should start
   */
  onTypingStart?: () => void;

  /**
   * Called when typing indicator should end
   */
  onTypingEnd?: () => void;

  /**
   * Called when processing starts (e.g., sending message to provider)
   */
  onProcessingStart?: () => void;

  /**
   * Called when processing ends
   */
  onProcessingEnd?: () => void;

  /**
   * Show notification to user
   */
  showNotification?: (message: string, type: 'info' | 'error' | 'success' | 'warning') => void;

  /**
   * Request user confirmation (returns true if confirmed)
   */
  requestUserConfirmation?: (message: string) => Promise<boolean>;

  /**
   * Open file dialog and return selected files
   */
  openFileDialog?: () => Promise<File[]>;

  /**
   * Show file preview
   */
  showFilePreview?: (file: ChatbotFile) => void;

  /**
   * Focus the input field
   */
  focusInput?: () => void;

  /**
   * Scroll to bottom of messages
   */
  scrollToBottom?: () => void;

  /**
   * Scroll to a specific message
   */
  scrollToMessage?: (messageId: string) => void;

  /**
   * Custom message rendering (optional)
   */
  renderMessage?: (message: ChatbotMessage) => any;

  /**
   * Custom suggestion rendering (optional)
   */
  renderSuggestion?: (suggestion: ChatbotSuggestion) => any;
}

/**
 * Context passed to providers and plugins
 */
export interface ChatbotContext {
  messages: ChatbotMessage[];
  currentThread?: ChatbotThread;
  selectedModules: string[];
  metadata: Record<string, any>;
}

/**
 * Options for sending a message
 */
export interface SendMessageOptions {
  files?: ChatbotFile[];
  metadata?: Record<string, any>;
  skipValidation?: boolean;
  threadId?: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

/**
 * Validation error
 */
export class ValidationError extends Error {
  constructor(public errors: string[]) {
    super(errors.join(', '));
    this.name = 'ValidationError';
  }
}

/**
 * Core chatbot configuration
 */
export interface ChatbotCoreConfig {
  /**
   * Provider for AI/backend integration
   */
  provider?: ChatbotProvider;

  /**
   * Storage for persistence
   */
  storage?: ChatbotStorage;

  /**
   * UI callbacks (injected from UI layer)
   */
  ui?: ChatbotUICallbacks;

  /**
   * Enable file upload functionality
   */
  enableFileUpload?: boolean;

  /**
   * Enable thread/conversation management
   */
  enableThreads?: boolean;

  /**
   * Enable module selection
   */
  enableModules?: boolean;

  /**
   * Maximum number of messages to keep in memory
   */
  maxMessages?: number;

  /**
   * Maximum file size in bytes
   */
  maxFileSize?: number;

  /**
   * Maximum number of files
   */
  maxFiles?: number;

  /**
   * Allowed file types (MIME types)
   */
  allowedFileTypes?: string[];

  /**
   * Custom validation rules
   */
  validators?: ChatbotValidationRule[];

  /**
   * Plugins to register
   */
  plugins?: ChatbotPlugin[];

  /**
   * Initial messages
   */
  initialMessages?: ChatbotMessage[];

  /**
   * Initial threads
   */
  initialThreads?: ChatbotThread[];

  /**
   * Custom metadata
   */
  metadata?: Record<string, any>;

  /**
   * Auto-save to storage interval (ms)
   */
  autoSaveInterval?: number;

  /**
   * Enable debug logging
   */
  debug?: boolean;
}

/**
 * Provider capabilities
 */
export interface ProviderCapabilities {
  streaming: boolean;
  fileUpload: boolean;
  modules: boolean;
  functions: boolean;
  imageGeneration?: boolean;
  voiceInput?: boolean;
}

/**
 * Provider configuration
 */
export interface ProviderConfig {
  apiKey?: string;
  apiUrl?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  [key: string]: any;
}

/**
 * Provider interface for AI/backend integration
 */
export interface ChatbotProvider {
  /**
   * Unique provider identifier
   */
  readonly id: string;

  /**
   * Provider name
   */
  readonly name: string;

  /**
   * Provider capabilities
   */
  readonly capabilities: ProviderCapabilities;

  /**
   * Connect/initialize the provider
   */
  connect(config: ProviderConfig): Promise<void>;

  /**
   * Disconnect/cleanup the provider
   */
  disconnect(): Promise<void>;

  /**
   * Check if provider is connected
   */
  isConnected(): boolean;

  /**
   * Send message and get streaming response
   */
  sendMessage(text: string, context: ChatbotContext): AsyncIterator<string>;

  /**
   * Get available modules (if supported)
   */
  getAvailableModules?(): Promise<ChatbotModule[]>;

  /**
   * Call a module/function (if supported)
   */
  callModule?(moduleId: string, params: any): Promise<any>;

  /**
   * Upload file (if supported)
   */
  uploadFile?(file: File): Promise<ChatbotFile>;

  /**
   * Error handler
   */
  onError?(error: Error): void;
}

/**
 * Storage interface for persistence
 */
export interface ChatbotStorage {
  /**
   * Save state to storage
   */
  save(key: string, data: any): Promise<void>;

  /**
   * Load state from storage
   */
  load(key: string): Promise<any>;

  /**
   * Remove data from storage
   */
  remove(key: string): Promise<void>;

  /**
   * Clear all storage
   */
  clear(): Promise<void>;

  /**
   * Check if key exists
   */
  has(key: string): Promise<boolean>;
}

/**
 * Plugin interface for extensibility
 */
export interface ChatbotPlugin {
  /**
   * Unique plugin identifier
   */
  readonly id: string;

  /**
   * Plugin name
   */
  readonly name: string;

  /**
   * Plugin version
   */
  readonly version: string;

  /**
   * Called when plugin is registered
   */
  onInit?(controller: any): void;

  /**
   * Called when plugin is destroyed
   */
  onDestroy?(): void;

  /**
   * Called when a user message is sent
   */
  onMessageSent?(message: ChatbotMessage): void | Promise<void>;

  /**
   * Called when a bot message is received
   */
  onMessageReceived?(message: ChatbotMessage): void | Promise<void>;

  /**
   * Called before sending message to provider (can transform)
   */
  beforeSend?(text: string): string | Promise<string>;

  /**
   * Called after receiving message from provider (can transform)
   */
  afterReceive?(text: string): string | Promise<string>;

  /**
   * Called when state changes
   */
  onStateChange?(state: Readonly<ChatbotState>): void;

  /**
   * Called on errors
   */
  onError?(error: Error): void;

  /**
   * Declare HTML-like block tags this plugin understands, e.g., [FLIGHT]...[/FLIGHT]
   * PluginService/Provider will use these to tokenize the stream and hand off complete blocks.
   */
  htmlTags?: Array<{
    /** Logical name for the tag */
    name: string;
    /** Opening marker (literal) */
    open: string;
    /** Closing marker (literal) */
    close: string;
  }>;

  /**
   * Optional renderer for a completed HTML-like block found during streaming.
   * Should return a trusted HTML string (plugin is responsible for safety) or empty string to skip.
   */
  renderHtmlBlock?(name: string, content: string): string;
}

/**
 * Events emitted by the core controller
 */
export interface ChatbotEvents {
  'state:changed': ChatbotState;
  'message:added': ChatbotMessage;
  'message:updated': ChatbotMessage;
  'message:deleted': string;
  'message:sent': ChatbotMessage;
  'message:received': ChatbotMessage;
  'typing:start': void;
  'typing:end': void;
  'processing:start': void;
  'processing:end': void;
  'file:uploaded': ChatbotFile;
  'file:removed': string;
  'thread:created': ChatbotThread;
  'thread:selected': ChatbotThread;
  'thread:deleted': string;
  'module:selected': string[];
  'provider:connected': string;
  'provider:disconnected': string;
  'provider:error': Error;
  'validation:error': ValidationError;
  'error': Error;
}
