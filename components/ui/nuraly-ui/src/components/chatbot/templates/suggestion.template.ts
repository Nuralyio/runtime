/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult, nothing } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { msg } from '@lit/localize';
import { ChatbotSuggestion } from '../chatbot.types.js';

export interface SuggestionTemplateHandlers {
  onClick: (suggestion: ChatbotSuggestion) => void;
  onKeydown: (e: KeyboardEvent) => void;
}

/**
 * Renders a single suggestion
 */
export function renderSuggestion(
  suggestion: ChatbotSuggestion,
  handlers: SuggestionTemplateHandlers
): TemplateResult {
  return html`
    <div 
      class="suggestion ${classMap({ 'suggestion--disabled': !suggestion.enabled })}" 
      part="suggestion"
      role="button"
      tabindex="0"
      @click=${() => handlers.onClick(suggestion)}
      @keydown=${handlers.onKeydown}
      data-id="${suggestion.id}"
      aria-label="${msg('Select suggestion: ')}${suggestion.text}"
    >
      ${suggestion.text}
    </div>
  `;
}

/**
 * Renders suggestions container
 */
export function renderSuggestions(
  chatStarted: boolean,
  suggestions: ChatbotSuggestion[],
  handlers: SuggestionTemplateHandlers
): TemplateResult | typeof nothing {
  return !chatStarted && suggestions.length
    ? html`
        <div class="suggestion-container" part="suggestions">
          ${suggestions.map((suggestion) =>
            renderSuggestion(suggestion, handlers)
          )}
        </div>
      `
    : nothing;
}
