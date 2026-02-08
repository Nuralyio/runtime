/**
 * Dashboard Journal List Component
 * Displays log entries from the Journal service with filtering, pagination, and detail view
 */

import { html, LitElement, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import styles from './JournalList.style';
import {
  $journalState,
  queryLogs,
  setFilters,
  clearFilters,
  loadStats,
  selectLog,
  startStreaming,
  stopStreaming,
  type JournalFilters,
} from '../../../runtime/redux/store/journal';
import type { JournalLogEntry } from '../../../../services/journal.service';
import type { IHeader } from '../../../runtime/components/ui/nuraly-ui/src/components/table/table.types';

// Import NuralyUI components
import '../../../runtime/components/ui/nuraly-ui/src/components/button';
import '../../../runtime/components/ui/nuraly-ui/src/components/badge';
import '../../../runtime/components/ui/nuraly-ui/src/components/table';
import '../../../runtime/components/ui/nuraly-ui/src/components/input';
import '../../../runtime/components/ui/nuraly-ui/src/components/select';
import '../../../runtime/components/ui/nuraly-ui/src/components/tag';
import '../../../runtime/components/ui/nuraly-ui/src/components/icon';

const SERVICE_OPTIONS = [
  { value: '', label: 'All Services' },
  { value: 'workflows', label: 'Workflows' },
  { value: 'functions', label: 'Functions' },
  { value: 'kv', label: 'KV Store' },
  { value: 'conduit', label: 'Conduit' },
  { value: 'parcour', label: 'Parcour' },
  { value: 'gateway', label: 'Gateway' },
  { value: 'api', label: 'API' },
  { value: 'textlens', label: 'TextLens' },
];

const LEVEL_OPTIONS = [
  { value: '', label: 'All Levels' },
  { value: 'DEBUG', label: 'Debug' },
  { value: 'INFO', label: 'Info' },
  { value: 'WARN', label: 'Warn' },
  { value: 'ERROR', label: 'Error' },
];

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'execution', label: 'Execution' },
  { value: 'node', label: 'Node' },
  { value: 'llm', label: 'LLM' },
  { value: 'http', label: 'HTTP' },
  { value: 'error', label: 'Error' },
  { value: 'audit', label: 'Audit' },
  { value: 'system', label: 'System' },
];

@customElement('dashboard-journal-list')
export class DashboardJournalList extends LitElement {
  static styles = styles;

  @state() private logs: JournalLogEntry[] = [];
  @state() private loading = false;
  @state() private error: string | null = null;
  @state() private total = 0;
  @state() private offset = 0;
  @state() private limit = 20;
  @state() private filters: JournalFilters = {};
  @state() private streaming = false;
  @state() private stats: { totalLogs: number; errorCount: number; warnCount: number } | null = null;
  @state() private selectedLog: JournalLogEntry | null = null;
  @state() private detailPanelWidth = 420;
  @state() private isResizing = false;

  private unsubscribes: (() => void)[] = [];
  private boundHandleResizeMove = this.handleResizeMove.bind(this);
  private boundHandleResizeEnd = this.handleResizeEnd.bind(this);

  override connectedCallback() {
    super.connectedCallback();

    // Subscribe to journal store
    this.unsubscribes.push(
      $journalState.subscribe(state => {
        this.logs = state.logs;
        this.loading = state.loading;
        this.error = state.error;
        this.total = state.total;
        this.offset = state.offset;
        this.limit = state.limit;
        this.filters = state.filters;
        this.streaming = state.streaming;
        this.stats = state.stats;

        // Find selected log
        if (state.selectedLogId) {
          this.selectedLog = state.logs.find(l => l.id === state.selectedLogId) || null;
        } else {
          this.selectedLog = null;
        }
      })
    );

    // Initial load
    queryLogs();
    loadStats();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribes.forEach(unsub => unsub());
    this.unsubscribes = [];
    stopStreaming();
    document.removeEventListener('mousemove', this.boundHandleResizeMove);
    document.removeEventListener('mouseup', this.boundHandleResizeEnd);
  }

  private handleServiceFilter(e: CustomEvent) {
    const value = e.detail?.value ?? '';
    setFilters({ ...this.filters, service: value || undefined });
  }

  private handleLevelFilter(e: CustomEvent) {
    const value = e.detail?.value ?? '';
    setFilters({ ...this.filters, level: value || undefined });
  }

  private handleTypeFilter(e: CustomEvent) {
    const value = e.detail?.value ?? '';
    setFilters({ ...this.filters, type: value || undefined });
  }

  private handleSearchInput(e: CustomEvent) {
    const value = e.detail?.value || (e.target as HTMLInputElement)?.value || '';
    // Debounce search
    clearTimeout((this as any)._searchTimeout);
    (this as any)._searchTimeout = setTimeout(() => {
      setFilters({ ...this.filters, dataQuery: value || undefined });
    }, 400);
  }

  private handleClearFilters() {
    clearFilters();
    loadStats();
  }

  private handleRefresh() {
    queryLogs({ offset: this.offset });
    loadStats();
  }

  private handleToggleStreaming() {
    if (this.streaming) {
      stopStreaming();
    } else {
      startStreaming(this.filters.service);
    }
  }

  private handlePrevPage() {
    const newOffset = Math.max(0, this.offset - this.limit);
    queryLogs({ offset: newOffset });
  }

  private handleNextPage() {
    queryLogs({ offset: this.offset + this.limit });
  }

  private handleRowClick(log: JournalLogEntry) {
    selectLog(log.id);
  }

  private handleCloseDetail() {
    selectLog(null);
  }

  private handleResizeStart(e: MouseEvent) {
    e.preventDefault();
    this.isResizing = true;
    document.addEventListener('mousemove', this.boundHandleResizeMove);
    document.addEventListener('mouseup', this.boundHandleResizeEnd);
  }

  private handleResizeMove(e: MouseEvent) {
    if (!this.isResizing) return;
    const hostRect = this.getBoundingClientRect();
    const newWidth = hostRect.right - e.clientX;
    this.detailPanelWidth = Math.max(280, Math.min(newWidth, hostRect.width * 0.7));
  }

  private handleResizeEnd() {
    this.isResizing = false;
    document.removeEventListener('mousemove', this.boundHandleResizeMove);
    document.removeEventListener('mouseup', this.boundHandleResizeEnd);
  }

  private removeFilter(key: keyof JournalFilters) {
    const newFilters = { ...this.filters };
    delete newFilters[key];
    setFilters(newFilters);
  }

  private get hasActiveFilters(): boolean {
    return !!(this.filters.service || this.filters.level || this.filters.type || this.filters.dataQuery);
  }

  private formatTimestamp(ts: string): string {
    if (!ts) return '-';
    try {
      const d = new Date(ts);
      const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const time = d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      return `${date} ${time}`;
    } catch {
      return ts;
    }
  }

  private formatJson(data: unknown): string {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  }

  private syntaxHighlight(json: string): string {
    return json
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
        (match) => {
          let cls = 'json-number';
          if (/^"/.test(match)) {
            if (/:$/.test(match)) {
              cls = 'json-key';
            } else {
              cls = 'json-string';
            }
          } else if (/true|false/.test(match)) {
            cls = 'json-boolean';
          } else if (/null/.test(match)) {
            cls = 'json-null';
          }
          return `<span class="${cls}">${match}</span>`;
        }
      );
  }

  private extractMessage(log: JournalLogEntry): string {
    if (log.message) return log.message;
    if (log.data) {
      const d = log.data;
      if (d.action) return String(d.action);
      if (d.status) return String(d.status);
      if (d.error) return String(d.error);
    }
    return `${log.type} event`;
  }

  private getTableHeaders(): IHeader[] {
    return [
      {
        name: 'Time',
        key: 'timestamp',
        width: 140,
        render: (value: string) => html`
          <span class="timestamp">${this.formatTimestamp(value)}</span>
        `,
      },
      {
        name: 'Level',
        key: 'level',
        width: 80,
        render: (value: string) => html`
          <span class="level-badge ${value}">${value}</span>
        `,
      },
      {
        name: 'Service',
        key: 'service',
        width: 110,
        render: (value: string) => html`
          <span class="service-tag">${value}</span>
        `,
      },
      {
        name: 'Type',
        key: 'type',
        width: 100,
        render: (value: string) => html`
          <span class="type-tag">${value}</span>
        `,
      },
      {
        name: 'Message',
        key: 'message',
        render: (_value: string, row: JournalLogEntry) => html`
          <span class="message-text" title="${this.extractMessage(row)}">${this.extractMessage(row)}</span>
        `,
      },
    ];
  }

  private renderStats() {
    if (!this.stats) return nothing;

    return html`
      <div class="stats-inline">
        <nr-tag color="blue" size="small">${this.stats.totalLogs.toLocaleString()} logs</nr-tag>
        <nr-tag color="red" size="small">${this.stats.errorCount.toLocaleString()} errors</nr-tag>
        <nr-tag color="gold" size="small">${this.stats.warnCount.toLocaleString()} warnings</nr-tag>
      </div>
    `;
  }

  private renderToolbar() {
    return html`
      <div class="toolbar">
        <div class="toolbar-filters">
          <nr-select
            class="filter-select"
            size="small"
            placeholder="Service"
            .options=${SERVICE_OPTIONS}
            .value=${this.filters.service || ''}
            @nr-change=${this.handleServiceFilter}
          ></nr-select>
          <nr-select
            class="filter-select"
            size="small"
            placeholder="Level"
            .options=${LEVEL_OPTIONS}
            .value=${this.filters.level || ''}
            @nr-change=${this.handleLevelFilter}
          ></nr-select>
          <nr-select
            class="filter-select"
            size="small"
            placeholder="Type"
            .options=${TYPE_OPTIONS}
            .value=${this.filters.type || ''}
            @nr-change=${this.handleTypeFilter}
          ></nr-select>
          <nr-input
            class="search-input"
            size="small"
            placeholder="Search in data..."
            .value=${this.filters.dataQuery || ''}
            @nr-input=${this.handleSearchInput}
          ></nr-input>
          ${this.hasActiveFilters ? html`
            <nr-button type="default" size="small" @click=${this.handleClearFilters}>
              Clear
            </nr-button>
          ` : nothing}
        </div>
        <div class="toolbar-actions">
          ${this.renderStats()}
          ${this.streaming ? html`
            <span class="streaming-indicator">
              <span class="streaming-dot"></span>
              Live
            </span>
          ` : nothing}
          <nr-button
            type=${this.streaming ? 'default' : 'default'}
            size="small"
            iconLeft=${this.streaming ? 'Pause' : 'Radio'}
            @click=${this.handleToggleStreaming}
          >${this.streaming ? 'Stop' : 'Stream'}</nr-button>
          <nr-button
            type="default"
            size="small"
            iconLeft="RefreshCw"
            @click=${this.handleRefresh}
            ?disabled=${this.loading}
          >Refresh</nr-button>
        </div>
      </div>
    `;
  }

  private renderActiveFilters() {
    if (!this.hasActiveFilters) return nothing;

    return html`
      <div class="active-filters" style="margin-bottom: 10px;">
        ${this.filters.service ? html`
          <span class="filter-tag" @click=${() => this.removeFilter('service')}>
            Service: ${this.filters.service}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </span>
        ` : nothing}
        ${this.filters.level ? html`
          <span class="filter-tag" @click=${() => this.removeFilter('level')}>
            Level: ${this.filters.level}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </span>
        ` : nothing}
        ${this.filters.type ? html`
          <span class="filter-tag" @click=${() => this.removeFilter('type')}>
            Type: ${this.filters.type}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </span>
        ` : nothing}
        ${this.filters.dataQuery ? html`
          <span class="filter-tag" @click=${() => this.removeFilter('dataQuery')}>
            Search: ${this.filters.dataQuery}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </span>
        ` : nothing}
      </div>
    `;
  }

  private renderTable() {
    if (this.loading && this.logs.length === 0) {
      return html`
        <div class="loading-overlay">
          <div class="spinner"></div>
          Loading logs...
        </div>
      `;
    }

    if (this.error && this.logs.length === 0) {
      return html`
        <div class="error-state">
          <p class="error-text">${this.error}</p>
          <nr-button type="default" size="small" @click=${this.handleRefresh}>
            Retry
          </nr-button>
        </div>
      `;
    }

    if (this.logs.length === 0) {
      return html`
        <div class="empty-state">
          <svg class="empty-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <h3 class="empty-title">No logs found</h3>
          <p class="empty-text">
            ${this.hasActiveFilters
              ? 'No logs match your current filters. Try adjusting or clearing filters.'
              : 'Logs will appear here as services start sending events.'}
          </p>
          ${this.hasActiveFilters ? html`
            <nr-button type="default" size="small" @click=${this.handleClearFilters} style="margin-top: 12px;">
              Clear Filters
            </nr-button>
          ` : nothing}
        </div>
      `;
    }

    return html`
      <div class="table-container">
        <nr-table
          .headers=${this.getTableHeaders()}
          .rows=${this.logs}
          .pageSize=${15}
          size="small"
          emptyText="No logs found"
          clickable
          @nr-row-click=${(e: CustomEvent) => this.handleRowClick(e.detail.row)}
        ></nr-table>
        ${this.renderPagination()}
      </div>
    `;
  }

  private renderPagination() {
    const currentPage = Math.floor(this.offset / this.limit) + 1;
    const showingFrom = this.offset + 1;
    const showingTo = Math.min(this.offset + this.logs.length, this.offset + this.limit);
    const hasPrev = this.offset > 0;
    const hasNext = this.logs.length >= this.limit;

    return html`
      <div class="pagination-bar">
        <span class="pagination-info">
          Showing ${showingFrom}-${showingTo} ${this.logs.length >= this.limit ? '(more available)' : `of ${showingTo}`}
        </span>
        <div class="pagination-buttons">
          <nr-button
            type="default"
            size="small"
            ?disabled=${!hasPrev || this.loading}
            @click=${this.handlePrevPage}
          >Previous</nr-button>
          <nr-button
            type="default"
            size="small"
            ?disabled=${!hasNext || this.loading}
            @click=${this.handleNextPage}
          >Next</nr-button>
        </div>
      </div>
    `;
  }

  private renderDetailPanel() {
    if (!this.selectedLog) return nothing;

    const log = this.selectedLog;
    const jsonData = log.data ? this.formatJson(log.data) : null;

    return html`
      <div class="resize-handle ${this.isResizing ? 'active' : ''}" @mousedown=${this.handleResizeStart}></div>
      <div class="detail-panel" style="width: ${this.detailPanelWidth}px">
        <div class="detail-header">
          <div class="detail-header-left">
            <span class="level-badge ${log.level}">${log.level}</span>
            <h3 class="detail-title">${this.extractMessage(log)}</h3>
          </div>
          <button class="detail-close" @click=${this.handleCloseDetail}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="detail-body">
          <div class="detail-section">
            <h4 class="detail-section-title">Details</h4>
            <div class="detail-fields">
              <div class="detail-field">
                <span class="detail-field-label">Timestamp</span>
                <span class="detail-field-value">${this.formatTimestamp(log.timestamp)}</span>
              </div>
              <div class="detail-field">
                <span class="detail-field-label">Service</span>
                <span class="detail-field-value"><span class="service-tag">${log.service}</span></span>
              </div>
              <div class="detail-field">
                <span class="detail-field-label">Type</span>
                <span class="detail-field-value"><span class="type-tag">${log.type}</span></span>
              </div>
              <div class="detail-field">
                <span class="detail-field-label">Log ID</span>
                <span class="detail-field-value" style="font-family: var(--nuraly-font-mono); font-size: 11px;">${log.id}</span>
              </div>
              ${log.traceId ? html`
                <div class="detail-field">
                  <span class="detail-field-label">Trace ID</span>
                  <span class="detail-field-value" style="font-family: var(--nuraly-font-mono); font-size: 11px;">${log.traceId}</span>
                </div>
              ` : nothing}
              ${log.executionId ? html`
                <div class="detail-field">
                  <span class="detail-field-label">Execution ID</span>
                  <span class="detail-field-value" style="font-family: var(--nuraly-font-mono); font-size: 11px;">${log.executionId}</span>
                </div>
              ` : nothing}
              ${log.workflowId ? html`
                <div class="detail-field">
                  <span class="detail-field-label">Workflow ID</span>
                  <span class="detail-field-value" style="font-family: var(--nuraly-font-mono); font-size: 11px;">${log.workflowId}</span>
                </div>
              ` : nothing}
              ${log.userId ? html`
                <div class="detail-field">
                  <span class="detail-field-label">User ID</span>
                  <span class="detail-field-value">${log.userId}</span>
                </div>
              ` : nothing}
            </div>
          </div>

          ${jsonData ? html`
            <div class="detail-section">
              <h4 class="detail-section-title">Data</h4>
              <div class="json-viewer" .innerHTML=${this.syntaxHighlight(jsonData)}></div>
            </div>
          ` : nothing}
        </div>
      </div>
    `;
  }

  render() {
    return html`
      ${this.renderToolbar()}
      ${this.renderActiveFilters()}
      <div class="journal-content">
        <div class="table-area">
          ${this.renderTable()}
        </div>
        ${this.renderDetailPanel()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dashboard-journal-list': DashboardJournalList;
  }
}
