/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../../workflow-canvas.types.js';

/**
 * Render Web Search node fields
 */
export function renderWebSearchFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  return html`
    <div class="config-field">
      <label>Search Provider</label>
      <nr-select
        .value=${config.provider || 'google'}
        .options=${[
          { label: 'Google', value: 'google' },
          { label: 'Bing', value: 'bing' },
          { label: 'SerpAPI', value: 'serpapi' },
          { label: 'Brave', value: 'brave' },
          { label: 'DuckDuckGo (Free)', value: 'duckduckgo' },
        ]}
        @nr-change=${(e: CustomEvent) => onUpdate('provider', e.detail.value)}
      ></nr-select>
      <small class="field-hint">API keys configured in KV store (search/{provider}/api_key)</small>
    </div>

    <div class="config-field">
      <label>Query Field</label>
      <nr-input
        value=${config.queryField || 'query'}
        placeholder="query"
        @nr-input=${(e: CustomEvent) => onUpdate('queryField', e.detail.value)}
      ></nr-input>
      <small class="field-hint">Input field containing the search query</small>
    </div>

    <div class="config-field">
      <label>Static Query (Optional)</label>
      <nr-input
        value=${config.query || ''}
        placeholder="\${input.searchTerm}"
        @nr-input=${(e: CustomEvent) => onUpdate('query', e.detail.value)}
      ></nr-input>
      <small class="field-hint">Override query with static value or expression</small>
    </div>

    <div class="config-field">
      <label>Number of Results</label>
      <nr-input
        type="number"
        value=${config.numResults || 10}
        min="1"
        max="50"
        @nr-input=${(e: CustomEvent) => onUpdate('numResults', parseInt(e.detail.value) || 10)}
      ></nr-input>
    </div>

    <div class="config-field">
      <label>Region (Optional)</label>
      <nr-input
        value=${config.region || ''}
        placeholder="us, uk, fr..."
        @nr-input=${(e: CustomEvent) => onUpdate('region', e.detail.value)}
      ></nr-input>
      <small class="field-hint">Country code for localized results</small>
    </div>

    <div class="config-field">
      <label>Language (Optional)</label>
      <nr-input
        value=${config.language || ''}
        placeholder="en, fr, de..."
        @nr-input=${(e: CustomEvent) => onUpdate('language', e.detail.value)}
      ></nr-input>
    </div>

    <div class="config-field">
      <label class="checkbox-label">
        <nr-checkbox
          ?checked=${config.safeSearch !== false}
          @nr-change=${(e: CustomEvent) => onUpdate('safeSearch', e.detail.checked)}
        ></nr-checkbox>
        Safe Search
      </label>
      <small class="field-hint">Filter explicit content from results</small>
    </div>

    <div class="config-field">
      <label>Timeout (ms)</label>
      <nr-input
        type="number"
        value=${config.timeout || 30000}
        min="1000"
        max="120000"
        @nr-input=${(e: CustomEvent) => onUpdate('timeout', parseInt(e.detail.value) || 30000)}
      ></nr-input>
    </div>
  `;
}
