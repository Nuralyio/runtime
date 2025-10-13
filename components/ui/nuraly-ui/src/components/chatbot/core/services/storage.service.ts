/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { StateHandler } from '../handlers/state-handler.js';
import type { ChatbotStorage, ChatbotCoreConfig, ChatbotState } from '../types.js';

/**
 * StorageService - Handles state persistence
 * Saves and loads chatbot state to/from storage
 */
export class StorageService {
  private storage?: ChatbotStorage;
  private autoSaveTimer?: NodeJS.Timeout;

  constructor(
    storage: ChatbotStorage | undefined,
    private stateHandler: StateHandler,
    private config: ChatbotCoreConfig
  ) {
    this.storage = storage;
    this.setupAutoSave();
  }

  /**
   * Set or update storage
   */
  setStorage(storage: ChatbotStorage): void {
    this.storage = storage;
    this.setupAutoSave();
  }

  /**
   * Save current state to storage
   */
  async saveState(key: string = 'chatbot-state'): Promise<void> {
    if (!this.storage) {
      throw new Error('No storage configured');
    }

    try {
      const state = this.stateHandler.getState();
      await this.storage.save(key, state as ChatbotState);
      this.log('State saved to storage');
    } catch (error) {
      this.logError('Error saving to storage:', error);
      throw error;
    }
  }

  /**
   * Load state from storage
   */
  async loadState(key: string = 'chatbot-state'): Promise<void> {
    if (!this.storage) {
      throw new Error('No storage configured');
    }

    try {
      const savedState = await this.storage.load(key);
      if (savedState) {
        this.stateHandler.updateState(savedState);
        this.log('State loaded from storage');
      }
    } catch (error) {
      this.logError('Error loading from storage:', error);
      throw error;
    }
  }

  /**
   * Clear storage
   */
  async clearStorage(): Promise<void> {
    if (!this.storage) {
      throw new Error('No storage configured');
    }

    try {
      await this.storage.clear();
      this.log('Storage cleared');
    } catch (error) {
      this.logError('Error clearing storage:', error);
      throw error;
    }
  }

  /**
   * Setup auto-save functionality
   */
  private setupAutoSave(): void {
    // Clear existing timer
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }

    // Setup new timer if configured
    if (this.config.autoSaveInterval && this.storage) {
      this.autoSaveTimer = setInterval(() => {
        this.saveState().catch(error => {
          this.logError('Auto-save failed:', error);
        });
      }, this.config.autoSaveInterval);
    }
  }

  /**
   * Stop auto-save
   */
  stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = undefined;
    }
  }

  /**
   * Start auto-save with custom interval
   */
  startAutoSave(interval: number): void {
    this.config.autoSaveInterval = interval;
    this.setupAutoSave();
  }

  /**
   * Check if storage is configured
   */
  hasStorage(): boolean {
    return !!this.storage;
  }

  /**
   * Cleanup on destroy
   */
  destroy(): void {
    this.stopAutoSave();
  }

  /**
   * Log message
   */
  private log(message: string): void {
    console.log(`[StorageService] ${message}`);
  }

  /**
   * Log error
   */
  private logError(message: string, error: any): void {
    console.error(`[StorageService] ${message}`, error);
  }
}
