/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveController, ReactiveControllerHost } from 'lit';
import { ChatbotSuggestion, ChatbotEventDetail } from '../chatbot.types.js';

/**
 * Interface for chatbot suggestion controller host
 */
export interface ChatbotSuggestionControllerHost extends ReactiveControllerHost {
  suggestions: ChatbotSuggestion[];
  chatStarted: boolean;
  dispatchEventWithMetadata(type: string, detail?: ChatbotEventDetail): void;
}

/**
 * Controller for managing chatbot suggestions
 */
export class ChatbotSuggestionController implements ReactiveController {
  private host: ChatbotSuggestionControllerHost;
  private suggestionCategories: Map<string, ChatbotSuggestion[]> = new Map();
  private activeCategoryId?: string;

  constructor(host: ChatbotSuggestionControllerHost) {
    this.host = host;
    host.addController(this);
  }

  hostConnected(): void {
    this.setupDefaultSuggestions();
  }

  hostDisconnected(): void {
    this.suggestionCategories.clear();
  }

  /**
   * Setup default suggestions
   */
  private setupDefaultSuggestions(): void {
    // General help suggestions
    this.addSuggestionCategory('general', [
      { id: 'help', text: 'Help', enabled: true },
      { id: 'support', text: 'Contact Support', enabled: true },
      { id: 'info', text: 'More Information', enabled: true }
    ]);

    // Quick actions
    this.addSuggestionCategory('actions', [
      { id: 'start-over', text: 'Start Over', enabled: true },
      { id: 'clear-chat', text: 'Clear Chat', enabled: true }
    ]);
  }

  /**
   * Add a suggestion category
   */
  addSuggestionCategory(categoryId: string, suggestions: ChatbotSuggestion[]): void {
    this.suggestionCategories.set(categoryId, suggestions);
  }

  /**
   * Remove a suggestion category
   */
  removeSuggestionCategory(categoryId: string): void {
    this.suggestionCategories.delete(categoryId);
    
    if (this.activeCategoryId === categoryId) {
      this.activeCategoryId = undefined;
      this.host.suggestions = [];
      this.host.requestUpdate();
    }
  }

  /**
   * Set active suggestion category
   */
  setActiveCategory(categoryId: string): void {
    const suggestions = this.suggestionCategories.get(categoryId);
    
    if (suggestions) {
      this.activeCategoryId = categoryId;
      this.host.suggestions = [...suggestions];
      this.host.requestUpdate();
    }
  }

  /**
   * Get suggestions for a category
   */
  getSuggestionsForCategory(categoryId: string): ChatbotSuggestion[] {
    return this.suggestionCategories.get(categoryId) || [];
  }

  /**
   * Add suggestion to category
   */
  addSuggestion(categoryId: string, suggestion: ChatbotSuggestion): void {
    const suggestions = this.suggestionCategories.get(categoryId) || [];
    suggestions.push(suggestion);
    this.suggestionCategories.set(categoryId, suggestions);
    
    // Update host if this is the active category
    if (this.activeCategoryId === categoryId) {
      this.host.suggestions = [...suggestions];
      this.host.requestUpdate();
    }
  }

  /**
   * Remove suggestion from category
   */
  removeSuggestion(categoryId: string, suggestionId: string): void {
    const suggestions = this.suggestionCategories.get(categoryId);
    
    if (suggestions) {
      const filtered = suggestions.filter(s => s.id !== suggestionId);
      this.suggestionCategories.set(categoryId, filtered);
      
      // Update host if this is the active category
      if (this.activeCategoryId === categoryId) {
        this.host.suggestions = [...filtered];
        this.host.requestUpdate();
      }
    }
  }

  /**
   * Enable/disable suggestion
   */
  setSuggestionEnabled(categoryId: string, suggestionId: string, enabled: boolean): void {
    const suggestions = this.suggestionCategories.get(categoryId);
    
    if (suggestions) {
      const suggestion = suggestions.find(s => s.id === suggestionId);
      if (suggestion) {
        suggestion.enabled = enabled;
        
        // Update host if this is the active category
        if (this.activeCategoryId === categoryId) {
          this.host.suggestions = [...suggestions];
          this.host.requestUpdate();
        }
      }
    }
  }

  /**
   * Clear suggestions from host
   */
  clearSuggestions(): void {
    this.host.suggestions = [];
    this.host.requestUpdate();
  }

  /**
   * Should suggestions be shown
   */
  shouldShowSuggestions(): boolean {
    return !this.host.chatStarted && this.host.suggestions.length > 0;
  }

  /**
   * Handle suggestion click
   */
  handleSuggestionClick(suggestion: ChatbotSuggestion): void {
    if (!suggestion.enabled) return;

    this.host.dispatchEventWithMetadata('nr-chatbot-suggestion-clicked', {
      suggestion,
      metadata: { categoryId: this.activeCategoryId }
    });

    // Remove clicked suggestion from active suggestions
    if (this.activeCategoryId) {
      this.removeSuggestion(this.activeCategoryId, suggestion.id);
    }
  }

  /**
   * Get all categories
   */
  getCategories(): string[] {
    return Array.from(this.suggestionCategories.keys());
  }

  /**
   * Get active category ID
   */
  getActiveCategoryId(): string | undefined {
    return this.activeCategoryId;
  }

  /**
   * Update suggestion in category
   */
  updateSuggestion(categoryId: string, suggestionId: string, updates: Partial<ChatbotSuggestion>): void {
    const suggestions = this.suggestionCategories.get(categoryId);
    
    if (suggestions) {
      const index = suggestions.findIndex(s => s.id === suggestionId);
      if (index !== -1) {
        suggestions[index] = { ...suggestions[index], ...updates };
        
        // Update host if this is the active category
        if (this.activeCategoryId === categoryId) {
          this.host.suggestions = [...suggestions];
          this.host.requestUpdate();
        }
      }
    }
  }

  /**
   * Get suggestion by ID from category
   */
  getSuggestionById(categoryId: string, suggestionId: string): ChatbotSuggestion | undefined {
    const suggestions = this.suggestionCategories.get(categoryId);
    return suggestions?.find(s => s.id === suggestionId);
  }

  /**
   * Clear all categories
   */
  clearAllCategories(): void {
    this.suggestionCategories.clear();
    this.activeCategoryId = undefined;
    this.host.suggestions = [];
    this.host.requestUpdate();
  }
}