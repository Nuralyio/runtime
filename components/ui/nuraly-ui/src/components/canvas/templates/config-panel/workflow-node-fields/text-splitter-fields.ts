/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../../workflow-canvas.types.js';

/**
 * Render Text Splitter node fields
 */
export function renderTextSplitterFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  return html`
    <div class="config-field">
      <label>Splitting Strategy</label>
      <nr-select
        .value=${config.strategy || 'recursive'}
        .options=${[
          { label: 'Recursive (Recommended)', value: 'recursive' },
          { label: 'Sentence-based', value: 'sentence' },
        ]}
        @nr-change=${(e: CustomEvent) => onUpdate('strategy', e.detail.value)}
      ></nr-select>
      <small class="field-hint">Recursive splits by paragraphs, then sentences, then words</small>
    </div>

    <div class="config-field">
      <label>Chunk Size (characters)</label>
      <nr-input
        type="number"
        value=${config.chunkSize || 1000}
        min="100"
        max="10000"
        @nr-input=${(e: CustomEvent) => onUpdate('chunkSize', parseInt(e.detail.value) || 1000)}
      ></nr-input>
      <small class="field-hint">Target size for each chunk</small>
    </div>

    <div class="config-field">
      <label>Chunk Overlap (characters)</label>
      <nr-input
        type="number"
        value=${config.chunkOverlap || 200}
        min="0"
        max="1000"
        @nr-input=${(e: CustomEvent) => onUpdate('chunkOverlap', parseInt(e.detail.value) || 200)}
      ></nr-input>
      <small class="field-hint">Overlap between chunks for context continuity</small>
    </div>

    <div class="config-field">
      <label>Content Field</label>
      <nr-input
        value=${config.contentField || 'content'}
        placeholder="content"
        @nr-input=${(e: CustomEvent) => onUpdate('contentField', e.detail.value)}
      ></nr-input>
      <small class="field-hint">Input field containing text to split</small>
    </div>
  `;
}
