import { LitElement, html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { kvModalStyles } from './KvModal.style';
import { getVarValue } from '../../../../../redux/store/context';
import { APIS_URL } from '../../../../../../../services/constants';
import {
  getKvNamespaces,
  getKvEntries,
  getCachedKvNamespaces,
  getCachedKvEntries,
  updateCachedNamespaces,
  updateCachedEntries,
  $kvCache,
  type KvNamespace,
  type KvEntry,
  type KvValueType,
  type KvEntryVersion
} from '../../../../../redux/store/kv';

/**
 * KvModal Component
 *
 * A modal for managing KV storage:
 * - Namespaces tab: View/create/delete namespaces
 * - Entries tab: View/add/edit/delete key-value entries
 * - Secrets tab: Rotate secrets and view version history
 */
@customElement('kv-modal')
export class KvModal extends LitElement {
  static override styles = [kvModalStyles];

  @state() private activeTab: 'namespaces' | 'entries' | 'secrets' = 'namespaces';
  @state() private loading = false;
  @state() private namespaces: KvNamespace[] = [];
  @state() private selectedNamespaceId: string | null = null;
  @state() private entries: KvEntry[] = [];
  @state() private versions: KvEntryVersion[] = [];

  // Create namespace form
  @state() private showCreateNamespaceForm = false;
  @state() private newNamespaceName = '';
  @state() private newNamespaceDescription = '';
  @state() private newNamespaceIsSecret = false;

  // Create/edit entry form
  @state() private showEntryForm = false;
  @state() private editingEntry: KvEntry | null = null;
  @state() private entryKey = '';
  @state() private entryValue = '';
  @state() private entryValueType: KvValueType = 'STRING';
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
        this.namespaces = data.namespaces;
        this.loading = data.loading;

        // Load entries for selected namespace
        if (this.selectedNamespaceId && data.entries[this.selectedNamespaceId]) {
          this.entries = data.entries[this.selectedNamespaceId];
        }
      }
    });

    // Load data
    this.loadNamespaces();
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

  private async loadNamespaces(): Promise<void> {
    const appId = this.getAppId();
    if (!appId) return;

    // Check cache first
    const cached = getCachedKvNamespaces(appId);
    if (cached) {
      this.namespaces = cached;
      this.loading = false;
      return;
    }

    // Fetch from API
    this.loading = true;
    const namespaces = await getKvNamespaces(appId);
    if (namespaces) {
      this.namespaces = namespaces;
    }
    this.loading = false;
  }

  private async loadEntries(namespaceId: string): Promise<void> {
    const appId = this.getAppId();
    if (!appId || !namespaceId) return;

    // Check cache first
    const cached = getCachedKvEntries(appId, namespaceId);
    if (cached) {
      this.entries = cached;
      return;
    }

    // Fetch from API
    const entries = await getKvEntries(appId, namespaceId);
    if (entries) {
      this.entries = entries;
    }
  }

  private async loadVersionHistory(namespaceId: string, keyPath: string): Promise<void> {
    try {
      const response = await fetch(APIS_URL.getKvVersions(namespaceId, keyPath), {
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

  private resetNamespaceForm(): void {
    this.showCreateNamespaceForm = false;
    this.newNamespaceName = '';
    this.newNamespaceDescription = '';
    this.newNamespaceIsSecret = false;
  }

  private resetEntryForm(): void {
    this.showEntryForm = false;
    this.editingEntry = null;
    this.entryKey = '';
    this.entryValue = '';
    this.entryValueType = 'STRING';
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

  private async handleCreateNamespace(): Promise<void> {
    const appId = this.getAppId();
    if (!appId || !this.newNamespaceName) return;

    try {
      const response = await fetch(APIS_URL.createKvNamespace(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: this.newNamespaceName,
          description: this.newNamespaceDescription || undefined,
          applicationId: appId,
          isSecretNamespace: this.newNamespaceIsSecret,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to create namespace');
      }

      const newNamespace = await response.json();
      const updatedNamespaces = [...this.namespaces, newNamespace];
      this.namespaces = updatedNamespaces;
      updateCachedNamespaces(appId, updatedNamespaces);
      this.resetNamespaceForm();
      this.showMessage('success', `Namespace "${newNamespace.name}" created successfully`);
    } catch (error: any) {
      this.showMessage('error', error.message || 'Failed to create namespace');
    }
  }

  private async handleDeleteNamespace(nsId: string): Promise<void> {
    const appId = this.getAppId();
    if (!appId) return;

    const ns = this.namespaces.find(n => n.id === nsId);
    if (!confirm(`Are you sure you want to delete namespace "${ns?.name}"? This will delete all entries.`)) return;

    try {
      const response = await fetch(APIS_URL.deleteKvNamespace(nsId), {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to delete namespace');
      }

      const updatedNamespaces = this.namespaces.filter(n => n.id !== nsId);
      this.namespaces = updatedNamespaces;
      updateCachedNamespaces(appId, updatedNamespaces);

      if (this.selectedNamespaceId === nsId) {
        this.selectedNamespaceId = null;
        this.entries = [];
      }

      this.showMessage('success', 'Namespace deleted successfully');
    } catch (error: any) {
      this.showMessage('error', error.message || 'Failed to delete namespace');
    }
  }

  private async handleSetEntry(): Promise<void> {
    const appId = this.getAppId();
    if (!appId || !this.selectedNamespaceId || !this.entryKey) return;

    try {
      // Parse value based on type
      let parsedValue: any = this.entryValue;
      if (this.entryValueType === 'JSON') {
        try {
          parsedValue = JSON.parse(this.entryValue);
        } catch {
          throw new Error('Invalid JSON value');
        }
      } else if (this.entryValueType === 'NUMBER') {
        parsedValue = Number(this.entryValue);
        if (isNaN(parsedValue)) {
          throw new Error('Invalid number value');
        }
      } else if (this.entryValueType === 'BOOLEAN') {
        parsedValue = this.entryValue.toLowerCase() === 'true';
      }

      const response = await fetch(APIS_URL.setKvEntry(this.selectedNamespaceId, this.entryKey), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          value: parsedValue,
          valueType: this.entryValueType,
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
      updateCachedEntries(appId, this.selectedNamespaceId, updatedEntries);
      this.resetEntryForm();
      this.showMessage('success', `Entry "${this.entryKey}" saved successfully`);
    } catch (error: any) {
      this.showMessage('error', error.message || 'Failed to save entry');
    }
  }

  private async handleDeleteEntry(keyPath: string): Promise<void> {
    const appId = this.getAppId();
    if (!appId || !this.selectedNamespaceId) return;

    if (!confirm(`Are you sure you want to delete entry "${keyPath}"?`)) return;

    try {
      const response = await fetch(APIS_URL.deleteKvEntry(this.selectedNamespaceId, keyPath), {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to delete entry');
      }

      const updatedEntries = this.entries.filter(e => e.keyPath !== keyPath);
      this.entries = updatedEntries;
      updateCachedEntries(appId, this.selectedNamespaceId, updatedEntries);
      this.showMessage('success', 'Entry deleted successfully');
    } catch (error: any) {
      this.showMessage('error', error.message || 'Failed to delete entry');
    }
  }

  private async handleRotateSecret(): Promise<void> {
    const appId = this.getAppId();
    if (!appId || !this.selectedNamespaceId || !this.selectedSecretKey || !this.rotateNewValue) return;

    try {
      const response = await fetch(APIS_URL.rotateKvSecret(this.selectedNamespaceId, this.selectedSecretKey), {
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
      updateCachedEntries(appId, this.selectedNamespaceId, updatedEntries);

      // Reload version history
      await this.loadVersionHistory(this.selectedNamespaceId, this.selectedSecretKey);

      this.resetRotateForm();
      this.showMessage('success', 'Secret rotated successfully');
    } catch (error: any) {
      this.showMessage('error', error.message || 'Failed to rotate secret');
    }
  }

  private async handleRollback(version: number): Promise<void> {
    const appId = this.getAppId();
    if (!appId || !this.selectedNamespaceId || !this.selectedSecretKey) return;

    if (!confirm(`Are you sure you want to rollback to version ${version}?`)) return;

    try {
      const response = await fetch(APIS_URL.rollbackKvEntry(this.selectedNamespaceId, this.selectedSecretKey), {
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
      updateCachedEntries(appId, this.selectedNamespaceId, updatedEntries);

      // Reload version history
      await this.loadVersionHistory(this.selectedNamespaceId, this.selectedSecretKey);

      this.showMessage('success', `Rolled back to version ${version}`);
    } catch (error: any) {
      this.showMessage('error', error.message || 'Failed to rollback');
    }
  }

  private handleEditEntry(entry: KvEntry): void {
    this.editingEntry = entry;
    this.entryKey = entry.keyPath;
    this.entryValue = typeof entry.value === 'object' ? JSON.stringify(entry.value, null, 2) : String(entry.value);
    this.entryValueType = entry.valueType;
    this.entryTtl = null;
    this.showEntryForm = true;
  }

  private handleSelectNamespace(nsId: string): void {
    this.selectedNamespaceId = nsId;
    this.loadEntries(nsId);
    this.activeTab = 'entries';
  }

  private handleSelectSecretEntry(keyPath: string): void {
    this.selectedSecretKey = keyPath;
    if (this.selectedNamespaceId) {
      this.loadVersionHistory(this.selectedNamespaceId, keyPath);
    }
  }

  // Helper methods

  private formatValue(entry: KvEntry): string {
    if (entry.isEncrypted) {
      return '••••••••';
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

  private getSecretNamespaces(): KvNamespace[] {
    return this.namespaces.filter(ns => ns.isSecretNamespace);
  }

  private getSecretEntries(): KvEntry[] {
    const ns = this.namespaces.find(n => n.id === this.selectedNamespaceId);
    if (!ns?.isSecretNamespace) return [];
    return this.entries;
  }

  // Render methods

  private renderNamespacesTab() {
    return html`
      <div class="tab-content">
        ${this.loading
          ? html`<div class="loading">Loading namespaces...</div>`
          : html`
              <div class="namespaces-section">
                <div class="section-title">
                  Namespaces <span class="count">${this.namespaces.length}</span>
                </div>
                <div class="namespace-list">
                  ${this.namespaces.length === 0
                    ? html`
                        <div class="empty-state">
                          <div class="empty-state-icon">📦</div>
                          <div class="empty-state-text">No namespaces yet</div>
                        </div>
                      `
                    : this.namespaces.map(ns => this.renderNamespaceItem(ns))}
                </div>
              </div>

              ${this.showCreateNamespaceForm
                ? this.renderCreateNamespaceForm()
                : html`
                    <button class="add-btn" @click=${() => (this.showCreateNamespaceForm = true)}>
                      + Create Namespace
                    </button>
                  `}
            `}
      </div>
    `;
  }

  private renderNamespaceItem(ns: KvNamespace) {
    return html`
      <div
        class="namespace-item ${ns.isSecretNamespace ? 'secret' : ''} ${this.selectedNamespaceId === ns.id ? 'selected' : ''}"
        @click=${() => this.handleSelectNamespace(ns.id)}
      >
        <div class="namespace-info">
          <div class="namespace-icon ${ns.isSecretNamespace ? 'secret' : ''}">
            ${ns.isSecretNamespace ? '🔒' : '📁'}
          </div>
          <div class="namespace-details">
            <div class="namespace-name">${ns.name}</div>
            ${ns.description ? html`<div class="namespace-desc">${ns.description}</div>` : nothing}
          </div>
        </div>
        <div class="namespace-meta">
          ${ns.isSecretNamespace ? html`<span class="secret-badge">Secret</span>` : nothing}
          <button
            class="action-btn delete"
            @click=${(e: Event) => {
              e.stopPropagation();
              this.handleDeleteNamespace(ns.id);
            }}
          >
            Delete
          </button>
        </div>
      </div>
    `;
  }

  private renderCreateNamespaceForm() {
    return html`
      <div class="create-form">
        <div class="create-form-header">
          <span class="create-form-title">Create Namespace</span>
          <button class="cancel-btn" @click=${this.resetNamespaceForm}>Cancel</button>
        </div>

        <div class="form-group">
          <label class="form-label">Name</label>
          <nr-input
            .value=${this.newNamespaceName}
            placeholder="e.g., app-config"
            @nr-input=${(e: CustomEvent) => (this.newNamespaceName = e.detail?.value || '')}
          ></nr-input>
        </div>

        <div class="form-group">
          <label class="form-label">Description (optional)</label>
          <nr-input
            .value=${this.newNamespaceDescription}
            placeholder="What is this namespace for?"
            @nr-input=${(e: CustomEvent) => (this.newNamespaceDescription = e.detail?.value || '')}
          ></nr-input>
        </div>

        <div class="form-group">
          <div class="toggle-container">
            <label class="toggle-switch">
              <input
                type="checkbox"
                .checked=${this.newNamespaceIsSecret}
                @change=${(e: Event) => (this.newNamespaceIsSecret = (e.target as HTMLInputElement).checked)}
              />
              <span class="toggle-slider"></span>
            </label>
            <span class="toggle-label">Secret Namespace (values will be encrypted)</span>
          </div>
        </div>

        <div class="form-actions">
          <button
            class="add-btn"
            ?disabled=${!this.newNamespaceName}
            @click=${this.handleCreateNamespace}
          >
            Create Namespace
          </button>
        </div>
      </div>
    `;
  }

  private renderEntriesTab() {
    return html`
      <div class="tab-content">
        <div class="entries-section">
          <div class="namespace-selector">
            <label>Namespace</label>
            <nr-select
              .value=${this.selectedNamespaceId || ''}
              .options=${this.namespaces.map(ns => ({
                label: `${ns.name}${ns.isSecretNamespace ? ' 🔒' : ''}`,
                value: ns.id
              }))}
              placeholder="Select a namespace..."
              @nr-change=${(e: CustomEvent) => {
                const nsId = e.detail?.value || '';
                this.selectedNamespaceId = nsId || null;
                if (nsId) this.loadEntries(nsId);
                else this.entries = [];
              }}
            ></nr-select>
          </div>

          ${this.selectedNamespaceId
            ? html`
                <div class="section-title">
                  Entries <span class="count">${this.entries.length}</span>
                </div>
                <div class="entry-list">
                  ${this.entries.length === 0
                    ? html`
                        <div class="empty-state">
                          <div class="empty-state-icon">📝</div>
                          <div class="empty-state-text">No entries in this namespace</div>
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
              `
            : html`
                <div class="empty-state">
                  <div class="empty-state-icon">👆</div>
                  <div class="empty-state-text">Select a namespace to view entries</div>
                </div>
              `}
        </div>
      </div>
    `;
  }

  private renderEntryItem(entry: KvEntry) {
    return html`
      <div class="entry-item">
        <div class="entry-info">
          <div class="entry-key">${entry.keyPath}</div>
          <div class="entry-value ${entry.isEncrypted ? 'masked' : ''}">${this.formatValue(entry)}</div>
          <div class="entry-meta">
            <span class="type-badge">${entry.valueType}</span>
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
            placeholder="e.g., database/host"
            ?disabled=${isEditing}
            @nr-input=${(e: CustomEvent) => (this.entryKey = e.detail?.value || '')}
          ></nr-input>
          <div class="form-description">Use / for hierarchical keys</div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Value Type</label>
            <nr-select
              .value=${this.entryValueType}
              .options=${[
                { label: 'String', value: 'STRING' },
                { label: 'JSON', value: 'JSON' },
                { label: 'Number', value: 'NUMBER' },
                { label: 'Boolean', value: 'BOOLEAN' },
                { label: 'Binary (Base64)', value: 'BINARY' }
              ]}
              @nr-change=${(e: CustomEvent) => (this.entryValueType = e.detail?.value as KvValueType)}
            ></nr-select>
          </div>

          <div class="form-group">
            <label class="form-label">TTL (seconds)</label>
            <nr-input
              type="number"
              .value=${this.entryTtl ? String(this.entryTtl) : ''}
              placeholder="Leave empty for no expiry"
              @nr-input=${(e: CustomEvent) => (this.entryTtl = e.detail?.value ? Number(e.detail.value) : null)}
            ></nr-input>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Value</label>
          ${this.entryValueType === 'JSON'
            ? html`
                <textarea
                  rows="4"
                  style="width: 100%; font-family: monospace; padding: 8px; border: 1px solid #e5e7eb; border-radius: 6px;"
                  .value=${this.entryValue}
                  placeholder='{"key": "value"}'
                  @input=${(e: Event) => (this.entryValue = (e.target as HTMLTextAreaElement).value)}
                ></textarea>
              `
            : this.entryValueType === 'BOOLEAN'
              ? html`
                  <nr-select
                    .value=${this.entryValue || 'true'}
                    .options=${[
                      { label: 'true', value: 'true' },
                      { label: 'false', value: 'false' }
                    ]}
                    @nr-change=${(e: CustomEvent) => (this.entryValue = e.detail?.value || 'true')}
                  ></nr-select>
                `
              : html`
                  <nr-input
                    .value=${this.entryValue}
                    placeholder="Enter value..."
                    type=${this.entryValueType === 'NUMBER' ? 'number' : 'text'}
                    @nr-input=${(e: CustomEvent) => (this.entryValue = e.detail?.value || '')}
                  ></nr-input>
                `}
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
    const secretNamespaces = this.getSecretNamespaces();

    return html`
      <div class="tab-content">
        <div class="secrets-section">
          ${secretNamespaces.length === 0
            ? html`
                <div class="empty-state">
                  <div class="empty-state-icon">🔐</div>
                  <div class="empty-state-text">No secret namespaces. Create one in the Namespaces tab.</div>
                </div>
              `
            : html`
                <div class="secret-entry-selector">
                  <div class="form-group">
                    <label class="form-label">Secret Namespace</label>
                    <nr-select
                      .value=${this.selectedNamespaceId || ''}
                      .options=${secretNamespaces.map(ns => ({
                        label: ns.name,
                        value: ns.id
                      }))}
                      placeholder="Select a namespace..."
                      @nr-change=${(e: CustomEvent) => {
                        const nsId = e.detail?.value || '';
                        this.selectedNamespaceId = nsId || null;
                        this.selectedSecretKey = null;
                        this.versions = [];
                        if (nsId) this.loadEntries(nsId);
                        else this.entries = [];
                      }}
                    ></nr-select>
                  </div>

                  ${this.selectedNamespaceId
                    ? html`
                        <div class="form-group">
                          <label class="form-label">Secret Entry</label>
                          <nr-select
                            .value=${this.selectedSecretKey || ''}
                            .options=${this.entries.map(entry => ({
                              label: entry.keyPath,
                              value: entry.keyPath
                            }))}
                            placeholder="Select an entry..."
                            @nr-change=${(e: CustomEvent) => {
                              const key = e.detail?.value || '';
                              this.selectedSecretKey = key || null;
                              if (key && this.selectedNamespaceId) {
                                this.loadVersionHistory(this.selectedNamespaceId, key);
                              } else {
                                this.versions = [];
                              }
                            }}
                          ></nr-select>
                        </div>
                      `
                    : nothing}
                </div>

                ${this.selectedSecretKey
                  ? html`
                      ${this.showRotateForm
                        ? this.renderRotateForm()
                        : html`
                            <button class="add-btn" @click=${() => (this.showRotateForm = true)}>
                              🔄 Rotate Secret
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
          <span class="rotate-warning-icon">⚠️</span>
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
            class="tab-btn ${this.activeTab === 'namespaces' ? 'active' : ''}"
            @click=${() => (this.activeTab = 'namespaces')}
          >
            Namespaces
          </button>
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

        ${this.activeTab === 'namespaces' ? this.renderNamespacesTab() : nothing}
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
