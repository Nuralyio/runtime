/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, LitElement, nothing, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { styles } from './badge.style.js';
import { NuralyUIBaseMixin } from '../../shared/base-mixin.js';
import {
    BadgeStatus,
    BadgeSize,
    BadgeColor,
    RibbonPlacement
} from './badge.types.js';

/**
 * # Badge Component
 * 
 * Small numerical value or status descriptor for UI elements.
 * Badge normally appears in proximity to notifications or user avatars with
 * eye-catching appeal, typically displaying unread messages count.
 * 
 * ## Features
 * - Count badge with overflow support
 * - Dot badge for simple indicators
 * - Status badge with predefined states
 * - Ribbon badge for decorative labels
 * - Customizable colors (preset and custom)
 * - Offset positioning
 * - Show zero option
 * - Theme-aware styling
 * 
 * ## Usage
 * ```html
 * <!-- Basic count badge -->
 * <nr-badge count="5">
 *   <button>Notifications</button>
 * </nr-badge>
 * 
 * <!-- Dot badge -->
 * <nr-badge dot>
 *   <nr-icon name="notification"></nr-icon>
 * </nr-badge>
 * 
 * <!-- Status badge -->
 * <nr-badge status="success" text="Success"></nr-badge>
 * 
 * <!-- Ribbon badge -->
 * <nr-badge ribbon="Recommended">
 *   <div class="card">Card content</div>
 * </nr-badge>
 * 
 * <!-- Standalone badge -->
 * <nr-badge count="25"></nr-badge>
 * ```
 * 
 * @element nr-badge
 * 
 * @slot - Content to wrap with badge (avatar, icon, etc.)
 * 
 * @cssproperty --nuraly-badge-text-font-size - Font size of badge text
 * @cssproperty --nuraly-badge-text-font-weight - Font weight of badge text
 * @cssproperty --nuraly-badge-indicator-height - Height of badge indicator
 * @cssproperty --nuraly-badge-indicator-height-sm - Height of small badge
 * @cssproperty --nuraly-badge-indicator-z-index - Z-index of badge
 * @cssproperty --nuraly-badge-dot-size - Size of dot badge
 * @cssproperty --nuraly-badge-status-size - Size of status indicator
 */
@customElement('nr-badge')
export class NrBadgeElement extends NuralyUIBaseMixin(LitElement) {
  static override styles = styles;

  /**
   * Number to show in badge
   */
  @property({ type: Number })
  count?: number;

  /**
   * Whether to display a dot instead of count
   */
  @property({ type: Boolean })
  dot = false;

  /**
   * Max count to show (shows count+ when exceeded)
   */
  @property({ type: Number, attribute: 'overflow-count' })
  overflowCount = 99;

  /**
   * Whether to show badge when count is zero
   */
  @property({ type: Boolean, attribute: 'show-zero' })
  showZero = false;

  /**
   * Set offset of the badge dot [x, y]
   */
  @property({ type: Array })
  offset?: [number, number];

  /**
   * Badge color (preset or custom hex/rgb)
   */
  @property({ type: String })
  color?: BadgeColor | string;

  /**
   * Badge size
   */
  @property({ type: String })
  size: BadgeSize = BadgeSize.Default;

  /**
   * Set Badge as a status dot
   */
  @property({ type: String })
  status?: BadgeStatus;

  /**
   * Status text to display
   */
  @property({ type: String })
  text?: string;

  /**
   * Title to show on hover
   */
  @property({ type: String })
  badgeTitle?: string;

  /**
   * Ribbon text (enables ribbon mode)
   */
  @property({ type: String })
  ribbon?: string;

  /**
   * Ribbon placement
   */
  @property({ type: String, attribute: 'ribbon-placement' })
  ribbonPlacement: RibbonPlacement = RibbonPlacement.End;

  /**
   * Get the display count text
   */
  private getDisplayCount(): string {
    if (this.count === undefined) return '';
    
    const count = Number(this.count);
    if (count > this.overflowCount) {
      return `${this.overflowCount}+`;
    }
    return String(count);
  }

  /**
   * Check if badge should be hidden
   */
  private shouldHideBadge(): boolean {
    if (this.dot) return false;
    if (this.count === undefined) return true;
    if (this.count === 0 && !this.showZero) return true;
    return false;
  }

  /**
   * Get custom color style
   */
  private getCustomColorStyle(): Record<string, string> {
    if (!this.color) return {};
    
    // Preset colors are handled via CSS classes
    const presetColors = ['pink', 'red', 'yellow', 'orange', 'cyan', 'green', 
                          'blue', 'purple', 'geekblue', 'magenta', 'volcano', 'gold', 'lime'];
    const isCustomColor = !presetColors.includes(this.color);
    
    if (isCustomColor) {
      return {
        backgroundColor: this.color,
        color: '#fff'
      };
    }
    
    return {};
  }

  /**
   * Get offset style
   */
  private getOffsetStyle(): Record<string, string> {
    if (!this.offset) return {};
    
    const [x, y] = this.offset;
    return {
      right: `calc(0px - ${x}px)`,
      top: `${y}px`,
    };
  }

  /**
   * Render status badge
   */
  private renderStatusBadge(): TemplateResult {
    return html`
      <span class="badge-status">
        <span class="badge-status-dot ${this.status}"></span>
        ${this.text ? html`<span class="badge-status-text">${this.text}</span>` : nothing}
      </span>
    `;
  }

  /**
   * Render ribbon badge
   */
  private renderRibbonBadge(): TemplateResult {
    const ribbonClasses = {
      'badge-ribbon': true,
      [this.ribbonPlacement]: true,
      [this.color || '']: !!this.color,
    };

    const ribbonStyle = this.getCustomColorStyle();

    return html`
      <div class="badge-ribbon-wrapper">
        <slot></slot>
        <div class=${classMap(ribbonClasses)} style=${styleMap(ribbonStyle)}>
          ${this.ribbon}
        </div>
      </div>
    `;
  }

  /**
   * Render count/dot badge
   */
  private renderCountBadge(): TemplateResult {
    const hasChildren = this.querySelector(':not([slot])') !== null;
    const isStandalone = !hasChildren;
    const isHidden = this.shouldHideBadge();

    const presetColors = ['pink', 'red', 'yellow', 'orange', 'cyan', 'green', 
                          'blue', 'purple', 'geekblue', 'magenta', 'volcano', 'gold', 'lime'];
    const isPresetColor = this.color && presetColors.includes(this.color);

    const indicatorClasses = {
      'badge-indicator': true,
      'badge-standalone': isStandalone,
      'badge-hidden': isHidden,
      'dot': this.dot,
      'small': this.size === BadgeSize.Small,
      ...(this.color && isPresetColor ? { [this.color]: true } : {}),
    };

    const indicatorStyle = {
      ...this.getCustomColorStyle(),
      ...this.getOffsetStyle(),
    };

    const badgeContent = this.dot ? nothing : this.getDisplayCount();

    if (isStandalone) {
      return html`
        <span
          class=${classMap(indicatorClasses)}
          style=${styleMap(indicatorStyle)}
          title=${this.badgeTitle || ''}
        >
          ${badgeContent}
        </span>
      `;
    }

    return html`
      <span class="badge-wrapper">
        <slot></slot>
        <span
          class=${classMap(indicatorClasses)}
          style=${styleMap(indicatorStyle)}
          title=${this.badgeTitle || ''}
        >
          ${badgeContent}
        </span>
      </span>
    `;
  }

  override render() {
    // Ribbon mode
    if (this.ribbon) {
      return this.renderRibbonBadge();
    }

    // Status mode
    if (this.status) {
      return this.renderStatusBadge();
    }

    // Count/Dot mode
    return this.renderCountBadge();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'nr-badge': NrBadgeElement;
  }
}
