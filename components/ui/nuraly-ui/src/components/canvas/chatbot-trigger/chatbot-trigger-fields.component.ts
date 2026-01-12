/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html, nothing, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { classMap } from 'lit/directives/class-map.js';
import { chatbotTriggerFieldStyles } from './chatbot-trigger-fields.style.js';
import { NuralyUIBaseMixin } from '@nuralyui/common/mixins';
import {
  ChatbotTriggerEvent,
  CHATBOT_TRIGGER_EVENTS,
  SuggestionConfig,
  ModuleConfig,
  ChatbotTriggerSize,
  ChatbotTriggerVariant,
  ChatbotTriggerLoadingType,
} from './chatbot-trigger.types.js';

/**
 * Trigger Event Selector Component
 * Multi-select for choosing trigger events
 */
@customElement('nr-trigger-event-select')
export class TriggerEventSelectComponent extends NuralyUIBaseMixin(LitElement) {
  static override styles = chatbotTriggerFieldStyles;

  override requiredComponents = ['nr-checkbox', 'nr-icon'];

  @property({ type: Array })
  value: ChatbotTriggerEvent[] = [];

  @property({ type: Boolean })
  disabled = false;

  @property({ type: String })
  label = '';

  @property({ type: String })
  description = '';

  private toggleEvent(event: ChatbotTriggerEvent) {
    if (this.disabled) return;

    const newValue = this.value.includes(event)
      ? this.value.filter(e => e !== event)
      : [...this.value, event];

    this.value = newValue;
    this.dispatchEvent(new CustomEvent('value-change', {
      detail: { value: this.value },
      bubbles: true,
      composed: true,
    }));
  }

  override render() {
    return html`
      <div class="field-container">
        ${this.label ? html`<label class="field-label">${this.label}</label>` : nothing}
        <div class="event-list">
          ${map(CHATBOT_TRIGGER_EVENTS, eventMeta => {
            const isSelected = this.value.includes(eventMeta.value);
            return html`
              <div
                class="event-item ${classMap({ selected: isSelected })}"
                @click=${() => this.toggleEvent(eventMeta.value)}
              >
                <nr-checkbox
                  class="event-item-checkbox"
                  .checked=${isSelected}
                  ?disabled=${this.disabled}
                ></nr-checkbox>
                <div class="event-item-content">
                  <div class="event-item-header">
                    <nr-icon class="event-item-icon" name=${eventMeta.icon} size="small"></nr-icon>
                    <span class="event-item-label">${eventMeta.label}</span>
                  </div>
                  <span class="event-item-description">${eventMeta.description}</span>
                </div>
              </div>
            `;
          })}
        </div>
        ${this.description ? html`<span class="field-description">${this.description}</span>` : nothing}
      </div>
    `;
  }
}

/**
 * Chatbot Size Selector Component
 */
@customElement('nr-chatbot-size-select')
export class ChatbotSizeSelectComponent extends NuralyUIBaseMixin(LitElement) {
  static override styles = chatbotTriggerFieldStyles;

  override requiredComponents = ['nr-icon'];

  @property({ type: String })
  value: ChatbotTriggerSize = 'medium';

  @property({ type: Boolean })
  disabled = false;

  @property({ type: String })
  label = '';

  private sizes: Array<{ value: ChatbotTriggerSize; label: string; icon: string }> = [
    { value: 'small', label: 'Small', icon: 'minimize-2' },
    { value: 'medium', label: 'Medium', icon: 'square' },
    { value: 'large', label: 'Large', icon: 'maximize-2' },
    { value: 'full', label: 'Full', icon: 'expand' },
  ];

  private selectSize(size: ChatbotTriggerSize) {
    if (this.disabled) return;
    this.value = size;
    this.dispatchEvent(new CustomEvent('value-change', {
      detail: { value: this.value },
      bubbles: true,
      composed: true,
    }));
  }

  override render() {
    return html`
      <div class="field-container">
        ${this.label ? html`<label class="field-label">${this.label}</label>` : nothing}
        <div class="option-grid">
          ${map(this.sizes, size => html`
            <div
              class="option-card ${classMap({ selected: this.value === size.value })}"
              @click=${() => this.selectSize(size.value)}
            >
              <nr-icon name=${size.icon} size="small"></nr-icon>
              <span class="option-card-label">${size.label}</span>
            </div>
          `)}
        </div>
      </div>
    `;
  }
}

/**
 * Chatbot Variant Selector Component
 */
@customElement('nr-chatbot-variant-select')
export class ChatbotVariantSelectComponent extends NuralyUIBaseMixin(LitElement) {
  static override styles = chatbotTriggerFieldStyles;

  override requiredComponents = ['nr-icon'];

  @property({ type: String })
  value: ChatbotTriggerVariant = 'default';

  @property({ type: Boolean })
  disabled = false;

  @property({ type: String })
  label = '';

  private variants: Array<{ value: ChatbotTriggerVariant; label: string; icon: string }> = [
    { value: 'default', label: 'Default', icon: 'layout' },
    { value: 'minimal', label: 'Minimal', icon: 'minus-square' },
    { value: 'rounded', label: 'Rounded', icon: 'circle' },
    { value: 'chatgpt', label: 'ChatGPT', icon: 'message-circle' },
  ];

  private selectVariant(variant: ChatbotTriggerVariant) {
    if (this.disabled) return;
    this.value = variant;
    this.dispatchEvent(new CustomEvent('value-change', {
      detail: { value: this.value },
      bubbles: true,
      composed: true,
    }));
  }

  override render() {
    return html`
      <div class="field-container">
        ${this.label ? html`<label class="field-label">${this.label}</label>` : nothing}
        <div class="option-grid">
          ${map(this.variants, variant => html`
            <div
              class="option-card ${classMap({ selected: this.value === variant.value })}"
              @click=${() => this.selectVariant(variant.value)}
            >
              <nr-icon name=${variant.icon} size="small"></nr-icon>
              <span class="option-card-label">${variant.label}</span>
            </div>
          `)}
        </div>
      </div>
    `;
  }
}

/**
 * Feature Toggle Component
 */
@customElement('nr-feature-toggle')
export class FeatureToggleComponent extends NuralyUIBaseMixin(LitElement) {
  static override styles = chatbotTriggerFieldStyles;

  @property({ type: Boolean })
  value = false;

  @property({ type: Boolean })
  disabled = false;

  @property({ type: String })
  label = '';

  @property({ type: String })
  description = '';

  private toggle() {
    if (this.disabled) return;
    this.value = !this.value;
    this.dispatchEvent(new CustomEvent('value-change', {
      detail: { value: this.value },
      bubbles: true,
      composed: true,
    }));
  }

  override render() {
    return html`
      <div class="toggle-container" @click=${this.toggle}>
        <div class="toggle-label">
          <span class="toggle-label-text">${this.label}</span>
          ${this.description ? html`<span class="toggle-label-desc">${this.description}</span>` : nothing}
        </div>
        <div class="toggle-switch ${classMap({ active: this.value })}">
          <div class="toggle-switch-knob"></div>
        </div>
      </div>
    `;
  }
}

/**
 * Suggestion List Component
 */
@customElement('nr-suggestion-list')
export class SuggestionListComponent extends NuralyUIBaseMixin(LitElement) {
  static override styles = chatbotTriggerFieldStyles;

  override requiredComponents = ['nr-input', 'nr-icon'];

  @property({ type: Array })
  value: SuggestionConfig[] = [];

  @property({ type: Boolean })
  disabled = false;

  @property({ type: String })
  label = '';

  @property({ type: String })
  description = '';

  private updateValue(newValue: SuggestionConfig[]) {
    this.value = newValue;
    this.dispatchEvent(new CustomEvent('value-change', {
      detail: { value: this.value },
      bubbles: true,
      composed: true,
    }));
  }

  private addSuggestion() {
    const newSuggestion: SuggestionConfig = {
      id: `suggestion_${Date.now()}`,
      text: '',
      icon: 'zap',
    };
    this.updateValue([...this.value, newSuggestion]);
  }

  private removeSuggestion(id: string) {
    this.updateValue(this.value.filter(s => s.id !== id));
  }

  private updateSuggestion(id: string, updates: Partial<SuggestionConfig>) {
    this.updateValue(this.value.map(s => s.id === id ? { ...s, ...updates } : s));
  }

  override render() {
    return html`
      <div class="field-container">
        ${this.label ? html`<label class="field-label">${this.label}</label>` : nothing}
        <div class="suggestion-list">
          ${this.value.length === 0
            ? html`
              <div class="empty-state">
                <nr-icon name="zap" size="large"></nr-icon>
                <span class="empty-state-text">No suggestions configured</span>
              </div>
            `
            : map(this.value, suggestion => html`
              <div class="suggestion-item">
                <div class="suggestion-item-drag">
                  <nr-icon name="grip-vertical" size="small"></nr-icon>
                </div>
                <nr-input
                  .value=${suggestion.text}
                  placeholder="Suggestion text..."
                  size="small"
                  ?disabled=${this.disabled}
                  @nr-input=${(e: CustomEvent) => this.updateSuggestion(suggestion.id, { text: e.detail.value })}
                ></nr-input>
                <nr-input
                  .value=${suggestion.icon || ''}
                  placeholder="Icon"
                  size="small"
                  style="width: 80px"
                  ?disabled=${this.disabled}
                  @nr-input=${(e: CustomEvent) => this.updateSuggestion(suggestion.id, { icon: e.detail.value })}
                ></nr-input>
                <button
                  class="remove-btn"
                  ?disabled=${this.disabled}
                  @click=${() => this.removeSuggestion(suggestion.id)}
                >
                  <nr-icon name="x" size="small"></nr-icon>
                </button>
              </div>
            `)
          }
          <button class="add-btn" ?disabled=${this.disabled} @click=${this.addSuggestion}>
            <nr-icon name="plus" size="small"></nr-icon>
            Add suggestion
          </button>
        </div>
        ${this.description ? html`<span class="field-description">${this.description}</span>` : nothing}
      </div>
    `;
  }
}

/**
 * Chatbot Preview Component
 */
@customElement('nr-chatbot-preview')
export class ChatbotPreviewComponent extends NuralyUIBaseMixin(LitElement) {
  static override styles = chatbotTriggerFieldStyles;

  override requiredComponents = ['nr-icon'];

  @property({ type: String })
  size: ChatbotTriggerSize = 'medium';

  @property({ type: String })
  variant: ChatbotTriggerVariant = 'default';

  @property({ type: String })
  placeholder = 'Type your message...';

  @property({ type: Array })
  triggerEvents: ChatbotTriggerEvent[] = [];

  override render() {
    const eventCount = this.triggerEvents.length;
    const eventText = eventCount === 0
      ? 'No triggers configured'
      : eventCount === 1
        ? `Triggers on: ${CHATBOT_TRIGGER_EVENTS.find(e => e.value === this.triggerEvents[0])?.label}`
        : `Triggers on ${eventCount} events`;

    return html`
      <div class="chatbot-preview">
        <div class="chatbot-preview-icon">
          <nr-icon name="message-square" size="large"></nr-icon>
        </div>
        <div class="chatbot-preview-title">Chatbot Trigger</div>
        <div class="chatbot-preview-subtitle">${eventText}</div>
        <div class="chatbot-preview-subtitle" style="margin-top: 4px;">
          ${this.size} / ${this.variant}
        </div>
      </div>
    `;
  }
}

/**
 * Loading Indicator Selector Component
 */
@customElement('nr-loading-type-select')
export class LoadingTypeSelectComponent extends NuralyUIBaseMixin(LitElement) {
  static override styles = chatbotTriggerFieldStyles;

  override requiredComponents = ['nr-select'];

  @property({ type: String })
  value: ChatbotTriggerLoadingType = 'dots';

  @property({ type: Boolean })
  disabled = false;

  @property({ type: String })
  label = '';

  private handleChange(e: CustomEvent) {
    this.value = e.detail.value as ChatbotTriggerLoadingType;
    this.dispatchEvent(new CustomEvent('value-change', {
      detail: { value: this.value },
      bubbles: true,
      composed: true,
    }));
  }

  override render() {
    const options = [
      { value: 'dots', label: 'Dots' },
      { value: 'spinner', label: 'Spinner' },
      { value: 'wave', label: 'Wave' },
      { value: 'typing', label: 'Typing' },
    ];

    return html`
      <div class="field-container">
        ${this.label ? html`<label class="field-label">${this.label}</label>` : nothing}
        <nr-select
          .value=${this.value}
          .options=${options}
          ?disabled=${this.disabled}
          @nr-change=${this.handleChange}
        ></nr-select>
      </div>
    `;
  }
}

// Export all components
export {
  TriggerEventSelectComponent,
  ChatbotSizeSelectComponent,
  ChatbotVariantSelectComponent,
  FeatureToggleComponent,
  SuggestionListComponent,
  ChatbotPreviewComponent,
  LoadingTypeSelectComponent,
};
