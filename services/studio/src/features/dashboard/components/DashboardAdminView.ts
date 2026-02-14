/**
 * Dashboard Admin View Component
 * Admin page for managing app templates and workflow templates
 * Gated by Keycloak 'admin' role
 */

import { html, LitElement, css, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { getCurrentUser } from '../../runtime/handlers/runtime-api/user';
import { APIS_URL } from '../../../services/constants';

interface AppTemplate {
  id: string;
  name: string;
  description?: string;
  category?: string;
  createdBy?: string;
  verified?: boolean;
  editorChoice?: boolean;
  createdAt?: string;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description?: string;
  applicationId?: string;
  createdBy?: string;
  verified?: boolean;
  editorChoice?: boolean;
  createdAt?: string;
}

type AdminTab = 'app-templates' | 'workflow-templates';

@customElement('dashboard-admin-view')
export class DashboardAdminView extends LitElement {
  static readonly styles = css`
    :host {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
      background: var(--nuraly-color-background, #f8fafc);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }

    .forbidden {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      gap: 16px;
      color: var(--nuraly-color-text-secondary, #5c5c7a);
    }

    .forbidden-icon {
      width: 64px;
      height: 64px;
      color: var(--nuraly-color-danger, #dc2626);
    }

    .forbidden h2 {
      font-size: 20px;
      font-weight: 600;
      color: var(--nuraly-color-text, #0f0f3c);
      margin: 0;
    }

    .forbidden p {
      font-size: 14px;
      margin: 0;
    }

    .admin-layout {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
      overflow: hidden;
    }

    .admin-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 24px;
      background: var(--nuraly-color-surface, #ffffff);
      border-bottom: 1px solid var(--nuraly-color-border, #e8e8f0);
      flex-shrink: 0;
    }

    .admin-header h1 {
      font-size: 18px;
      font-weight: 600;
      color: var(--nuraly-color-text, #0f0f3c);
      margin: 0;
    }

    .tabs {
      display: flex;
      gap: 0;
      background: var(--nuraly-color-surface, #ffffff);
      border-bottom: 1px solid var(--nuraly-color-border, #e8e8f0);
      padding: 0 24px;
      flex-shrink: 0;
    }

    .tab {
      padding: 10px 20px;
      font-size: 13px;
      font-weight: 500;
      color: var(--nuraly-color-text-secondary, #5c5c7a);
      cursor: pointer;
      border: none;
      background: none;
      border-bottom: 2px solid transparent;
      transition: all 150ms ease;
    }

    .tab:hover {
      color: var(--nuraly-color-text, #0f0f3c);
    }

    .tab.active {
      color: var(--nuraly-color-primary, #14144b);
      border-bottom-color: var(--nuraly-color-primary, #14144b);
    }

    .toolbar {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 24px;
      background: var(--nuraly-color-surface, #ffffff);
      border-bottom: 1px solid var(--nuraly-color-border-subtle, #f1f3f5);
      flex-shrink: 0;
    }

    .search-input {
      flex: 1;
      max-width: 320px;
      padding: 7px 12px;
      font-size: 13px;
      border: 1px solid var(--nuraly-color-border, #e8e8f0);
      border-radius: 6px;
      background: var(--nuraly-color-background, #f8fafc);
      color: var(--nuraly-color-text, #0f0f3c);
      outline: none;
      transition: border-color 150ms ease;
    }

    .search-input:focus {
      border-color: var(--nuraly-color-primary, #14144b);
    }

    .search-input::placeholder {
      color: var(--nuraly-color-text-tertiary, #8c8ca8);
    }

    .content {
      flex: 1;
      overflow-y: auto;
      padding: 20px 24px;
    }

    /* Loading */
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

    .loading-text {
      font-size: 13px;
      color: var(--nuraly-color-text-tertiary, #8c8ca8);
    }

    /* Error */
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      gap: 12px;
      text-align: center;
    }

    .error-container p {
      font-size: 13px;
      color: var(--nuraly-color-danger, #dc2626);
      margin: 0;
    }

    .retry-btn {
      padding: 6px 16px;
      font-size: 13px;
      font-weight: 500;
      border: 1px solid var(--nuraly-color-border, #e8e8f0);
      border-radius: 6px;
      background: var(--nuraly-color-surface, #ffffff);
      color: var(--nuraly-color-text, #0f0f3c);
      cursor: pointer;
      transition: all 150ms ease;
    }

    .retry-btn:hover {
      background: var(--nuraly-color-background-hover, #f1f5f9);
    }

    /* Empty */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      gap: 8px;
      color: var(--nuraly-color-text-tertiary, #8c8ca8);
    }

    .empty-state p {
      font-size: 14px;
      margin: 0;
    }

    /* Table */
    .template-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    .template-table th {
      text-align: left;
      padding: 10px 12px;
      font-weight: 500;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--nuraly-color-text-tertiary, #8c8ca8);
      border-bottom: 1px solid var(--nuraly-color-border, #e8e8f0);
      white-space: nowrap;
    }

    .template-table td {
      padding: 10px 12px;
      border-bottom: 1px solid var(--nuraly-color-border-subtle, #f1f3f5);
      color: var(--nuraly-color-text, #0f0f3c);
      vertical-align: middle;
    }

    .template-table tr:hover td {
      background: var(--nuraly-color-background-hover, #f1f5f9);
    }

    .cell-name {
      font-weight: 500;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .cell-desc {
      max-width: 250px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--nuraly-color-text-secondary, #5c5c7a);
    }

    .cell-meta {
      color: var(--nuraly-color-text-tertiary, #8c8ca8);
      font-size: 12px;
      white-space: nowrap;
    }

    /* Toggle button */
    .toggle-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 22px;
      border-radius: 11px;
      border: none;
      cursor: pointer;
      transition: background 150ms ease;
      position: relative;
      padding: 0;
    }

    .toggle-btn.off {
      background: var(--nuraly-color-border, #e8e8f0);
    }

    .toggle-btn.on {
      background: var(--nuraly-color-success, #16a34a);
    }

    .toggle-btn::after {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: white;
      top: 3px;
      transition: left 150ms ease;
    }

    .toggle-btn.off::after {
      left: 3px;
    }

    .toggle-btn.on::after {
      left: 17px;
    }

    /* Actions */
    .action-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 4px;
      border: none;
      background: transparent;
      cursor: pointer;
      color: var(--nuraly-color-text-secondary, #5c5c7a);
      transition: all 150ms ease;
    }

    .action-btn:hover {
      background: var(--nuraly-color-background-hover, #f1f5f9);
    }

    .action-btn.danger:hover {
      background: var(--nuraly-color-danger-light, #fee2e2);
      color: var(--nuraly-color-danger, #dc2626);
    }

    .action-btn svg {
      width: 16px;
      height: 16px;
    }

    /* Confirm dialog overlay */
    .confirm-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .confirm-dialog {
      background: var(--nuraly-color-surface, #ffffff);
      border-radius: 8px;
      padding: 24px;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
    }

    .confirm-dialog h3 {
      font-size: 15px;
      font-weight: 600;
      margin: 0 0 8px;
      color: var(--nuraly-color-text, #0f0f3c);
    }

    .confirm-dialog p {
      font-size: 13px;
      color: var(--nuraly-color-text-secondary, #5c5c7a);
      margin: 0 0 20px;
    }

    .confirm-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }

    .btn {
      padding: 7px 16px;
      font-size: 13px;
      font-weight: 500;
      border-radius: 6px;
      cursor: pointer;
      border: 1px solid var(--nuraly-color-border, #e8e8f0);
      background: var(--nuraly-color-surface, #ffffff);
      color: var(--nuraly-color-text, #0f0f3c);
      transition: all 150ms ease;
    }

    .btn:hover {
      background: var(--nuraly-color-background-hover, #f1f5f9);
    }

    .btn-danger {
      background: var(--nuraly-color-danger, #dc2626);
      color: white;
      border-color: var(--nuraly-color-danger, #dc2626);
    }

    .btn-danger:hover {
      background: #b91c1c;
    }

    @media (max-width: 768px) {
      .admin-header {
        padding: 12px 16px;
      }

      .tabs {
        padding: 0 16px;
      }

      .toolbar {
        padding: 8px 16px;
      }

      .content {
        padding: 12px 16px;
      }

      .template-table {
        font-size: 12px;
      }

      .cell-desc {
        display: none;
      }
    }
  `;

  @state() private isAdmin = false;
  @state() private activeTab: AdminTab = 'app-templates';
  @state() private appTemplates: AppTemplate[] = [];
  @state() private workflowTemplates: WorkflowTemplate[] = [];
  @state() private loadingApps = false;
  @state() private loadingWorkflows = false;
  @state() private errorApps: string | null = null;
  @state() private errorWorkflows: string | null = null;
  @state() private searchQuery = '';
  @state() private confirmDelete: { type: 'app' | 'workflow'; id: string; name: string } | null = null;

  connectedCallback() {
    super.connectedCallback();
    const user = getCurrentUser();
    this.isAdmin = user?.roles?.includes('admin') ?? false;
    if (this.isAdmin) {
      this.fetchAppTemplates();
      this.fetchWorkflowTemplates();
    }
  }

  private async fetchAppTemplates() {
    this.loadingApps = true;
    this.errorApps = null;
    try {
      const res = await fetch(APIS_URL.getAppTemplates());
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.appTemplates = await res.json();
    } catch (err) {
      this.errorApps = err instanceof Error ? err.message : 'Failed to load app templates';
    } finally {
      this.loadingApps = false;
    }
  }

  private async fetchWorkflowTemplates() {
    this.loadingWorkflows = true;
    this.errorWorkflows = null;
    try {
      const res = await fetch(APIS_URL.getWorkflowTemplates());
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.workflowTemplates = await res.json();
    } catch (err) {
      this.errorWorkflows = err instanceof Error ? err.message : 'Failed to load workflow templates';
    } finally {
      this.loadingWorkflows = false;
    }
  }

  private async toggleAppVerified(template: AppTemplate) {
    const newVal = !template.verified;
    try {
      const res = await fetch(APIS_URL.updateAppTemplate(template.id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: newVal, editorChoice: template.editorChoice })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      template.verified = newVal;
      this.appTemplates = [...this.appTemplates];
    } catch (err) {
      console.error('Failed to toggle verified:', err);
    }
  }

  private async toggleAppEditorChoice(template: AppTemplate) {
    const newVal = !template.editorChoice;
    try {
      const res = await fetch(APIS_URL.updateAppTemplate(template.id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: template.verified, editorChoice: newVal })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      template.editorChoice = newVal;
      this.appTemplates = [...this.appTemplates];
    } catch (err) {
      console.error('Failed to toggle editor choice:', err);
    }
  }

  private async toggleWorkflowVerified(template: WorkflowTemplate) {
    const newVal = !template.verified;
    try {
      const res = await fetch(APIS_URL.setWorkflowVerified(template.id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: newVal })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      template.verified = newVal;
      this.workflowTemplates = [...this.workflowTemplates];
    } catch (err) {
      console.error('Failed to toggle verified:', err);
    }
  }

  private async toggleWorkflowEditorChoice(template: WorkflowTemplate) {
    const newVal = !template.editorChoice;
    try {
      const res = await fetch(APIS_URL.setWorkflowEditorChoice(template.id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ editorChoice: newVal })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      template.editorChoice = newVal;
      this.workflowTemplates = [...this.workflowTemplates];
    } catch (err) {
      console.error('Failed to toggle editor choice:', err);
    }
  }

  private showDeleteConfirm(type: 'app' | 'workflow', id: string, name: string) {
    this.confirmDelete = { type, id, name };
  }

  private async confirmDeleteAction() {
    if (!this.confirmDelete) return;
    const { type, id } = this.confirmDelete;
    try {
      if (type === 'app') {
        const res = await fetch(APIS_URL.deleteAppTemplate(id), { method: 'DELETE' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        this.appTemplates = this.appTemplates.filter(t => t.id !== id);
      } else {
        const res = await fetch(APIS_URL.deleteWorkflow(id), { method: 'DELETE' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        this.workflowTemplates = this.workflowTemplates.filter(t => t.id !== id);
      }
    } catch (err) {
      console.error('Failed to delete template:', err);
    } finally {
      this.confirmDelete = null;
    }
  }

  private cancelDelete() {
    this.confirmDelete = null;
  }

  private handleSearchInput(e: Event) {
    this.searchQuery = (e.target as HTMLInputElement).value;
  }

  private filterBySearch<T extends { name?: string }>(items: T[]): T[] {
    if (!this.searchQuery.trim()) return items;
    const q = this.searchQuery.toLowerCase();
    return items.filter(item => item.name?.toLowerCase().includes(q));
  }

  private formatDate(dateStr?: string): string {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      });
    } catch {
      return '-';
    }
  }

  private renderToggle(on: boolean, onClick: () => void) {
    return html`
      <button class="toggle-btn ${on ? 'on' : 'off'}" @click=${onClick}></button>
    `;
  }

  private renderDeleteBtn(onClick: () => void) {
    return html`
      <button class="action-btn danger" title="Delete" @click=${onClick}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
        </svg>
      </button>
    `;
  }

  private renderAppTemplatesTable() {
    if (this.loadingApps) {
      return html`
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p class="loading-text">Loading app templates...</p>
        </div>
      `;
    }
    if (this.errorApps) {
      return html`
        <div class="error-container">
          <p>${this.errorApps}</p>
          <button class="retry-btn" @click=${() => this.fetchAppTemplates()}>Retry</button>
        </div>
      `;
    }

    const filtered = this.filterBySearch(this.appTemplates);
    if (filtered.length === 0) {
      return html`
        <div class="empty-state">
          <p>${this.searchQuery ? 'No matching app templates found' : 'No app templates yet'}</p>
        </div>
      `;
    }

    return html`
      <table class="template-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Category</th>
            <th>Creator</th>
            <th>Created</th>
            <th>Verified</th>
            <th>Editor's Choice</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map(t => html`
            <tr>
              <td class="cell-name">${t.name || '-'}</td>
              <td class="cell-desc">${t.description || '-'}</td>
              <td class="cell-meta">${t.category || '-'}</td>
              <td class="cell-meta">${t.createdBy || '-'}</td>
              <td class="cell-meta">${this.formatDate(t.createdAt)}</td>
              <td>${this.renderToggle(!!t.verified, () => this.toggleAppVerified(t))}</td>
              <td>${this.renderToggle(!!t.editorChoice, () => this.toggleAppEditorChoice(t))}</td>
              <td>${this.renderDeleteBtn(() => this.showDeleteConfirm('app', t.id, t.name || 'Untitled'))}</td>
            </tr>
          `)}
        </tbody>
      </table>
    `;
  }

  private renderWorkflowTemplatesTable() {
    if (this.loadingWorkflows) {
      return html`
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p class="loading-text">Loading workflow templates...</p>
        </div>
      `;
    }
    if (this.errorWorkflows) {
      return html`
        <div class="error-container">
          <p>${this.errorWorkflows}</p>
          <button class="retry-btn" @click=${() => this.fetchWorkflowTemplates()}>Retry</button>
        </div>
      `;
    }

    const filtered = this.filterBySearch(this.workflowTemplates);
    if (filtered.length === 0) {
      return html`
        <div class="empty-state">
          <p>${this.searchQuery ? 'No matching workflow templates found' : 'No workflow templates yet'}</p>
        </div>
      `;
    }

    return html`
      <table class="template-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>App ID</th>
            <th>Creator</th>
            <th>Created</th>
            <th>Verified</th>
            <th>Editor's Choice</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map(t => html`
            <tr>
              <td class="cell-name">${t.name || '-'}</td>
              <td class="cell-desc">${t.description || '-'}</td>
              <td class="cell-meta">${t.applicationId || '-'}</td>
              <td class="cell-meta">${t.createdBy || '-'}</td>
              <td class="cell-meta">${this.formatDate(t.createdAt)}</td>
              <td>${this.renderToggle(!!t.verified, () => this.toggleWorkflowVerified(t))}</td>
              <td>${this.renderToggle(!!t.editorChoice, () => this.toggleWorkflowEditorChoice(t))}</td>
              <td>${this.renderDeleteBtn(() => this.showDeleteConfirm('workflow', t.id, t.name || 'Untitled'))}</td>
            </tr>
          `)}
        </tbody>
      </table>
    `;
  }

  private renderConfirmDialog() {
    if (!this.confirmDelete) return nothing;
    return html`
      <div class="confirm-overlay" @click=${this.cancelDelete}>
        <div class="confirm-dialog" @click=${(e: Event) => e.stopPropagation()}>
          <h3>Delete Template</h3>
          <p>Are you sure you want to delete "${this.confirmDelete.name}"? This action cannot be undone.</p>
          <div class="confirm-actions">
            <button class="btn" @click=${this.cancelDelete}>Cancel</button>
            <button class="btn btn-danger" @click=${() => this.confirmDeleteAction()}>Delete</button>
          </div>
        </div>
      </div>
    `;
  }

  render() {
    if (!this.isAdmin) {
      return html`
        <div class="forbidden">
          <svg class="forbidden-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <h2>Access Denied</h2>
          <p>You need the admin role to access this page.</p>
        </div>
      `;
    }

    return html`
      <div class="admin-layout">
        <div class="admin-header">
          <h1>Template Management</h1>
        </div>

        <div class="tabs">
          <button
            class="tab ${this.activeTab === 'app-templates' ? 'active' : ''}"
            @click=${() => { this.activeTab = 'app-templates'; }}
          >App Templates</button>
          <button
            class="tab ${this.activeTab === 'workflow-templates' ? 'active' : ''}"
            @click=${() => { this.activeTab = 'workflow-templates'; }}
          >Workflow Templates</button>
        </div>

        <div class="toolbar">
          <input
            class="search-input"
            type="text"
            placeholder="Search by name..."
            .value=${this.searchQuery}
            @input=${this.handleSearchInput}
          />
        </div>

        <div class="content">
          ${this.activeTab === 'app-templates'
            ? this.renderAppTemplatesTable()
            : this.renderWorkflowTemplatesTable()
          }
        </div>
      </div>
      ${this.renderConfirmDialog()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dashboard-admin-view': DashboardAdminView;
  }
}
