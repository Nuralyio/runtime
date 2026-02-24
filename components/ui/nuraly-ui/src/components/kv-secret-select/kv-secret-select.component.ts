/**
 * @license
 * Copyright 2024 Nuraly
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html, css, nothing } from 'lit';
import { property, customElement, state } from 'lit/decorators.js';

/**
 * Minimal KV entry shape this component needs.
 * Avoids importing from the redux store.
 */
export interface KvSecretEntry {
  keyPath: string;
  value?: any;
  isSecret: boolean;
}

/**
 * KV Secret Select Component
 *
 * A select component for choosing API keys, filtered by provider scope.
 * Includes inline creation of new secrets.
 *
 * Data-in / events-out:
 * - Host provides `entries` and `loading`
 * - Component fires `create-entry` when the user submits the create form
 * - Component fires `value-change` when the selection changes
 *
 * @example
 * ```html
 * <nr-kv-secret-select
 *   provider="openai"
 *   .entries=${secretEntries}
 *   value="openai/my-key"
 *   @value-change=${(e) => console.log(e.detail.value)}
 *   @create-entry=${(e) => handleCreate(e.detail)}
 * ></nr-kv-secret-select>
 * ```
 *
 * @fires value-change - Fired when selection changes
 * @fires create-entry - Fired when user submits the create form. Detail: { keyPath, value, scope, isSecret }
 */
@customElement('nr-kv-secret-select')
export class NrKvSecretSelect extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    .create-form {
      padding: 12px;
      border-top: 1px solid var(--border-color, #e5e7eb);
      background: var(--bg-secondary, #f9fafb);
    }

    .create-form-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .create-form-title {
      font-weight: 600;
      font-size: 13px;
      color: var(--text-primary, #1f2937);
    }

    .form-field {
      margin-bottom: 12px;
    }

    .form-field label {
      display: block;
      font-size: 12px;
      font-weight: 500;
      color: var(--text-secondary, #6b7280);
      margin-bottom: 4px;
    }

    .form-actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }

    .btn {
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }

    .btn-primary {
      background: var(--primary-color, #6366f1);
      color: white;
    }

    .btn-primary:hover {
      background: #4f46e5;
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: var(--bg-secondary, #f3f4f6);
      color: var(--text-primary, #1f2937);
      border: 1px solid var(--border-color, #e5e7eb);
    }

    .btn-secondary:hover {
      background: #e5e7eb;
    }

    .add-btn-container {
      padding: 8px 12px;
      border-top: 1px solid var(--border-color, #e5e7eb);
    }

    .add-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      width: 100%;
      padding: 8px 12px;
      background: transparent;
      border: 1px dashed var(--border-color, #d1d5db);
      border-radius: 6px;
      color: var(--text-secondary, #6b7280);
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .add-btn:hover {
      border-color: var(--primary-color, #6366f1);
      color: var(--primary-color, #6366f1);
      background: #f5f3ff;
    }

    .error-message {
      color: #dc2626;
      font-size: 12px;
      margin-top: 4px;
    }

    .loading {
      padding: 12px;
      text-align: center;
      color: var(--text-secondary, #6b7280);
      font-size: 13px;
    }
  `;

  /** Provider/scope to filter display labels */
  @property({ type: String })
  provider: string = 'openai';

  /** Currently selected key path */
  @property({ type: String })
  value: string = '';

  /** Placeholder text */
  @property({ type: String })
  placeholder: string = 'Select API key...';

  /** Type of secret - affects labels */
  @property({ type: String })
  type: 'api-key' | 'url' = 'api-key';

  /** Entries provided by the host */
  @property({ attribute: false })
  entries: KvSecretEntry[] = [];

  /** Loading state provided by the host */
  @property({ type: Boolean })
  loading = false;

  @state() private showCreateForm = false;
  @state() private newKeyName = '';
  @state() private newKeyValue = '';
  @state() private creating = false;
  @state() private error = '';

  private handleSelectChange(e: CustomEvent): void {
    const value = e.detail?.value || '';
    this.value = value;
    this.dispatchEvent(new CustomEvent('value-change', {
      detail: { value },
      bubbles: true,
      composed: true
    }));
  }

  private toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.resetCreateForm();
    }
  }

  private resetCreateForm(): void {
    this.newKeyName = '';
    this.newKeyValue = '';
    this.error = '';
    this.creating = false;
  }

  private handleCreate(): void {
    if (!this.newKeyName || !this.newKeyValue) return;

    this.creating = true;
    this.error = '';

    const keyPath = `${this.provider}/${this.newKeyName}`;

    this.dispatchEvent(new CustomEvent('create-entry', {
      detail: {
        keyPath,
        value: this.newKeyValue,
        scope: this.provider,
        isSecret: true,
      },
      bubbles: true,
      composed: true
    }));
  }

  /**
   * Called by host after create-entry succeeds to reset the form and select the new entry.
   */
  public notifyCreateSuccess(keyPath: string): void {
    this.value = keyPath;
    this.showCreateForm = false;
    this.resetCreateForm();
    this.dispatchEvent(new CustomEvent('value-change', {
      detail: { value: keyPath },
      bubbles: true,
      composed: true
    }));
  }

  /**
   * Called by host if create-entry fails.
   */
  public notifyCreateError(message: string): void {
    this.error = message;
    this.creating = false;
  }

  private getTypeLabel(): string {
    return this.type === 'url' ? 'URL' : 'API Key';
  }

  private getValuePlaceholder(): string {
    return this.type === 'url' ? 'http://localhost:11434' : 'sk-...';
  }

  private renderCreateForm() {
    const typeLabel = this.getTypeLabel();

    return html`
      <div class="create-form">
        <div class="create-form-header">
          <span class="create-form-title">Add ${this.provider} ${typeLabel}</span>
        </div>

        <div class="form-field">
          <label>${this.type === 'url' ? 'Name' : 'Key Name'}</label>
          <nr-input
            .value=${this.newKeyName}
            placeholder="e.g., production, dev"
            @nr-input=${(e: CustomEvent) => this.newKeyName = e.detail?.value || ''}
          ></nr-input>
        </div>

        <div class="form-field">
          <label>${typeLabel} Value</label>
          <nr-input
            type=${this.type === 'url' ? 'text' : 'password'}
            .value=${this.newKeyValue}
            placeholder=${this.getValuePlaceholder()}
            @nr-input=${(e: CustomEvent) => this.newKeyValue = e.detail?.value || ''}
          ></nr-input>
        </div>

        ${this.error ? html`<div class="error-message">${this.error}</div>` : nothing}

        <div class="form-actions">
          <button
            class="btn btn-primary"
            ?disabled=${!this.newKeyName || !this.newKeyValue || this.creating}
            @click=${this.handleCreate}
          >
            ${this.creating ? 'Creating...' : 'Create'}
          </button>
          <button
            class="btn btn-secondary"
            @click=${this.toggleCreateForm}
          >
            Cancel
          </button>
        </div>
      </div>
    `;
  }

  private renderAddButton() {
    const typeLabel = this.getTypeLabel().toLowerCase();

    return html`
      <div class="add-btn-container">
        <button class="add-btn" @click=${this.toggleCreateForm}>
          <nr-icon name="plus" size="small"></nr-icon>
          Add new ${this.provider} ${typeLabel}
        </button>
      </div>
    `;
  }

  override render() {
    const secretEntries = this.entries.filter(e => e.isSecret);
    const options = secretEntries.map(entry => ({
      label: entry.keyPath.replace(`${this.provider}/`, ''),
      value: entry.keyPath,
      icon: this.type === 'url' ? 'link' : 'key'
    }));

    const typeLabel = this.getTypeLabel().toLowerCase();
    const noOptionsMessage = `No ${typeLabel}s for ${this.provider}`;

    return html`
      <nr-select
        .value=${this.value}
        .options=${options}
        placeholder=${this.placeholder}
        .noOptionsMessage=${noOptionsMessage}
        @nr-change=${this.handleSelectChange}
      >
        <div slot="after-options">
          ${this.loading ? html`<div class="loading">Loading...</div>` : nothing}
          ${this.showCreateForm ? this.renderCreateForm() : this.renderAddButton()}
        </div>
      </nr-select>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'nr-kv-secret-select': NrKvSecretSelect;
  }
}
