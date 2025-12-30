/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styles } from './menu.style.js';
import { IMenu, IAction, MenuSize, IconPosition } from './menu.types.js';
import { NuralyUIBaseMixin } from '@nuralyui/common/mixins';
import { StateController, KeyboardController, AccessibilityController } from './controllers/index.js';

/**
 * Versatile menu component for hierarchical navigation with support for nested submenus.
 * 
 * @example
 * ```html
 * <nr-menu .items=${menuItems}></nr-menu>
 * <nr-menu .items=${menuItems} arrowPosition="left"></nr-menu>
 * ```
 * 
 * @fires change - Menu item selected
 * @fires action-click - Menu action clicked
 * 
 * @slot - Menu items (auto-generated from items property)
 */
@customElement('nr-menu')
export class NrMenuElement extends NuralyUIBaseMixin(LitElement) {
  static override styles = styles;
  
  override requiredComponents = ['nr-icon', 'nr-dropdown'];

  /** Menu items configuration */
  @property({ type: Array })
  items: IMenu[] = [];

  /** Menu size variant (small, medium, large) */
  @property({ type: String })
  size: MenuSize | string = MenuSize.Medium;

  /** Default arrow icon position for submenus (left or right) */
  @property({ type: String })
  arrowPosition: IconPosition | string = IconPosition.Right;

  // Controllers
  private stateController: StateController;
  // Keyboard controller is connected via Lit's controller system and listens to events
  // @ts-ignore - Controller is used via Lit's reactive controller system
  private keyboardController: KeyboardController;
  private accessibilityController: AccessibilityController;

  private _linkIndex = 0;

  constructor() {
    super();
    this.stateController = new StateController(this);
    this.keyboardController = new KeyboardController(this, this.stateController);
    this.accessibilityController = new AccessibilityController(this, this.stateController);
  }

  override firstUpdated(): void {
    this._initializeSelectedState();
    this.accessibilityController.updateAriaAttributes();
  }

  override updated(changedProperties: Map<string, unknown>): void {
    // Re-initialize selection state when items change
    if (changedProperties.has('items')) {
      this._initializeSelectedState();
      // Also open submenus that have 'opened' set to true
      this._initializeOpenedState();
    }
    this.accessibilityController.updateAriaAttributes();
  }

  private _initializeOpenedState() {
    this._openSubMenusFromItems(this.items, []);
  }

  private _openSubMenusFromItems(items: IMenu[], parentPath: number[]): void {
    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      const currentPath = [...parentPath, index];

      if (item.children) {
        // If this item has 'opened' set to true, open it
        if (item.opened) {
          this.stateController.openSubMenu(currentPath);
        }
        // Recursively check children
        this._openSubMenusFromItems(item.children, currentPath);
      }
    }
  }

  private _initializeSelectedState() {
    this._linkIndex = 0;
    this._findSelectedPath(this.items);
  }

  private _findSelectedPath(items: IMenu[], path: number[] = []): boolean {
    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      const currentPath = [...path, index];
      
      if (item.children) {
        if (this._findSelectedPath(item.children, currentPath)) {
          return true;
        }
      } else {
        if (item.selected) {
          this.stateController.setSelectedPath(currentPath);
          return true;
        }
      }
    }
    return false;
  }

  private _handleLinkClick(path: number[], value: string, event?: Event) {
    if ((event?.target as HTMLElement)?.classList.contains('action-icon')) {
      return;
    }

    if (event?.type === 'click') {
      const mouseEvent = event as MouseEvent;
      if (mouseEvent.detail > 0) {
        return;
      }
    }

    this.stateController.setSelectedPath(path);
    
    this.dispatchEvent(
      new CustomEvent('change', {
        bubbles: true,
        composed: true,
        detail: { path, value },
      })
    );
    
    this.requestUpdate();
  }

  private _handleSubMenuClick(path: number[], value: string, event: Event) {
    const mouseEvent = event as MouseEvent;
    const target = event.target as HTMLElement;
    
    // Don't handle if clicking on toggle icon or its parent container
    if (target.id === 'toggle-icon' || target.closest('#toggle-icon')) {
      return;
    }
    
    // If it's a click event
    if (event.type === 'click') {
      // Check if it's keyboard activation (Enter/Space) - detail will be 0
      if (mouseEvent.detail === 0) {
        // Keyboard activation - toggle the submenu
        this.stateController.toggleSubMenu(path);
        this.requestUpdate();
        return;
      }
      // Real mouse click - already handled by mousedown, so return
      return;
    }

    // This is a mousedown event - highlight and toggle the submenu
    
    this.stateController.setSelectedPath([]);
    this.stateController.clearHighlights();
    this.stateController.setHighlighted(path, true);
    
    // Toggle the submenu when clicking on header
    this.stateController.toggleSubMenu(path);

    this.dispatchEvent(
      new CustomEvent('change', {
        bubbles: true,
        composed: true,
        detail: { path, value },
      })
    );
    
    this.requestUpdate();
  }

  private _toggleSubMenu(path: number[], event: Event) {
    event.stopPropagation();
    this.stateController.toggleSubMenu(path);
    this.requestUpdate();
  }

  private _handleSubMenuMouseEnter(path: number[]) {
    this.stateController.setHovered(path, true);
    this.requestUpdate();
  }

  private _handleSubMenuMouseLeave(path: number[]) {
    this.stateController.setHovered(path, false);
    this.requestUpdate();
  }

  private _handleActionClick(path: number[], event: CustomEvent) {
    const item = event.detail.item;
    this.dispatchEvent(
      new CustomEvent('action-click', {
        detail: { value: item.value, path, item },
        composed: true,
        bubbles: true,
      })
    );
  }

  private _isPathSelected(path: number[]): boolean {
    return this.stateController.isPathSelected(path);
  }

  private _convertActionsToDropdownItems(actions: IAction[]): any[] {
    return actions.map(action => ({
      id: action.value,
      label: action.label,
      value: action.value
    }));
  }

  private _renderMenuLink(menu: IMenu, path: number[]): any {
    const pathKey = path.join('-');
    const isSelected = this._isPathSelected(path);
    const linkIndex = this._linkIndex++;
    
    return html`
      <li 
        class="menu-link ${isSelected ? 'selected' : ''} ${menu.disabled ? 'disabled' : ''}"
        data-path=${pathKey}
        data-index=${linkIndex}
        tabindex="0"
        @mousedown=${!menu.disabled ? (e: Event) => this._handleLinkClick(path, menu.text, e) : nothing}
        @click=${!menu.disabled ? (e: Event) => this._handleLinkClick(path, menu.text, e) : nothing}>
        <div class="icon-container">
          ${menu.icon ? html`
            ${!menu.text 
              ? html`<div class="icon-only"><nr-icon name="${menu.icon}"></nr-icon></div>`
              : html`<nr-icon name="${menu.icon}" size="small"></nr-icon>`}
          ` : nothing}
        </div>
        ${menu.text ? html`
          <div class="action-text-container">
            <div class="text-container">
              <span>${menu.text}</span>
            </div>
            <div class="icon-container">
              ${menu.status?.icon ? html`
                <nr-icon name=${menu.status.icon} class="status-icon"  size="small"></nr-icon>
              ` : nothing}
              ${menu.menu?.actions ? html`
                <nr-dropdown 
                  .items=${this._convertActionsToDropdownItems(menu.menu.actions)} 
                  trigger="click" 
                  placement="bottom-end"
                  @nr-dropdown-item-click=${(e: CustomEvent) => this._handleActionClick(path, e)}>
                  <nr-icon name="${menu.menu.icon}" class="action-icon" slot="trigger"  size="small"></nr-icon>
                </nr-dropdown>
              ` : nothing}
            </div>
          </div>
        ` : nothing}
      </li>
    `;
  }

  private _renderSubMenu(menu: IMenu, path: number[]): any {
    const pathKey = path.join('-');
    const isOpen = this.stateController.isSubMenuOpen(path) || menu.opened;
    const isHovered = this.stateController.isSubMenuHovered(path);
    const isHighlighted = this.stateController.isSubMenuHighlighted(path);
    const isSelected = menu.selected;
    
    // Determine icon position - use individual menu item setting or fall back to global setting
    const iconPosition = menu.iconPosition || this.arrowPosition;
    const isLeftPosition = iconPosition === IconPosition.Left || iconPosition === 'left';
    
    return html`
      <ul 
        class="sub-menu ${isHighlighted ? 'highlighted' : ''} ${menu.disabled ? 'disabled' : ''} ${isSelected ? 'selected' : ''} ${isLeftPosition ? 'arrow-left' : 'arrow-right'}"
        data-path=${pathKey}
        tabindex="0"
        @mouseenter=${() => this._handleSubMenuMouseEnter(path)}
        @mouseleave=${() => this._handleSubMenuMouseLeave(path)}
        @click=${!menu.disabled ? (e: Event) => {
          // Handle keyboard activation on the ul element
          const target = e.target as HTMLElement;
          const mouseEvent = e as MouseEvent;
          // If click is on the ul itself (not children) and it's keyboard-generated
          if (target.classList.contains('sub-menu') && mouseEvent.detail === 0) {
            e.stopPropagation(); // Prevent bubbling to parent submenus
            this.stateController.toggleSubMenu(path);
            this.requestUpdate();
          }
        } : nothing}>
        <div 
          class="sub-menu-header"
          @mousedown=${!menu.disabled ? (e: Event) => this._handleSubMenuClick(path, menu.text, e) : nothing}
          @click=${!menu.disabled ? (e: Event) => this._handleSubMenuClick(path, menu.text, e) : nothing}>
          ${isLeftPosition && menu.children && menu.children.length ? html`
            <nr-icon 
              id="toggle-icon" 
              name="${isOpen ? 'ChevronDown' : 'ChevronRight'}" 
              @mousedown=${!menu.disabled ? (e: Event) => this._toggleSubMenu(path, e) : nothing}
              size="small">
            </nr-icon>
          ` : nothing}
          ${menu.icon ? html`<nr-icon class="text-icon" name="${menu.icon}" size="small"></nr-icon>` : nothing}
          <span>${menu.text}</span>
          <div class="icons-container">
            ${menu.status?.icon ? html`
              <nr-icon name=${menu.status.icon} class="status-icon" size="small"></nr-icon>
            ` : nothing}
            ${(isHighlighted || isHovered) && menu.menu?.actions ? html`
              <nr-dropdown 
                .items=${this._convertActionsToDropdownItems(menu.menu.actions)} 
                trigger="click" 
                placement="bottom-end"
                @nr-dropdown-item-click=${(e: CustomEvent) => this._handleActionClick(path, e)}>
                <nr-icon name="${menu.menu.icon}" class="action-icon" slot="trigger" size="small"></nr-icon>
              </nr-dropdown>
            ` : nothing}
            ${!isLeftPosition && menu.children && menu.children.length ? html`
              <nr-icon 
                id="toggle-icon" 
                name="${isOpen ? 'ChevronDown' : 'ChevronRight'}" 
                @mousedown=${!menu.disabled ? (e: Event) => this._toggleSubMenu(path, e) : nothing}
                size="small">
              </nr-icon>
            ` : nothing}
          </div>
        </div>
        <div class="sub-menu-children" style="display: ${isOpen ? 'block' : 'none'}">
          ${menu.children ? this._renderMenuItems(menu.children, path) : nothing}
        </div>
      </ul>
    `;
  }

  private _renderMenuItems(items: IMenu[], parentPath: number[] = []): any {
    return items.map((menu, index) => {
      const currentPath = [...parentPath, index];
      
      if (menu.children) {
        return this._renderSubMenu(menu, currentPath);
      } else {
        return this._renderMenuLink(menu, currentPath);
      }
    });
  }

  override render() {
    this._linkIndex = 0;
    return html`
      <ul class="menu-root menu--${this.size}">
        ${this._renderMenuItems(this.items)}
      </ul>
    `;
  }
}
