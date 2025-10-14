/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { EventBus } from './event-bus.js';
import {
  ChatbotState,
  ChatbotUICallbacks,
  ChatbotCoreConfig,
  ChatbotContext,
  SendMessageOptions,
  ValidationError,
  ChatbotProvider,
  ChatbotStorage,
  ChatbotPlugin
} from './types.js';
import {
  ChatbotMessage,
  ChatbotThread,
  ChatbotFile,
  ChatbotModule,
  ChatbotSender,
  ChatbotMessageState,
  ChatbotSuggestion
} from '../chatbot.types.js';

// Handlers (domain operations)
import {
  StateHandler,
  MessageHandler,
  ThreadHandler,
  FileHandler,
  ModuleHandler,
  SuggestionHandler
} from './handlers/index.js';

// Services (infrastructure)
import {
  ProviderService,
  ValidationService,
  StorageService,
  PluginService
} from './services/index.js';

/**
 * Pure chatbot core controller - completely UI-agnostic
 * All UI interactions happen through injected callbacks
 * Can be extended and overridden for custom behavior
 */
export class ChatbotCoreController {
  protected eventBus: EventBus;
  protected config: ChatbotCoreConfig;
  protected ui: ChatbotUICallbacks;
  protected plugins: Map<string, ChatbotPlugin> = new Map();
  protected stateHandler: StateHandler;
  protected messageHandler: MessageHandler;
  protected threadHandler: ThreadHandler;
  protected fileHandler: FileHandler;
  protected moduleHandler: ModuleHandler;
  protected suggestionHandler: SuggestionHandler;
  protected providerService: ProviderService;
  protected validationService: ValidationService;
  protected storageService: StorageService;
  protected pluginService: PluginService;

  constructor(config: ChatbotCoreConfig = {}) {
    this.config = config;
    this.ui = config.ui || {};

    this.eventBus = new EventBus();

    this.pluginService = new PluginService();
    this.plugins = this.pluginService.getPluginsMap();

    const initialState = this.initializeState(config);
    this.stateHandler = new StateHandler(initialState, this.eventBus, this.ui, this.plugins, this.config);

    this.messageHandler = new MessageHandler(this.stateHandler, this.eventBus, this.plugins);
    this.threadHandler = new ThreadHandler(this.stateHandler, this.eventBus, this.ui, this.config);
    this.fileHandler = new FileHandler(this.stateHandler, this.eventBus);
    this.moduleHandler = new ModuleHandler(this.stateHandler, this.eventBus);
    this.suggestionHandler = new SuggestionHandler(this.stateHandler);

    this.providerService = new ProviderService(
      config.provider,
      this.stateHandler,
      this.messageHandler,
      this.eventBus,
      this.ui,
      this.plugins
    );
    this.validationService = new ValidationService(this.config);
    this.storageService = new StorageService(
      config.storage,
      this.stateHandler,
      this.config
    );

    if (config.plugins) {
      config.plugins.forEach(plugin => this.pluginService.registerPlugin(plugin, this));
    }

    if (config.provider) {
      config.provider.connect({}).catch(error => {
        this.logError('Failed to connect provider:', error);
      });
    }

    this.setupLifecycleHooks();
  }

  // ===== LIFECYCLE HOOKS (Override Points) =====

  /**
   * Initialize state - override to customize initial state
   */
  protected initializeState(config: ChatbotCoreConfig): ChatbotState {
    return {
      messages: config.initialMessages || [],
      threads: config.initialThreads || [],
      modules: config.enableModules ? [] : undefined,
      selectedModules: [],
      uploadedFiles: [],
      suggestions: [],
      isTyping: false,
      isProcessing: false,
      currentThreadId: undefined,
      metadata: config.metadata || {}
    };
  }

  /**
   * Setup lifecycle hooks - override to add custom setup logic
   */
  protected setupLifecycleHooks(): void {
    this.onBeforeInit();
    this.onReady().catch(error => {
      this.logError('Error during initialization:', error);
    });
  }

  /**
   * Called before initialization - override for custom pre-init logic
   */
  protected onBeforeInit(): void {
    this.log('Initializing chatbot controller...');
  }

  /**
   * Called when controller is ready - override for custom initialization
   */
  protected async onReady(): Promise<void> {
    this.log('Chatbot controller ready');

    try {
      const state = this.stateHandler.getState();
      const firstMsg = state.messages && state.messages.length > 0 ? state.messages[0] : undefined;
      if (firstMsg && firstMsg.sender === 'bot' && firstMsg.introduction && Array.isArray(firstMsg.suggestions) && firstMsg.suggestions.length > 0) {
        this.suggestionHandler.setSuggestions(firstMsg.suggestions);
      }
    } catch (e) {
      this.logError('Error initializing suggestions from initial messages:', e);
    }

    if (this.ui.onStateChange) {
      this.ui.onStateChange(this.getState());
    }
    
    this.emit('ready', this.stateHandler.getState());
  }

  /**
   * Called when controller is destroyed - override for cleanup
   */
  protected onDestroy(): void {
    this.log('Destroying chatbot controller...');
    
    this.storageService.stopAutoSave();
    this.pluginService.clearPlugins();
    this.eventBus.removeAllListeners();
  }

  // ===== STATE MANAGEMENT =====

  protected updateState(updates: Partial<ChatbotState>): void {
    this.stateHandler.updateState(updates);
  }

  // ===== MESSAGE OPERATIONS =====

  /**
   * Send a message (main public API)
   */
  public async sendMessage(text: string, options: SendMessageOptions = {}): Promise<ChatbotMessage> {
    this.log('Sending message:', text);

    try {
      const state = this.stateHandler.getState();
      
      if (this.config.enableThreads && !state.currentThreadId && state.threads.length === 0) {
        this.threadHandler.createThread('New Chat');
      }

      const processedText = await this.beforeMessageSent(text, options);

      if (!options.skipValidation) {
        const validation = await this.validationService.validateMessage(processedText);
        if (!validation.isValid) {
          const error = new ValidationError(validation.errors);
          this.handleValidationError(error);
          throw error;
        }
      }

      const message = this.messageHandler.createUserMessage(processedText, options.metadata);
      if (options.files) {
        message.files = options.files;
      }
      this.messageHandler.addMessage(message);

      const currentState = this.stateHandler.getState();
      if (options.threadId || currentState.currentThreadId) {
        this.threadHandler.updateThreadMessages(options.threadId || currentState.currentThreadId!);
      }

      await this.afterMessageSent(message);

      this.providerService.processMessage(message).catch(error => {
        this.logError('Error processing with provider:', error);
      });

      return message;
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  /**
   * Stop the current provider processing/stream
   */
  public stop(): void {
    this.providerService.stopCurrentProcessing();
  }

  /**
   * Add a message programmatically
   */
  public addMessage(data: Partial<ChatbotMessage>): ChatbotMessage {
    const message = this.messageHandler.createMessage(data);
    this.messageHandler.addMessage(message);
    return message;
  }

  /**
   * Update an existing message by ID
   */
  public updateMessage(id: string, updates: Partial<ChatbotMessage>): void {
    this.messageHandler.updateMessage(id, updates);
  }

  /**
   * Delete a message by ID
   */
  public deleteMessage(id: string): void {
    this.messageHandler.deleteMessage(id);
  }

  /**
   * Clear all messages from the current conversation
   */
  public clearMessages(): void {
    this.updateState({ messages: [] });
  }

  /**
   * Get all messages in the current conversation
   */
  public getMessages(): ChatbotMessage[] {
    return this.stateHandler.getState().messages;
  }

  // ===== FILE OPERATIONS =====

  /**
   * Upload files to the chatbot
   * @param files - Optional array of files to upload. If not provided, will trigger file dialog
   * @returns Array of uploaded ChatbotFile objects
   */
  public async uploadFiles(files?: File[]): Promise<ChatbotFile[]> {
    if (!this.config.enableFileUpload) {
      throw new Error('File upload is not enabled');
    }

    let filesToUpload = files;

    if (!filesToUpload && this.ui.openFileDialog) {
      filesToUpload = await this.ui.openFileDialog();
    }

    if (!filesToUpload || filesToUpload.length === 0) {
      return [];
    }

    const uploadedFiles: ChatbotFile[] = [];

    for (const file of filesToUpload) {
      try {
        const validation = await this.validationService.validateFile(file);
        if (!validation.isValid) {
          if (this.ui.showNotification) {
            this.ui.showNotification(validation.errors[0] || 'File validation failed', 'error');
          }
          continue;
        }

        const chatbotFile = await this.fileHandler.createChatbotFile(file);
        
        const uploaded = await this.providerService.uploadFileToProvider(file);
        if (uploaded) {
          Object.assign(chatbotFile, uploaded);
        }
        
        uploadedFiles.push(chatbotFile);
        this.fileHandler.addFile(chatbotFile);

        if (this.ui.showFilePreview) {
          this.ui.showFilePreview(chatbotFile);
        }
      } catch (error) {
        this.logError('Error uploading file:', error);
        if (this.ui.showNotification) {
          this.ui.showNotification(`Failed to upload ${file.name}`, 'error');
        }
      }
    }

    return uploadedFiles;
  }

  /**
   * Remove an uploaded file by ID
   */
  public removeFile(fileId: string): void {
    this.fileHandler.removeFile(fileId);
  }

  /**
   * Clear all uploaded files
   */
  public clearFiles(): void {
    this.fileHandler.clearFiles();
  }

  /**
   * Get all uploaded files
   */
  public getUploadedFiles(): ChatbotFile[] {
    return this.stateHandler.getState().uploadedFiles;
  }

  // ===== THREAD OPERATIONS =====

  /**
   * Create a new conversation thread
   */
  public createThread(title?: string): ChatbotThread {
    return this.threadHandler.createThread(title);
  }

  /**
   * Switch to a different thread
   */
  public switchThread(threadId: string): void {
    this.threadHandler.switchThread(threadId);
  }

  /**
   * Delete a thread by ID
   */
  public deleteThread(threadId: string): void {
    this.threadHandler.deleteThread(threadId);
  }

  /**
   * Get the currently active thread
   */
  public getCurrentThread(): ChatbotThread | undefined {
    const state = this.stateHandler.getState();
    return state.threads.find(t => t.id === state.currentThreadId);
  }

  /**
   * Get all available threads
   */
  public getThreads(): ChatbotThread[] {
    return this.stateHandler.getState().threads;
  }

  // ===== MODULE OPERATIONS =====

  /**
   * Set available modules for the chatbot
   */
  public setModules(modules: ChatbotModule[]): void {
    this.moduleHandler.setModules(modules);
  }

  /**
   * Select specific modules by their IDs
   */
  public selectModules(moduleIds: string[]): void {
    this.moduleHandler.selectModules(moduleIds);
  }

  /**
   * Toggle a module's selection state
   */
  public toggleModule(moduleId: string): void {
    this.moduleHandler.toggleModule(moduleId);
  }

  /**
   * Get currently selected modules
   */
  public getSelectedModules(): ChatbotModule[] {
    return this.moduleHandler.getSelectedModules();
  }

  // ===== SUGGESTION OPERATIONS =====

  /**
   * Set suggestion chips for user interaction
   */
  public setSuggestions(suggestions: ChatbotSuggestion[]): void {
    this.suggestionHandler.setSuggestions(suggestions);
  }

  /**
   * Clear all suggestions
   */
  public clearSuggestions(): void {
    this.suggestionHandler.clearSuggestions();
  }

  // ===== HOOKS (Override Points) =====

  /**
   * Called before sending message - override to transform or validate
   */
  protected async beforeMessageSent(text: string, _options?: SendMessageOptions): Promise<string> {
    let processedText = text;
    for (const plugin of this.plugins.values()) {
      if (plugin.beforeSend) {
        processedText = await plugin.beforeSend(processedText);
      }
    }
    return processedText;
  }

  /**
   * Called after message is sent - override for custom logic
   */
  protected async afterMessageSent(message: ChatbotMessage): Promise<void> {
    this.log('Message sent:', message);
  }

  /**
   * Called before provider call - override for custom logic
   */
  protected async beforeProviderCall(message: ChatbotMessage): Promise<void> {
    this.log('Calling provider for message:', message.id);
  }

  /**
   * Called after provider call - override for custom logic
   */
  protected async afterProviderCall(): Promise<void> {
    this.log('Provider call completed');
  }

  /**
   * Handle provider error - override to customize error handling
   */
  protected async handleProviderError(error: Error): Promise<void> {
    this.logError('Provider error:', error);

    const errorMessage = this.messageHandler.createMessage({
      sender: ChatbotSender.Bot,
      text: 'Sorry, there was an error processing your request.',
      state: ChatbotMessageState.Error,
      timestamp: new Date().toISOString()
    });
    this.messageHandler.addMessage(errorMessage);

    if (this.ui.showNotification) {
      this.ui.showNotification('Failed to process message', 'error');
    }

    this.emit('provider:error', error);

    await this.pluginService.executeHook('onError', error);
  }

  /**
   * Handle validation error - override to customize
   */
  protected handleValidationError(error: ValidationError): void {
    this.logError('Validation error:', error);

    if (this.ui.showNotification) {
      this.ui.showNotification(error.errors[0], 'error');
    }

    this.emit('validation:error', error);
  }

  /**
   * Handle general error - override to customize
   */
  protected handleError(error: Error): void {
    this.logError('Error:', error);
    this.emit('error', error);

    this.plugins.forEach(plugin => {
      if (plugin.onError) {
        plugin.onError(error);
      }
    });
  }

  // ===== PLUGIN SYSTEM =====

  /**
   * Register a new plugin with the chatbot
   */
  public registerPlugin(plugin: ChatbotPlugin): void {
    this.pluginService.registerPlugin(plugin, this);
  }

  /**
   * Unregister a plugin by ID
   */
  public unregisterPlugin(pluginId: string): void {
    this.pluginService.unregisterPlugin(pluginId);
  }

  /**
   * Get a registered plugin by ID
   */
  public getPlugin<T extends ChatbotPlugin = ChatbotPlugin>(pluginId: string): T | undefined {
    return this.pluginService.getPlugin<T>(pluginId);
  }

  // ===== PROVIDER MANAGEMENT =====

  /**
   * Set the AI provider for the chatbot
   */
  public setProvider(provider: ChatbotProvider): void {
    this.providerService.setProvider(provider);
    provider.connect({}).catch(error => {
      this.logError('Failed to connect provider:', error);
    });
    this.emit('provider:connected', provider.id);
  }

  // ===== STORAGE MANAGEMENT =====

  /**
   * Set the storage adapter for persisting chatbot state
   */
  public setStorage(storage: ChatbotStorage): void {
    this.storageService.setStorage(storage);
  }

  /**
   * Save current state to storage
   */
  public async saveToStorage(key: string = 'chatbot-state'): Promise<void> {
    await this.storageService.saveState(key);
  }

  /**
   * Load state from storage
   */
  public async loadFromStorage(key: string = 'chatbot-state'): Promise<void> {
    await this.storageService.loadState(key);
  }

  // ===== EVENT BUS =====

  /**
   * Subscribe to an event
   * @returns Unsubscribe function
   */
  public on(event: string, handler: (...args: any[]) => void): () => void {
    return this.eventBus.on(event, handler);
  }

  /**
   * Emit an event
   */
  public emit(event: string, data?: any): void {
    this.eventBus.emit(event, data);
  }

  // ===== PUBLIC API =====

  /**
   * Get current chatbot state (readonly)
   */
  public getState(): Readonly<ChatbotState> {
    return this.stateHandler.getState();
  }

  /**
   * Update chatbot state (use with caution)
   */
  public setState(updates: Partial<ChatbotState>): void {
    this.updateState(updates);
  }

  /**
   * Set or update UI callback functions
   */
  public setUICallbacks(callbacks: ChatbotUICallbacks): void {
    this.ui = { ...this.ui, ...callbacks };
  }

  /**
   * Get chatbot configuration (readonly)
   */
  public getConfig(): Readonly<ChatbotCoreConfig> {
    return Object.freeze({ ...this.config });
  }

  /**
   * Set typing indicator state
   */
  public setTyping(isTyping: boolean): void {
    this.updateState({ isTyping });
    this.emit(isTyping ? 'typing:start' : 'typing:end');
  }

  /**
   * Get context for provider calls
   */
  protected getContext(): ChatbotContext {
    const state = this.stateHandler.getState();
    return {
      messages: state.messages,
      currentThread: this.getCurrentThread(),
      selectedModules: state.selectedModules,
      metadata: state.metadata
    };
  }

  /**
   * Destroy the chatbot controller and clean up resources
   */
  public destroy(): void {
    this.onDestroy();
  }

  // ===== UTILITIES =====

  protected generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  protected formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  protected log(...args: any[]): void {
    if (this.config.debug) {
      console.log('[ChatbotCore]', ...args);
    }
  }

  protected logError(...args: any[]): void {
    console.error('[ChatbotCore]', ...args);
  }
}
