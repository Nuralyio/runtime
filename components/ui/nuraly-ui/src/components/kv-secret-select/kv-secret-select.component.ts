/**
 * @license
 * Copyright 2024 Nuraly
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html, css, nothing } from 'lit';
import { property, customElement, state } from 'lit/decorators.js';
import { getKvEntries, setKvEntry, type KvEntry } from '../../../../../../redux/store/kv.js';
import { getVarValue } from '../../../../../../redux/store/context.js';

/**
 * KV Secret Select Component
 *
 * A select component for choosing API keys from KV store, filtered by provider scope.
 * Includes inline creation of new secrets.
 *
 * @example
 * ```html
 * <nr-kv-secret-select
 *   provider="openai"
 *   value="openai/my-key"
 *   @value-change=${(e) => console.log(e.detail.value)}
 * ></nr-kv-secret-select>
 * ```
 *
 * @fires value-change - Fired when selection changes
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

  /** Provider/scope to filter KV entries by */
  @property({ type: String })
  provider: string = 'openai';

  /** Currently selected key path */
  @property({ type: String })
  value: string = '';

  /** Placeholder text */
  @property({ type: String })
  placeholder: string = 'Select API key...';

  @state() private entries: KvEntry[] = [];
  @state() private loading = false;
  @state() private showCreateForm = false;
  @state() private newKeyName = '';
  @state() private newKeyValue = '';
  @state() private creating = false;
  @state() private error = '';

  private getAppId(): string | null {
    const app = getVarValue('global', 'currentEditingApplication') as any;
    return app?.uuid || null;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.loadEntries();
  }

  override updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has('provider')) {
      this.loadEntries();
    }
  }

  private async loadEntries(): Promise<void> {
    const appId = this.getAppId();
    if (!appId || !this.provider) return;

    const savedValue = this.value;
    this.loading = true;
    try {
      const entries = await getKvEntries(appId, { scope: this.provider });
      this.entries = (entries || []).filter(e => e.isSecret);

      // If we have a saved value and entries loaded, force nr-select to reinitialize
      // by temporarily clearing and restoring the value
      if (savedValue && this.entries.length > 0) {
        await this.updateComplete;
        // This triggers nr-select to see value as changed and reinitialize
        this.value = '';
        await this.updateComplete;
        this.value = savedValue;
      }
    } catch (err) {
      console.error('Failed to load KV entries:', err);
      this.entries = [];
    }
    this.loading = false;
  }

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
  }

  private async handleCreate(): Promise<void> {
    const appId = this.getAppId();
    if (!appId || !this.newKeyName || !this.newKeyValue) return;

    this.creating = true;
    this.error = '';

    try {
      const keyPath = `${this.provider}/${this.newKeyName}`;
      const result = await setKvEntry(keyPath, {
        applicationId: appId,
        scope: this.provider,
        value: this.newKeyValue,
        isSecret: true
      });

      if (result) {
        // Refresh entries
        await this.loadEntries();
        // Select the new key
        this.value = keyPath;
        this.dispatchEvent(new CustomEvent('value-change', {
          detail: { value: keyPath },
          bubbles: true,
          composed: true
        }));
        // Close form
        this.showCreateForm = false;
        this.resetCreateForm();
      } else {
        this.error = 'Failed to create API key';
      }
    } catch (err: any) {
      this.error = err.message || 'Failed to create API key';
    }

    this.creating = false;
  }

  private renderCreateForm() {
    return html`
      <div class="create-form">
        <div class="create-form-header">
          <span class="create-form-title">Add ${this.provider} API Key</span>
        </div>

        <div class="form-field">
          <label>Key Name</label>
          <nr-input
            .value=${this.newKeyName}
            placeholder="e.g., production, dev"
            @nr-input=${(e: CustomEvent) => this.newKeyName = e.detail?.value || ''}
          ></nr-input>
        </div>

        <div class="form-field">
          <label>API Key Value</label>
          <nr-input
            type="password"
            .value=${this.newKeyValue}
            placeholder="sk-..."
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
    return html`
      <div class="add-btn-container">
        <button class="add-btn" @click=${this.toggleCreateForm}>
          <nr-icon name="plus" size="small"></nr-icon>
          Add new ${this.provider} API key
        </button>
      </div>
    `;
  }

  override render() {
    const options = this.entries.map(entry => ({
      label: entry.keyPath.replace(`${this.provider}/`, ''),
      value: entry.keyPath,
      icon: 'key'
    }));

    return html`
      <nr-select
        .value=${this.value}
        .options=${options}
        placeholder=${this.placeholder}
        .noOptionsMessage=${'No API keys for ${this.provider}'}
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
