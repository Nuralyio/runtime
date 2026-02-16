/**
 * Dashboard Database List Component
 * Shows database connections from KV store (keys starting with database/)
 */

import { html, LitElement, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { DatabaseConnection } from '../../services/dashboard.service';
import { testConnectionFromKv } from '../../../runtime/redux/store/database';

import '../../../runtime/components/ui/nuraly-ui/src/components/button';

interface ConnectionStatus {
  status: 'idle' | 'testing' | 'success' | 'error';
  message?: string;
}

@customElement('dashboard-database-list')
export class DashboardDatabaseList extends LitElement {
  static styles = css`
    :host {
      display: block;
      height: 100%;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior: contain;
    }

    .database-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }

    .database-card {
      background: var(--nuraly-color-surface, #ffffff);
      border: 1px solid var(--nuraly-color-border, #e8e8f0);
      border-radius: 8px;
      padding: 16px;
      cursor: pointer;
      transition: box-shadow 0.15s ease, border-color 0.15s ease;
    }

    .database-card:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      border-color: var(--nuraly-color-primary, #14144b);
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .db-icon {
      width: 40px;
      height: 40px;
      background: var(--nuraly-color-primary-bg, #f0f0f8);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--nuraly-color-primary, #14144b);
      flex-shrink: 0;
    }

    .db-icon svg {
      width: 20px;
      height: 20px;
    }

    .card-title {
      flex: 1;
      min-width: 0;
    }

    .card-title h3 {
      font-size: 14px;
      font-weight: 500;
      color: var(--nuraly-color-text, #0f0f3c);
      margin: 0 0 2px 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .card-title span {
      font-size: 12px;
      color: var(--nuraly-color-text-tertiary, #8c8ca8);
    }

    .card-actions {
      display: flex;
      gap: 4px;
      flex-shrink: 0;
    }

    .action-btn {
      width: 28px;
      height: 28px;
      border: none;
      background: transparent;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--nuraly-color-text-tertiary, #8c8ca8);
      transition: all 0.15s ease;
    }

    .action-btn:hover {
      background: var(--nuraly-color-background-hover, #f1f5f9);
      color: var(--nuraly-color-text, #0f0f3c);
    }

    .action-btn.test:hover {
      color: var(--nuraly-color-primary, #14144b);
    }

    .action-btn.edit:hover {
      color: #2563eb;
    }

    .action-btn.delete:hover {
      color: #dc2626;
    }

    .action-btn svg {
      width: 14px;
      height: 14px;
    }

    .action-btn.testing {
      animation: pulse 1s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 12px;
      border-top: 1px solid var(--nuraly-color-border-subtle, #f1f3f5);
    }

    .key-path {
      font-size: 11px;
      color: var(--nuraly-color-text-tertiary, #8c8ca8);
      font-family: monospace;
      margin-top: 8px;
      padding: 4px 8px;
      background: var(--nuraly-color-surface-secondary, #f8fafc);
      border-radius: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .app-name {
      font-size: 10px;
      color: var(--nuraly-color-text-tertiary, #8c8ca8);
      margin-top: 4px;
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .status-dot.idle {
      background: #d1d5db;
    }

    .status-dot.testing {
      background: #f59e0b;
      animation: pulse 1s infinite;
    }

    .status-dot.success {
      background: #22c55e;
    }

    .status-dot.error {
      background: #ef4444;
    }

    .status-text {
      color: var(--nuraly-color-text-tertiary, #8c8ca8);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }

    .empty-icon {
      width: 48px;
      height: 48px;
      color: var(--nuraly-color-text-tertiary, #8c8ca8);
      margin-bottom: 16px;
    }

    .empty-title {
      font-size: 14px;
      font-weight: 500;
      color: var(--nuraly-color-text, #0f0f3c);
      margin: 0 0 4px 0;
    }

    .empty-text {
      font-size: 13px;
      color: var(--nuraly-color-text-tertiary, #8c8ca8);
      margin: 0;
    }
  `;

  @property({ type: Array }) databases: DatabaseConnection[] = [];
  @state() private connectionStatuses = new Map<string, ConnectionStatus>();

  private getDatabaseIcon() {
    return html`
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <ellipse cx="12" cy="5" rx="9" ry="3"/>
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
      </svg>
    `;
  }

  private handleCardClick(db: DatabaseConnection) {
    this.dispatchEvent(new CustomEvent('database-select', {
      detail: { database: db },
      bubbles: true,
      composed: true
    }));
  }

  private async handleTest(e: Event, db: DatabaseConnection) {
    e.stopPropagation();
    const key = db.keyPath;
    this.connectionStatuses = new Map(this.connectionStatuses.set(key, { status: 'testing' }));

    const result = await testConnectionFromKv(db.keyPath, db.applicationId);

    this.connectionStatuses = new Map(this.connectionStatuses.set(key, {
      status: result.success ? 'success' : 'error',
      message: result.success ? 'Connected' : (result.error || 'Failed'),
    }));
  }

  private handleEdit(e: Event, db: DatabaseConnection) {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent('database-edit', {
      detail: { database: db },
      bubbles: true,
      composed: true
    }));
  }

  private handleDelete(e: Event, db: DatabaseConnection) {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent('database-delete', {
      detail: { database: db },
      bubbles: true,
      composed: true
    }));
  }

  private getStatus(keyPath: string): ConnectionStatus {
    return this.connectionStatuses.get(keyPath) || { status: 'idle' };
  }

  private renderStatusIndicator(keyPath: string) {
    const cs = this.getStatus(keyPath);
    if (cs.status === 'idle') return nothing;

    const labels: Record<string, string> = {
      testing: 'Testing...',
      success: 'Connected',
      error: cs.message || 'Failed',
    };

    return html`
      <div class="status-indicator">
        <span class="status-dot ${cs.status}"></span>
        <span class="status-text">${labels[cs.status]}</span>
      </div>
    `;
  }

  render() {
    if (this.databases.length === 0) {
      return html`
        <div class="empty-state">
          <svg class="empty-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <ellipse cx="12" cy="5" rx="9" ry="3"/>
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
          </svg>
          <h3 class="empty-title">No database connections</h3>
          <p class="empty-text">Create a connection to get started</p>
        </div>
      `;
    }

    return html`
      <div class="database-grid">
        ${this.databases.map(db => html`
          <div class="database-card" @click=${() => this.handleCardClick(db)}>
            <div class="card-header">
              <div class="db-icon">${this.getDatabaseIcon()}</div>
              <div class="card-title">
                <h3>${db.name}</h3>
                <span>${db.type}</span>
              </div>
              <div class="card-actions">
                <button
                  class="action-btn test ${this.getStatus(db.keyPath).status === 'testing' ? 'testing' : ''}"
                  title="Test Connection"
                  @click=${(e: Event) => this.handleTest(e, db)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                </button>
                <button
                  class="action-btn edit"
                  title="Edit Connection"
                  @click=${(e: Event) => this.handleEdit(e, db)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button
                  class="action-btn delete"
                  title="Delete Connection"
                  @click=${(e: Event) => this.handleDelete(e, db)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            </div>
            <div class="key-path">${db.keyPath}</div>
            ${db.applicationName ? html`
              <div class="app-name">App: ${db.applicationName}</div>
            ` : ''}
            <div class="card-footer">
              ${this.renderStatusIndicator(db.keyPath)}
            </div>
          </div>
        `)}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dashboard-database-list': DashboardDatabaseList;
  }
}
