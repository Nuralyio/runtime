import { LitElement, html, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { NuralyUIBaseMixin } from '@nuralyui/common/mixins';
import { siderStyles } from './sider.style.js';
import {
    LayoutBreakpoint,
    BREAKPOINT_VALUES,
    SiderTheme,
} from './layout.types.js';

/**
 * # Sider Component
 * 
 * The sidebar component with collapsible functionality, theme support, and responsive behavior.
 * Must be placed inside a Layout component.
 * 
 * @element nr-sider
 * 
 * @slot - Default slot for sider content (usually navigation menu)
 * @slot trigger - Custom trigger slot (overrides default trigger)
 * 
 * @fires collapse - Fired when the sider is collapsed or expanded
 * @fires breakpoint - Fired when the breakpoint is triggered
 * 
 * @csspart sider - The sider container element
 * @csspart trigger - The collapse trigger element
 * 
 * @example
 * ```html
 * <nr-layout has-sider>
 *   <nr-sider collapsible breakpoint="lg">
 *     <nav>Navigation Menu</nav>
 *   </nr-sider>
 *   <nr-content>Content</nr-content>
 * </nr-layout>
 * ```
 */
@customElement('nr-sider')
export class NrSiderElement extends NuralyUIBaseMixin(LitElement) {
  static override styles = siderStyles;

  /**
   * Breakpoint for responsive collapsing
   */
  @property({ type: String })
  breakpoint?: LayoutBreakpoint;

  /**
   * Current collapsed state (controlled)
   */
  @property({ type: Boolean, reflect: true })
  collapsed = false;

  /**
   * Width when collapsed. Set to 0 for a special trigger.
   */
  @property({ type: Number, attribute: 'collapsed-width' })
  collapsedWidth = 80;

  /**
   * Whether the sider can be collapsed
   */
  @property({ type: Boolean })
  collapsible = false;

  /**
   * Initial collapsed state (uncontrolled)
   */
  @property({ type: Boolean, attribute: 'default-collapsed' })
  defaultCollapsed = false;

  /**
   * Reverse the arrow direction (for right-side sider)
   */
  @property({ type: Boolean, attribute: 'reverse-arrow' })
  reverseArrow = false;

  /**
   * Sider theme (light or dark)
   */
  @property({ type: String, reflect: true })
  theme: SiderTheme = SiderTheme.Dark;

  /**
   * Custom trigger element. Set to null to hide trigger.
   */
  @property({ type: String })
  trigger: 'default' | null = 'default';

  /**
   * Sider width when expanded
   */
  @property({ type: String })
  width: number | string = 200;

  /**
   * Custom styles for zero-width trigger
   */
  @property({ type: String, attribute: 'zero-width-trigger-style' })
  zeroWidthTriggerStyle = '';

  /**
   * Internal state for tracking if breakpoint is active
   */
  @state()
  private belowBreakpoint = false;

  /**
   * ResizeObserver for responsive behavior
   */
  private resizeObserver?: ResizeObserver;

  override connectedCallback(): void {
    super.connectedCallback();

    // Set initial collapsed state
    if (this.defaultCollapsed && !this.hasAttribute('collapsed')) {
      this.collapsed = true;
    }

    // Setup resize observer for breakpoint
    if (this.breakpoint) {
      this.setupResizeObserver();
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
  }

  override updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('breakpoint')) {
      this.resizeObserver?.disconnect();
      if (this.breakpoint) {
        this.setupResizeObserver();
      }
    }
  }

  /**
   * Setup ResizeObserver for responsive breakpoint behavior
   */
  private setupResizeObserver(): void {
    if (!this.breakpoint) return;

    const breakpointValue = BREAKPOINT_VALUES[this.breakpoint];
    
    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        const shouldBeCollapsed = width < breakpointValue;

        if (shouldBeCollapsed !== this.belowBreakpoint) {
          this.belowBreakpoint = shouldBeCollapsed;
          
          // Auto-collapse when below breakpoint
          if (this.collapsible && shouldBeCollapsed !== this.collapsed) {
            this.collapsed = shouldBeCollapsed;
            this.dispatchCollapseEvent('responsive');
          }

          // Dispatch breakpoint event
          this.dispatchBreakpointEvent(shouldBeCollapsed);
        }
      }
    });

    // Observe the parent layout or document body
    const target = this.closest('nr-layout') || document.body;
    this.resizeObserver.observe(target);
  }

  /**
   * Toggle collapsed state
   */
  private toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.dispatchCollapseEvent('clickTrigger');
  }

  /**
   * Dispatch collapse event
   */
  private dispatchCollapseEvent(type: 'clickTrigger' | 'responsive'): void {
    this.dispatchEvent(
      new CustomEvent<{ collapsed: boolean; type: string }>('collapse', {
        detail: { collapsed: this.collapsed, type },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Dispatch breakpoint event
   */
  private dispatchBreakpointEvent(broken: boolean): void {
    this.dispatchEvent(
      new CustomEvent<{ broken: boolean }>('breakpoint', {
        detail: { broken },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Get the current width based on collapsed state
   */
  private getCurrentWidth(): string {
    if (this.collapsed) {
      return `${this.collapsedWidth}px`;
    }
    return typeof this.width === 'number' ? `${this.width}px` : this.width.toString();
  }

  /**
   * Render the collapse trigger
   */
  private renderTrigger() {
    if (this.trigger === null || !this.collapsible) {
      return null;
    }

    // Check for custom trigger slot
    const hasCustomTrigger = this.querySelector('[slot="trigger"]');
    if (hasCustomTrigger) {
      return html`<slot name="trigger"></slot>`;
    }

    // Zero-width trigger (special trigger when collapsedWidth is 0)
    if (this.collapsedWidth === 0 && this.collapsed) {
      return html`
        <div
          class="nr-sider-zero-width-trigger"
          part="trigger"
          style=${this.zeroWidthTriggerStyle}
          @click=${this.toggleCollapse}
        >
          <span class="trigger-icon">${this.reverseArrow ? '◀' : '▶'}</span>
        </div>
      `;
    }

    // Default trigger
    return html`
      <div
        class="nr-sider-trigger"
        part="trigger"
        @click=${this.toggleCollapse}
      >
        <span class="trigger-icon">
          ${this.collapsed 
            ? (this.reverseArrow ? '◀' : '▶') 
            : (this.reverseArrow ? '▶' : '◀')
          }
        </span>
      </div>
    `;
  }

  override render() {
    const classes = {
      'nr-sider': true,
      'nr-sider-collapsed': this.collapsed,
      'nr-sider-has-trigger': this.collapsible && this.trigger !== null,
      'nr-sider-below-breakpoint': this.belowBreakpoint,
      'nr-sider-zero-width': this.collapsed && this.collapsedWidth === 0,
    };

    return html`
      <aside
        class=${classMap(classes)}
        part="sider"
        style="width: ${this.getCurrentWidth()}; flex: 0 0 ${this.getCurrentWidth()};"
      >
        <div class="nr-sider-children">
          <slot></slot>
        </div>
        ${this.renderTrigger()}
      </aside>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'nr-sider': NrSiderElement;
  }
}
