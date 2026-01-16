/**
 * @license
 * Copyright 2024 Nuraly
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html, css } from 'lit';
import { property, customElement, state } from 'lit/decorators.js';
import { getTables, type TableDTO } from '../../../../../../../redux/store/database.js';
import { getVarValue } from '../../../../../../../redux/store/context.js';

/**
 * Table Select Component for Data Node configuration
 *
 * @fires value-change - Fired when selection changes
 */
@customElement('nr-table-select')
export class NrTableSelect extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    .loading-state {
      padding: 8px 12px;
      color: var(--text-secondary, #6b7280);
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .error-state {
      padding: 8px 12px;
      color: #dc2626;
      font-size: 12px;
    }

    .spinner {
      width: 14px;
      height: 14px;
      border: 2px solid var(--border-color, #e5e7eb);
      border-top-color: var(--primary-color, #6366f1);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;

  @property({ type: String }) connectionPath: string = '';
  @property({ type: String }) schema: string = '';
  @property({ type: String }) value: string = '';
  @property({ type: String }) placeholder: string = 'Select table...';
  @property({ type: Boolean }) disabled: boolean = false;

  @state() private tables: TableDTO[] = [];
  @state() private loading = false;
  // @ts-ignore - Reserved for future error display
  @state() private error = '';

  private getAppId(): string | null {
    const app = getVarValue('global', 'currentEditingApplication') as any;
    return app?.uuid || null;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (this.connectionPath) this.loadTables();
  }

  override updated(changedProperties: Map<string, unknown>): void {
    const connectionChanged = changedProperties.has('connectionPath');
    const schemaChanged = changedProperties.has('schema');

    if (connectionChanged || schemaChanged) {
      const oldPath = changedProperties.get('connectionPath') as string | undefined;
      const oldSchema = changedProperties.get('schema') as string | undefined;

      if ((connectionChanged && oldPath !== undefined && oldPath !== this.connectionPath) ||
          (schemaChanged && oldSchema !== undefined && oldSchema !== this.schema)) {
        this.value = '';
        this.dispatchValueChange('');
      }
      this.loadTables();
    }
  }

  private async loadTables(): Promise<void> {
    const appId = this.getAppId();
    if (!appId || !this.connectionPath) {
      this.tables = [];
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      const tables = await getTables(this.connectionPath, appId, this.schema || undefined);
      this.tables = tables;
    } catch (err: any) {
      console.error('Failed to load tables:', err);
      this.error = err.message || 'Failed to load tables';
      this.tables = [];
    }

    this.loading = false;
  }

  private handleSelectChange(e: CustomEvent): void {
    const value = e.detail?.value || '';
    this.value = value;
    this.dispatchValueChange(value);
  }

  private dispatchValueChange(value: string): void {
    this.dispatchEvent(new CustomEvent('value-change', {
      detail: { value },
      bubbles: true,
      composed: true
    }));
  }

  private getTableTypeLabel(type: string): string {
    return type === 'view' ? 'View' : type === 'collection' ? 'Collection' : 'Table';
  }

  override render() {
    if (!this.connectionPath) {
      return html`
        <nr-select .options=${[]} placeholder="Select connection first..." ?disabled=${true}></nr-select>
      `;
    }

    if (this.loading) {
      return html`
        <nr-select .options=${[]} placeholder="Loading tables..." ?disabled=${true}>
          <div slot="before-options" class="loading-state">
            <div class="spinner"></div>
            <span>Loading tables...</span>
          </div>
        </nr-select>
      `;
    }

    const options = this.tables.map(table => ({
      label: table.name,
      value: table.name,
      description: this.getTableTypeLabel(table.type),
      icon: table.type === 'view' ? 'eye' : 'table'
    }));

    return html`
      <nr-select
        .value=${this.value}
        .options=${options}
        placeholder=${this.placeholder}
        ?disabled=${this.disabled}
        .noOptionsMessage=${'No tables found'}
        searchable
        @nr-change=${this.handleSelectChange}
      ></nr-select>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'nr-table-select': NrTableSelect;
  }
}
