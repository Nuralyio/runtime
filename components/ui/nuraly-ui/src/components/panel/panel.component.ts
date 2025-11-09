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

// Import icon and label components
import '../icon/index.js';
import '../label/index.js';

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

  override requiredComponents = ['nr-icon', 'nr-label'];

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
  closable = false;

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

  /** Track if this panel was created from a tab pop-out */
  @property({ type: Boolean })
  isTabPopOut = false;

  /** Track if this is the first update to capture initial mode */
  @state()
  private isFirstUpdate = true;

  /** Original dimensions before maximizing from embedded mode */
  @state()
  private originalEmbeddedWidth = 0;

  /** Original dimensions before maximizing from embedded mode */
  @state()
  private originalEmbeddedHeight = 0;

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
   * Restore panel to its original state
   */
  restore() {
    // Special handling for tab pop-out panels
    if (this.isTabPopOut) {
      console.log('[Panel] Restore called for tab pop-out panel');
      // For tab pop-outs, "restore" means pop back in
      // Dispatch event first to trigger the pop-in logic
      this.dispatchEvent(new CustomEvent('panel-restore', { bubbles: true }));
      // Then close the panel (the pop-in logic should handle tab restoration)
      // Use setTimeout to ensure the event is processed first
      setTimeout(() => {
        this.open = false;
        this.dispatchEvent(new CustomEvent('panel-close', { bubbles: true }));
      }, 0);
      return;
    }
    
    // Special handling for panels maximized from embedded mode
    if (this.isMaximizedFromEmbedded) {
      // Restore back to embedded mode
      this.restoreEmbedded();
      return;
    }
    
    // Default restore behavior (same as maximize for minimized panels)
    this.maximize();
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
    console.log('[Panel] === MAXIMIZE EMBEDDED START ===');
    console.log('[Panel] Current mode:', this.mode);
    console.log('[Panel] this.panelWidth:', this.panelWidth);
    console.log('[Panel] this.panelHeight:', this.panelHeight);
    
    if (this.mode !== PanelMode.Embedded) {
      console.log('[Panel] ✗ Not in embedded mode, aborting');
      return;
    }
    
    // Store original dimensions before maximizing
    const panel = this.shadowRoot?.querySelector('.panel') as HTMLElement;
    if (panel) {
      console.log('[Panel] Panel DOM element found');
      console.log('[Panel] panel.offsetWidth:', panel.offsetWidth);
      console.log('[Panel] panel.offsetHeight:', panel.offsetHeight);
      
      // Use current tracked dimensions or fall back to DOM dimensions
      this.originalEmbeddedWidth = this.panelWidth > 0 ? this.panelWidth : panel.offsetWidth;
      this.originalEmbeddedHeight = this.panelHeight > 0 ? this.panelHeight : panel.offsetHeight;
      
      console.log('[Panel] ✓ Set originalEmbeddedWidth:', this.originalEmbeddedWidth);
      console.log('[Panel] ✓ Set originalEmbeddedHeight:', this.originalEmbeddedHeight);
    } else {
      console.warn('[Panel] ✗ Panel DOM element not found');
    }
    
    // Set the original mode to embedded so we can restore properly
    if (!this.originalMode || this.originalMode !== PanelMode.Embedded) {
      this.originalMode = PanelMode.Embedded;
    }
    
    this.isMaximizedFromEmbedded = true;
    
    // Keep the original dimensions when maximizing to window mode
    this.panelWidth = this.originalEmbeddedWidth;
    this.panelHeight = this.originalEmbeddedHeight;
    
    console.log('[Panel] Final panelWidth:', this.panelWidth);
    console.log('[Panel] Final panelHeight:', this.panelHeight);
    
    this.mode = PanelMode.Window;
    console.log('[Panel] Mode changed to Window');
    
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
   * Set the window position based on maximizePosition with slight randomization
   */
  private setMaximizePosition() {
    const panel = this.shadowRoot?.querySelector('.panel') as HTMLElement;
    if (!panel) return;

    const rect = panel.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Add random offset for cascading effect (±80px for X, ±60px for Y)
    const randomX = Math.floor(Math.random() * 160) - 80;
    const randomY = Math.floor(Math.random() * 120) - 60;
    
    console.log('[Panel] setMaximizePosition - randomX:', randomX, 'randomY:', randomY);
    console.log('[Panel] maximizePosition:', this.maximizePosition);
    
    switch (this.maximizePosition) {
      case MaximizePosition.Center:
        // Center with randomization for cascading effect
        this.offsetX = randomX;
        this.offsetY = randomY;
        console.log('[Panel] Set offsetX:', this.offsetX, 'offsetY:', this.offsetY);
        break;
        
      case MaximizePosition.Left:
        this.offsetX = -(viewportWidth / 2 - rect.width / 2 - 40) + randomX;
        this.offsetY = randomY;
        break;
        
      case MaximizePosition.Right:
        this.offsetX = (viewportWidth / 2 - rect.width / 2 - 40) + randomX;
        this.offsetY = randomY;
        break;
        
      case MaximizePosition.TopLeft:
        this.offsetX = -(viewportWidth / 2 - rect.width / 2 - 40) + randomX;
        this.offsetY = -(viewportHeight / 2 - rect.height / 2 - 40) + randomY;
        break;
        
      case MaximizePosition.TopRight:
        this.offsetX = (viewportWidth / 2 - rect.width / 2 - 40) + randomX;
        this.offsetY = -(viewportHeight / 2 - rect.height / 2 - 40) + randomY;
        break;
        
      case MaximizePosition.BottomLeft:
        this.offsetX = -(viewportWidth / 2 - rect.width / 2 - 40) + randomX;
        this.offsetY = (viewportHeight / 2 - rect.height / 2 - 40) + randomY;
        break;
        
      case MaximizePosition.BottomRight:
        this.offsetX = (viewportWidth / 2 - rect.width / 2 - 40) + randomX;
        this.offsetY = (viewportHeight / 2 - rect.height / 2 - 40) + randomY;
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
    
    // Restore original dimensions
    this.panelWidth = this.originalEmbeddedWidth;
    this.panelHeight = this.originalEmbeddedHeight;
    
    // Remove transform and apply restored dimensions
    requestAnimationFrame(() => {
      const panel = this.shadowRoot?.querySelector('.panel') as HTMLElement;
      if (panel) {
        panel.style.transform = '';
        // Apply the original dimensions
        if (this.originalEmbeddedWidth > 0) {
          panel.style.width = `${this.originalEmbeddedWidth}px`;
        }
        if (this.originalEmbeddedHeight > 0) {
          panel.style.height = `${this.originalEmbeddedHeight}px`;
        }
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
      // When restoring from minimized, check if we were maximized from embedded
      if (this.isMaximizedFromEmbedded) {
        // Restore back to embedded mode instead of going to original mode
        this.restoreEmbedded();
        return;
      }
      
      // Normal restoration: go back to the original mode
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
   * Get label size based on panel size
   */
  private getLabelSize(): 'small' | 'medium' | 'large' {
    switch (this.size) {
      case PanelSize.Small:
        return 'small';
      case PanelSize.Large:
        return 'large';
      case PanelSize.Medium:
      case PanelSize.Custom:
      default:
        return 'medium';
    }
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
              <nr-label 
                class="panel-title" 
                size="${this.getLabelSize()}"
                style="--nuraly-label-font-weight: ${this.size === 'small' ? '400' : 'var(--nuraly-font-weight-medium, 500)'}"
              >${this.title}</nr-label>
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
          
          ${this.mode === PanelMode.Window && this.minimizable && !this.isMaximizedFromEmbedded && !this.isTabPopOut ? html`
            <button
              class="panel-action-button"
              @click="${this.minimize}"
              title="Minimize">
              <nr-icon name="minus"></nr-icon>
            </button>
          ` : nothing}
          
          ${this.isTabPopOut && this.mode === PanelMode.Window ? html`
            <button
              class="panel-action-button"
              @click="${this.restore}"
              title="Restore to tabs">
              <nr-icon name="minimize"></nr-icon>
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
    if (!this.resizable || (this.mode !== PanelMode.Window && this.mode !== PanelMode.Embedded)) return nothing;

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
