/**
 * Dashboard Whiteboard View Component
 * Simplified view of a whiteboard with details
 */

import { html, LitElement, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { getWhiteboardService } from '../../../services/lazy-loader';
import type { WhiteboardDTO } from '../../../services/whiteboard.service';
import { focusAndSelectAll, handlePlainTextPaste, getInputText, handleNameFieldBlur, handleNameFieldKeydown } from '../utils/inline-edit.utils';

// Import NuralyUI components
import '../../runtime/components/ui/nuraly-ui/src/components/button';
import '../../runtime/components/ui/nuraly-ui/src/components/badge';
import '../../runtime/components/ui/nuraly-ui/src/components/icon';

@customElement('dashboard-whiteboard-view')
export class DashboardWhiteboardView extends LitElement {
  static readonly styles = css`
    :host {
      display: block;
      height: 100%;
      background: var(--nuraly-color-background, #f8fafc);
    }

    .whiteboard-view {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .whiteboard-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 11px 24px;
      background: var(--nuraly-color-surface, #ffffff);
      border-bottom: 1px solid var(--nuraly-color-border, #e8e8f0);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .whiteboard-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .whiteboard-name-container {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .whiteboard-name {
      font-size: 18px;
      font-weight: 600;
      color: var(--nuraly-color-text, #0f0f3c);
      margin: 0;
      outline: none;
      border-radius: 4px;
      padding: 2px 6px;
      margin: -2px -6px;
      transition: background 150ms ease;
      min-width: 50px;
      display: inline-block;
    }

    .whiteboard-name.editing {
      background: var(--nuraly-color-background-hover, #f1f5f9);
      box-shadow: 0 0 0 2px var(--nuraly-color-primary, #14144b);
    }

    h2.whiteboard-name:hover {
      background: var(--nuraly-color-background-hover, #f1f5f9);
      cursor: text;
    }

    .whiteboard-name-container:hover .edit-icon {
      opacity: 1;
    }

    .edit-icon {
      opacity: 0;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: all 150ms ease;
      --nuraly-icon-size: 14px;
      --nuraly-icon-color: var(--nuraly-color-text-tertiary, #8c8ca8);
    }

    .edit-icon:hover {
      background: var(--nuraly-color-background-hover, #f1f5f9);
      --nuraly-icon-color: var(--nuraly-color-text, #0f0f3c);
    }

    .action-icon {
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: all 150ms ease;
      --nuraly-icon-size: 16px;
    }

    .action-icon.save {
      --nuraly-icon-color: var(--nuraly-color-success, #22c55e);
    }

    .action-icon.save:hover {
      background: var(--nuraly-color-success-light, #dcfce7);
    }

    .action-icon.cancel {
      --nuraly-icon-color: var(--nuraly-color-text-tertiary, #8c8ca8);
    }

    .action-icon.cancel:hover {
      background: var(--nuraly-color-background-hover, #f1f5f9);
      --nuraly-icon-color: var(--nuraly-color-text, #0f0f3c);
    }

    .whiteboard-meta {
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

    .standalone-badge {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      background: var(--nuraly-color-primary-bg, #f0f0f8);
      color: var(--nuraly-color-primary, #14144b);
      font-size: 11px;
      font-weight: 500;
      border-radius: 4px;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }

    .whiteboard-content {
      flex: 1;
      display: flex;
      gap: 24px;
      padding: 24px;
      overflow: auto;
    }

    .content-main {
      flex: 2;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .content-sidebar {
      flex: 1;
      min-width: 280px;
      max-width: 360px;
    }

    .card {
      background: var(--nuraly-color-surface, #ffffff);
      border-radius: 8px;
      border: 1px solid var(--nuraly-color-border, #e8e8f0);
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid var(--nuraly-color-border, #e8e8f0);
    }

    .card-title {
      font-size: 14px;
      font-weight: 500;
      color: var(--nuraly-color-text, #0f0f3c);
    }

    .card-content {
      padding: 16px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }

    .stat-item {
      text-align: center;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 600;
      color: var(--nuraly-color-text, #0f0f3c);
    }

    .stat-label {
      font-size: 12px;
      color: var(--nuraly-color-text-tertiary, #8c8ca8);
      margin-top: 4px;
    }

    .settings-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .settings-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid var(--nuraly-color-border-subtle, #f1f3f5);
    }

    .settings-item:last-child {
      border-bottom: none;
    }

    .settings-label {
      font-size: 13px;
      color: var(--nuraly-color-text-secondary, #5c5c7a);
    }

    .settings-value {
      font-size: 13px;
      font-weight: 500;
      color: var(--nuraly-color-text, #0f0f3c);
    }

    .color-swatch {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .color-dot {
      width: 16px;
      height: 16px;
      border-radius: 4px;
      border: 1px solid var(--nuraly-color-border, #e8e8f0);
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      gap: 12px;
    }

    .loading-spinner {
      width: 32px;
      height: 32px;
      border: 2px solid var(--nuraly-color-border, #e8e8f0);
      border-top-color: var(--nuraly-color-primary, #14144b);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .empty-state {
      text-align: center;
      padding: 24px;
      color: var(--nuraly-color-text-secondary, #5c5c7a);
      font-size: 13px;
    }
  `;

  @property({ type: String }) whiteboardId: string = '';

  @state() private whiteboard: WhiteboardDTO | null = null;
  @state() private loading = true;
  @state() private isEditingName = false;
  @state() private editedName = '';
  @state() private isSavingName = false;

  async connectedCallback() {
    super.connectedCallback();
    await this.loadWhiteboardData();
  }

  async updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('whiteboardId') && this.whiteboardId) {
      await this.loadWhiteboardData();
    }
  }

  private async loadWhiteboardData() {
    if (!this.whiteboardId) return;

    this.loading = true;
    try {
      const whiteboardService = await getWhiteboardService();
      this.whiteboard = await whiteboardService.getWhiteboard(this.whiteboardId);
    } catch (e) {
      console.error('[DashboardWhiteboardView] Failed to load whiteboard:', e);
    } finally {
      this.loading = false;
    }
  }

  private goBack() {
    const path = this.whiteboard?.applicationId
      ? `/dashboard/app/${this.whiteboard.applicationId}`
      : '/dashboard';
    this.dispatchEvent(new CustomEvent('navigate', {
      detail: { path },
      bubbles: true,
      composed: true
    }));
  }

  private navigateToApp() {
    if (!this.whiteboard?.applicationId) return;

    this.dispatchEvent(new CustomEvent('navigate', {
      detail: { path: `/dashboard/app/${this.whiteboard.applicationId}` },
      bubbles: true,
      composed: true
    }));
  }

  private startEditingName() {
    this.editedName = this.whiteboard?.name || '';
    this.isEditingName = true;
    this.updateComplete.then(() => {
      const element = this.shadowRoot?.querySelector('.whiteboard-name.editing') as HTMLElement;
      if (element) focusAndSelectAll(element, this.editedName);
    });
  }

  private cancelEditingName() {
    this.isEditingName = false;
    this.editedName = '';
  }

  private handleNameInput(e: Event) {
    this.editedName = getInputText(e);
  }

  private handleNameBlur(e: FocusEvent) {
    handleNameFieldBlur(e, this.isEditingName, () => this.saveWhiteboardName());
  }

  private handleNameKeydown(e: KeyboardEvent) {
    handleNameFieldKeydown(e, this.isEditingName, () => this.saveWhiteboardName(), () => this.cancelEditingName());
  }

  private handlePaste(e: ClipboardEvent) {
    handlePlainTextPaste(e);
  }

  private async saveWhiteboardName() {
    if (!this.whiteboard || !this.editedName.trim() || this.editedName === this.whiteboard.name) {
      this.cancelEditingName();
      return;
    }

    this.isSavingName = true;
    try {
      const whiteboardService = await getWhiteboardService();
      await whiteboardService.updateWhiteboard(this.whiteboardId, { name: this.editedName.trim() });

      this.whiteboard = { ...this.whiteboard, name: this.editedName.trim() };
      this.isEditingName = false;
    } catch (e) {
      console.error('[DashboardWhiteboardView] Failed to save whiteboard name:', e);
    } finally {
      this.isSavingName = false;
    }
  }

  private openInEditor() {
    globalThis.location.href = `/dashboard/whiteboard/edit/${this.whiteboardId}`;
  }

  private async handleDelete() {
    if (!this.whiteboard || !confirm(`Delete "${this.whiteboard.name}"?`)) return;

    try {
      const whiteboardService = await getWhiteboardService();
      await whiteboardService.deleteWhiteboard(this.whiteboardId);
      this.goBack();
    } catch (e) {
      console.error('[DashboardWhiteboardView] Failed to delete whiteboard:', e);
    }
  }

  render() {
    if (this.loading) {
      return html`
        <div class="whiteboard-view">
          <div class="loading-container">
            <div class="loading-spinner"></div>
          </div>
        </div>
      `;
    }

    return html`
      <div class="whiteboard-view">
        <div class="whiteboard-header">
          <div class="header-left">
            <nr-button size="small" variant="secondary" @click=${this.goBack}>
              <nr-icon slot="prefix" name="arrow-left" size="small"></nr-icon>
              Back
            </nr-button>
            <div class="whiteboard-info">
              <div class="whiteboard-name-container">
                ${this.isEditingName ? html`
                  <span
                    class="whiteboard-name editing"
                    contenteditable="true"
                    @blur=${this.handleNameBlur}
                    @keydown=${this.handleNameKeydown}
                    @input=${this.handleNameInput}
                    @paste=${this.handlePaste}
                  ></span>
                  <nr-icon
                    name="check"
                    class="action-icon save"
                    title="Save"
                    @click=${this.saveWhiteboardName}
                  ></nr-icon>
                  <nr-icon
                    name="x"
                    class="action-icon cancel"
                    title="Cancel"
                    @click=${this.cancelEditingName}
                  ></nr-icon>
                ` : html`
                  <h2 class="whiteboard-name" @click=${this.startEditingName}>${this.whiteboard?.name || 'Whiteboard'}</h2>
                  <nr-icon
                    name="pencil"
                    class="edit-icon"
                    title="Edit name"
                    @click=${this.startEditingName}
                  ></nr-icon>
                `}
              </div>
              <div class="whiteboard-meta">
                ${this.whiteboard?.applicationId ? html`
                  <span class="app-link" @click=${this.navigateToApp}>
                    App: ${this.whiteboard.applicationId}
                  </span>
                ` : html`
                  <span class="standalone-badge">Standalone</span>
                `}
                <span>${this.whiteboard?.elements?.length || 0} elements</span>
              </div>
            </div>
          </div>
          <div class="header-actions">
            <nr-button type="primary" size="small" iconLeft="ExternalLink" @click=${this.openInEditor}>
              Open in Editor
            </nr-button>
            <nr-button type="default" size="small" iconLeft="Trash2" @click=${this.handleDelete}>
              Delete
            </nr-button>
          </div>
        </div>

        <div class="whiteboard-content">
          <div class="content-main">
            <div class="card">
              <div class="card-header">
                <span class="card-title">Overview</span>
              </div>
              <div class="card-content">
                <div class="stats-grid">
                  <div class="stat-item">
                    <div class="stat-value">${this.whiteboard?.elements?.length || 0}</div>
                    <div class="stat-label">Elements</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">${this.whiteboard?.connectors?.length || 0}</div>
                    <div class="stat-label">Connectors</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">${this.whiteboard?.version || 0}</div>
                    <div class="stat-label">Version</div>
                  </div>
                </div>
              </div>
            </div>

            ${this.whiteboard?.description ? html`
              <div class="card">
                <div class="card-header">
                  <span class="card-title">Description</span>
                </div>
                <div class="card-content">
                  <p>${this.whiteboard.description}</p>
                </div>
              </div>
            ` : nothing}
          </div>

          <div class="content-sidebar">
            <div class="card">
              <div class="card-header">
                <span class="card-title">Settings</span>
              </div>
              <div class="card-content">
                <div class="settings-list">
                  <div class="settings-item">
                    <span class="settings-label">Background</span>
                    <span class="settings-value">
                      <span class="color-swatch">
                        <span class="color-dot" style="background: ${this.whiteboard?.backgroundColor || '#ffffff'}"></span>
                        ${this.whiteboard?.backgroundColor || '#ffffff'}
                      </span>
                    </span>
                  </div>
                  <div class="settings-item">
                    <span class="settings-label">Grid</span>
                    <span class="settings-value">${this.whiteboard?.gridEnabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                  <div class="settings-item">
                    <span class="settings-label">Grid Size</span>
                    <span class="settings-value">${this.whiteboard?.gridSize || 20}px</span>
                  </div>
                  <div class="settings-item">
                    <span class="settings-label">Snap to Grid</span>
                    <span class="settings-value">${this.whiteboard?.snapToGrid ? 'Enabled' : 'Disabled'}</span>
                  </div>
                  <div class="settings-item">
                    <span class="settings-label">Max Collaborators</span>
                    <span class="settings-value">${this.whiteboard?.maxCollaborators || 50}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dashboard-whiteboard-view': DashboardWhiteboardView;
  }
}
