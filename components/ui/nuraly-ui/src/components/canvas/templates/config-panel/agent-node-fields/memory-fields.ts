/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../../workflow-canvas.types.js';

/**
 * Cutoff mode options for context memory
 */
const CUTOFF_MODE_OPTIONS = [
  { value: 'message', label: 'Message Count' },
  { value: 'token', label: 'Token Count' },
];

/**
 * Render Memory node fields for context memory configuration.
 *
 * Backend expects:
 * - cutoffMode: "message" | "token" - How to limit context window
 * - maxMessages: number (default 50) - Max messages when cutoffMode is "message"
 * - maxTokens: number (default 4000) - Max tokens when cutoffMode is "token"
 * - conversationIdExpression: string - Expression to get conversation ID (e.g., "${input.threadId}")
 */
export function renderMemoryFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  const cutoffMode = (config.cutoffMode as string) || 'message';

  return html`
    <div class="config-field">
      <label>Cutoff Mode</label>
      <nr-select
        .value=${cutoffMode}
        .options=${CUTOFF_MODE_OPTIONS}
        @nr-change=${(e: CustomEvent) => onUpdate('cutoffMode', e.detail.value)}
      ></nr-select>
      <span class="field-description">How to limit the conversation context window</span>
    </div>

    ${cutoffMode === 'message' ? html`
      <div class="config-field">
        <label>Max Messages</label>
        <nr-input
          type="number"
          value=${String(config.maxMessages || 50)}
          min="1"
          max="200"
          @nr-input=${(e: CustomEvent) => onUpdate('maxMessages', parseInt(e.detail.value) || 50)}
        ></nr-input>
        <span class="field-description">Maximum number of messages to retain in context</span>
      </div>
    ` : html`
      <div class="config-field">
        <label>Max Tokens</label>
        <nr-input
          type="number"
          value=${String(config.maxTokens || 4000)}
          min="100"
          max="128000"
          step="100"
          @nr-input=${(e: CustomEvent) => onUpdate('maxTokens', parseInt(e.detail.value) || 4000)}
        ></nr-input>
        <span class="field-description">Maximum tokens to retain in context (estimated)</span>
      </div>
    `}

    <div class="config-field">
      <label>Conversation ID Expression</label>
      <nr-input
        value=${(config.conversationIdExpression as string) || '${input.threadId}'}
        placeholder="\${input.threadId}"
        @nr-input=${(e: CustomEvent) => onUpdate('conversationIdExpression', e.detail.value)}
      ></nr-input>
      <span class="field-description">Expression to resolve conversation ID from input (e.g., \${input.threadId}, \${input.sessionId})</span>
    </div>
  `;
}
