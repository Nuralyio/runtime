/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import type { ChatbotPlugin, ChatbotStorage } from '../core/types.js';
import type { ChatbotCoreController } from '../core/chatbot-core.controller.js';

/**
 * Persistence plugin - saves/loads state to storage
 */
export class PersistencePlugin implements ChatbotPlugin {
  readonly id = 'persistence';
  readonly name = 'Persistence Plugin';
  readonly version = '1.0.0';

  private storage: ChatbotStorage;
  private storageKey: string;
  private autoSaveInterval?: NodeJS.Timeout;

  constructor(storage: ChatbotStorage, options: {
    storageKey?: string;
    autoSaveInterval?: number;
  } = {}) {
    this.storage = storage;
    this.storageKey = options.storageKey || 'chatbot-state';
    
    if (options.autoSaveInterval) {
      this.autoSaveInterval = setInterval(() => {
        this.saveState();
      }, options.autoSaveInterval);
    }
  }

  private controller?: ChatbotCoreController;

  onInit(controller: ChatbotCoreController): void {
    this.controller = controller;
    
    // Load saved state
    this.loadState();
    
    console.log('[PersistencePlugin] Initialized');
  }

  onDestroy(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
    
    // Save state one last time
    this.saveState();
    
    console.log('[PersistencePlugin] Destroyed');
  }

  onStateChange(): void {
    // Auto-save on state change (debounced would be better)
    this.saveState();
  }

  private async saveState(): Promise<void> {
    if (!this.controller) return;

    try {
      const state = this.controller.getState();
      await this.storage.save(this.storageKey, state);
      console.log('[PersistencePlugin] State saved');
    } catch (error) {
      console.error('[PersistencePlugin] Error saving state:', error);
    }
  }

  private async loadState(): Promise<void> {
    if (!this.controller) return;

    try {
      const savedState = await this.storage.load(this.storageKey);
      if (savedState) {
        this.controller.setState(savedState);
        console.log('[PersistencePlugin] State loaded');
      }
    } catch (error) {
      console.error('[PersistencePlugin] Error loading state:', error);
    }
  }

  async clearStorage(): Promise<void> {
    try {
      await this.storage.remove(this.storageKey);
      console.log('[PersistencePlugin] Storage cleared');
    } catch (error) {
      console.error('[PersistencePlugin] Error clearing storage:', error);
    }
  }
}
