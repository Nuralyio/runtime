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
  ValidationResult,
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
  ChatbotFileType,
  ChatbotSuggestion
} from '../chatbot.types.js';

/**
 * Pure chatbot core controller - completely UI-agnostic
 * All UI interactions happen through injected callbacks
 * Can be extended and overridden for custom behavior
 */
export class ChatbotCoreController {
  // State (pure data)
  protected state: ChatbotState;

  // Dependencies (injected)
  protected provider?: ChatbotProvider;
  protected storage?: ChatbotStorage;
  protected ui: ChatbotUICallbacks;

  // Event bus (internal)
  protected eventBus: EventBus;

  // Plugins
  protected plugins: Map<string, ChatbotPlugin> = new Map();

  // Configuration
  protected config: ChatbotCoreConfig;

  // Auto-save timer
  private autoSaveTimer?: NodeJS.Timeout;

  constructor(config: ChatbotCoreConfig = {}) {
    this.config = config;
    this.ui = config.ui || {};
    this.provider = config.provider;
    this.storage = config.storage;

    this.eventBus = new EventBus();
    this.state = this.initializeState(config);

    // Register plugins
    if (config.plugins) {
      config.plugins.forEach(plugin => this.registerPlugin(plugin));
    }

    this.setupLifecycleHooks();
    this.setupAutoSave();
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
    // Don't await - initialization happens asynchronously
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
    
    // Connect provider if available
    if (this.provider && !this.provider.isConnected()) {
      try {
        await this.provider.connect({});
        this.log('Provider connected successfully');
      } catch (error) {
        this.logError('Failed to connect provider:', error);
      }
    }
    
    // Notify UI of initial state (important for initial messages)
    if (this.ui.onStateChange) {
      this.ui.onStateChange(this.getState());
    }
    
    this.emit('ready', this.state);
  }

  /**
   * Called when controller is destroyed - override for cleanup
   */
  protected onDestroy(): void {
    this.log('Destroying chatbot controller...');
    
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }

    // Destroy plugins
    this.plugins.forEach(plugin => {
      if (plugin.onDestroy) {
        try {
          plugin.onDestroy();
        } catch (error) {
          this.logError('Error destroying plugin:', error);
        }
      }
    });

    this.plugins.clear();
    this.eventBus.removeAllListeners();

    // Disconnect provider
    if (this.provider?.isConnected()) {
      this.provider.disconnect().catch(error => {
        this.logError('Error disconnecting provider:', error);
      });
    }
  }

  // ===== STATE MANAGEMENT =====

  /**
   * Update state and notify UI
   */
  protected updateState(updates: Partial<ChatbotState>): void {
    this.state = { ...this.state, ...updates };

    // Notify UI through callback
    if (this.ui.onStateChange) {
      try {
        this.ui.onStateChange(this.getState());
      } catch (error) {
        this.logError('Error in UI state change callback:', error);
      }
    }

    // Emit event for plugins
    this.emit('state:changed', this.state);

    // Notify plugins
    this.plugins.forEach(plugin => {
      if (plugin.onStateChange) {
        try {
          plugin.onStateChange(this.getState());
        } catch (error) {
          this.logError('Error in plugin state change handler:', error);
        }
      }
    });
  }

  /**
   * Add message to state
   */
  protected addMessageToState(message: ChatbotMessage): void {
    this.state.messages = [...this.state.messages, message];

    // Apply max messages limit
    if (this.config.maxMessages && this.state.messages.length > this.config.maxMessages) {
      this.state.messages = this.state.messages.slice(-this.config.maxMessages);
    }

    // Notify UI
    if (this.ui.onStateChange) {
      this.ui.onStateChange(this.getState());
    }

    // Scroll to bottom
    if (this.ui.scrollToBottom) {
      this.ui.scrollToBottom();
    }

    this.emit('message:added', message);
  }

  /**
   * Update a message in state
   */
  protected updateMessageInState(id: string, updates: Partial<ChatbotMessage>): void {
    this.state.messages = this.state.messages.map(msg =>
      msg.id === id ? { ...msg, ...updates } : msg
    );

    if (this.ui.onStateChange) {
      this.ui.onStateChange(this.getState());
    }

    this.emit('message:updated', this.state.messages.find(m => m.id === id)!);
  }

  // ===== MESSAGE OPERATIONS =====

  /**
   * Send a message (main public API)
   */
  public async sendMessage(text: string, options: SendMessageOptions = {}): Promise<ChatbotMessage> {
    this.log('Sending message:', text);

    try {
      // Auto-create thread if threads are enabled and no thread is selected
      if (this.config.enableThreads && !this.state.currentThreadId && this.state.threads.length === 0) {
        this.createThread('New Chat');
      }

      // Pre-send hook
      const processedText = await this.beforeMessageSent(text, options);

      // Validate
      if (!options.skipValidation) {
        const validation = await this.validateMessage(processedText);
        if (!validation.isValid) {
          const error = new ValidationError(validation.errors);
          this.handleValidationError(error);
          throw error;
        }
      }

      // Create message
      const message = this.createMessage({
        sender: ChatbotSender.User,
        text: processedText,
        timestamp: new Date().toISOString(),
        files: options.files,
        metadata: options.metadata
      });

      // Add to state
      this.addMessageToState(message);

      // Update thread if specified
      if (options.threadId || this.state.currentThreadId) {
        this.updateThreadMessages(options.threadId || this.state.currentThreadId!);
      }

      // Post-send hook
      await this.afterMessageSent(message);

      // Emit event
      this.emit('message:sent', message);

      // Notify plugins
      this.plugins.forEach(plugin => {
        if (plugin.onMessageSent) {
          plugin.onMessageSent(message);
        }
      });

      // Process with provider (if available)
      if (this.provider) {
        // Don't await - process in background
        this.processWithProvider(message).catch(error => {
          this.logError('Error processing with provider:', error);
        });
      }

      return message;
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  /**
   * Add a message programmatically (e.g., bot response)
   */
  public addMessage(data: Partial<ChatbotMessage>): ChatbotMessage {
    const message = this.createMessage(data);
    this.addMessageToState(message);

    if (message.sender === ChatbotSender.Bot) {
      this.emit('message:received', message);
      
      // Notify plugins
      this.plugins.forEach(plugin => {
        if (plugin.onMessageReceived) {
          plugin.onMessageReceived(message);
        }
      });
    }

    return message;
  }

  /**
   * Update an existing message
   */
  public updateMessage(id: string, updates: Partial<ChatbotMessage>): void {
    this.updateMessageInState(id, updates);
  }

  /**
   * Delete a message
   */
  public deleteMessage(id: string): void {
    this.state.messages = this.state.messages.filter(msg => msg.id !== id);
    
    if (this.ui.onStateChange) {
      this.ui.onStateChange(this.getState());
    }

    this.emit('message:deleted', id);
  }

  /**
   * Clear all messages
   */
  public clearMessages(): void {
    this.updateState({ messages: [] });
  }

  /**
   * Get message history
   */
  public getMessages(): ChatbotMessage[] {
    return [...this.state.messages];
  }

  // ===== PROVIDER INTEGRATION =====

  /**
   * Process message with provider
   */
  protected async processWithProvider(message: ChatbotMessage): Promise<void> {
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
      
      this.updateState({ isTyping: true, isProcessing: true });
      this.emit('processing:start');
      this.emit('typing:start');

      // Hook
      await this.beforeProviderCall(message);

      // Get response stream
      const context = this.getContext();
      const stream = this.provider.sendMessage(message.text, context);

      // Process stream
      await this.processStream(stream);

      // Hook
      await this.afterProviderCall();

    } catch (error) {
      await this.handleProviderError(error as Error);
    } finally {
      // Notify UI - processing ended
      if (this.ui.onProcessingEnd) {
        this.ui.onProcessingEnd();
      }
      if (this.ui.onTypingEnd) {
        this.ui.onTypingEnd();
      }
      
      this.updateState({ isTyping: false, isProcessing: false });
      this.emit('processing:end');
      this.emit('typing:end');
    }
  }

  /**
   * Process stream from provider - override to customize streaming behavior
   */
  protected async processStream(stream: AsyncIterator<string>): Promise<void> {
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
          botMessage = this.createMessage({
            sender: ChatbotSender.Bot,
            text: processedChunk,
            timestamp: new Date().toISOString()
          });
          this.addMessageToState(botMessage);
        } else {
          // Subsequent chunks - update existing message
          const updatedText: string = botMessage.text + processedChunk;
          this.updateMessageInState(botMessage.id, { text: updatedText });
          // Update local reference for next iteration
          botMessage.text = updatedText;
        }
      }
    } catch (error) {
      this.logError('Error processing stream:', error);
      throw error;
    }
  }

  // ===== FILE OPERATIONS =====

  /**
   * Upload files
   */
  public async uploadFiles(files?: File[]): Promise<ChatbotFile[]> {
    if (!this.config.enableFileUpload) {
      throw new Error('File upload is not enabled');
    }

    let filesToUpload = files;

    // If no files provided, ask UI to open file dialog
    if (!filesToUpload && this.ui.openFileDialog) {
      filesToUpload = await this.ui.openFileDialog();
    }

    if (!filesToUpload || filesToUpload.length === 0) {
      return [];
    }

    const uploadedFiles: ChatbotFile[] = [];

    for (const file of filesToUpload) {
      try {
        // Validate
        const validation = this.validateFile(file);
        if (!validation.valid) {
          if (this.ui.showNotification) {
            this.ui.showNotification(validation.error!, 'error');
          }
          continue;
        }

        // Process file
        const chatbotFile = await this.processFile(file);
        uploadedFiles.push(chatbotFile);

        // Show preview (optional)
        if (this.ui.showFilePreview) {
          this.ui.showFilePreview(chatbotFile);
        }

        this.emit('file:uploaded', chatbotFile);
      } catch (error) {
        this.logError('Error uploading file:', error);
        if (this.ui.showNotification) {
          this.ui.showNotification(`Failed to upload ${file.name}`, 'error');
        }
      }
    }

    // Update state
    this.updateState({
      uploadedFiles: [...this.state.uploadedFiles, ...uploadedFiles]
    });

    return uploadedFiles;
  }

  /**
   * Remove a file
   */
  public removeFile(fileId: string): void {
    this.state.uploadedFiles = this.state.uploadedFiles.filter(f => f.id !== fileId);
    
    if (this.ui.onStateChange) {
      this.ui.onStateChange(this.getState());
    }

    this.emit('file:removed', fileId);
  }

  /**
   * Clear all uploaded files
   */
  public clearFiles(): void {
    this.updateState({ uploadedFiles: [] });
  }

  /**
   * Get uploaded files
   */
  public getUploadedFiles(): ChatbotFile[] {
    return [...this.state.uploadedFiles];
  }

  /**
   * Validate file - override to customize validation
   */
  protected validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = this.config.maxFileSize || 10 * 1024 * 1024; // 10MB default
    const maxFiles = this.config.maxFiles || 5;

    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: `File "${file.name}" is too large (max ${this.formatFileSize(maxSize)})` 
      };
    }

    if (this.state.uploadedFiles.length >= maxFiles) {
      return { 
        valid: false, 
        error: `Maximum ${maxFiles} files allowed` 
      };
    }

    // Check file type
    const allowedTypes = this.config.allowedFileTypes;
    if (allowedTypes && allowedTypes.length > 0) {
      const isAllowed = allowedTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return file.type === type;
      });

      if (!isAllowed) {
        return {
          valid: false,
          error: `File type "${file.type}" is not allowed`
        };
      }
    }

    return { valid: true };
  }

  /**
   * Process file - override to customize file processing
   */
  protected async processFile(file: File): Promise<ChatbotFile> {
    const chatbotFile: ChatbotFile = {
      id: this.generateId('file'),
      name: file.name,
      size: file.size,
      type: this.determineFileType(file.type),
      mimeType: file.type,
      url: URL.createObjectURL(file)
    };

    // Upload to provider if supported
    if (this.provider?.capabilities.fileUpload && this.provider.uploadFile) {
      try {
        const uploaded = await this.provider.uploadFile(file);
        return { ...chatbotFile, ...uploaded };
      } catch (error) {
        this.logError('Provider file upload failed:', error);
        // Return local file object
      }
    }

    return chatbotFile;
  }

  // ===== THREAD OPERATIONS =====

  /**
   * Create a new thread
   */
  public createThread(title?: string): ChatbotThread {
    if (!this.config.enableThreads) {
      throw new Error('Threads are not enabled');
    }

    const thread: ChatbotThread = {
      id: this.generateId('thread'),
      title: title || `Chat ${this.state.threads.length + 1}`,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.updateState({
      threads: [thread, ...this.state.threads],
      currentThreadId: thread.id,
      messages: []
    });

    this.emit('thread:created', thread);
    this.emit('thread:selected', thread);

    // Focus input after creating thread
    if (this.ui.focusInput) {
      // Use setTimeout to ensure DOM is updated
      setTimeout(() => {
        this.ui.focusInput!();
      }, 0);
    }

    return thread;
  }

  /**
   * Switch to a thread
   */
  public switchThread(threadId: string): void {
    const thread = this.state.threads.find(t => t.id === threadId);
    if (!thread) {
      throw new Error(`Thread "${threadId}" not found`);
    }

    // Save current thread
    if (this.state.currentThreadId) {
      this.saveCurrentThread();
    }

    // Switch to new thread
    this.updateState({
      currentThreadId: threadId,
      messages: [...thread.messages]
    });

    this.emit('thread:selected', thread);
  }

  /**
   * Delete a thread
   */
  public deleteThread(threadId: string): void {
    this.state.threads = this.state.threads.filter(t => t.id !== threadId);

    if (this.state.currentThreadId === threadId) {
      // Switch to first available thread or clear
      if (this.state.threads.length > 0) {
        this.switchThread(this.state.threads[0].id);
      } else {
        this.updateState({
          currentThreadId: undefined,
          messages: []
        });
      }
    } else {
      if (this.ui.onStateChange) {
        this.ui.onStateChange(this.getState());
      }
    }

    this.emit('thread:deleted', threadId);
  }

  /**
   * Get current thread
   */
  public getCurrentThread(): ChatbotThread | undefined {
    return this.state.threads.find(t => t.id === this.state.currentThreadId);
  }

  /**
   * Get all threads
   */
  public getThreads(): ChatbotThread[] {
    return [...this.state.threads];
  }

  /**
   * Save current thread messages
   */
  protected saveCurrentThread(): void {
    if (!this.state.currentThreadId) return;

    this.updateThreadMessages(this.state.currentThreadId);
  }

  /**
   * Update thread messages
   */
  protected updateThreadMessages(threadId: string): void {
    this.state.threads = this.state.threads.map(t =>
      t.id === threadId
        ? { ...t, messages: [...this.state.messages], updatedAt: new Date().toISOString() }
        : t
    );
  }

  // ===== MODULE OPERATIONS =====

  /**
   * Set available modules
   */
  public setModules(modules: ChatbotModule[]): void {
    this.updateState({ modules });
  }

  /**
   * Select modules
   */
  public selectModules(moduleIds: string[]): void {
    this.updateState({ selectedModules: moduleIds });
    this.emit('module:selected', moduleIds);
  }

  /**
   * Toggle module selection
   */
  public toggleModule(moduleId: string): void {
    const isSelected = this.state.selectedModules.includes(moduleId);
    const selectedModules = isSelected
      ? this.state.selectedModules.filter(id => id !== moduleId)
      : [...this.state.selectedModules, moduleId];

    this.selectModules(selectedModules);
  }

  /**
   * Get selected modules
   */
  public getSelectedModules(): ChatbotModule[] {
    if (!this.state.modules) return [];
    
    return this.state.selectedModules
      .map(id => this.state.modules!.find(m => m.id === id))
      .filter(Boolean) as ChatbotModule[];
  }

  // ===== SUGGESTION OPERATIONS =====

  /**
   * Set suggestions
   */
  public setSuggestions(suggestions: ChatbotSuggestion[]): void {
    this.updateState({ suggestions });
  }

  /**
   * Clear suggestions
   */
  public clearSuggestions(): void {
    this.updateState({ suggestions: [] });
  }

  // ===== VALIDATION =====

  /**
   * Validate message - override to customize validation
   */
  protected async validateMessage(text: string): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (!text.trim()) {
      errors.push('Message cannot be empty');
    }

    // Run custom validators
    if (this.config.validators) {
      for (const validator of this.config.validators) {
        try {
          const isValid = await validator.validator(text);
          if (!isValid) {
            errors.push(validator.errorMessage);
            if (validator.warningMessage) {
              warnings.push(validator.warningMessage);
            }
          }
        } catch (error) {
          this.logError('Validation error:', error);
          errors.push('Validation failed');
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // ===== HOOKS (Override Points) =====

  /**
   * Called before sending message - override to transform or validate
   */
  protected async beforeMessageSent(text: string, _options?: SendMessageOptions): Promise<string> {
    // Apply plugin transformations
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

    const errorMessage = this.createMessage({
      sender: ChatbotSender.Bot,
      text: 'Sorry, there was an error processing your request.',
      state: ChatbotMessageState.Error,
      timestamp: new Date().toISOString()
    });

    this.addMessageToState(errorMessage);

    if (this.ui.showNotification) {
      this.ui.showNotification('Failed to process message', 'error');
    }

    this.emit('provider:error', error);

    // Notify plugins
    this.plugins.forEach(plugin => {
      if (plugin.onError) {
        plugin.onError(error);
      }
    });
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

    // Notify plugins
    this.plugins.forEach(plugin => {
      if (plugin.onError) {
        plugin.onError(error);
      }
    });
  }

  /**
   * Create message - override to customize message creation
   */
  protected createMessage(data: Partial<ChatbotMessage>): ChatbotMessage {
    return {
      id: this.generateId('msg'),
      sender: ChatbotSender.User,
      text: '',
      timestamp: new Date().toISOString(),
      ...data
    };
  }

  // ===== PLUGIN SYSTEM =====

  /**
   * Register a plugin
   */
  public registerPlugin(plugin: ChatbotPlugin): void {
    if (this.plugins.has(plugin.id)) {
      this.log(`Plugin "${plugin.id}" is already registered, skipping`);
      return;
    }

    this.plugins.set(plugin.id, plugin);
    this.log(`Registered plugin: ${plugin.name} v${plugin.version}`);

    if (plugin.onInit) {
      try {
        plugin.onInit(this);
      } catch (error) {
        this.logError(`Error initializing plugin "${plugin.id}":`, error);
      }
    }
  }

  /**
   * Unregister a plugin
   */
  public unregisterPlugin(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (plugin && plugin.onDestroy) {
      try {
        plugin.onDestroy();
      } catch (error) {
        this.logError(`Error destroying plugin "${pluginId}":`, error);
      }
    }
    this.plugins.delete(pluginId);
  }

  /**
   * Get registered plugin
   */
  public getPlugin(pluginId: string): ChatbotPlugin | undefined {
    return this.plugins.get(pluginId);
  }

  // ===== PROVIDER MANAGEMENT =====

  /**
   * Set provider
   */
  public setProvider(provider: ChatbotProvider): void {
    this.provider = provider;
    this.emit('provider:connected', provider.id);
  }

  /**
   * Get provider
   */
  public getProvider(): ChatbotProvider | undefined {
    return this.provider;
  }

  // ===== STORAGE MANAGEMENT =====

  /**
   * Set storage
   */
  public setStorage(storage: ChatbotStorage): void {
    this.storage = storage;
  }

  /**
   * Save state to storage
   */
  public async saveToStorage(key: string = 'chatbot-state'): Promise<void> {
    if (!this.storage) {
      throw new Error('No storage configured');
    }

    try {
      await this.storage.save(key, this.state);
      this.log('State saved to storage');
    } catch (error) {
      this.logError('Error saving to storage:', error);
      throw error;
    }
  }

  /**
   * Load state from storage
   */
  public async loadFromStorage(key: string = 'chatbot-state'): Promise<void> {
    if (!this.storage) {
      throw new Error('No storage configured');
    }

    try {
      const savedState = await this.storage.load(key);
      if (savedState) {
        this.updateState(savedState);
        this.log('State loaded from storage');
      }
    } catch (error) {
      this.logError('Error loading from storage:', error);
      throw error;
    }
  }

  /**
   * Setup auto-save
   */
  protected setupAutoSave(): void {
    if (this.config.autoSaveInterval && this.storage) {
      this.autoSaveTimer = setInterval(() => {
        this.saveToStorage().catch(error => {
          this.logError('Auto-save failed:', error);
        });
      }, this.config.autoSaveInterval);
    }
  }

  // ===== EVENT BUS =====

  /**
   * Subscribe to event
   */
  public on(event: string, handler: (...args: any[]) => void): () => void {
    return this.eventBus.on(event, handler);
  }

  /**
   * Emit event
   */
  public emit(event: string, data?: any): void {
    this.eventBus.emit(event, data);
  }

  // ===== PUBLIC API =====

  /**
   * Get current state (readonly)
   */
  public getState(): Readonly<ChatbotState> {
    return Object.freeze({ ...this.state });
  }

  /**
   * Update state (use with caution)
   */
  public setState(updates: Partial<ChatbotState>): void {
    this.updateState(updates);
  }

  /**
   * Set UI callbacks
   */
  public setUICallbacks(callbacks: ChatbotUICallbacks): void {
    this.ui = { ...this.ui, ...callbacks };
  }

  /**
   * Get configuration
   */
  public getConfig(): Readonly<ChatbotCoreConfig> {
    return Object.freeze({ ...this.config });
  }

  /**
   * Set typing state
   */
  public setTyping(isTyping: boolean): void {
    this.updateState({ isTyping });
    this.emit(isTyping ? 'typing:start' : 'typing:end');
  }

  /**
   * Get context for provider
   */
  protected getContext(): ChatbotContext {
    return {
      messages: this.state.messages,
      currentThread: this.getCurrentThread(),
      selectedModules: this.state.selectedModules,
      metadata: this.state.metadata
    };
  }

  /**
   * Destroy controller
   */
  public destroy(): void {
    this.onDestroy();
  }

  // ===== UTILITIES =====

  /**
   * Generate unique ID
   */
  protected generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Determine file type from MIME type
   */
  protected determineFileType(mimeType: string): ChatbotFileType {
    if (mimeType.startsWith('image/')) return ChatbotFileType.Image;
    if (mimeType.startsWith('video/')) return ChatbotFileType.Video;
    if (mimeType.startsWith('audio/')) return ChatbotFileType.Audio;
    if (mimeType.includes('pdf') || mimeType.includes('document')) {
      return ChatbotFileType.Document;
    }
    if (mimeType.startsWith('text/')) return ChatbotFileType.Document;
    return ChatbotFileType.Unknown;
  }

  /**
   * Format file size
   */
  protected formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  /**
   * Log message (if debug enabled)
   */
  protected log(...args: any[]): void {
    if (this.config.debug) {
      console.log('[ChatbotCore]', ...args);
    }
  }

  /**
   * Log error
   */
  protected logError(...args: any[]): void {
    console.error('[ChatbotCore]', ...args);
  }
}
