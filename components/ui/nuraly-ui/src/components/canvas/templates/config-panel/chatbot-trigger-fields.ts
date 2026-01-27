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

      <nr-feature-toggle
        label="Always Open Plan"
        description="Show execution plan before running the workflow"
        .checked=${config.alwaysOpenPlan === true}
        @toggle-change=${(e: CustomEvent) => onUpdate('alwaysOpenPlan', e.detail.checked)}
      ></nr-feature-toggle>
    </div>

    <!-- File Upload Section -->
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">File Upload</span>
        <span class="config-section-desc">Allow users to upload files</span>
      </div>

      <nr-feature-toggle
        label="Enable File Upload"
        description="Allow users to attach files to messages"
        .checked=${config.enableFileUpload === true}
        @toggle-change=${(e: CustomEvent) => onUpdate('enableFileUpload', e.detail.checked)}
      ></nr-feature-toggle>

      ${config.enableFileUpload ? html`
        <div class="config-field">
          <label>Max File Size (MB)</label>
          <nr-input
            type="number"
            .value=${String((config.maxFileSize as number) || 10)}
            placeholder="10"
            @nr-input=${(e: CustomEvent) => onUpdate('maxFileSize', parseInt(e.detail.value) || 10)}
          ></nr-input>
        </div>

        <div class="config-field">
          <label>Max Files per Message</label>
          <nr-input
            type="number"
            .value=${String((config.maxFiles as number) || 5)}
            placeholder="5"
            @nr-input=${(e: CustomEvent) => onUpdate('maxFiles', parseInt(e.detail.value) || 5)}
          ></nr-input>
        </div>

        <div class="config-field">
          <label>Allowed File Types</label>
          <div class="checkbox-group">
            <label class="checkbox-item">
              <nr-checkbox
                ?checked=${(config.allowImages as boolean) !== false}
                @nr-change=${(e: CustomEvent) => onUpdate('allowImages', e.detail.checked)}
              ></nr-checkbox>
              Images (PNG, JPG, GIF, WebP)
            </label>
            <label class="checkbox-item">
              <nr-checkbox
                ?checked=${(config.allowDocuments as boolean) === true}
                @nr-change=${(e: CustomEvent) => onUpdate('allowDocuments', e.detail.checked)}
              ></nr-checkbox>
              Documents (PDF, Word, Excel)
            </label>
            <label class="checkbox-item">
              <nr-checkbox
                ?checked=${(config.allowText as boolean) === true}
                @nr-change=${(e: CustomEvent) => onUpdate('allowText', e.detail.checked)}
              ></nr-checkbox>
              Text Files (TXT, CSV, JSON)
            </label>
            <label class="checkbox-item">
              <nr-checkbox
                ?checked=${(config.allowAudio as boolean) === true}
                @nr-change=${(e: CustomEvent) => onUpdate('allowAudio', e.detail.checked)}
              ></nr-checkbox>
              Audio (MP3, WAV)
            </label>
            <label class="checkbox-item">
              <nr-checkbox
                ?checked=${(config.allowVideo as boolean) === true}
                @nr-change=${(e: CustomEvent) => onUpdate('allowVideo', e.detail.checked)}
              ></nr-checkbox>
              Video (MP4, WebM)
            </label>
          </div>
        </div>
      ` : nothing}
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
