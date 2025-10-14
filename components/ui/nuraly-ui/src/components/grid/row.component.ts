/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styles } from './row.style.js';
import { NuralyUIBaseMixin } from '@nuralyui/common/mixins';
import { RowAlign, RowJustify, Gutter, EMPTY_STRING, GridBreakpoint, BREAKPOINTS } from './grid.types.js';

/**
 * Row component for grid layout system
 * 
 * @example
 * ```html
 * <!-- Basic row -->
 * <nr-row>
 *   <nr-col span="12">Column 1</nr-col>
 *   <nr-col span="12">Column 2</nr-col>
 * </nr-row>
 * 
 * <!-- Row with gutter -->
 * <nr-row gutter="16">
 *   <nr-col span="8">Column 1</nr-col>
 *   <nr-col span="8">Column 2</nr-col>
 *   <nr-col span="8">Column 3</nr-col>
 * </nr-row>
 * 
 * <!-- Responsive gutter -->
 * <nr-row .gutter=${{ xs: 8, sm: 16, md: 24, lg: 32 }}>
 *   <nr-col span="6">Column</nr-col>
 * </nr-row>
 * 
 * <!-- Alignment and justify -->
 * <nr-row align="middle" justify="center">
 *   <nr-col span="6">Centered</nr-col>
 * </nr-row>
 * ```
 * 
 * @slot default - Column elements
 */
@customElement('nr-row')
export class NrRowElement extends NuralyUIBaseMixin(LitElement) {
  static override styles = styles;

  /** Vertical alignment of columns */
  @property({ type: String })
  align: RowAlign | '' = EMPTY_STRING;

  /** Horizontal alignment of columns */
  @property({ type: String })
  justify: RowJustify | '' = EMPTY_STRING;

  /** Grid spacing - number, [horizontal, vertical], or responsive object */
  @property({ type: Object })
  gutter: Gutter = 0;

  /** Allow columns to wrap */
  @property({ type: Boolean })
  wrap = true;

  /** Current breakpoint for responsive gutter */
  @state()
  private currentBreakpoint: GridBreakpoint = GridBreakpoint.XS;

  private resizeObserver?: ResizeObserver;

  override connectedCallback() {
    super.connectedCallback();
    this.setupResponsiveGutter();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
  }

  /**
   * Setup responsive gutter based on viewport width
   */
  private setupResponsiveGutter() {
    if (typeof this.gutter === 'object' && !Array.isArray(this.gutter)) {
      this.updateBreakpoint();
      
      this.resizeObserver = new ResizeObserver(() => {
        this.updateBreakpoint();
      });
      
      this.resizeObserver.observe(document.documentElement);
    }
  }

  /**
   * Update current breakpoint based on window width
   */
  private updateBreakpoint() {
    const width = window.innerWidth;
    
    if (width >= BREAKPOINTS.xxl) {
      this.currentBreakpoint = GridBreakpoint.XXL;
    } else if (width >= BREAKPOINTS.xl) {
      this.currentBreakpoint = GridBreakpoint.XL;
    } else if (width >= BREAKPOINTS.lg) {
      this.currentBreakpoint = GridBreakpoint.LG;
    } else if (width >= BREAKPOINTS.md) {
      this.currentBreakpoint = GridBreakpoint.MD;
    } else if (width >= BREAKPOINTS.sm) {
      this.currentBreakpoint = GridBreakpoint.SM;
    } else {
      this.currentBreakpoint = GridBreakpoint.XS;
    }
  }

  /**
   * Get the current gutter values [horizontal, vertical]
   */
  private getGutterValues(): [number, number] {
    if (typeof this.gutter === 'number') {
      return [this.gutter, this.gutter];
    }
    
    if (Array.isArray(this.gutter)) {
      return this.gutter;
    }
    
    // Responsive gutter object
    const breakpoints: GridBreakpoint[] = [
      this.currentBreakpoint,
      GridBreakpoint.XL,
      GridBreakpoint.LG,
      GridBreakpoint.MD,
      GridBreakpoint.SM,
      GridBreakpoint.XS
    ];
    
    for (const bp of breakpoints) {
      const value = this.gutter[bp];
      if (value !== undefined) {
        if (typeof value === 'number') {
          return [value, value];
        }
        return value;
      }
    }
    
    return [0, 0];
  }

  /**
   * Get inline styles for row with gutter
   */
  private getRowStyle() {
    const [horizontal, vertical] = this.getGutterValues();
    
    const styles: Record<string, string> = {};
    
    if (horizontal > 0) {
      styles['margin-left'] = `-${horizontal / 2}px`;
      styles['margin-right'] = `-${horizontal / 2}px`;
    }
    
    if (vertical > 0) {
      styles['row-gap'] = `${vertical}px`;
    }
    
    return styles;
  }

  /**
   * Get gutter context for child columns
   */
  private getGutterContext() {
    const [horizontal] = this.getGutterValues();
    return horizontal;
  }

  override render() {
    const rowStyle = this.getRowStyle();
    const gutter = this.getGutterContext();

    return html`
      <div
        class="nr-row"
        data-align="${this.align}"
        data-justify="${this.justify}"
        data-wrap="${this.wrap}"
        data-theme="${this.currentTheme}"
        style="${Object.entries(rowStyle).map(([key, value]) => `${key}: ${value}`).join('; ')}"
        data-gutter="${gutter}"
      >
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'nr-row': NrRowElement;
  }
}
