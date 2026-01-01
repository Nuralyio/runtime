/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, LitElement, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styles } from './dropdown.style';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { NuralyUIBaseMixin } from '@nuralyui/common/mixins';
import { NrDropdownController } from './controllers/dropdown.controller.js';

import {
    DropdownPlacement,
    DropdownTrigger,
    DropdownSize,
    DropdownAnimation,
    DropdownItem
} from './dropdown.types.js';

/**
 * # Dropdown Component
 * 
 * A versatile dropdown component that provides floating panel functionality with customizable triggers,
 * content, and positioning. Supports both predefined item lists and custom slot content with
 * cascading submenus and interactive elements.
 * 
 * ## Features
 * - Multiple trigger modes (hover, click, focus, manual)
 * - Flexible positioning with auto-placement
 * - Cascading submenus with custom content support
 * - Interactive elements (forms, buttons) within dropdowns
 * - Keyboard navigation and accessibility
 * - Customizable animations and styling
 * - Event delegation and outside click detection
 * 
 * ## Usage
 * ```html
 * <!-- Basic dropdown with slot content -->
 * <nr-dropdown trigger="hover">
 *   <button slot="trigger">Menu</button>
 *   <div slot="content">
 *     <p>Custom content here</p>
 *   </div>
 * </nr-dropdown>
 * 
 * <!-- Dropdown with predefined items -->
 * <nr-dropdown 
 *   .items="${items}" 
 *   placement="bottom-start"
 *   trigger="click">
 *   <button slot="trigger">Menu</button>
 * </nr-dropdown>
 * 
 * <!-- Hover dropdown with custom positioning -->
 * <nr-dropdown 
 *   trigger="hover" 
 *   placement="top"
 *   size="large">
 *   <span slot="trigger">Hover me</span>
 *   <div slot="content">Tooltip content</div>
 * </nr-dropdown>
 * ```
 * 
 * @element nr-dropdown
 * @fires nr-dropdown-open - Fired when dropdown opens
 * @fires nr-dropdown-close - Fired when dropdown closes
 * @fires nr-dropdown-item-click - Fired when dropdown item is clicked
 * 
 * @slot trigger - Element that triggers the dropdown
 * @slot content - Custom content for the dropdown panel
 * @slot header - Optional header content
 * @slot footer - Optional footer content
 * 
 * @cssproperty --dropdown-background - Background color of dropdown panel
 * @cssproperty --dropdown-border - Border of dropdown panel
 * @cssproperty --dropdown-shadow - Shadow of dropdown panel
 * @cssproperty --dropdown-border-radius - Border radius of dropdown panel
 * @cssproperty --dropdown-max-width - Maximum width of dropdown panel
 * @cssproperty --dropdown-min-width - Minimum width of dropdown panel
 * @cssproperty --dropdown-max-height - Maximum height of dropdown panel
 */
@customElement('nr-dropdown')
export class NrDropdownElement extends NuralyUIBaseMixin(LitElement) {
  static override styles = styles;

  override requiredComponents = ['nr-icon'];

  @property({ type: Array }) items: DropdownItem[] = [];
  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: String }) placement: DropdownPlacement = DropdownPlacement.Bottom;
  @property({ type: String }) trigger: DropdownTrigger = DropdownTrigger.Hover;
  @property({ type: String }) size: DropdownSize = DropdownSize.Medium;
  @property({ type: String }) animation: DropdownAnimation = DropdownAnimation.Fade;
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) arrow = false;
  @property({ type: Boolean, attribute: 'auto-close' }) autoClose = false;
  @property({ type: Boolean, attribute: 'close-on-outside-click' }) closeOnOutsideClick = true;
  @property({ type: Boolean, attribute: 'close-on-escape' }) closeOnEscape = true;
  @property({ type: Number }) offset = 4;
  @property({ type: Number }) delay = 50;
  @property({ type: String, attribute: 'max-height' }) maxHeight = '300px';
  @property({ type: String, attribute: 'min-width' }) minWidth = 'auto';
  @property({ type: String, attribute: 'cascade-direction' }) cascadeDirection: 'right' | 'left' | 'auto' = 'auto';
  @property({ type: Number, attribute: 'cascade-delay' }) cascadeDelay = 50;
  @property({ type: Boolean, attribute: 'cascade-on-hover' }) cascadeOnHover = true;

  private dropdownController = new NrDropdownController(this);
  private openSubmenus = new Set<string>();
  private submenuTimers = new Map<string, number>();

  override connectedCallback(): void {
    super.connectedCallback();
    this.updateCascadingAttribute();
  }

  override updated(changedProperties: Map<string, any>): void {
    super.updated(changedProperties);
    if (changedProperties.has('items')) {
      this.updateCascadingAttribute();
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
  }

  override firstUpdated(): void {
  }

  private updateCascadingAttribute(): void {
    const hasCascading = this.items.some(item => 
      (item.options && item.options.length > 0) || !!item.customContent
    );
    if (hasCascading) {
      this.setAttribute('has-cascading', '');
    } else {
      this.removeAttribute('has-cascading');
    }
  }

  private handleDropdownPanelClick = (e: Event): void => {
    e.stopPropagation();
  };

  private handleItemClick = (item: DropdownItem, e?: MouseEvent): void => {
    if (item.disabled) return;

    if ((item.options && item.options.length > 0) || item.customContent) {
      this.toggleSubmenu(item.id);
      return;
    }

    this.dropdownController.handleItemClick(item, e);
  };

  private handleItemHover = (item: DropdownItem): void => {
    if (!item.options?.length && !item.customContent) return;

    this.clearSubmenuTimer(item.id);

    if (this.cascadeOnHover) {
      const timer = window.setTimeout(() => {
        this.showSubmenu(item.id);
      }, this.cascadeDelay);
      this.submenuTimers.set(item.id, timer);
    }
  };

  private handleItemLeave = (item: DropdownItem): void => {
    if (!item.options?.length && !item.customContent) return;

    this.clearSubmenuTimer(item.id);

    const timer = window.setTimeout(() => {
      this.hideSubmenu(item.id);
    }, 100);
    this.submenuTimers.set(`hide-${item.id}`, timer);
  };

  private handleSubmenuEnter = (itemId: string): void => {
    this.clearSubmenuTimer(`hide-${itemId}`);
  };

  private handleSubmenuLeave = (itemId: string): void => {
    const timer = window.setTimeout(() => {
      this.hideSubmenu(itemId);
    }, 100);
    this.submenuTimers.set(`hide-${itemId}`, timer);
  };

  private clearSubmenuTimer(key: string): void {
    const timer = this.submenuTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.submenuTimers.delete(key);
    }
  }

  private toggleSubmenu(itemId: string): void {
    if (this.openSubmenus.has(itemId)) {
      this.hideSubmenu(itemId);
    } else {
      this.showSubmenu(itemId);
    }
  }

  private showSubmenu(itemId: string): void {
    this.openSubmenus.add(itemId);
    this.requestUpdate();
  }

  private hideSubmenu(itemId: string): void {
    this.openSubmenus.delete(itemId);
    this.requestUpdate();
  }

  show(): void {
    this.dropdownController.open();
  }

  hide(): void {
    this.dropdownController.close();
  }

  toggle(): void {
    this.dropdownController.toggle();
  }

  private renderItems(): unknown {
    if (!this.items.length) return nothing;

    return html`
      <div class="dropdown__items">
        ${this.items.map(item => {
          if (item.divider) {
            return html`<div class="dropdown__divider"></div>`;
          }

          const hasSubmenu = !!(item.options && item.options.length > 0) || !!item.customContent;
          const isSubmenuOpen = hasSubmenu && this.openSubmenus.has(item.id);

          return html`
            <div class="dropdown__item-container ${classMap({
              'dropdown__item-container--has-submenu': hasSubmenu
            })}">
              <button
                class="dropdown__item ${classMap({
                  'dropdown__item--disabled': !!item.disabled,
                  'dropdown__item--has-submenu': hasSubmenu
                })}"
                ?disabled="${item.disabled}"
                @click="${(e: MouseEvent) => this.handleItemClick(item, e)}"
                @mouseenter="${() => hasSubmenu && this.handleItemHover(item)}"
                @mouseleave="${() => hasSubmenu && this.handleItemLeave(item)}"
              >
                ${item.icon ? html`<nr-icon name="${item.icon}" class="dropdown__item-icon"></nr-icon>` : nothing}
                <span class="dropdown__item-label">${item.label}</span>
                ${hasSubmenu ? html`<nr-icon name="chevron-right" class="dropdown__submenu-arrow"></nr-icon>` : nothing}
              </button>
              
              ${hasSubmenu && isSubmenuOpen ? html`
                <div class="dropdown__submenu ${classMap({
                  'dropdown__submenu--right': this.cascadeDirection === 'right' || this.cascadeDirection === 'auto',
                  'dropdown__submenu--left': this.cascadeDirection === 'left'
                })}"
                @mouseenter="${() => this.handleSubmenuEnter(item.id)}"
                @mouseleave="${() => this.handleSubmenuLeave(item.id)}">
                  ${item.customContent ? html`
                    <div class="dropdown__custom-content">
                      ${typeof item.customContent === 'string' 
                        ? html`<div .innerHTML="${item.customContent}"></div>`
                        : item.customContent
                      }
                    </div>
                  ` : html`
                    <div class="dropdown__items">
                      ${item.options!.map(subItem => {
                        if (subItem.divider) {
                          return html`<div class="dropdown__divider"></div>`;
                        }
                        
                        return html`
                          <button
                            class="dropdown__item ${classMap({
                              'dropdown__item--disabled': !!subItem.disabled
                            })}"
                            ?disabled="${subItem.disabled}"
                            @click="${(e: MouseEvent) => this.handleItemClick(subItem, e)}"
                          >
                            ${subItem.icon ? html`<nr-icon name="${subItem.icon}" class="dropdown__item-icon"></nr-icon>` : nothing}
                            <span class="dropdown__item-label">${subItem.label}</span>
                          </button>
                        `;
                      })}
                    </div>
                  `}
                </div>
              ` : nothing}
            </div>
          `;
        })}
      </div>
    `;
  }

  override render() {
    const panelClasses = {
      'dropdown__panel': true,
      'dropdown__panel--open': this.open,
      [`dropdown__panel--${this.size}`]: true,
      [`dropdown__panel--${this.animation}`]: true,
      [`dropdown__panel--${this.placement}`]: true,
      'dropdown__panel--with-arrow': this.arrow
    };

    const panelStyles = {
      maxHeight: this.maxHeight,
      minWidth: this.minWidth
    };

    return html`
      <div class="dropdown">
        <div class="dropdown__trigger">
          <slot name="trigger"></slot>
        </div>
        
        <div 
          class="${classMap(panelClasses)}"
          style="${styleMap(panelStyles)}"
          @click="${this.handleDropdownPanelClick}"
        >
          ${this.arrow ? html`<div class="dropdown__arrow"></div>` : nothing}
          
          <slot name="header"></slot>
          
          <div class="dropdown__content">
            <slot name="content">${this.renderItems()}</slot>
          </div>
          
          <slot name="footer"></slot>
        </div>
      </div>
    `;
  }
}