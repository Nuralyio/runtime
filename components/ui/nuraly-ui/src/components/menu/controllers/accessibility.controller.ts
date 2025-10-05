/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { BaseMenuController } from './base.controller.js';
import type { MenuAccessibilityController } from '../interfaces/index.js';
import type { StateController } from './state.controller.js';

/**
 * Accessibility controller manages ARIA attributes and screen reader support
 * Ensures the menu component is fully accessible
 */
export class AccessibilityController extends BaseMenuController implements MenuAccessibilityController {
  private stateController: StateController;
  private announcementElement: HTMLElement | null = null;

  constructor(host: any, stateController: StateController) {
    super(host);
    this.stateController = stateController;
  }

  override hostConnected(): void {
    this.createAnnouncementElement();
    this.updateAriaAttributes();
  }

  override hostDisconnected(): void {
    this.removeAnnouncementElement();
  }

  /**
   * Create a screen reader announcement element
   */
  private createAnnouncementElement(): void {
    if (!this.announcementElement) {
      this.announcementElement = document.createElement('div');
      this.announcementElement.setAttribute('role', 'status');
      this.announcementElement.setAttribute('aria-live', 'polite');
      this.announcementElement.setAttribute('aria-atomic', 'true');
      this.announcementElement.style.position = 'absolute';
      this.announcementElement.style.left = '-10000px';
      this.announcementElement.style.width = '1px';
      this.announcementElement.style.height = '1px';
      this.announcementElement.style.overflow = 'hidden';
      
      document.body.appendChild(this.announcementElement);
    }
  }

  /**
   * Remove the screen reader announcement element
   */
  private removeAnnouncementElement(): void {
    if (this.announcementElement && this.announcementElement.parentNode) {
      this.announcementElement.parentNode.removeChild(this.announcementElement);
      this.announcementElement = null;
    }
  }

  /**
   * Update all ARIA attributes throughout the menu
   */
  updateAriaAttributes(): void {
    try {
      this.updateMenuRoot();
      this.updateAllMenuItems();
      this.updateAllSubMenus();
    } catch (error) {
      this.handleError(error as Error, 'updateAriaAttributes');
    }
  }

  /**
   * Update ARIA attributes on the menu root
   */
  private updateMenuRoot(): void {
    const menuRoot = this.host.shadowRoot?.querySelector('.menu-root');
    if (menuRoot) {
      menuRoot.setAttribute('role', 'menu');
      menuRoot.setAttribute('aria-label', 'Main menu');
    }
  }

  /**
   * Update ARIA attributes on all menu items
   */
  private updateAllMenuItems(): void {
    const menuLinks = this.host.shadowRoot?.querySelectorAll('.menu-link');
    menuLinks?.forEach((link) => {
      link.setAttribute('role', 'menuitem');
      link.setAttribute('tabindex', '0');
      
      const pathKey = link.getAttribute('data-path');
      if (pathKey) {
        const path = pathKey.split('-').map(Number);
        const isSelected = this.stateController.isPathSelected(path);
        this.setAriaSelected(link as HTMLElement, isSelected);
      }

      const isDisabled = link.classList.contains('disabled');
      if (isDisabled) {
        link.setAttribute('aria-disabled', 'true');
      }
    });
  }

  /**
   * Update ARIA attributes on all submenus
   */
  private updateAllSubMenus(): void {
    const subMenus = this.host.shadowRoot?.querySelectorAll('.sub-menu');
    subMenus?.forEach((subMenu) => {
      subMenu.setAttribute('role', 'menuitem');
      subMenu.setAttribute('tabindex', '0');
      
      const pathKey = subMenu.getAttribute('data-path');
      if (pathKey) {
        const path = pathKey.split('-').map(Number);
        const isOpen = this.stateController.isSubMenuOpen(path);
        
        const header = subMenu.querySelector('.sub-menu-header');
        if (header) {
          header.setAttribute('aria-haspopup', 'true');
          this.setAriaExpanded(header as HTMLElement, isOpen);
        }
      }

      const isDisabled = subMenu.classList.contains('disabled');
      if (isDisabled) {
        subMenu.setAttribute('aria-disabled', 'true');
      }
    });
  }

  /**
   * Set aria-expanded attribute on an element
   * @param element - The element to update
   * @param expanded - Whether the element is expanded
   */
  setAriaExpanded(element: HTMLElement, expanded: boolean): void {
    try {
      element.setAttribute('aria-expanded', expanded.toString());
    } catch (error) {
      this.handleError(error as Error, 'setAriaExpanded');
    }
  }

  /**
   * Set aria-selected attribute on an element
   * @param element - The element to update
   * @param selected - Whether the element is selected
   */
  setAriaSelected(element: HTMLElement, selected: boolean): void {
    try {
      if (selected) {
        element.setAttribute('aria-selected', 'true');
        element.setAttribute('aria-current', 'page');
      } else {
        element.removeAttribute('aria-selected');
        element.removeAttribute('aria-current');
      }
    } catch (error) {
      this.handleError(error as Error, 'setAriaSelected');
    }
  }

  /**
   * Manage focus on an element
   * @param element - The element to focus
   */
  manageFocus(element: HTMLElement): void {
    try {
      if (this.isElementInteractive(element)) {
        element.focus();
        
        // Ensure element is visible in viewport
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest',
        });
      }
    } catch (error) {
      this.handleError(error as Error, 'manageFocus');
    }
  }

  /**
   * Announce a message to screen readers
   * @param message - The message to announce
   */
  announceToScreenReader(message: string): void {
    try {
      if (this.announcementElement) {
        // Clear and set message to ensure it's announced
        this.announcementElement.textContent = '';
        
        setTimeout(() => {
          if (this.announcementElement) {
            this.announcementElement.textContent = message;
          }
        }, 100);
      }
    } catch (error) {
      this.handleError(error as Error, 'announceToScreenReader');
    }
  }

  /**
   * Announce menu item selection
   * @param itemText - The text of the selected item
   * @param path - The path to the item
   */
  announceSelection(itemText: string, path: number[]): void {
    const depth = path.length;
    const message = `Selected ${itemText}, level ${depth}`;
    this.announceToScreenReader(message);
  }

  /**
   * Announce submenu state change
   * @param itemText - The text of the submenu
   * @param isOpen - Whether the submenu is now open
   */
  announceSubMenuToggle(itemText: string, isOpen: boolean): void {
    const state = isOpen ? 'expanded' : 'collapsed';
    const message = `${itemText} submenu ${state}`;
    this.announceToScreenReader(message);
  }

  /**
   * Set focus to the first interactive menu item
   */
  focusFirstItem(): void {
    const menuItems = this.getAllMenuLinks();
    const firstInteractiveItem = menuItems.find(item => this.isElementInteractive(item));
    
    if (firstInteractiveItem) {
      this.manageFocus(firstInteractiveItem);
    }
  }

  /**
   * Set focus to the last interactive menu item
   */
  focusLastItem(): void {
    const menuItems = this.getAllMenuLinks();
    const interactiveItems = menuItems.filter(item => this.isElementInteractive(item));
    const lastItem = interactiveItems[interactiveItems.length - 1];
    
    if (lastItem) {
      this.manageFocus(lastItem);
    }
  }
}
