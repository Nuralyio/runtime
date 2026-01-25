/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../../workflow-canvas.types.js';

/**
 * Render Chat Start node fields
 */
export function renderChatStartFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  return html`
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Output Variables</span>
        <span class="config-section-desc">Variables available after chat input</span>
      </div>
      <div class="config-field">
        <label>Output Variable</label>
        <nr-input
          value=${config.outputVariable || 'chatInput'}
          placeholder="chatInput"
          @nr-input=${(e: CustomEvent) => onUpdate('outputVariable', e.detail.value)}
        ></nr-input>
        <span class="field-description">Variable containing the full chat message object</span>
      </div>
    </div>
  `;
}

/**
 * Render Chat Output node fields
 */
export function renderChatOutputFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  return html`
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Message</span>
        <span class="config-section-desc">Message to send back to the chatbot</span>
      </div>
      <div class="config-field">
        <label>Message Expression</label>
        <nr-input
          value=${config.message || ''}
          placeholder="\${variables.response}"
          @nr-input=${(e: CustomEvent) => onUpdate('message', e.detail.value)}
        ></nr-input>
        <span class="field-description">Use \${variables.name} or \${input.field} to reference data</span>
      </div>
    </div>
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Options</span>
      </div>
      <div class="config-field">
        <label>Message Type</label>
        <nr-select
          .value=${config.messageType || 'text'}
          .options=${[
            { label: 'Text', value: 'text' },
            { label: 'Markdown', value: 'markdown' },
            { label: 'HTML', value: 'html' },
            { label: 'JSON', value: 'json' }
          ]}
          @nr-change=${(e: CustomEvent) => onUpdate('messageType', e.detail.value)}
        ></nr-select>
        <span class="field-description">Format of the message content</span>
      </div>
    </div>
  `;
}
