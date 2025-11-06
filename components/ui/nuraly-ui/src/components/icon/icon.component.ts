/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @license
 * Copyright 2023 Nuraly Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { icons, createElement } from 'lucide';

import { styles } from './icon.style.js';
import { IconTypes } from './icon.types.js';
import { NuralyUIBaseMixin } from '@nuralyui/common/mixins';
import { ClickableMixin } from './mixins/index.js';

/**
 * Enhanced Icon component with clickable functionality, custom styling, and comprehensive theming
 * 
 * @example
 * ```html
 * <nr-icon name="mail"></nr-icon>
 * <nr-icon name="check" clickable @icon-click="${this.handleIconClick}"></nr-icon>
 * <nr-icon name="alert-triangle" type="regular" disabled></nr-icon>
 * <nr-icon name="star" color="#ffd700" size="large"></nr-icon>
 * ```
 * 
 * @fires icon-click - Dispatched when icon is clicked (contains iconName, iconType, originalEvent, timestamp)
 * @fires icon-keyboard-activation - Dispatched when icon is activated via keyboard (contains iconName, iconType, key, originalEvent, timestamp)
 */

const IconBaseMixin = ClickableMixin(NuralyUIBaseMixin(LitElement));
@customElement('nr-icon')
export class HyIconElement extends IconBaseMixin {
  static override readonly styles = styles;

  /** The Lucide icon name */
  @property({type: String})
  name!: string;

  /** The icon type (solid or regular) */
  @property()
  type = IconTypes.Regular;

  /** Alternative text for accessibility */
  @property({type: String, attribute: 'alt'})
  alt = '';

  /** Icon size (small, medium, large, xlarge, xxlarge) */
  @property({type: String, reflect: true})
  size?: 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge';

  /** Icon color override */
  @property({type: String})
  color?: string;

  /** Custom width override */
  @property({type: String})
  width?: string;

  /** Custom height override */
  @property({type: String})
  height?: string;

  /**
   * Validate component properties on update
   */
  override willUpdate(changedProperties: Map<string, any>) {
    super.willUpdate(changedProperties);
    
    if (changedProperties.has('name') && !this.name) {
      console.error('HyIconElement: "name" property is required');
    }
    
    if (changedProperties.has('type') && 
        this.type !== IconTypes.Solid && this.type !== IconTypes.Regular) {
      console.warn(`HyIconElement: Invalid type "${this.type}". Using default "${IconTypes.Solid}"`);
      this.type = IconTypes.Solid;
    }

    if (changedProperties.has('size') && this.size) {
      const validSizes = ['small', 'medium', 'large', 'xlarge', 'xxlarge'];
      if (!validSizes.includes(this.size)) {
        console.warn(`HyIconElement: Invalid size "${this.size}". Valid sizes are: ${validSizes.join(', ')}`);
      }
    }
  }
  override render() {
    // Build dynamic styles using CSS custom properties
    let dynamicStyles = '';
    if (this.color) {
      dynamicStyles += `color: ${this.color};`;
    }
    if (this.width) {
      dynamicStyles += `width: ${this.width};`;
    }
    if (this.height) {
      dynamicStyles += `height: ${this.height};`;
    }
    
    return html`
      <div 
        id="icon-slot" 
        class="icon-container ${this.clickable ? 'clickable' : ''} ${this.disabled ? 'disabled' : ''}"
        style="${dynamicStyles}"
        data-theme="${this.currentTheme}"
      ></div>
    `;
  }

  /**
   * Create and mount the Lucide SVG icon using createElement
   */
  private mountIcon() {
    const slot = this.renderRoot?.querySelector('#icon-slot') as HTMLElement | null;
    if (!slot) return;
    
    // Clear previous content
    while (slot.firstChild) {
      slot.removeChild(slot.firstChild);
    }

    if (!this.name) {
      console.warn('HyIconElement: Icon name is required');
      return;
    }

    try {
      // Convert kebab-case to PascalCase for Lucide icon names
      const pascalCaseName = this.name
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
      
      // Get the icon data from Lucide
      const iconData = (icons as any)[pascalCaseName];
      
      if (!iconData) {
        console.warn(`HyIconElement: Icon "${this.name}" (${pascalCaseName}) not found in Lucide icons`);
        return;
      }

      // Use Lucide's createElement to generate the SVG element
      const svgClasses = [
        'svg-icon',
        this.clickable ? 'clickable' : '',
        this.disabled ? 'disabled' : ''
      ].filter(Boolean);

      const svgElement = (createElement as any)(iconData, {
        class: svgClasses,
        'stroke-width': 2,
      });

      // Set accessibility attributes
      svgElement.setAttribute('role', this.getIconRole());
      svgElement.setAttribute('tabindex', this.getIconTabIndex());
      svgElement.setAttribute('aria-label', this.alt || this.name);
      if (this.disabled) {
        svgElement.setAttribute('aria-disabled', 'true');
      }

      // Add event listeners for clickable icons
      if (this.clickable) {
        svgElement.addEventListener('click', (e: MouseEvent) => this.handleIconClick(e));
        svgElement.addEventListener('keydown', (e: KeyboardEvent) => this.handleIconKeydown(e));
      }

      // Append to slot
      slot.appendChild(svgElement);
    } catch (error) {
      console.error(`HyIconElement: Error loading icon "${this.name}":`, error);
    }
  }

  override firstUpdated(changedProperties: Map<string, any>): void {
    super.firstUpdated?.(changedProperties);
    this.mountIcon();
  }

  override updated(changedProperties: Map<string, any>): void {
    super.updated?.(changedProperties);
    
    // Re-mount icon if any relevant property changed
    if (changedProperties.has('name') || 
        changedProperties.has('color') || 
        changedProperties.has('clickable') || 
        changedProperties.has('disabled')) {
      this.mountIcon();
    }
  }

  /**
   * Get the appropriate ARIA role for the icon
   */
  override getIconRole(): string {
    if (this.clickable) {
      return 'button';
    }
    return this.alt ? 'img' : 'presentation';
  }

  /**
   * Get the appropriate tabindex for the icon
   */
  override getIconTabIndex(): string {
    if (this.clickable && !this.disabled) {
      return '0';
    }
    return '-1';
  }

  /**
   * Get the appropriate aria-disabled value
   */
  override getAriaDisabled(): string | undefined {
    return this.disabled ? 'true' : undefined;
  }
}
