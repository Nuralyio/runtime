/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { TabsHost, BaseTabsController } from './base.controller.js';
import { ReactiveControllerHost } from 'lit';
import { TabEditable, TabItem, TabEvent, TabAddEventDetail, TabRemoveEventDetail, TabEditEventDetail } from '../tabs.types.js';

/**
 * Editable controller interface for tabs components
 */
export interface EditableController {
  handleAddTab(): void;
  handleRemoveTab(tabIndex: number): void;
  handleEditTab(tabIndex: number, newLabel: string): void;
  canAddTab(): boolean;
  canDeleteTab(tab?: TabItem): boolean;
  canEditTabTitle(tab?: TabItem): boolean;
}

/**
 * Enhanced tabs host interface for editable functionality
 */
export interface TabsEditableHost extends TabsHost {
  editable?: TabEditable;
  dispatchEventWithMetadata(eventName: string, detail: any): void;
}

/**
 * Editable controller manages editable functionality for tabs components
 * Handles add, delete, and edit operations for tabs
 */
export class TabsEditableController extends BaseTabsController implements EditableController {
  protected override _host: TabsEditableHost & ReactiveControllerHost;

  constructor(host: TabsEditableHost & ReactiveControllerHost) {
    super(host);
    this._host = host;
  }

  override get host(): TabsEditableHost & ReactiveControllerHost {
    return this._host;
  }

  /**
   * Handle adding a new tab
   */
  handleAddTab(): void {
    try {
      if (!this.canAddTab()) {
        console.warn('[TabsEditableController] Cannot add tab - permission denied');
        return;
      }

      // Dispatch add tab event
      this.host.dispatchEventWithMetadata(TabEvent.TabAdd, {} as TabAddEventDetail);

      // Dispatch editable action event
      this.dispatchEvent(
        new CustomEvent('tabs-add-tab', {
          detail: {
            timestamp: Date.now(),
            totalTabs: this.host.tabs.length
          },
          bubbles: true,
          composed: true,
        })
      );
    } catch (error) {
      this.handleError(error as Error, 'handleAddTab');
    }
  }

  /**
   * Handle removing a tab
   * @param tabIndex - Index of tab to remove
   */
  handleRemoveTab(tabIndex: number): void {
    try {
      if (!this.isValidTabIndex(tabIndex)) {
        console.warn(`[TabsEditableController] Invalid tab index: ${tabIndex}`);
        return;
      }

      const tab = this.host.tabs[tabIndex];
      
      if (!this.canDeleteTab(tab)) {
        console.warn('[TabsEditableController] Cannot delete tab - permission denied');
        return;
      }

      // Dispatch remove tab event
      this.host.dispatchEventWithMetadata(TabEvent.TabRemove, {
        index: tabIndex,
        tab
      } as TabRemoveEventDetail);

      // Dispatch editable action event
      this.dispatchEvent(
        new CustomEvent('tabs-remove-tab', {
          detail: {
            tabIndex,
            tab,
            timestamp: Date.now(),
            remainingTabs: this.host.tabs.length - 1
          },
          bubbles: true,
          composed: true,
        })
      );
    } catch (error) {
      this.handleError(error as Error, 'handleRemoveTab');
    }
  }

  /**
   * Handle editing a tab title
   * @param tabIndex - Index of tab to edit
   * @param newLabel - New label for the tab
   */
  handleEditTab(tabIndex: number, newLabel: string): void {
    try {
      if (!this.isValidTabIndex(tabIndex)) {
        console.warn(`[TabsEditableController] Invalid tab index: ${tabIndex}`);
        return;
      }

      const tab = this.host.tabs[tabIndex];
      const oldLabel = tab.label;
      
      if (!this.canEditTabTitle(tab)) {
        console.warn('[TabsEditableController] Cannot edit tab title - permission denied');
        return;
      }

      if (newLabel.trim() === oldLabel.trim()) {
        return; // No change
      }

      // Validate new label
      if (!this.isValidTabLabel(newLabel)) {
        console.warn('[TabsEditableController] Invalid tab label provided');
        return;
      }

      // Dispatch edit tab event
      this.host.dispatchEventWithMetadata(TabEvent.TabEdit, {
        index: tabIndex,
        tab: { ...tab, label: newLabel.trim() },
        oldLabel,
        newLabel: newLabel.trim()
      } as TabEditEventDetail);

      // Dispatch editable action event
      this.dispatchEvent(
        new CustomEvent('tabs-edit-tab', {
          detail: {
            tabIndex,
            tab,
            oldLabel,
            newLabel: newLabel.trim(),
            timestamp: Date.now()
          },
          bubbles: true,
          composed: true,
        })
      );
    } catch (error) {
      this.handleError(error as Error, 'handleEditTab');
    }
  }

  /**
   * Check if user can add tabs
   */
  canAddTab(): boolean {
    return this.host.editable?.canAddTab ?? false;
  }

  /**
   * Check if user can delete a specific tab
   * @param tab - Tab to check (optional, falls back to global setting)
   */
  canDeleteTab(tab?: TabItem): boolean {
    if (tab) {
      return tab.closable ?? tab.editable?.canDeleteTab ?? this.host.editable?.canDeleteTab ?? false;
    }
    return this.host.editable?.canDeleteTab ?? false;
  }

  /**
   * Check if user can edit tab titles for a specific tab
   * @param tab - Tab to check (optional, falls back to global setting)
   */
  canEditTabTitle(tab?: TabItem): boolean {
    if (tab) {
      return tab.editable?.canEditTabTitle ?? this.host.editable?.canEditTabTitle ?? false;
    }
    return this.host.editable?.canEditTabTitle ?? false;
  }

  /**
   * Check if tab can be moved (for drag and drop)
   */
  canMoveTab(): boolean {
    return this.host.editable?.canMove ?? false;
  }

  /**
   * Get editable state for a specific tab
   * @param tab - Tab to check
   */
  getTabEditableState(tab: TabItem): {
    canDelete: boolean;
    canEdit: boolean;
    canMove: boolean;
  } {
    return {
      canDelete: this.canDeleteTab(tab),
      canEdit: this.canEditTabTitle(tab),
      canMove: this.canMoveTab()
    };
  }

  /**
   * Validate if a tab label is valid
   * @param label - Label to validate
   */
  private isValidTabLabel(label: string): boolean {
    return (
      typeof label === 'string' &&
      label.trim().length > 0 &&
      label.trim().length <= 100 // Reasonable max length
    );
  }

  /**
   * Get the contenteditable attribute value for tab text
   * @param tab - Tab to check
   */
  getContentEditableAttribute(tab: TabItem): string | undefined {
    return this.canEditTabTitle(tab) ? 'true' : undefined;
  }

  /**
   * Handle blur event for editable tab titles
   * @param event - Blur event
   * @param tabIndex - Index of the tab
   */
  handleTabTitleBlur(event: Event, tabIndex: number): void {
    try {
      const target = event.target as HTMLElement;
      const newLabel = target.textContent?.trim() || '';
      
      if (newLabel) {
        this.handleEditTab(tabIndex, newLabel);
      } else {
        // Reset to original label if empty
        const tab = this.host.tabs[tabIndex];
        target.textContent = tab.label;
      }
    } catch (error) {
      this.handleError(error as Error, 'handleTabTitleBlur');
    }
  }

  /**
   * Handle keydown events for editable tab titles
   * @param event - Keyboard event
   * @param tabIndex - Index of the tab
   */
  handleTabTitleKeyDown(event: KeyboardEvent, tabIndex: number): void {
    try {
      if (event.key === 'Enter') {
        event.preventDefault();
        const target = event.target as HTMLElement;
        target.blur(); // This will trigger the blur handler
      } else if (event.key === 'Escape') {
        event.preventDefault();
        // Reset to original label
        const tab = this.host.tabs[tabIndex];
        const target = event.target as HTMLElement;
        target.textContent = tab.label;
        target.blur();
      }
    } catch (error) {
      this.handleError(error as Error, 'handleTabTitleKeyDown');
    }
  }
}