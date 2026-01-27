/**
 * Native Left Panel Component
 *
 * Replaces the micro-app based left panel with a native Lit component.
 * Handles pages list, workflow panel, and database panel.
 */

import { css, html, LitElement, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { $currentApplication, $editorState, $applicationPages, $currentPageId, setSelectedComponents, $selectedComponents } from '@nuraly/runtime/redux/store';
import { $applicationComponents } from '@nuraly/runtime/redux/store';
import { $environment, ViewMode } from '@nuraly/runtime/redux/store/environment';
import { deletePageAction, addPageAction, updatePageAction } from '@nuraly/runtime/redux/actions';
import { deleteComponentAction, updateComponentName } from '@nuraly/runtime/redux/actions';
import { openEditorTab } from '@nuraly/runtime/redux/actions/editor/openEditorTab';
import { workflowService } from '../../../../services/workflow.service';

// Import revision panel
import "../../../runtime/components/ui/components/utility/RevisionPanel/RevisionPanel.js";

// Import workflow list panel
import "./WorkflowListPanel.js";

interface MenuItem {
  id?: string;  // Custom: uuid of page/component
  text: string;
  icon?: string;
  selected?: boolean;
  opened?: boolean;
  editable?: boolean;  // Allow inline label editing
  type?: string;  // Custom: 'page' or undefined for components
  page?: string;  // Custom: parent page uuid for components
  children?: MenuItem[];
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

// Store menu items for lookup by path
let menuItemsCache: MenuItem[] = [];

@customElement("studio-left-panel")
export class StudioLeftPanel extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      flex-direction: column;
      width: 300px;
      height: 100%;
      background: var(--panel-bg, white);
      border-right: 1px solid var(--panel-border, #e0e0e0);
    }

    .panel-container {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    nr-tabs {
      flex: 1;
      display: flex;
      flex-direction: column;
      --nuraly-spacing-tabs-content-padding-small: 0;
      --nuraly-border-width-tabs-content-top: 0px;
      --nuraly-border-width-tabs-top: 0px;
      --nuraly-border-width-tabs-right: 0px;
      --nuraly-border-width-tabs-bottom: 1px;
      --nuraly-border-width-tabs-left: 0px;
    }

    .tab-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      border-bottom: 1px solid var(--panel-border, #e0e0e0);
    }

    .panel-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-color, #333);
    }

    .panel-content {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
    }

    .pages-content {
      flex: 1;
      overflow-y: auto;
    }

    .pages-header {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding: 4px 8px;
      border-bottom: 1px solid var(--panel-border, #e0e0e0);
    }

    .add-button {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      cursor: pointer;
      border-radius: 4px;
      font-size: 12px;
      color: var(--text-color, #333);
    }

    .add-button:hover {
      background: var(--hover-bg, #f5f5f5);
    }

  `;

  @state()
  private tabType: string = 'page';

  @state()
  private pages: any[] = [];

  @state()
  private currentPageId: string = '';

  @state()
  private components: any[] = [];

  @state()
  private selectedComponents: any[] = [];

  @state()
  private appId: string = '';

  @state()
  private mode: ViewMode = ViewMode.Edit;

  @state()
  private activeTabIndex: number = 0;

  private unsubscribeEditor?: () => void;
  private unsubscribePages?: () => void;
  private unsubscribeCurrentPage?: () => void;
  private unsubscribeComponents?: () => void;
  private unsubscribeSelectedComponents?: () => void;
  private unsubscribeEnv?: () => void;
  private unsubscribeApp?: () => void;

  override connectedCallback() {
    super.connectedCallback();

    this.unsubscribeApp = $currentApplication.subscribe((app: any) => {
      if (app?.uuid && app.uuid !== this.appId) {
        this.appId = app.uuid;
        // Set up app-specific subscriptions after we have the appId
        this.setupAppSubscriptions();
      }
    });

    this.unsubscribeEnv = $environment.subscribe((env) => {
      this.mode = env.mode;
    });

    this.unsubscribeEditor = $editorState.subscribe((state) => {
      const stateTabType = state.currentTab?.type;
      if (stateTabType) {
        this.tabType = stateTabType;
      }
    });
  }

  private setupAppSubscriptions() {
    // Clean up existing subscriptions
    this.unsubscribePages?.();
    this.unsubscribeCurrentPage?.();
    this.unsubscribeComponents?.();
    this.unsubscribeSelectedComponents?.();

    // Set up new subscriptions with valid appId
    this.unsubscribeCurrentPage = $currentPageId(this.appId).subscribe((pageId) => {
      if (pageId) {
        this.currentPageId = pageId;
      }
    });

    this.unsubscribePages = $applicationPages(this.appId).subscribe((pages: any[]) => {
      this.pages = pages || [];
      // If no current page is set and we have pages, set the first page
      if (!this.currentPageId && pages && pages.length > 0) {
        const firstPageId = pages[0].uuid;
        this.currentPageId = firstPageId;
        $currentPageId(this.appId).set(firstPageId);
      }
    });

    this.unsubscribeComponents = $applicationComponents(this.appId).subscribe((components) => {
      this.components = components || [];
    });

    // Subscribe to global selected components
    this.unsubscribeSelectedComponents = $selectedComponents.subscribe((components) => {
      this.selectedComponents = components || [];
    });
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribeEditor?.();
    this.unsubscribePages?.();
    this.unsubscribeCurrentPage?.();
    this.unsubscribeComponents?.();
    this.unsubscribeSelectedComponents?.();
    this.unsubscribeEnv?.();
    this.unsubscribeApp?.();
  }

  private getComponentIcon(type: string, input?: any): string {
    const iconMap: Record<string, string> = {
      'text_label': 'case-sensitive',
      'rich_text': 'whole-word',
      'link': 'link',
      'menu': 'menu',
      'tag': 'tag',
      'textarea': 'text-cursor-input',
      'badge': 'badge',
      'checkbox': 'square-check',
      'table': 'table',
      'select': 'list-video',
      'text_input': 'text-cursor-input',
      'image': 'image',
      'icon': 'badge',
      'date_picker': 'calendar',
      'collection': 'layer-group',
      'ref_component': 'crosshairs',
      'file_upload': 'file-up',
      'button_input': 'rectangle-horizontal',
      'modal': 'square-stack',
      'container': input?.direction?.value === 'horizontal' ? 'grip-horizontal' : 'grip-vertical',
      'form': 'square-pen',
      'dropdown': 'chevron-down',
      'code': 'file-code',
      'video': 'video',
      'document': 'asterisk',
      'workflow_wrapper': 'workflow',
      'chatbot_wrapper': 'message-circle',
      'grid_row': 'rows-3',
      'grid_col': 'columns-3',
      'embed_url': 'file-code'
    };
    return iconMap[type] || 'smile';
  }

  private buildMenuItems(): MenuItem[] {
    const selectedComponentId = this.selectedComponents[0]?.uuid;

    const items = this.pages.map((page) => {
      // Get root components for this page (components without parent or with root=true)
      const pageComponents = this.components.filter(c =>
        c.pageId === page.uuid && (c.root === true || !c.parent_id)
      );

      const children = this.buildComponentTree(pageComponents, page.uuid, selectedComponentId);

      return {
        id: page.uuid,
        text: page.name,
        icon: 'file',
        type: 'page',
        editable: true,
        selected: false, // Pages have children, don't show selected bg
        opened: page.uuid === this.currentPageId,
        children,
        menu: {
          icon: 'ellipsis-vertical',
          actions: [
            {
              label: 'Delete',
              value: 'delete',
              icon: 'trash',
              additionalData: { type: 'page', page }
            }
          ]
        }
      };
    });

    // Cache for path lookup
    menuItemsCache = items;
    return items;
  }

  // Get menu item by path (array of indices)
  private getItemByPath(path: number[]): MenuItem | null {
    let items = menuItemsCache;
    let item: MenuItem | null = null;

    for (const index of path) {
      if (!items || index >= items.length) return null;
      item = items[index];
      items = item.children || [];
    }

    return item;
  }

  private buildComponentTree(components: any[], pageId: string, selectedComponentId?: string): MenuItem[] {
    return components.map((component) => {
      const childComponents = this.components.filter(c =>
        component.children_ids?.includes(c.uuid)
      );

      const children = childComponents.length > 0
        ? this.buildComponentTree(childComponents, pageId, selectedComponentId)
        : undefined;

      return {
        id: component.uuid,
        text: component.name,
        icon: this.getComponentIcon(component.type, component.input),
        page: pageId,
        editable: true,
        selected: component.uuid === selectedComponentId,
        children,
        menu: {
          icon: 'ellipsis-vertical',
          actions: [
            {
              label: 'Delete',
              value: 'delete',
              icon: 'trash',
              additionalData: { type: 'component', component }
            },
            {
              label: 'Copy',
              value: 'copy',
              icon: 'copy',
              additionalData: { type: 'component', component }
            },
            {
              label: 'Copy Name',
              value: 'copyName',
              icon: 'clipboard-copy',
              additionalData: { type: 'component', component }
            }
          ]
        }
      };
    });
  }

  private handleMenuChange(e: CustomEvent) {
    // change event gives { path, value } where path is array of indices
    const { path } = e.detail;
    const item = this.getItemByPath(path);

    if (!item) return;

    if (item.type === 'page') {
      $currentPageId(this.appId).set(item.id!);
      // Clear selection when switching pages
      this.selectedComponents = [];
      setSelectedComponents([]);
    } else {
      // Component selected
      if (item.page && item.page !== this.currentPageId) {
        $currentPageId(this.appId).set(item.page);
      }
      const component = this.components.find(c => c.uuid === item.id);
      if (component) {
        this.selectedComponents = [component];
        // Update global selection state
        setSelectedComponents([component]);
        // Dispatch selection event for other components to react
        this.dispatchEvent(new CustomEvent('component-selected', {
          detail: { components: [component] },
          bubbles: true,
          composed: true
        }));
      }
    }
  }

  private handleMenuAction(e: CustomEvent) {
    // action-click event gives { value, path, item, originalEvent, close }
    const { value: action, item } = e.detail;
    const additionalData = item?.additionalData;

    if (action === 'delete') {
      if (additionalData?.type === 'component' && additionalData?.component) {
        const comp = additionalData.component;
        deleteComponentAction(comp.uuid, comp.application_id);
      } else if (additionalData?.type === 'page' && additionalData?.page) {
        deletePageAction(additionalData.page);
      }
    } else if (action === 'copy') {
      this.dispatchEvent(new CustomEvent('copy-component', {
        detail: { component: additionalData?.component },
        bubbles: true,
        composed: true
      }));
    } else if (action === 'copyName') {
      const name = additionalData?.component?.name;
      if (name) {
        navigator.clipboard.writeText(name);
      }
    }
  }

  private handleLabelEdit(e: CustomEvent) {
    const { path, oldValue, newValue, item } = e.detail;

    if (!newValue || newValue === oldValue) return;

    // Get the item from path if not provided directly
    const menuItem = item || this.getItemByPath(path);
    if (!menuItem) return;

    if (menuItem.type === 'page' && menuItem.id) {
      // Rename page
      const page = this.pages.find(p => p.uuid === menuItem.id);
      if (page) {
        updatePageAction({ ...page, name: newValue }, this.appId);
      }
    } else if (menuItem.id) {
      // Rename component
      const component = this.components.find(c => c.uuid === menuItem.id);
      if (component) {
        updateComponentName(
          component.application_id,
          component.uuid,
          newValue,
          true
        );
      }
    }
  }

  private handleAddPage() {
    addPageAction({
      application_id: this.appId,
      name: 'New Page',
      url: ''
    });
  }

  private renderPagesContent() {
    const menuItems = this.buildMenuItems();

    return html`
      <div class="tab-content">
        <div class="pages-header">
          <nr-button
            size="small"
            variant="text"
            .iconLeft=${"plus"}
            @click=${() => this.handleAddPage()}
          >Add Page</nr-button>
        </div>
        <div class="pages-content">
          <nr-menu
            .items=${menuItems}
            arrowPosition="left"
            @change=${(e: CustomEvent) => this.handleMenuChange(e)}
            @action-click=${(e: CustomEvent) => this.handleMenuAction(e)}
            @label-edit=${(e: CustomEvent) => this.handleLabelEdit(e)}
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
              --nuraly-sub-menu-link-padding: 4px 8px;
              --nuraly-sub-menu-selected-link-padding: 4px 8px;
              margin: 8px;
              height: calc(100vh - 160px);
              overflow-y: auto;
            "
          ></nr-menu>
        </div>
      </div>
    `;
  }

  private renderRevisionsContent() {
    return html`
      <div class="tab-content">
        <revision-panel></revision-panel>
      </div>
    `;
  }

  private renderMainPanel() {
    const tabs = [
      {
        label: 'Pages',
        icon: 'file',
        content: this.renderPagesContent()
      },
      {
        label: 'Revisions',
        icon: 'history',
        content: this.renderRevisionsContent()
      }
    ];

    return html`
      <div class="panel-container">
        <nr-tabs
          size="small"
          align="stretch"
          .activeTab=${this.activeTabIndex}
          .tabs=${tabs}
          @nr-tab-click=${(e: CustomEvent) => this.activeTabIndex = e.detail.index}
        ></nr-tabs>
      </div>
    `;
  }

  private async handleAddWorkflow() {
    const name = prompt("Enter workflow name:", "New Workflow");
    if (!name) return;

    try {
      const workflow = await workflowService.createWorkflow(this.appId, name);

      // Open the new workflow in editor
      openEditorTab({
        id: workflow.id,
        type: "flow",
        label: workflow.name,
        detail: { workflowId: workflow.id },
      });

      // Refresh the workflow list
      const listPanel = this.shadowRoot?.querySelector("workflow-list-panel") as any;
      if (listPanel?.loadWorkflows) {
        listPanel.loadWorkflows();
      }
    } catch (error) {
      console.error("Failed to create workflow:", error);
      alert("Failed to create workflow");
    }
  }

  private renderWorkflowPanel() {
    return html`
      <div class="panel-header">
        <span class="panel-title">Workflows</span>
        <nr-button
          size="small"
          variant="text"
          .iconLeft=${"plus"}
          @click=${() => this.handleAddWorkflow()}
        >Add Workflow</nr-button>
      </div>
      <div class="panel-content">
        <workflow-list-panel .appId=${this.appId}></workflow-list-panel>
      </div>
    `;
  }

  private renderDatabasePanel() {
    return html`
      <div class="panel-header">
        <span class="panel-title">Database</span>
        <nr-button
          size="small"
          variant="text"
          .iconLeft=${"plus"}
        >Add Table</nr-button>
      </div>
      <div class="panel-content">
        <database-list-panel .appId=${this.appId}></database-list-panel>
      </div>
    `;
  }

  override render() {
    if (this.mode !== ViewMode.Edit) {
      return nothing;
    }

    switch (this.tabType) {
      case 'flow':
        return this.renderWorkflowPanel();
      case 'database':
        return this.renderDatabasePanel();
      default:
        return this.renderMainPanel();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "studio-left-panel": StudioLeftPanel;
  }
}
