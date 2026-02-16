/**
 * Database Connection Dialog Component
 * Modal form for creating and editing database connections.
 */

import { html, LitElement, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { testConnection } from '../../../runtime/redux/store/database';
import { setEntry } from '../../../../services/kv/kv.service';
import type { ApplicationWithStatus } from '../../services/dashboard.service';

import '../../../runtime/components/ui/nuraly-ui/src/components/modal';
import '../../../runtime/components/ui/nuraly-ui/src/components/input';
import '../../../runtime/components/ui/nuraly-ui/src/components/select';
import '../../../runtime/components/ui/nuraly-ui/src/components/button';

interface ConnectionData {
  keyPath: string;
  applicationId: string;
  name: string;
  type: string;
  value: any;
}

const DB_TYPE_OPTIONS = [
  { label: 'PostgreSQL', value: 'postgresql' },
  { label: 'MySQL', value: 'mysql' },
  { label: 'MongoDB', value: 'mongodb' },
  { label: 'SQL Server', value: 'mssql' },
  { label: 'Oracle', value: 'oracle' },
  { label: 'SQLite', value: 'sqlite' },
];

const DEFAULT_PORTS: Record<string, number> = {
  postgresql: 5432,
  mysql: 3306,
  mongodb: 27017,
  mssql: 1433,
  oracle: 1521,
  sqlite: 0,
};

@customElement('database-connection-dialog')
export class DatabaseConnectionDialog extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .dialog-body {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .form-field label {
      font-size: 12px;
      font-weight: 500;
      color: var(--nuraly-color-text-secondary, #5c5c7a);
    }

    .form-field label .required {
      color: #dc2626;
    }

    .checkbox-field {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .checkbox-field input[type="checkbox"] {
      width: 16px;
      height: 16px;
      cursor: pointer;
    }

    .checkbox-field label {
      font-size: 13px;
      color: var(--nuraly-color-text, #0f0f3c);
      cursor: pointer;
      margin: 0;
    }

    .dialog-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 20px;
      border-top: 1px solid var(--nuraly-color-border, #e8e8f0);
    }

    .footer-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .footer-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .test-result {
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
    }

    .test-result.success {
      background: #dcfce7;
      color: #166534;
    }

    .test-result.error {
      background: #fef2f2;
      color: #991b1b;
    }

    .error-message {
      color: #dc2626;
      font-size: 12px;
    }

    .field-error {
      color: #dc2626;
      font-size: 11px;
    }
  `;

  @property({ type: Boolean }) open = false;
  @property({ attribute: false }) connection: ConnectionData | null = null;
  @property({ attribute: false }) applications: ApplicationWithStatus[] = [];

  @state() private applicationId = '';
  @state() private dbType = 'postgresql';
  @state() private connectionName = '';
  @state() private host = 'localhost';
  @state() private port = 5432;
  @state() private database = '';
  @state() private username = '';
  @state() private password = '';
  @state() private ssl = false;

  @state() private saving = false;
  @state() private testing = false;
  @state() private testResult: { success: boolean; message: string } | null = null;
  @state() private error = '';

  private get isEdit(): boolean {
    return this.connection !== null;
  }

  private get canSave(): boolean {
    return !!(this.applicationId && this.connectionName && this.host && this.database && this.username);
  }

  override updated(changed: Map<string, unknown>) {
    if (changed.has('open') && this.open) {
      this.populateForm();
    }
  }

  private populateForm() {
    this.error = '';
    this.testResult = null;
    this.saving = false;
    this.testing = false;

    if (this.connection) {
      const val = typeof this.connection.value === 'object' ? this.connection.value : {};
      this.applicationId = this.connection.applicationId || '';
      this.dbType = val.type || this.connection.type || 'postgresql';
      this.connectionName = this.connection.name || '';
      this.host = val.host || 'localhost';
      this.port = val.port || DEFAULT_PORTS[this.dbType] || 5432;
      this.database = val.database || '';
      this.username = val.username || '';
      this.password = val.password || '';
      this.ssl = val.ssl || false;
    } else {
      this.applicationId = this.applications.length === 1 ? this.applications[0].uuid : '';
      this.dbType = 'postgresql';
      this.connectionName = '';
      this.host = 'localhost';
      this.port = 5432;
      this.database = '';
      this.username = '';
      this.password = '';
      this.ssl = false;
    }
  }

  private handleDbTypeChange(value: string) {
    this.dbType = value;
    this.port = DEFAULT_PORTS[value] || 5432;
  }

  private handleClose() {
    this.dispatchEvent(new CustomEvent('modal-close', { bubbles: true, composed: true }));
  }

  private async handleTest() {
    this.testing = true;
    this.testResult = null;

    const result = await testConnection({
      type: this.dbType,
      host: this.host,
      port: this.port,
      database: this.database,
      username: this.username,
      password: this.password,
      ssl: this.ssl,
    });

    this.testResult = {
      success: result.success,
      message: result.success
        ? `Connected successfully${result.latencyMs ? ` (${result.latencyMs}ms)` : ''}`
        : (result.error || 'Connection failed'),
    };
    this.testing = false;
  }

  private async handleSave() {
    if (!this.canSave) return;

    this.saving = true;
    this.error = '';

    const keyPath = this.isEdit ? this.connection!.keyPath : `database/${this.connectionName}`;
    const credentialValue = {
      type: this.dbType,
      host: this.host,
      port: this.port,
      database: this.database,
      username: this.username,
      password: this.password,
      ssl: this.ssl,
    };

    const result = await setEntry(keyPath, {
      applicationId: this.applicationId,
      value: JSON.stringify(credentialValue),
      isSecret: true,
    });

    if (result) {
      this.dispatchEvent(new CustomEvent('connection-saved', {
        detail: { keyPath, connection: credentialValue },
        bubbles: true,
        composed: true,
      }));
    } else {
      this.error = 'Failed to save connection. Please try again.';
    }

    this.saving = false;
  }

  render() {
    if (!this.open) return nothing;

    const title = this.isEdit ? 'Edit Connection' : 'New Connection';
    const appOptions = this.applications.map(a => ({ label: a.name, value: a.uuid }));

    return html`
      <nr-modal
        .open=${this.open}
        title=${title}
        @modal-close=${this.handleClose}
      >
        <div class="dialog-body">
          <div class="form-field">
            <label>Application <span class="required">*</span></label>
            <nr-select
              .value=${this.applicationId}
              .options=${appOptions}
              placeholder="Select application..."
              @nr-change=${(e: CustomEvent) => this.applicationId = e.detail.value}
            ></nr-select>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label>Database Type <span class="required">*</span></label>
              <nr-select
                .value=${this.dbType}
                .options=${DB_TYPE_OPTIONS}
                placeholder="Select type..."
                @nr-change=${(e: CustomEvent) => this.handleDbTypeChange(e.detail.value)}
              ></nr-select>
            </div>
            <div class="form-field">
              <label>Connection Name <span class="required">*</span></label>
              <nr-input
                .value=${this.connectionName}
                placeholder="e.g., production, staging"
                ?disabled=${this.isEdit}
                @nr-input=${(e: CustomEvent) => this.connectionName = e.detail?.value || ''}
              ></nr-input>
            </div>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label>Host <span class="required">*</span></label>
              <nr-input
                .value=${this.host}
                placeholder="localhost"
                @nr-input=${(e: CustomEvent) => this.host = e.detail?.value || ''}
              ></nr-input>
            </div>
            <div class="form-field">
              <label>Port</label>
              <nr-input
                type="number"
                .value=${String(this.port)}
                placeholder="${DEFAULT_PORTS[this.dbType] || 5432}"
                @nr-input=${(e: CustomEvent) => {
                  const val = parseInt(e.detail?.value);
                  if (val > 0 && val <= 65535) this.port = val;
                }}
              ></nr-input>
            </div>
          </div>

          <div class="form-field">
            <label>Database <span class="required">*</span></label>
            <nr-input
              .value=${this.database}
              placeholder="database name"
              @nr-input=${(e: CustomEvent) => this.database = e.detail?.value || ''}
            ></nr-input>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label>Username <span class="required">*</span></label>
              <nr-input
                .value=${this.username}
                placeholder="username"
                @nr-input=${(e: CustomEvent) => this.username = e.detail?.value || ''}
              ></nr-input>
            </div>
            <div class="form-field">
              <label>Password</label>
              <nr-input
                type="password"
                .value=${this.password}
                placeholder="password"
                @nr-input=${(e: CustomEvent) => this.password = e.detail?.value || ''}
              ></nr-input>
            </div>
          </div>

          <div class="checkbox-field">
            <input
              type="checkbox"
              id="ssl-toggle"
              .checked=${this.ssl}
              @change=${(e: Event) => this.ssl = (e.target as HTMLInputElement).checked}
            />
            <label for="ssl-toggle">Use SSL</label>
          </div>

          ${this.testResult ? html`
            <div class="test-result ${this.testResult.success ? 'success' : 'error'}">
              ${this.testResult.message}
            </div>
          ` : nothing}

          ${this.error ? html`<div class="error-message">${this.error}</div>` : nothing}
        </div>

        <div slot="footer" class="dialog-footer">
          <div class="footer-left">
            <nr-button
              type="default"
              size="small"
              ?disabled=${!this.canSave || this.testing}
              @click=${this.handleTest}
            >
              ${this.testing ? 'Testing...' : 'Test Connection'}
            </nr-button>
          </div>
          <div class="footer-right">
            <nr-button type="default" size="small" @click=${this.handleClose}>
              Cancel
            </nr-button>
            <nr-button
              type="primary"
              size="small"
              ?disabled=${!this.canSave || this.saving}
              @click=${this.handleSave}
            >
              ${this.saving ? 'Saving...' : (this.isEdit ? 'Update' : 'Create')}
            </nr-button>
          </div>
        </div>
      </nr-modal>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'database-connection-dialog': DatabaseConnectionDialog;
  }
}
