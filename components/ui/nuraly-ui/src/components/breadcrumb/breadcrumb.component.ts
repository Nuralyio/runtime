/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, LitElement, nothing, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { styles } from './breadcrumb.style.js';
import { NuralyUIBaseMixin } from '../../shared/base-mixin.js';
import {
    BreadcrumbItem,
    BreadcrumbMenuItem,
    BreadcrumbSeparator,
    BreadcrumbSeparatorConfig
} from './breadcrumb.types.js';
import '../icon/index.js';

/**
 * # Breadcrumb Component
 * 
 * Display the current location within a hierarchy and allow navigation back to higher levels.
 * Breadcrumbs show where you are in the site structure and make it easy to navigate up the hierarchy.
 * 
 * ## Features
 * - Configurable separator styles (slash, arrow, chevron, etc.)
 * - Support for icons alongside text
 * - Dropdown menus for complex hierarchies
 * - Clickable links with href or custom click handlers
 * - RTL support
 * - Fully accessible with keyboard navigation
 * - Theme-aware styling
 * 
 * ## Usage
 * ```html
 * <!-- Basic breadcrumb -->
 * <nr-breadcrumb .items="${[
 *   { title: 'Home', href: '/' },
 *   { title: 'Category', href: '/category' },
 *   { title: 'Product' }
 * ]}"></nr-breadcrumb>
 * 
 * <!-- With custom separator -->
 * <nr-breadcrumb 
 *   separator=">"
 *   .items="${items}">
 * </nr-breadcrumb>
 * 
 * <!-- With icons -->
 * <nr-breadcrumb .items="${[
 *   { title: 'Home', icon: 'home', href: '/' },
 *   { title: 'Settings', icon: 'settings', href: '/settings' },
 *   { title: 'Profile' }
 * ]}"></nr-breadcrumb>
 * 
 * <!-- With dropdown menu -->
 * <nr-breadcrumb .items="${[
 *   { title: 'Home', href: '/' },
 *   { 
 *     title: 'Products',
 *     menu: [
 *       { label: 'Electronics', href: '/products/electronics' },
 *       { label: 'Clothing', href: '/products/clothing' }
 *     ]
 *   },
 *   { title: 'Current Item' }
 * ]}"></nr-breadcrumb>
 * ```
 * 
 * @element nr-breadcrumb
 * @fires nr-breadcrumb-click - Fired when a breadcrumb item is clicked
 * 
 * @cssproperty --nuraly-breadcrumb-font-size - Font size of breadcrumb items
 * @cssproperty --nuraly-breadcrumb-line-height - Line height of breadcrumb items
 * @cssproperty --nuraly-breadcrumb-item-color - Color of breadcrumb items
 * @cssproperty --nuraly-breadcrumb-link-color - Color of breadcrumb links
 * @cssproperty --nuraly-breadcrumb-link-hover-color - Color of breadcrumb links on hover
 * @cssproperty --nuraly-breadcrumb-last-item-color - Color of the last breadcrumb item
 * @cssproperty --nuraly-breadcrumb-separator-color - Color of separators
 * @cssproperty --nuraly-breadcrumb-separator-margin - Margin around separators
 * @cssproperty --nuraly-breadcrumb-icon-font-size - Font size of icons
 */
@customElement('nr-breadcrumb')
export class NrBreadcrumbElement extends NuralyUIBaseMixin(LitElement) {
  static override styles = styles;

  override requiredComponents = ['nr-icon'];

  /**
   * Array of breadcrumb items to display
   */
  @property({ type: Array })
  items: BreadcrumbItem[] = [];

  /**
   * Separator between breadcrumb items
   * Can be a string or one of the predefined separator types
   */
  @property({ type: String })
  separator: BreadcrumbSeparator | string = BreadcrumbSeparator.Slash;

  /**
   * Custom separator configuration for more control
   */
  @property({ type: Object, attribute: 'separator-config' })
  separatorConfig?: BreadcrumbSeparatorConfig;

  /**
   * Handle breadcrumb item click
   */
  private handleItemClick(item: BreadcrumbItem, e: MouseEvent): void {
    if (item.disabled) {
      e.preventDefault();
      return;
    }

    // Dispatch custom event
    this.dispatchEvent(
      new CustomEvent('nr-breadcrumb-click', {
        detail: { item, event: e },
        bubbles: true,
        composed: true
      })
    );

    // Call custom click handler if provided
    if (item.onClick) {
      item.onClick(e);
    }
  }

  /**
   * Handle menu item click
   */
  private handleMenuItemClick(menuItem: BreadcrumbMenuItem, e: MouseEvent): void {
    if (menuItem.disabled) {
      e.preventDefault();
      return;
    }

    if (menuItem.onClick) {
      menuItem.onClick(e);
    }
  }

  /**
   * Render a breadcrumb item icon
   */
  private renderIcon(item: BreadcrumbItem): TemplateResult | typeof nothing {
    if (!item.icon) {
      return nothing;
    }

    return html`
      <nr-icon
        class="breadcrumb-icon"
        name="${item.icon}"
        type="${item.iconType || 'regular'}"
      ></nr-icon>
    `;
  }

  /**
   * Render the separator between breadcrumb items
   */
  private renderSeparator(): TemplateResult {
    if (this.separatorConfig) {
      if (this.separatorConfig.isIcon) {
        return html`
          <span class="breadcrumb-separator">
            <nr-icon
              name="${this.separatorConfig.separator}"
              type="${this.separatorConfig.iconType || 'regular'}"
            ></nr-icon>
          </span>
        `;
      }
      return html`<span class="breadcrumb-separator">${this.separatorConfig.separator}</span>`;
    }

    return html`<span class="breadcrumb-separator">${this.separator}</span>`;
  }

  /**
   * Render dropdown menu for an item
   */
  private renderMenu(menu: BreadcrumbMenuItem[]): TemplateResult {
    return html`
      <div class="breadcrumb-dropdown">
        ${map(
          menu,
          (menuItem) => html`
            ${menuItem.href
              ? html`
                  <a
                    class="breadcrumb-menu-item ${menuItem.disabled ? 'disabled' : ''}"
                    href="${menuItem.href}"
                    @click="${(e: MouseEvent) => this.handleMenuItemClick(menuItem, e)}"
                  >
                    ${menuItem.icon
                      ? html`<nr-icon name="${menuItem.icon}"></nr-icon>`
                      : nothing}
                    <span>${menuItem.label}</span>
                  </a>
                `
              : html`
                  <div
                    class="breadcrumb-menu-item ${menuItem.disabled ? 'disabled' : ''}"
                    @click="${(e: MouseEvent) => this.handleMenuItemClick(menuItem, e)}"
                  >
                    ${menuItem.icon
                      ? html`<nr-icon name="${menuItem.icon}"></nr-icon>`
                      : nothing}
                    <span>${menuItem.label}</span>
                  </div>
                `}
          `
        )}
      </div>
    `;
  }

  /**
   * Render a single breadcrumb item
   */
  private renderItem(item: BreadcrumbItem, index: number): TemplateResult {
    const isLast = index === this.items.length - 1;
    const hasMenu = item.menu && item.menu.length > 0;

    const content = html`
      ${this.renderIcon(item)}
      <span>${item.title}</span>
    `;

    return html`
      <li class="breadcrumb-item ${hasMenu ? 'breadcrumb-item-with-menu' : ''} ${item.className || ''}">
        ${isLast
          ? html`<span class="breadcrumb-text">${content}</span>`
          : item.href
            ? html`
                <a
                  class="breadcrumb-link ${item.disabled ? 'disabled' : ''}"
                  href="${item.href}"
                  @click="${(e: MouseEvent) => this.handleItemClick(item, e)}"
                >
                  ${content}
                </a>
              `
            : html`
                <span
                  class="breadcrumb-link ${item.disabled ? 'disabled' : ''}"
                  @click="${(e: MouseEvent) => this.handleItemClick(item, e)}"
                >
                  ${content}
                </span>
              `}
        ${hasMenu ? this.renderMenu(item.menu!) : nothing}
      </li>
      ${!isLast ? this.renderSeparator() : nothing}
    `;
  }

  override render() {
    if (!this.items || this.items.length === 0) {
      return nothing;
    }

    return html`
      <nav aria-label="Breadcrumb" class="breadcrumb">
        ${map(this.items, (item, index) => this.renderItem(item, index))}
      </nav>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'nr-breadcrumb': NrBreadcrumbElement;
  }
}
