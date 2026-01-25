/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, nothing, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../../workflow-canvas.types.js';

// Import KV secret select component
import '../../../../kv-secret-select/kv-secret-select.component.js';

// Import Ollama model select component
import './ollama-model-select/ollama-model-select.component.js';

// Import provider configurations
import { getProviderConfig, PROVIDER_OPTIONS } from './llm-providers/index.js';

/**
 * Render LLM node fields
 */
export function renderLlmFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  const provider = (config.provider as string) || 'openai';
  const providerConfig = getProviderConfig(provider);

  // Use provider-specific default if no model set
  const currentModel = config.modelName as string || '';
  const displayModel = currentModel || providerConfig.defaultModel;

  return html`
    <div class="config-field">
      <label>Provider</label>
      <nr-select
        .value=${provider}
        .options=${PROVIDER_OPTIONS}
        @nr-change=${(e: CustomEvent) => {
          const newProvider = e.detail.value;
          const newConfig = getProviderConfig(newProvider);
          // Update provider and reset model to new provider's default
          onUpdate('provider', newProvider);
          onUpdate('modelName', newConfig.defaultModel);
          onUpdate('maxTokens', newConfig.defaultMaxTokens);
        }}
      ></nr-select>
    </div>

    <!-- API URL field for providers that need it -->
    ${providerConfig.requiresApiUrl ? html`
      <div class="config-field">
        <label>API URL${!providerConfig.requiresApiKey ? ' (Optional)' : ''}</label>
        <nr-kv-secret-select
          .provider=${provider}
          .value=${config.apiUrlPath || ''}
          type="url"
          placeholder="Select or create server URL..."
          @value-change=${(e: CustomEvent) => onUpdate('apiUrlPath', e.detail.value)}
        ></nr-kv-secret-select>
        <span class="field-description">
          ${providerConfig.apiUrlDescription || 'URL of your LLM server'}
        </span>
      </div>
    ` : nothing}

    <!-- API Key field -->
    <div class="config-field">
      <label>API Key${!providerConfig.requiresApiKey ? ' (Optional)' : ''}</label>
      <nr-kv-secret-select
        .provider=${provider}
        .value=${config.apiKeyPath || ''}
        placeholder="Select API key..."
        @value-change=${(e: CustomEvent) => onUpdate('apiKeyPath', e.detail.value)}
      ></nr-kv-secret-select>
      <span class="field-description">${providerConfig.apiKeyDescription}</span>
    </div>

    <!-- Model Selection -->
    <div class="config-field">
      <label>Model Name</label>
      ${provider === 'ollama' ? html`
        <!-- Ollama: fetch models dynamically from server -->
        <nr-ollama-model-select
          .serverUrlPath=${config.apiUrlPath || ''}
          .value=${displayModel}
          placeholder=${providerConfig.modelPlaceholder}
          @value-change=${(e: CustomEvent) => onUpdate('modelName', e.detail.value)}
        ></nr-ollama-model-select>
        <span class="field-description">Models fetched from your Ollama server</span>
      ` : providerConfig.modelOptions.length > 0 ? html`
        <nr-select
          .value=${displayModel}
          .options=${providerConfig.modelOptions}
          placeholder=${providerConfig.modelPlaceholder}
          searchable
          allowCustomValue
          @nr-change=${(e: CustomEvent) => onUpdate('modelName', e.detail.value)}
        ></nr-select>
        <span class="field-description">Select a model or enter a custom model name</span>
      ` : html`
        <nr-input
          value=${displayModel}
          placeholder=${providerConfig.modelPlaceholder}
          @nr-input=${(e: CustomEvent) => onUpdate('modelName', e.detail.value)}
        ></nr-input>
      `}
    </div>

    <!-- Temperature -->
    <div class="config-field">
      <label>Temperature</label>
      <nr-input
        type="number"
        value=${String(config.temperature ?? 0.7)}
        min="0"
        max="2"
        step="0.1"
        @nr-input=${(e: CustomEvent) => onUpdate('temperature', parseFloat(e.detail.value))}
      ></nr-input>
      <span class="field-description">Controls randomness (0 = deterministic, 2 = very random)</span>
    </div>

    <!-- Max Tokens -->
    <div class="config-field">
      <label>Max Tokens</label>
      <nr-input
        type="number"
        value=${String(config.maxTokens ?? providerConfig.defaultMaxTokens)}
        min="1"
        @nr-input=${(e: CustomEvent) => onUpdate('maxTokens', parseInt(e.detail.value))}
      ></nr-input>
      <span class="field-description">Maximum number of tokens in the response</span>
    </div>
  `;
}
