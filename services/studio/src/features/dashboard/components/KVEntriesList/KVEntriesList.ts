/**
 * KV Entries List Component
 * Displays a table of key-value entries across all applications
 */

import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import styles from './KVEntriesList.style';
import { formatDate } from '../../services/dashboard.service';
import type { KvEntry } from '../../../runtime/redux/store/kv';
import type { IHeader } from '../../../runtime/components/ui/nuraly-ui/src/components/table/table.types';

// Import NuralyUI components
import '../../../runtime/components/ui/nuraly-ui/src/components/button';
import '../../../runtime/components/ui/nuraly-ui/src/components/badge';
import '../../../runtime/components/ui/nuraly-ui/src/components/tag';
import '../../../runtime/components/ui/nuraly-ui/src/components/table';

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

  private handleRowClick(entry: KvEntryWithAppName) {
    // Navigate to studio with KV modal open
    window.location.href = `/app/studio/${entry.applicationId}?kv=${encodeURIComponent(entry.keyPath)}`;
  }

  private getTypeColor(type: string): { bg: string; color: string } {
    const colors: Record<string, { bg: string; color: string }> = {
      string: { bg: '#dbeafe', color: '#2563eb' },
      json: { bg: '#fef3c7', color: '#d97706' },
      number: { bg: '#dcfce7', color: '#16a34a' },
      boolean: { bg: '#fee2e2', color: '#dc2626' },
      binary: { bg: '#f3e8ff', color: '#7c3aed' },
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
        render: (value: string) => html`
          <span style="
            display: inline-flex;
            align-items: center;
            padding: 3px 8px;
            background: #f1f5f9;
            border-radius: 4px;
            font-size: 12px;
            color: #5c5c7a;
          ">${value || 'Unknown'}</span>
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
        width: 120,
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
        width: 140,
        render: (value: string) => html`<span style="color: #5c5c7a; font-size: 13px;">${formatDate(value)}</span>`,
      },
      {
        name: 'Actions',
        key: 'actions',
        width: 160,
        render: (_value: any, row: KvEntryWithAppName) => html`
          <div style="display: flex; gap: 6px; justify-content: flex-end;">
            <nr-button
              type="default"
              size="small"
              iconLeft="Pencil"
              title="Edit entry"
              @click=${(e: Event) => this.handleEdit(e, row)}
            >Edit</nr-button>
            <nr-button
              type="danger"
              size="small"
              iconLeft="Trash2"
              title="Delete entry"
              @click=${(e: Event) => this.handleDelete(e, row)}
            >Delete</nr-button>
          </div>
        `,
      },
    ];
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
            <div class="table-container">
              <nr-table
                .headers=${this.getTableHeaders()}
                .rows=${this.entries}
                size="small"
                pageSize=${10}
                emptyText="No KV entries found"
                clickable
                @nr-row-click=${(e: CustomEvent) => this.handleRowClick(e.detail.row)}
              ></nr-table>
            </div>
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
