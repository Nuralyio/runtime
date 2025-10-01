/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { styles } from './default-color-sets.style.js';
import './color-holder.component.js';
import type { ColorClickEventDetail } from './interfaces/index.js';

/**
 * Default color sets component for displaying preset color swatches.
 * 
 * Renders a grid of clickable color swatches that can be used as quick color selections.
 * 
 * @example
 * ```html
 * <nr-default-color-sets 
 *   .defaultColorSets="${['#3498db', '#e74c3c', '#2ecc71', '#f39c12']}">
 * </nr-default-color-sets>
 * ```
 * 
 * @fires color-click - Fired when a color swatch is clicked
 * 
 * @cssproperty --default-color-sets-gap - Gap between color swatches
 * @cssproperty --default-color-sets-padding - Padding around the color grid
 */
@customElement('nr-default-color-sets')
export class DefaultColorSets extends LitElement {
  static override styles = styles;

  /** Array of color values to display as swatches */
  @property({ type: Array, attribute: 'default-color-sets' })
  defaultColorSets: string[] = [];

  /** Size of the color swatches */
  @property({ type: String, reflect: true })
  size: 'small' | 'default' | 'large' = 'default';

  /** Number of columns in the grid */
  @property({ type: Number, attribute: 'columns' })
  columns = 8;

  /**
   * Handles color swatch click
   * @param color - The clicked color value
   * @param event - The click event
   */
  private handleColorClick(color: string, event: Event): void {
    event.stopPropagation();
    
    if (!this.isValidColor(color)) {
      console.warn(`Invalid color: ${color}`);
      return;
    }

    const detail: ColorClickEventDetail = {
      value: color,
    };

    this.dispatchEvent(
      new CustomEvent('color-click', {
        bubbles: true,
        composed: true,
        detail,
      })
    );
  }

  /**
   * Validates if a color string is valid CSS color
   */
  private isValidColor(color: string): boolean {
    try {
      return CSS.supports('color', color);
    } catch {
      return false;
    }
  }

  override render() {
    if (!this.defaultColorSets || this.defaultColorSets.length === 0) {
      return nothing;
    }

    return html`
      <div 
        class="default-color-sets-container"
        role="list"
        aria-label="Preset color swatches"
        style="--columns: ${this.columns}"
      >
        ${map(
          this.defaultColorSets,
          (color) => html`
            <nr-colorholder-box
              color="${color}"
              .size=${this.size}
              class="color-set-container"
              role="listitem"
              tabindex="0"
              aria-label="Color ${color}"
              @click=${(e: Event) => this.handleColorClick(color, e)}
              @keydown=${(e: KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  this.handleColorClick(color, e);
                }
              }}
            ></nr-colorholder-box>
          `
        )}
      </div>
    `;
  }
}
