/**
 * Native Left Panel Component
 *
 * Replaces the micro-app based left panel with a native Lit component.
 * Handles pages list, workflow panel, and database panel.
 */

import { css, html, LitElement, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { $currentApplication, $editorState, $applicationPages, $currentPageId, setSelectedComponents } from '@nuraly/runtime/redux/store';
import { $applicationComponents } from '@nuraly/runtime/redux/store';
import { $environment, ViewMode } from '@nuraly/runtime/redux/store/environment';
import { deletePageAction, addPageAction } from '@nuraly/runtime/redux/actions';
import { deleteComponentAction } from '@nuraly/runtime/redux/actions';

interface MenuItem {
  id: string;
  text: string;
  icon: string;
  selected?: boolean;
  opened?: boolean;
  type?: string;
  page?: string;
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

    @media (prefers-color-scheme: dark) {
      :host {
        --panel-bg: #1a1a1a;
        --panel-border: #3a3a3a;
        --text-color: #e0e0e0;
        --hover-bg: #2a2a2a;
      }
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

    nr-menu {
      --nuraly-menu-border: none;
      --nuraly-menu-font-size: 13px;
      --nuraly-sub-menu-highlighted-background-color: transparent;
      --nuraly-menu-selected-link-border: 5px solid transparent;
      --nuraly-menu-selected-link-background-color: transparent;
      --nuraly-menu-selected-color: #5393f8;
      --nuraly-menu-link-icon-color: #222222e3;
      --nuraly-color-icon: #222222e3;
      --nuraly-menu-focus-border: 2px solid transparent;
      --nuraly-menu-focus-color: #5393f8;
      margin-left: 13px;
      margin-top: 11px;
      --nuraly-menu-link-padding-medium: 4px;
      height: calc(100vh - 120px);
      overflow-y: auto;
    }

    @media (prefers-color-scheme: dark) {
      nr-menu {
        --nuraly-menu-link-icon-color: #e0e0e0;
        --nuraly-color-icon: #e0e0e0;
      }
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

  private unsubscribeEditor?: () => void;
  private unsubscribePages?: () => void;
  private unsubscribeCurrentPage?: () => void;
  private unsubscribeComponents?: () => void;
  private unsubscribeEnv?: () => void;
  private unsubscribeApp?: () => void;

  override connectedCallback() {
    super.connectedCallback();

    this.unsubscribeApp = $currentApplication.subscribe((app) => {
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

    // Set up new subscriptions with valid appId
    this.unsubscribePages = $applicationPages(this.appId).subscribe((pages) => {
      this.pages = pages || [];
    });

    this.unsubscribeCurrentPage = $currentPageId(this.appId).subscribe((pageId) => {
      this.currentPageId = pageId || '';
    });

    this.unsubscribeComponents = $applicationComponents(this.appId).subscribe((components) => {
      this.components = components || [];
    });
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribeEditor?.();
    this.unsubscribePages?.();
    this.unsubscribeCurrentPage?.();
    this.unsubscribeComponents?.();
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

    return this.pages.map((page) => {
      const pageComponents = this.components.filter(c => c.pageId === page.uuid && !c.parent_id);

      const children = this.buildComponentTree(pageComponents, page.uuid, selectedComponentId);

      return {
        id: page.uuid,
        text: page.name,
        icon: 'file',
        type: 'page',
        selected: page.uuid === this.currentPageId,
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

  private handleMenuSelect(e: CustomEvent) {
    const item = e.detail;

    if (item.type === 'page') {
      $currentPageId(this.appId).set(item.id);
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
    const { action, value } = e.detail;

    if (action === 'delete') {
      if (value?.type === 'component' && value?.component) {
        deleteComponentAction(value.component);
      } else if (value?.type === 'page' && value?.page) {
        deletePageAction(value.page);
      }
    } else if (action === 'copy') {
      this.dispatchEvent(new CustomEvent('copy-component', {
        detail: { component: value?.component },
        bubbles: true,
        composed: true
      }));
    } else if (action === 'copyName') {
      const name = value?.component?.name;
      if (name) {
        navigator.clipboard.writeText(name);
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

  private renderPagesPanel() {
    const menuItems = this.buildMenuItems();

    return html`
      <div class="panel-header">
        <span class="panel-title">Pages</span>
        <nr-button
          size="small"
          variant="text"
          .iconLeft=${"plus"}
          @click=${this.handleAddPage}
        >Add Page</nr-button>
      </div>
      <div class="panel-content">
        <nr-menu
          .options=${menuItems}
          arrowPosition="left"
          @nr-menu-select=${this.handleMenuSelect}
          @nr-menu-action=${this.handleMenuAction}
        ></nr-menu>
      </div>
    `;
  }

  private renderWorkflowPanel() {
    return html`
      <div class="panel-header">
        <span class="panel-title">Workflows</span>
        <nr-button
          size="small"
          variant="text"
          .iconLeft=${"plus"}
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
        return this.renderPagesPanel();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "studio-left-panel": StudioLeftPanel;
  }
}
