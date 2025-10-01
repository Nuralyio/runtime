/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { styles } from './color-holder.style.js';
import { ColorPickerSize } from './color-picker.types.js';

/**
 * Color holder box component for displaying a color swatch.
 * 
 * Renders a colored box that can be used as a color indicator or trigger.
 * Supports various sizes and can be disabled.
 * 
 * @example
 * ```html
 * <hy-colorholder-box color="#3498db"></hy-colorholder-box>
 * <hy-colorholder-box color="rgb(52, 152, 219)" size="large"></hy-colorholder-box>
 * <hy-colorholder-box color="#e74c3c" disabled></hy-colorholder-box>
 * ```
 * 
 * @cssproperty --color-holder-size - Size of the color box
 * @cssproperty --color-holder-border - Border style
 * @cssproperty --color-holder-border-radius - Border radius
 * @cssproperty --color-holder-cursor - Cursor style
 */
@customElement('hy-colorholder-box')
export class ColorHolderBox extends LitElement {
  static override styles = styles;

  /** The color value to display */
  @property({ type: String })
  color = '#3498db';

  /** Size variant (small, default, large) */
  @property({ type: String, reflect: true })
  size: ColorPickerSize = ColorPickerSize.Default;

  /** Whether the color holder is disabled */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /** Show a checkered background for transparent colors */
  @property({ type: Boolean, attribute: 'show-transparency-grid' })
  showTransparencyGrid = true;

  /** Border width in pixels */
  @property({ type: Number, attribute: 'border-width' })
  borderWidth = 2;

  /** Whether to show a border */
  @property({ type: Boolean, attribute: 'show-border' })
  showBorder = true;

  /**
   * Validates if the color is valid CSS color
   */
  private isValidColor(): boolean {
    try {
      return CSS.supports('color', this.color);
    } catch {
      return false;
    }
  }

  /**
   * Checks if the color is transparent or has transparency
   */
  private isTransparent(): boolean {
    return this.color === 'transparent' || 
           this.color.toLowerCase().includes('rgba') ||
           this.color.toLowerCase().includes('hsla');
  }

  override render() {
    const containerClasses = {
      'color-holder-container': true,
      'color-holder-container--disabled': this.disabled,
      'color-holder-container--invalid': !this.isValidColor(),
      'color-holder-container--transparent': this.isTransparent() && this.showTransparencyGrid,
      [`color-holder-container--${this.size}`]: true,
    };

    const containerStyles = {
      backgroundColor: this.isValidColor() ? this.color : '#ffffff',
      borderWidth: this.showBorder ? `${this.borderWidth}px` : '0',
    };

    return html`
      <div 
        class="${classMap(containerClasses)}" 
        style="${styleMap(containerStyles)}"
        role="img"
        aria-label="Color swatch: ${this.color}"
        title="${this.color}"
      ></div>
    `;
  }
}
