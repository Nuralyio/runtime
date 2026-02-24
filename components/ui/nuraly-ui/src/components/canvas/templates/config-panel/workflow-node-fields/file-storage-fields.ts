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
function handleFileSelect(
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

    onUpdate('testFile', {
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
 * Render File Storage node fields
 */
export function renderFileStorageFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  const provider = config.provider || 'local';
  const providerStr = provider as string;
  const needsCredentials = providerStr === 's3' || providerStr === 'minio';
  const testFile = config.testFile as { filename: string; contentType: string; size: number; base64: string } | undefined;

  return html`
    <div class="config-field">
      <label>Storage Provider</label>
      <nr-select
        .value=${provider}
        .options=${[
          { label: 'Local Filesystem', value: 'local' },
          { label: 'Amazon S3', value: 's3' },
          { label: 'MinIO', value: 'minio' },
        ]}
        @nr-change=${(e: CustomEvent) => onUpdate('provider', e.detail.value)}
      ></nr-select>
    </div>

    ${needsCredentials ? html`
      <div class="config-field">
        <label>Storage Config Path</label>
        <nr-input
          value=${config.storageConfigPath || ''}
          placeholder="storage/my-s3-config"
          @nr-input=${(e: CustomEvent) => onUpdate('storageConfigPath', e.detail.value)}
        ></nr-input>
        <small class="field-hint">KV store path containing S3/MinIO credentials</small>
      </div>
    ` : ''}

    <div class="config-field">
      <label>Bucket</label>
      <nr-input
        value=${config.bucket || 'default'}
        placeholder="my-bucket"
        @nr-input=${(e: CustomEvent) => onUpdate('bucket', e.detail.value)}
      ></nr-input>
    </div>

    <div class="config-field">
      <label>Path Prefix</label>
      <nr-input
        value=${config.path || ''}
        placeholder="uploads/"
        @nr-input=${(e: CustomEvent) => onUpdate('path', e.detail.value)}
      ></nr-input>
      <small class="field-hint">Optional prefix for stored files</small>
    </div>

    <div class="config-field">
      <label>File Field</label>
      <nr-input
        value=${config.fileField || 'file'}
        placeholder="file"
        @nr-input=${(e: CustomEvent) => onUpdate('fileField', e.detail.value)}
      ></nr-input>
      <small class="field-hint">Input field containing base64 file content</small>
    </div>

    <div class="config-field">
      <label>Filename Field</label>
      <nr-input
        value=${config.filenameField || 'filename'}
        placeholder="filename"
        @nr-input=${(e: CustomEvent) => onUpdate('filenameField', e.detail.value)}
      ></nr-input>
      <small class="field-hint">Input field containing the filename</small>
    </div>

    <div class="config-field">
      <label>Content Type Field (Optional)</label>
      <nr-input
        value=${config.contentTypeField || ''}
        placeholder="contentType"
        @nr-input=${(e: CustomEvent) => onUpdate('contentTypeField', e.detail.value)}
      ></nr-input>
      <small class="field-hint">Input field for MIME type (auto-detected if empty)</small>
    </div>

    <div class="config-field">
      <label>Metadata Fields (Optional)</label>
      <nr-input
        value=${((config.metadataFields as string[]) || []).join(', ')}
        placeholder="userId, category"
        @nr-input=${(e: CustomEvent) => {
          const value = e.detail.value;
          const fields = value ? value.split(',').map((f: string) => f.trim()).filter(Boolean) : [];
          onUpdate('metadataFields', fields);
        }}
      ></nr-input>
      <small class="field-hint">Input fields to include as file metadata (comma-separated)</small>
    </div>

    <div class="config-section-divider"></div>
    <div class="config-section-title">Test Data</div>

    <div class="config-field">
      <label>Upload Test File</label>
      ${testFile ? html`
        <div class="test-file-info">
          <div class="test-file-details">
            <nr-icon name="file" size="small"></nr-icon>
            <div class="test-file-meta">
              <span class="test-file-name">${testFile.filename}</span>
              <span class="test-file-size">${formatFileSize(testFile.size)} • ${testFile.contentType || 'unknown type'}</span>
            </div>
          </div>
          <button
            class="test-file-remove"
            @click=${() => onUpdate('testFile', undefined)}
            title="Remove test file"
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
          tip="Drop file here or click to upload"
          @file-select=${(e: CustomEvent) => handleFileSelect(e, onUpdate)}
        ></nr-file-upload>
      `}
      <small class="field-hint">Upload a file to use as test input when running the workflow</small>
    </div>
  `;
}
