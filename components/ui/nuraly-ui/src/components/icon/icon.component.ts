/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @license
 * Copyright 2023 Nuraly Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { library, dom } from '@fortawesome/fontawesome-svg-core';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
library.add(fas, far);
dom.watch();

import { styles } from './icon.style.js';
import { IconTypes, regularIconPack, solidIconPack } from './icon.types.js';
import { NuralyUIBaseMixin } from '../../shared/base-mixin.js';
import { ClickableMixin } from './mixins/index.js';

/**
 * Enhanced Icon component with clickable functionality, custom styling, and comprehensive theming
 * 
 * @example
 * ```html
 * <nr-icon name="envelope"></nr-icon>
 * <nr-icon name="check" clickable @icon-click="${this.handleIconClick}"></nr-icon>
 * <nr-icon name="warning" type="regular" disabled></nr-icon>
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

  /** The FontAwesome icon name */
  @property({type: String})
  name!: string;

  /** The icon type (solid or regular) */
  @property()
  type = IconTypes.Solid;

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
    const iconPath = this.getIconPath();
    const role = this.getIconRole();
    const tabIndex = this.getIconTabIndex();
    const ariaDisabled = this.getAriaDisabled();
    
    // Build dynamic styles using CSS custom properties
    let dynamicStyles = '';
    if (this.color) {
      dynamicStyles += `--nuraly-color-icon: ${this.color};`;
    }
    if (this.width) {
      dynamicStyles += `width: ${this.width};`;
    }
    if (this.height) {
      dynamicStyles += `height: ${this.height};`;
    }
    
    // Build CSS classes
    const cssClasses = [
      'svg-icon',
      this.clickable ? 'clickable' : '',
      this.disabled ? 'disabled' : ''
    ].filter(Boolean).join(' ');
    
    return html`
      <svg 
        class="${cssClasses}"
        style="${dynamicStyles}"
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 550 550"
        role="${role}"
        tabindex="${tabIndex}"
        aria-label="${this.alt || this.name}"
        aria-disabled="${ariaDisabled || 'false'}"
        data-theme="${this.currentTheme}"
        @click="${this.clickable ? this.handleIconClick : undefined}"
        @keydown="${this.clickable ? this.handleIconKeydown : undefined}"
      >
        <path d="${iconPath}" />
      </svg>
    `;
  }
  getIconPath() {
    if (!this.name) {
      console.warn('HyIconElement: Icon name is required');
      return '';
    }

    const iconPack = this.type == IconTypes.Solid ? solidIconPack : regularIconPack;
    
    try {
      const definitions = (library as any).definitions;
      if (!definitions || !definitions[iconPack]) {
        console.warn(`HyIconElement: Icon pack "${iconPack}" not found`);
        return '';
      }

      const iconDefinition = definitions[iconPack][this.name];
      if (!iconDefinition) {
        console.warn(`HyIconElement: Icon "${this.name}" not found in ${iconPack} pack`);
        return '';
      }

      // Validate that the path data exists
      const pathData = iconDefinition[4];
      if (!pathData || typeof pathData !== 'string') {
        console.warn(`HyIconElement: Invalid path data for icon "${this.name}"`);
        return '';
      }

      return pathData;
    } catch (error) {
      console.error(`HyIconElement: Error loading icon "${this.name}":`, error);
      return '';
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
