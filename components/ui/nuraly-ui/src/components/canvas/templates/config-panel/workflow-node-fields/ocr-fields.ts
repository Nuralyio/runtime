/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../../workflow-canvas.types.js';

/**
 * Render OCR node fields
 *
 * Backend expects:
 * - imageUrl: Direct URL to image
 * - imageBase64: Base64 encoded image data
 * - imageField: Variable expression like ${input.files[0].url}
 * - language: OCR language code (fr, en, ar, etc.)
 * - detectLayout: Boolean
 * - outputVariable: Variable name to store result
 */
export function renderOcrFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  // Determine which source type is being used based on config
  const getSourceType = () => {
    if (config.imageUrl) return 'url';
    if (config.imageBase64) return 'base64';
    if (config.imageField) return 'variable';
    return config.imageSource || 'variable';
  };

  const sourceType = getSourceType();

  return html`
    <div class="config-field">
      <label>Image Source</label>
      <nr-select
        .value=${sourceType}
        .options=${[
          { label: 'From Variable', value: 'variable' },
          { label: 'Direct URL', value: 'url' },
          { label: 'Base64 Data', value: 'base64' }
        ]}
        @nr-change=${(e: CustomEvent) => {
          const newSource = e.detail.value;
          onUpdate('imageSource', newSource);
          // Clear other fields when switching source type
          if (newSource === 'url') {
            onUpdate('imageField', null);
            onUpdate('imageBase64', null);
          } else if (newSource === 'variable') {
            onUpdate('imageUrl', null);
            onUpdate('imageBase64', null);
          } else if (newSource === 'base64') {
            onUpdate('imageUrl', null);
            onUpdate('imageField', null);
          }
        }}
      ></nr-select>
    </div>

    ${sourceType === 'variable'
      ? html`
          <div class="config-field">
            <label>Image Field</label>
            <nr-input
              value=${config.imageField || ''}
              placeholder="\${input.files[0].base64}"
              @nr-input=${(e: CustomEvent) => onUpdate('imageField', e.detail.value)}
            ></nr-input>
            <small class="field-hint">Variable expression for image base64 data (e.g., \${input.files[0].base64})</small>
          </div>
        `
      : sourceType === 'url'
      ? html`
          <div class="config-field">
            <label>Image URL</label>
            <nr-input
              value=${config.imageUrl || ''}
              placeholder="https://example.com/image.png"
              @nr-input=${(e: CustomEvent) => onUpdate('imageUrl', e.detail.value)}
            ></nr-input>
            <small class="field-hint">Direct URL to the image</small>
          </div>
        `
      : html`
          <div class="config-field">
            <label>Base64 Image</label>
            <nr-input
              value=${config.imageBase64 || ''}
              placeholder="\${variables.imageData}"
              @nr-input=${(e: CustomEvent) => onUpdate('imageBase64', e.detail.value)}
            ></nr-input>
            <small class="field-hint">Variable containing base64 encoded image data</small>
          </div>
        `}

    <div class="config-field">
      <label>Language</label>
      <nr-select
        .value=${config.language || 'fr'}
        .options=${[
          { label: 'French', value: 'fr' },
          { label: 'English', value: 'en' },
          { label: 'Arabic', value: 'ar' },
          { label: 'German', value: 'de' },
          { label: 'Spanish', value: 'es' },
          { label: 'Italian', value: 'it' },
          { label: 'Portuguese', value: 'pt' },
          { label: 'Chinese', value: 'ch' },
          { label: 'Japanese', value: 'ja' },
          { label: 'Korean', value: 'ko' }
        ]}
        @nr-change=${(e: CustomEvent) => onUpdate('language', e.detail.value)}
      ></nr-select>
    </div>

    <div class="config-field">
      <label class="checkbox-label">
        <nr-checkbox
          ?checked=${config.detectLayout || false}
          @nr-change=${(e: CustomEvent) => onUpdate('detectLayout', e.detail.checked)}
        ></nr-checkbox>
        Detect Layout
      </label>
      <small class="field-hint">Preserve document structure and layout</small>
    </div>

    <div class="config-field">
      <label>Output Variable</label>
      <nr-input
        value=${config.outputVariable || 'ocrResult'}
        placeholder="ocrResult"
        @nr-input=${(e: CustomEvent) => onUpdate('outputVariable', e.detail.value)}
      ></nr-input>
      <small class="field-hint">Variable to store extracted text (access via \${variables.ocrResult.text})</small>
    </div>
  `;
}
