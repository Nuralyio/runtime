/**
 * KV Entries List Component
 * Displays a table of key-value entries across all applications
 */

import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import styles from './KVEntriesList.style';
import { formatDate } from '../../services/dashboard.service';
import type { KvEntry } from '../../../runtime/redux/store/kv';

// Import NuralyUI components
import '../../../runtime/components/ui/nuraly-ui/src/components/button';
import '../../../runtime/components/ui/nuraly-ui/src/components/badge';
import '../../../runtime/components/ui/nuraly-ui/src/components/tag';

// Extended KvEntry with application name
interface KvEntryWithAppName extends KvEntry {
  applicationName?: string;
}

@customElement('kv-entries-list')
export class KVEntriesList extends LitElement {
  static styles = styles;

  @property({ type: Array }) entries: KvEntryWithAppName[] = [];

  private handleEdit(e: Event, entry: KvEntryWithAppName) {
    e.stopPropagation();
    // Navigate to studio with KV modal open
    window.location.href = `/app/studio/${entry.applicationId}?kv=${encodeURIComponent(entry.keyPath)}`;
  }

  private async handleDelete(e: Event, entry: KvEntryWithAppName) {
    e.stopPropagation();

    const confirmed = confirm(`Are you sure you want to delete "${entry.keyPath}"?`);
    if (!confirmed) return;

    // Dispatch delete event
    this.dispatchEvent(new CustomEvent('delete-kv-entry', {
      detail: { applicationId: entry.applicationId, keyPath: entry.keyPath },
      bubbles: true,
      composed: true
    }));
  }

  private getTypeClass(valueType: string): string {
    return valueType.toLowerCase();
  }

  private renderSecretBadge(isSecret: boolean) {
    if (!isSecret) return '';

    return html`
      <nr-badge
        status="warning"
        text="Secret"
      ></nr-badge>
    `;
  }

  private renderEmptyState() {
    return html`
      <div class="empty-state">
        <svg class="empty-state-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
        <h3 class="empty-state-title">No KV entries yet</h3>
        <p class="empty-state-description">
          Key-value entries store configuration and data for your applications.
        </p>
      </div>
    `;
  }

  render() {
    return html`
      ${this.entries.length === 0
        ? this.renderEmptyState()
        : html`
            <table class="kv-table">
              <thead>
                <tr>
                  <th>Key Path</th>
                  <th>Application</th>
                  <th>Type</th>
                  <th>Scope</th>
                  <th>Secret</th>
                  <th>Updated</th>
                  <th style="text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${this.entries.map(entry => html`
                  <tr>
                    <td>
                      <code class="key-path">${entry.keyPath}</code>
                    </td>
                    <td>
                      <span class="app-badge">${entry.applicationName || 'Unknown'}</span>
                    </td>
                    <td>
                      <span class="type-badge ${this.getTypeClass(entry.valueType)}">
                        ${entry.valueType}
                      </span>
                    </td>
                    <td>
                      ${entry.scope
                        ? html`<span class="scope-badge">${entry.scope}</span>`
                        : html`<span style="color: var(--nuraly-color-text-tertiary, #9ca3af);">Global</span>`
                      }
                    </td>
                    <td>
                      ${this.renderSecretBadge(entry.isSecret)}
                    </td>
                    <td>${formatDate(entry.updatedAt)}</td>
                    <td>
                      <div class="actions-cell">
                        <nr-button
                          type="default"
                          size="small"
                          iconLeft="Pencil"
                          title="Edit entry"
                          @click=${(e: Event) => this.handleEdit(e, entry)}
                        >Edit</nr-button>
                        <nr-button
                          type="danger"
                          size="small"
                          iconLeft="Trash2"
                          title="Delete entry"
                          @click=${(e: Event) => this.handleDelete(e, entry)}
                        >Delete</nr-button>
                      </div>
                    </td>
                  </tr>
                `)}
              </tbody>
            </table>
          `
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'kv-entries-list': KVEntriesList;
  }
}
