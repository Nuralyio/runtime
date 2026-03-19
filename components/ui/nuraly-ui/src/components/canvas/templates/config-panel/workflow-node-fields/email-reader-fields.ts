/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../../workflow-canvas.types.js';

/**
 * Render Email Reader node fields
 */
export function renderEmailReaderFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  const provider = (config as any).provider || 'imap';
  const operation = (config as any).operation || 'LIST';
  const showImapSettings = provider === 'imap';
  const showSearchQuery = operation === 'SEARCH';
  const showMessageId = ['READ', 'MARK_READ', 'MARK_UNREAD', 'MOVE', 'DELETE'].includes(operation);
  const showTargetFolder = operation === 'MOVE';
  const showLimit = ['LIST', 'SEARCH'].includes(operation);

  return html`
    <!-- Provider Section -->
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Connection</span>
        <span class="config-section-desc">Email provider and authentication</span>
      </div>
      <div class="config-field">
        <label>Provider</label>
        <nr-select
          .value=${provider}
          .options=${[
            { label: 'IMAP (Generic)', value: 'imap' },
            { label: 'Gmail', value: 'gmail' },
          ]}
          @nr-change=${(e: CustomEvent) => onUpdate('provider', e.detail.value)}
        ></nr-select>
        <span class="field-description">${provider === 'gmail'
          ? 'Requires OAuth2 token in KV: email_reader/gmail/oauth_token'
          : 'Requires credentials in KV: email_reader/imap/username, email_reader/imap/password'}</span>
      </div>

      ${showImapSettings ? html`
        <div class="config-field">
          <label>Host</label>
          <nr-input
            value=${(config as any).host || ''}
            placeholder="imap.example.com"
            @nr-input=${(e: CustomEvent) => onUpdate('host', e.detail.value)}
          ></nr-input>
        </div>
        <div class="config-field">
          <label>Port</label>
          <nr-input
            type="number"
            value=${(config as any).port || 993}
            placeholder="993"
            @nr-input=${(e: CustomEvent) => onUpdate('port', Number.parseInt(e.detail.value) || 993)}
          ></nr-input>
        </div>
        <div class="config-field">
          <label>TLS</label>
          <nr-checkbox
            ?checked=${(config as any).tls !== false}
            @nr-change=${(e: CustomEvent) => onUpdate('tls', e.detail.checked)}
          ></nr-checkbox>
          <span class="field-description">Use SSL/TLS encryption</span>
        </div>
      ` : ''}
    </div>

    <!-- Operation Section -->
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Operation</span>
      </div>
      <div class="config-field">
        <label>Action</label>
        <nr-select
          .value=${operation}
          .options=${[
            { label: 'List Emails', value: 'LIST' },
            { label: 'Read Email', value: 'READ' },
            { label: 'Search Emails', value: 'SEARCH' },
            { label: 'Mark as Read', value: 'MARK_READ' },
            { label: 'Mark as Unread', value: 'MARK_UNREAD' },
            { label: 'Move Email', value: 'MOVE' },
            { label: 'Delete Email', value: 'DELETE' },
          ]}
          @nr-change=${(e: CustomEvent) => onUpdate('operation', e.detail.value)}
        ></nr-select>
      </div>
      <div class="config-field">
        <label>Folder</label>
        <nr-input
          value=${(config as any).folder || 'INBOX'}
          placeholder="INBOX"
          @nr-input=${(e: CustomEvent) => onUpdate('folder', e.detail.value)}
        ></nr-input>
        <span class="field-description">INBOX, SENT, DRAFTS, TRASH, or custom folder</span>
      </div>

      ${showSearchQuery ? html`
        <div class="config-field">
          <label>Search Query</label>
          <nr-input
            value=${(config as any).searchQuery || ''}
            placeholder="subject:invoice or from:sender@example.com"
            @nr-input=${(e: CustomEvent) => onUpdate('searchQuery', e.detail.value)}
          ></nr-input>
          <span class="field-description">Prefix with subject: or from: for targeted search</span>
        </div>
      ` : ''}

      ${showMessageId ? html`
        <div class="config-field">
          <label>Message ID</label>
          <nr-input
            type="number"
            value=${(config as any).messageId || ''}
            placeholder="Message number"
            @nr-input=${(e: CustomEvent) => onUpdate('messageId', Number.parseInt(e.detail.value) || 0)}
          ></nr-input>
          <span class="field-description">Message number in the folder</span>
        </div>
      ` : ''}

      ${showTargetFolder ? html`
        <div class="config-field">
          <label>Target Folder</label>
          <nr-input
            value=${(config as any).targetFolder || ''}
            placeholder="Archive"
            @nr-input=${(e: CustomEvent) => onUpdate('targetFolder', e.detail.value)}
          ></nr-input>
          <span class="field-description">Folder to move the email to</span>
        </div>
      ` : ''}

      ${showLimit ? html`
        <div class="config-field">
          <label>Limit</label>
          <nr-input
            type="number"
            value=${(config as any).limit || 10}
            placeholder="10"
            @nr-input=${(e: CustomEvent) => onUpdate('limit', Number.parseInt(e.detail.value) || 10)}
          ></nr-input>
          <span class="field-description">Maximum number of messages to return</span>
        </div>
      ` : ''}
    </div>

    <!-- Options Section -->
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Options</span>
      </div>
      <div class="config-field">
        <label>Include Attachments</label>
        <nr-checkbox
          ?checked=${(config as any).includeAttachments || false}
          @nr-change=${(e: CustomEvent) => onUpdate('includeAttachments', e.detail.checked)}
        ></nr-checkbox>
        <span class="field-description">Download and include attachment content (base64 encoded)</span>
      </div>
    </div>
  `;
}
