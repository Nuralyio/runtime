import { LitElement, html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { kvModalStyles } from './KvModal.style';
import { getVarValue } from '../../../../../redux/store/context';
import { APIS_URL } from '../../../../../../../services/constants';
import {
  getKvEntries,
  getCachedKvEntries,
  updateCachedEntries,
  $kvCache,
  type KvEntry,
  type KvValueType,
  type KvEntryVersion
} from '../../../../../redux/store/kv';

/**
 * KvModal Component
 *
 * A modal for managing KV storage (flat entry model):
 * - Entries tab: View/add/edit/delete key-value entries
 * - Secrets tab: View/rotate secrets and version history
 */
@customElement('kv-modal')
export class KvModal extends LitElement {
  static override styles = [kvModalStyles];

  @state() private activeTab: 'entries' | 'secrets' = 'entries';
  @state() private loading = false;
  @state() private entries: KvEntry[] = [];
  @state() private versions: KvEntryVersion[] = [];

  // Filter options
  @state() private filterScope = '';
  @state() private filterPrefix = '';

  // Create/edit entry form
  @state() private showEntryForm = false;
  @state() private editingEntry: KvEntry | null = null;
  @state() private entryKey = '';
  @state() private entryValue = '';
  @state() private entryIsSecret = false;
  @state() private entryTtl: number | null = null;

  // Secrets tab
  @state() private selectedSecretKey: string | null = null;
  @state() private showRotateForm = false;
  @state() private rotateNewValue = '';

  // Messages
  @state() private message: { type: 'success' | 'error'; text: string } | null = null;

  private storeUnsubscribe: (() => void) | null = null;

  override connectedCallback(): void {
    super.connectedCallback();

    // Subscribe to store changes
    this.storeUnsubscribe = $kvCache.subscribe((cache) => {
      const appId = this.getAppId();
      if (appId && cache[appId]) {
        const data = cache[appId];
        this.entries = data.entries;
        this.loading = data.loading;
      }
    });

    // Load data
    this.loadEntries();
  }

  override disconnectedCallback(): void {
    if (this.storeUnsubscribe) {
      this.storeUnsubscribe();
      this.storeUnsubscribe = null;
    }
    super.disconnectedCallback();
  }

  private getAppId(): string | null {
    const app = getVarValue('global', 'currentEditingApplication') as any;
    return app?.uuid || null;
  }

  private async loadEntries(): Promise<void> {
    const appId = this.getAppId();
    if (!appId) return;

    // Check cache first
    const cached = getCachedKvEntries(appId, {
      scope: this.filterScope || undefined,
      prefix: this.filterPrefix || undefined
    });
    if (cached) {
      this.entries = cached;
      this.loading = false;
      return;
    }

    // Fetch from API
    this.loading = true;
    const entries = await getKvEntries(appId, {
      scope: this.filterScope || undefined,
      prefix: this.filterPrefix || undefined
    });
    if (entries) {
      this.entries = entries;
    }
    this.loading = false;
  }

  private async loadVersionHistory(keyPath: string): Promise<void> {
    const appId = this.getAppId();
    if (!appId) return;

    try {
      const response = await fetch(APIS_URL.getKvVersions(appId, keyPath), {
        credentials: 'include'
      });
      if (response.ok) {
        this.versions = await response.json();
      }
    } catch (error) {
      console.error('Failed to load version history:', error);
      this.versions = [];
    }
  }

  private resetEntryForm(): void {
    this.showEntryForm = false;
    this.editingEntry = null;
    this.entryKey = '';
    this.entryValue = '';
    this.entryIsSecret = false;
    this.entryTtl = null;
  }

  private resetRotateForm(): void {
    this.showRotateForm = false;
    this.rotateNewValue = '';
  }

  private showMessage(type: 'success' | 'error', text: string): void {
    this.message = { type, text };
    setTimeout(() => {
      this.message = null;
    }, 5000);
  }

  // CRUD Operations

  private async handleSetEntry(): Promise<void> {
    const appId = this.getAppId();
    if (!appId || !this.entryKey) return;

    try {
      // Parse value if it looks like JSON
      let parsedValue: any = this.entryValue;
      if (this.entryValue.trim().startsWith('{') || this.entryValue.trim().startsWith('[')) {
        try {
          parsedValue = JSON.parse(this.entryValue);
        } catch {
          // Keep as string if not valid JSON
        }
      } else if (this.entryValue === 'true' || this.entryValue === 'false') {
        parsedValue = this.entryValue === 'true';
      } else if (!isNaN(Number(this.entryValue)) && this.entryValue.trim() !== '') {
        parsedValue = Number(this.entryValue);
      }

      const response = await fetch(APIS_URL.setKvEntry(this.entryKey), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          applicationId: appId,
          scope: this.filterScope || undefined,
          value: parsedValue,
          isSecret: this.entryIsSecret,
          ttlSeconds: this.entryTtl || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to save entry');
      }

      const savedEntry = await response.json();

      // Update local state
      const existingIndex = this.entries.findIndex(e => e.keyPath === this.entryKey);
      let updatedEntries: KvEntry[];
      if (existingIndex >= 0) {
        updatedEntries = [...this.entries];
        updatedEntries[existingIndex] = savedEntry;
      } else {
        updatedEntries = [...this.entries, savedEntry];
      }

      this.entries = updatedEntries;
      updateCachedEntries(appId, updatedEntries, {
        scope: this.filterScope || undefined,
        prefix: this.filterPrefix || undefined
      });
      this.resetEntryForm();
      this.showMessage('success', `Entry "${this.entryKey}" saved successfully`);
    } catch (error: any) {
      this.showMessage('error', error.message || 'Failed to save entry');
    }
  }

  private async handleDeleteEntry(keyPath: string): Promise<void> {
    const appId = this.getAppId();
    if (!appId) return;

    if (!confirm(`Are you sure you want to delete entry "${keyPath}"?`)) return;

    try {
      const response = await fetch(APIS_URL.deleteKvEntry(appId, keyPath), {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to delete entry');
      }

      const updatedEntries = this.entries.filter(e => e.keyPath !== keyPath);
      this.entries = updatedEntries;
      updateCachedEntries(appId, updatedEntries, {
        scope: this.filterScope || undefined,
        prefix: this.filterPrefix || undefined
      });
      this.showMessage('success', 'Entry deleted successfully');
    } catch (error: any) {
      this.showMessage('error', error.message || 'Failed to delete entry');
    }
  }

  private async handleRotateSecret(): Promise<void> {
    const appId = this.getAppId();
    if (!appId || !this.selectedSecretKey || !this.rotateNewValue) return;

    try {
      const response = await fetch(APIS_URL.rotateKvSecret(appId, this.selectedSecretKey), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          value: this.rotateNewValue,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to rotate secret');
      }

      const updatedEntry = await response.json();

      // Update local state
      const updatedEntries = this.entries.map(e =>
        e.keyPath === this.selectedSecretKey ? updatedEntry : e
      );
      this.entries = updatedEntries;
      updateCachedEntries(appId, updatedEntries, {
        scope: this.filterScope || undefined,
        prefix: this.filterPrefix || undefined
      });

      // Reload version history
      await this.loadVersionHistory(this.selectedSecretKey);

      this.resetRotateForm();
      this.showMessage('success', 'Secret rotated successfully');
    } catch (error: any) {
      this.showMessage('error', error.message || 'Failed to rotate secret');
    }
  }

  private async handleRollback(version: number): Promise<void> {
    const appId = this.getAppId();
    if (!appId || !this.selectedSecretKey) return;

    if (!confirm(`Are you sure you want to rollback to version ${version}?`)) return;

    try {
      const response = await fetch(APIS_URL.rollbackKvEntry(appId, this.selectedSecretKey), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ version }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to rollback');
      }

      const updatedEntry = await response.json();

      // Update local state
      const updatedEntries = this.entries.map(e =>
        e.keyPath === this.selectedSecretKey ? updatedEntry : e
      );
      this.entries = updatedEntries;
      updateCachedEntries(appId, updatedEntries, {
        scope: this.filterScope || undefined,
        prefix: this.filterPrefix || undefined
      });

      // Reload version history
      await this.loadVersionHistory(this.selectedSecretKey);

      this.showMessage('success', `Rolled back to version ${version}`);
    } catch (error: any) {
      this.showMessage('error', error.message || 'Failed to rollback');
    }
  }

  private handleEditEntry(entry: KvEntry): void {
    this.editingEntry = entry;
    this.entryKey = entry.keyPath;
    this.entryValue = typeof entry.value === 'object' ? JSON.stringify(entry.value, null, 2) : String(entry.value);
    this.entryIsSecret = entry.isSecret;
    this.entryTtl = null;
    this.showEntryForm = true;
  }

  private handleSelectSecretEntry(keyPath: string): void {
    this.selectedSecretKey = keyPath;
    this.loadVersionHistory(keyPath);
  }

  private handleFilterChange(): void {
    this.loadEntries();
  }

  // Helper methods

  private formatValue(entry: KvEntry): string {
    if (entry.isEncrypted || entry.isSecret) {
      return '********';
    }
    const value = entry.value;
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  }

  private formatExpiry(expiresAt?: string): string {
    if (!expiresAt) return 'Never expires';
    const date = new Date(expiresAt);
    const now = new Date();
    if (date < now) return 'Expired';
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 24) return `Expires in ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `Expires in ${diffDays}d`;
  }

  private formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString();
  }

  private getSecretEntries(): KvEntry[] {
    return this.entries.filter(e => e.isSecret);
  }

  // Render methods

  private renderEntriesTab() {
    return html`
      <div class="tab-content">
        <div class="entries-section">
          <div class="filter-bar">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">Scope (optional)</label>
              <nr-input
                .value=${this.filterScope}
                placeholder="e.g., workflow, user"
                @nr-input=${(e: CustomEvent) => {
                  this.filterScope = e.detail?.value || '';
                }}
                @nr-blur=${() => this.handleFilterChange()}
              ></nr-input>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">Key prefix (optional)</label>
              <nr-input
                .value=${this.filterPrefix}
                placeholder="e.g., config/"
                @nr-input=${(e: CustomEvent) => {
                  this.filterPrefix = e.detail?.value || '';
                }}
                @nr-blur=${() => this.handleFilterChange()}
              ></nr-input>
            </div>
            <button class="action-btn" style="align-self: flex-end; padding: 8px 12px;" @click=${() => this.loadEntries()}>
              Refresh
            </button>
          </div>

          ${this.loading
            ? html`<div class="loading">Loading entries...</div>`
            : html`
                <div class="section-title">
                  Entries <span class="count">${this.entries.length}</span>
                </div>
                <div class="entry-list">
                  ${this.entries.length === 0
                    ? html`
                        <div class="empty-state">
                          <nr-icon name="key" size="48" class="empty-state-icon"></nr-icon>
                          <div class="empty-state-text">No entries yet</div>
                        </div>
                      `
                    : this.entries.map(entry => this.renderEntryItem(entry))}
                </div>

                ${this.showEntryForm
                  ? this.renderEntryForm()
                  : html`
                      <button class="add-btn" style="margin-top: 16px;" @click=${() => (this.showEntryForm = true)}>
                        + Add Entry
                      </button>
                    `}
              `}
        </div>
      </div>
    `;
  }

  private renderEntryItem(entry: KvEntry) {
    return html`
      <div class="entry-item ${entry.isSecret ? 'secret' : ''}">
        <div class="entry-info">
          <div class="entry-key">
            ${entry.isSecret ? html`<nr-icon name="lock" size="14" class="secret-icon"></nr-icon>` : nothing}
            ${entry.keyPath}
          </div>
          <div class="entry-value ${entry.isSecret ? 'masked' : ''}">${this.formatValue(entry)}</div>
          <div class="entry-meta">
            <span class="type-badge">${entry.valueType}</span>
            ${entry.scope ? html`<span class="scope-badge">${entry.scope}</span>` : nothing}
            ${entry.isSecret ? html`<span class="secret-badge">Secret</span>` : nothing}
            <span class="version-badge">v${entry.version}</span>
            <span class="ttl-badge">${this.formatExpiry(entry.expiresAt)}</span>
          </div>
        </div>
        <div class="entry-actions">
          <button class="action-btn edit" @click=${() => this.handleEditEntry(entry)}>Edit</button>
          <button class="action-btn delete" @click=${() => this.handleDeleteEntry(entry.keyPath)}>Delete</button>
        </div>
      </div>
    `;
  }

  private renderEntryForm() {
    const isEditing = !!this.editingEntry;

    return html`
      <div class="create-form">
        <div class="create-form-header">
          <span class="create-form-title">${isEditing ? 'Edit Entry' : 'Add Entry'}</span>
          <button class="cancel-btn" @click=${this.resetEntryForm}>Cancel</button>
        </div>

        <div class="form-group">
          <label class="form-label">Key Path</label>
          <nr-input
            .value=${this.entryKey}
            placeholder="e.g., config/database/host"
            ?disabled=${isEditing}
            @nr-input=${(e: CustomEvent) => (this.entryKey = e.detail?.value || '')}
          ></nr-input>
          <div class="form-description">Use / for hierarchical keys. Value type is auto-detected.</div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">TTL (seconds)</label>
            <nr-input
              type="number"
              .value=${this.entryTtl ? String(this.entryTtl) : ''}
              placeholder="Leave empty for no expiry"
              @nr-input=${(e: CustomEvent) => (this.entryTtl = e.detail?.value ? Number(e.detail.value) : null)}
            ></nr-input>
          </div>

          <div class="form-group">
            <div class="toggle-container" style="margin-top: 24px;">
              <label class="toggle-switch">
                <input
                  type="checkbox"
                  .checked=${this.entryIsSecret}
                  ?disabled=${isEditing}
                  @change=${(e: Event) => (this.entryIsSecret = (e.target as HTMLInputElement).checked)}
                />
                <span class="toggle-slider"></span>
              </label>
              <span class="toggle-label">Secret (encrypted)</span>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Value</label>
          <textarea
            rows="4"
            style="width: 100%; font-family: monospace; padding: 8px; border: 1px solid #e5e7eb; border-radius: 6px; box-sizing: border-box;"
            .value=${this.entryValue}
            placeholder='Enter value (JSON, string, number, or boolean)'
            @input=${(e: Event) => (this.entryValue = (e.target as HTMLTextAreaElement).value)}
          ></textarea>
          <div class="form-description">
            Type is auto-detected: {"key": "value"} = JSON, 123 = Number, true/false = Boolean, otherwise String
          </div>
        </div>

        <div class="form-actions">
          <button
            class="add-btn"
            ?disabled=${!this.entryKey || !this.entryValue}
            @click=${this.handleSetEntry}
          >
            ${isEditing ? 'Update Entry' : 'Add Entry'}
          </button>
        </div>
      </div>
    `;
  }

  private renderSecretsTab() {
    const secretEntries = this.getSecretEntries();

    return html`
      <div class="tab-content">
        <div class="secrets-section">
          ${secretEntries.length === 0
            ? html`
                <div class="empty-state">
                  <nr-icon name="lock" size="48" class="empty-state-icon"></nr-icon>
                  <div class="empty-state-text">No secret entries. Mark an entry as secret when creating it.</div>
                </div>
              `
            : html`
                <div class="secret-entry-selector">
                  <div class="form-group">
                    <label class="form-label">Select Secret Entry</label>
                    <nr-select
                      .value=${this.selectedSecretKey || ''}
                      .options=${secretEntries.map(entry => ({
                        label: entry.keyPath,
                        value: entry.keyPath
                      }))}
                      placeholder="Select a secret..."
                      @nr-change=${(e: CustomEvent) => {
                        const key = e.detail?.value || '';
                        if (key) {
                          this.handleSelectSecretEntry(key);
                        } else {
                          this.selectedSecretKey = null;
                          this.versions = [];
                        }
                      }}
                    ></nr-select>
                  </div>
                </div>

                ${this.selectedSecretKey
                  ? html`
                      ${this.showRotateForm
                        ? this.renderRotateForm()
                        : html`
                            <button class="add-btn" @click=${() => (this.showRotateForm = true)}>
                              Rotate Secret
                            </button>
                          `}

                      <div class="version-history">
                        <div class="section-title">Version History</div>
                        <div class="version-list">
                          ${this.versions.length === 0
                            ? html`<div class="empty-state">No version history available</div>`
                            : this.versions.map((v, i) => this.renderVersionItem(v, i === 0))}
                        </div>
                      </div>
                    `
                  : nothing}
              `}
        </div>
      </div>
    `;
  }

  private renderRotateForm() {
    return html`
      <div class="rotate-form">
        <div class="rotate-warning">
          <nr-icon name="alert-triangle" size="16" class="rotate-warning-icon"></nr-icon>
          <span>Rotating a secret will create a new version. The old value will be preserved in version history.</span>
        </div>

        <div class="form-group">
          <label class="form-label">New Secret Value</label>
          <nr-input
            type="password"
            .value=${this.rotateNewValue}
            placeholder="Enter new secret value..."
            @nr-input=${(e: CustomEvent) => (this.rotateNewValue = e.detail?.value || '')}
          ></nr-input>
        </div>

        <div class="form-actions">
          <button
            class="add-btn"
            ?disabled=${!this.rotateNewValue}
            @click=${this.handleRotateSecret}
          >
            Rotate Secret
          </button>
          <button class="cancel-btn" @click=${this.resetRotateForm}>Cancel</button>
        </div>
      </div>
    `;
  }

  private renderVersionItem(version: KvEntryVersion, isCurrent: boolean) {
    return html`
      <div class="version-item ${isCurrent ? 'current' : ''}">
        <div class="version-info">
          <div class="version-number">
            Version ${version.version}
            ${isCurrent ? html`<span class="current-badge">Current</span>` : nothing}
          </div>
          <div class="version-date">${this.formatDate(version.createdAt)}</div>
          <div class="version-reason">${version.changeReason}</div>
        </div>
        ${!isCurrent
          ? html`
              <button class="action-btn rollback" @click=${() => this.handleRollback(version.version)}>
                Rollback
              </button>
            `
          : nothing}
      </div>
    `;
  }

  override render() {
    return html`
      <div class="kv-container">
        ${this.message
          ? html`<div class="${this.message.type}-message">${this.message.text}</div>`
          : nothing}

        <div class="tabs-header">
          <button
            class="tab-btn ${this.activeTab === 'entries' ? 'active' : ''}"
            @click=${() => (this.activeTab = 'entries')}
          >
            Entries
          </button>
          <button
            class="tab-btn ${this.activeTab === 'secrets' ? 'active' : ''}"
            @click=${() => (this.activeTab = 'secrets')}
          >
            Secrets
          </button>
        </div>

        ${this.activeTab === 'entries' ? this.renderEntriesTab() : nothing}
        ${this.activeTab === 'secrets' ? this.renderSecretsTab() : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'kv-modal': KvModal;
  }
}
