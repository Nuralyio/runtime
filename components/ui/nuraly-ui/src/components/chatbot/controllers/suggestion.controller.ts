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
 * Suggestions are now only defined from outside the component via the suggestions property
 */
export class ChatbotSuggestionController implements ReactiveController {
  private host: ChatbotSuggestionControllerHost;

  constructor(host: ChatbotSuggestionControllerHost) {
    this.host = host;
    host.addController(this);
  }

  hostConnected(): void {
    // No default suggestions - all suggestions come from outside
  }

  hostDisconnected(): void {
    // Nothing to clean up
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
    if (suggestion.enabled === false) return;

    this.host.dispatchEventWithMetadata('nr-chatbot-suggestion-clicked', {
      suggestion
    });

    // Remove clicked suggestion from active suggestions
    this.removeSuggestion(suggestion.id);
  }

  /**
   * Remove suggestion by ID
   */
  private removeSuggestion(suggestionId: string): void {
    this.host.suggestions = this.host.suggestions.filter(s => s.id !== suggestionId);
    this.host.requestUpdate();
  }
}