/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../../workflow-canvas.types.js';

/**
 * Render Summarization node fields
 */
export function renderSummarizationFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  return html`
    <div class="config-field">
      <label>Input Field</label>
      <nr-input
        value=${config.inputField || 'text'}
        placeholder="text"
        @nr-input=${(e: CustomEvent) => onUpdate('inputField', e.detail.value)}
      ></nr-input>
      <small class="field-hint">Field containing the text to summarize</small>
    </div>

    <div class="config-field">
      <label>Output Field</label>
      <nr-input
        value=${config.outputField || 'summary'}
        placeholder="summary"
        @nr-input=${(e: CustomEvent) => onUpdate('outputField', e.detail.value)}
      ></nr-input>
      <small class="field-hint">Field name for the generated summary</small>
    </div>

    <div class="config-field">
      <label>Strategy</label>
      <nr-select
        .value=${config.strategy || 'map_reduce'}
        .options=${[
          { label: 'Stuff — send all at once (short docs)', value: 'stuff' },
          { label: 'Map-Reduce — summarize chunks then combine', value: 'map_reduce' },
          { label: 'Refine — iteratively improve summary', value: 'refine' },
        ]}
        @nr-change=${(e: CustomEvent) => onUpdate('strategy', e.detail.value)}
      ></nr-select>
      <small class="field-hint">How to handle long documents that exceed token limits</small>
    </div>

    ${config.strategy !== 'stuff' ? html`
      <div class="config-field">
        <label>Chunk Size (tokens)</label>
        <nr-input
          type="number"
          value=${config.chunkSize || 4000}
          min="500"
          max="32000"
          @nr-input=${(e: CustomEvent) => onUpdate('chunkSize', Number.parseInt(e.detail.value) || 4000)}
        ></nr-input>
        <small class="field-hint">Target size for each text chunk</small>
      </div>

      <div class="config-field">
        <label>Chunk Overlap (tokens)</label>
        <nr-input
          type="number"
          value=${config.chunkOverlap || 200}
          min="0"
          max="2000"
          @nr-input=${(e: CustomEvent) => onUpdate('chunkOverlap', Number.parseInt(e.detail.value) || 200)}
        ></nr-input>
        <small class="field-hint">Overlap between chunks for context continuity</small>
      </div>
    ` : html``}

    <div class="config-field">
      <label>Summary Prompt</label>
      <nr-textarea
        value=${config.summaryPrompt || ''}
        placeholder="Optional: custom instructions for how to summarize the text"
        rows="3"
        @nr-input=${(e: CustomEvent) => onUpdate('summaryPrompt', e.detail.value)}
      ></nr-textarea>
      <small class="field-hint">Custom summarization instructions (leave empty for default)</small>
    </div>

    <div class="config-field">
      <label>Max Summary Length (words)</label>
      <nr-input
        type="number"
        value=${config.maxSummaryLength || ''}
        placeholder="No limit"
        min="10"
        @nr-input=${(e: CustomEvent) => {
          const val = e.detail.value ? Number.parseInt(e.detail.value) : undefined;
          onUpdate('maxSummaryLength', val);
        }}
      ></nr-input>
      <small class="field-hint">Target word count for the summary (optional)</small>
    </div>

    <hr style="margin: 16px 0; border: none; border-top: 1px solid var(--nr-border-color);" />

    <div class="config-field">
      <label>LLM Provider</label>
      <nr-select
        .value=${config.provider || 'openai'}
        .options=${[
          { label: 'OpenAI', value: 'openai' },
          { label: 'Anthropic', value: 'anthropic' },
          { label: 'Google Gemini', value: 'gemini' },
          { label: 'Ollama (Local)', value: 'ollama' },
        ]}
        @nr-change=${(e: CustomEvent) => onUpdate('provider', e.detail.value)}
      ></nr-select>
    </div>

    <div class="config-field">
      <label>Model</label>
      <nr-input
        value=${config.model || 'gpt-4o-mini'}
        placeholder="gpt-4o-mini"
        @nr-input=${(e: CustomEvent) => onUpdate('model', e.detail.value)}
      ></nr-input>
    </div>

    <div class="config-field">
      <label>API Key Path</label>
      <nr-input
        value=${config.apiKeyPath || ''}
        placeholder="openai/api-key"
        @nr-input=${(e: CustomEvent) => onUpdate('apiKeyPath', e.detail.value)}
      ></nr-input>
      <small class="field-hint">KV store path for the API key</small>
    </div>

    ${config.provider === 'ollama' ? html`
      <div class="config-field">
        <label>API URL Path</label>
        <nr-input
          value=${config.apiUrlPath || ''}
          placeholder="ollama/server-url"
          @nr-input=${(e: CustomEvent) => onUpdate('apiUrlPath', e.detail.value)}
        ></nr-input>
        <small class="field-hint">KV store path for Ollama server URL</small>
      </div>
    ` : html``}
  `;
}
