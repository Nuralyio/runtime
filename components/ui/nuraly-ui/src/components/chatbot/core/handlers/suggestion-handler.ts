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

  setSuggestions(suggestions: ChatbotSuggestion[]): void {
    this.stateHandler.updateState({ suggestions });
  }

  clearSuggestions(): void {
    this.stateHandler.updateState({ suggestions: [] });
  }

  getSuggestions(): ChatbotSuggestion[] {
    const state = this.stateHandler.getState();
    return [...state.suggestions];
  }

  removeSuggestion(suggestionId: string): void {
    const state = this.stateHandler.getState();
    this.stateHandler.updateState({
      suggestions: state.suggestions.filter(s => s.id !== suggestionId)
    });
  }
}
