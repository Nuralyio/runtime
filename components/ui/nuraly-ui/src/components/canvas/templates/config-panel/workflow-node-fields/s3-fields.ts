/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, nothing, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../../workflow-canvas.types.js';

/**
 * Render AWS S3 node fields
 */
export function renderS3Fields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  const operation = (config.s3Operation as string) || 'upload';

  return html`
    <div class="config-field">
      <label>Operation</label>
      <nr-select
        .value=${operation}
        .options=${[
          { label: 'Upload', value: 'upload' },
          { label: 'Download', value: 'download' },
          { label: 'List Objects', value: 'list' },
          { label: 'Delete', value: 'delete' },
          { label: 'Copy', value: 'copy' },
          { label: 'Get Presigned URL', value: 'presigned_url' },
        ]}
        @nr-change=${(e: CustomEvent) => onUpdate('s3Operation', e.detail.value)}
      ></nr-select>
    </div>

    <div class="config-field">
      <label>AWS Credentials Path</label>
      <nr-input
        value=${config.s3CredentialsPath || ''}
        placeholder="storage/my-aws-credentials"
        @nr-input=${(e: CustomEvent) => onUpdate('s3CredentialsPath', e.detail.value)}
      ></nr-input>
      <small class="field-hint">KV store path containing AWS Access Key ID and Secret Access Key</small>
    </div>

    <div class="config-field">
      <label>Bucket</label>
      <nr-input
        value=${config.s3Bucket || ''}
        placeholder="my-bucket"
        @nr-input=${(e: CustomEvent) => onUpdate('s3Bucket', e.detail.value)}
      ></nr-input>
    </div>

    ${operation === 'list' ? html`
      <div class="config-field">
        <label>Prefix</label>
        <nr-input
          value=${config.s3Key || ''}
          placeholder="uploads/"
          @nr-input=${(e: CustomEvent) => onUpdate('s3Key', e.detail.value)}
        ></nr-input>
        <small class="field-hint">Filter objects by prefix (optional)</small>
      </div>
    ` : html`
      <div class="config-field">
        <label>Object Key</label>
        <nr-input
          value=${config.s3Key || ''}
          placeholder="path/to/file.pdf"
          @nr-input=${(e: CustomEvent) => onUpdate('s3Key', e.detail.value)}
        ></nr-input>
        <small class="field-hint">S3 object key (path within bucket)</small>
      </div>
    `}

    <div class="config-field">
      <label>Region</label>
      <nr-input
        value=${config.s3Region || 'us-east-1'}
        placeholder="us-east-1"
        @nr-input=${(e: CustomEvent) => onUpdate('s3Region', e.detail.value)}
      ></nr-input>
    </div>

    ${operation === 'upload' ? html`
      <div class="config-field">
        <label>Content Type</label>
        <nr-input
          value=${config.s3ContentType || 'auto'}
          placeholder="auto"
          @nr-input=${(e: CustomEvent) => onUpdate('s3ContentType', e.detail.value)}
        ></nr-input>
        <small class="field-hint">MIME type (use "auto" for auto-detection)</small>
      </div>

      <div class="config-field">
        <label>ACL</label>
        <nr-select
          .value=${config.s3Acl || 'private'}
          .options=${[
            { label: 'Private', value: 'private' },
            { label: 'Public Read', value: 'public-read' },
            { label: 'Public Read/Write', value: 'public-read-write' },
            { label: 'Authenticated Read', value: 'authenticated-read' },
          ]}
          @nr-change=${(e: CustomEvent) => onUpdate('s3Acl', e.detail.value)}
        ></nr-select>
      </div>
    ` : nothing}

    ${operation === 'presigned_url' ? html`
      <div class="config-field">
        <label>URL Expiry (seconds)</label>
        <nr-input
          type="number"
          value=${config.s3PresignedExpiry || 3600}
          placeholder="3600"
          @nr-input=${(e: CustomEvent) => onUpdate('s3PresignedExpiry', Number.parseInt(e.detail.value) || 3600)}
        ></nr-input>
        <small class="field-hint">How long the presigned URL remains valid</small>
      </div>
    ` : nothing}

    ${operation === 'copy' ? html`
      <div class="config-field">
        <label>Destination Bucket</label>
        <nr-input
          value=${config.s3CopyDestBucket || ''}
          placeholder="destination-bucket"
          @nr-input=${(e: CustomEvent) => onUpdate('s3CopyDestBucket', e.detail.value)}
        ></nr-input>
      </div>

      <div class="config-field">
        <label>Destination Key</label>
        <nr-input
          value=${config.s3CopyDestKey || ''}
          placeholder="path/to/destination.pdf"
          @nr-input=${(e: CustomEvent) => onUpdate('s3CopyDestKey', e.detail.value)}
        ></nr-input>
      </div>
    ` : nothing}
  `;
}
