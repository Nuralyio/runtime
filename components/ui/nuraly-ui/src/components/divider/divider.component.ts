import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import { NuralyUIBaseMixin } from '@nuralyui/common/mixins';
import styles from "./divider.style.js";
import {
  DividerType,
  DividerOrientation,
  DividerVariant,
  DividerSize
} from "./divider.types.js";

/**
 * @element nr-divider
 * 
 * @summary A divider line separates different content.
 * 
 * @description
 * The Divider component is used to divide sections of content or inline text.
 * Based on Ant Design Divider component.
 * 
 * @prop {DividerType} type - The direction type of divider (horizontal or vertical)
 * @prop {boolean} dashed - Whether line is dashed (deprecated, use variant instead)
 * @prop {DividerVariant} variant - Line style variant (solid, dashed, dotted)
 * @prop {DividerOrientation} orientation - Position of title inside divider (start, center, end)
 * @prop {string | number} orientationMargin - Margin between title and closest border
 * @prop {boolean} plain - Divider text show as plain style
 * @prop {DividerSize} size - Size of divider (only for horizontal: small, middle, large)
 * 
 * @slot - The title/text content to display in the divider
 * 
 * @cssprop --nuraly-divider-color - Border color
 * @cssprop --nuraly-divider-text-color - Text color
 * @cssprop --nuraly-divider-font-size - Font size for title
 * @cssprop --nuraly-divider-margin - Vertical margin for horizontal divider
 * @cssprop --nuraly-divider-orientation-margin - Margin between text and edge
 * 
 * @example
 * ```html
 * <!-- Basic horizontal divider -->
 * <nr-divider></nr-divider>
 * 
 * <!-- Divider with text -->
 * <nr-divider>Text</nr-divider>
 * 
 * <!-- Vertical divider -->
 * <nr-divider type="vertical"></nr-divider>
 * 
 * <!-- Dashed divider with text -->
 * <nr-divider variant="dashed" orientation="start">Left Text</nr-divider>
 * ```
 */
@customElement('nr-divider')
export class NrDividerElement extends NuralyUIBaseMixin(LitElement) {
  static override styles = styles;

  /**
   * The direction type of divider
   * @type {DividerType}
   */
  @property({ type: String })
  type: DividerType = DividerType.Horizontal;

  /**
   * Whether line is dashed (deprecated, use variant instead)
   * @deprecated Use variant="dashed" instead
   * @type {boolean}
   */
  @property({ type: Boolean })
  dashed = false;

  /**
   * Line style variant
   * @type {DividerVariant}
   */
  @property({ type: String })
  variant: DividerVariant = DividerVariant.Solid;

  /**
   * Position of title inside divider
   * @type {DividerOrientation}
   */
  @property({ type: String })
  orientation: DividerOrientation = DividerOrientation.Center;

  /**
   * Margin between title and closest border
   * Accepts string with units or number (defaults to px)
   * @type {string | number}
   */
  @property({ type: String, attribute: 'orientation-margin' })
  orientationMargin?: string | number;

  /**
   * Divider text show as plain style
   * @type {boolean}
   */
  @property({ type: Boolean })
  plain = true;

  /**
   * Size of divider (only for horizontal)
   * @type {DividerSize}
   */
  @property({ type: String })
  size?: DividerSize;

  /**
   * Check if divider has text content
   */
  private get hasText(): boolean {
    const slot = this.shadowRoot?.querySelector('slot');
    const nodes = slot?.assignedNodes({ flatten: true }) || [];
    return nodes.some(node => 
      node.nodeType === Node.TEXT_NODE && node.textContent?.trim() ||
      node.nodeType === Node.ELEMENT_NODE
    );
  }

  override render() {
    // Support deprecated dashed prop
    const effectiveVariant = this.dashed ? DividerVariant.Dashed : this.variant;
    
    const isHorizontal = this.type === DividerType.Horizontal;
    const isVertical = this.type === DividerType.Vertical;

    const classes = {
      'divider': true,
      'divider--horizontal': isHorizontal,
      'divider--vertical': isVertical,
      'divider--with-text': isHorizontal && this.hasText,
      'divider--plain': this.plain,
      [`divider--${effectiveVariant}`]: true,
      [`divider--${this.orientation}`]: isHorizontal && this.hasText,
      [`divider--${this.size}`]: isHorizontal && !!this.size
    };

    // Calculate orientation margin style
    const orientationMarginStyle: Record<string, string> = {};
    if (this.orientationMargin !== undefined && isHorizontal && this.hasText) {
      const marginValue = typeof this.orientationMargin === 'number' 
        ? `${this.orientationMargin}px` 
        : this.orientationMargin;
      
      if (this.orientation === DividerOrientation.Start) {
        orientationMarginStyle['--nuraly-divider-orientation-margin-left'] = marginValue;
      } else if (this.orientation === DividerOrientation.End) {
        orientationMarginStyle['--nuraly-divider-orientation-margin-right'] = marginValue;
      }
    }

    // Vertical divider (no text support)
    if (isVertical) {
      return html`<div class=${classMap(classes)}></div>`;
    }

    // Horizontal divider without text
    if (!this.hasText) {
      return html`<div class=${classMap(classes)}></div>`;
    }

    // Horizontal divider with text
    return html`
      <div class=${classMap(classes)} style=${styleMap(orientationMarginStyle)}>
        <span class="divider__text">
          <slot></slot>
        </span>
      </div>
    `;
  }
}