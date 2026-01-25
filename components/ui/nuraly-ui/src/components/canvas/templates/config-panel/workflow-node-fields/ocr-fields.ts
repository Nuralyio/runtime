/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../../workflow-canvas.types.js';

/**
 * Render OCR node fields
 */
export function renderOcrFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  return html`
    <div class="config-field">
      <label>Image Source</label>
      <nr-select
        value=${config.imageSource || 'base64'}
        @nr-select=${(e: CustomEvent) => onUpdate('imageSource', e.detail.value)}
      >
        <nr-option value="base64">Base64 Data</nr-option>
        <nr-option value="url">Image URL</nr-option>
        <nr-option value="variable">From Variable</nr-option>
      </nr-select>
    </div>

    ${config.imageSource === 'variable' || config.imageSource === 'base64'
      ? html`
          <div class="config-field">
            <label>Image Variable</label>
            <nr-input
              value=${config.imageVariable || ''}
              placeholder="\${variables.imageData}"
              @nr-input=${(e: CustomEvent) => onUpdate('imageVariable', e.detail.value)}
            ></nr-input>
            <small class="field-hint">Variable containing the image (base64 or URL)</small>
          </div>
        `
      : html`
          <div class="config-field">
            <label>Image URL</label>
            <nr-input
              value=${config.imageUrl || ''}
              placeholder="https://example.com/image.png"
              @nr-input=${(e: CustomEvent) => onUpdate('imageUrl', e.detail.value)}
            ></nr-input>
          </div>
        `}

    <div class="config-field">
      <label>Language</label>
      <nr-select
        value=${config.ocrLanguage || 'fra'}
        @nr-select=${(e: CustomEvent) => onUpdate('ocrLanguage', e.detail.value)}
      >
        <nr-option value="fra">French</nr-option>
        <nr-option value="eng">English</nr-option>
        <nr-option value="ara">Arabic</nr-option>
        <nr-option value="deu">German</nr-option>
        <nr-option value="spa">Spanish</nr-option>
        <nr-option value="ita">Italian</nr-option>
        <nr-option value="por">Portuguese</nr-option>
        <nr-option value="chi_sim">Chinese (Simplified)</nr-option>
        <nr-option value="jpn">Japanese</nr-option>
        <nr-option value="kor">Korean</nr-option>
      </nr-select>
    </div>

    <div class="config-field">
      <label>
        <nr-checkbox
          ?checked=${config.detectLayout || false}
          @nr-change=${(e: CustomEvent) => onUpdate('detectLayout', e.detail.checked)}
        ></nr-checkbox>
        Detect Layout
      </label>
      <small class="field-hint">Preserve document structure and layout</small>
    </div>

    <div class="config-field">
      <label>
        <nr-checkbox
          ?checked=${config.asyncMode || false}
          @nr-change=${(e: CustomEvent) => onUpdate('asyncMode', e.detail.checked)}
        ></nr-checkbox>
        Async Mode
      </label>
      <small class="field-hint">Process asynchronously for large images</small>
    </div>

    <div class="config-field">
      <label>Output Variable</label>
      <nr-input
        value=${config.outputVariable || 'ocrResult'}
        placeholder="ocrResult"
        @nr-input=${(e: CustomEvent) => onUpdate('outputVariable', e.detail.value)}
      ></nr-input>
      <small class="field-hint">Variable to store extracted text</small>
    </div>
  `;
}
