/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { StateHandler } from './state-handler.js';
import type { ChatbotSuggestion } from '../../chatbot.types.js';

/**
 * SuggestionHandler - Handles suggestion management
 * Manages suggestion list and operations
 */
export class SuggestionHandler {
  constructor(
    private stateHandler: StateHandler,
  ) {}

  /**
   * Set suggestions
   */
  setSuggestions(suggestions: ChatbotSuggestion[]): void {
    this.stateHandler.updateState({ suggestions });
  }

  /**
   * Clear all suggestions
   */
  clearSuggestions(): void {
    this.stateHandler.updateState({ suggestions: [] });
  }

  /**
   * Get current suggestions
   */
  getSuggestions(): ChatbotSuggestion[] {
    const state = this.stateHandler.getState();
    return [...state.suggestions];
  }

  /**
   * Remove a specific suggestion
   */
  removeSuggestion(suggestionId: string): void {
    const state = this.stateHandler.getState();
    this.stateHandler.updateState({
      suggestions: state.suggestions.filter(s => s.id !== suggestionId)
    });
  }
}
