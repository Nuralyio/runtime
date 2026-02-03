/**
 * Workflow List Panel Component
 *
 * Displays a list of workflows for the current application using nr-menu.
 * Allows selecting, creating, and deleting workflows.
 */

import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { workflowService } from "../../../../services/workflow.service";
import { openEditorTab } from "@nuraly/runtime/redux/actions/editor/openEditorTab";
import { $editorState } from "@nuraly/runtime/redux/store";

interface MenuItem {
  id: string;
  text: string;
  icon: string;
  selected?: boolean;
  menu?: {
    icon: string;
    actions: Array<{
      label: string;
      value: string;
      icon: string;
      additionalData?: any;
    }>;
  };
}

@customElement("workflow-list-panel")
export class WorkflowListPanel extends LitElement {
  static override styles = css`
    :host {
      display: block;
      height: 100%;
      overflow-y: auto;
    }

    .menu-container {
      padding: 8px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px 16px;
      text-align: center;
      color: var(--text-secondary, #666);
    }

    .empty-state nr-icon {
      font-size: 32px;
      margin-bottom: 12px;
      opacity: 0.5;
    }

    .loading {
      display: flex;
      justify-content: center;
      padding: 32px;
    }
  `;

  @property({ type: String })
  appId: string = "";

  @state()
  private menuItems: MenuItem[] = [];

  @state()
  private isLoading = true;

  @state()
  private selectedWorkflowId: string = "";

  private unsubscribeEditor?: () => void;

  override connectedCallback() {
    super.connectedCallback();
    this.loadWorkflows();

    // Subscribe to editor state to track selected workflow
    this.unsubscribeEditor = $editorState.subscribe((state) => {
      if (state.currentTab?.type === "flow" && state.currentTab?.id) {
        this.selectedWorkflowId = state.currentTab.id;
        this.updateMenuSelection();
      }
    });
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribeEditor?.();
  }

  override updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has("appId") && this.appId) {
      this.loadWorkflows();
    }
  }

  public async loadWorkflows() {
    if (!this.appId) return;

    this.isLoading = true;
    try {
      const workflows = await workflowService.getWorkflowsByApplication(this.appId);
      this.menuItems = workflows.map((w) => ({
        id: w.id,
        text: w.name,
        icon: "git-branch",
        selected: w.id === this.selectedWorkflowId,
        menu: {
          icon: "ellipsis-vertical",
          actions: [
            {
              label: "Delete",
              value: "delete",
              icon: "trash",
              additionalData: { workflowId: w.id, workflowName: w.name },
            },
          ],
        },
      }));
    } catch (error) {
      console.error("Failed to load workflows:", error);
      this.menuItems = [];
    } finally {
      this.isLoading = false;
    }
  }

  private updateMenuSelection() {
    this.menuItems = this.menuItems.map((item) => ({
      ...item,
      selected: item.id === this.selectedWorkflowId,
    }));
  }

  private handleMenuChange(e: CustomEvent) {
    const { path } = e.detail;
    const index = path[0];
    const item = this.menuItems[index];

    if (!item) return;

    this.selectedWorkflowId = item.id;

    // Open workflow in editor tab
    openEditorTab({
      id: item.id,
      type: "flow",
      label: item.text,
      detail: { workflowId: item.id, appId: this.appId },
    });
  }

  private async handleMenuAction(e: CustomEvent) {
    const { value: action, item } = e.detail;
    const additionalData = item?.additionalData;

    if (action === "delete" && additionalData?.workflowId) {
      if (!confirm(`Are you sure you want to delete "${additionalData.workflowName}"?`)) {
        return;
      }

      try {
        await workflowService.deleteWorkflow(additionalData.workflowId);
        this.menuItems = this.menuItems.filter((w) => w.id !== additionalData.workflowId);
      } catch (error) {
        console.error("Failed to delete workflow:", error);
        alert("Failed to delete workflow");
      }
    }
  }

  override render() {
    if (this.isLoading) {
      return html`
        <div class="loading">
          <nr-spinner size="small"></nr-spinner>
        </div>
      `;
    }

    if (this.menuItems.length === 0) {
      return html`
        <div class="empty-state">
          <nr-icon name="git-branch"></nr-icon>
          <p>No workflows yet</p>
          <span>Click "Add Workflow" to create one</span>
        </div>
      `;
    }

    return html`
      <div class="menu-container">
        <nr-menu
          .items=${this.menuItems}
          @change=${(e: CustomEvent) => this.handleMenuChange(e)}
          @action-click=${(e: CustomEvent) => this.handleMenuAction(e)}
          style="
            --nuraly-menu-border: none;
            --nuraly-menu-font-size: 13px;
            --nuraly-sub-menu-highlighted-background-color: transparent;
            --nuraly-menu-selected-link-border: 2px solid transparent;
            --nuraly-menu-selected-link-background-color: rgba(83, 147, 248, 0.1);
            --nuraly-menu-selected-color: #5393f8;
            --nuraly-menu-link-icon-color: #222222e3;
            --nuraly-color-icon: #222222e3;
            --nuraly-menu-focus-border: 2px solid transparent;
            --nuraly-menu-focus-color: #5393f8;
            --nuraly-menu-link-border: 2px solid transparent;
            --nuraly-menu-link-border-radius: 4px;
            --nuraly-menu-link-padding: 4px 8px;
            --nuraly-menu-link-padding-medium: 4px 8px;
            --nuraly-menu-link-padding-small: 4px 8px;
            --nuraly-menu-selected-link-padding: 4px 8px;
          "
        ></nr-menu>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "workflow-list-panel": WorkflowListPanel;
  }
}
