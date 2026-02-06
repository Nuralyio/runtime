/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../../workflow-canvas.types.js';

/**
 * Render Web Crawl node fields
 */
export function renderWebCrawlFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  return html`
    <div class="config-field">
      <label>URL Field</label>
      <nr-input
        value=${config.urlField || 'url'}
        placeholder="url"
        @nr-input=${(e: CustomEvent) => onUpdate('urlField', e.detail.value)}
      ></nr-input>
      <small class="field-hint">Input field containing URL(s) to crawl</small>
    </div>

    <div class="config-field">
      <label>Max Depth</label>
      <nr-input
        type="number"
        value=${config.maxDepth ?? 1}
        min="0"
        max="10"
        @nr-input=${(e: CustomEvent) => onUpdate('maxDepth', parseInt(e.detail.value) || 1)}
      ></nr-input>
      <small class="field-hint">How many links deep to follow (0 = only starting URLs)</small>
    </div>

    <div class="config-field">
      <label>Max Pages</label>
      <nr-input
        type="number"
        value=${config.maxPages || 10}
        min="1"
        max="100"
        @nr-input=${(e: CustomEvent) => onUpdate('maxPages', parseInt(e.detail.value) || 10)}
      ></nr-input>
      <small class="field-hint">Maximum total pages to crawl</small>
    </div>

    <div class="config-field">
      <label class="checkbox-label">
        <nr-checkbox
          ?checked=${config.sameDomainOnly !== false}
          @nr-change=${(e: CustomEvent) => onUpdate('sameDomainOnly', e.detail.checked)}
        ></nr-checkbox>
        Same Domain Only
      </label>
      <small class="field-hint">Only follow links on the same domain</small>
    </div>

    <div class="config-field">
      <label class="checkbox-label">
        <nr-checkbox
          ?checked=${config.renderJs || false}
          @nr-change=${(e: CustomEvent) => onUpdate('renderJs', e.detail.checked)}
        ></nr-checkbox>
        Render JavaScript
      </label>
      <small class="field-hint">Use headless browser for JS-rendered pages (slower)</small>
    </div>

    <div class="config-field">
      <label>Include Patterns (Optional)</label>
      <nr-input
        value=${((config.includePatterns as string[]) || []).join(', ')}
        placeholder="/blog/.*, /docs/.*"
        @nr-input=${(e: CustomEvent) => {
          const value = e.detail.value;
          const patterns = value ? value.split(',').map((p: string) => p.trim()).filter(Boolean) : [];
          onUpdate('includePatterns', patterns);
        }}
      ></nr-input>
      <small class="field-hint">Regex patterns for URLs to include (comma-separated)</small>
    </div>

    <div class="config-field">
      <label>Exclude Patterns (Optional)</label>
      <nr-input
        value=${((config.excludePatterns as string[]) || []).join(', ')}
        placeholder="/login.*, /admin.*"
        @nr-input=${(e: CustomEvent) => {
          const value = e.detail.value;
          const patterns = value ? value.split(',').map((p: string) => p.trim()).filter(Boolean) : [];
          onUpdate('excludePatterns', patterns);
        }}
      ></nr-input>
      <small class="field-hint">Regex patterns for URLs to exclude (comma-separated)</small>
    </div>

    <div class="config-field">
      <label>Remove Selectors (Optional)</label>
      <nr-input
        value=${((config.removeSelectors as string[]) || []).join(', ')}
        placeholder="nav, footer, .sidebar"
        @nr-input=${(e: CustomEvent) => {
          const value = e.detail.value;
          const selectors = value ? value.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
          onUpdate('removeSelectors', selectors);
        }}
      ></nr-input>
      <small class="field-hint">CSS selectors for elements to remove before extraction</small>
    </div>
  `;
}
