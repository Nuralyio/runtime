/**
 * @fileoverview FunctionsPanel - Studio Functions Management Panel
 * @module Studio/FunctionsPanel
 *
 * @description
 * A dedicated panel component for managing serverless functions in the Studio.
 * Stores functions in global Vars.studio_functions for low-code access.
 * Uses Nuraly UI components (nr-menu, nr-button, nr-icon) for consistent styling.
 *
 * @example
 * ```html
 * <functions-panel></functions-panel>
 * ```
 *
 * @example Low-code access
 * ```javascript
 * // Access functions from handlers
 * const functions = Vars.studio_functions;
 * const myFunc = functions.find(f => f.name === 'myFunction');
 * ```
 */

import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { ExecuteInstance } from '../../../../../state/runtime-context';
import { openEditorTab, setCurrentEditorTab } from '../../../../../redux/actions/editor';
import { $editorState, $currentApplication } from '../../../../../redux/store/apps';

// Import nuraly-ui components
import '@nuralyui/button';
import '@nuralyui/menu';
import '@nuralyui/icon';


export interface FunctionItem {
  id: number;
  label: string;
  description?: string;
  runtime?: string;
  template?: string;
  handler?: string;
}


@customElement('functions-panel')
export class FunctionsPanel extends LitElement {
  static override styles = css`
    :host {
      display: block;
      height: 100%;
      overflow-y: auto;
      font-family: var(--nuraly-font-family, system-ui, sans-serif);
    }

    .panel-container {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      border-bottom: 1px solid var(--nuraly-border-color, #e0e0e0);
      background: var(--nuraly-panel-header-bg, #fafafa);
    }

    .panel-title {
      font-size: 13px;
      font-weight: 500;
      color: var(--nuraly-text-color, #333);
    }

    .functions-list {
      flex: 1;
      overflow-y: auto;
    }

    nr-menu {
      --nuraly-menu-width: 100%;
      --nuraly-menu-item-padding: 8px 12px;
    }

    nr-button {
      --nuraly-button-height: 28px;
      --nuraly-button-font-size: 12px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
      color: var(--nuraly-text-secondary, #888);
    }

    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-title {
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 8px;
      color: var(--nuraly-text-color, #333);
    }

    .empty-description {
      font-size: 12px;
      max-width: 200px;
    }

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      color: var(--nuraly-text-secondary, #888);
    }

    .error {
      padding: 16px;
      margin: 8px;
      border-radius: 6px;
      background: #ffebee;
      color: #c62828;
      font-size: 12px;
    }
  `;

  @state()
  private functions: FunctionItem[] = [];

  @state()
  private loading = true;

  @state()
  private error: string | null = null;

  @state()
  private selectedFunctionId: number | null = null;

  @state()
  private creating = false;

  override connectedCallback() {
    super.connectedCallback();
    this.loadFunctions();
  }

  /**
   * Load functions from API and store in global Vars
   */
  async loadFunctions() {
    this.loading = true;
    this.error = null;

    try {
      const currentApp = $currentApplication.get();
      const applicationId = currentApp?.uuid;

      // Build URL with optional applicationId filter
      let url = '/api/v1/functions';
      if (applicationId) {
        url += `?applicationId=${encodeURIComponent(applicationId)}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.functions = data || [];

      // Store in global Vars for low-code access
      this.updateGlobalVars();

    } catch (err) {
      console.error('Error fetching functions:', err);
      this.error = err instanceof Error ? err.message : 'Failed to load functions';
    } finally {
      this.loading = false;
    }
  }

  /**
   * Update global Vars.studio_functions for low-code access
   */
  private updateGlobalVars() {
    try {
      // Use VarsProxy for reactive updates (accessible via Vars.studio_functions in handlers)
      ExecuteInstance.VarsProxy.studio_functions = [...this.functions];
    } catch (err) {
      console.warn('Could not update global Vars:', err);
    }
  }

  /**
   * Fetch the default handler template from GitHub
   */
  private async fetchDefaultTemplate(): Promise<string> {
    const templateUrl = 'https://raw.githubusercontent.com/Nuralyio/functions-templates/refs/heads/main/v1/deno/2/handler.ts';
    try {
      const response = await fetch(templateUrl);
      if (response.ok) {
        return await response.text();
      }
    } catch (err) {
      console.warn('Failed to fetch template, using default:', err);
    }
    // Fallback default template
    return `export default async function handler(req: Request): Promise<Response> {
  return new Response(JSON.stringify({ message: "Hello from Deno!" }), {
    headers: { "Content-Type": "application/json" }
  });
}`;
  }

  /**
   * Create a new function
   */
  async createFunction() {
    this.creating = true;

    try {
      const currentApp = $currentApplication.get();
      const applicationId = currentApp?.uuid || null;

      // Fetch default template from GitHub
      const handler = await this.fetchDefaultTemplate();

      const response = await fetch('/api/v1/functions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          label: `function-${Date.now()}`,
          description: '',
          runtime: 'deno',
          template: 'v1/deno/2',
          handler,
          applicationId
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `HTTP error! status: ${response.status}`);
      }

      const newFunction = await response.json();
      this.functions = [...this.functions, newFunction];
      this.updateGlobalVars();

      // Open the new function in editor
      this.openFunctionInEditor(newFunction);

    } catch (err) {
      console.error('Error creating function:', err);
      this.error = err instanceof Error ? err.message : 'Failed to create function';
    } finally {
      this.creating = false;
    }
  }

  /**
   * Delete a function
   */
  async deleteFunction(funcId: number) {
    const func = this.functions.find(f => f.id === funcId);
    if (!func) return;

    if (!confirm(`Delete function "${func.label}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/functions/${funcId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      this.functions = this.functions.filter(f => f.id !== funcId);
      this.updateGlobalVars();

      if (this.selectedFunctionId === funcId) {
        this.selectedFunctionId = null;
      }

    } catch (err) {
      console.error('Error deleting function:', err);
      this.error = err instanceof Error ? err.message : 'Failed to delete function';
    }
  }

  /**
   * Open function in editor tab
   */
  openFunctionInEditor(func: FunctionItem) {
    this.selectedFunctionId = func.id;

    // Set current function in global Vars for permissions panel and other uses
    ExecuteInstance.VarsProxy.currentFunction = func;

    try {
      // Check if tab already exists
      const editorState = $editorState.get();
      const tabs = editorState?.tabs || [];
      const existingTab = tabs.find(
        (tab: any) => tab.type === 'function' && tab.id === String(func.id)
      );

      if (existingTab) {
        // Switch to existing tab
        setCurrentEditorTab(existingTab);
      } else {
        // Open new tab with detail format expected by function-page
        const newTab = {
          id: String(func.id),
          label: func.label || `Function ${func.id}`,
          type: 'function',
          detail: {
            uuid: func.id,
            handler: func.handler || ''
          }
        };

        openEditorTab(newTab);
        setCurrentEditorTab(newTab);
      }
    } catch (err) {
      console.warn('Could not open editor tab:', err);
    }
  }

  /**
   * Get icon name based on runtime
   */
  private getRuntimeIcon(runtime?: string): string {
    const iconMap: Record<string, string> = {
      javascript: 'file-code',
      typescript: 'file-code-2',
      python: 'file-code',
      java: 'coffee',
      go: 'file-code'
    };
    return iconMap[runtime || 'javascript'] || 'function-square';
  }

  /**
   * Convert functions to menu items format (IMenu interface)
   */
  private getMenuItems() {
    return this.functions.map(func => ({
      text: func.label || `Function ${func.id}`,
      icon: this.getRuntimeIcon(func.runtime),
      selected: this.selectedFunctionId === func.id,
      menu: {
        icon: 'more-vertical',
        actions: [
          { label: 'Delete', value: `delete:${func.id}` }
        ]
      }
    }));
  }

  /**
   * Handle menu item click
   */
  private handleMenuChange(e: CustomEvent) {
    const path = e.detail.path;
    if (path && path.length > 0) {
      const funcIndex = path[0];
      const func = this.functions[funcIndex];
      if (func) {
        this.openFunctionInEditor(func);
      }
    }
  }

  /**
   * Handle menu action click (delete, etc.)
   */
  private handleActionClick(e: CustomEvent) {
    const actionValue = e.detail.value;
    if (actionValue && actionValue.startsWith('delete:')) {
      const funcId = parseInt(actionValue.replace('delete:', ''), 10);
      this.deleteFunction(funcId);
    }
  }

  override render() {
    return html`
      <div class="panel-container">
        <div class="panel-header">
          <span class="panel-title">Functions</span>
          <nr-button
            type="primary"
            size="small"
            iconLeft="plus"
            ?loading=${this.creating}
            ?disabled=${this.creating}
            @click=${this.createFunction}
          >
            ${this.creating ? 'Creating...' : 'New'}
          </nr-button>
        </div>

        <div class="functions-list">
          ${this.loading ? html`
            <div class="loading">Loading functions...</div>
          ` : this.error ? html`
            <div class="error">
              ${this.error}
              <nr-button
                type="link"
                size="small"
                @click=${this.loadFunctions}
              >
                Retry
              </nr-button>
            </div>
          ` : this.functions.length === 0 ? html`
            <div class="empty-state">
              <nr-icon name="function-square" size="xxlarge"></nr-icon>
              <div class="empty-title">No functions yet</div>
              <div class="empty-description">
                Create your first serverless function to get started.
              </div>
            </div>
          ` : html`
            <nr-menu
              size="small"
              .items=${this.getMenuItems()}
              @change=${this.handleMenuChange}
              @action-click=${this.handleActionClick}
            ></nr-menu>
          `}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'functions-panel': FunctionsPanel;
  }
}
