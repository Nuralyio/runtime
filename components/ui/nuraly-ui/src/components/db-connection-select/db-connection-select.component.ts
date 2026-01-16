/**
 * @license
 * Copyright 2024 Nuraly
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html, css, nothing } from 'lit';
import { property, customElement, state } from 'lit/decorators.js';
import { getKvEntries, setKvEntry, type KvEntry } from '../../../../../../redux/store/kv.js';
import { getVarValue } from '../../../../../../redux/store/context.js';
import { testConnection } from '../../../../../../redux/store/database.js';
import type { DatabaseType } from '../canvas/data-node/data-node.types.js';

/**
 * Database Connection Select Component
 *
 * A select component for choosing database connections from KV store, filtered by database type.
 * Includes inline creation of new connections with connection testing.
 *
 * @example
 * ```html
 * <nr-db-connection-select
 *   dbType="postgresql"
 *   value="postgresql/my-db"
 *   @value-change=${(e) => console.log(e.detail.value)}
 * ></nr-db-connection-select>
 * ```
 *
 * @fires value-change - Fired when selection changes
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

  @state() private entries: KvEntry[] = [];
  @state() private loading = false;
  @state() private showCreateForm = false;
  @state() private creating = false;
  @state() private testing = false;
  @state() private error = '';
  @state() private testResult: { success: boolean; message: string } | null = null;

  // New connection form fields
  @state() private newConnectionName = '';
  @state() private newHost = 'localhost';
  @state() private newPort = 5432;
  @state() private newDatabase = '';
  @state() private newUsername = '';
  @state() private newPassword = '';
  @state() private newSsl = false;

  private getAppId(): string | null {
    const app = getVarValue('global', 'currentEditingApplication') as any;
    return app?.uuid || null;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.loadEntries();
    this.updateDefaultPort();
  }

  override updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has('dbType')) {
      this.loadEntries();
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

  private async loadEntries(): Promise<void> {
    const appId = this.getAppId();
    if (!appId || !this.dbType) return;

    this.loading = true;
    try {
      const entries = await getKvEntries(appId, { scope: this.dbType });
      this.entries = (entries || []).filter(e => e.isSecret);
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
    this.newConnectionName = '';
    this.newHost = 'localhost';
    this.updateDefaultPort();
    this.newDatabase = '';
    this.newUsername = '';
    this.newPassword = '';
    this.newSsl = false;
    this.error = '';
    this.testResult = null;
  }

  private async handleTestConnection(): Promise<void> {
    this.testing = true;
    this.testResult = null;
    this.error = '';

    try {
      const result = await testConnection({
        type: this.dbType,
        host: this.newHost,
        port: this.newPort,
        database: this.newDatabase,
        username: this.newUsername,
        password: this.newPassword,
        ssl: this.newSsl,
      });

      if (result.success) {
        this.testResult = {
          success: true,
          message: `Connected successfully! ${result.databaseVersion || ''}`
        };
      } else {
        this.testResult = {
          success: false,
          message: result.error || 'Connection failed'
        };
      }
    } catch (err: any) {
      this.testResult = {
        success: false,
        message: err.message || 'Connection test failed'
      };
    }

    this.testing = false;
  }

  private async handleCreate(): Promise<void> {
    const appId = this.getAppId();
    if (!appId || !this.newConnectionName || !this.newHost || !this.newDatabase) return;

    this.creating = true;
    this.error = '';

    try {
      const keyPath = `${this.dbType}/${this.newConnectionName}`;
      const credentialValue = {
        type: this.dbType,
        host: this.newHost,
        port: this.newPort,
        database: this.newDatabase,
        username: this.newUsername,
        password: this.newPassword,
        ssl: this.newSsl,
      };

      const result = await setKvEntry(keyPath, {
        applicationId: appId,
        scope: this.dbType,
        value: JSON.stringify(credentialValue),
        isSecret: true
      });

      if (result) {
        // Refresh entries
        await this.loadEntries();
        // Select the new connection
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
        this.error = 'Failed to create connection';
      }
    } catch (err: any) {
      this.error = err.message || 'Failed to create connection';
    }

    this.creating = false;
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

  override render() {
    const options = this.entries.map(entry => ({
      label: entry.keyPath.replace(`${this.dbType}/`, ''),
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
