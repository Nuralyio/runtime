/**
 * Native Control Panel (Right Panel) Component - Hybrid Approach
 *
 * Uses native Lit components for:
 * - Common properties (Name, ID, Display, Hash)
 * - Styling (Size, Spacing, Typography, Border, Background)
 * - Handlers (Event handlers)
 *
 * Type-specific properties use a simplified config-driven approach.
 * Wrapped in nr-panel for detachable/floating window support.
 */

import { css, html, LitElement, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { $editorState, $selectedComponents } from '@nuraly/runtime/redux/store';
import { $currentApplication } from '@nuraly/runtime/redux/store';
import type { ComponentElement } from '@nuraly/runtime/redux/store';

// Import native panels
import "./native/common-properties-panel.js";
import "./native/type-properties-panel.js";
import "./native/style-panel.js";
import "./native/handlers-panel.js";

@customElement("studio-control-panel")
export class StudioControlPanel extends LitElement {
  static override styles = css`
    :host {
      display: block;
      height: 100%;
      overflow: hidden;
    }

    nr-panel {
      height: 100%;
      --nuraly-panel-padding: 0;
      --nuraly-panel-header-padding: 4px 8px;
      --nuraly-panel-header-padding-small: 4px 8px;
      --nuraly-panel-header-font-size: 12px;
      --nuraly-panel-header-font-weight: 400;
      --nuraly-panel-body-padding-small: 0;
      --nuraly-panel-border-radius: var(--nuraly-border-radius-none);
    }

    nr-panel::part(body) {
      overflow-y: auto;
    }

    .panel-content {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      color: var(--text-secondary, #666);
      font-size: 14px;
      text-align: center;
      padding: 20px;
    }

    .empty-state nr-icon {
      font-size: 32px;
      margin-bottom: 12px;
      opacity: 0.5;
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
      padding: 0;
      overflow-y: auto;
    }

    .section-divider {
      height: 1px;
      background: var(--border-color, #e0e0e0);
      margin: 8px 0;
    }
  `;

  @state()
  private selectedComponent: ComponentElement | null = null;

  @state()
  private currentTab: { type: string; id?: string } = { type: 'page' };

  @state()
  private currentPageId: string = '';

  @state()
  private activeTabIndex: number = 0;

  @state()
  private panelMode: 'embedded' | 'window' = 'embedded';

  private unsubscribeEditor?: () => void;
  private unsubscribeSelectedComponents?: () => void;
  private unsubscribeApp?: () => void;

  override connectedCallback() {
    super.connectedCallback();

    this.unsubscribeApp = $currentApplication.subscribe(() => {
      // App subscription kept for future use
    });

    this.unsubscribeEditor = $editorState.subscribe((state) => {
      this.currentTab = state.currentTab || { type: 'page' };

      if (state.currentTab?.type === 'page' && state.currentTab?.id) {
        this.currentPageId = state.currentTab.id;
      }
    });

    this.unsubscribeSelectedComponents = $selectedComponents.subscribe((components) => {
      this.selectedComponent = components[0] || null;
    });
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribeEditor?.();
    this.unsubscribeSelectedComponents?.();
    this.unsubscribeApp?.();
  }

  private renderPropertiesTab() {
    return html`
      <div class="tab-content">
        <!-- Common Properties (Native) -->
        <common-properties-panel
          .component=${this.selectedComponent}
        ></common-properties-panel>

        <div class="section-divider"></div>

        <!-- Type-Specific Properties (Native with config) -->
        <type-properties-panel
          .component=${this.selectedComponent}
        ></type-properties-panel>
      </div>
    `;
  }

  private renderStyleTab() {
    return html`
      <div class="tab-content">
        <native-style-panel
          .component=${this.selectedComponent}
        ></native-style-panel>
      </div>
    `;
  }

  private renderHandlersTab() {
    return html`
      <div class="tab-content">
        <native-handlers-panel
          .component=${this.selectedComponent}
        ></native-handlers-panel>
      </div>
    `;
  }

  private renderPropertyTabs() {
    if (!this.selectedComponent && !this.currentPageId) {
      return html`
        <div class="empty-state">
          <nr-icon name="mouse-pointer"></nr-icon>
          <p>Select a component to view its properties</p>
        </div>
      `;
    }

    const tabs = [
      {
        label: 'Properties',
        icon: 'hammer',
        content: this.renderPropertiesTab()
      },
      {
        label: 'Style',
        icon: 'paintbrush',
        content: this.renderStyleTab()
      },
      {
        label: 'Handlers',
        icon: 'git-compare',
        content: this.renderHandlersTab()
      }
    ];

    return html`
      <nr-tabs
        size="small"
        align="stretch"
        .activeTab=${this.activeTabIndex}
        .tabs=${tabs}
        @nr-tab-click=${(e: CustomEvent) => this.activeTabIndex = e.detail.index}
      ></nr-tabs>
    `;
  }

  private renderFunctionPanel() {
    return html`
      <function-properties-panel
        .functionId=${this.currentTab.id}
      ></function-properties-panel>
    `;
  }

  private renderFilesPanel() {
    return html`
      <files-properties-panel></files-properties-panel>
    `;
  }

  private handlePanelModeChange(e: CustomEvent) {
    this.panelMode = e.detail.mode;
  }

  private getPanelTitle(): string {
    if (!this.selectedComponent) return 'Properties';
    return this.selectedComponent.name || this.selectedComponent.type || 'Properties';
  }

  override render() {
    return html`
      <nr-panel
        mode=${this.panelMode}
        title=${this.getPanelTitle()}
        icon="settings"
        size="custom"
        .resizable=${this.panelMode === 'window'}
        .draggable=${this.panelMode === 'window'}
        maximizePosition="center"
        @panel-mode-change=${this.handlePanelModeChange}
        @panel-restore-embedded=${() => this.panelMode = 'embedded'}
      >
        <div class="panel-content">
          ${this.currentTab.type === 'page' ? this.renderPropertyTabs() : nothing}
          ${this.currentTab.type === 'function' ? this.renderFunctionPanel() : nothing}
          ${this.currentTab.type === 'files' ? this.renderFilesPanel() : nothing}
        </div>
      </nr-panel>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "studio-control-panel": StudioControlPanel;
  }
}
