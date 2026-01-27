import { customElement, state } from "lit/decorators.js";
import { html, LitElement, css } from "lit";
import "../../../runtime/components/ui/nuraly-ui/src/components/select/select.component";
import "../../../runtime/components/ui/nuraly-ui/src/components/table/table.component";
import type { JournalLogEntry } from "../../../../services/journal.service";
import {
  $journalState,
  queryLogs,
  setFilters,
  clearFilters,
  loadStats,
  selectLog,
  startStreaming,
  stopStreaming,
  resetJournalState,
  type JournalFilters,
} from "../../../runtime/redux/store/journal";

@customElement("journal-page")
export class JournalPage extends LitElement {
  static override styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      position: relative;
    }

    .journal-container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: var(--n-color-surface-secondary, #f9fafb);
    }

    .journal-toolbar {
      display: flex;
      flex-direction: column;
      padding: 12px 16px;
      background: var(--n-color-surface, #fff);
      border-bottom: 1px solid var(--n-color-border, #e5e7eb);
      gap: 12px;
    }

    .toolbar-row {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .toolbar-row-left {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      flex-wrap: wrap;
    }

    .toolbar-row-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    nr-select {
      min-width: 140px;
    }

    .search-input {
      padding: 6px 12px;
      border: 1px solid var(--n-color-border, #e5e7eb);
      border-radius: 6px;
      font-size: 13px;
      min-width: 200px;
      outline: none;
    }

    .search-input:focus {
      border-color: var(--n-color-primary, #3b82f6);
      box-shadow: 0 0 0 2px var(--n-color-primary-bg, #eff6ff);
    }

    .streaming-toggle {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 13px;
      cursor: pointer;
      border: 1px solid var(--n-color-border, #e5e7eb);
      background: var(--n-color-surface, #fff);
      transition: all 0.15s ease;
    }

    .streaming-toggle.active {
      background: var(--n-color-error-bg, #fef2f2);
      border-color: var(--n-color-error, #ef4444);
      color: var(--n-color-error, #ef4444);
    }

    .streaming-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--n-color-text-muted, #9ca3af);
    }

    .streaming-toggle.active .streaming-dot {
      background: var(--n-color-error, #ef4444);
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .toolbar-button {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition: all 0.15s ease;
    }

    .toolbar-button.secondary {
      background: var(--n-color-surface, #fff);
      color: var(--n-color-text, #111827);
      border: 1px solid var(--n-color-border, #e5e7eb);
    }

    .toolbar-button.secondary:hover {
      background: var(--n-color-surface-hover, #f9fafb);
    }

    .toolbar-button.secondary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .stats-bar {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 8px 16px;
      background: var(--n-color-surface-secondary, #f9fafb);
      border-bottom: 1px solid var(--n-color-border, #e5e7eb);
      font-size: 12px;
      color: var(--n-color-text-muted, #6b7280);
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .stat-value {
      font-weight: 600;
      color: var(--n-color-text, #111827);
    }

    .stat-value.error {
      color: var(--n-color-error, #ef4444);
    }

    .stat-value.warning {
      color: var(--n-color-warning, #f59e0b);
    }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .logs-container {
      flex: 1;
      overflow: auto;
      padding: 0;
    }

    .log-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    .log-table th {
      text-align: left;
      padding: 10px 12px;
      background: var(--n-color-surface, #fff);
      border-bottom: 1px solid var(--n-color-border, #e5e7eb);
      font-weight: 600;
      color: var(--n-color-text-muted, #6b7280);
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .log-table td {
      padding: 10px 12px;
      border-bottom: 1px solid var(--n-color-border-light, #f3f4f6);
      vertical-align: top;
    }

    .log-table tr {
      background: var(--n-color-surface, #fff);
      cursor: pointer;
      transition: background 0.1s ease;
    }

    .log-table tr:hover {
      background: var(--n-color-surface-hover, #f9fafb);
    }

    .log-table tr.selected {
      background: var(--n-color-primary-bg, #eff6ff);
    }

    .log-time {
      font-family: monospace;
      font-size: 12px;
      color: var(--n-color-text-muted, #6b7280);
      white-space: nowrap;
    }

    .log-service {
      font-weight: 500;
    }

    .log-level {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .log-level.DEBUG {
      background: var(--n-color-surface-secondary, #f3f4f6);
      color: var(--n-color-text-muted, #6b7280);
    }

    .log-level.INFO {
      background: var(--n-color-info-bg, #eff6ff);
      color: var(--n-color-info, #3b82f6);
    }

    .log-level.WARN {
      background: var(--n-color-warning-bg, #fffbeb);
      color: var(--n-color-warning, #f59e0b);
    }

    .log-level.ERROR {
      background: var(--n-color-error-bg, #fef2f2);
      color: var(--n-color-error, #ef4444);
    }

    .log-message {
      max-width: 400px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .log-detail-panel {
      background: var(--n-color-surface, #fff);
      border-top: 1px solid var(--n-color-border, #e5e7eb);
      max-height: 300px;
      overflow: auto;
    }

    .log-detail-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid var(--n-color-border, #e5e7eb);
      font-weight: 600;
      font-size: 13px;
    }

    .log-detail-content {
      padding: 16px;
    }

    .log-detail-row {
      display: flex;
      margin-bottom: 8px;
    }

    .log-detail-label {
      width: 120px;
      font-weight: 500;
      color: var(--n-color-text-muted, #6b7280);
      flex-shrink: 0;
    }

    .log-detail-value {
      flex: 1;
      word-break: break-all;
    }

    .log-detail-json {
      background: var(--n-color-surface-secondary, #f9fafb);
      border: 1px solid var(--n-color-border, #e5e7eb);
      border-radius: 6px;
      padding: 12px;
      font-family: monospace;
      font-size: 12px;
      overflow-x: auto;
      white-space: pre-wrap;
      margin-top: 12px;
    }

    .close-button {
      background: none;
      border: none;
      padding: 4px;
      cursor: pointer;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--n-color-text-muted, #6b7280);
    }

    .close-button:hover {
      background: var(--n-color-surface-hover, #f3f4f6);
      color: var(--n-color-text, #111827);
    }

    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 16px;
      background: var(--n-color-surface, #fff);
      border-top: 1px solid var(--n-color-border, #e5e7eb);
    }

    .pagination-info {
      font-size: 13px;
      color: var(--n-color-text-muted, #6b7280);
    }

    .pagination-button {
      padding: 6px 12px;
      border: 1px solid var(--n-color-border, #e5e7eb);
      border-radius: 4px;
      background: var(--n-color-surface, #fff);
      font-size: 13px;
      cursor: pointer;
    }

    .pagination-button:hover:not(:disabled) {
      background: var(--n-color-surface-hover, #f9fafb);
    }

    .pagination-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.8);
      z-index: 100;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--n-color-border, #e5e7eb);
      border-top-color: var(--n-color-primary, #3b82f6);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .empty-state {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--n-color-text-muted, #6b7280);
      padding: 48px;
      text-align: center;
    }

    .empty-state-icon {
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.4;
    }

    .empty-state-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--n-color-text, #111827);
      margin-bottom: 8px;
    }

    .empty-state-text {
      font-size: 14px;
      max-width: 400px;
    }

    .error-message {
      color: var(--n-color-error, #ef4444);
      padding: 12px 16px;
      background: var(--n-color-error-bg, #fef2f2);
      border-bottom: 1px solid var(--n-color-error, #ef4444);
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .error-message svg {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
    }
  `;

  @state()
  private logs: JournalLogEntry[] = [];

  @state()
  private total = 0;

  @state()
  private offset = 0;

  @state()
  private limit = 50;

  @state()
  private loading = false;

  @state()
  private error: string | null = null;

  @state()
  private filters: JournalFilters = {};

  @state()
  private streaming = false;

  @state()
  private selectedLogId: string | null = null;

  @state()
  private stats: { totalLogs: number; errorCount: number; warnCount: number } | null = null;

  @state()
  private searchValue = "";

  private unsubscribe: (() => void) | null = null;
  private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  override connectedCallback() {
    super.connectedCallback();
    this.loadLogs();
    this.loadStatsData();

    this.unsubscribe = $journalState.subscribe((state) => {
      this.logs = state.logs;
      this.total = state.total;
      this.offset = state.offset;
      this.limit = state.limit;
      this.loading = state.loading;
      this.error = state.error;
      this.filters = state.filters;
      this.streaming = state.streaming;
      this.selectedLogId = state.selectedLogId;
      this.stats = state.stats;
    });
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    if (this.unsubscribe) this.unsubscribe();
    if (this.searchDebounceTimer) clearTimeout(this.searchDebounceTimer);
    resetJournalState();
  }

  private async loadLogs() {
    await queryLogs({ offset: 0, limit: this.limit });
  }

  private async loadStatsData() {
    await loadStats();
  }

  private handleFilterChange(key: keyof JournalFilters, value: string | undefined) {
    const newFilters = { ...this.filters };
    if (value) {
      newFilters[key] = value;
    } else {
      delete newFilters[key];
    }
    setFilters(newFilters);
  }

  private handleSearchInput(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    this.searchValue = value;

    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }

    this.searchDebounceTimer = setTimeout(() => {
      this.handleFilterChange("dataQuery", value || undefined);
    }, 300);
  }

  private handleClearFilters() {
    this.searchValue = "";
    clearFilters();
  }

  private handleRefresh() {
    this.loadLogs();
    this.loadStatsData();
  }

  private handleToggleStreaming() {
    if (this.streaming) {
      stopStreaming();
    } else {
      // Build filter string from current filters
      let filter = "";
      if (this.filters.service) {
        filter = this.filters.service;
      } else if (this.filters.type) {
        filter = `type:${this.filters.type}`;
      } else if (this.filters.level) {
        filter = `level:${this.filters.level}`;
      }
      startStreaming(filter || undefined);
    }
  }

  private handleLogClick(log: JournalLogEntry) {
    selectLog(this.selectedLogId === log.id ? null : log.id);
  }

  private handleCloseDetail() {
    selectLog(null);
  }

  private handlePreviousPage() {
    if (this.offset > 0) {
      const newOffset = Math.max(0, this.offset - this.limit);
      queryLogs({ offset: newOffset, limit: this.limit });
    }
  }

  private handleNextPage() {
    if (this.offset + this.limit < this.total) {
      const newOffset = this.offset + this.limit;
      queryLogs({ offset: newOffset, limit: this.limit });
    }
  }

  private formatTimestamp(timestamp: string): string {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    } catch {
      return timestamp;
    }
  }

  // Service-specific log types mapping
  private readonly serviceTypeMap: Record<string, { value: string; label: string }[]> = {
    workflows: [
      { value: "execution", label: "Execution" },
      { value: "node", label: "Node" },
      { value: "error", label: "Error" },
      { value: "trigger", label: "Trigger" },
    ],
    api: [
      { value: "request", label: "Request" },
      { value: "response", label: "Response" },
      { value: "error", label: "Error" },
      { value: "auth", label: "Authentication" },
    ],
    gateway: [
      { value: "request", label: "Request" },
      { value: "proxy", label: "Proxy" },
      { value: "error", label: "Error" },
      { value: "auth", label: "Authentication" },
    ],
    studio: [
      { value: "action", label: "Action" },
      { value: "navigation", label: "Navigation" },
      { value: "error", label: "Error" },
    ],
    functions: [
      { value: "execution", label: "Execution" },
      { value: "invoke", label: "Invoke" },
      { value: "error", label: "Error" },
      { value: "deploy", label: "Deploy" },
    ],
    kv: [
      { value: "read", label: "Read" },
      { value: "write", label: "Write" },
      { value: "delete", label: "Delete" },
      { value: "error", label: "Error" },
    ],
  };

  private get serviceOptions(): { value: string; label: string }[] {
    return [
      { value: "", label: "All Services" },
      { value: "workflows", label: "Workflows" },
      { value: "api", label: "API" },
      { value: "gateway", label: "Gateway" },
      { value: "studio", label: "Studio" },
      { value: "functions", label: "Functions" },
      { value: "kv", label: "KV Storage" },
    ];
  }

  private get typeOptions(): { value: string; label: string }[] {
    const selectedService = this.filters.service;

    // If no service selected, show all common types
    if (!selectedService) {
      return [
        { value: "", label: "All Types" },
        { value: "execution", label: "Execution" },
        { value: "request", label: "Request" },
        { value: "node", label: "Node" },
        { value: "error", label: "Error" },
        { value: "system", label: "System" },
      ];
    }

    // Return service-specific types
    const serviceTypes = this.serviceTypeMap[selectedService] || [];
    return [
      { value: "", label: "All Types" },
      ...serviceTypes,
    ];
  }

  private handleServiceChange(value: string | undefined) {
    const newFilters = { ...this.filters };

    if (value) {
      newFilters.service = value;
    } else {
      delete newFilters.service;
    }

    // Clear type filter if it's not valid for the new service
    if (newFilters.type && value) {
      const validTypes = this.serviceTypeMap[value]?.map(t => t.value) || [];
      if (!validTypes.includes(newFilters.type)) {
        delete newFilters.type;
      }
    }

    setFilters(newFilters);
  }

  private get levelOptions(): SelectOption[] {
    return [
      { value: "", label: "All Levels" },
      { value: "DEBUG", label: "Debug" },
      { value: "INFO", label: "Info" },
      { value: "WARN", label: "Warning" },
      { value: "ERROR", label: "Error" },
    ];
  }

  private get selectedLog(): JournalLogEntry | undefined {
    return this.logs.find((log) => log.id === this.selectedLogId);
  }

  private get currentPage(): number {
    return Math.floor(this.offset / this.limit) + 1;
  }

  private get totalPages(): number {
    return Math.ceil(this.total / this.limit);
  }

  override render() {
    return html`
      <div class="journal-container">
        <div class="journal-toolbar">
          <div class="toolbar-row">
            <div class="toolbar-row-left">
              <nr-select
                .options=${this.serviceOptions}
                .value=${this.filters.service || ""}
                placeholder="Service"
                size="small"
                @nr-change=${(e: CustomEvent) =>
                  this.handleServiceChange(e.detail?.value || undefined)}
              ></nr-select>

              <nr-select
                .options=${this.typeOptions}
                .value=${this.filters.type || ""}
                placeholder="Type"
                size="small"
                @nr-change=${(e: CustomEvent) =>
                  this.handleFilterChange("type", e.detail?.value || undefined)}
              ></nr-select>

              <nr-select
                .options=${this.levelOptions}
                .value=${this.filters.level || ""}
                placeholder="Level"
                size="small"
                @nr-change=${(e: CustomEvent) =>
                  this.handleFilterChange("level", e.detail?.value || undefined)}
              ></nr-select>

              <input
                type="text"
                class="search-input"
                placeholder="Search logs..."
                .value=${this.searchValue}
                @input=${this.handleSearchInput}
              />
            </div>

            <div class="toolbar-row-right">
              <button
                class="streaming-toggle ${this.streaming ? "active" : ""}"
                @click=${this.handleToggleStreaming}
              >
                <span class="streaming-dot"></span>
                Streaming: ${this.streaming ? "ON" : "OFF"}
              </button>

              <button
                class="toolbar-button secondary"
                @click=${this.handleRefresh}
                ?disabled=${this.loading}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>

              <button
                class="toolbar-button secondary"
                @click=${this.handleClearFilters}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        ${this.stats
          ? html`
              <div class="stats-bar">
                <div class="stat-item">
                  <span>Total:</span>
                  <span class="stat-value">${this.stats.totalLogs.toLocaleString()}</span>
                </div>
                ${this.stats.errorCount > 0
                  ? html`
                      <div class="stat-item">
                        <span>Errors:</span>
                        <span class="stat-value error">${this.stats.errorCount.toLocaleString()}</span>
                      </div>
                    `
                  : ""}
                ${this.stats.warnCount > 0
                  ? html`
                      <div class="stat-item">
                        <span>Warnings:</span>
                        <span class="stat-value warning">${this.stats.warnCount.toLocaleString()}</span>
                      </div>
                    `
                  : ""}
              </div>
            `
          : ""}

        ${this.error
          ? html`
              <div class="error-message">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                ${this.error}
              </div>
            `
          : ""}

        <div class="main-content">
          ${this.loading && this.logs.length === 0
            ? html`
                <div class="loading-overlay">
                  <div class="loading-spinner"></div>
                </div>
              `
            : this.logs.length === 0
            ? html`
                <div class="empty-state">
                  <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div class="empty-state-title">No Logs Found</div>
                  <div class="empty-state-text">
                    ${Object.keys(this.filters).length > 0
                      ? "No logs match your current filters. Try adjusting your search criteria."
                      : "No logs have been recorded yet. Logs will appear here as your application runs."}
                  </div>
                </div>
              `
            : html`
                <div class="logs-container">
                  <table class="log-table">
                    <thead>
                      <tr>
                        <th style="width: 90px;">Time</th>
                        <th style="width: 100px;">Service</th>
                        <th style="width: 90px;">Type</th>
                        <th style="width: 70px;">Level</th>
                        <th>Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${this.logs.map(
                        (log) => html`
                          <tr
                            class="${this.selectedLogId === log.id ? "selected" : ""}"
                            @click=${() => this.handleLogClick(log)}
                          >
                            <td class="log-time">${this.formatTimestamp(log.timestamp)}</td>
                            <td class="log-service">${log.service}</td>
                            <td>${log.type}</td>
                            <td>
                              <span class="log-level ${log.level}">${log.level}</span>
                            </td>
                            <td class="log-message">${log.message}</td>
                          </tr>
                        `
                      )}
                    </tbody>
                  </table>
                </div>
              `}

          ${this.selectedLog
            ? html`
                <div class="log-detail-panel">
                  <div class="log-detail-header">
                    <span>Log Details</span>
                    <button class="close-button" @click=${this.handleCloseDetail}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div class="log-detail-content">
                    <div class="log-detail-row">
                      <span class="log-detail-label">ID:</span>
                      <span class="log-detail-value">${this.selectedLog.id}</span>
                    </div>
                    <div class="log-detail-row">
                      <span class="log-detail-label">Timestamp:</span>
                      <span class="log-detail-value">${this.selectedLog.timestamp}</span>
                    </div>
                    <div class="log-detail-row">
                      <span class="log-detail-label">Service:</span>
                      <span class="log-detail-value">${this.selectedLog.service}</span>
                    </div>
                    <div class="log-detail-row">
                      <span class="log-detail-label">Type:</span>
                      <span class="log-detail-value">${this.selectedLog.type}</span>
                    </div>
                    <div class="log-detail-row">
                      <span class="log-detail-label">Level:</span>
                      <span class="log-detail-value">
                        <span class="log-level ${this.selectedLog.level}">${this.selectedLog.level}</span>
                      </span>
                    </div>
                    <div class="log-detail-row">
                      <span class="log-detail-label">Message:</span>
                      <span class="log-detail-value">${this.selectedLog.message}</span>
                    </div>
                    ${this.selectedLog.executionId
                      ? html`
                          <div class="log-detail-row">
                            <span class="log-detail-label">Execution ID:</span>
                            <span class="log-detail-value">${this.selectedLog.executionId}</span>
                          </div>
                        `
                      : ""}
                    ${this.selectedLog.workflowId
                      ? html`
                          <div class="log-detail-row">
                            <span class="log-detail-label">Workflow ID:</span>
                            <span class="log-detail-value">${this.selectedLog.workflowId}</span>
                          </div>
                        `
                      : ""}
                    ${this.selectedLog.nodeId
                      ? html`
                          <div class="log-detail-row">
                            <span class="log-detail-label">Node ID:</span>
                            <span class="log-detail-value">${this.selectedLog.nodeId}</span>
                          </div>
                        `
                      : ""}
                    ${this.selectedLog.traceId
                      ? html`
                          <div class="log-detail-row">
                            <span class="log-detail-label">Trace ID:</span>
                            <span class="log-detail-value">${this.selectedLog.traceId}</span>
                          </div>
                        `
                      : ""}
                    ${this.selectedLog.data
                      ? html`
                          <div class="log-detail-json">
                            ${JSON.stringify(this.selectedLog.data, null, 2)}
                          </div>
                        `
                      : ""}
                  </div>
                </div>
              `
            : ""}
        </div>

        ${this.logs.length > 0
          ? html`
              <div class="pagination">
                <button
                  class="pagination-button"
                  @click=${this.handlePreviousPage}
                  ?disabled=${this.offset === 0 || this.loading}
                >
                  &lt; Previous
                </button>
                <span class="pagination-info">
                  Page ${this.currentPage} of ${this.totalPages}
                </span>
                <button
                  class="pagination-button"
                  @click=${this.handleNextPage}
                  ?disabled=${this.offset + this.limit >= this.total || this.loading}
                >
                  Next &gt;
                </button>
              </div>
            `
          : ""}
      </div>
    `;
  }
}
