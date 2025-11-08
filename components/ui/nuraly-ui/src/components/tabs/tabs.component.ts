/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, LitElement, nothing, PropertyValueMap } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styles } from './tabs.style.js';
import {
  TabOrientation,
  TabsAlign,
  TabSize,
  TabType,
  TabEditable,
  TabsPanelConfig,
  TabEvent,
  TabItem,
  TabClickEventDetail,
  EMPTY_STRING,
  DEFAULT_ACTIVE_TAB
} from './tabs.types.js';
import { NuralyUIBaseMixin } from '@nuralyui/common/mixins';

// Import panel component
import '../panel/index.js';
import { PanelMode } from '../panel/panel.types.js';

// Import controllers
import {
  TabsKeyboardController,
  TabsDragDropController,
  TabsEditableController,
  TabsEventController,
  type TabsKeyboardHost,
  type TabsDragDropHost,
  type TabsEditableHost,
  type TabsEventHost
} from './controllers/index.js';

/**
 * Versatile tabs component with support for multiple orientations, editable tabs, drag & drop, and optional panel wrapper.
 * 
 * @example
 * ```html
 * <!-- Basic usage -->
 * <nr-tabs .tabs=${tabs} activeTab="0"></nr-tabs>
 * 
 * <!-- With editing capabilities -->
 * <nr-tabs .tabs=${tabs} .editable=${{canAddTab: true, canDeleteTab: true}}></nr-tabs>
 * 
 * <!-- Vertical orientation -->
 * <nr-tabs .tabs=${tabs} orientation="vertical" align="left"></nr-tabs>
 * 
 * <!-- Stretch tabs to fill full width with equal sizes -->
 * <nr-tabs .tabs=${tabs} align="stretch"></nr-tabs>
 * 
 * <!-- Pannable tabs (disabled by default) -->
 * <nr-tabs .tabs=${tabs} .panelConfig=${{enabled: true, resizable: true, title: "My Tabs"}}></nr-tabs>
 * ```
 * 
 * @fires nr-tab-click - Tab clicked
 * @fires nr-tab-change - Active tab changed
 * @fires nr-tab-add - New tab requested
 * @fires nr-tab-remove - Tab removal requested
 * @fires nr-tab-edit - Tab edited
 * @fires nr-tab-order-change - Tab order changed via drag & drop
 * @fires nr-tabs-panel-close - Panel closed (when pannable)
 * @fires nr-tabs-panel-minimize - Panel minimized (when pannable)
 * @fires nr-tabs-panel-resize - Panel resized (when pannable)
 * 
 * @slot default - Tab content
 */
@customElement('nr-tabs')
export class NrTabsElement extends NuralyUIBaseMixin(LitElement) implements 
  TabsKeyboardHost,
  TabsDragDropHost,
  TabsEditableHost,
  TabsEventHost {
  static override styles = styles;
  
  /** Currently active tab index */
  @property({ type: Number })
  activeTab = DEFAULT_ACTIVE_TAB;

  /** Tab orientation (horizontal, vertical) */
  @property({ type: String })
  orientation: TabOrientation = TabOrientation.Horizontal;

  /** Tab alignment (left, center, right, stretch) */
  @property({ type: String })
  align: TabsAlign = TabsAlign.Left;

  /** Tab size (small, medium, large) */
  @property({ type: String, attribute: 'size' })
  tabSize: TabSize = TabSize.Medium;

  /** Tab type/variant */
  @property({ type: String, attribute: 'type' })
  variant: TabType = TabType.Default;

  /** Editable configuration */
  @property({ type: Object })
  editable?: TabEditable;

  /** Array of tab items */
  @property({ type: Array })
  tabs: TabItem[] = [];

  /** Whether tabs are animated */
  @property({ type: Boolean })
  animated = true;

  /** Whether to destroy inactive tab content */
  @property({ type: Boolean })
  destroyInactiveTabPane = false;

  /** Custom aria-label for the tabs container */
  @property({ type: String })
  tabsAriaLabel = EMPTY_STRING;

  /** Panel configuration for making tabs pannable */
  @property({ type: Object })
  panelConfig?: TabsPanelConfig;

  override requiredComponents = ['nr-icon', 'nr-panel'];

  // Controllers - automatically connected via Lit's reactive controller system
  private keyboardController = new TabsKeyboardController(this);
  private dragDropController = new TabsDragDropController(this);
  private editableController = new TabsEditableController(this);
  private eventController = new TabsEventController(this);

  override connectedCallback() {
    super.connectedCallback();
    this.validateDependencies();
    this.observeChildrenChanges();
    
    // Ensure controllers are properly referenced for TypeScript
    void this.keyboardController;
    void this.dragDropController;
    void this.editableController;
    void this.eventController;
  }

  override render() {
    const tabsContent = this.renderTabsContent();
    
    // Only wrap with panel if explicitly enabled
    if (this.panelConfig?.enabled) {
      return this.renderWithPanel(tabsContent);
    }
    
    // Default: return just the tabs content
    return tabsContent;
  }

  private renderTabsContent() {
    return html`
      <div
        class=${classMap({
          'tabs-container': true,
          'vertical-align': this.orientation === TabOrientation.Vertical,
          'horizontal-align': this.orientation === TabOrientation.Horizontal,
          'right-align': this.align === TabsAlign.Right,
          'left-align': this.align === TabsAlign.Left,
          'center-align': this.align === TabsAlign.Center,
          'stretch-align': this.align === TabsAlign.Stretch,
        })}
        role="tablist"
        aria-label="${this.tabsAriaLabel || nothing}"
        data-theme="${this.currentTheme}"
        data-size="${this.tabSize}"
        data-type="${this.variant}"
      >
        <div
          class="tab-labels"
          style="flex-direction: ${this.orientation === TabOrientation.Vertical ? 'column' : 'row'}"
        >
          <div></div>
          ${this.renderTabs()}
          <div></div>
        </div>
        <div class="tab-content" role="tabpanel">
          ${this.renderActiveTab()}
        </div>
      </div>
    `;
  }

  private renderWithPanel(tabsContent: any) {
    if (!this.isComponentAvailable('nr-panel')) {
      console.warn('[nr-tabs] Panel component not available. Rendering without panel.');
      return tabsContent;
    }

    // Only pass width/height if explicitly set, otherwise let panel size naturally
    const panelProps: any = {
      mode: this.panelConfig?.mode || PanelMode.Embedded,
      size: this.panelConfig?.size || this.tabSize, // Use tabs size if panel size not specified
      resizable: this.panelConfig?.resizable ?? true,
      draggable: this.panelConfig?.draggable ?? true,
      closable: this.panelConfig?.closable ?? false,
      minimizable: this.panelConfig?.minimizable ?? true,
      title: this.panelConfig?.title || 'Tabs',
      icon: this.panelConfig?.icon || ''
    };

    // Only set dimensions if explicitly provided
    if (this.panelConfig?.width) {
      panelProps.width = this.panelConfig.width;
    }
    if (this.panelConfig?.height) {
      panelProps.height = this.panelConfig.height;
    }

    return html`
      <nr-panel
        class="tabs-panel-wrapper"
        .mode=${panelProps.mode}
        .size=${panelProps.size}
        .resizable=${panelProps.resizable}
        .draggable=${panelProps.draggable}
        .closable=${panelProps.closable}
        .minimizable=${panelProps.minimizable}
        .title=${panelProps.title}
        .icon=${panelProps.icon}
        .width=${panelProps.width || ''}
        .height=${panelProps.height || ''}
        @panel-close=${this.handlePanelClose}
        @panel-minimize=${this.handlePanelMinimize}
        @panel-resize=${this.handlePanelResize}
        style="
          ${this.panelConfig?.mode === PanelMode.Embedded ? 
            'width: 100% !important; height: auto !important; min-height: 0;' : 
            ''}
          ${!panelProps.width && this.panelConfig?.mode !== PanelMode.Embedded ? 'width: auto;' : ''}
          ${!panelProps.height && this.panelConfig?.mode !== PanelMode.Embedded ? 'height: auto;' : ''}
        "
      >
        ${tabsContent}
      </nr-panel>
    `;
  }

  private observeChildrenChanges() {
    const mutationObserver = new MutationObserver(() => {
      // Handle dynamic tab changes if needed
      this.requestUpdate();
    });

    mutationObserver.observe(this, { childList: true });
  }

  private renderDeleteIcon(tab: TabItem, tabIndex: number) {
    if (!this.editableController.canDeleteTab(tab)) return nothing;

    if (!this.isComponentAvailable('nr-icon')) {
      console.warn('[nr-tabs] Icon component not available. Delete icon will not render.');
      return nothing;
    }

    return html`
      <nr-icon
        name="window-close"
        class="close-icon"
        @mousedown=${(e: MouseEvent) => {
          e.stopPropagation();
          this.editableController.handleRemoveTab(tabIndex);
        }}
      ></nr-icon>
    `;
  }

  private renderTabs() {
    const tabs = [];
    
    for (let tabIndex = 0; tabIndex < this.tabs.length; tabIndex++) {
      const tab = this.tabs[tabIndex];
      const isActive = tabIndex === this.activeTab;
      
      // Determine tab position for border radius
      const isFirstTab = tabIndex === 0;
      const isLastTab = tabIndex === this.tabs.length - 1;
      const isSingleTab = this.tabs.length === 1;
      const isMiddleTab = !isFirstTab && !isLastTab && !isSingleTab;
      
      const tabElement = html`
        <div
          data-index=${tabIndex}
          draggable=${this.dragDropController.getDraggableState() ? 'true' : 'false'}
          @dragenter=${(e: DragEvent) => this.dragDropController.handleDragEnter(e)}
          @dragleave=${(e: DragEvent) => this.dragDropController.handleDragLeave(e)}
          @dragstart=${(e: DragEvent) => this.dragDropController.handleDragStart(e)}
          @drop=${(e: DragEvent) => this.dragDropController.handleDrop(e)}
          class=${classMap({
            'tab-label': true,
            'active': isActive,
            'disabled': !!tab.disabled,
            'first-tab': isFirstTab && this.orientation === TabOrientation.Horizontal,
            'middle-tab': isMiddleTab && this.orientation === TabOrientation.Horizontal,
            'last-tab': isLastTab && this.orientation === TabOrientation.Horizontal,
            'single-tab': isSingleTab && this.orientation === TabOrientation.Horizontal
          })}
          role="tab"
          aria-selected=${isActive ? 'true' : 'false'}
          aria-disabled=${tab.disabled ? 'true' : 'false'}
          tabindex=${isActive ? '0' : '-1'}
          @click=${(e: MouseEvent) => this.eventController.handleTabClick(tabIndex, e)}
        >
          ${tab.icon && this.isComponentAvailable('nr-icon') 
            ? html`<nr-icon name=${tab.icon} class="tab-icon"></nr-icon>` 
            : nothing}
          
          <span class="tab-text" 
                contenteditable=${this.editableController.getContentEditableAttribute(tab) || nothing}
                @blur=${(event: Event) => this.editableController.handleTabTitleBlur(event, tabIndex)}
                @keydown=${(event: KeyboardEvent) => this.editableController.handleTabTitleKeyDown(event, tabIndex)}
          >${tab.label}</span>
          
          ${this.renderDeleteIcon(tab, tabIndex)}
        </div>
      `;
      tabs.push(tabElement);
    }

    // Add tab button
    if (this.editableController.canAddTab()) {
      const addTabElement = html`
        <div
          class="tab-label add-tab-label"
          role="button"
          aria-label="Add new tab"
          tabindex="0"
          @mousedown=${() => {
            this.editableController.handleAddTab();
          }}
          @keydown=${(e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              this.editableController.handleAddTab();
            }
          }}
        >
          ${this.isComponentAvailable('nr-icon') 
            ? html`<nr-icon name="plus" class="add-tab-icon"></nr-icon>`
            : html`<span>+</span>`}
        </div>
      `;
      tabs.push(addTabElement);
    }

    return tabs;
  }

  override updated(changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>) {
    super.updated(changedProperties);
    
    // Validate active tab index
    if (this.activeTab >= this.tabs.length) {
      this.activeTab = Math.max(0, this.tabs.length - 1);
    } else if (this.activeTab < 0) {
      this.activeTab = 0;
    }
  }

  private renderActiveTab() {
    if (this.tabs.length === 0 || this.activeTab < 0 || this.activeTab >= this.tabs.length) {
      return nothing;
    }

    const activeTab = this.tabs[this.activeTab];
    return html`${activeTab.content || nothing}`;
  }

  setActiveTab(index: number, event?: Event) {
    // Handle MouseEvent specifically for drag behavior
    if (event instanceof MouseEvent) {
      // For click events when drag is enabled, we don't need to prevent default
      // as the drag operation should take precedence over click for dragging
      const canMove = this.editable?.canMove ?? false;
      if (!canMove) {
        event.preventDefault();
      }
    }
    
    if (index < 0 || index >= this.tabs.length || this.tabs[index].disabled) {
      return;
    }

    const previousIndex = this.activeTab;
    const tab = this.tabs[index];
    
    this.activeTab = index;
    
    // Dispatch events
    this.dispatchEventWithMetadata(TabEvent.TabClick, {
      index,
      tab,
      previousIndex
    } as TabClickEventDetail);
    
    if (previousIndex !== index) {
      this.dispatchEventWithMetadata(TabEvent.TabChange, {
        index,
        tab,
        previousIndex
      } as TabClickEventDetail);
    }
  }

  private handlePanelClose() {
    this.dispatchEvent(new CustomEvent('nr-tabs-panel-close', { bubbles: true }));
  }

  private handlePanelMinimize() {
    this.dispatchEvent(new CustomEvent('nr-tabs-panel-minimize', { bubbles: true }));
  }

  private handlePanelResize(event: CustomEvent) {
    this.dispatchEvent(new CustomEvent('nr-tabs-panel-resize', { 
      bubbles: true, 
      detail: event.detail 
    }));
  }
}
