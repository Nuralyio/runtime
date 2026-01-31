/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../../workflow-canvas.types.js';

/**
 * Render Vector Search node fields
 */
export function renderVectorSearchFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  const provider = config.provider || 'openai';
  const isOllama = provider === 'ollama';
  const isLocal = provider === 'local';

  return html`
    <div class="config-field">
      <label>Collection Name <span class="required">*</span></label>
      <nr-input
        value=${config.collectionName || ''}
        placeholder="knowledge-base"
        @nr-input=${(e: CustomEvent) => onUpdate('collectionName', e.detail.value)}
      ></nr-input>
      <small class="field-hint">Vector collection to search</small>
    </div>

    <div class="config-field">
      <label>Input Field</label>
      <nr-input
        value=${config.inputField || ''}
        placeholder="query"
        @nr-input=${(e: CustomEvent) => onUpdate('inputField', e.detail.value)}
      ></nr-input>
      <small class="field-hint">Field name to read query from (default: "query")</small>
    </div>

    <div class="config-field">
      <label>Top K Results</label>
      <nr-input
        type="number"
        value=${config.topK || 5}
        min="1"
        max="100"
        @nr-input=${(e: CustomEvent) => onUpdate('topK', parseInt(e.detail.value) || 5)}
      ></nr-input>
      <small class="field-hint">Number of results to return</small>
    </div>

    <div class="config-field">
      <label>Minimum Score</label>
      <nr-input
        type="number"
        value=${config.minScore || 0.7}
        min="0"
        max="1"
        step="0.1"
        @nr-input=${(e: CustomEvent) => onUpdate('minScore', parseFloat(e.detail.value) || 0)}
      ></nr-input>
      <small class="field-hint">Filter out results below this similarity score (0-1)</small>
    </div>

    <div class="config-field">
      <label class="checkbox-label">
        <nr-checkbox
          ?checked=${config.includeContent !== false}
          @nr-change=${(e: CustomEvent) => onUpdate('includeContent', e.detail.checked)}
        ></nr-checkbox>
        Include Content
      </label>
    </div>

    <div class="config-field">
      <label class="checkbox-label">
        <nr-checkbox
          ?checked=${config.includeMetadata !== false}
          @nr-change=${(e: CustomEvent) => onUpdate('includeMetadata', e.detail.checked)}
        ></nr-checkbox>
        Include Metadata
      </label>
    </div>

    <hr style="margin: 16px 0; border: none; border-top: 1px solid var(--nr-border-color);" />
    <div class="config-section-title">Query Embedding Settings</div>

    <div class="config-field">
      <label>Embedding Provider</label>
      <nr-select
        .value=${provider}
        .options=${[
          { label: 'OpenAI', value: 'openai' },
          { label: 'Ollama', value: 'ollama' },
          { label: 'Local (ONNX)', value: 'local' },
        ]}
        @nr-change=${(e: CustomEvent) => onUpdate('provider', e.detail.value)}
      ></nr-select>
      <small class="field-hint">Used to embed the query (must match indexed embeddings)</small>
    </div>

    <div class="config-field">
      <label>Model</label>
      ${provider === 'openai' ? html`
        <nr-select
          .value=${config.model || 'text-embedding-3-small'}
          .options=${[
            { label: 'text-embedding-3-small', value: 'text-embedding-3-small' },
            { label: 'text-embedding-3-large', value: 'text-embedding-3-large' },
            { label: 'text-embedding-ada-002', value: 'text-embedding-ada-002' },
          ]}
          @nr-change=${(e: CustomEvent) => onUpdate('model', e.detail.value)}
        ></nr-select>
      ` : html`
        <nr-input
          value=${config.model || ''}
          placeholder=${isOllama ? 'nomic-embed-text' : 'all-MiniLM-L6-v2'}
          @nr-input=${(e: CustomEvent) => onUpdate('model', e.detail.value)}
        ></nr-input>
      `}
    </div>

    ${!isLocal ? html`
      <div class="config-field">
        <label>API Key Path</label>
        <nr-input
          value=${config.apiKeyPath || ''}
          placeholder="openai/embedding-key"
          @nr-input=${(e: CustomEvent) => onUpdate('apiKeyPath', e.detail.value)}
        ></nr-input>
        <small class="field-hint">KV store path for API key</small>
      </div>
    ` : ''}

    ${isOllama ? html`
      <div class="config-field">
        <label>API URL Path</label>
        <nr-input
          value=${config.apiUrlPath || ''}
          placeholder="ollama/server-url"
          @nr-input=${(e: CustomEvent) => onUpdate('apiUrlPath', e.detail.value)}
        ></nr-input>
      </div>
    ` : ''}

    <div class="config-field">
      <label>Isolation Key (Optional)</label>
      <nr-input
        value=${config.isolationKey || ''}
        placeholder="\${input.userId}"
        @nr-input=${(e: CustomEvent) => onUpdate('isolationKey', e.detail.value)}
      ></nr-input>
      <small class="field-hint">Search only within partitioned data</small>
    </div>
  `;
}
