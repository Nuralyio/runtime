/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styles } from './container.style.js';
import { NuralyUIBaseMixin } from '@nuralyui/common/mixins';
import type {
  Gap
} from './container.types.js';

/**
 * Container layout component for wrapping content with configurable layout options
 *
 * @example
 * ```html
 * <!-- Basic container -->
 * <nr-container>
 *   <div>Content</div>
 * </nr-container>
 *
 * <!-- Boxed centered container -->
 * <nr-container layout="boxed" size="lg">
 *   <div>Centered content with max-width</div>
 * </nr-container>
 *
 * <!-- Vertical container with gap -->
 * <nr-container direction="column" gap="16">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 * </nr-container>
 *
 * <!-- Centered content -->
 * <nr-container justify="center" align="center">
 *   <div>Centered content</div>
 * </nr-container>
 * ```
 *
 * @slot default - Container content
 */
@customElement('nr-container')
export class NrContainerElement extends NuralyUIBaseMixin(LitElement) {
  static override styles = styles;

  /** Layout type: fluid (full width), boxed (centered with max-width), or fixed */
  @property({ type: String })
  layout: 'fluid' | 'boxed' | 'fixed' = 'fluid';

  /** Flex direction: row or column */
  @property({ type: String })
  direction: 'row' | 'column' = 'column';

  /** Size preset for boxed/fixed layouts */
  @property({ type: String })
  size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'lg';

  /** Padding preset */
  @property({ type: String })
  padding: 'none' | 'sm' | 'md' | 'lg' | '' = '';

  /** Justify content alignment */
  @property({ type: String })
  justify: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly' | '' = '';

  /** Align items alignment */
  @property({ type: String })
  align: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch' | '' = '';

  /** Gap between items - can be preset string, number (px), or [horizontal, vertical] */
  @property({ type: Object })
  gap: Gap = 0;

  /** Enable flex wrap */
  @property({ type: Boolean })
  wrap = false;

  /** Custom width (overrides size preset) */
  @property({ type: String })
  width = '';

  /** Custom height */
  @property({ type: String })
  height = '';

  /** Custom min-height */
  @property({ type: String, attribute: 'min-height' })
  minHeight = '';

  /** Class to apply to inner container (for component styles) */
  @property({ type: String, attribute: 'inner-class' })
  innerClass = '';

  /**
   * Convert gap value to CSS value
   */
  private getGapValue(value: Gap): string {
    if (typeof value === 'number') {
      return `${value}px`;
    }

    if (typeof value === 'string') {
      switch (value) {
        case 'small':
          return 'var(--nuraly-spacing-2, 8px)';
        case 'medium':
          return 'var(--nuraly-spacing-3, 16px)';
        case 'large':
          return 'var(--nuraly-spacing-4, 24px)';
        default:
          return value;
      }
    }

    return '0';
  }

  /**
   * Get gap styles for container
   */
  private getGapStyles(): Record<string, string> {
    const styles: Record<string, string> = {};

    if (Array.isArray(this.gap)) {
      const [horizontal, vertical] = this.gap;
      styles['column-gap'] = this.getGapValue(horizontal);
      styles['row-gap'] = this.getGapValue(vertical);
    } else if (this.gap) {
      styles['gap'] = this.getGapValue(this.gap);
    }

    return styles;
  }

  /**
   * Get all inline styles for inner container
   */
  private getContainerStyles(): string {
    const styles: Record<string, string> = {
      ...this.getGapStyles()
    };

    // Width is handled on host element, not inner container

    if (this.height) {
      styles['height'] = this.height;
    }

    if (this.minHeight) {
      styles['min-height'] = this.minHeight;
    }

    return Object.entries(styles)
      .map(([key, value]) => `${key}: ${value}`)
      .join('; ');
  }

  override updated(changedProperties: Map<string, unknown>): void {
    super.updated(changedProperties);

    // Update host styles based on layout
    if (this.layout === 'boxed') {
      // Boxed: host is centered with max-width
      if (this.width) {
        this.style.maxWidth = this.width;
        this.style.width = '';
      } else {
        this.style.maxWidth = '';
      }
      this.style.marginInline = 'auto';
    } else if (this.width) {
      this.style.width = this.width;
      this.style.maxWidth = this.width;
      this.style.marginInline = '';
    } else if (this.layout === 'fluid') {
      this.style.width = '100%';
      this.style.maxWidth = '';
      this.style.marginInline = '';
    } else if (this.direction === 'row' && this.layout === 'fixed') {
      this.style.width = 'fit-content';
      this.style.maxWidth = '';
      this.style.marginInline = '';
    } else {
      this.style.width = '100%';
      this.style.maxWidth = '';
      this.style.marginInline = '';
    }
  }

  override render() {
    const containerStyles = this.getContainerStyles();
    const classes = this.innerClass ? `nr-container ${this.innerClass}` : 'nr-container';

    return html`
      <div
        class="${classes}"
        part="container"
        data-layout="${this.layout}"
        data-direction="${this.direction}"
        data-size="${this.layout !== 'fluid' ? this.size : ''}"
        data-padding="${this.padding}"
        data-justify="${this.justify}"
        data-align="${this.align}"
        data-wrap="${this.wrap}"
        data-theme="${this.currentTheme}"
        style="${containerStyles}"
      >
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'nr-container': NrContainerElement;
  }
}
