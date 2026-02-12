/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { TabsHost, BaseTabsController } from './base.controller.js';
import { ReactiveControllerHost } from 'lit';
import { TabItem, TabEvent, TabClickEventDetail } from '../tabs.types.js';

/**
 * Event controller interface for tabs components
 */
export interface EventController {
  handleTabClick(tabIndex: number, event: MouseEvent): void;
  handleTabFocus(tabIndex: number, event: FocusEvent): void;
  handleTabBlur(tabIndex: number, event: FocusEvent): void;
  dispatchTabEvent(eventName: string, detail: any): void;
}

/**
 * Enhanced tabs host interface for event functionality
 */
export interface TabsEventHost extends TabsHost {
  dispatchEventWithMetadata(eventName: string, detail: any): void;
  setActiveTab(index: number, event?: Event): void;
}

/**
 * Event controller manages event handling and dispatching for tabs components
 * Handles click, focus, blur, and custom event dispatching
 */
export class TabsEventController extends BaseTabsController implements EventController {
  protected override _host: TabsEventHost & ReactiveControllerHost;

  constructor(host: TabsEventHost & ReactiveControllerHost) {
    super(host);
    this._host = host;
  }

  override get host(): TabsEventHost & ReactiveControllerHost {
    return this._host;
  }

  /**
   * Handle tab click events
   * @param tabIndex - Index of clicked tab
   * @param event - Click event
   */
  handleTabClick(tabIndex: number, event: MouseEvent): void {
    try {
      if (!this.isValidTabIndex(tabIndex)) {
        console.warn(`[TabsEventController] Invalid tab index: ${tabIndex}`);
        return;
      }

      const tab = this.host.tabs[tabIndex];
      
      // Check if tab is disabled
      if (tab.disabled) {
        event.preventDefault();
        return;
      }

      // Prevent default if needed
      event.preventDefault();

      // Set active tab
      this.host.setActiveTab(tabIndex, event);

      // Dispatch click event
      this.host.dispatchEventWithMetadata(TabEvent.TabClick, {
        index: tabIndex,
        tab,
        originalEvent: event
      } as TabClickEventDetail);

      // Dispatch generic tab interaction event
      this.dispatchTabEvent('tabs-interaction', {
        type: 'click',
        tabIndex,
        tab,
        timestamp: Date.now(),
        modifierKeys: {
          ctrl: event.ctrlKey,
          shift: event.shiftKey,
          alt: event.altKey,
          meta: event.metaKey
        }
      });

    } catch (error) {
      this.handleError(error as Error, 'handleTabClick');
    }
  }

  /**
   * Handle tab focus events
   * @param tabIndex - Index of focused tab
   * @param event - Focus event
   */
  handleTabFocus(tabIndex: number, event: FocusEvent): void {
    try {
      if (!this.isValidTabIndex(tabIndex)) {
        return;
      }

      const tab = this.host.tabs[tabIndex];

      // Dispatch focus event
      this.dispatchTabEvent('tabs-focus', {
        tabIndex,
        tab,
        timestamp: Date.now(),
        originalEvent: event
      });

    } catch (error) {
      this.handleError(error as Error, 'handleTabFocus');
    }
  }

  /**
   * Handle tab blur events
   * @param tabIndex - Index of blurred tab
   * @param event - Blur event
   */
  handleTabBlur(tabIndex: number, event: FocusEvent): void {
    try {
      if (!this.isValidTabIndex(tabIndex)) {
        return;
      }

      const tab = this.host.tabs[tabIndex];

      // Dispatch blur event
      this.dispatchTabEvent('tabs-blur', {
        tabIndex,
        tab,
        timestamp: Date.now(),
        originalEvent: event
      });

    } catch (error) {
      this.handleError(error as Error, 'handleTabBlur');
    }
  }

  /**
   * Dispatch custom tab events
   * @param eventName - Name of the event
   * @param detail - Event detail data
   */
  dispatchTabEvent(eventName: string, detail: any): void {
    try {
      this.dispatchEvent(
        new CustomEvent(eventName, {
          detail,
          bubbles: true,
          composed: true,
        })
      );
    } catch (error) {
      this.handleError(error as Error, 'dispatchTabEvent');
    }
  }

  /**
   * Handle tab change events (when active tab changes)
   * @param newTabIndex - New active tab index
   * @param previousTabIndex - Previous active tab index
   * @param event - Original event that triggered the change
   */
  handleTabChange(newTabIndex: number, previousTabIndex: number, event?: Event): void {
    try {
      if (!this.isValidTabIndex(newTabIndex)) {
        console.warn(`[TabsEventController] Invalid new tab index: ${newTabIndex}`);
        return;
      }

      const newTab = this.host.tabs[newTabIndex];
      const previousTab = this.isValidTabIndex(previousTabIndex) ? this.host.tabs[previousTabIndex] : null;

      // Dispatch tab change event
      this.dispatchTabEvent('tabs-change', {
        newTabIndex,
        previousTabIndex,
        newTab,
        previousTab,
        timestamp: Date.now(),
        originalEvent: event
      });

    } catch (error) {
      this.handleError(error as Error, 'handleTabChange');
    }
  }

  /**
   * Handle tab activation events (for keyboard and programmatic activation)
   * @param tabIndex - Index of activated tab
   * @param activationType - Type of activation (click, keyboard, programmatic)
   * @param event - Original event
   */
  handleTabActivation(tabIndex: number, activationType: 'click' | 'keyboard' | 'programmatic', event?: Event): void {
    try {
      if (!this.isValidTabIndex(tabIndex)) {
        return;
      }

      const tab = this.host.tabs[tabIndex];

      // Dispatch activation event
      this.dispatchTabEvent('tabs-activation', {
        tabIndex,
        tab,
        activationType,
        timestamp: Date.now(),
        originalEvent: event
      });

    } catch (error) {
      this.handleError(error as Error, 'handleTabActivation');
    }
  }

  /**
   * Handle tab hover events
   * @param tabIndex - Index of hovered tab
   * @param event - Mouse event
   * @param isEnter - Whether mouse is entering (true) or leaving (false)
   */
  handleTabHover(tabIndex: number, event: MouseEvent, isEnter: boolean): void {
    try {
      if (!this.isValidTabIndex(tabIndex)) {
        return;
      }

      const tab = this.host.tabs[tabIndex];

      // Dispatch hover event
      this.dispatchTabEvent(isEnter ? 'tabs-hover-enter' : 'tabs-hover-leave', {
        tabIndex,
        tab,
        timestamp: Date.now(),
        originalEvent: event
      });

    } catch (error) {
      this.handleError(error as Error, 'handleTabHover');
    }
  }

  /**
   * Get event listeners for a tab element
   * @param tabIndex - Index of the tab
   */
  getTabEventListeners(tabIndex: number) {
    return {
      click: (event: MouseEvent) => this.handleTabClick(tabIndex, event),
      focus: (event: FocusEvent) => this.handleTabFocus(tabIndex, event),
      blur: (event: FocusEvent) => this.handleTabBlur(tabIndex, event),
      mouseenter: (event: MouseEvent) => this.handleTabHover(tabIndex, event, true),
      mouseleave: (event: MouseEvent) => this.handleTabHover(tabIndex, event, false)
    };
  }

  /**
   * Validate if tab can be activated
   * @param tab - Tab to validate
   */
  canActivateTab(tab: TabItem): boolean {
    return !tab.disabled;
  }

  /**
   * Get tab interaction state
   * @param tabIndex - Index of tab
   */
  getTabInteractionState(tabIndex: number): {
    isActive: boolean;
    isDisabled: boolean;
    canActivate: boolean;
  } {
    const tab = this.host.tabs[tabIndex];
    const isActive = tabIndex === this.host.activeTab;
    
    return {
      isActive,
      isDisabled: tab.disabled ?? false,
      canActivate: this.canActivateTab(tab)
    };
  }
}