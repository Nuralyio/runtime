/**
 * @license
 * Copyright 2024 Nuraly
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html, css } from 'lit';
import { property, customElement, state } from 'lit/decorators.js';
import { getSchemas, type SchemaDTO } from '../../../../../../../redux/store/database.js';
import { getVarValue } from '../../../../../../../redux/store/context.js';

/**
 * Schema Select Component for Data Node configuration
 *
 * @fires value-change - Fired when selection changes
 */
@customElement('nr-schema-select')
export class NrSchemaSelect extends LitElement {
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
  @property({ type: String }) value: string = '';
  @property({ type: String }) placeholder: string = 'Select schema...';
  @property({ type: Boolean }) disabled: boolean = false;

  @state() private schemas: SchemaDTO[] = [];
  @state() private loading = false;
  // @ts-ignore - Reserved for future error display
  @state() private error = '';

  private getAppId(): string | null {
    const app = getVarValue('global', 'currentEditingApplication') as any;
    return app?.uuid || null;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (this.connectionPath) this.loadSchemas();
  }

  override updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has('connectionPath')) {
      const oldPath = changedProperties.get('connectionPath') as string;
      if (oldPath !== this.connectionPath) {
        if (oldPath) {
          this.value = '';
          this.dispatchValueChange('');
        }
        this.loadSchemas();
      }
    }
  }

  private async loadSchemas(): Promise<void> {
    const appId = this.getAppId();
    if (!appId || !this.connectionPath) {
      this.schemas = [];
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      const schemas = await getSchemas(this.connectionPath, appId);
      this.schemas = schemas;

      // Auto-select 'public' for PostgreSQL if available
      if (!this.value && schemas.length > 0) {
        const publicSchema = schemas.find((s: SchemaDTO) => s.name === 'public');
        if (publicSchema) {
          this.value = 'public';
          this.dispatchValueChange('public');
        }
      }
    } catch (err: any) {
      console.error('Failed to load schemas:', err);
      this.error = err.message || 'Failed to load schemas';
      this.schemas = [];
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

  override render() {
    if (!this.connectionPath) {
      return html`
        <nr-select .options=${[]} placeholder="Select connection first..." ?disabled=${true}></nr-select>
      `;
    }

    if (this.loading) {
      return html`
        <nr-select .options=${[]} placeholder="Loading schemas..." ?disabled=${true}>
          <div slot="before-options" class="loading-state">
            <div class="spinner"></div>
            <span>Loading schemas...</span>
          </div>
        </nr-select>
      `;
    }

    const options = this.schemas.map(schema => ({
      label: schema.name,
      value: schema.name,
      description: schema.tableCount > 0 ? `${schema.tableCount} tables` : undefined
    }));

    return html`
      <nr-select
        .value=${this.value}
        .options=${options}
        placeholder=${this.placeholder}
        ?disabled=${this.disabled}
        .noOptionsMessage=${'No schemas found'}
        @nr-change=${this.handleSelectChange}
      ></nr-select>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'nr-schema-select': NrSchemaSelect;
  }
}
