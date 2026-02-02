/**
 * Dashboard KV View Component
 * Global KV store browser with filtering
 */

import { html, LitElement, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  fetchApplicationsWithStatus,
  fetchAllKvEntriesAcrossApps,
  type ApplicationWithStatus
} from '../services/dashboard.service';
import type { KvEntry } from '../../runtime/redux/store/kv';

// Import NuralyUI components
import '../../runtime/components/ui/nuraly-ui/src/components/button';
import '../../runtime/components/ui/nuraly-ui/src/components/badge';
import '../../runtime/components/ui/nuraly-ui/src/components/input';

@customElement('dashboard-kv-view')
export class DashboardKVView extends LitElement {
  static styles = css`
    :host {
      display: block;
      height: 100%;
      background: var(--nuraly-color-background, #f8fafc);
    }

    .kv-view {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .kv-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 24px;
      background: var(--nuraly-color-surface, #ffffff);
      border-bottom: 1px solid var(--nuraly-color-border, #e8e8f0);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .back-button {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      font-size: 13px;
      color: var(--nuraly-color-text-secondary, #5c5c7a);
      background: transparent;
      border: 1px solid var(--nuraly-color-border, #e8e8f0);
      border-radius: 6px;
      cursor: pointer;
      transition: all 150ms ease;
    }

    .back-button:hover {
      color: var(--nuraly-color-text, #0f0f3c);
      background: var(--nuraly-color-background-hover, #f1f5f9);
    }

    .back-button svg {
      width: 14px;
      height: 14px;
    }

    .header-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--nuraly-color-text, #0f0f3c);
      margin: 0;
    }

    .kv-filters {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 24px;
      background: var(--nuraly-color-surface, #ffffff);
      border-bottom: 1px solid var(--nuraly-color-border, #e8e8f0);
    }

    .filter-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .filter-label {
      font-size: 13px;
      color: var(--nuraly-color-text-secondary, #5c5c7a);
    }

    .filter-select {
      padding: 6px 12px;
      font-size: 13px;
      border: 1px solid var(--nuraly-color-border, #e8e8f0);
      border-radius: 6px;
      background: var(--nuraly-color-surface, #ffffff);
      color: var(--nuraly-color-text, #0f0f3c);
      min-width: 150px;
    }

    .search-input {
      flex: 1;
      max-width: 300px;
    }

    .kv-content {
      flex: 1;
      padding: 24px;
      overflow-y: auto;
    }

    /* Table styles */
    .kv-table {
      width: 100%;
      background: var(--nuraly-color-surface, #ffffff);
      border-radius: 8px;
      border: 1px solid var(--nuraly-color-border, #e8e8f0);
      border-collapse: collapse;
      overflow: hidden;
    }

    .kv-table th,
    .kv-table td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid var(--nuraly-color-border-subtle, #f1f3f5);
    }

    .kv-table th {
      background: var(--nuraly-color-background, #f8fafc);
      font-size: 12px;
      font-weight: 600;
      color: var(--nuraly-color-text-secondary, #5c5c7a);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .kv-table td {
      font-size: 13px;
      color: var(--nuraly-color-text, #0f0f3c);
    }

    .kv-table tr:last-child td {
      border-bottom: none;
    }

    .kv-table tr:hover td {
      background: var(--nuraly-color-background-hover, #f1f5f9);
    }

    .key-cell {
      font-family: var(--nuraly-font-mono, monospace);
      font-weight: 500;
    }

    .value-cell {
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-family: var(--nuraly-font-mono, monospace);
      font-size: 12px;
      color: var(--nuraly-color-text-secondary, #5c5c7a);
    }

    .app-cell {
      cursor: pointer;
      color: var(--nuraly-color-primary, #14144b);
    }

    .app-cell:hover {
      text-decoration: underline;
    }

    /* Loading */
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      gap: 12px;
    }

    .loading-spinner {
      width: 32px;
      height: 32px;
      border: 2px solid var(--nuraly-color-border, #e8e8f0);
      border-top-color: var(--nuraly-color-primary, #14144b);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .empty-state {
      text-align: center;
      padding: 48px 24px;
      color: var(--nuraly-color-text-secondary, #5c5c7a);
    }

    .empty-state-title {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 8px;
      color: var(--nuraly-color-text, #0f0f3c);
    }

    .results-info {
      font-size: 13px;
      color: var(--nuraly-color-text-secondary, #5c5c7a);
      margin-bottom: 16px;
    }
  `;

  @property({ type: Object }) filters: Record<string, string> = {};

  @state() private entries: (KvEntry & { applicationName?: string; applicationId?: string })[] = [];
  @state() private applications: ApplicationWithStatus[] = [];
  @state() private loading = true;
  @state() private searchQuery = '';
  @state() private selectedAppId = '';

  async connectedCallback() {
    super.connectedCallback();

    // Initialize from filters prop
    if (this.filters.app) {
      this.selectedAppId = this.filters.app;
    }
    if (this.filters.key) {
      this.searchQuery = this.filters.key;
    }

    await this.loadData();
  }

  private async loadData() {
    this.loading = true;
    try {
      const [apps, entries] = await Promise.all([
        fetchApplicationsWithStatus({}),
        fetchAllKvEntriesAcrossApps({})
      ]);

      this.applications = apps;
      this.entries = entries;
    } catch (e) {
      console.error('[DashboardKVView] Failed to load data:', e);
    } finally {
      this.loading = false;
    }
  }

  private get filteredEntries() {
    let result = this.entries;

    // Filter by app
    if (this.selectedAppId) {
      result = result.filter(e => e.applicationId === this.selectedAppId);
    }

    // Filter by search query (key)
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(e => e.key.toLowerCase().includes(query));
    }

    return result;
  }

  private handleAppFilterChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    this.selectedAppId = select.value;
  }

  private handleSearchChange(e: Event) {
    const input = e.target as HTMLInputElement;
    this.searchQuery = input.value;
  }

  private goBack() {
    this.dispatchEvent(new CustomEvent('navigate', {
      detail: { path: '/dashboard' },
      bubbles: true,
      composed: true
    }));
  }

  private handleAppClick(appId: string) {
    this.dispatchEvent(new CustomEvent('navigate', {
      detail: { path: `/dashboard/app/${appId}` },
      bubbles: true,
      composed: true
    }));
  }

  private formatValue(value: any): string {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value).slice(0, 100);
      } catch {
        return '[object]';
      }
    }
    return String(value).slice(0, 100);
  }

  render() {
    return html`
      <div class="kv-view">
        <div class="kv-header">
          <div class="header-left">
            <button class="back-button" @click=${this.goBack}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back
            </button>
            <h2 class="header-title">KV Store</h2>
          </div>
          <nr-button type="default" size="small" iconLeft="RefreshCw" @click=${this.loadData}>
            Refresh
          </nr-button>
        </div>

        <div class="kv-filters">
          <div class="filter-group">
            <label class="filter-label">App:</label>
            <select class="filter-select" @change=${this.handleAppFilterChange}>
              <option value="">All Applications</option>
              ${this.applications.map(app => html`
                <option value=${app.uuid} ?selected=${this.selectedAppId === app.uuid}>
                  ${app.name}
                </option>
              `)}
            </select>
          </div>

          <div class="filter-group search-input">
            <label class="filter-label">Key:</label>
            <input
              type="text"
              class="filter-select"
              placeholder="Search by key..."
              .value=${this.searchQuery}
              @input=${this.handleSearchChange}
            />
          </div>
        </div>

        <div class="kv-content">
          ${this.loading ? html`
            <div class="loading-container">
              <div class="loading-spinner"></div>
            </div>
          ` : this.filteredEntries.length === 0 ? html`
            <div class="empty-state">
              <p class="empty-state-title">No entries found</p>
              <p>Try adjusting your filters or search query</p>
            </div>
          ` : html`
            <p class="results-info">
              Showing ${this.filteredEntries.length} of ${this.entries.length} entries
            </p>
            <table class="kv-table">
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Value</th>
                  <th>Scope</th>
                  <th>Application</th>
                </tr>
              </thead>
              <tbody>
                ${this.filteredEntries.slice(0, 100).map(entry => html`
                  <tr>
                    <td class="key-cell">${entry.key}</td>
                    <td class="value-cell" title=${this.formatValue(entry.value)}>
                      ${this.formatValue(entry.value)}
                    </td>
                    <td>
                      <nr-badge status="default" text=${entry.scope || 'global'}></nr-badge>
                    </td>
                    <td
                      class="app-cell"
                      @click=${() => this.handleAppClick(entry.applicationId || '')}
                    >
                      ${entry.applicationName || 'Unknown'}
                    </td>
                  </tr>
                `)}
              </tbody>
            </table>
            ${this.filteredEntries.length > 100 ? html`
              <p class="results-info" style="margin-top: 16px;">
                Showing first 100 entries. Refine your search to see more.
              </p>
            ` : nothing}
          `}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dashboard-kv-view': DashboardKVView;
  }
}
