/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, nothing, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../../workflow-canvas.types.js';

const TELEGRAM_UPDATE_TYPES = [
  { value: 'message', label: 'Message' },
  { value: 'edited_message', label: 'Edited Message' },
  { value: 'channel_post', label: 'Channel Post' },
  { value: 'edited_channel_post', label: 'Edited Channel Post' },
  { value: 'inline_query', label: 'Inline Query' },
  { value: 'chosen_inline_result', label: 'Chosen Inline Result' },
  { value: 'callback_query', label: 'Callback Query' },
  { value: 'shipping_query', label: 'Shipping Query' },
  { value: 'pre_checkout_query', label: 'Pre-checkout Query' },
  { value: 'poll', label: 'Poll' },
  { value: 'poll_answer', label: 'Poll Answer' },
  { value: 'my_chat_member', label: 'My Chat Member' },
  { value: 'chat_member', label: 'Chat Member' },
];

/**
 * Render Telegram Bot trigger config fields
 */
export function renderTelegramBotFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void,
  webhookUrl?: string
): TemplateResult {
  const mode = (config as any).mode || 'polling';
  const allowedUpdates: string[] = (config as any).allowedUpdates || [];

  return html`
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Bot Configuration</span>
        <span class="config-section-desc">Configure your Telegram bot connection</span>
      </div>
      <div class="config-field">
        <label>Bot Token</label>
        <nr-input
          type="password"
          value=${(config as any).botToken || ''}
          placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
          @nr-input=${(e: CustomEvent) => onUpdate('botToken', e.detail.value)}
        ></nr-input>
        <span class="field-description">Get your bot token from @BotFather on Telegram</span>
      </div>
    </div>

    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Connection Mode</span>
        <span class="config-section-desc">${mode === 'webhook'
          ? 'Telegram sends updates to your server via HTTPS'
          : 'Your server periodically checks Telegram for new updates'}</span>
      </div>
      <div class="config-field">
        <label>Mode</label>
        <nr-select
          .value=${mode}
          .options=${[
            { label: 'Long Polling', value: 'polling' },
            { label: 'Webhook', value: 'webhook' },
          ]}
          @nr-change=${(e: CustomEvent) => onUpdate('mode', e.detail.value)}
        ></nr-select>
      </div>
    </div>

    ${mode === 'webhook' && webhookUrl
      ? html`
          <div class="config-section">
            <div class="config-section-header">
              <span class="config-section-title">Webhook URL</span>
              <span class="config-section-desc">Telegram will send updates to this URL</span>
            </div>
            <div class="config-field">
              <div class="webhook-url-container">
                <code class="webhook-url">${webhookUrl}</code>
                <button
                  class="copy-btn"
                  @click=${() => {
                    navigator.clipboard.writeText(webhookUrl);
                  }}
                  title="Copy URL"
                >
                  <nr-icon name="copy" size="small"></nr-icon>
                </button>
              </div>
            </div>
          </div>
        `
      : nothing}

    ${mode === 'polling'
      ? html`
          <div class="config-section">
            <div class="config-section-header">
              <span class="config-section-title">Polling Settings</span>
            </div>
            <div class="config-field">
              <label>Polling Timeout (seconds)</label>
              <nr-input
                type="number"
                value=${String((config as any).pollingTimeout || 30)}
                @nr-input=${(e: CustomEvent) => onUpdate('pollingTimeout', parseInt(e.detail.value))}
              ></nr-input>
              <span class="field-description">Long-polling timeout (1-60 seconds)</span>
            </div>
          </div>
        `
      : nothing}

    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Update Types</span>
        <span class="config-section-desc">Select which update types to receive (empty = all types)</span>
      </div>
      <div class="config-field">
        <div class="method-checkboxes">
          ${TELEGRAM_UPDATE_TYPES.map(updateType => {
            const isChecked = allowedUpdates.includes(updateType.value);
            return html`
              <label class="method-checkbox">
                <input
                  type="checkbox"
                  .checked=${isChecked}
                  @change=${(e: Event) => {
                    const checked = (e.target as HTMLInputElement).checked;
                    const current = [...allowedUpdates];
                    const newUpdates = checked
                      ? [...current, updateType.value]
                      : current.filter(u => u !== updateType.value);
                    onUpdate('allowedUpdates', newUpdates);
                  }}
                />
                <span class="method-label">${updateType.label}</span>
              </label>
            `;
          })}
        </div>
      </div>
    </div>

    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Filtering</span>
        <span class="config-section-desc">Restrict which chats or users can trigger this workflow</span>
      </div>
      <div class="config-field">
        <label>Allowed Chat IDs</label>
        <nr-input
          value=${(config as any).allowedChatIds || ''}
          placeholder="-1001234567890, -1009876543210"
          @nr-input=${(e: CustomEvent) => onUpdate('allowedChatIds', e.detail.value)}
        ></nr-input>
        <span class="field-description">Comma-separated list of chat IDs (leave empty to allow all)</span>
      </div>
      <div class="config-field">
        <label>Allowed User IDs</label>
        <nr-input
          value=${(config as any).allowedUserIds || ''}
          placeholder="123456789, 987654321"
          @nr-input=${(e: CustomEvent) => onUpdate('allowedUserIds', e.detail.value)}
        ></nr-input>
        <span class="field-description">Comma-separated list of user IDs (leave empty to allow all)</span>
      </div>
    </div>
  `;
}
