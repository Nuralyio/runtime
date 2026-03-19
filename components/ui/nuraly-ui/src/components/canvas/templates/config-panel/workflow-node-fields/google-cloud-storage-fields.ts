/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../../workflow-canvas.types.js';

/**
 * Render Google Cloud Storage node fields
 */
export function renderGoogleCloudStorageFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  const operation = config.operation || 'LIST';
  const showObjectPath = ['UPLOAD', 'DOWNLOAD', 'DELETE', 'COPY', 'GET_SIGNED_URL'].includes(operation);
  const showCopyFields = operation === 'COPY';
  const showSignedUrlFields = operation === 'GET_SIGNED_URL';
  const showUploadFields = operation === 'UPLOAD';
  const showListFields = operation === 'LIST';

  return html`
    <div class="config-field">
      <label>Operation</label>
      <nr-select
        .value=${operation}
        .options=${[
          { label: 'List Objects', value: 'LIST' },
          { label: 'Upload', value: 'UPLOAD' },
          { label: 'Download', value: 'DOWNLOAD' },
          { label: 'Delete', value: 'DELETE' },
          { label: 'Copy', value: 'COPY' },
          { label: 'Get Signed URL', value: 'GET_SIGNED_URL' },
        ]}
        @nr-change=${(e: CustomEvent) => onUpdate('operation', e.detail.value)}
      ></nr-select>
    </div>

    <div class="config-field">
      <label>Service Account Path</label>
      <nr-input
        value=${config.serviceAccountPath || ''}
        placeholder="gcs/my-service-account"
        @nr-input=${(e: CustomEvent) => onUpdate('serviceAccountPath', e.detail.value)}
      ></nr-input>
      <small class="field-hint">KV store path containing GCP service account JSON key</small>
    </div>

    <div class="config-field">
      <label>Bucket Name</label>
      <nr-input
        value=${config.bucketName || ''}
        placeholder="my-bucket"
        @nr-input=${(e: CustomEvent) => onUpdate('bucketName', e.detail.value)}
      ></nr-input>
    </div>

    ${showObjectPath ? html`
      <div class="config-field">
        <label>Object Path</label>
        <nr-input
          value=${config.objectPath || ''}
          placeholder="path/to/object"
          @nr-input=${(e: CustomEvent) => onUpdate('objectPath', e.detail.value)}
        ></nr-input>
        <small class="field-hint">Path/key of the object in the bucket</small>
      </div>
    ` : ''}

    ${showListFields ? html`
      <div class="config-field">
        <label>Prefix (Optional)</label>
        <nr-input
          value=${config.prefix || ''}
          placeholder="folder/"
          @nr-input=${(e: CustomEvent) => onUpdate('prefix', e.detail.value)}
        ></nr-input>
        <small class="field-hint">Filter objects by prefix</small>
      </div>
    ` : ''}

    ${showUploadFields ? html`
      <div class="config-field">
        <label>Content Type (Optional)</label>
        <nr-input
          value=${config.contentType || ''}
          placeholder="application/octet-stream"
          @nr-input=${(e: CustomEvent) => onUpdate('contentType', e.detail.value)}
        ></nr-input>
        <small class="field-hint">MIME type for uploaded files (auto-detected from input if empty)</small>
      </div>
    ` : ''}

    ${showCopyFields ? html`
      <div class="config-field">
        <label>Destination Bucket</label>
        <nr-input
          value=${config.destinationBucket || ''}
          placeholder="other-bucket"
          @nr-input=${(e: CustomEvent) => onUpdate('destinationBucket', e.detail.value)}
        ></nr-input>
        <small class="field-hint">Target bucket (defaults to source bucket if empty)</small>
      </div>

      <div class="config-field">
        <label>Destination Path</label>
        <nr-input
          value=${config.destinationPath || ''}
          placeholder="path/to/destination"
          @nr-input=${(e: CustomEvent) => onUpdate('destinationPath', e.detail.value)}
        ></nr-input>
      </div>
    ` : ''}

    ${showSignedUrlFields ? html`
      <div class="config-field">
        <label>Signed URL Expiration (seconds)</label>
        <nr-input
          type="number"
          value=${config.signedUrlExpiration || 3600}
          placeholder="3600"
          @nr-input=${(e: CustomEvent) => onUpdate('signedUrlExpiration', Number.parseInt(e.detail.value) || 3600)}
        ></nr-input>
        <small class="field-hint">How long the signed URL remains valid</small>
      </div>
    ` : ''}
  `;
}
