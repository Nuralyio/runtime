/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, nothing, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../workflow-canvas.types.js';

// Import chatbot trigger field components
import '../../chatbot-trigger/chatbot-trigger-fields.component.js';

/**
 * Render Chatbot Trigger specific configuration fields
 */
export function renderChatbotTriggerFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  return html`
    <!-- Trigger Events Section -->
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Trigger Events</span>
        <span class="config-section-desc">Select when the workflow should trigger</span>
      </div>
      <nr-trigger-event-select
        .value=${(config.triggerEvents as string[]) || ['MESSAGE_SENT']}
        @value-change=${(e: CustomEvent) => onUpdate('triggerEvents', e.detail.value)}
      ></nr-trigger-event-select>
    </div>

    <!-- Chatbot Appearance Section -->
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Appearance</span>
        <span class="config-section-desc">Configure chatbot appearance</span>
      </div>

      <div class="config-field">
        <label>Title</label>
        <nr-input
          .value=${(config.title as string) || 'Chat Assistant'}
          placeholder="Chatbot title"
          @nr-input=${(e: CustomEvent) => onUpdate('title', e.detail.value)}
        ></nr-input>
      </div>

      <div class="config-field">
        <label>Subtitle</label>
        <nr-input
          .value=${(config.subtitle as string) || ''}
          placeholder="Chatbot subtitle"
          @nr-input=${(e: CustomEvent) => onUpdate('subtitle', e.detail.value)}
        ></nr-input>
      </div>

      <div class="config-field">
        <label>Placeholder</label>
        <nr-input
          .value=${(config.placeholder as string) || 'Type a message...'}
          placeholder="Input placeholder text"
          @nr-input=${(e: CustomEvent) => onUpdate('placeholder', e.detail.value)}
        ></nr-input>
      </div>

      <nr-chatbot-size-select
        label="Size"
        .value=${(config.chatbotSize as string) || 'medium'}
        @value-change=${(e: CustomEvent) => onUpdate('chatbotSize', e.detail.value)}
      ></nr-chatbot-size-select>

      <nr-chatbot-variant-select
        label="Variant"
        .value=${(config.chatbotVariant as string) || 'floating'}
        @value-change=${(e: CustomEvent) => onUpdate('chatbotVariant', e.detail.value)}
      ></nr-chatbot-variant-select>
    </div>

    <!-- Behavior Section -->
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Behavior</span>
        <span class="config-section-desc">Configure chatbot behavior</span>
      </div>

      <div class="config-field">
        <label>Initial Message</label>
        <nr-input
          .value=${(config.initialMessage as string) || ''}
          placeholder="Optional greeting message"
          @nr-input=${(e: CustomEvent) => onUpdate('initialMessage', e.detail.value)}
        ></nr-input>
        <span class="field-description">Message shown when chat opens</span>
      </div>

      <nr-feature-toggle
        label="Typing Indicator"
        description="Show typing animation when waiting for response"
        .checked=${config.enableTypingIndicator !== false}
        @toggle-change=${(e: CustomEvent) => onUpdate('enableTypingIndicator', e.detail.checked)}
      ></nr-feature-toggle>

      <nr-loading-type-select
        label="Loading Animation"
        .value=${(config.loadingType as string) || 'dots'}
        @value-change=${(e: CustomEvent) => onUpdate('loadingType', e.detail.value)}
      ></nr-loading-type-select>
    </div>

    <!-- Suggestions Section -->
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Suggestions</span>
        <span class="config-section-desc">Quick reply suggestions for users</span>
      </div>

      <nr-feature-toggle
        label="Enable Suggestions"
        description="Show quick reply buttons to users"
        .checked=${config.enableSuggestions === true}
        @toggle-change=${(e: CustomEvent) => onUpdate('enableSuggestions', e.detail.checked)}
      ></nr-feature-toggle>

      ${config.enableSuggestions ? html`
        <nr-suggestion-list
          label="Suggestion Items"
          .value=${(config.suggestions as string[]) || []}
          @value-change=${(e: CustomEvent) => onUpdate('suggestions', e.detail.value)}
        ></nr-suggestion-list>
      ` : nothing}
    </div>

    <!-- Preview Section -->
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Preview</span>
      </div>
      <nr-chatbot-preview
        .title=${(config.title as string) || 'Chat Assistant'}
        .subtitle=${(config.subtitle as string) || 'Ask me anything'}
        .variant=${(config.chatbotVariant as string) || 'floating'}
      ></nr-chatbot-preview>
    </div>
  `;
}
