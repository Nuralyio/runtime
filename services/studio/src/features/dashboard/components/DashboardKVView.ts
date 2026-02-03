/**
 * Dashboard KV View Component
 * Global KV store browser with filtering
 */

import { html, LitElement, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  fetchApplicationsWithStatus,
  fetchAllKvEntriesAcrossApps,
  formatDate,
  type ApplicationWithStatus
} from '../services/dashboard.service';
import type { KvEntry } from '../../runtime/redux/store/kv';
import type { IHeader } from '../../runtime/components/ui/nuraly-ui/src/components/table/table.types';

// Import NuralyUI components
import '../../runtime/components/ui/nuraly-ui/src/components/button';
import '../../runtime/components/ui/nuraly-ui/src/components/badge';
import '../../runtime/components/ui/nuraly-ui/src/components/input';
import '../../runtime/components/ui/nuraly-ui/src/components/table';
import '../../runtime/components/ui/nuraly-ui/src/components/select';

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
      display: flex;
      flex-direction: column;
      padding: 24px;
      overflow: hidden;
      min-height: 0;
    }

    /* Table container */
    .table-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
      background: var(--nuraly-color-surface, #ffffff);
      border-radius: 8px;
      border: 1px solid var(--nuraly-color-border, #e8e8f0);
      overflow: hidden;
    }

    /* nr-table styling overrides */
    .table-container nr-table {
      --nuraly-table-border-radius: 0;
      --nuraly-table-cell-padding: 14px 16px;
      --nuraly-table-header-padding: 12px 16px;
    }

    .table-container nr-table::part(table) {
      border: none;
    }

    /* Cell styles for custom renderers */
    .key-cell {
      font-family: var(--nuraly-font-mono, 'SF Mono', 'Consolas', 'Monaco', monospace);
      font-size: 12px;
      font-weight: 500;
      color: var(--nuraly-color-primary, #14144b);
      background: var(--nuraly-color-background-active, #e8e8f0);
      padding: 3px 8px;
      border-radius: 4px;
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

    .date-text {
      color: var(--nuraly-color-text-secondary, #5c5c7a);
      font-size: 13px;
    }

    /* Type badge styles */
    .type-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }

    .type-badge.string {
      background: var(--nuraly-color-info-light, #dbeafe);
      color: var(--nuraly-color-info, #2563eb);
    }

    .type-badge.json {
      background: var(--nuraly-color-warning-light, #fef3c7);
      color: var(--nuraly-color-warning, #d97706);
    }

    .type-badge.number {
      background: var(--nuraly-color-success-light, #dcfce7);
      color: var(--nuraly-color-success, #16a34a);
    }

    .type-badge.boolean {
      background: var(--nuraly-color-danger-light, #fee2e2);
      color: var(--nuraly-color-danger, #dc2626);
    }

    .type-badge.null {
      background: var(--nuraly-color-background-active, #e8e8f0);
      color: var(--nuraly-color-text-tertiary, #8c8ca8);
    }

    /* Scope badge */
    .scope-badge {
      display: inline-block;
      padding: 2px 8px;
      background: var(--nuraly-color-background-active, #e8e8f0);
      border-radius: 4px;
      font-size: 12px;
      color: var(--nuraly-color-text-secondary, #5c5c7a);
    }

    .scope-global {
      color: var(--nuraly-color-text-tertiary, #8c8ca8);
      font-size: 13px;
    }

    /* Secret badge */
    .secret-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      background: var(--nuraly-color-warning-light, #fef3c7);
      color: var(--nuraly-color-warning, #d97706);
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
    }

    .secret-badge::before {
      content: '●';
      font-size: 8px;
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

  // Extended entry type for table
  private get entriesForTable() {
    return this.filteredEntries.slice(0, 100).map(entry => ({
      ...entry,
      keyPath: entry.key,
      valueType: this.getValueType(entry.value),
      scope: entry.scope || '',
      isSecret: entry.secret || false,
      updatedAt: entry.updatedAt || new Date().toISOString(),
    }));
  }

  private getValueType(value: any): string {
    if (value === null || value === undefined) return 'NULL';
    if (typeof value === 'string') return 'STRING';
    if (typeof value === 'number') return 'NUMBER';
    if (typeof value === 'boolean') return 'BOOLEAN';
    if (typeof value === 'object') return 'JSON';
    return 'STRING';
  }

  private getTypeColor(type: string): { bg: string; color: string } {
    const colors: Record<string, { bg: string; color: string }> = {
      string: { bg: '#dbeafe', color: '#2563eb' },
      json: { bg: '#fef3c7', color: '#d97706' },
      number: { bg: '#dcfce7', color: '#16a34a' },
      boolean: { bg: '#fee2e2', color: '#dc2626' },
      null: { bg: '#e8e8f0', color: '#8c8ca8' },
    };
    return colors[type.toLowerCase()] || { bg: '#e8e8f0', color: '#5c5c7a' };
  }

  private getTableHeaders(): IHeader[] {
    return [
      {
        name: 'Key Path',
        key: 'keyPath',
        render: (value: string) => html`
          <code style="
            font-family: 'SF Mono', 'Consolas', 'Monaco', monospace;
            font-size: 12px;
            font-weight: 500;
            color: #14144b;
            background: #e8e8f0;
            padding: 3px 8px;
            border-radius: 4px;
          ">${value}</code>
        `,
      },
      {
        name: 'Application',
        key: 'applicationName',
        width: 140,
        render: (value: string, row: any) => html`
          <span
            style="
              display: inline-flex;
              align-items: center;
              padding: 3px 8px;
              background: #f1f5f9;
              border-radius: 4px;
              font-size: 12px;
              color: #5c5c7a;
              cursor: pointer;
            "
            @click=${(e: Event) => { e.stopPropagation(); this.handleAppClick(row.applicationId || ''); }}
          >${value || 'Unknown'}</span>
        `,
      },
      {
        name: 'Type',
        key: 'valueType',
        width: 100,
        render: (value: string) => {
          const { bg, color } = this.getTypeColor(value);
          return html`
            <span style="
              display: inline-block;
              padding: 2px 8px;
              border-radius: 4px;
              font-size: 10px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.02em;
              background: ${bg};
              color: ${color};
            ">${value}</span>
          `;
        },
      },
      {
        name: 'Scope',
        key: 'scope',
        width: 100,
        render: (value: string) => value
          ? html`<span style="
              display: inline-block;
              padding: 2px 8px;
              background: #e8e8f0;
              border-radius: 4px;
              font-size: 12px;
              color: #5c5c7a;
            ">${value}</span>`
          : html`<span style="color: #9ca3af; font-size: 13px;">Global</span>`,
      },
      {
        name: 'Secret',
        key: 'isSecret',
        width: 80,
        render: (value: boolean) => value
          ? html`<span style="
              display: inline-flex;
              align-items: center;
              gap: 4px;
              padding: 2px 8px;
              background: #fef3c7;
              color: #d97706;
              border-radius: 4px;
              font-size: 11px;
              font-weight: 500;
            "><span style="font-size: 8px;">●</span>Secret</span>`
          : html``,
      },
      {
        name: 'Updated',
        key: 'updatedAt',
        width: 120,
        render: (value: string) => html`<span style="color: #5c5c7a; font-size: 13px;">${formatDate(value)}</span>`,
      },
    ];
  }

  private handleRowClick(entry: any) {
    if (entry.applicationId) {
      window.location.href = `/app/studio/${entry.applicationId}?kv=${encodeURIComponent(entry.key)}`;
    }
  }

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
            <div class="table-container">
              <nr-table
                .headers=${this.getTableHeaders()}
                .rows=${this.entriesForTable}
                size="small"
                pageSize=${10}
                emptyText="No KV entries found"
                clickable
                @nr-row-click=${(e: CustomEvent) => this.handleRowClick(e.detail.row)}
              ></nr-table>
            </div>
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
