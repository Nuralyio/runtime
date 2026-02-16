/**
 * @license
 * Copyright 2024 Nuraly
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html, css, nothing } from 'lit';
import { property, customElement, state } from 'lit/decorators.js';
import type { DatabaseType } from '../canvas/data-node/data-node.types.js';

/**
 * Minimal KV entry shape this component needs.
 */
export interface KvConnectionEntry {
  keyPath: string;
  value?: any;
  isSecret: boolean;
}

/**
 * Database Connection Select Component
 *
 * A select component for choosing database connections.
 * Includes inline creation of new connections with connection testing.
 *
 * Data-in / events-out:
 * - Host provides `entries`, `loading`, and `testResult`
 * - Component fires `create-entry` when the user submits the create form
 * - Component fires `test-connection` when the user clicks test
 * - Component fires `value-change` when the selection changes
 *
 * @example
 * ```html
 * <nr-db-connection-select
 *   dbType="postgresql"
 *   .entries=${connectionEntries}
 *   value="postgresql/my-db"
 *   @value-change=${(e) => console.log(e.detail.value)}
 *   @create-entry=${(e) => handleCreate(e.detail)}
 *   @test-connection=${(e) => handleTest(e.detail)}
 * ></nr-db-connection-select>
 * ```
 *
 * @fires value-change - Fired when selection changes
 * @fires create-entry - Fired when user submits the create form
 * @fires test-connection - Fired when user clicks Test Connection
 */
@customElement('nr-db-connection-select')
export class NrDbConnectionSelect extends LitElement {
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

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .form-field {
      margin-bottom: 12px;
    }

    .form-field.full-width {
      grid-column: span 2;
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

    .btn-test {
      background: var(--bg-tertiary, #f3f4f6);
      color: var(--text-secondary, #6b7280);
      border: 1px solid var(--border-color, #e5e7eb);
    }

    .btn-test:hover {
      border-color: var(--primary-color, #6366f1);
      color: var(--primary-color, #6366f1);
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

    .success-message {
      color: #16a34a;
      font-size: 12px;
      margin-top: 4px;
    }

    .loading {
      padding: 12px;
      text-align: center;
      color: var(--text-secondary, #6b7280);
      font-size: 13px;
    }

    .test-result {
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      margin-top: 8px;
    }

    .test-result.success {
      background: #dcfce7;
      color: #166534;
    }

    .test-result.error {
      background: #fef2f2;
      color: #991b1b;
    }

    .checkbox-field {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .checkbox-field input {
      width: 16px;
      height: 16px;
    }

    .checkbox-field label {
      margin-bottom: 0;
    }
  `;

  /** Database type/scope to filter KV entries by */
  @property({ type: String })
  dbType: DatabaseType = 'postgresql';

  /** Currently selected connection path */
  @property({ type: String })
  value: string = '';

  /** Placeholder text */
  @property({ type: String })
  placeholder: string = 'Select database connection...';

  /** Entries provided by the host */
  @property({ attribute: false })
  entries: KvConnectionEntry[] = [];

  /** Loading state provided by the host */
  @property({ type: Boolean })
  loading = false;

  /** Test result pushed by the host */
  @property({ attribute: false })
  testResult: { success: boolean; message: string } | null = null;

  @state() private showCreateForm = false;
  @state() private creating = false;
  @state() private testing = false;
  @state() private error = '';

  // New connection form fields
  @state() private newConnectionName = '';
  @state() private newHost = 'localhost';
  @state() private newPort = 5432;
  @state() private newDatabase = '';
  @state() private newUsername = '';
  @state() private newPassword = '';
  @state() private newSsl = false;

  override connectedCallback(): void {
    super.connectedCallback();
    this.updateDefaultPort();
  }

  override updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has('dbType')) {
      this.updateDefaultPort();
    }
  }

  private updateDefaultPort(): void {
    const defaultPorts: Record<string, number> = {
      postgresql: 5432,
      mysql: 3306,
      mongodb: 27017,
      mssql: 1433,
      oracle: 1521,
      sqlite: 0,
    };
    this.newPort = defaultPorts[this.dbType] || 5432;
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
    this.newConnectionName = '';
    this.newHost = 'localhost';
    this.updateDefaultPort();
    this.newDatabase = '';
    this.newUsername = '';
    this.newPassword = '';
    this.newSsl = false;
    this.error = '';
    this.testing = false;
    this.creating = false;
  }

  private handleTestConnection(): void {
    this.testing = true;

    this.dispatchEvent(new CustomEvent('test-connection', {
      detail: {
        type: this.dbType,
        host: this.newHost,
        port: this.newPort,
        database: this.newDatabase,
        username: this.newUsername,
        password: this.newPassword,
        ssl: this.newSsl,
      },
      bubbles: true,
      composed: true
    }));
  }

  /**
   * Called by host after test-connection completes.
   */
  public notifyTestResult(result: { success: boolean; message: string }): void {
    this.testResult = result;
    this.testing = false;
  }

  private handleCreate(): void {
    if (!this.newConnectionName || !this.newHost || !this.newDatabase) return;

    this.creating = true;
    this.error = '';

    const keyPath = `database/${this.newConnectionName}`;
    const credentialValue = {
      type: this.dbType,
      host: this.newHost,
      port: this.newPort,
      database: this.newDatabase,
      username: this.newUsername,
      password: this.newPassword,
      ssl: this.newSsl,
    };

    this.dispatchEvent(new CustomEvent('create-entry', {
      detail: {
        keyPath,
        value: JSON.stringify(credentialValue),
        scope: this.dbType,
        isSecret: true,
      },
      bubbles: true,
      composed: true
    }));
  }

  /**
   * Called by host after create-entry succeeds.
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

  private getDbTypeLabel(): string {
    const labels: Record<string, string> = {
      postgresql: 'PostgreSQL',
      mysql: 'MySQL',
      mongodb: 'MongoDB',
      mssql: 'SQL Server',
      oracle: 'Oracle',
      sqlite: 'SQLite',
    };
    return labels[this.dbType] || this.dbType;
  }

  private renderCreateForm() {
    const canCreate = this.newConnectionName && this.newHost && this.newDatabase && this.newUsername;

    return html`
      <div class="create-form">
        <div class="create-form-header">
          <span class="create-form-title">Add ${this.getDbTypeLabel()} Connection</span>
        </div>

        <div class="form-field">
          <label>Connection Name</label>
          <nr-input
            .value=${this.newConnectionName}
            placeholder="e.g., production, dev"
            @nr-input=${(e: CustomEvent) => this.newConnectionName = e.detail?.value || ''}
          ></nr-input>
        </div>

        <div class="form-row">
          <div class="form-field">
            <label>Host</label>
            <nr-input
              .value=${this.newHost}
              placeholder="localhost"
              @nr-input=${(e: CustomEvent) => this.newHost = e.detail?.value || ''}
            ></nr-input>
          </div>

          <div class="form-field">
            <label>Port</label>
            <nr-input
              type="number"
              .value=${String(this.newPort)}
              placeholder="${this.newPort}"
              @nr-input=${(e: CustomEvent) => this.newPort = parseInt(e.detail?.value) || this.newPort}
            ></nr-input>
          </div>
        </div>

        <div class="form-field">
          <label>Database</label>
          <nr-input
            .value=${this.newDatabase}
            placeholder="database name"
            @nr-input=${(e: CustomEvent) => this.newDatabase = e.detail?.value || ''}
          ></nr-input>
        </div>

        <div class="form-row">
          <div class="form-field">
            <label>Username</label>
            <nr-input
              .value=${this.newUsername}
              placeholder="username"
              @nr-input=${(e: CustomEvent) => this.newUsername = e.detail?.value || ''}
            ></nr-input>
          </div>

          <div class="form-field">
            <label>Password</label>
            <nr-input
              type="password"
              .value=${this.newPassword}
              placeholder="password"
              @nr-input=${(e: CustomEvent) => this.newPassword = e.detail?.value || ''}
            ></nr-input>
          </div>
        </div>

        <div class="form-field">
          <div class="checkbox-field">
            <input
              type="checkbox"
              id="ssl-checkbox"
              .checked=${this.newSsl}
              @change=${(e: Event) => this.newSsl = (e.target as HTMLInputElement).checked}
            />
            <label for="ssl-checkbox">Use SSL</label>
          </div>
        </div>

        ${this.testResult ? html`
          <div class="test-result ${this.testResult.success ? 'success' : 'error'}">
            ${this.testResult.message}
          </div>
        ` : nothing}

        ${this.error ? html`<div class="error-message">${this.error}</div>` : nothing}

        <div class="form-actions">
          <button
            class="btn btn-test"
            ?disabled=${!canCreate || this.testing}
            @click=${this.handleTestConnection}
          >
            ${this.testing ? 'Testing...' : 'Test Connection'}
          </button>
          <button
            class="btn btn-primary"
            ?disabled=${!canCreate || this.creating}
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
          Add new ${this.getDbTypeLabel()} connection
        </button>
      </div>
    `;
  }

  override render() {
    const secretEntries = this.entries.filter(e => e.isSecret);
    const options = secretEntries.map(entry => ({
      label: entry.keyPath.replace('database/', ''),
      value: entry.keyPath,
      icon: 'database'
    }));

    return html`
      <nr-select
        .value=${this.value}
        .options=${options}
        placeholder=${this.placeholder}
        .noOptionsMessage=${'No connections for ${this.getDbTypeLabel()}'}
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
    'nr-db-connection-select': NrDbConnectionSelect;
  }
}
