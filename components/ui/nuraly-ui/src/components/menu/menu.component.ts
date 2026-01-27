/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
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
 * @fires label-edit - Menu item label edited (detail: { path, oldValue, newValue })
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

  /** Callback for label edit events (alternative to event listener) */
  @property({ type: Object, attribute: false })
  onLabelEdit?: (detail: { path: number[]; oldValue: string; newValue: string }) => void;

  /** Track context menu state */
  @state()
  private _contextMenuState: { path: number[]; x: number; y: number; actions: IAction[] } | null = null;

  /** Track which menu item is currently being edited (path as string for comparison) */
  @state()
  private _editingPath: string | null = null;

  /** Temporary value while editing */
  @state()
  private _editingValue: string = '';

  /** Pending click timeout for double-click detection */
  private _pendingClickTimeout: ReturnType<typeof setTimeout> | null = null;

  /** Path of pending click */
  private _pendingClickPath: string | null = null;

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

  private _handleLinkClick(path: number[], value: string, editable: boolean, event?: Event) {
    if ((event?.target as HTMLElement)?.classList.contains('action-icon')) {
      return;
    }

    if (event?.type === 'click') {
      const mouseEvent = event as MouseEvent;
      if (mouseEvent.detail > 0) {
        return;
      }
    }

    const pathKey = path.join('-');

    // If editable, delay the click to allow double-click detection
    if (editable && event?.type === 'mousedown') {
      // Clear any existing pending click
      if (this._pendingClickTimeout) {
        clearTimeout(this._pendingClickTimeout);
      }

      this._pendingClickPath = pathKey;
      this._pendingClickTimeout = setTimeout(() => {
        if (this._pendingClickPath === pathKey) {
          this._executeClick(path, value);
          this._pendingClickPath = null;
        }
      }, 200); // 200ms delay for double-click detection
      return;
    }

    this._executeClick(path, value);
  }

  private _executeClick(path: number[], value: string) {
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

  private _handleSubMenuClick(path: number[], value: string, editable: boolean, event: Event) {
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

    const pathKey = path.join('-');

    // If editable, delay the click to allow double-click detection
    if (editable) {
      // Clear any existing pending click
      if (this._pendingClickTimeout) {
        clearTimeout(this._pendingClickTimeout);
      }

      this._pendingClickPath = pathKey;
      this._pendingClickTimeout = setTimeout(() => {
        if (this._pendingClickPath === pathKey) {
          this._executeSubMenuClick(path, value);
          this._pendingClickPath = null;
        }
      }, 200);
      return;
    }

    this._executeSubMenuClick(path, value);
  }

  private _executeSubMenuClick(path: number[], value: string) {
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
    const originalEvent = event.detail.originalEvent;
    const dropdown = event.detail.dropdown;

    // Create a close callback for async actions
    const close = () => {
      if (dropdown) {
        if (typeof dropdown.hide === 'function') {
          dropdown.hide();
        } else if (typeof dropdown.close === 'function') {
          dropdown.close();
        }
      }
    };

    this.dispatchEvent(
      new CustomEvent('action-click', {
        detail: { value: item.value, path, item, originalEvent, close },
        composed: true,
        bubbles: true,
      })
    );
  }

  private _handleContextMenu(path: number[], menu: IMenu, event: MouseEvent) {
    if (!menu.menu?.actions?.length) return;

    event.preventDefault();
    event.stopPropagation();

    this._contextMenuState = {
      path,
      x: event.clientX,
      y: event.clientY,
      actions: menu.menu.actions
    };

    this.requestUpdate();

    // Wait for render then show the dropdown
    this.updateComplete.then(() => {
      const dropdown = this.shadowRoot?.querySelector('#context-menu-dropdown') as any;
      if (dropdown && typeof dropdown.show === 'function') {
        dropdown.show();
      }
    });
  }

  private _handleContextMenuAction(path: number[], event: CustomEvent) {
    const item = event.detail.item;
    const originalEvent = event.detail.originalEvent;
    const dropdown = event.detail.dropdown;

    // Create a close callback
    const close = () => {
      this._contextMenuState = null;
      if (dropdown) {
        if (typeof dropdown.hide === 'function') {
          dropdown.hide();
        } else if (typeof dropdown.close === 'function') {
          dropdown.close();
        }
      }
      this.requestUpdate();
    };

    this.dispatchEvent(
      new CustomEvent('action-click', {
        detail: { value: item.value, path, item, originalEvent, close },
        composed: true,
        bubbles: true,
      })
    );

    close();
  }

  private _handleContextMenuClose() {
    this._contextMenuState = null;
    this.requestUpdate();
  }

  private _handleDoubleClick(path: number[], menu: IMenu, event: Event) {
    if (menu.disabled) return;

    event.preventDefault();
    event.stopPropagation();

    // Cancel any pending single click
    if (this._pendingClickTimeout) {
      clearTimeout(this._pendingClickTimeout);
      this._pendingClickTimeout = null;
      this._pendingClickPath = null;
    }

    const pathKey = path.join('-');
    this._editingPath = pathKey;
    this._editingValue = menu.text;
    this.requestUpdate();

    // Focus the input after render
    this.updateComplete.then(() => {
      const input = this.shadowRoot?.querySelector(`input[data-edit-path="${pathKey}"]`) as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
    });
  }

  private _handleEditInput(event: Event) {
    event.stopPropagation();
    const input = event.target as HTMLInputElement;
    this._editingValue = input.value;
  }

  private _handleEditKeyDown(path: number[], originalText: string, event: KeyboardEvent) {
    event.stopPropagation(); // Prevent keyboard navigation from capturing keys
    console.log('Edit keydown:', event.key, 'editingValue:', this._editingValue);
    if (event.key === 'Enter') {
      event.preventDefault();
      // Get the current value directly from the input
      const input = event.target as HTMLInputElement;
      this._editingValue = input.value;
      console.log('Saving with value:', this._editingValue);
      this._saveEdit(path, originalText);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this._cancelEdit();
    }
  }

  private _handleEditBlur(path: number[], originalText: string, event: FocusEvent) {
    // Check if focus is moving to another element within this component
    const relatedTarget = event.relatedTarget as HTMLElement;
    if (relatedTarget && this.shadowRoot?.contains(relatedTarget)) {
      return; // Don't save if focus is moving within the component
    }

    // Delay to allow click events to process first
    setTimeout(() => {
      if (this._editingPath === path.join('-')) {
        this._saveEdit(path, originalText);
      }
    }, 200);
  }

  private _saveEdit(path: number[], originalText: string) {
    const newValue = this._editingValue.trim();
    console.log('_saveEdit called:', { newValue, originalText, willEmit: newValue && newValue !== originalText });

    if (newValue && newValue !== originalText) {
      const detail = {
        path,
        oldValue: originalText,
        newValue,
      };

      // Call callback if provided
      if (this.onLabelEdit) {
        console.log('Calling onLabelEdit callback');
        this.onLabelEdit(detail);
      }

      // Also dispatch event
      console.log('Dispatching label-edit event from:', this.tagName);
      const event = new CustomEvent('label-edit', {
        bubbles: true,
        composed: true,
        detail,
      });
      this.dispatchEvent(event);
    }

    this._editingPath = null;
    this._editingValue = '';
    this.requestUpdate();
  }

  private _cancelEdit() {
    this._editingPath = null;
    this._editingValue = '';
    this.requestUpdate();
  }

  private _isEditing(path: number[]): boolean {
    return this._editingPath === path.join('-');
  }

  private _isPathSelected(path: number[]): boolean {
    return this.stateController.isPathSelected(path);
  }

  private _convertActionsToDropdownItems(actions: IAction[]): any[] {
    return actions.map(action => ({
      id: action.value,
      label: action.label,
      value: action.value,
      icon: action.icon,
      additionalData: (action as any).additionalData
    }));
  }

  private _renderMenuLink(menu: IMenu, path: number[]): any {
    const pathKey = path.join('-');
    const isSelected = this._isPathSelected(path);
    const isEditing = this._isEditing(path);
    const linkIndex = this._linkIndex++;

    return html`
      <li
        class="menu-link ${isSelected ? 'selected' : ''} ${menu.disabled ? 'disabled' : ''} ${isEditing ? 'editing' : ''}"
        data-path=${pathKey}
        data-index=${linkIndex}
        tabindex=${isEditing ? -1 : 0}
        @mousedown=${!menu.disabled && !isEditing ? (e: Event) => this._handleLinkClick(path, menu.text, !!menu.editable, e) : nothing}
        @click=${!menu.disabled && !isEditing ? (e: Event) => this._handleLinkClick(path, menu.text, !!menu.editable, e) : nothing}
        @dblclick=${!menu.disabled ? (e: Event) => this._handleDoubleClick(path, menu, e) : nothing}
        @contextmenu=${!menu.disabled && menu.menu?.actions ? (e: MouseEvent) => this._handleContextMenu(path, menu, e) : nothing}>
        <div class="icon-container">
          ${menu.icon ? html`
            ${!menu.text
              ? html`<div class="icon-only"><nr-icon name="${menu.icon}"></nr-icon></div>`
              : html`<nr-icon name="${menu.icon}" size="small"></nr-icon>`}
          ` : nothing}
        </div>
        ${menu.text ? html`
          <div class="action-text-container">
            <div class="text-container" @dblclick=${!menu.disabled ? (e: Event) => this._handleDoubleClick(path, menu, e) : nothing}>
              ${isEditing ? html`
                <input
                  type="text"
                  class="edit-input"
                  data-edit-path=${pathKey}
                  .value=${this._editingValue}
                  @input=${this._handleEditInput}
                  @keydown=${(e: KeyboardEvent) => this._handleEditKeyDown(path, menu.text, e)}
                  @blur=${(e: FocusEvent) => this._handleEditBlur(path, menu.text, e)}
                />
              ` : html`<span>${menu.text}</span>`}
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
    const isEditing = this._isEditing(path);

    // Determine icon position - use individual menu item setting or fall back to global setting
    const iconPosition = menu.iconPosition || this.arrowPosition;
    const isLeftPosition = iconPosition === IconPosition.Left || iconPosition === 'left';

    return html`
      <ul
        class="sub-menu ${isHighlighted ? 'highlighted' : ''} ${menu.disabled ? 'disabled' : ''} ${isSelected ? 'selected' : ''} ${isLeftPosition ? 'arrow-left' : 'arrow-right'} ${isEditing ? 'editing' : ''}"
        data-path=${pathKey}
        tabindex=${isEditing ? -1 : 0}
        @mouseenter=${() => this._handleSubMenuMouseEnter(path)}
        @mouseleave=${() => this._handleSubMenuMouseLeave(path)}
        @click=${!menu.disabled && !isEditing ? (e: Event) => {
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
          @mousedown=${!menu.disabled && !isEditing ? (e: Event) => this._handleSubMenuClick(path, menu.text, !!menu.editable, e) : nothing}
          @click=${!menu.disabled && !isEditing ? (e: Event) => this._handleSubMenuClick(path, menu.text, !!menu.editable, e) : nothing}
          @dblclick=${!menu.disabled && menu.editable ? (e: Event) => this._handleDoubleClick(path, menu, e) : nothing}
          @contextmenu=${!menu.disabled && menu.menu?.actions ? (e: MouseEvent) => this._handleContextMenu(path, menu, e) : nothing}>
          ${isLeftPosition && menu.children && menu.children.length ? html`
            <nr-icon
              id="toggle-icon"
              name="${isOpen ? 'ChevronDown' : 'ChevronRight'}"
              @mousedown=${!menu.disabled ? (e: Event) => this._toggleSubMenu(path, e) : nothing}
              size="small">
            </nr-icon>
          ` : nothing}
          ${menu.icon ? html`<nr-icon class="text-icon" name="${menu.icon}" size="small"></nr-icon>` : nothing}
          ${isEditing ? html`
            <input
              type="text"
              class="edit-input"
              data-edit-path=${pathKey}
              .value=${this._editingValue}
              @input=${this._handleEditInput}
              @keydown=${(e: KeyboardEvent) => this._handleEditKeyDown(path, menu.text, e)}
              @blur=${(e: FocusEvent) => this._handleEditBlur(path, menu.text, e)}
            />
          ` : html`<span class="menu-text" @dblclick=${!menu.disabled ? (e: Event) => this._handleDoubleClick(path, menu, e) : nothing}>${menu.text}</span>`}
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

  private _renderContextMenu() {
    if (!this._contextMenuState) return nothing;

    const { x, y, actions, path } = this._contextMenuState;

    return html`
      <nr-dropdown
        id="context-menu-dropdown"
        .items=${this._convertActionsToDropdownItems(actions)}
        trigger="manual"
        placement="bottom-start"
        style="position: fixed; top: ${y}px; left: ${x}px; z-index: 9999;"
        @nr-dropdown-item-click=${(e: CustomEvent) => this._handleContextMenuAction(path, e)}
        @nr-dropdown-close=${() => this._handleContextMenuClose()}
      >
        <span slot="trigger" style="display: block; width: 1px; height: 1px;"></span>
      </nr-dropdown>
    `;
  }

  override render() {
    this._linkIndex = 0;
    return html`
      <ul class="menu-root menu--${this.size}">
        ${this._renderMenuItems(this.items)}
      </ul>
      ${this._renderContextMenu()}
    `;
  }
}
