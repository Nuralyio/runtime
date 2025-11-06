/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, LitElement, nothing, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import {
  PanelMode,
  PanelSize,
  PanelPosition,
  MaximizePosition,
  EMPTY_STRING
} from './panel.types.js';
import { styles } from './panel.style.js';
import { NuralyUIBaseMixin } from '@nuralyui/common/mixins';

// Import icon component
import '../icon/index.js';

// Import controllers
import {
  PanelDragController,
  PanelDragHost,
  PanelResizeController,
  PanelResizeHost
} from './controllers/index.js';

/**
 * Versatile panel component that can transform between panel and window modes.
 * 
 * Features:
 * - Transform between panel (docked) and window (floating) modes
 * - Draggable in window mode
 * - Resizable panels
 * - Collapsible content
 * - Minimizable to compact view
 * - Theme-aware styling with light/dark mode support
 * - Multiple size presets
 * - Positioned docking (left, right, top, bottom)
 * 
 * @example
 * ```html
 * <!-- Panel docked to right side -->
 * <nr-panel
 *   title="Settings Panel"
 *   mode="panel"
 *   position="right"
 *   size="medium">
 *   <p>Panel content here</p>
 * </nr-panel>
 * 
 * <!-- Floating draggable window -->
 * <nr-panel
 *   title="Tool Window"
 *   mode="window"
 *   draggable
 *   resizable
 *   size="medium">
 *   <p>Window content here</p>
 * </nr-panel>
 * ```
 * 
 * @fires panel-mode-change - Panel mode changed
 * @fires panel-close - Panel closed
 * @fires panel-minimize - Panel minimized
 * @fires panel-maximize - Panel maximized/restored
 * @fires panel-drag-start - Panel drag started
 * @fires panel-drag-end - Panel drag ended
 * @fires panel-resize - Panel resized
 * 
 * @slot default - Panel body content
 * @slot header - Custom header content
 * @slot footer - Custom footer content
 */
@customElement('nr-panel')
export class NrPanelElement extends NuralyUIBaseMixin(LitElement) 
  implements PanelDragHost, PanelResizeHost {
  static override styles = styles;

  override requiredComponents = ['nr-icon'];

  /** Panel mode (panel, window, minimized) */
  @property({ type: String })
  mode: PanelMode = PanelMode.Panel;

  /** Panel size */
  @property({ type: String })
  size: PanelSize = PanelSize.Medium;

  /** Panel position (for panel mode) */
  @property({ type: String })
  position: PanelPosition = PanelPosition.Right;

  /** Position where the window appears when maximizing from embedded mode */
  @property({ type: String })
  maximizePosition: MaximizePosition = MaximizePosition.Center;

  /** Whether the panel can be dragged (window mode only) */
  @property({ type: Boolean })
  override draggable = true;

  /** Whether the panel is resizable */
  @property({ type: Boolean })
  resizable = false;

  /** Whether the panel content can be collapsed */
  @property({ type: Boolean })
  collapsible = false;

  /** Whether the panel can be minimized */
  @property({ type: Boolean })
  minimizable = true;

  /** Whether the panel can be closed */
  @property({ type: Boolean })
  closable = true;

  /** Whether to enable smooth animations for position/mode changes */
  @property({ type: Boolean })
  animated = false;

  /** Panel title */
  @property({ type: String })
  override title = EMPTY_STRING;

  /** Header icon */
  @property({ type: String })
  icon = EMPTY_STRING;

  /** Custom width */
  @property({ type: String })
  width = EMPTY_STRING;

  /** Custom height */
  @property({ type: String })
  height = EMPTY_STRING;

  /** Whether the panel is open/visible */
  @property({ type: Boolean, reflect: true })
  open = true;

  /** Collapsed state */
  @state()
  private collapsed = false;

  /** Dragging state */
  @state()
  isDragging = false;

  /** Animation state */
  @state()
  private animating = false;

  /** Current X offset for dragging */
  @property({ type: Number })
  offsetX = 0;

  /** Current Y offset for dragging */
  @property({ type: Number })
  offsetY = 0;

  /** Current panel width */
  @property({ type: Number })
  panelWidth = 0;

  /** Current panel height */
  @property({ type: Number })
  panelHeight = 0;

  /** Original mode before any transformations (for restoration from minimized) */
  @state()
  private originalMode: PanelMode | null = null;

  /** Track if panel is maximized from embedded mode */
  @state()
  private isMaximizedFromEmbedded = false;

  /** Track if this is the first update to capture initial mode */
  @state()
  private isFirstUpdate = true;

  // Controllers
  private dragController = new PanelDragController(this);
  // @ts-ignore - Controller handles events through listeners, doesn't need direct reference
  private _resizeController = new PanelResizeController(this);

  override connectedCallback() {
    super.connectedCallback();
    this.validateDependencies();
    this.animating = true;
    setTimeout(() => {
      this.animating = false;
    }, 300);
  }

  override willUpdate(changedProperties: PropertyValues) {
    super.willUpdate(changedProperties);

    // Capture the original mode on first update
    if (this.isFirstUpdate && this.mode) {
      this.originalMode = this.mode;
      this.isFirstUpdate = false;
    }

    // Track mode changes
    if (changedProperties.has('mode')) {
      const oldMode = changedProperties.get('mode') as PanelMode;
      if (oldMode && oldMode !== this.mode) {
        this.handleModeChange(oldMode);
      }
    }
  }

  override updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);
    
    // If mode changed, give the DOM time to update with new classes for drag handlers
    if (changedProperties.has('mode')) {
      requestAnimationFrame(() => {
        this.requestUpdate();
      });
    }
  }

  /**
   * Handle mode change
   */
  private handleModeChange(oldMode: PanelMode) {
    this.animating = true;

    // Reset position when:
    // 1. Switching to window mode from panel mode
    // 2. Restoring from minimized mode back to window mode
    if (this.mode === PanelMode.Window && 
        (oldMode === PanelMode.Panel || oldMode === PanelMode.Minimized)) {
      this.dragController.resetPosition();
    }

    // Dispatch mode change event
    this.dispatchEvent(new CustomEvent('panel-mode-change', {
      bubbles: true,
      detail: { mode: this.mode, previousMode: oldMode }
    }));

    setTimeout(() => {
      this.animating = false;
    }, 300);
  }

  /**
   * Transform to window mode
   */
  transformToWindow() {
    if (this.mode !== PanelMode.Window) {
      this.mode = PanelMode.Window;
    }
  }

  /**
   * Transform to panel mode
   */
  transformToPanel() {
    if (this.mode !== PanelMode.Panel) {
      this.mode = PanelMode.Panel;
    }
  }

  /**
   * Minimize panel
   */
  minimize() {
    if (!this.minimizable) return;
    this.mode = PanelMode.Minimized;
    this.dispatchEvent(new CustomEvent('panel-minimize', { bubbles: true }));
  }

  /**
   * Maximize embedded panel to floating window
   */
  maximizeEmbedded() {
    if (this.mode !== PanelMode.Embedded) return;
    
    this.isMaximizedFromEmbedded = true;
    this.mode = PanelMode.Window;
    
    // Wait for the mode change to render, then set position
    this.updateComplete.then(() => {
      this.setMaximizePosition();
    });
    
    this.dispatchEvent(new CustomEvent('panel-maximize-embedded', { 
      bubbles: true,
      detail: { mode: this.mode, position: this.maximizePosition }
    }));
  }

  /**
   * Set the window position based on maximizePosition
   */
  private setMaximizePosition() {
    const panel = this.shadowRoot?.querySelector('.panel') as HTMLElement;
    if (!panel) return;

    const rect = panel.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    switch (this.maximizePosition) {
      case MaximizePosition.Center:
        // Default center position (CSS handles this)
        this.offsetX = 0;
        this.offsetY = 0;
        break;
        
      case MaximizePosition.Left:
        this.offsetX = -(viewportWidth / 2 - rect.width / 2 - 40);
        this.offsetY = 0;
        break;
        
      case MaximizePosition.Right:
        this.offsetX = (viewportWidth / 2 - rect.width / 2 - 40);
        this.offsetY = 0;
        break;
        
      case MaximizePosition.TopLeft:
        this.offsetX = -(viewportWidth / 2 - rect.width / 2 - 40);
        this.offsetY = -(viewportHeight / 2 - rect.height / 2 - 40);
        break;
        
      case MaximizePosition.TopRight:
        this.offsetX = (viewportWidth / 2 - rect.width / 2 - 40);
        this.offsetY = -(viewportHeight / 2 - rect.height / 2 - 40);
        break;
        
      case MaximizePosition.BottomLeft:
        this.offsetX = -(viewportWidth / 2 - rect.width / 2 - 40);
        this.offsetY = (viewportHeight / 2 - rect.height / 2 - 40);
        break;
        
      case MaximizePosition.BottomRight:
        this.offsetX = (viewportWidth / 2 - rect.width / 2 - 40);
        this.offsetY = (viewportHeight / 2 - rect.height / 2 - 40);
        break;
    }
    
    this.requestUpdate();
  }

  /**
   * Restore maximized embedded panel back to embedded mode
   */
  restoreEmbedded() {
    if (!this.isMaximizedFromEmbedded) return;
    
    this.isMaximizedFromEmbedded = false;
    this.mode = PanelMode.Embedded;
    this.offsetX = 0;
    this.offsetY = 0;
    
    // Remove transform
    requestAnimationFrame(() => {
      const panel = this.shadowRoot?.querySelector('.panel') as HTMLElement;
      if (panel) {
        panel.style.transform = '';
      }
    });
    
    this.dispatchEvent(new CustomEvent('panel-restore-embedded', {
      bubbles: true,
      detail: { mode: this.mode }
    }));
  }

  /**
   * Maximize/restore panel
   */
  maximize() {
    if (this.mode === PanelMode.Minimized) {
      // When restoring from minimized, go back to the original mode
      // (the mode before any transformations)
      this.mode = this.originalMode || PanelMode.Panel;
      
      // Reset offset values
      this.offsetX = 0;
      this.offsetY = 0;
      
      // Remove any transform - let CSS handle positioning based on mode
      requestAnimationFrame(() => {
        const panel = this.shadowRoot?.querySelector('.panel') as HTMLElement;
        if (panel) {
          panel.style.transform = '';
        }
      });
      
      this.requestUpdate();
    }
    this.dispatchEvent(new CustomEvent('panel-maximize', { bubbles: true }));
  }

  /**
   * Close panel
   */
  close() {
    if (!this.closable) return;
    this.open = false;
    this.dispatchEvent(new CustomEvent('panel-close', { bubbles: true }));
  }

  /**
   * Toggle collapsed state
   */
  toggleCollapse() {
    if (!this.collapsible) return;
    this.collapsed = !this.collapsed;
  }

  /**
   * Get panel classes
   */
  private getPanelClasses() {
    return {
      'panel': true,
      [`panel--mode-${this.mode}`]: true,
      [`panel--position-${this.position}`]: this.mode === PanelMode.Panel,
      [`panel--size-${this.size}`]: this.size !== PanelSize.Custom,
      'panel--collapsed': this.collapsed,
      'panel--dragging': this.isDragging,
      'panel--animating': this.animating,
      'panel--animated': this.animated
    };
  }

  /**
   * Get panel styles
   */
  private getPanelStyles() {
    const styles: Record<string, string> = {};

    if (this.width) {
      styles.width = this.width;
    }
    if (this.height) {
      styles.height = this.height;
    }

    // Apply custom dimensions if set
    if (this.panelWidth > 0) {
      styles.width = `${this.panelWidth}px`;
    }
    if (this.panelHeight > 0) {
      styles.height = `${this.panelHeight}px`;
    }

    // Apply transform for window mode with offsets
    if (this.mode === PanelMode.Window && (this.offsetX !== 0 || this.offsetY !== 0)) {
      styles.transform = `translate(calc(-50% + ${this.offsetX}px), calc(-50% + ${this.offsetY}px))`;
    }

    return styles;
  }

  /**
   * Render header
   */
  private renderHeader() {
    const hasCustomHeader = this.querySelector('[slot="header"]');
    
    // Header should be draggable in window mode only
    const isDraggable = this.draggable && this.mode === PanelMode.Window;

    return html`
      <div class="${classMap({
        'panel-header': true,
        'panel-header--draggable': isDraggable
      })}"
      @click="${this.mode === PanelMode.Minimized ? this.maximize : nothing}">
        ${hasCustomHeader ? html`
          <div class="panel-header-content">
            <slot name="header"></slot>
          </div>
        ` : html`
          <div class="panel-header-content">
            ${this.icon ? html`
              <nr-icon class="panel-header-icon" name="${this.icon}"></nr-icon>
            ` : nothing}
            ${this.title ? html`
              <h2 class="panel-title">${this.title}</h2>
            ` : nothing}
          </div>
        `}
        
        <div class="panel-actions">
          ${this.collapsible ? html`
            <button
              class="panel-action-button"
              @click="${this.toggleCollapse}"
              title="${this.collapsed ? 'Expand' : 'Collapse'}">
              <nr-icon name="${this.collapsed ? 'chevron-down' : 'chevron-up'}"></nr-icon>
            </button>
          ` : nothing}
          
          ${this.mode === PanelMode.Window && this.minimizable && !this.isMaximizedFromEmbedded ? html`
            <button
              class="panel-action-button"
              @click="${this.minimize}"
              title="Minimize">
              <nr-icon name="minus"></nr-icon>
            </button>
          ` : nothing}
          
          ${this.mode === PanelMode.Embedded ? html`
            <button
              class="panel-action-button"
              @click="${this.maximizeEmbedded}"
              title="Maximize to window">
              <nr-icon name="maximize"></nr-icon>
            </button>
          ` : nothing}
          
          ${this.isMaximizedFromEmbedded ? html`
            <button
              class="panel-action-button"
              @click="${this.restoreEmbedded}"
              title="Restore to embedded">
              <nr-icon name="minimize"></nr-icon>
            </button>
          ` : nothing}
          
          ${this.mode === PanelMode.Panel ? html`
            <button
              class="panel-action-button"
              @click="${this.transformToWindow}"
              title="Pop out to window">
              <nr-icon name="external-link"></nr-icon>
            </button>
          ` : nothing}
          
          ${this.mode === PanelMode.Window && !this.isMaximizedFromEmbedded ? html`
            <button
              class="panel-action-button"
              @click="${this.transformToPanel}"
              title="Dock to panel">
              <nr-icon name="layout-sidebar"></nr-icon>
            </button>
          ` : nothing}
          
          ${this.closable ? html`
            <button
              class="panel-action-button"
              @click="${this.close}"
              title="Close">
              <nr-icon name="x"></nr-icon>
            </button>
          ` : nothing}
        </div>
      </div>
    `;
  }

  /**
   * Render footer
   */
  private renderFooter() {
    const hasFooter = this.querySelector('[slot="footer"]');
    
    if (!hasFooter) return nothing;

    return html`
      <div class="panel-footer">
        <slot name="footer"></slot>
      </div>
    `;
  }

  /**
   * Render resize handles
   */
  private renderResizeHandles() {
    if (!this.resizable || this.mode !== PanelMode.Window) return nothing;

    return html`
      <div class="resize-handle resize-handle-n"></div>
      <div class="resize-handle resize-handle-s"></div>
      <div class="resize-handle resize-handle-e"></div>
      <div class="resize-handle resize-handle-w"></div>
      <div class="resize-handle resize-handle-ne"></div>
      <div class="resize-handle resize-handle-nw"></div>
      <div class="resize-handle resize-handle-se"></div>
      <div class="resize-handle resize-handle-sw"></div>
    `;
  }

  override render() {
    if (!this.open) return nothing;

    return html`
      <div 
        class=${classMap(this.getPanelClasses())}
        style=${styleMap(this.getPanelStyles())}
        data-theme="${this.currentTheme}">
        
        ${this.renderHeader()}
        
        <div class="panel-body">
          <slot></slot>
        </div>
        
        ${this.renderFooter()}
        ${this.renderResizeHandles()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'nr-panel': NrPanelElement;
  }
}
