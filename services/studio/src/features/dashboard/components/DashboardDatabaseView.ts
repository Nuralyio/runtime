/**
 * Dashboard Database View Component
 * Simplified view of a database connection
 */

import { html, LitElement, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { getStudioUrl } from '../utils/route-sync';

// Import NuralyUI components
import '../../runtime/components/ui/nuraly-ui/src/components/button';
import '../../runtime/components/ui/nuraly-ui/src/components/badge';
import '../../runtime/components/ui/nuraly-ui/src/components/icon';

@customElement('dashboard-database-view')
export class DashboardDatabaseView extends LitElement {
  static styles = css`
    :host {
      display: block;
      height: 100%;
      background: var(--nuraly-color-background, #f8fafc);
    }

    .database-view {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .database-header {
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

    .database-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .database-name {
      font-size: 18px;
      font-weight: 600;
      color: var(--nuraly-color-text, #0f0f3c);
      margin: 0;
    }

    .database-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 13px;
      color: var(--nuraly-color-text-secondary, #5c5c7a);
    }

    .app-link {
      color: var(--nuraly-color-primary, #14144b);
      cursor: pointer;
      text-decoration: none;
    }

    .app-link:hover {
      text-decoration: underline;
    }

    .database-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      text-align: center;
    }

    .placeholder-icon {
      width: 64px;
      height: 64px;
      color: var(--nuraly-color-text-tertiary, #8c8ca8);
      margin-bottom: 16px;
    }

    .placeholder-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--nuraly-color-text, #0f0f3c);
      margin: 0 0 8px 0;
    }

    .placeholder-text {
      font-size: 14px;
      color: var(--nuraly-color-text-secondary, #5c5c7a);
      margin: 0 0 24px 0;
      max-width: 400px;
    }
  `;

  @property({ type: String }) databaseId: string = '';
  @property({ type: String }) appId: string | null = null;
  @property({ type: String }) appName: string | null = null;

  @state() private loading = false;

  private openInStudio() {
    if (this.appId) {
      const url = getStudioUrl('database', this.databaseId, this.appId);
      if (url) {
        window.location.href = url;
      }
    }
  }

  private goBack() {
    this.dispatchEvent(new CustomEvent('navigate', {
      detail: { path: '/dashboard' },
      bubbles: true,
      composed: true
    }));
  }

  private navigateToApp() {
    if (!this.appId) return;

    this.dispatchEvent(new CustomEvent('navigate', {
      detail: { path: `/dashboard/app/${this.appId}` },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return html`
      <div class="database-view">
        <div class="database-header">
          <div class="header-left">
            <nr-button size="small" variant="secondary" @click=${this.goBack}>
              <nr-icon slot="prefix" name="arrow-left" size="small"></nr-icon>
              Back
            </nr-button>
            <div class="database-info">
              <h2 class="database-name">Database</h2>
              <div class="database-meta">
                ${this.appId ? html`
                  <span class="app-link" @click=${this.navigateToApp}>
                    App: ${this.appName || 'Unknown'}
                  </span>
                ` : html`
                  <span>Standalone database</span>
                `}
              </div>
            </div>
          </div>
          ${this.appId ? html`
            <nr-button type="primary" size="small" @click=${this.openInStudio}>
              Open in Studio
            </nr-button>
          ` : ''}
        </div>

        <div class="database-content">
          <svg class="placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <ellipse cx="12" cy="5" rx="9" ry="3"/>
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
          </svg>
          <h3 class="placeholder-title">Database Viewer</h3>
          <p class="placeholder-text">
            The simplified database viewer is coming soon. For now, please use the full Studio editor to manage database connections, view schemas, and run queries.
          </p>
          ${this.appId ? html`
            <nr-button type="primary" size="small" @click=${this.openInStudio}>
              Open in Studio
            </nr-button>
          ` : ''}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dashboard-database-view': DashboardDatabaseView;
  }
}
