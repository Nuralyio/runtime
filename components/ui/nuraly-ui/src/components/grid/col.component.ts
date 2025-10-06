/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styles } from './col.style.js';
import { NuralyUIBaseMixin } from '../../shared/base-mixin.js';
import { ColSize, FlexType, GridBreakpoint, BREAKPOINTS, EMPTY_STRING } from './grid.types.js';

/**
 * Column component for grid layout system
 * 
 * @example
 * ```html
 * <!-- Basic column with span -->
 * <nr-col span="12">Half width</nr-col>
 * <nr-col span="8">8/24 width</nr-col>
 * 
 * <!-- Column with offset -->
 * <nr-col span="12" offset="6">Offset by 6</nr-col>
 * 
 * <!-- Responsive column -->
 * <nr-col 
 *   xs="24" 
 *   sm="12" 
 *   md="8" 
 *   lg="6"
 * >Responsive</nr-col>
 * 
 * <!-- Column with order -->
 * <nr-col span="6" order="4">Last</nr-col>
 * <nr-col span="6" order="1">First</nr-col>
 * 
 * <!-- Flex column -->
 * <nr-col flex="auto">Auto flex</nr-col>
 * <nr-col flex="1">Flex 1</nr-col>
 * ```
 * 
 * @slot default - Column content
 */
@customElement('nr-col')
export class NrColElement extends NuralyUIBaseMixin(LitElement) {
  static override styles = styles;

  /** Number of columns to span (out of 24) */
  @property({ type: Number })
  span?: number;

  /** Number of columns to offset */
  @property({ type: Number })
  offset = 0;

  /** Order of the column */
  @property({ type: Number })
  order?: number;

  /** Number of columns to pull */
  @property({ type: Number })
  pull = 0;

  /** Number of columns to push */
  @property({ type: Number })
  push = 0;

  /** Flex layout style */
  @property({ type: String })
  flex: FlexType | '' = EMPTY_STRING;

  /** Extra small devices (<576px) */
  @property({ type: Object })
  xs?: number | ColSize;

  /** Small devices (≥576px) */
  @property({ type: Object })
  sm?: number | ColSize;

  /** Medium devices (≥768px) */
  @property({ type: Object })
  md?: number | ColSize;

  /** Large devices (≥992px) */
  @property({ type: Object })
  lg?: number | ColSize;

  /** Extra large devices (≥1200px) */
  @property({ type: Object })
  xl?: number | ColSize;

  /** Extra extra large devices (≥1600px) */
  @property({ type: Object })
  xxl?: number | ColSize;

  /** Current breakpoint */
  @state()
  private currentBreakpoint: GridBreakpoint = GridBreakpoint.XS;

  private resizeObserver?: ResizeObserver;

  override connectedCallback() {
    super.connectedCallback();
    this.setupResponsive();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
  }

  /**
   * Setup responsive breakpoint detection
   */
  private setupResponsive() {
    this.updateBreakpoint();
    
    this.resizeObserver = new ResizeObserver(() => {
      this.updateBreakpoint();
    });
    
    this.resizeObserver.observe(document.documentElement);
  }

  /**
   * Update current breakpoint based on window width
   */
  private updateBreakpoint() {
    const width = window.innerWidth;
    let newBreakpoint: GridBreakpoint;
    
    if (width >= BREAKPOINTS.xxl) {
      newBreakpoint = GridBreakpoint.XXL;
    } else if (width >= BREAKPOINTS.xl) {
      newBreakpoint = GridBreakpoint.XL;
    } else if (width >= BREAKPOINTS.lg) {
      newBreakpoint = GridBreakpoint.LG;
    } else if (width >= BREAKPOINTS.md) {
      newBreakpoint = GridBreakpoint.MD;
    } else if (width >= BREAKPOINTS.sm) {
      newBreakpoint = GridBreakpoint.SM;
    } else {
      newBreakpoint = GridBreakpoint.XS;
    }
    
    if (newBreakpoint !== this.currentBreakpoint) {
      this.currentBreakpoint = newBreakpoint;
    }
  }

  /**
   * Get responsive configuration for current breakpoint
   */
  private getResponsiveConfig(): ColSize {
    const breakpoints: GridBreakpoint[] = [
      this.currentBreakpoint,
      GridBreakpoint.XL,
      GridBreakpoint.LG,
      GridBreakpoint.MD,
      GridBreakpoint.SM,
      GridBreakpoint.XS
    ];
    
    for (const bp of breakpoints) {
      const value = this[bp];
      if (value !== undefined) {
        if (typeof value === 'number') {
          return { span: value };
        }
        return value;
      }
    }
    
    return {};
  }

  /**
   * Get computed column properties
   */
  private getColProperties() {
    const responsive = this.getResponsiveConfig();
    
    return {
      span: responsive.span ?? this.span,
      offset: responsive.offset ?? this.offset,
      order: responsive.order ?? this.order,
      pull: responsive.pull ?? this.pull,
      push: responsive.push ?? this.push
    };
  }

  /**
   * Get gutter from parent row
   */
  private getGutterFromParent(): number {
    const parent = this.closest('nr-row');
    if (parent) {
      const gutter = parent.getAttribute('data-gutter');
      return gutter ? parseInt(gutter, 10) : 0;
    }
    return 0;
  }

  /**
   * Get inline styles for column
   */
  private getColStyle() {
    const styles: Record<string, string> = {};
    const gutter = this.getGutterFromParent();
    
    if (gutter > 0) {
      styles['padding-left'] = `${gutter / 2}px`;
      styles['padding-right'] = `${gutter / 2}px`;
    }
    
    if (this.flex) {
      if (this.flex === 'auto') {
        styles['flex'] = '1 1 auto';
      } else if (this.flex === 'none') {
        styles['flex'] = '0 0 auto';
      } else if (typeof this.flex === 'number') {
        styles['flex'] = `${this.flex} ${this.flex} auto`;
      } else {
        styles['flex'] = this.flex;
      }
    }
    
    return styles;
  }

  override render() {
    const colStyle = this.getColStyle();
    const props = this.getColProperties();

    // Apply data attributes to :host for proper styling
    this.setAttribute('data-span', props.span?.toString() || '');
    this.setAttribute('data-offset', props.offset.toString());
    if (props.order !== undefined) {
      this.setAttribute('data-order', props.order.toString());
    } else {
      this.removeAttribute('data-order');
    }
    this.setAttribute('data-pull', props.pull.toString());
    this.setAttribute('data-push', props.push.toString());
    this.setAttribute('data-theme', this.currentTheme);

    return html`
      <div
        class="nr-col"
        style="${Object.entries(colStyle).map(([key, value]) => `${key}: ${value}`).join('; ')}"
      >
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'nr-col': NrColElement;
  }
}
