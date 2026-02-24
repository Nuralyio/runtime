/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../../workflow-canvas.types.js';
import '../../../../file-upload/file-upload.component.js';

/**
 * Handle file selection from nr-file-upload and convert to base64
 */
function handleDocumentSelect(
  event: CustomEvent,
  onUpdate: (key: string, value: unknown) => void
): void {
  const files = event.detail?.files;
  if (!files || files.length === 0) return;

  const uploadFile = files[0];
  const file = uploadFile.raw as File;

  const reader = new FileReader();
  reader.onload = () => {
    const base64 = reader.result as string;
    // Extract just the base64 data (remove data:...;base64, prefix)
    const base64Data = base64.split(',')[1] || base64;

    onUpdate('testDocument', {
      filename: file.name,
      contentType: file.type,
      size: file.size,
      base64: base64Data,
    });
  };
  reader.readAsDataURL(file);
}

/**
 * Format file size for display
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Render Document Loader node fields
 */
export function renderDocumentLoaderFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  const sourceType = config.sourceType || 'text';
  const testDocument = config.testDocument as { filename: string; contentType: string; size: number; base64: string } | undefined;

  return html`
    <div class="config-field">
      <label>Source Type</label>
      <nr-select
        .value=${sourceType}
        .options=${[
          { label: 'Text Content', value: 'text' },
          { label: 'URL', value: 'url' },
          { label: 'Base64 Encoded', value: 'base64' },
        ]}
        @nr-change=${(e: CustomEvent) => onUpdate('sourceType', e.detail.value)}
      ></nr-select>
    </div>

    ${sourceType === 'url' ? html`
      <div class="config-field">
        <label>URL Field</label>
        <nr-input
          value=${config.urlField || 'documentUrl'}
          placeholder="documentUrl"
          @nr-input=${(e: CustomEvent) => onUpdate('urlField', e.detail.value)}
        ></nr-input>
        <small class="field-hint">Input field containing the document URL</small>
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
    ` : html`
      <div class="config-field">
        <label>Content Field</label>
        <nr-input
          value=${config.contentField || 'content'}
          placeholder="content"
          @nr-input=${(e: CustomEvent) => onUpdate('contentField', e.detail.value)}
        ></nr-input>
        <small class="field-hint">Input field containing document content</small>
      </div>
    `}

    <div class="config-field">
      <label>Filename Field</label>
      <nr-input
        value=${config.filenameField || 'filename'}
        placeholder="filename"
        @nr-input=${(e: CustomEvent) => onUpdate('filenameField', e.detail.value)}
      ></nr-input>
      <small class="field-hint">Used for file type detection</small>
    </div>

    <div class="config-field">
      <label>Default File Type</label>
      <nr-select
        .value=${config.defaultType || 'txt'}
        .options=${[
          { label: 'Plain Text (.txt)', value: 'txt' },
          { label: 'Markdown (.md)', value: 'md' },
          { label: 'PDF (.pdf)', value: 'pdf' },
          { label: 'Word (.docx)', value: 'docx' },
          { label: 'HTML (.html)', value: 'html' },
          { label: 'CSV (.csv)', value: 'csv' },
          { label: 'JSON (.json)', value: 'json' },
          { label: 'Excel (.xlsx)', value: 'xlsx' },
        ]}
        @nr-change=${(e: CustomEvent) => onUpdate('defaultType', e.detail.value)}
      ></nr-select>
      <small class="field-hint">Used when filename doesn't have extension</small>
    </div>

    <div class="config-section-divider"></div>
    <div class="config-section-title">Test Data</div>

    <div class="config-field">
      <label>Upload Test Document</label>
      ${testDocument ? html`
        <div class="test-file-info">
          <div class="test-file-details">
            <nr-icon name="file-text" size="small"></nr-icon>
            <div class="test-file-meta">
              <span class="test-file-name">${testDocument.filename}</span>
              <span class="test-file-size">${formatFileSize(testDocument.size)} • ${testDocument.contentType || 'unknown type'}</span>
            </div>
          </div>
          <button
            class="test-file-remove"
            @click=${() => onUpdate('testDocument', undefined)}
            title="Remove test document"
          >
            <nr-icon name="x" size="small"></nr-icon>
          </button>
        </div>
        <button
          class="test-workflow-btn"
          @click=${(e: Event) => {
            e.target?.dispatchEvent(new CustomEvent('test-workflow-request', {
              bubbles: true,
              composed: true,
            }));
          }}
        >
          <nr-icon name="play" size="small"></nr-icon>
          Test Workflow
        </button>
      ` : html`
        <nr-file-upload
          accept=".txt,.md,.pdf,.docx,.html,.csv,.json,.xlsx"
          tip="Drop document here or click to upload"
          @file-select=${(e: CustomEvent) => handleDocumentSelect(e, onUpdate)}
        ></nr-file-upload>
      `}
      <small class="field-hint">Upload a document to use as test input</small>
    </div>
  `;
}
