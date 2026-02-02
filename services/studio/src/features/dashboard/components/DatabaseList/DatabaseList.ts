/**
 * Dashboard Database List Component
 * Shows database connections from KV store (keys starting with database/)
 */

import { html, LitElement, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { DatabaseConnection } from '../../services/dashboard.service';

import '../../../runtime/components/ui/nuraly-ui/src/components/button';

@customElement('dashboard-database-list')
export class DashboardDatabaseList extends LitElement {
  static styles = css`
    :host {
      display: block;
      height: 100%;
      overflow: auto;
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

    .card-stats {
      display: flex;
      gap: 16px;
      padding-top: 12px;
      border-top: 1px solid var(--nuraly-color-border-subtle, #f1f3f5);
    }

    .stat {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 16px;
      font-weight: 600;
      color: var(--nuraly-color-text, #0f0f3c);
    }

    .stat-label {
      font-size: 11px;
      color: var(--nuraly-color-text-tertiary, #8c8ca8);
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
          <p class="empty-text">Add database connections in KV store with keys starting with database/</p>
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
            </div>
            <div class="key-path">${db.keyPath}</div>
            ${db.applicationName ? html`
              <div class="app-name">App: ${db.applicationName}</div>
            ` : ''}
            <div class="card-stats">
              <div class="stat">
                <span class="stat-value">--</span>
                <span class="stat-label">Tables</span>
              </div>
              <div class="stat">
                <span class="stat-value">--</span>
                <span class="stat-label">Size</span>
              </div>
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
