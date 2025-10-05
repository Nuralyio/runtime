/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { BaseMenuController } from './base.controller.js';
import type { MenuKeyboardController } from '../interfaces/index.js';
import type { StateController } from './state.controller.js';

/**
 * Keyboard controller manages keyboard navigation for the menu component
 * Handles arrow keys, Enter/Space, Escape, Home/End, and type-ahead search
 */
export class KeyboardController extends BaseMenuController implements MenuKeyboardController {
  private stateController: StateController;
  private typeAheadBuffer = '';
  private typeAheadTimeout: number | null = null;
  private currentFocusIndex = -1;

  constructor(host: any, stateController: StateController) {
    super(host);
    this.stateController = stateController;
  }

  override hostConnected(): void {
    this.host.addEventListener('keydown', this.handleKeydown.bind(this));
  }

  override hostDisconnected(): void {
    this.host.removeEventListener('keydown', this.handleKeydown.bind(this));
    if (this.typeAheadTimeout) {
      clearTimeout(this.typeAheadTimeout);
    }
  }

  /**
   * Main keydown handler - routes to specific handlers
   * @param event - The keyboard event
   */
  handleKeydown(event: KeyboardEvent): void {
    try {
      const key = event.key;

      // Arrow navigation
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
        this.handleArrowNavigation(event);
        return;
      }

      // Activation keys
      if (key === 'Enter' || key === ' ') {
        this.handleActivation(event);
        return;
      }

      // Escape key
      if (key === 'Escape') {
        this.handleEscape(event);
        return;
      }

      // Home/End keys
      if (key === 'Home' || key === 'End') {
        this.handleHomeEnd(event);
        return;
      }

      // Type-ahead search
      if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        this.handleTypeAhead(event);
        return;
      }
    } catch (error) {
      this.handleError(error as Error, 'handleKeydown');
    }
  }

  /**
   * Handle arrow key navigation
   * @param event - The keyboard event
   */
  handleArrowNavigation(event: KeyboardEvent): void {
    try {
      event.preventDefault();
      
      const menuItems = this.getAllMenuLinks();
      const activeElement = this.host.shadowRoot?.activeElement as HTMLElement;
      const currentIndex = menuItems.indexOf(activeElement);

      switch (event.key) {
        case 'ArrowDown':
          this.navigateDown(menuItems, currentIndex);
          break;
        case 'ArrowUp':
          this.navigateUp(menuItems, currentIndex);
          break;
        case 'ArrowRight':
          this.expandOrNavigate(activeElement);
          break;
        case 'ArrowLeft':
          this.collapseOrNavigate(activeElement);
          break;
      }

      this.dispatchEvent('keyboard-navigation', {
        key: event.key,
        currentIndex,
        timestamp: Date.now(),
      });
    } catch (error) {
      this.handleError(error as Error, 'handleArrowNavigation');
    }
  }

  /**
   * Navigate down to the next interactive item
   * @param items - All menu items
   * @param currentIndex - Current focused item index
   */
  private navigateDown(items: HTMLElement[], currentIndex: number): void {
    let nextIndex = currentIndex + 1;
    
    while (nextIndex < items.length) {
      const nextItem = items[nextIndex];
      if (this.isElementInteractive(nextItem)) {
        nextItem.focus();
        this.currentFocusIndex = nextIndex;
        return;
      }
      nextIndex++;
    }

    // Wrap to first item
    if (currentIndex >= 0) {
      for (let i = 0; i < items.length; i++) {
        if (this.isElementInteractive(items[i])) {
          items[i].focus();
          this.currentFocusIndex = i;
          return;
        }
      }
    }
  }

  /**
   * Navigate up to the previous interactive item
   * @param items - All menu items
   * @param currentIndex - Current focused item index
   */
  private navigateUp(items: HTMLElement[], currentIndex: number): void {
    let prevIndex = currentIndex - 1;
    
    while (prevIndex >= 0) {
      const prevItem = items[prevIndex];
      if (this.isElementInteractive(prevItem)) {
        prevItem.focus();
        this.currentFocusIndex = prevIndex;
        return;
      }
      prevIndex--;
    }

    // Wrap to last item
    if (currentIndex >= 0) {
      for (let i = items.length - 1; i >= 0; i--) {
        if (this.isElementInteractive(items[i])) {
          items[i].focus();
          this.currentFocusIndex = i;
          return;
        }
      }
    }
  }

  /**
   * Expand submenu or navigate into it (ArrowRight)
   * @param element - The current element
   */
  private expandOrNavigate(element: HTMLElement | null): void {
    if (!element) return;

    if (element.classList.contains('sub-menu')) {
      const pathKey = element.getAttribute('data-path');
      if (pathKey) {
        const path = pathKey.split('-').map(Number);
        this.stateController.openSubMenu(path);
      }
    }
  }

  /**
   * Collapse submenu or navigate out of it (ArrowLeft)
   * @param element - The current element
   */
  private collapseOrNavigate(element: HTMLElement | null): void {
    if (!element) return;

    if (element.classList.contains('sub-menu')) {
      const pathKey = element.getAttribute('data-path');
      if (pathKey) {
        const path = pathKey.split('-').map(Number);
        this.stateController.closeSubMenu(path);
      }
    }
  }

  /**
   * Handle Enter or Space key activation
   * @param event - The keyboard event
   */
  handleActivation(event: KeyboardEvent): void {
    try {
      event.preventDefault();
      
      const activeElement = this.host.shadowRoot?.activeElement as HTMLElement;
      if (!activeElement || !this.isElementInteractive(activeElement)) {
        return;
      }

      // Simulate click on the active element
      activeElement.click();

      this.dispatchEvent('keyboard-activation', {
        key: event.key,
        element: activeElement,
        timestamp: Date.now(),
      });
    } catch (error) {
      this.handleError(error as Error, 'handleActivation');
    }
  }

  /**
   * Handle Escape key - close all submenus
   * @param event - The keyboard event
   */
  handleEscape(event: KeyboardEvent): void {
    try {
      event.preventDefault();
      
      this.stateController.closeAllSubMenus();

      this.dispatchEvent('keyboard-escape', {
        timestamp: Date.now(),
      });
    } catch (error) {
      this.handleError(error as Error, 'handleEscape');
    }
  }

  /**
   * Handle Home/End keys - jump to first/last item
   * @param event - The keyboard event
   */
  private handleHomeEnd(event: KeyboardEvent): void {
    try {
      event.preventDefault();
      
      const menuItems = this.getAllMenuLinks();
      const targetItems = menuItems.filter(item => this.isElementInteractive(item));

      if (targetItems.length === 0) return;

      if (event.key === 'Home') {
        targetItems[0].focus();
        this.currentFocusIndex = menuItems.indexOf(targetItems[0]);
      } else {
        const lastItem = targetItems[targetItems.length - 1];
        lastItem.focus();
        this.currentFocusIndex = menuItems.indexOf(lastItem);
      }

      this.dispatchEvent('keyboard-home-end', {
        key: event.key,
        timestamp: Date.now(),
      });
    } catch (error) {
      this.handleError(error as Error, 'handleHomeEnd');
    }
  }

  /**
   * Handle type-ahead search - type letters to jump to items
   * @param event - The keyboard event
   */
  handleTypeAhead(event: KeyboardEvent): void {
    try {
      event.preventDefault();
      
      // Clear previous timeout
      if (this.typeAheadTimeout) {
        clearTimeout(this.typeAheadTimeout);
      }

      // Add character to buffer
      this.typeAheadBuffer += event.key.toLowerCase();

      // Set timeout to clear buffer
      this.typeAheadTimeout = window.setTimeout(() => {
        this.typeAheadBuffer = '';
        this.typeAheadTimeout = null;
      }, 500);

      // Find matching item
      const menuItems = this.getAllMenuLinks();
      const currentIndex = this.currentFocusIndex >= 0 ? this.currentFocusIndex : -1;

      // Search from current position forward
      for (let i = currentIndex + 1; i < menuItems.length; i++) {
        if (this.matchesTypeAhead(menuItems[i])) {
          menuItems[i].focus();
          this.currentFocusIndex = i;
          return;
        }
      }

      // Wrap around and search from beginning
      for (let i = 0; i <= currentIndex; i++) {
        if (this.matchesTypeAhead(menuItems[i])) {
          menuItems[i].focus();
          this.currentFocusIndex = i;
          return;
        }
      }

      this.dispatchEvent('keyboard-typeahead', {
        buffer: this.typeAheadBuffer,
        timestamp: Date.now(),
      });
    } catch (error) {
      this.handleError(error as Error, 'handleTypeAhead');
    }
  }

  /**
   * Check if an element's text matches the type-ahead buffer
   * @param element - The element to check
   * @returns True if the element matches
   */
  private matchesTypeAhead(element: HTMLElement): boolean {
    if (!this.isElementInteractive(element)) {
      return false;
    }

    const text = element.textContent?.trim().toLowerCase() || '';
    return text.startsWith(this.typeAheadBuffer);
  }

  /**
   * Reset the type-ahead buffer
   */
  resetTypeAhead(): void {
    this.typeAheadBuffer = '';
    if (this.typeAheadTimeout) {
      clearTimeout(this.typeAheadTimeout);
      this.typeAheadTimeout = null;
    }
  }
}
