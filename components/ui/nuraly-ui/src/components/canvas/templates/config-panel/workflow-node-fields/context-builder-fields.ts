/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../../workflow-canvas.types.js';

/**
 * Render Context Builder node fields
 */
export function renderContextBuilderFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  const template = config.template || 'default';
  const isCustom = template === 'custom';

  return html`
    <div class="config-field">
      <label>Template Format</label>
      <nr-select
        .value=${template}
        .options=${[
          { label: 'Default [1] content...', value: 'default' },
          { label: 'Numbered (1. content...)', value: 'numbered' },
          { label: 'Markdown (### Document 1)', value: 'markdown' },
          { label: 'XML (<document>)', value: 'xml' },
          { label: 'Custom Template', value: 'custom' },
        ]}
        @nr-change=${(e: CustomEvent) => onUpdate('template', e.detail.value)}
      ></nr-select>
    </div>

    ${isCustom ? html`
      <div class="config-field">
        <label>Custom Template</label>
        <nr-textarea
          value=${config.customTemplate || 'Document {{index}}: {{content}}\nSource: {{sourceId}}\n---'}
          rows="4"
          @nr-input=${(e: CustomEvent) => onUpdate('customTemplate', e.detail.value)}
        ></nr-textarea>
        <small class="field-hint">Variables: {{index}}, {{content}}, {{sourceId}}, {{score}}, {{scorePercent}}</small>
      </div>
    ` : ''}

    <div class="config-field">
      <label>Max Tokens</label>
      <nr-input
        type="number"
        value=${config.maxTokens || 4000}
        min="100"
        max="32000"
        @nr-input=${(e: CustomEvent) => onUpdate('maxTokens', parseInt(e.detail.value) || 4000)}
      ></nr-input>
      <small class="field-hint">Approximate max tokens for context (stops adding docs when exceeded)</small>
    </div>

    <div class="config-field">
      <label>Max Documents</label>
      <nr-input
        type="number"
        value=${config.maxDocuments || 10}
        min="1"
        max="50"
        @nr-input=${(e: CustomEvent) => onUpdate('maxDocuments', parseInt(e.detail.value) || 10)}
      ></nr-input>
    </div>

    <div class="config-field">
      <label class="checkbox-label">
        <nr-checkbox
          ?checked=${config.includeSourceInfo !== false}
          @nr-change=${(e: CustomEvent) => onUpdate('includeSourceInfo', e.detail.checked)}
        ></nr-checkbox>
        Include Source Info
      </label>
      <small class="field-hint">Add source document references</small>
    </div>

    <div class="config-field">
      <label class="checkbox-label">
        <nr-checkbox
          ?checked=${config.includeSimilarityScore || false}
          @nr-change=${(e: CustomEvent) => onUpdate('includeSimilarityScore', e.detail.checked)}
        ></nr-checkbox>
        Include Similarity Score
      </label>
    </div>

    <div class="config-field">
      <label>Document Separator</label>
      <nr-input
        value=${config.separator || '\\n\\n---\\n\\n'}
        placeholder="\\n\\n---\\n\\n"
        @nr-input=${(e: CustomEvent) => onUpdate('separator', e.detail.value)}
      ></nr-input>
    </div>

    <div class="config-field">
      <label>Header (Optional)</label>
      <nr-input
        value=${config.header || ''}
        placeholder="Relevant context:\\n\\n"
        @nr-input=${(e: CustomEvent) => onUpdate('header', e.detail.value)}
      ></nr-input>
      <small class="field-hint">Text to prepend to context</small>
    </div>

    <div class="config-field">
      <label>Footer (Optional)</label>
      <nr-input
        value=${config.footer || ''}
        placeholder="\\n\\nAnswer based on the above context."
        @nr-input=${(e: CustomEvent) => onUpdate('footer', e.detail.value)}
      ></nr-input>
      <small class="field-hint">Text to append to context</small>
    </div>
  `;
}
