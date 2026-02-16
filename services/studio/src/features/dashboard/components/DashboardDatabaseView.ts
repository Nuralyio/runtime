/**
 * Dashboard Database View Component
 * Embeds the full <database-page> canvas, setting $currentApplication
 * so the database page can resolve the appId it needs.
 *
 * The route param (databaseId) is the KV entry ID of a database connection.
 * We fetch all connections, find the one matching that ID, derive its
 * applicationId, and set $currentApplication before rendering <database-page>.
 */

import { html, LitElement, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { $currentApplication } from '../../runtime/redux/store/apps';
import { fetchAllDatabaseConnections, type DatabaseConnection } from '../services/dashboard.service';

// Import the full database-page component
import '../../studio/params/database/Database';

// Import NuralyUI components used in the header
import '../../runtime/components/ui/nuraly-ui/src/components/button';
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

    .database-canvas {
      flex: 1;
      overflow: hidden;
    }

    database-page {
      display: block;
      width: 100%;
      height: 100%;
    }

    .loading-container {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--nuraly-color-border, #e8e8f0);
      border-top-color: var(--nuraly-color-primary, #14144b);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--nuraly-color-text-secondary, #5c5c7a);
      gap: 12px;
    }

    .error-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--nuraly-color-text, #0f0f3c);
    }
  `;

  @property({ type: String }) databaseId: string = '';

  @state() private loading = true;
  @state() private error: string = '';
  @state() private connectionName: string = '';
  @state() private appName: string = '';

  private previousApplication: any = null;

  override connectedCallback() {
    super.connectedCallback();
    this.setupFromConnection();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    // Restore previous $currentApplication to avoid polluting global state
    $currentApplication.set(this.previousApplication);
  }

  override updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('databaseId') && changedProperties.get('databaseId') !== undefined) {
      this.setupFromConnection();
    }
  }

  private async setupFromConnection() {
    const connectionId = this.databaseId;
    if (!connectionId) {
      this.loading = false;
      this.error = 'No connection ID provided';
      return;
    }

    this.loading = true;
    this.error = '';

    // Save previous value so we can restore on disconnect
    this.previousApplication = $currentApplication.get();

    try {
      // Fetch all database connections and find ours by ID
      const connections = await fetchAllDatabaseConnections({});
      const connection = connections.find(c => c.id === connectionId);

      if (!connection) {
        this.error = 'Database connection not found';
        this.loading = false;
        return;
      }

      this.connectionName = connection.name;
      this.appName = connection.applicationName || connection.applicationId;

      // Set $currentApplication so <database-page> can read the appId
      $currentApplication.set({ uuid: connection.applicationId, name: this.appName });
    } catch (e) {
      console.error('Failed to load database connection:', e);
      this.error = 'Failed to load connection';
    }

    this.loading = false;
  }

  private goBack() {
    this.dispatchEvent(new CustomEvent('navigate', {
      detail: { path: '/dashboard' },
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
              <h2 class="database-name">Database — ${this.connectionName || 'Loading...'}</h2>
              <div class="database-meta">
                <span>App: ${this.appName || 'Loading...'}</span>
              </div>
            </div>
          </div>
        </div>

        ${this.loading ? html`
          <div class="loading-container">
            <div class="loading-spinner"></div>
          </div>
        ` : this.error ? html`
          <div class="error-container">
            <span class="error-title">${this.error}</span>
            <nr-button size="small" variant="secondary" @click=${this.goBack}>
              Return to Dashboard
            </nr-button>
          </div>
        ` : html`
          <div class="database-canvas">
            <database-page></database-page>
          </div>
        `}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dashboard-database-view': DashboardDatabaseView;
  }
}
