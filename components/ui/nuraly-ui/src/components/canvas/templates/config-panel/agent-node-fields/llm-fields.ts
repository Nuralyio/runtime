/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, nothing, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../../workflow-canvas.types.js';

// Import KV secret select component
import '../../../../kv-secret-select/kv-secret-select.component.js';

/**
 * Render LLM node fields
 */
export function renderLlmFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  const isOllama = config.provider === 'ollama';
  const defaultModel = isOllama ? 'llama3.2' : 'gpt-4';
  const modelPlaceholder = isOllama ? 'llama3.2, mistral, codellama...' : 'Model name';

  return html`
    <div class="config-field">
      <label>Provider</label>
      <nr-select
        .value=${config.provider || 'openai'}
        .options=${[
          { label: 'OpenAI', value: 'openai' },
          { label: 'Anthropic', value: 'anthropic' },
          { label: 'Google (Gemini)', value: 'gemini' },
          { label: 'Ollama', value: 'ollama' },
          { label: 'Local', value: 'local' }
        ]}
        @nr-change=${(e: CustomEvent) => onUpdate('provider', e.detail.value)}
      ></nr-select>
    </div>

    ${isOllama ? html`
      <div class="config-field">
        <label>API URL (Optional)</label>
        <nr-kv-secret-select
          .provider=${'ollama'}
          .value=${config.apiUrlPath || ''}
          placeholder="Select or create server URL..."
          @value-change=${(e: CustomEvent) => onUpdate('apiUrlPath', e.detail.value)}
        ></nr-kv-secret-select>
        <span class="field-description">Leave empty for default (http://localhost:11434)</span>
      </div>
    ` : nothing}

    <div class="config-field">
      <label>API Key${isOllama ? ' (Optional)' : ''}</label>
      <nr-kv-secret-select
        .provider=${config.provider || 'openai'}
        .value=${config.apiKeyPath || ''}
        @value-change=${(e: CustomEvent) => onUpdate('apiKeyPath', e.detail.value)}
      ></nr-kv-secret-select>
      <span class="field-description">
        ${isOllama
          ? 'Optional - Ollama works without authentication by default'
          : 'Select or create an API key from KV store'}
      </span>
    </div>
    <div class="config-field">
      <label>Model Name</label>
      <nr-input
        value=${config.modelName || defaultModel}
        placeholder=${modelPlaceholder}
        @nr-input=${(e: CustomEvent) => onUpdate('modelName', e.detail.value)}
      ></nr-input>
    </div>
    <div class="config-field">
      <label>Temperature</label>
      <nr-input
        type="number"
        value=${String(config.temperature || 0.7)}
        @nr-input=${(e: CustomEvent) => onUpdate('temperature', parseFloat(e.detail.value))}
      ></nr-input>
    </div>
    <div class="config-field">
      <label>Max Tokens</label>
      <nr-input
        type="number"
        value=${String(config.maxTokens || 2048)}
        @nr-input=${(e: CustomEvent) => onUpdate('maxTokens', parseInt(e.detail.value))}
      ></nr-input>
    </div>
  `;
}
