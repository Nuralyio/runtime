/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../../workflow-canvas.types.js';

const PARSE_MODES = [
  { value: '', label: 'None' },
  { value: 'HTML', label: 'HTML' },
  { value: 'Markdown', label: 'Markdown' },
  { value: 'MarkdownV2', label: 'MarkdownV2' },
];

const REACTION_EMOJIS = [
  { value: '', label: 'None' },
  { value: '👍', label: '👍 Thumbs Up' },
  { value: '👀', label: '👀 Eyes (read)' },
  { value: '✅', label: '✅ Check' },
  { value: '❤', label: '❤ Heart' },
  { value: '🔥', label: '🔥 Fire' },
  { value: '⚡', label: '⚡ Lightning' },
];

/**
 * Render Telegram Send Message node config fields
 */
export function renderTelegramSendFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void,
): TemplateResult {
  return html`
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Message</span>
        <span class="config-section-desc">Configure the message to send</span>
      </div>
      <div class="config-field">
        <label>Text</label>
        <nr-input
          type="textarea"
          value=${(config as any).text || ''}
          placeholder="Hello! Use \${message} to reference workflow variables"
          @nr-input=${(e: CustomEvent) => onUpdate('text', e.detail.value)}
        ></nr-input>
        <span class="field-description">Message text. Use \${variableName} for dynamic content.</span>
      </div>
      <div class="config-field">
        <label>Parse Mode</label>
        <nr-select
          value=${(config as any).parseMode || ''}
          @nr-change=${(e: CustomEvent) => onUpdate('parseMode', e.detail.value)}
        >
          ${PARSE_MODES.map(m => html`
            <nr-option value=${m.value}>${m.label}</nr-option>
          `)}
        </nr-select>
        <span class="field-description">Text formatting mode</span>
      </div>
    </div>

    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Target</span>
        <span class="config-section-desc">Leave empty to auto-use chatId from Telegram Bot trigger</span>
      </div>
      <div class="config-field">
        <label>Bot Token</label>
        <nr-input
          type="password"
          value=${(config as any).botToken || ''}
          placeholder="Auto from trigger (leave empty)"
          @nr-input=${(e: CustomEvent) => onUpdate('botToken', e.detail.value)}
        ></nr-input>
        <span class="field-description">Leave empty to use the token from the Telegram Bot trigger node</span>
      </div>
      <div class="config-field">
        <label>Chat ID</label>
        <nr-input
          value=${(config as any).chatId || ''}
          placeholder="Auto from trigger (leave empty)"
          @nr-input=${(e: CustomEvent) => onUpdate('chatId', e.detail.value)}
        ></nr-input>
        <span class="field-description">Leave empty to reply to the same chat that triggered the workflow</span>
      </div>
    </div>

    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Behavior</span>
      </div>
      <div class="config-field">
        <label>Show Typing</label>
        <nr-switch
          ?checked=${(config as any).showTyping !== false}
          @nr-change=${(e: CustomEvent) => onUpdate('showTyping', e.detail.checked)}
        ></nr-switch>
        <span class="field-description">Show "typing..." indicator before sending</span>
      </div>
      <div class="config-field">
        <label>Reaction Emoji</label>
        <nr-select
          value=${(config as any).reaction || ''}
          @nr-change=${(e: CustomEvent) => onUpdate('reaction', e.detail.value)}
        >
          ${REACTION_EMOJIS.map(r => html`
            <nr-option value=${r.value}>${r.label}</nr-option>
          `)}
        </nr-select>
        <span class="field-description">React to the incoming message (read acknowledgment)</span>
      </div>
      <div class="config-field">
        <label>Disable Notification</label>
        <nr-switch
          ?checked=${(config as any).disableNotification === true}
          @nr-change=${(e: CustomEvent) => onUpdate('disableNotification', e.detail.checked)}
        ></nr-switch>
        <span class="field-description">Send message silently</span>
      </div>
    </div>
  `;
}
