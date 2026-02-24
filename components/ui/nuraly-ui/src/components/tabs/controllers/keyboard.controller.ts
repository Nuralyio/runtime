/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { TabsHost, BaseTabsController } from './base.controller.js';
import { ReactiveControllerHost } from 'lit';

/**
 * Keyboard controller interface for tabs components
 */
export interface KeyboardController {
  handleKeyDown(event: KeyboardEvent): void;
  handleTabKeyDown(event: KeyboardEvent, tabIndex: number): void;
  isActivationKey(event: KeyboardEvent): boolean;
  isArrowKey(event: KeyboardEvent): boolean;
}

/**
 * Enhanced tabs host interface for keyboard functionality
 */
export interface TabsKeyboardHost extends TabsHost {
  orientation: string;
  setActiveTab(index: number, event?: Event): void;
}

/**
 * Keyboard controller manages keyboard navigation for tabs components
 * Handles Tab/Shift+Tab, Arrow keys, Enter/Space activation following ARIA best practices
 */
export class TabsKeyboardController extends BaseTabsController implements KeyboardController {
  protected override _host: TabsKeyboardHost & ReactiveControllerHost;
  private keyboardHandler: (event: Event) => void;

  constructor(host: TabsKeyboardHost & ReactiveControllerHost) {
    super(host);
    this._host = host;
    this.keyboardHandler = (event: Event) => this.handleKeyDown(event as KeyboardEvent);
  }

  override get host(): TabsKeyboardHost & ReactiveControllerHost {
    return this._host;
  }

  override hostConnected(): void {
    super.hostConnected();
    
    // Add global keyboard listeners
    this._host.addEventListener('keydown', this.keyboardHandler);
  }

  override hostDisconnected(): void {
    super.hostDisconnected();
    
    // Remove global keyboard listeners
    this._host.removeEventListener('keydown', this.keyboardHandler);
  }

  /**
   * Handle keyboard events for tabs navigation
   * @param event - The keyboard event
   */
  handleKeyDown(event: KeyboardEvent): void {
    try {
      if (this.host.disabled) return;

      const target = event.target as HTMLElement;
      const tabElement = target.closest('.tab-label');
      
      if (!tabElement) return;
      
      const tabIndex = parseInt(tabElement.getAttribute('data-index') || '0');
      
      if (!this.isValidTabIndex(tabIndex)) return;
      
      this.handleTabKeyDown(event, tabIndex);
    } catch (error) {
      this.handleError(error as Error, 'handleKeyDown');
    }
  }

  /**
   * Handle keyboard events for specific tab
   * @param event - The keyboard event
   * @param tabIndex - The tab index
   */
  handleTabKeyDown(event: KeyboardEvent, tabIndex: number): void {
    try {
      const isHorizontal = this.host.orientation !== 'vertical';
      
      switch (event.key) {
        case 'Enter':
        case ' ':
          event.preventDefault();
          this.activateTab(tabIndex, event);
          break;
          
        case 'ArrowLeft':
          if (isHorizontal) {
            event.preventDefault();
            this.navigateToPreviousTab(tabIndex);
          }
          break;
          
        case 'ArrowRight':
          if (isHorizontal) {
            event.preventDefault();
            this.navigateToNextTab(tabIndex);
          }
          break;
          
        case 'ArrowUp':
          if (!isHorizontal) {
            event.preventDefault();
            this.navigateToPreviousTab(tabIndex);
          }
          break;
          
        case 'ArrowDown':
          if (!isHorizontal) {
            event.preventDefault();
            this.navigateToNextTab(tabIndex);
          }
          break;
          
        case 'Home':
          event.preventDefault();
          this.navigateToFirstTab();
          break;
          
        case 'End':
          event.preventDefault();
          this.navigateToLastTab();
          break;
      }
    } catch (error) {
      this.handleError(error as Error, 'handleTabKeyDown');
    }
  }

  /**
   * Check if key is activation key (Enter or Space)
   * @param event - The keyboard event
   */
  isActivationKey(event: KeyboardEvent): boolean {
    return event.key === 'Enter' || event.key === ' ';
  }

  /**
   * Check if key is arrow key
   * @param event - The keyboard event
   */
  isArrowKey(event: KeyboardEvent): boolean {
    return ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key);
  }

  /**
   * Activate tab and dispatch events
   */
  private activateTab(tabIndex: number, event: KeyboardEvent): void {
    try {
      this.host.setActiveTab(tabIndex, event);
      
      // Dispatch keyboard activation event
      this.dispatchEvent(
        new CustomEvent('tabs-keyboard-activation', {
          detail: {
            tabIndex,
            tab: this.host.tabs[tabIndex],
            key: event.key,
            timestamp: Date.now()
          },
          bubbles: true,
          composed: true,
        })
      );
    } catch (error) {
      this.handleError(error as Error, 'activateTab');
    }
  }

  /**
   * Navigate to previous enabled tab
   */
  private navigateToPreviousTab(currentIndex: number): void {
    try {
      const enabledTabs = this.getEnabledTabIndices();
      const currentIndexInEnabled = enabledTabs.indexOf(currentIndex);
      
      if (currentIndexInEnabled > 0) {
        const previousIndex = enabledTabs[currentIndexInEnabled - 1];
        this.focusTab(previousIndex);
      } else if (enabledTabs.length > 0) {
        // Wrap to last enabled tab
        const lastIndex = enabledTabs[enabledTabs.length - 1];
        this.focusTab(lastIndex);
      }
    } catch (error) {
      this.handleError(error as Error, 'navigateToPreviousTab');
    }
  }

  /**
   * Navigate to next enabled tab
   */
  private navigateToNextTab(currentIndex: number): void {
    try {
      const enabledTabs = this.getEnabledTabIndices();
      const currentIndexInEnabled = enabledTabs.indexOf(currentIndex);
      
      if (currentIndexInEnabled < enabledTabs.length - 1) {
        const nextIndex = enabledTabs[currentIndexInEnabled + 1];
        this.focusTab(nextIndex);
      } else if (enabledTabs.length > 0) {
        // Wrap to first enabled tab
        const firstIndex = enabledTabs[0];
        this.focusTab(firstIndex);
      }
    } catch (error) {
      this.handleError(error as Error, 'navigateToNextTab');
    }
  }

  /**
   * Navigate to first enabled tab
   */
  private navigateToFirstTab(): void {
    try {
      const enabledTabs = this.getEnabledTabIndices();
      if (enabledTabs.length > 0) {
        this.focusTab(enabledTabs[0]);
      }
    } catch (error) {
      this.handleError(error as Error, 'navigateToFirstTab');
    }
  }

  /**
   * Navigate to last enabled tab
   */
  private navigateToLastTab(): void {
    try {
      const enabledTabs = this.getEnabledTabIndices();
      if (enabledTabs.length > 0) {
        this.focusTab(enabledTabs[enabledTabs.length - 1]);
      }
    } catch (error) {
      this.handleError(error as Error, 'navigateToLastTab');
    }
  }

  /**
   * Focus specific tab element
   */
  private focusTab(tabIndex: number): void {
    try {
      const tabElement = this.getTabElement(tabIndex) as HTMLElement;
      if (tabElement) {
        tabElement.focus();
      }
    } catch (error) {
      this.handleError(error as Error, 'focusTab');
    }
  }

  /**
   * Get indices of enabled tabs
   */
  private getEnabledTabIndices(): number[] {
    return this.host.tabs
      .map((tab, index) => ({ tab, index }))
      .filter(({ tab }) => !tab.disabled)
      .map(({ index }) => index);
  }
}