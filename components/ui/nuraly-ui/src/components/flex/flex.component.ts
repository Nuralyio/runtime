/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styles } from './flex.style.js';
import { NuralyUIBaseMixin } from '../../shared/base-mixin.js';
import {
    FlexDirection,
    FlexWrap,
    FlexJustify,
    FlexAlign,
    FlexGap,
    Gap,
    EMPTY_STRING
} from './flex.types.js';

/**
 * Flex layout component for flexible box layouts
 * 
 * @example
 * ```html
 * <!-- Basic flex -->
 * <nr-flex>
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </nr-flex>
 * 
 * <!-- Flex with gap -->
 * <nr-flex gap="medium">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 * </nr-flex>
 * 
 * <!-- Centered flex -->
 * <nr-flex justify="center" align="center">
 *   <div>Centered content</div>
 * </nr-flex>
 * 
 * <!-- Column layout with gap -->
 * <nr-flex vertical gap="16">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 * </nr-flex>
 * 
 * <!-- Responsive gap -->
 * <nr-flex .gap=${[16, 24]}>
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 * </nr-flex>
 * ```
 * 
 * @slot default - Flex items
 */
@customElement('nr-flex')
export class NrFlexElement extends NuralyUIBaseMixin(LitElement) {
  static override styles = styles;

  /** Flex direction (shorthand: use vertical prop for column) */
  @property({ type: String })
  direction: FlexDirection = FlexDirection.Row;

  /** Shorthand for flex-direction: column */
  @property({ type: Boolean })
  vertical = false;

  /** Flex wrap behavior */
  @property({ type: String })
  wrap: FlexWrap = FlexWrap.NoWrap;

  /** Justify content alignment */
  @property({ type: String })
  justify: FlexJustify | '' = EMPTY_STRING;

  /** Align items alignment */
  @property({ type: String })
  align: FlexAlign | '' = EMPTY_STRING;

  /** Gap between flex items - can be preset string, number (px), or [horizontal, vertical] */
  @property({ type: Object })
  gap: Gap = 0;

  /** Make flex container inline */
  @property({ type: Boolean })
  inline = false;

  /** Custom flex CSS value (e.g., "1", "auto", "none") */
  @property({ type: String })
  flex: string | '' = EMPTY_STRING;

  /**
   * Get computed flex direction
   */
  private getFlexDirection(): FlexDirection {
    return this.vertical ? FlexDirection.Column : this.direction;
  }

  /**
   * Convert gap value to CSS value
   */
  private getGapValue(value: Gap): string {
    if (typeof value === 'number') {
      return `${value}px`;
    }
    
    if (typeof value === 'string') {
      // Check if it's a preset
      switch (value) {
        case FlexGap.Small:
          return 'var(--nuraly-spacing-2, 8px)';
        case FlexGap.Medium:
          return 'var(--nuraly-spacing-3, 16px)';
        case FlexGap.Large:
          return 'var(--nuraly-spacing-4, 24px)';
        default:
          return value; // Use as-is (could be CSS variable or custom value)
      }
    }
    
    return '0';
  }

  /**
   * Get gap styles for flex container
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
   * Get all inline styles for flex container
   */
  private getFlexStyles(): string {
    const styles: Record<string, string> = {
      ...this.getGapStyles()
    };
    
    if (this.flex) {
      styles['flex'] = this.flex;
    }
    
    return Object.entries(styles)
      .map(([key, value]) => `${key}: ${value}`)
      .join('; ');
  }

  override render() {
    const flexDirection = this.getFlexDirection();
    const flexStyles = this.getFlexStyles();

    return html`
      <div
        class="nr-flex"
        data-direction="${flexDirection}"
        data-wrap="${this.wrap}"
        data-justify="${this.justify}"
        data-align="${this.align}"
        data-inline="${this.inline}"
        data-theme="${this.currentTheme}"
        style="${flexStyles}"
      >
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'nr-flex': NrFlexElement;
  }
}
