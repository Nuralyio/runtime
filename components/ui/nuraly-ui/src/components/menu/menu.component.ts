/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styles } from './menu.style.js';
import { IMenu, IAction, MenuSize } from './menu.types.js';
import { NuralyUIBaseMixin } from '../../shared/base-mixin.js';
import '../icon/icon.component.js';
import '../dropdown/dropdown.component.js';

/**
 * Versatile menu component for hierarchical navigation with support for nested submenus.
 * 
 * @example
 * ```html
 * <nr-menu .items=${menuItems}></nr-menu>
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

  @state()
  private _selectedPath: number[] = [];

  @state()
  private _openSubMenus: Set<string> = new Set();

  @state()
  private _hoveredSubMenus: Set<string> = new Set();

  @state()
  private _highlightedSubMenus: Set<string> = new Set();

  private _linkIndex = 0;

  override firstUpdated(): void {
    this._initializeSelectedState();
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
          this._selectedPath = currentPath;
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

    this._selectedPath = path;
    this._highlightedSubMenus.clear();
    
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
    const target = event?.target as HTMLElement;
    if (target?.classList.contains('action-icon') || target?.id === 'toggle-icon') {
      return;
    }

    const pathKey = path.join('-');
    if (!this._openSubMenus.has(pathKey)) {
      this._openSubMenus.add(pathKey);
    }
    
    this._selectedPath = [];
    this._highlightedSubMenus.clear();
    this._highlightedSubMenus.add(pathKey);

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
    const pathKey = path.join('-');
    
    if (this._openSubMenus.has(pathKey)) {
      this._openSubMenus.delete(pathKey);
    } else {
      this._openSubMenus.add(pathKey);
    }
    
    this.requestUpdate();
  }

  private _handleSubMenuMouseEnter(path: number[]) {
    const pathKey = path.join('-');
    this._hoveredSubMenus.add(pathKey);
    this.requestUpdate();
  }

  private _handleSubMenuMouseLeave(path: number[]) {
    const pathKey = path.join('-');
    this._hoveredSubMenus.delete(pathKey);
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
    return path.length === this._selectedPath.length &&
           path.every((val, idx) => val === this._selectedPath[idx]);
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
        @mousedown=${!menu.disabled ? (e: Event) => this._handleLinkClick(path, menu.text, e) : nothing}>
        <div class="icon-container">
          ${menu.icon ? html`
            ${!menu.text 
              ? html`<div class="icon-only"><nr-icon name="${menu.icon}"></nr-icon></div>`
              : html`<nr-icon name="${menu.icon}"></nr-icon>`}
          ` : nothing}
        </div>
        ${menu.text ? html`
          <div class="action-text-container">
            <div class="text-container">
              <span>${menu.text}</span>
            </div>
            <div class="icon-container">
              ${menu.status?.icon ? html`
                <nr-icon name=${menu.status.icon} class="status-icon"></nr-icon>
              ` : nothing}
              ${menu.menu?.actions ? html`
                <nr-dropdown 
                  .items=${this._convertActionsToDropdownItems(menu.menu.actions)} 
                  trigger="click" 
                  placement="bottom-end"
                  @nr-dropdown-item-click=${(e: CustomEvent) => this._handleActionClick(path, e)}>
                  <nr-icon name="${menu.menu.icon}" class="action-icon" slot="trigger"></nr-icon>
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
    const isOpen = this._openSubMenus.has(pathKey) || menu.opened;
    const isHovered = this._hoveredSubMenus.has(pathKey);
    const isHighlighted = this._highlightedSubMenus.has(pathKey);
    const isSelected = menu.selected;
    
    return html`
      <ul 
        class="sub-menu ${isHighlighted ? 'highlighted' : ''} ${menu.disabled ? 'disabled' : ''} ${isSelected ? 'selected' : ''}"
        data-path=${pathKey}
        tabindex="0"
        @mouseenter=${() => this._handleSubMenuMouseEnter(path)}
        @mouseleave=${() => this._handleSubMenuMouseLeave(path)}>
        <div 
          class="sub-menu-header"
          @mousedown=${!menu.disabled ? (e: Event) => this._handleSubMenuClick(path, menu.text, e) : nothing}>
          ${menu.icon ? html`<nr-icon class="text-icon" name="${menu.icon}"></nr-icon>` : nothing}
          <span>${menu.text}</span>
          <div class="icons-container">
            ${menu.status?.icon ? html`
              <nr-icon name=${menu.status.icon} class="status-icon"></nr-icon>
            ` : nothing}
            ${(isHighlighted || isHovered) && menu.menu?.actions ? html`
              <nr-dropdown 
                .items=${this._convertActionsToDropdownItems(menu.menu.actions)} 
                trigger="click" 
                placement="bottom-end"
                @nr-dropdown-item-click=${(e: CustomEvent) => this._handleActionClick(path, e)}>
                <nr-icon name="${menu.menu.icon}" class="action-icon" slot="trigger"></nr-icon>
              </nr-dropdown>
            ` : nothing}
            ${menu.children && menu.children.length ? html`
              <nr-icon 
                id="toggle-icon" 
                name="${isOpen ? 'angle-up' : 'angle-down'}" 
                @mousedown=${!menu.disabled ? (e: Event) => this._toggleSubMenu(path, e) : nothing}>
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
