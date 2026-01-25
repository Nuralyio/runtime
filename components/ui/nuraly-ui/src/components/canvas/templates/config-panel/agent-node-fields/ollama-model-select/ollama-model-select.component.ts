/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html, css, nothing } from 'lit';
import { property, customElement, state } from 'lit/decorators.js';
import { getKvEntry } from '../../../../../../../../../../redux/store/kv.js';
import { getVarValue } from '../../../../../../../../../../redux/store/context.js';

interface OllamaModel {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details?: {
    parent_model?: string;
    format?: string;
    family?: string;
    families?: string[];
    parameter_size?: string;
    quantization_level?: string;
  };
}

interface OllamaTagsResponse {
  models: OllamaModel[];
}

/**
 * Ollama Model Select Component
 *
 * A select component that fetches available models from an Ollama server.
 * Falls back to manual input if the server is unreachable.
 *
 * @example
 * ```html
 * <nr-ollama-model-select
 *   serverUrlPath="ollama/server-url"
 *   value="llama3.2"
 *   @value-change=${(e) => console.log(e.detail.value)}
 * ></nr-ollama-model-select>
 * ```
 *
 * @fires value-change - Fired when selection changes
 */
@customElement('nr-ollama-model-select')
export class NrOllamaModelSelect extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    .loading-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      color: var(--text-secondary, #6b7280);
      font-size: 13px;
    }

    .error-state {
      padding: 8px 12px;
      color: var(--text-secondary, #6b7280);
      font-size: 12px;
    }

    .error-message {
      color: #dc2626;
      margin-bottom: 8px;
    }

    .refresh-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      background: transparent;
      border: 1px solid var(--border-color, #d1d5db);
      border-radius: 4px;
      color: var(--text-secondary, #6b7280);
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .refresh-btn:hover {
      border-color: var(--primary-color, #6366f1);
      color: var(--primary-color, #6366f1);
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

    .model-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .model-name {
      font-weight: 500;
    }

    .model-details {
      font-size: 11px;
      color: var(--text-secondary, #6b7280);
    }

    .footer-actions {
      padding: 8px 12px;
      border-top: 1px solid var(--border-color, #e5e7eb);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .model-count {
      font-size: 12px;
      color: var(--text-secondary, #6b7280);
    }
  `;

  /** KV path to the server URL */
  @property({ type: String })
  serverUrlPath: string = '';

  /** Currently selected model */
  @property({ type: String })
  value: string = '';

  /** Placeholder text */
  @property({ type: String })
  placeholder: string = 'Select or enter model name...';

  @state() private models: OllamaModel[] = [];
  @state() private loading = false;
  @state() private error = '';
  @state() private serverUrl = '';

  private getAppId(): string | null {
    const app = getVarValue('global', 'currentEditingApplication') as any;
    return app?.uuid || null;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.resolveServerUrlAndFetch();
  }

  override updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has('serverUrlPath')) {
      this.resolveServerUrlAndFetch();
    }
  }

  private async resolveServerUrlAndFetch(): Promise<void> {
    if (!this.serverUrlPath) {
      // Use default Ollama URL if no path provided
      this.serverUrl = 'http://localhost:11434';
      await this.fetchModels();
      return;
    }

    const appId = this.getAppId();
    if (!appId) {
      this.serverUrl = 'http://localhost:11434';
      await this.fetchModels();
      return;
    }

    try {
      const entry = await getKvEntry(appId, this.serverUrlPath);
      this.serverUrl = entry?.value || 'http://localhost:11434';
    } catch {
      this.serverUrl = 'http://localhost:11434';
    }

    await this.fetchModels();
  }

  private async fetchModels(): Promise<void> {
    if (!this.serverUrl) return;

    this.loading = true;
    this.error = '';

    try {
      // Normalize URL - remove trailing slash
      const baseUrl = this.serverUrl.replace(/\/$/, '');
      const response = await fetch(`${baseUrl}/api/tags`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data: OllamaTagsResponse = await response.json();
      this.models = data.models || [];
    } catch (err: any) {
      console.error('Failed to fetch Ollama models:', err);
      this.error = err.message || 'Failed to connect to Ollama server';
      this.models = [];
    }

    this.loading = false;
  }

  private handleSelectChange(e: CustomEvent): void {
    const value = e.detail?.value || '';
    this.value = value;
    this.dispatchEvent(new CustomEvent('value-change', {
      detail: { value },
      bubbles: true,
      composed: true
    }));
  }

  private handleInputChange(e: CustomEvent): void {
    const value = e.detail?.value || '';
    this.value = value;
    this.dispatchEvent(new CustomEvent('value-change', {
      detail: { value },
      bubbles: true,
      composed: true
    }));
  }

  private handleRefresh(): void {
    this.resolveServerUrlAndFetch();
  }

  private formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }

  private renderFooter() {
    if (this.loading) {
      return html`
        <div class="loading-indicator">
          <div class="spinner"></div>
          <span>Loading models...</span>
        </div>
      `;
    }

    if (this.error) {
      return html`
        <div class="error-state">
          <div class="error-message">${this.error}</div>
          <button class="refresh-btn" @click=${this.handleRefresh}>
            <nr-icon name="refresh-cw" size="small"></nr-icon>
            Retry
          </button>
        </div>
      `;
    }

    return html`
      <div class="footer-actions">
        <span class="model-count">${this.models.length} model${this.models.length !== 1 ? 's' : ''} available</span>
        <button class="refresh-btn" @click=${this.handleRefresh}>
          <nr-icon name="refresh-cw" size="small"></nr-icon>
          Refresh
        </button>
      </div>
    `;
  }

  override render() {
    // If we have models, show a select with them
    if (this.models.length > 0 && !this.error) {
      const options = this.models.map(model => ({
        label: model.name,
        value: model.name,
        description: model.details?.parameter_size
          ? `${model.details.parameter_size} • ${this.formatSize(model.size)}`
          : this.formatSize(model.size)
      }));

      return html`
        <nr-select
          .value=${this.value}
          .options=${options}
          placeholder=${this.placeholder}
          searchable
          allowCustomValue
          @nr-change=${this.handleSelectChange}
        >
          <div slot="after-options">
            ${this.renderFooter()}
          </div>
        </nr-select>
      `;
    }

    // If loading or error, show input with manual entry
    return html`
      <nr-input
        .value=${this.value}
        placeholder=${this.loading ? 'Loading models...' : 'Enter model name (e.g., llama3.2)'}
        ?disabled=${this.loading}
        @nr-input=${this.handleInputChange}
      ></nr-input>
      ${this.error ? html`
        <div class="error-state" style="margin-top: 8px;">
          <div class="error-message">${this.error}</div>
          <button class="refresh-btn" @click=${this.handleRefresh}>
            <nr-icon name="refresh-cw" size="small"></nr-icon>
            Retry connection
          </button>
        </div>
      ` : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'nr-ollama-model-select': NrOllamaModelSelect;
  }
}
